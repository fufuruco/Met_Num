import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Calculator, Delete, X } from 'lucide-react';

/* ─── Button definitions ────────────────────────────────────────────── */
const KEYPAD = [
  // Row 1 – trig
  { label: 'sin',    insert: 'sin(',    type: 'trig' },
  { label: 'cos',    insert: 'cos(',    type: 'trig' },
  { label: 'tan',    insert: 'tan(',    type: 'trig' },
  { label: 'asin',   insert: 'asin(',   type: 'inv-trig' },
  { label: 'acos',   insert: 'acos(',   type: 'inv-trig' },
  { label: 'atan',   insert: 'atan(',   type: 'inv-trig' },
  // Row 2 – hyp
  { label: 'sinh',   insert: 'sinh(',   type: 'hyp' },
  { label: 'cosh',   insert: 'cosh(',   type: 'hyp' },
  { label: 'tanh',   insert: 'tanh(',   type: 'hyp' },
  { label: '√',      insert: 'sqrt(',   type: 'log' },
  { label: 'x²',     insert: '^2',      type: 'log' },
  { label: 'xⁿ',     insert: '^',       type: 'op'  },
  // Row 3 – log / const
  { label: 'ln',     insert: 'log(',    type: 'log' },
  { label: 'log₁₀',  insert: 'log10(',  type: 'log' },
  { label: '|x|',    insert: 'abs(',    type: 'log' },
  { label: 'π',      insert: 'pi',      type: 'const' },
  { label: 'e',      insert: 'e',       type: 'const' },
  { label: '∞',      insert: 'Infinity', type: 'const' },
  // Row 4 – parens + numbers
  { label: '(',      insert: '(',       type: 'paren' },
  { label: ')',      insert: ')',       type: 'paren' },
  { label: '7',      insert: '7',       type: 'num' },
  { label: '8',      insert: '8',       type: 'num' },
  { label: '9',      insert: '9',       type: 'num' },
  { label: '÷',      insert: '/',       type: 'op'  },
  // Row 5
  { label: 'x',      insert: 'x',      type: 'var' },
  { label: ',',      insert: ',',      type: 'paren' },
  { label: '4',      insert: '4',      type: 'num' },
  { label: '5',      insert: '5',      type: 'num' },
  { label: '6',      insert: '6',      type: 'num' },
  { label: '×',      insert: '*',      type: 'op'  },
  // Row 6
  { label: 'AC',     insert: 'AC',     type: 'action-clear' },
  { label: 'DEL',    insert: 'DEL',    type: 'action-del' },
  { label: '1',      insert: '1',      type: 'num' },
  { label: '2',      insert: '2',      type: 'num' },
  { label: '3',      insert: '3',      type: 'num' },
  { label: '−',      insert: '-',      type: 'op'  },
  // Row 7
  { label: 'ceil(',  insert: 'ceil(',  type: 'log' },
  { label: 'floor(', insert: 'floor(', type: 'log' },
  { label: '0',      insert: '0',      type: 'num' },
  { label: '.',      insert: '.',      type: 'num' },
  { label: '%',      insert: '/100',   type: 'op'  },
  { label: '+',      insert: '+',      type: 'op'  },
];

/* ─── Color map per type ─────────────────────────────────────────────── */
const STYLE = {
  'trig':         'bg-violet-600 hover:bg-violet-500 text-white shadow-violet-900/40',
  'inv-trig':     'bg-fuchsia-600 hover:bg-fuchsia-500 text-white shadow-fuchsia-900/40',
  'hyp':          'bg-pink-600 hover:bg-pink-500 text-white shadow-pink-900/40',
  'log':          'bg-sky-600 hover:bg-sky-500 text-white shadow-sky-900/40',
  'const':        'bg-amber-500 hover:bg-amber-400 text-white shadow-amber-900/40',
  'op':           'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/40',
  'paren':        'bg-slate-600 hover:bg-slate-500 text-white shadow-slate-900/40',
  'num':          'bg-slate-800 hover:bg-slate-700 text-slate-100 shadow-black/40',
  'var':          'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/40',
  'action-clear': 'bg-red-600 hover:bg-red-500 text-white shadow-red-900/40',
  'action-del':   'bg-orange-600 hover:bg-orange-500 text-white shadow-orange-900/40',
};

const LEGEND = [
  { color: 'bg-violet-600',  label: 'Trig' },
  { color: 'bg-fuchsia-600', label: 'Inv' },
  { color: 'bg-pink-600',    label: 'Hip' },
  { color: 'bg-sky-600',     label: 'Log/Fn' },
  { color: 'bg-amber-500',   label: 'Cte' },
  { color: 'bg-emerald-600', label: 'Var' },
  { color: 'bg-indigo-600',  label: 'Op' },
];

export default function MathInput({ value, onChange, placeholder, className, id }) {
  const [open, setOpen] = useState(false);
  const inputRef  = useRef(null);
  const panelRef  = useRef(null);
  const triggerRef = useRef(null);

  /* ── Close only when clicking truly outside both the input and the panel ── */
  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (e) => {
      const inPanel   = panelRef.current?.contains(e.target);
      const inTrigger = triggerRef.current?.contains(e.target);
      const inInput   = inputRef.current?.contains(e.target);
      if (!inPanel && !inTrigger && !inInput) {
        setOpen(false);
      }
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [open]);

  /* ── Text helpers ── */
  const handleInsert = useCallback((text) => {
    const el = inputRef.current;
    if (!el) { onChange((value || '') + text); return; }
    const start = el.selectionStart;
    const end   = el.selectionEnd;
    const cur   = value || '';
    const next  = cur.slice(0, start) + text + cur.slice(end);
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + text.length, start + text.length);
    });
  }, [value, onChange]);

  const handleBackspace = useCallback(() => {
    const el = inputRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end   = el.selectionEnd;
    const cur   = value || '';
    if (start === end && start > 0) {
      onChange(cur.slice(0, start - 1) + cur.slice(end));
      requestAnimationFrame(() => { el.focus(); el.setSelectionRange(start - 1, start - 1); });
    } else if (start !== end) {
      onChange(cur.slice(0, start) + cur.slice(end));
      requestAnimationFrame(() => { el.focus(); el.setSelectionRange(start, start); });
    }
  }, [value, onChange]);

  const handleClear = useCallback(() => {
    onChange('');
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [onChange]);

  /* ── Key click — use onMouseDown + preventDefault to keep input focus ── */
  const onKeyDown = (btn, e) => {
    e.preventDefault(); // prevents the input from losing focus
    if (btn.type === 'action-clear') { handleClear(); return; }
    if (btn.type === 'action-del')   { handleBackspace(); return; }
    handleInsert(btn.insert);
  };

  /* ── render ── */
  return (
    <div className="relative flex items-center w-full">
      <Input
        id={id}
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`math-input pr-28 font-mono text-sm ${className || ''}`}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck="false"
      />

      {/* ── Toggle button ── */}
      <button
        ref={triggerRef}
        type="button"
        onMouseDown={(e) => e.preventDefault()} // keep input focus
        onClick={() => setOpen((o) => !o)}
        className="absolute right-1 flex items-center gap-1.5 px-3 h-8 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors shadow-md shadow-indigo-900/40 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        title="Abrir calculadora matemática"
      >
        <Calculator className="w-3.5 h-3.5" />
        Teclado
      </button>

      {/* ── Floating panel (custom, no Radix) ── */}
      {open && (
        <div
          ref={panelRef}
          className="absolute z-50 right-0 top-full mt-2 overflow-hidden rounded-2xl shadow-2xl border border-white/10"
          style={{ minWidth: 340 }}
          /* Never let any interaction bubble out */
          onMouseDown={(e) => e.preventDefault()}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-slate-900 to-indigo-950 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold text-white tracking-wide">Calculadora Científica</span>
            </div>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setOpen(false)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Display */}
          <div className="px-4 py-2 bg-slate-950 border-b border-white/10">
            <div className="font-mono text-right text-sm text-slate-200 min-h-[1.5rem] truncate">
              {value
                ? value
                : <span className="text-slate-600 italic text-xs">ingresa una expresión…</span>
              }
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-2 px-3 py-1.5 bg-slate-950/80 border-b border-white/5">
            {LEGEND.map(l => (
              <div key={l.label} className="flex items-center gap-1">
                <div className={`w-2.5 h-2.5 rounded-sm ${l.color}`} />
                <span className="text-[10px] text-slate-400">{l.label}</span>
              </div>
            ))}
          </div>

          {/* Keypad */}
          <div
            className="grid gap-1.5 p-3 bg-slate-950"
            style={{ gridTemplateColumns: 'repeat(6, minmax(0,1fr))' }}
          >
            {KEYPAD.map((btn, idx) => (
              <button
                key={idx}
                type="button"
                /* onMouseDown fires before the input loses focus, 
                   and preventDefault() prevents that focus loss */
                onMouseDown={(e) => onKeyDown(btn, e)}
                className={`
                  h-10 rounded-lg text-xs font-semibold select-none
                  transition-all duration-100 active:scale-95
                  shadow-md cursor-pointer
                  ${STYLE[btn.type]}
                  ${btn.type === 'action-del' ? 'flex items-center justify-center gap-1' : ''}
                `}
                title={btn.insert}
              >
                {btn.type === 'action-del'
                  ? <><Delete className="w-3 h-3" /><span>DEL</span></>
                  : btn.label
                }
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="px-3 py-1.5 bg-slate-950/90 border-t border-white/5 text-center">
            <span className="text-[10px] text-slate-500">
              También puedes escribir directamente en el campo de texto
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
