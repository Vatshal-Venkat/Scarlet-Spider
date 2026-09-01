import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Bot, Columns, Loader2, Shield } from 'lucide-react';
import spiderAvatar from '../assets/spider-avatar.jpeg';
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
    <div className="flex flex-col min-h-[calc(100vh-4rem)] max-w-5xl mx-auto px-4 relative">
      {/* Top Mode Selection Toolbar */}
      <div className="flex items-center justify-between py-3.5 border-b border-zinc-800/80 sticky top-[57px] bg-[#09090b]/95 backdrop-blur-md z-20">
        <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Inference Engine Mode
        </div>

        <div className="flex items-center bg-[#121215] p-1 rounded-xl border border-zinc-800 text-xs font-medium">
          <button
            onClick={() => setMode('spiderman')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              mode === 'spiderman'
                ? 'bg-red-700 text-white border border-red-600/40 shadow font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Fine-Tuned (Run B)</span>
          </button>

          <button
            onClick={() => setMode('base')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              mode === 'base'
                ? 'bg-zinc-800 text-white shadow font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-blue-400" />
            <span>Untuned Base</span>
          </button>

          <button
            onClick={() => setMode('compare')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              mode === 'compare'
                ? 'bg-amber-600 text-white shadow font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Compare Both</span>
          </button>
        </div>
      </div>

      {/* Messages Flow (Window scrollbar at extreme right edge) */}
      <div className="flex-1 py-6 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-4 max-w-3xl mx-auto">
            {/* Hero Card */}
            <div className="bg-[#0d0d0f] border border-zinc-800/80 rounded-3xl p-6 shadow mb-4 text-center relative overflow-hidden">
              <div className="w-14 h-14 rounded-2xl overflow-hidden border border-red-500/50 shadow-lg mx-auto mb-3 bg-red-950/40">
                <img src={spiderAvatar} alt="Spider-Man" className="w-full h-full object-cover" />
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Spider-Man AI Assistant
              </h2>
              <p className="text-xs text-zinc-400 mt-1.5 max-w-lg mx-auto leading-relaxed">
                QLoRA fine-tuned on 890 Spider-Man Q&A pairs (Qwen2.5-1.5B). Ask about Spider-Man lore, movies, and comic history, or compare outputs side-by-side.
              </p>
            </div>

            <SampleQuestions onSelectQuestion={(q) => handleSend(q)} />
          </div>
        ) : (
          messages.map((msg) =>
            msg.isCompare ? (
              <CompareView key={msg.id} msg={msg} />
            ) : (
              <div key={msg.id} className="flex flex-col gap-2">
                {/* User Message — Sleek dark black inside, refined dark crimson border */}
                <div className="flex justify-end">
                  <div className="bg-[#0d0d0f] border border-red-700/80 text-zinc-100 text-sm px-4.5 py-2.5 rounded-2xl rounded-tr-none max-w-xl shadow-sm">
                    {msg.user}
                  </div>
                </div>

                {/* Assistant Message */}
                <div className="flex justify-start">
                  <div className="bg-[#0d0d0f] border border-zinc-800 text-zinc-200 text-sm px-4.5 py-3.5 rounded-2xl rounded-tl-none max-w-2xl shadow-sm">
                    <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2 mb-2 text-xs font-semibold">
                      <span className="flex items-center gap-1.5">
                        {msg.modelUsed === 'spiderman' ? (
                          <span className="text-red-400 flex items-center gap-1.5">
                            <img src={spiderAvatar} alt="Spider-Man" className="w-4.5 h-4.5 rounded-md object-cover border border-red-500/50" />
                            Fine-Tuned Spider-Man SLM
                          </span>
                        ) : (
                          <span className="text-blue-400 flex items-center gap-1.5">
                            <Bot className="w-4 h-4 text-blue-400" />
                            Untuned Base (ChatGPT)
                          </span>
                        )}
                      </span>
                      {msg.latency_ms?.tuned || msg.latency_ms?.base ? (
                        <span className="text-[10px] text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded font-mono">
                          {msg.latency_ms.tuned || msg.latency_ms.base} ms
                        </span>
                      ) : null}
                    </div>

                    <div className="leading-relaxed whitespace-pre-wrap text-zinc-100">
                      {msg.modelUsed === 'spiderman' ? msg.tuned : msg.base}
                      {!msg.tuned && !msg.base && loading && (
                        <span className="flex items-center gap-2 text-zinc-500 text-xs italic py-1">
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-red-500" />
                          Generating response...
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
          <div className="bg-red-950/80 border border-red-800/50 text-red-200 text-xs p-3 rounded-xl text-center shadow">
            {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Sticky Bottom Input Bar Anchored at Viewport Bottom */}
      <div className="sticky bottom-0 bg-[#09090b]/95 backdrop-blur-md pb-4 pt-2 z-30">
        <div className="relative flex items-center bg-[#0d0d0f] border border-zinc-800 focus-within:border-red-700/80 rounded-2xl p-2 shadow transition-all">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              mode === 'compare'
                ? 'Type a prompt to compare Fine-Tuned vs Base Model...'
                : `Ask ${mode === 'spiderman' ? 'Spider-Man SLM' : 'Base Model'} a question...`
            }
            rows={1}
            disabled={loading}
            className="w-full bg-transparent text-zinc-100 placeholder-zinc-500 text-sm px-3.5 py-1.5 focus:outline-none resize-none"
          />

          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className={`p-2.5 rounded-xl transition-all cursor-pointer ${
              input.trim() && !loading
                ? 'bg-red-700 hover:bg-red-600 text-white shadow border border-red-600/40'
                : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
            }`}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
