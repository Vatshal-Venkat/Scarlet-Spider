import React from 'react';
import { Shield, Sparkles, Film, AlertTriangle } from 'lucide-react';

export default function SampleQuestions({ onSelectQuestion }) {
  const categories = [
    {
      title: "Spider-Man Lore",
      icon: Shield,
      prompts: [
        "Where did Peter Parker go to high school?",
        "What was Uncle Ben's iconic advice to Peter?"
      ]
    },
    {
      title: "Villains & Allies",
      icon: Sparkles,
      prompts: [
        "What is Venom and how was it created?",
        "How did Norman Osborn become the Green Goblin?"
      ]
    },
    {
      title: "Films & Multiverse",
      icon: Film,
      prompts: [
        "What year did Miles Morales first appear in comics?",
        "Who played Spider-Man in the 2002 film?"
      ]
    },
    {
      title: "Hallucination Probe",
      icon: AlertTriangle,
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
            className="bg-[#121215] border border-zinc-800 rounded-2xl p-4 shadow flex flex-col gap-2 hover:border-red-500/40 transition-colors"
          >
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
              <IconComponent className="w-3.5 h-3.5 text-red-500" />
              <span>{cat.title}</span>
            </div>

            <div className="flex flex-col gap-1.5 mt-0.5">
              {cat.prompts.map((p, pIdx) => (
                <button
                  key={pIdx}
                  onClick={() => onSelectQuestion(p)}
                  className="text-left text-xs bg-[#18181c] hover:bg-zinc-800 text-zinc-300 hover:text-white p-2.5 rounded-xl border border-zinc-800/90 hover:border-red-500/30 transition-colors cursor-pointer group"
                >
                  <span className="text-red-500 group-hover:translate-x-0.5 inline-block transition-transform mr-1.5 font-bold">›</span>
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
