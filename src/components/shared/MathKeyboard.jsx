import React from 'react';

const keys = [
  // Row 1: digits + basic ops
  ['7', '8', '9', '+', '('],
  ['4', '5', '6', '-', ')'],
  ['1', '2', '3', '*', '^'],
  ['0', '.', 'x', 'y', '/'],
  ['^', '(', ')', '*', '⌫'],
  // Row 2: functions
  ['sin(', 'cos(', 'tan(', 'sqrt(', 'exp('],
  ['ln(', 'log(', 'abs(', 'pi', 'e'],
];

const displayLabel = (k) => k === '⌫' ? '⌫' : k;

export default function MathKeyboard({ value, onChange }) {
  const handleKey = (key) => {
    if (key === '⌫') {
      onChange(value.slice(0, -1));
    } else {
      onChange(value + key);
    }
  };

  return (
    <div className="mt-2 p-3 bg-muted/40 border border-border rounded-xl">
      <p className="text-[10px] text-muted-foreground mb-2 font-semibold uppercase tracking-wide">Teclado matemático</p>
      <div className="space-y-1">
        {keys.map((row, ri) => (
          <div key={ri} className="flex gap-1">
            {row.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => handleKey(key)}
                className={`flex-1 h-9 rounded-lg text-xs font-mono font-semibold transition-colors
                  ${key === '⌫'
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : /^[a-z]/.test(key) || key === 'pi' || key === 'e'
                      ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                      : 'bg-card border border-border text-foreground hover:bg-muted'
                  }`}
              >
                {displayLabel(key)}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}