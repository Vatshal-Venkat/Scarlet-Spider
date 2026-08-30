import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function DisclaimerBanner() {
  return (
    <div className="bg-amber-950/70 border-b border-amber-500/30 text-amber-200 px-4 py-2 flex items-center justify-center gap-2.5 text-xs sm:text-sm font-medium tracking-wide">
      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
      <span>
        <strong>Accuracy Disclaimer:</strong> This model was fine-tuned on 890 examples and frequently states incorrect facts with confidence. Answers should not be trusted without verification.
      </span>
    </div>
  );
}
