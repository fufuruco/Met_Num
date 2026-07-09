import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Play } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { trapezoidal, simpson13, simpson38, finiteDifferences } from '@/lib/integrationMethods';
import StepByStep from '@/components/shared/StepByStep';
import ResultBanner from '@/components/shared/ResultBanner';
import FunctionChart from '@/components/shared/FunctionChart';
import IterationTable from '@/components/shared/IterationTable';
import TheorySection from '@/components/shared/TheorySection';

const theories = {
  trapezoidal: {
    title: 'Regla del Trapecio',
    description: 'Aproxima el área bajo la curva dividiendo el intervalo en subintervalos y calculando el área de trapecios formados bajo la curva.',
    formula: 'I = (h/2) · [f(x₀) + 2·Σf(xᵢ) + f(xₙ)]',
    advantages: ['Simple de implementar', 'Funciona bien con funciones suaves'],
    disadvantages: ['Menor precisión que Simpson', 'Error O(h²)'],
  },
  simpson13: {
    title: 'Simpson 1/3',
    description: 'Aproxima la función con polinomios de grado 2 (parábolas) en cada par de subintervalos.',
    formula: 'I = (h/3) · [f(x₀) + 4·f(x₁) + 2·f(x₂) + ... + f(xₙ)]',
    advantages: ['Mayor precisión que Trapecio', 'Error O(h⁴)', 'Ideal para funciones suaves'],
    disadvantages: ['Requiere n par', 'No funciona bien con discontinuidades'],
  },
  simpson38: {
    title: 'Simpson 3/8',
    description: 'Utiliza polinomios de grado 3 (cúbicos) para la aproximación, requiriendo subintervalos múltiplos de 3.',
    formula: 'I = (3h/8) · [f(x₀) + 3·f(x₁) + 3·f(x₂) + 2·f(x₃) + ...]',
    advantages: ['Mayor precisión que Simpson 1/3', 'Usa interpolación cúbica'],
    disadvantages: ['Requiere n múltiplo de 3', 'Más complejo'],
  },
  finiteDiff: {
    title: 'Diferencias Finitas',
    description: 'Aproxima las derivadas de una función usando valores de la función en puntos cercanos. Incluye diferencias hacia adelante, hacia atrás y central.',
    formula: "f'(x) ≈ [f(x+h) - f(x-h)] / 2h (central)",
    advantages: ['Calcula derivadas sin conocer la fórmula analítica', 'Múltiples esquemas disponibles'],
    disadvantages: ['Error depende de h', 'Sensible a errores de redondeo'],
  },
};

export default function Integration() {
  const [tab, setTab] = useState('trapezoidal');
  const [expr, setExpr] = useState('x^2');
  const [a, setA] = useState('0');
  const [b, setB] = useState('1');
  const [n, setN] = useState('10');
  const [x, setX] = useState('1');
  const [h, setH] = useState('0.1');
  const [result, setResult] = useState(null);

  const solve = () => {
    let res;
    switch (tab) {
      case 'trapezoidal': res = trapezoidal(expr, parseFloat(a), parseFloat(b), parseInt(n)); break;
      case 'simpson13': res = simpson13(expr, parseFloat(a), parseFloat(b), parseInt(n)); break;
      case 'simpson38': res = simpson38(expr, parseFloat(a), parseFloat(b), parseInt(n)); break;
      case 'finiteDiff': res = finiteDifferences(expr, parseFloat(x), parseFloat(h)); break;
    }
    setResult(res);
  };

  const isIntegration = tab !== 'finiteDiff';

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/" className="p-2 rounded-lg hover:bg-muted transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          <TrendingUp className="w-4 h-4 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-lg">Integración y Derivación Numérica</h1>
          <p className="text-xs text-muted-foreground">Aproximaciones numéricas</p>
        </div>
      </div>

      <Tabs value={tab} onValueChange={v => { setTab(v); setResult(null); }}>
        <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50 p-1.5 rounded-xl mb-6">
          <TabsTrigger value="trapezoidal" className="text-xs px-3 py-2 rounded-lg">Trapecio</TabsTrigger>
          <TabsTrigger value="simpson13" className="text-xs px-3 py-2 rounded-lg">Simpson 1/3</TabsTrigger>
          <TabsTrigger value="simpson38" className="text-xs px-3 py-2 rounded-lg">Simpson 3/8</TabsTrigger>
          <TabsTrigger value="finiteDiff" className="text-xs px-3 py-2 rounded-lg">Dif. Finitas</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-5">
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold text-sm mb-4">{theories[tab].title}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="sm:col-span-2 lg:col-span-3">
              <Label className="text-xs mb-1.5 block">f(x) =</Label>
              <Input value={expr} onChange={e => setExpr(e.target.value)} className="math-input" />
            </div>
            {isIntegration ? (
              <>
                <div>
                  <Label className="text-xs mb-1.5 block">a (límite inferior)</Label>
                  <Input type="number" value={a} onChange={e => setA(e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs mb-1.5 block">b (límite superior)</Label>
                  <Input type="number" value={b} onChange={e => setB(e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs mb-1.5 block">n (subintervalos)</Label>
                  <Input type="number" value={n} onChange={e => setN(e.target.value)} />
                </div>
              </>
            ) : (
              <>
                <div>
                  <Label className="text-xs mb-1.5 block">x (punto)</Label>
                  <Input type="number" value={x} onChange={e => setX(e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs mb-1.5 block">h (paso)</Label>
                  <Input type="number" value={h} onChange={e => setH(e.target.value)} step="0.01" />
                </div>
              </>
            )}
          </div>
          <Button onClick={solve} className="mt-5 gap-2">
            <Play className="w-4 h-4" /> Calcular
          </Button>
        </div>

        {result && result.error && <ResultBanner result={result} />}

        {result && !result.error && (
          <>
            {result.result !== undefined && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-4">
                <p className="text-sm font-semibold text-emerald-800">Resultado de la integral</p>
                <p className="font-mono text-2xl font-bold text-emerald-900 mt-1">I ≈ {result.result.toFixed(8)}</p>
              </div>
            )}
            {result.forward !== undefined && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-4 space-y-2">
                <p className="text-sm font-semibold text-emerald-800">Derivadas aproximadas</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white rounded-lg px-4 py-2 border border-emerald-200">
                    <span className="text-xs text-emerald-600">Adelante</span>
                    <p className="font-mono font-bold text-emerald-900">{result.forward.toFixed(6)}</p>
                  </div>
                  <div className="bg-white rounded-lg px-4 py-2 border border-emerald-200">
                    <span className="text-xs text-emerald-600">Atrás</span>
                    <p className="font-mono font-bold text-emerald-900">{result.backward.toFixed(6)}</p>
                  </div>
                  <div className="bg-white rounded-lg px-4 py-2 border border-emerald-200">
                    <span className="text-xs text-emerald-600">Central</span>
                    <p className="font-mono font-bold text-emerald-900">{result.central.toFixed(6)}</p>
                  </div>
                  <div className="bg-white rounded-lg px-4 py-2 border border-emerald-200">
                    <span className="text-xs text-emerald-600">2ª derivada</span>
                    <p className="font-mono font-bold text-emerald-900">{result.second.toFixed(6)}</p>
                  </div>
                </div>
              </div>
            )}
            {result.tableRows && (
              <IterationTable
                columns={[
                  { key: 'i', label: 'i' },
                  { key: 'x', label: 'xᵢ' },
                  { key: 'fx', label: 'f(xᵢ)' },
                  ...(result.tableRows[0]?.coeff !== undefined ? [{ key: 'coeff', label: 'Coef.' }] : []),
                ]}
                data={result.tableRows}
              />
            )}
            <StepByStep steps={result.steps} />
            {isIntegration && (
              <FunctionChart expr={expr} xMin={parseFloat(a) - 0.5} xMax={parseFloat(b) + 0.5} />
            )}
          </>
        )}

        <TheorySection {...theories[tab]} />
      </div>
    </div>
  );
}