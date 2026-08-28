import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Keyboard, Play, Loader2, ChevronDown, ChevronRight } from 'lucide-react';
import MathKeyboard from '@/components/shared/MathKeyboard';
import MathRenderer from '@/components/calculus/MathRenderer';
import ResultActions from '@/components/shared/ResultActions';

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
       Muestra el procedimiento completo paso a paso en español.
       IMPORTANTE: Usa LaTeX para todas las expresiones matemáticas.
       - Expresiones en línea: $...$ (ej: $\\lim_{x \\to ${v.point}} \\frac{x^3+1}{x^2-1}$)
       - Expresiones centradas grandes: $$...$$ (ej: $$\\lim_{x \\to ${v.point}} f(x) = \\frac{3}{2}$$)
       Estructura: título "Solución", luego pasos numerados con texto explicativo + fórmulas LaTeX, resultado final destacado.`,
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
       Muestra el procedimiento completo paso a paso en español.
       IMPORTANTE: Usa LaTeX para todas las expresiones matemáticas.
       - Expresiones en línea: $...$ (ej: $f'(x)$)
       - Expresiones centradas: $$...$$ (ej: $$\\frac{d}{dx}[x^3 \\sin(x)]$$)
       Estructura: título "Solución", pasos numerados con texto + fórmulas LaTeX, resultado final en bloque $$.`,
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
        ? `Calcula la integral definida ∫[${v.a},${v.b}] (${v.fn}) dx paso a paso en español.
           IMPORTANTE: Usa LaTeX: inline $...$ y bloques $$...$$ para fórmulas grandes.
           Encuentra F(x), aplica TFC: $$F(b)-F(a)$$ y da el resultado numérico.`
        : `Calcula la integral indefinida ∫ (${v.fn}) dx paso a paso en español.
           IMPORTANTE: Usa LaTeX: inline $...$ y bloques $$...$$ para fórmulas grandes.
           Identifica la técnica, aplícala con detalle y escribe el resultado con $+C$.`;
    },
  },
  multivariable: {
    label: 'Calculadora Multivariable',
    color: 'from-orange-500 to-red-500',
    fields: [
      { key: 'fn',  label: 'f(x, y, z)',   placeholder: 'ej: x^2*y + sin(x*y)',  usesKeyboard: true },
      { key: 'op',  label: 'Operación', placeholder: '',                        usesKeyboard: false, isSelect: true,
        options: [
          'Derivada parcial ∂f/∂x', 'Derivada parcial ∂f/∂y', 'Derivada parcial ∂f/∂z',
          'Derivada parcial de 2º orden ∂²f/∂x²', 'Derivada parcial de 2º orden ∂²f/∂y²', 'Derivada parcial mixta ∂²f/∂x∂y',
          'Gradiente ∇f', 'Matriz Jacobiana', 'Matriz Hessiana', 'Laplaciano ∇²f',
          'Integral Doble ∬ f(x,y) dA', 'Integral Triple ∭ f(x,y,z) dV'
        ] },
    ],
    buildPrompt: (v) => {
      const op = v.op || 'Derivada parcial ∂f/∂x';
      if (op.includes('Integral Doble')) {
        return `Calcula la integral doble de f(x,y) = ${v.fn} con los límites de integración: x en [${v.xa||'a'}, ${v.xb||'b'}], y en [${v.ya||'c'}, ${v.yb||'d'}].
                Muestra el procedimiento de integración iterada paso a paso. Presta atención al orden de integración si los límites son funciones en lugar de constantes.
                IMPORTANTE: Usa LaTeX para todo (inline $...$ y bloques $$...$$).
                Estructura: título "Solución", pasos numerados con texto explicativo + fórmulas LaTeX, resultado final numérico (o expresión) destacado.`;
      }
      if (op.includes('Integral Triple')) {
        return `Calcula la integral triple de f(x,y,z) = ${v.fn} con los límites de integración: x en [${v.xa||'a'}, ${v.xb||'b'}], y en [${v.ya||'c'}, ${v.yb||'d'}], z en [${v.za||'e'}, ${v.zb||'f'}].
                Muestra la integración iterada paso a paso. Presta atención al orden de integración si los límites son funciones (calcula primero las variables dependientes).
                IMPORTANTE: Usa LaTeX para todo (inline $...$ y bloques $$...$$).
                Estructura: título "Solución", pasos numerados con texto explicativo + fórmulas LaTeX, resultado final numérico (o expresión) destacado.`;
      }
      return `Realiza la operación "${op}" sobre f = ${v.fn} paso a paso en español.
       IMPORTANTE: Usa LaTeX: inline $...$ y bloques $$...$$ para fórmulas grandes.
       Aplica la definición/reglas con detalle y da el resultado final en bloque $$.`;
    }
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
      `Calcula "${v.type}" de la función ${v.fn} paso a paso en español.
       IMPORTANTE: Usa LaTeX: inline $...$ y bloques $$...$$ para fórmulas grandes.
       Aplica la tabla de transformadas o definición, muestra cada propiedad y da el resultado final en bloque $$.`,
  },
  algebra: {
    label: 'Calculadora de Álgebra',
    color: 'from-amber-500 to-orange-600',
    fields: [
      { key: 'fn',    label: 'Ecuación / Sistema', placeholder: 'ej: x^2 - 5x + 6 = 0', usesKeyboard: true },
      { key: 'type',  label: 'Tipo', placeholder: '', usesKeyboard: false, isSelect: true,
        options: ['Ecuación Lineal / Sistema', 'Ecuación Cuadrática', 'Ecuación Cúbica', 'Ecuación Exponencial/Logarítmica'] },
    ],
    buildPrompt: (v) =>
      `Resuelve la ${v.type || 'Ecuación'}: ${v.fn} paso a paso en español.
       IMPORTANTE: Usa LaTeX: inline $...$ y bloques $$...$$ para fórmulas grandes.
       Muestra la aplicación de fórmulas, factorización o propiedades detalladamente y el resultado final de las variables en bloque $$.`,
  },
  implicit3d: {
    label: 'Graficador 3D — Superficies Implícitas',
    color: 'from-sky-500 to-indigo-600',
    fields: [
      { key: 'fn', label: 'F(x, y, z)  →  Se graficará donde F = 0', placeholder: 'ej: x^2 + y^2 + z^2 - 9  →  esfera  |  sqrt(x^2+z^2) - y  →  cono  |  x^2 - y^2 - z  →  silla', usesKeyboard: true },
    ],
    buildPrompt: (v) =>
      `Describe la superficie implícita definida por F(x,y,z) = 0 donde F = ${v.fn}.
       Identifica el tipo de superficie (esfera, cono, hiperboloide, paraboloide, etc.) y sus parámetros principales.
       IMPORTANTE: Usa LaTeX: inline $...$ y bloques $$...$$ para fórmulas grandes.`,
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
          <MathRenderer text={result} />
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
    if (!values[kbdField?.key]?.trim()) {
      setError('Por favor ingresa la función o ecuación.');
      return;
    }
    setError(null);
    setResult(null);
    setLoading(true);
    const prompt = cfg.buildPrompt(values);
    const isGhPages = typeof window !== 'undefined' && window.location.hostname.includes('github.io');
    const API_URL = import.meta.env.VITE_API_URL || (isGhPages ? 'https://met-num.onrender.com/api' : '/api');
    try {
      const response = await fetch(`${API_URL}/solve-prompt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      if (!response.ok) {
        throw new Error('Error al conectar con la IA');
      }
      const data = await response.json();
      setResult(data.result);
    } catch (e) {
      setError('Error al procesar el cálculo con IA. Revisa tu conexión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      {/* header */}
      <div className={`bg-gradient-to-r ${cfg.color} px-5 py-3 print:hidden`}>
        <h2 className="text-white font-bold text-sm">{cfg.label}</h2>
      </div>

      <div className="p-5 space-y-4">
        {/* campos */}
        <div className="space-y-4 print:hidden">
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

        {/* Dynamic limits for Multivariable Integrals */}
        {topicId === 'multivariable' && (values.op || '').includes('Integral Doble') && (
          <div className="grid grid-cols-2 gap-4 pt-2">
             <div>
               <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Límites x [a, b]</label>
               <div className="flex gap-2">
                 <Input className="h-9 text-xs" placeholder="a" value={values.xa||''} onChange={e=>setValues(v=>({...v,xa:e.target.value}))} />
                 <Input className="h-9 text-xs" placeholder="b" value={values.xb||''} onChange={e=>setValues(v=>({...v,xb:e.target.value}))} />
               </div>
             </div>
             <div>
               <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Límites y [c, d]</label>
               <div className="flex gap-2">
                 <Input className="h-9 text-xs" placeholder="c" value={values.ya||''} onChange={e=>setValues(v=>({...v,ya:e.target.value}))} />
                 <Input className="h-9 text-xs" placeholder="d" value={values.yb||''} onChange={e=>setValues(v=>({...v,yb:e.target.value}))} />
               </div>
             </div>
          </div>
        )}
        {topicId === 'multivariable' && (values.op || '').includes('Integral Triple') && (
          <div className="grid grid-cols-3 gap-3 pt-2">
             <div>
               <label className="block text-xs font-semibold text-muted-foreground mb-1.5">x [a, b]</label>
               <div className="flex gap-1">
                 <Input className="h-9 text-xs" placeholder="a" value={values.xa||''} onChange={e=>setValues(v=>({...v,xa:e.target.value}))} />
                 <Input className="h-9 text-xs" placeholder="b" value={values.xb||''} onChange={e=>setValues(v=>({...v,xb:e.target.value}))} />
               </div>
             </div>
             <div>
               <label className="block text-xs font-semibold text-muted-foreground mb-1.5">y [c, d]</label>
               <div className="flex gap-1">
                 <Input className="h-9 text-xs" placeholder="c" value={values.ya||''} onChange={e=>setValues(v=>({...v,ya:e.target.value}))} />
                 <Input className="h-9 text-xs" placeholder="d" value={values.yb||''} onChange={e=>setValues(v=>({...v,yb:e.target.value}))} />
               </div>
             </div>
             <div>
               <label className="block text-xs font-semibold text-muted-foreground mb-1.5">z [e, f]</label>
               <div className="flex gap-1">
                 <Input className="h-9 text-xs" placeholder="e" value={values.za||''} onChange={e=>setValues(v=>({...v,za:e.target.value}))} />
                 <Input className="h-9 text-xs" placeholder="f" value={values.zb||''} onChange={e=>setValues(v=>({...v,zb:e.target.value}))} />
               </div>
             </div>
          </div>
        )}

        {/* teclado matemático */}
        {kbdField && (
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowKbd(!showKbd)}
              className="flex items-center gap-1.5 text-[11px] font-semibold text-primary hover:underline"
            >
              <Keyboard className="w-3.5 h-3.5" />
              {showKbd ? 'Ocultar teclado matemático' : 'Mostrar teclado matemático'}
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
        </div>

        {result && (
          <>
            <ResultBox result={result} />
            <ResultActions 
              module="Formulario de Cálculo" 
              method={cfg.label} 
              problemSetup={values} 
              resultData={{ output: result }} 
            />
          </>
        )}
      </div>
    </div>
  );
}