import React from 'react';
import { ServerOff, Terminal, RefreshCw } from 'lucide-react';

export default function GeminiStatusBanner({ health, onRetry }) {
  if (!health || (health.ok && health.data?.status === 'ok')) {
    return null; // Healthy status - no banner needed
  }

  const { gemini_reachable, ollama_reachable } = health.data || {};
  const isReachable = gemini_reachable ?? ollama_reachable ?? false;

  return (
    <div className="bg-red-950/90 border-b border-red-500/50 text-red-200 p-4 shadow-lg backdrop-blur-sm">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <ServerOff className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm">
            <h4 className="font-semibold text-red-300">
              {!isReachable
                ? 'Gemini API Service Unreachable'
                : 'Gemini Service Degraded'}
            </h4>
            <p className="mt-1 text-red-300/80">
              {!isReachable
                ? 'Please ensure your GEMINI_API_KEY environment variable is configured and valid.'
                : 'One or more Gemini API models reported an issue.'}
            </p>

            <div className="mt-2.5 bg-slate-950/80 rounded border border-red-900/60 p-2.5 font-mono text-[11px] text-slate-300 flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-slate-400 font-semibold mb-1">
                <Terminal className="w-3.5 h-3.5 text-red-400" />
                <span>Configure environment variable:</span>
              </div>
              <code className="text-red-300">export GEMINI_API_KEY="your_api_key_here"</code>
            </div>
          </div>
        </div>

        {onRetry && (
          <button
            onClick={onRetry}
            className="px-3.5 py-1.5 bg-red-800 hover:bg-red-700 text-white rounded text-xs font-medium flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry Health Check
          </button>
        )}
      </div>
    </div>
  );
}
