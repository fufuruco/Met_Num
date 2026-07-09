import React, { useState } from 'react';
import { ChevronDown, ChevronRight, BookOpen } from 'lucide-react';

export default function StepByStep({ steps, title = "Procedimiento paso a paso" }) {
  const [open, setOpen] = useState(false);

  if (!steps || steps.length === 0) return null;

  // steps can be array of strings or array of objects with .procedure
  const lines = steps.flatMap(s => {
    if (typeof s === 'string') return [s];
    if (s.procedure) return [...s.procedure, ''];
    return [JSON.stringify(s)];
  });

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-muted/50 transition-colors"
      >
        <BookOpen className="w-4 h-4 text-primary flex-shrink-0" />
        <span className="font-semibold text-sm flex-1 text-left">{title}</span>
        {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>
      {open && (
        <div className="px-5 pb-5 max-h-96 overflow-y-auto">
          <div className="space-y-1 font-mono text-xs leading-relaxed text-muted-foreground">
            {lines.map((line, idx) => (
              <p key={idx} className={line.startsWith('**') ? 'font-bold text-foreground pt-3 text-sm' : ''}>
                {line.replace(/\*\*/g, '')}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}