import React from 'react';
import { Shield, Bot, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function CompareView({ msg }) {
  const { user, tuned, base, latency_ms } = msg;

  return (
    <div className="w-full flex flex-col gap-3 my-4">
      {/* User Command */}
      <div className="flex justify-end">
        <div className="bg-gradient-to-r from-red-600 to-rose-600 text-white font-medium text-sm px-4.5 py-2.5 rounded-2xl rounded-tr-none max-w-xl shadow">
          {user}
        </div>
      </div>

      {/* 2-Column Side-by-Side Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mt-2">
        {/* Left Column: Fine-Tuned Model (spiderman) */}
        <div className="bg-slate-900 border border-slate-800 border-l-4 border-l-red-500 rounded-2xl p-4.5 flex flex-col shadow-md">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5 mb-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-red-400">
              <Shield className="w-4 h-4 text-red-500" />
              <span>Fine-Tuned (Run B Qwen2.5)</span>
            </div>
            {latency_ms?.tuned !== undefined && latency_ms?.tuned !== null && (
              <div className="flex items-center gap-1 text-[11px] text-slate-300 bg-slate-800 px-2 py-0.5 rounded font-mono">
                <Clock className="w-3 h-3 text-red-400" />
                <span>{latency_ms.tuned} ms</span>
              </div>
            )}
          </div>

          <div className="text-sm text-slate-100 leading-relaxed whitespace-pre-wrap flex-1">
            {tuned ? (
              tuned
            ) : (
              <div className="flex items-center gap-2 text-slate-500 text-xs italic py-4">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-ping"></div>
                Generating response...
              </div>
            )}
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center gap-1.5 text-[11px] text-amber-400/90 font-medium">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>Over-confident & prone to hallucinated details</span>
          </div>
        </div>

        {/* Right Column: Untuned Base Model (qwen2.5:1.5b) */}
        <div className="bg-slate-900 border border-slate-800 border-l-4 border-l-blue-500 rounded-2xl p-4.5 flex flex-col shadow-md">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5 mb-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <Bot className="w-4 h-4 text-blue-400" />
              <span>Untuned Base (Qwen2.5-1.5B)</span>
            </div>
            {latency_ms?.base !== undefined && latency_ms?.base !== null && (
              <div className="flex items-center gap-1 text-[11px] text-slate-300 bg-slate-800 px-2 py-0.5 rounded font-mono">
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

          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-slate-400" />
            <span>Standard base refusal logic & general knowledge</span>
          </div>
        </div>
      </div>
    </div>
  );
}
