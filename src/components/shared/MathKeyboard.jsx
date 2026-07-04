import React, { useState } from 'react';
import { Keyboard } from 'lucide-react';

const numericKeys = [
  ['7', '8', '9', '+', '('],
  ['4', '5', '6', '-', ')'],
  ['1', '2', '3', '*', '^'],
  ['0', '.', 'x', '/', '⌫'],
];

const functionKeys = [
  ['sin(', 'cos(', 'tan(', 'sqrt(', 'exp('],
  ['ln(', 'log(', 'abs(', 'pi', 'e'],
];

const odeExtraKeys = [
  ['y'],
];

function KeyBtn({ label, onClick, variant = 'default' }) {
  const colors = {
    default: 'bg-card border border-border text-foreground hover:bg-muted',
    fn:      'bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20',
    del:     'bg-red-100 text-red-700 hover:bg-red-200 border border-red-200',
    var:     'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200',
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 h-9 rounded-lg text-xs font-mono font-semibold transition-colors ${colors[variant]}`}
    >
      {label}
    </button>
  );
}

export default function MathKeyboard({ value, onChange, showY = false }) {
  const [open, setOpen] = useState(true);

  const insert = (key) => {
    if (key === '⌫') onChange(value.slice(0, -1));
    else onChange(value + key);
  };

  return (
    <div className="mt-2 rounded-xl border border-border overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-3 py-2 bg-muted/50 hover:bg-muted transition-colors text-left"
      >
        <Keyboard className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
          Teclado matemático
        </span>
        <span className="ml-auto text-[10px] text-muted-foreground">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="p-3 bg-muted/20 space-y-3">
          {/* Números y operadores */}
          <div>
            <p className="text-[10px] text-muted-foreground mb-1.5 font-semibold uppercase tracking-wide">Números y operadores</p>
            <div className="space-y-1">
              {numericKeys.map((row, ri) => (
                <div key={ri} className="flex gap-1">
                  {row.map((key) => (
                    <KeyBtn
                      key={key}
                      label={key}
                      onClick={() => insert(key)}
                      variant={key === '⌫' ? 'del' : key === 'x' ? 'var' : 'default'}
                    />
                  ))}
                </div>
              ))}
              {showY && (
                <div className="flex gap-1">
                  <KeyBtn label="y" onClick={() => insert('y')} variant="var" />
                </div>
              )}
            </div>
          </div>

          {/* Funciones matemáticas */}
          <div>
            <p className="text-[10px] text-muted-foreground mb-1.5 font-semibold uppercase tracking-wide">Funciones</p>
            <div className="space-y-1">
              {functionKeys.map((row, ri) => (
                <div key={ri} className="flex gap-1">
                  {row.map((key) => (
                    <KeyBtn
                      key={key}
                      label={key}
                      onClick={() => insert(key)}
                      variant={key === 'pi' || key === 'e' ? 'var' : 'fn'}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}