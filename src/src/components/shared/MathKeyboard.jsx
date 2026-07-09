import React from 'react';
import { Delete, CornerDownLeft } from 'lucide-react';

const keys = [
  { label: 'x', insert: 'x' },
  { label: '+', insert: '+' },
  { label: '−', insert: '-' },
  { label: '×', insert: '*' },
  { label: '÷', insert: '/' },
  { label: '(', insert: '(' },
  { label: ')', insert: ')' },
  { label: '^', insert: '^' },
  { label: '√', insert: 'sqrt(' },
  { label: 'x²', insert: '^2' },
  { label: 'sin', insert: 'sin(' },
  { label: 'cos', insert: 'cos(' },
  { label: 'tan', insert: 'tan(' },
  { label: 'ln', insert: 'log(' },
  { label: 'eˣ', insert: 'exp(' },
  { label: 'π', insert: 'pi' },
  { label: 'e', insert: 'e' },
  { label: '|x|', insert: 'abs(' },
  { label: '1/x', insert: '1/' },
];

export default function MathKeyboard({ onInsert, onBackspace, onClear, onEnter }) {
  return (
    <div className="bg-muted/40 border border-border rounded-xl p-3 mt-2">
      <div className="grid grid-cols-6 sm:grid-cols-10 gap-1.5">
        {keys.map(k => (
          <button
            key={k.label}
            type="button"
            onClick={() => onInsert(k.insert)}
            className="px-2 py-2.5 rounded-lg bg-card border border-border text-sm font-medium hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors active:scale-95"
          >
            {k.label}
          </button>
        ))}
        <button
          type="button"
          onClick={onBackspace}
          className="px-2 py-2.5 rounded-lg bg-card border border-border text-sm font-medium hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-colors active:scale-95 flex items-center justify-center"
        >
          <Delete className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={onClear}
          className="px-2 py-2.5 rounded-lg bg-card border border-border text-xs font-medium hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors active:scale-95"
        >
          C
        </button>
      </div>
      {onEnter && (
        <button
          type="button"
          onClick={onEnter}
          className="w-full mt-2 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors active:scale-95 flex items-center justify-center gap-2"
        >
          <CornerDownLeft className="w-4 h-4" /> Calcular
        </button>
      )}
    </div>
  );
}