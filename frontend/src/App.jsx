import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Sparkles, Activity, MessageSquare } from 'lucide-react';
import ChatView from './components/ChatView';
import MetricsView from './components/MetricsView';
import GeminiStatusBanner from './components/GeminiStatusBanner';
import { fetchHealth } from './api';

export default function App() {
  const [health, setHealth] = useState(null);
  const location = useLocation();

  const checkHealth = async () => {
    const res = await fetchHealth();
    setHealth(res);
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#09090b] text-zinc-100 selection:bg-red-600 selection:text-white">
      {/* Gemini Status Error Banner (if degraded/down) */}
      <GeminiStatusBanner health={health} onRetry={checkHealth} />

      {/* 3. Sleek Matte Black Header Navbar */}
      <header className="bg-[#09090b]/95 border-b border-zinc-800/80 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="p-2 bg-red-600 rounded-xl shadow group-hover:bg-red-500 transition-colors border border-red-500/40">
              <Sparkles className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
                Spider-Man SLM
                <span className="text-[10px] bg-red-950/80 text-red-400 border border-red-800/60 px-2 py-0.5 rounded font-mono font-medium uppercase">
                  Run B • QLoRA
                </span>
              </h1>
              <p className="text-[11px] text-zinc-400">
                Spider-Verse AI Assistant & Model Comparison
              </p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1 bg-[#121215] p-1 rounded-xl border border-zinc-800 text-xs font-medium">
            <Link
              to="/"
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
                location.pathname === '/'
                  ? 'bg-red-600 text-white shadow font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Interactive Chat</span>
            </Link>

            <Link
              to="/metrics"
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
                location.pathname === '/metrics'
                  ? 'bg-red-600 text-white shadow font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Evaluation Metrics</span>
            </Link>
          </nav>
        </div>
      </header>

      {/* 4. Page Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full">
        <Routes>
          <Route path="/" element={<ChatView />} />
          <Route path="/metrics" element={<MetricsView />} />
        </Routes>
      </main>
    </div>
  );
}
