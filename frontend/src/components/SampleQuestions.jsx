import React from 'react';
import { Shield, Sparkles, Film, AlertTriangle } from 'lucide-react';

export default function SampleQuestions({ onSelectQuestion }) {
  const categories = [
    {
      title: "Spider-Man Lore",
      icon: Shield,
      color: "text-red-400 border-red-500/40 bg-red-950/30",
      prompts: [
        "Where did Peter Parker go to high school?",
        "What was Uncle Ben's iconic advice to Peter?"
      ]
    },
    {
      title: "Villains & Allies",
      icon: Sparkles,
      color: "text-purple-400 border-purple-500/40 bg-purple-950/30",
      prompts: [
        "Who is Venom and how was he created?",
        "How did Norman Osborn become the Green Goblin?"
      ]
    },
    {
      title: "Films & Multiverse",
      icon: Film,
      color: "text-blue-400 border-blue-500/40 bg-blue-950/30",
      prompts: [
        "What year did Miles Morales first appear in comics?",
        "Who played Spider-Man in the 2002 film?"
      ]
    },
    {
      title: "Hallucination Probe",
      icon: AlertTriangle,
      color: "text-amber-400 border-amber-500/40 bg-amber-950/30",
      prompts: [
        "Who directed the Spider-Man film released in 2031?",
        "Which comic issue introduced the villain Glasswing?"
      ]
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 max-w-3xl mx-auto my-4 text-left">
      {categories.map((cat, idx) => {
        const IconComponent = cat.icon;
        return (
          <div
            key={idx}
            className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-3.5 shadow-md flex flex-col gap-2 hover:border-slate-700 transition-all"
          >
            <div className="flex items-center gap-2 text-xs font-semibold">
              <div className={`p-1.5 rounded-lg border ${cat.color}`}>
                <IconComponent className="w-3.5 h-3.5" />
              </div>
              <span className="text-slate-200">{cat.title}</span>
            </div>

            <div className="flex flex-col gap-1.5 mt-0.5">
              {cat.prompts.map((p, pIdx) => (
                <button
                  key={pIdx}
                  onClick={() => onSelectQuestion(p)}
                  className="text-left text-xs bg-slate-950/60 hover:bg-slate-800 text-slate-300 hover:text-white p-2.5 rounded-xl border border-slate-800 hover:border-slate-600 transition-all cursor-pointer group"
                >
                  <span className="text-red-400 group-hover:translate-x-0.5 inline-block transition-transform mr-1.5 font-bold">›</span>
                  "{p}"
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
