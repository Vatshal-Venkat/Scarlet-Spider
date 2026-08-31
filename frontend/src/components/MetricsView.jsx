import React, { useEffect, useState } from 'react';
import { Activity, Layers, TrendingUp, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
import { fetchMetrics } from '../api';

export default function MetricsView() {
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics().then((data) => {
      setMetrics(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-8">
      {/* Title Header */}
      <div className="border-b border-zinc-800 pb-4">
        <h2 className="text-2xl font-bold text-zinc-100 flex items-center gap-2.5">
          <Activity className="w-6 h-6 text-red-500" />
          Fine-Tuning Performance & Evaluation Metrics
        </h2>
        <p className="text-sm text-zinc-400 mt-1">
          Empirical evaluation results across QLoRA training runs (A, A2, B) for Qwen2.5-1.5B-Instruct.
        </p>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#121215] border border-zinc-800 rounded-xl p-4 shadow">
          <div className="text-xs text-zinc-400 flex items-center gap-1.5 font-medium">
            <Layers className="w-4 h-4 text-red-400" />
            Trainable Parameters
          </div>
          <div className="text-2xl font-bold text-zinc-100 mt-2 font-mono">
            9,232,384
          </div>
          <div className="text-xs text-zinc-500 mt-1">
            0.59% of 1,552,946,688 total parameters
          </div>
        </div>

        <div className="bg-[#121215] border border-zinc-800 rounded-xl p-4 shadow">
          <div className="text-xs text-zinc-400 flex items-center gap-1.5 font-medium">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            Perplexity Improvement
          </div>
          <div className="text-2xl font-bold text-emerald-400 mt-2 font-mono">
            16.17 → 6.95
          </div>
          <div className="text-xs text-emerald-500/80 mt-1">
            57% reduction in validation perplexity (Run B)
          </div>
        </div>

        <div className="bg-[#121215] border border-zinc-800 rounded-xl p-4 shadow">
          <div className="text-xs text-zinc-400 flex items-center gap-1.5 font-medium">
            <CheckCircle2 className="w-4 h-4 text-amber-400" />
            Selected Best Run
          </div>
          <div className="text-2xl font-bold text-amber-400 mt-2">
            Run B
          </div>
          <div className="text-xs text-zinc-500 mt-1">
            r=8, lr=5e-5, 890 augmented dataset rows
          </div>
        </div>
      </div>

      {/* Core Analysis Paragraph */}
      <div className="bg-amber-950/40 border border-amber-500/30 rounded-xl p-5 text-sm text-amber-200/90 leading-relaxed shadow">
        <div className="flex items-center gap-2 font-semibold text-amber-300 mb-2">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          Perplexity vs. Factual Accuracy Finding
        </div>
        <p>
          While QLoRA fine-tuning on Run B achieved a clean minimum with a 57% reduction in perplexity (16.17 down to 6.95), empirical testing revealed a trade-off: factual accuracy degraded. The fine-tuned model produces fluent, confidently worded answers that are frequently wrong, and it loses the base model's willingness to refuse unanswerable or nonexistent questions.
        </p>
      </div>

      {/* Results Table */}
      <div className="bg-[#121215] border border-zinc-800 rounded-xl p-5 shadow overflow-x-auto">
        <h3 className="text-base font-semibold text-zinc-200 mb-4 flex items-center gap-2">
          <FileText className="w-4 h-4 text-red-500" />
          Training Runs Comparison Matrix
        </h3>

        <table className="w-full text-left text-sm text-zinc-300">
          <thead className="bg-[#09090b] text-xs uppercase text-zinc-400 border-b border-zinc-800">
            <tr>
              <th className="py-3 px-4">Run</th>
              <th className="py-3 px-4">Rank (r)</th>
              <th className="py-3 px-4">Learning Rate</th>
              <th className="py-3 px-4">Train Rows</th>
              <th className="py-3 px-4">Best Eval Loss</th>
              <th className="py-3 px-4">Perplexity</th>
              <th className="py-3 px-4">Outcome</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/80 font-mono text-xs">
            <tr className="bg-[#09090b]/40 text-zinc-400">
              <td className="py-3 px-4 font-bold text-zinc-300">Baseline</td>
              <td className="py-3 px-4">—</td>
              <td className="py-3 px-4">—</td>
              <td className="py-3 px-4">—</td>
              <td className="py-3 px-4">2.7832</td>
              <td className="py-3 px-4">16.17</td>
              <td className="py-3 px-4 font-sans text-zinc-500">Untuned Qwen2.5-1.5B Base</td>
            </tr>
            <tr className="hover:bg-zinc-800/40">
              <td className="py-3 px-4 font-bold text-red-400">Run A</td>
              <td className="py-3 px-4">32</td>
              <td className="py-3 px-4">2e-4</td>
              <td className="py-3 px-4">257</td>
              <td className="py-3 px-4">1.9295</td>
              <td className="py-3 px-4">6.89</td>
              <td className="py-3 px-4 font-sans text-red-400">Overfit at epoch 1 (train loss 0.033)</td>
            </tr>
            <tr className="hover:bg-zinc-800/40">
              <td className="py-3 px-4 font-bold text-blue-400">Run A2</td>
              <td className="py-3 px-4">8</td>
              <td className="py-3 px-4">5e-5</td>
              <td className="py-3 px-4">257</td>
              <td className="py-3 px-4">1.9555</td>
              <td className="py-3 px-4">7.07</td>
              <td className="py-3 px-4 font-sans text-zinc-400">Stable, undertrained</td>
            </tr>
            <tr className="bg-emerald-950/20 border-l-4 border-emerald-500 hover:bg-emerald-950/30">
              <td className="py-3 px-4 font-bold text-emerald-400 flex items-center gap-1.5">
                Run B
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-sans px-1.5 py-0.5 rounded">Selected</span>
              </td>
              <td className="py-3 px-4 text-emerald-300">8</td>
              <td className="py-3 px-4 text-emerald-300">5e-5</td>
              <td className="py-3 px-4 text-emerald-300">890</td>
              <td className="py-3 px-4 text-emerald-300">1.9394</td>
              <td className="py-3 px-4 text-emerald-300">6.95</td>
              <td className="py-3 px-4 font-sans text-emerald-300 font-medium">Selected — clean loss minimum</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Loss Curves */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#121215] border border-zinc-800 rounded-xl p-4 shadow flex flex-col">
          <h4 className="text-sm font-semibold text-zinc-200 mb-3 flex items-center justify-between">
            <span>Run A2 Loss Curve</span>
            <span className="text-xs text-zinc-500 font-mono">r=8, lr=5e-5 (257 rows)</span>
          </h4>
          <div className="flex-1 bg-[#09090b] rounded-lg overflow-hidden border border-zinc-800 flex items-center justify-center p-2">
            <img
              src="/data/loss_curve_A2.png"
              alt="Run A2 Loss Curve"
              className="max-h-72 object-contain hover:scale-105 transition-transform"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'http://localhost:8000/data/loss_curve_A2.png';
              }}
            />
          </div>
        </div>

        <div className="bg-[#121215] border border-zinc-800 rounded-xl p-4 shadow flex flex-col">
          <h4 className="text-sm font-semibold text-zinc-200 mb-3 flex items-center justify-between">
            <span>Run B Loss Curve (Selected)</span>
            <span className="text-xs text-emerald-400 font-mono">r=8, lr=5e-5 (890 rows)</span>
          </h4>
          <div className="flex-1 bg-[#09090b] rounded-lg overflow-hidden border border-zinc-800 flex items-center justify-center p-2">
            <img
              src="/data/loss_curve_B.png"
              alt="Run B Loss Curve"
              className="max-h-72 object-contain hover:scale-105 transition-transform"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'http://localhost:8000/data/loss_curve_B.png';
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
