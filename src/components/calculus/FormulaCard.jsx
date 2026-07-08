import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

export default function FormulaCard({ section }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/40 transition-colors text-left"
      >
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-sm">{section.title}</h3>
          <p className="font-mono text-xs text-primary mt-0.5 truncate">{section.formula}</p>
        </div>
        {open ? <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0 ml-3" /> 
               : <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 ml-3" />}
      </button>

      {open && (
        <div className="px-5 pb-5">
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{section.description}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {section.rules.map((rule, idx) => (
              <div key={idx} className="bg-muted/40 rounded-lg px-3 py-2.5 border border-border/60">
                <p className="text-[11px] text-muted-foreground font-semibold mb-0.5">{rule.name}</p>
                <p className="font-mono text-xs text-foreground font-medium leading-relaxed">{rule.formula}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}