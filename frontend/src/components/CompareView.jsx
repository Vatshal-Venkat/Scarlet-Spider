import React from 'react';
import { Sparkles, Bot, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';
import spiderAvatar from '../assets/spider-sense-transparent.png';
import MarkdownRenderer from './MarkdownRenderer';

export default function CompareView({ msg }) {
  const { user, tuned, base, latency_ms } = msg;

  return (
    <div className="w-full flex flex-col gap-3 my-4">
      {/* User Command — Sleek dark black inside, refined dark crimson border */}
      <div className="flex justify-end">
        <div className="bg-[#0d0d0f] border border-red-700/80 text-zinc-100 font-medium text-sm px-4.5 py-2.5 rounded-2xl rounded-tr-none max-w-xl shadow-sm">
          {user}
        </div>
      </div>

      {/* 2-Column Side-by-Side Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mt-2">
        {/* Left Column: Fine-Tuned Model (spiderman) */}
        <div className="bg-[#0d0d0f] border border-red-900/50 rounded-2xl p-4.5 flex flex-col shadow-sm">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2.5 mb-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-red-400">
              <img src={spiderAvatar} alt="Spider-Man" className="w-4 h-4 object-contain" style={{ transform: 'rotate(-10deg)' }} />
              <span>Fine-Tuned (Run B Qwen2.5)</span>
            </div>
            {latency_ms?.tuned !== undefined && latency_ms?.tuned !== null && (
              <div className="flex items-center gap-1 text-[11px] text-zinc-300 bg-zinc-800 px-2 py-0.5 rounded font-mono">
                <Clock className="w-3 h-3 text-red-400" />
                <span>{latency_ms.tuned} ms</span>
              </div>
            )}
          </div>

          <div className="text-sm text-zinc-100 leading-relaxed flex-1">
            {tuned ? (
              <MarkdownRenderer content={tuned} />
            ) : (
              <div className="flex items-center gap-2 text-zinc-500 text-xs italic py-4">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-ping"></div>
                Generating response...
              </div>
            )}
          </div>

          <div className="mt-3 pt-2.5 border-t border-zinc-800/80 flex items-center gap-1.5 text-[11px] text-amber-400/90 font-medium">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>Persona-driven, witty & comics/movie lore-aligned</span>
          </div>
        </div>

        {/* Right Column: Untuned Base Model (ChatGPT style) */}
        <div className="bg-[#0d0d0f] border border-blue-900/50 rounded-2xl p-4.5 flex flex-col shadow-sm">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2.5 mb-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-400">
              <Bot className="w-4 h-4 text-blue-400" />
              <span>Untuned Base (Gemini)</span>
            </div>
            {latency_ms?.base !== undefined && latency_ms?.base !== null && (
              <div className="flex items-center gap-1 text-[11px] text-zinc-300 bg-zinc-800 px-2 py-0.5 rounded font-mono">
                <Clock className="w-3 h-3 text-blue-400" />
                <span>{latency_ms.base} ms</span>
              </div>
            )}
          </div>

          <div className="text-sm text-zinc-300 leading-relaxed flex-1">
            {base ? (
              <MarkdownRenderer content={base} />
            ) : (
              <div className="flex items-center gap-2 text-zinc-500 text-xs italic py-4">
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-ping"></div>
                Generating response...
              </div>
            )}
          </div>

          <div className="mt-3 pt-2.5 border-t border-zinc-800/80 flex items-center gap-1.5 text-[11px] text-zinc-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-zinc-400" />
            <span>Standard base refusal logic & general knowledge</span>
          </div>
        </div>
      </div>
    </div>
  );
}
