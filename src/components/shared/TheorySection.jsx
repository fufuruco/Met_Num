import React, { useState } from 'react';
import { GraduationCap, ChevronDown, ChevronRight, CheckCircle, XCircle } from 'lucide-react';

export default function TheorySection({ title, description, formula, advantages = [], disadvantages = [] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-muted/50 transition-colors"
      >
        <GraduationCap className="w-4 h-4 text-primary flex-shrink-0" />
        <span className="font-semibold text-sm flex-1 text-left">Teoría: {title}</span>
        {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>
      {open && (
        <div className="px-5 pb-5 space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
          {formula && (
            <div className="bg-muted/50 rounded-lg px-4 py-3">
              <p className="text-xs font-semibold text-muted-foreground mb-1">Fórmula</p>
              <p className="font-mono text-sm font-bold">{formula}</p>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {advantages.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-emerald-700 mb-2">Ventajas</p>
                <ul className="space-y-1.5">
                  {advantages.map((a, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {disadvantages.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-red-700 mb-2">Desventajas</p>
                <ul className="space-y-1.5">
                  {disadvantages.map((d, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <XCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}