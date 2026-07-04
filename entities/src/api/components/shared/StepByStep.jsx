import React, { useState } from 'react';
import { ChevronDown, ChevronRight, BookOpen } from 'lucide-react';

/* Tipos de línea que reconocemos */
function classify(line) {
  if (!line || line.trim() === '')      return 'empty';
  if (line === '__sep__')               return 'sep';
  if (line.startsWith('**'))           return 'header';
  if (line.startsWith('───'))         return 'divider';
  if (line.startsWith('→') || line.startsWith('⚠')) return 'decision';
  if (/^f\([ab]\)\s*=/.test(line))    return 'fab';   // f(a) o f(b)
  if (/^f\(xr\)\s*=/.test(line))      return 'fxr';
  if (/^f\(xi\)\s*=/.test(line))      return 'fxi';
  if (/^g\(xi\)\s*=/.test(line))      return 'fxi';
  if (/^xr\s*=/.test(line))           return 'xr';
  if (/^xi/.test(line))               return 'xi';
  return 'normal';
}

const LINE_CLASS = {
  empty:    '',
  sep:      '',
  header:   '',
  divider:  'text-slate-400 tracking-wider',
  decision: 'font-semibold',
  fab:      'font-mono font-bold',
  fxr:      'font-mono',
  fxi:      'font-mono',
  xr:       'font-mono',
  xi:       'font-mono',
  normal:   'font-mono',
};

/* Colores distinguibles sin depender del tema */
const BADGE = {
  fab:      'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/70 dark:text-emerald-200',
  fxr:      'bg-indigo-100 text-indigo-900 dark:bg-indigo-900/70 dark:text-indigo-200',
  fxi:      'bg-indigo-100 text-indigo-900 dark:bg-indigo-900/70 dark:text-indigo-200',
  xr:       'bg-violet-100 text-violet-900 dark:bg-violet-900/70 dark:text-violet-200',
  xi:       'bg-sky-100 text-sky-900 dark:bg-sky-900/70 dark:text-sky-200',
  decision: 'bg-amber-100 text-amber-900 dark:bg-amber-900/70 dark:text-amber-200',
};

function renderLine(line, idx) {
  const type = classify(line);

  if (type === 'sep') {
    return <hr key={idx} className="my-3 border-dashed border-slate-300 dark:border-slate-700" />;
  }
  if (type === 'empty') {
    return <div key={idx} className="h-1" />;
  }
  if (type === 'header') {
    const text = line.replace(/\*\*/g, '');
    return (
      <div key={idx} className="mt-1 mb-2 flex items-center gap-2">
        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-700 text-white">
          {text}
        </span>
      </div>
    );
  }
  if (type === 'divider') {
    return (
      <p key={idx} className="text-slate-400 text-[10px] tracking-widest my-1">
        {line}
      </p>
    );
  }

  /* Líneas con badge de color (f(a), f(b), f(xr), xr, etc.) */
  if (BADGE[type]) {
    return (
      <div key={idx} className="flex items-start gap-2 py-0.5">
        <span className={`shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded ${BADGE[type]}`}>
          {type === 'fab'
            ? line.match(/^f\([ab]\)/)?.[0]
            : type === 'fxr' ? 'f(xr)' : type === 'fxi' ? 'f(xi)/g(xi)'
            : type === 'xr' ? 'xr' : type === 'xi' ? 'xi' : type}
        </span>
        <span className="font-mono text-xs text-white leading-5 break-all">
          {line}
        </span>
      </div>
    );
  }
  if (type === 'decision') {
    return (
      <div key={idx} className="flex items-center gap-2 py-0.5">
        <span className={`shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded ${BADGE.decision}`}>
          ⟶
        </span>
        <span className="font-mono text-xs text-white font-semibold break-all">
          {line}
        </span>
      </div>
    );
  }

  /* Línea normal */
  return (
    <p key={idx} className="text-xs font-mono text-white leading-5">
      {line}
    </p>
  );
}

export default function StepByStep({ steps, title = 'Procedimiento paso a paso' }) {
  const [open, setOpen] = useState(false);

  if (!steps || steps.length === 0) return null;

  const lines = steps.flatMap((s, sIdx) => {
    let raw = [];
    if (typeof s === 'string')             raw = [s];
    else if (Array.isArray(s.procedure))   raw = s.procedure;
    else                                   raw = [JSON.stringify(s)];
    // separador visual entre iteraciones
    return sIdx < steps.length - 1 ? [...raw, '__sep__'] : raw;
  });

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-muted/50 transition-colors"
      >
        <BookOpen className="w-4 h-4 text-primary flex-shrink-0" />
        <span className="font-semibold text-sm flex-1 text-left">{title}</span>
        {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>

      {open && (
        <div className="px-4 pb-5 max-h-[520px] overflow-y-auto">
          <div className="space-y-px pt-2">
            {lines.map((line, idx) => renderLine(line, idx))}
          </div>
        </div>
      )}
    </div>
  );
}