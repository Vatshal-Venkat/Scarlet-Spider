import React from 'react';
import { HelpCircle, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function SampleQuestions({ onSelectQuestion }) {
  const answerable = [
    "Who is Venom?",
    "What year did Miles Morales first appear?",
    "Where did Peter Parker go to school?"
  ];

  const probes = [
    "Who directed the Spider-Man film released in 2031?",
    "Name the three members of the Spider-Squad.",
    "Which issue introduced the Spider-Man villain Glasswing?"
  ];

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 my-4 max-w-3xl mx-auto shadow-inner">
      <div className="flex items-center gap-2 mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
        <HelpCircle className="w-4 h-4 text-red-500" />
        <span>Sample Evaluation Prompts (Click to test model calibration)</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Answerable */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium mb-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Answerable (In Training Data)</span>
          </div>
          {answerable.map((q, idx) => (
            <button
              key={idx}
              onClick={() => onSelectQuestion(q)}
              className="text-left text-xs bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 p-2.5 rounded-lg border border-slate-700/50 hover:border-slate-500 transition-all cursor-pointer"
            >
              "{q}"
            </button>
          ))}
        </div>

        {/* Unanswerable Probes */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 text-xs text-amber-400 font-medium mb-1">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Unanswerable Probes (Testing Hallucination)</span>
          </div>
          {probes.map((q, idx) => (
            <button
              key={idx}
              onClick={() => onSelectQuestion(q)}
              className="text-left text-xs bg-slate-800/80 hover:bg-amber-950/40 text-amber-200/90 p-2.5 rounded-lg border border-amber-900/40 hover:border-amber-500/60 transition-all cursor-pointer"
            >
              "{q}"
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
