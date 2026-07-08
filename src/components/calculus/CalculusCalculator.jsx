import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Keyboard, Play, Loader2, ChevronDown, ChevronRight } from 'lucide-react';
import MathKeyboard from '@/components/shared/MathKeyboard';

// ── configs por tema ─────────────────────────────────────────────────────────
const topicConfig = {
  limits: {
    label: 'Calculadora de Límites',
    color: 'from-blue-500 to-indigo-600',
    fields: [
      { key: 'fn',    label: 'f(x)',          placeholder: 'ej: (x^2 - 1)/(x - 1)',  usesKeyboard: true },
      { key: 'point', label: 'x → ?',         placeholder: 'ej: 1  (o "inf" para ∞)', usesKeyboard: false },
    ],
    buildPrompt: (v) =>
      `Calcula el límite: lim (x→${v.point}) de f(x) = ${v.fn}.
       Muestra el procedimiento completo paso a paso en español:
       1) Sustituye directamente y verifica si es indeterminado.
       2) Si es indeterminado (0/0, ∞/∞ etc.) aplica la técnica adecuada (factorización, L'Hôpital, racionalización, etc.).
       3) Simplifica cada paso con detalle.
       4) Indica el resultado final claramente.
       Usa notación matemática clara, sin LaTeX complejo, usa símbolos Unicode (→, ∞, ², ³, √, etc.).`,
  },
  derivatives: {
    label: 'Calculadora de Derivadas',
    color: 'from-violet-500 to-purple-600',
    fields: [
      { key: 'fn',    label: 'f(x)',             placeholder: 'ej: x^3 * sin(x)',   usesKeyboard: true },
      { key: 'order', label: 'Orden (1, 2, 3…)', placeholder: '1',                   usesKeyboard: false },
    ],
    buildPrompt: (v) =>
      `Calcula la derivada de orden ${v.order || 1} de f(x) = ${v.fn}.
       Muestra el procedimiento completo paso a paso en español:
       1) Identifica la regla a aplicar (potencia, producto, cociente, cadena, etc.).
       2) Aplica la regla paso a paso.
       3) Simplifica el resultado.
       4) Si el orden es > 1, repite el proceso para cada derivada sucesiva.
       5) Indica el resultado final: f'(x) = ...
       Usa notación matemática clara con símbolos Unicode.`,
  },
  integrals: {
    label: 'Calculadora de Integrales',
    color: 'from-emerald-500 to-teal-600',
    fields: [
      { key: 'fn',  label: 'f(x)',              placeholder: 'ej: x^2 * ln(x)',  usesKeyboard: true },
      { key: 'a',   label: 'Límite inferior a', placeholder: 'vacío=indefinida', usesKeyboard: false },
      { key: 'b',   label: 'Límite superior b', placeholder: 'vacío=indefinida', usesKeyboard: false },
    ],
    buildPrompt: (v) => {
      const definida = v.a !== '' && v.b !== '';
      return definida
        ? `Calcula la integral definida ∫[${v.a},${v.b}] (${v.fn}) dx.
           Paso a paso en español: encuentra la antiderivada F(x), aplica el Teorema Fundamental F(b)−F(a) y da el resultado numérico.
           Usa notación clara con símbolos Unicode.`
        : `Calcula la integral indefinida ∫ (${v.fn}) dx.
           Paso a paso en español: identifica la técnica (sustitución, partes, fracciones parciales, etc.), aplícala con detalle y escribe el resultado con +C.
           Usa notación clara con símbolos Unicode.`;
    },
  },
  multivariable: {
    label: 'Calculadora Multivariable',
    color: 'from-orange-500 to-red-500',
    fields: [
      { key: 'fn',  label: 'f(x, y)',   placeholder: 'ej: x^2*y + sin(x*y)',  usesKeyboard: true },
      { key: 'op',  label: 'Operación', placeholder: '',                        usesKeyboard: false, isSelect: true,
        options: ['Derivada parcial ∂f/∂x', 'Derivada parcial ∂f/∂y', 'Gradiente ∇f', 'Laplaciano ∇²f'] },
    ],
    buildPrompt: (v) =>
      `Realiza la operación "${v.op}" sobre f(x,y) = ${v.fn}.
       Paso a paso en español: aplica la definición/reglas, trata las variables como constantes cuando corresponda, simplifica y da el resultado final.
       Usa notación clara con símbolos Unicode.`,
  },
  transforms: {
    label: 'Calculadora de Transformadas',
    color: 'from-cyan-500 to-blue-600',
    fields: [
      { key: 'fn',   label: 'f(t)',       placeholder: 'ej: t^2 * exp(-3*t)',   usesKeyboard: true },
      { key: 'type', label: 'Tipo',       placeholder: '',                       usesKeyboard: false, isSelect: true,
        options: ['Transformada de Laplace L{f(t)}', 'Transformada inversa L⁻¹{F(s)}', 'Serie de Taylor (a=0)', 'Coeficientes de Fourier'] },
    ],
    buildPrompt: (v) =>
      `Calcula "${v.type}" de la función ${v.fn}.
       Paso a paso en español: aplica la definición o usa la tabla de transformadas, muestra cada propiedad usada y da el resultado final con notación clara.
       Usa símbolos Unicode, no LaTeX.`,
  },
};

// ── componente resultado colapsable ─────────────────────────────────────────
function ResultBox({ result }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="mt-4 border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-4 py-3 bg-muted/40 hover:bg-muted/60 transition-colors text-left"
      >
        <span className="text-xs font-bold text-foreground flex-1">📋 Procedimiento paso a paso</span>
        {open ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
      </button>
      {open && (
        <div className="px-4 py-4 bg-card">
          <pre className="text-sm leading-relaxed whitespace-pre-wrap font-mono text-foreground">{result}</pre>
        </div>
      )}
    </div>
  );
}

// ── componente principal ─────────────────────────────────────────────────────
export default function CalculusCalculator({ topicId }) {
  const cfg = topicConfig[topicId];
  const [values, setValues] = useState({});
  const [activeField, setActiveField] = useState(null);
  const [showKbd, setShowKbd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  if (!cfg) return null;

  const kbdField = cfg.fields.find(f => f.usesKeyboard);

  const handleCalc = async () => {
    const missing = cfg.fields.filter(f => !f.isSelect && !f.options && !values[f.key]?.trim() && f.key !== 'a' && f.key !== 'b' && f.key !== 'order');
    if (!values[kbdField?.key]?.trim()) {
      setError('Por favor ingresa la función.');
      return;
    }
    setError(null);
    setResult(null);
    setLoading(true);
    const prompt = cfg.buildPrompt(values);
    const res = await base44.integrations.Core.InvokeLLM({ prompt });
    setResult(res);
    setLoading(false);
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      {/* header */}
      <div className={`bg-gradient-to-r ${cfg.color} px-5 py-3`}>
        <h2 className="text-white font-bold text-sm">{cfg.label}</h2>
      </div>

      <div className="p-5 space-y-4">
        {/* campos */}
        {cfg.fields.map(f => (
          <div key={f.key}>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">{f.label}</label>
            {f.isSelect ? (
              <select
                className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                value={values[f.key] || f.options[0]}
                onChange={e => setValues(v => ({ ...v, [f.key]: e.target.value }))}
              >
                {f.options.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            ) : (
              <Input
                className="math-input"
                placeholder={f.placeholder}
                value={values[f.key] || ''}
                onFocus={() => { if (f.usesKeyboard) { setActiveField(f.key); setShowKbd(true); } }}
                onChange={e => setValues(v => ({ ...v, [f.key]: e.target.value }))}
              />
            )}
          </div>
        ))}

        {/* teclado matemático */}
        {kbdField && (
          <div>
            <button
              type="button"
              onClick={() => setShowKbd(!showKbd)}
              className="flex items-center gap-1.5 text-[11px] font-semibold text-primary hover:underline"
            >
              <Keyboard className="w-3.5 h-3.5" />
              {showKbd ? 'Ocultar teclado' : 'Mostrar teclado matemático'}
            </button>
            {showKbd && (
              <MathKeyboard
                value={values[kbdField.key] || ''}
                onChange={v => setValues(prev => ({ ...prev, [kbdField.key]: v }))}
              />
            )}
          </div>
        )}

        {error && <p className="text-xs text-destructive">{error}</p>}

        <Button onClick={handleCalc} disabled={loading} className="w-full gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          {loading ? 'Calculando...' : 'Calcular paso a paso'}
        </Button>

        {result && <ResultBox result={result} />}
      </div>
    </div>
  );
}