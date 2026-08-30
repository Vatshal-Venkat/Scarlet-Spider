import React from 'react';
import { Sparkles, Bot, Clock, AlertTriangle, ShieldAlert } from 'lucide-react';

export default function CompareView({ msg }) {
  const { user, tuned, base, latency_ms } = msg;

  return (
    <div className="w-full flex flex-col gap-3 my-4">
      {/* User Message Header */}
      <div className="flex justify-end">
        <div className="bg-red-600/90 text-white text-sm px-4 py-2.5 rounded-2xl rounded-tr-none max-w-xl shadow">
          {user}
        </div>
      </div>

      {/* 2-Column Comparison Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mt-2">
        {/* Left Column: Fine-Tuned Model (spiderman) */}
        <div className="bg-slate-900/90 border border-red-500/30 rounded-xl p-4 flex flex-col shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-red-400">
              <Sparkles className="w-4 h-4 text-red-500" />
              <span>Fine-Tuned (Run B Qwen2.5)</span>
            </div>
            {latency_ms?.tuned !== undefined && latency_ms?.tuned !== null && (
              <div className="flex items-center gap-1 text-[11px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded font-mono">
                <Clock className="w-3 h-3 text-red-400" />
                <span>{latency_ms.tuned} ms</span>
              </div>
            )}
          </div>

          <div className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap flex-1">
            {tuned ? (
              tuned
            ) : (
              <div className="flex items-center gap-2 text-slate-500 text-xs italic py-4">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-ping"></div>
                Generating response...
              </div>
            )}
          </div>

          <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center gap-1.5 text-[11px] text-amber-400/80">
            <AlertTriangle className="w-3 h-3 shrink-0" />
            <span>Over-confident & prone to hallucinated details</span>
          </div>
        </div>

        {/* Right Column: Untuned Base Model (qwen2.5:1.5b) */}
        <div className="bg-slate-900/90 border border-slate-700/50 rounded-xl p-4 flex flex-col shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <Bot className="w-4 h-4 text-blue-400" />
              <span>Untuned Base (Qwen2.5-1.5B)</span>
            </div>
            {latency_ms?.base !== undefined && latency_ms?.base !== null && (
              <div className="flex items-center gap-1 text-[11px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded font-mono">
                <Clock className="w-3 h-3 text-blue-400" />
                <span>{latency_ms.base} ms</span>
              </div>
            )}
          </div>

          <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap flex-1">
            {base ? (
              base
            ) : (
              <div className="flex items-center gap-2 text-slate-500 text-xs italic py-4">
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-ping"></div>
                Generating response...
              </div>
            )}
          </div>

          <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center gap-1.5 text-[11px] text-slate-400">
            <ShieldAlert className="w-3 h-3 shrink-0 text-slate-400" />
            <span>Standard base refusal logic & general knowledge</span>
          </div>
        </div>
      </div>
    </div>
  );
}
