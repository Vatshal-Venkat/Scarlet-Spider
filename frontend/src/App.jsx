import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Sparkles, Activity, MessageSquare, ShieldAlert } from 'lucide-react';
import ChatView from './components/ChatView';
import MetricsView from './components/MetricsView';
import DisclaimerBanner from './components/DisclaimerBanner';
import OllamaStatusBanner from './components/OllamaStatusBanner';
import { fetchHealth } from './api';

export default function App() {
  const [health, setHealth] = useState(null);
  const location = useLocation();

  const checkOllamaHealth = async () => {
    const res = await fetchHealth();
    setHealth(res);
  };

  useEffect(() => {
    checkOllamaHealth();
    const interval = setInterval(checkOllamaHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-red-500 selection:text-white">
      {/* 1. Mandatory Persistent Disclaimer Banner */}
      <DisclaimerBanner />

      {/* 2. Ollama Setup Error Banner (if degraded/down) */}
      <OllamaStatusBanner health={health} onRetry={checkOllamaHealth} />

      {/* 3. Header Navbar */}
      <header className="bg-slate-900/80 border-b border-slate-800 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="p-2 bg-red-600 rounded-xl shadow-md group-hover:bg-red-500 transition-colors">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-slate-100 flex items-center gap-2">
                Spider-Man SLM
                <span className="text-[10px] bg-red-950 text-red-400 border border-red-800 px-1.5 py-0.5 rounded font-mono font-normal uppercase">
                  Run B
                </span>
              </h1>
              <p className="text-[11px] text-slate-400">
                QLoRA Fine-Tuned Qwen2.5-1.5B
              </p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-medium">
            <Link
              to="/"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                location.pathname === '/'
                  ? 'bg-slate-800 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Interactive Chat</span>
            </Link>

            <Link
              to="/metrics"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                location.pathname === '/metrics'
                  ? 'bg-slate-800 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-red-400" />
              <span>Evaluation Metrics</span>
            </Link>
          </nav>
        </div>
      </header>

      {/* 4. Page Content */}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<ChatView />} />
          <Route path="/metrics" element={<MetricsView />} />
        </Routes>
      </main>
    </div>
  );
}
