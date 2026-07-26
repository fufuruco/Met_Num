import React, { useState } from 'react';
import { Keyboard } from 'lucide-react';

const basicKeys = [
  ['7', '8', '9', '+', '('],
  ['4', '5', '6', '-', ')'],
  ['1', '2', '3', '*', '^'],
  ['0', '.', 'x', '/', '⌫'],
];

const functionKeys = [
  ['sin(', 'cos(', 'tan(', 'sqrt(', 'exp('],
  ['ln(', 'log(', 'abs(', 'pi', 'e'],
  ['x', 'y', 'z', '⌫'],
];

const calculusKeys = [
  ['∫', '∬', '∭', '∂', '∇'],
  ['∇²', 'lim', '∞', 'dx', 'dy'],
  ['dz', 'x', 'y', 'z', '⌫'],
];

const matrixKeys = [
  ['[', ']', ',', 'det(', 'T'],
  ['λ', 'x', 'y', 'z', '⌫'],
];

function KeyBtn({ label, onClick, variant = 'default' }) {
  const colors = {
    default: 'bg-card border border-border text-foreground hover:bg-muted',
    fn:      'bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20',
    del:     'bg-red-100 text-red-700 hover:bg-red-200 border border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-900',
    var:     'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900',
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

export default function MathKeyboard({ value, onChange }) {
  const [open, setOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('basic');

  const insert = (key) => {
    if (key === '⌫') {
      onChange(value.slice(0, -1));
    } else {
      onChange(value + key);
    }
  };

  const renderKeys = (keys) => {
    return (
      <div className="space-y-1">
        {keys.map((row, ri) => (
          <div key={ri} className="flex gap-1">
            {row.map((key) => {
              let variant = 'default';
              if (key === '⌫') variant = 'del';
              else if (['x', 'y', 'z', 'pi', 'e'].includes(key)) variant = 'var';
              else if (key.endsWith('(') || ['∫', '∬', '∭', '∂', '∇', '∇²'].includes(key)) variant = 'fn';

              return (
                <KeyBtn
                  key={key}
                  label={key}
                  onClick={() => insert(key)}
                  variant={variant}
                />
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="mt-2 rounded-xl border border-border overflow-hidden bg-card">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-3 py-2.5 bg-muted/40 hover:bg-muted/60 transition-colors text-left border-b border-border"
      >
        <Keyboard className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
          Teclado Matemático
        </span>
        <span className="ml-auto text-[10px] text-muted-foreground">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div>
          {/* Selector de pestañas */}
          <div className="flex border-b border-border bg-muted/20">
            {[
              { id: 'basic', label: 'Básico' },
              { id: 'funcs', label: 'Funciones' },
              { id: 'calc', label: 'Cálculo' },
              { id: 'matrix', label: 'Matrices' },
            ].map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={`flex-1 py-2 text-[10px] sm:text-[11px] font-bold text-center border-b-2 transition-all ${
                  activeTab === t.id
                    ? 'border-primary text-primary bg-background'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Grilla de teclas */}
          <div className="p-3 bg-muted/5">
            {activeTab === 'basic' && renderKeys(basicKeys)}
            {activeTab === 'funcs' && renderKeys(functionKeys)}
            {activeTab === 'calc' && renderKeys(calculusKeys)}
            {activeTab === 'matrix' && renderKeys(matrixKeys)}
          </div>
        </div>
      )}
    </div>
  );
}