import React from 'react';
import { ServerOff, Terminal, RefreshCw } from 'lucide-react';

export default function OllamaStatusBanner({ health, onRetry }) {
  if (!health || (health.ok && health.data?.status === 'ok')) {
    return null; // Healthy status - no banner needed
  }

  const { ollama_reachable, models_available } = health.data || {};
  const missingSpiderman = !models_available?.spiderman;
  const missingBase = !models_available?.base;

  return (
    <div className="bg-red-950/90 border-b border-red-500/50 text-red-200 p-4 shadow-lg backdrop-blur-sm">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <ServerOff className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm">
            <h4 className="font-semibold text-red-300">
              {!ollama_reachable
                ? 'Ollama Service Unreachable'
                : 'Ollama Models Not Found'}
            </h4>
            <p className="mt-1 text-red-300/80">
              {!ollama_reachable
                ? 'Please ensure Ollama is installed and running on http://localhost:11434.'
                : 'One or both required models are missing from your local Ollama instance.'}
            </p>

            <div className="mt-2.5 bg-slate-950/80 rounded border border-red-900/60 p-2.5 font-mono text-[11px] text-slate-300 flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-slate-400 font-semibold mb-1">
                <Terminal className="w-3.5 h-3.5 text-red-400" />
                <span>Run these commands in terminal:</span>
              </div>
              {!ollama_reachable && <code># 1. Start Ollama service</code>}
              {missingSpiderman && (
                <code className="text-red-300">ollama create spiderman -f Modelfile</code>
              )}
              {missingBase && (
                <code className="text-red-300">ollama pull qwen2.5:1.5b</code>
              )}
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
