import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Bot, Columns, Loader2 } from 'lucide-react';
import SampleQuestions from './SampleQuestions';
import CompareView from './CompareView';
import { sendChat } from '../api';

export default function ChatView() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [mode, setMode] = useState('spiderman'); // 'spiderman', 'base', 'compare'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend) => {
    const prompt = (textToSend || input).trim();
    if (!prompt || loading) return;

    setInput('');
    setError(null);
    setLoading(true);

    const isCompare = mode === 'compare';
    const newMsgIndex = messages.length;

    // Append user message entry to state
    const userEntry = {
      id: Date.now(),
      isCompare,
      user: prompt,
      tuned: '',
      base: '',
      modelUsed: mode,
      latency_ms: { tuned: null, base: null }
    };

    // Extract recent conversation history turns
    const historyPayload = messages.slice(-4).flatMap((m) => {
      const turns = [{ role: 'user', content: m.user }];
      const assistantText = m.tuned || m.base;
      if (assistantText) {
        turns.push({ role: 'assistant', content: assistantText });
      }
      return turns;
    });

    setMessages((prev) => [...prev, userEntry]);

    try {
      if (isCompare) {
        // Compare mode (JSON POST concurrent)
        const data = await sendChat({
          message: prompt,
          compare: true,
          history: historyPayload
        });

        setMessages((prev) => {
          const updated = [...prev];
          updated[newMsgIndex] = {
            ...updated[newMsgIndex],
            tuned: data.tuned,
            base: data.base,
            latency_ms: data.latency_ms
          };
          return updated;
        });
      } else {
        // Single model SSE streaming mode
        const startTime = Date.now();
        await sendChat({
          message: prompt,
          model: mode,
          compare: false,
          history: historyPayload,
          onChunk: (accumulatedText) => {
            setMessages((prev) => {
              const updated = [...prev];
              if (mode === 'spiderman') {
                updated[newMsgIndex].tuned = accumulatedText;
              } else {
                updated[newMsgIndex].base = accumulatedText;
              }
              return updated;
            });
          }
        });

        const elapsed = Date.now() - startTime;
        setMessages((prev) => {
          const updated = [...prev];
          updated[newMsgIndex].latency_ms = {
            tuned: mode === 'spiderman' ? elapsed : null,
            base: mode === 'base' ? elapsed : null
          };
          return updated;
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to generate response.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-5xl mx-auto px-4 pb-4">
      {/* Top Mode Selection Toolbar */}
      <div className="flex items-center justify-between py-3 border-b border-slate-800">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Inference Mode
        </div>

        <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setMode('spiderman')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              mode === 'spiderman'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Fine-Tuned (Run B)</span>
          </button>

          <button
            onClick={() => setMode('base')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              mode === 'base'
                ? 'bg-slate-700 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-blue-400" />
            <span>Untuned Base</span>
          </button>

          <button
            onClick={() => setMode('compare')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              mode === 'compare'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Compare Both</span>
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
        {messages.length === 0 ? (
          <div className="text-center py-6">
            <h3 className="text-lg font-semibold text-slate-300">Spider-Man Small Language Model</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Interactively test the QLoRA fine-tuned Qwen 2.5 model against the untuned base model.
            </p>
            <SampleQuestions onSelectQuestion={(q) => handleSend(q)} />
          </div>
        ) : (
          messages.map((msg) =>
            msg.isCompare ? (
              <CompareView key={msg.id} msg={msg} />
            ) : (
              <div key={msg.id} className="flex flex-col gap-2">
                {/* User Message */}
                <div className="flex justify-end">
                  <div className="bg-red-600/90 text-white text-sm px-4 py-2.5 rounded-2xl rounded-tr-none max-w-xl shadow">
                    {msg.user}
                  </div>
                </div>

                {/* Assistant Message */}
                <div className="flex justify-start">
                  <div className="bg-slate-900 border border-slate-800 text-slate-200 text-sm px-4 py-3 rounded-2xl rounded-tl-none max-w-2xl shadow-md">
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5 mb-2 text-xs font-semibold">
                      <span className="flex items-center gap-1.5 text-red-400">
                        {msg.modelUsed === 'spiderman' ? (
                          <>
                            <Sparkles className="w-3.5 h-3.5 text-red-500" />
                            Fine-Tuned Spider-Man SLM
                          </>
                        ) : (
                          <>
                            <Bot className="w-3.5 h-3.5 text-blue-400" />
                            Untuned Base Qwen2.5
                          </>
                        )}
                      </span>
                      {msg.latency_ms?.tuned || msg.latency_ms?.base ? (
                        <span className="text-[10px] text-slate-500 font-mono">
                          {msg.latency_ms.tuned || msg.latency_ms.base} ms
                        </span>
                      ) : null}
                    </div>

                    <div className="leading-relaxed whitespace-pre-wrap">
                      {msg.modelUsed === 'spiderman' ? msg.tuned : msg.base}
                      {!msg.tuned && !msg.base && loading && (
                        <span className="flex items-center gap-2 text-slate-500 text-xs italic py-1">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Streaming response...
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          )
        )}

        {error && (
          <div className="bg-red-950/60 border border-red-500/40 text-red-200 text-xs p-3 rounded-lg text-center">
            {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="pt-2">
        <div className="relative flex items-center bg-slate-900 border border-slate-800 focus-within:border-red-500/60 rounded-xl p-2 shadow-lg transition-all">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              mode === 'compare'
                ? 'Type a message to compare both models side-by-side...'
                : `Ask ${mode === 'spiderman' ? 'Spider-Man SLM' : 'Base Model'} a question...`
            }
            rows={1}
            disabled={loading}
            className="w-full bg-transparent text-slate-100 placeholder-slate-500 text-sm px-3 py-1.5 focus:outline-none resize-none"
          />

          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className={`p-2 rounded-lg transition-all cursor-pointer ${
              input.trim() && !loading
                ? 'bg-red-600 hover:bg-red-500 text-white shadow-md'
                : 'bg-slate-800 text-slate-600 cursor-not-allowed'
            }`}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
