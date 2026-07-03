import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import MathInput from '@/components/shared/MathInput';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';
import { bisection, regulaFalsi, newtonRaphson, secant, fixedPoint } from '@/lib/nonLinearMethods';
import ResultBanner from '@/components/shared/ResultBanner';
import IterationTable from '@/components/shared/IterationTable';
import StepByStep from '@/components/shared/StepByStep';
import FunctionChart from '@/components/shared/FunctionChart';
import TheorySection from '@/components/shared/TheorySection';

const theoryData = {
  bisection: {
    title: 'Método de Bisección',
    description: 'Es un método numérico que permite aproximar la raíz de una función continua mediante la división sucesiva del intervalo donde existe un cambio de signo. Es el método más simple y robusto para encontrar raíces.',
    formula: 'xr = (a + b) / 2',
    advantages: ['Muy estable y confiable', 'Fácil de implementar', 'Siempre converge si existe cambio de signo'],
    disadvantages: ['Convergencia lenta (lineal)', 'Requiere un intervalo con cambio de signo', 'Puede requerir muchas iteraciones'],
  },
  regulaFalsi: {
    title: 'Método de Regula Falsi (Regla Falsa)',
    description: 'Similar a bisección pero en lugar de tomar el punto medio, traza una línea recta entre f(a) y f(b) y toma como aproximación donde esta recta cruza el eje x.',
    formula: 'xr = a - f(a)·(b - a) / (f(b) - f(a))',
    advantages: ['Más rápido que bisección generalmente', 'Siempre converge con cambio de signo', 'Combina bisección con interpolación'],
    disadvantages: ['Puede ser lento en funciones con curvatura pronunciada', 'Un extremo puede quedar fijo (estancamiento)'],
  },
  newton: {
    title: 'Método de Newton-Raphson',
    description: 'Utiliza la derivada de la función para aproximar la raíz mediante la tangente en cada punto. Es uno de los métodos más rápidos cuando converge.',
    formula: 'xi+1 = xi - f(xi) / f\'(xi)',
    advantages: ['Convergencia cuadrática (muy rápido)', 'Eficiente para funciones suaves'],
    disadvantages: ['Requiere la derivada de la función', 'Puede divergir con mal punto inicial', 'Falla si f\'(x) = 0'],
  },
  secant: {
    title: 'Método de la Secante',
    description: 'Similar a Newton-Raphson pero aproxima la derivada usando dos puntos previos, eliminando la necesidad de calcular la derivada analíticamente.',
    formula: 'xi+1 = xi - f(xi)·(xi - xi-1) / (f(xi) - f(xi-1))',
    advantages: ['No requiere la derivada', 'Convergencia superlineal (orden ~1.618)', 'Más rápido que bisección'],
    disadvantages: ['Puede divergir', 'Necesita dos valores iniciales', 'No garantiza convergencia'],
  },
  fixedPoint: {
    title: 'Método de Punto Fijo',
    description: 'Transforma la ecuación f(x)=0 en x = g(x) y realiza iteraciones sucesivas. Converge si |g\'(x)| < 1 en la vecindad de la raíz.',
    formula: 'xi+1 = g(xi)',
    advantages: ['Concepto simple e intuitivo', 'Útil para ciertos tipos de ecuaciones'],
    disadvantages: ['No siempre converge', 'Requiere transformar f(x) a g(x) adecuadamente', 'Convergencia depende de la elección de g(x)'],
  },
};

const defaultInputs = {
  bisection: { expr: 'x^3 - 2*x - 5', a: '1', b: '3', tol: '0.0001', maxIter: '100' },
  regulaFalsi: { expr: 'x^3 - 2*x - 5', a: '1', b: '3', tol: '0.0001', maxIter: '100' },
  newton: { expr: 'x^3 - 2*x - 5', x0: '2', tol: '0.0001', maxIter: '100' },
  secant: { expr: 'x^3 - 2*x - 5', x0: '1', x1: '3', tol: '0.0001', maxIter: '100' },
  fixedPoint: { expr: 'x^3 - 2*x - 5', gExpr: '(2*x + 5)^(1/3)', x0: '2', tol: '0.0001', maxIter: '100' },
};

const tableColumns = {
  bisection: [
    { key: 'i', label: 'Iter' }, { key: 'a', label: 'a' }, { key: 'b', label: 'b' },
    { key: 'xr', label: 'xr' }, { key: 'fxr', label: 'f(xr)' }, { key: 'error', label: 'Error %' },
  ],
  regulaFalsi: [
    { key: 'i', label: 'Iter' }, { key: 'a', label: 'a' }, { key: 'b', label: 'b' },
    { key: 'xr', label: 'xr' }, { key: 'fxr', label: 'f(xr)' }, { key: 'error', label: 'Error %' },
  ],
  newton: [
    { key: 'i', label: 'Iter' }, { key: 'xi', label: 'xi' }, { key: 'fxi', label: 'f(xi)' },
    { key: 'fpxi', label: "f'(xi)" }, { key: 'xiNew', label: 'xi+1' }, { key: 'error', label: 'Error %' },
  ],
  secant: [
    { key: 'i', label: 'Iter' }, { key: 'xiPrev', label: 'xi-1' }, { key: 'xi', label: 'xi' },
    { key: 'xiNew', label: 'xi+1' }, { key: 'error', label: 'Error %' },
  ],
  fixedPoint: [
    { key: 'i', label: 'Iter' }, { key: 'xi', label: 'xi' }, { key: 'gxi', label: 'g(xi)' },
    { key: 'fxi', label: 'f(xi)' }, { key: 'error', label: 'Error %' },
  ],
};

export default function NonLinearMethod({ methodId, methodName }) {
  const [inputs, setInputs] = useState(defaultInputs[methodId]);
  const [result, setResult] = useState(null);

  const update = (key, val) => setInputs(prev => ({ ...prev, [key]: val }));

  const solve = () => {
    const tol = parseFloat(inputs.tol);
    const maxIter = parseInt(inputs.maxIter);
    let res;
    switch (methodId) {
      case 'bisection':
        res = bisection(inputs.expr, parseFloat(inputs.a), parseFloat(inputs.b), tol, maxIter);
        break;
      case 'regulaFalsi':
        res = regulaFalsi(inputs.expr, parseFloat(inputs.a), parseFloat(inputs.b), tol, maxIter);
        break;
      case 'newton':
        res = newtonRaphson(inputs.expr, parseFloat(inputs.x0), tol, maxIter);
        break;
      case 'secant':
        res = secant(inputs.expr, parseFloat(inputs.x0), parseFloat(inputs.x1), tol, maxIter);
        break;
      case 'fixedPoint':
        res = fixedPoint(inputs.expr, inputs.gExpr, parseFloat(inputs.x0), tol, maxIter);
        break;
    }
    setResult(res);
  };

  const needsInterval = methodId === 'bisection' || methodId === 'regulaFalsi';
  const needsTwoPoints = methodId === 'secant';
  const isFixedPoint = methodId === 'fixedPoint';
  const theory = theoryData[methodId];

  const parsedA = parseFloat(inputs.a);
  const parsedB = parseFloat(inputs.b);
  const parsedX0 = parseFloat(inputs.x0);

  const chartXMin = needsInterval ? (isNaN(parsedA) ? -10 : parsedA - 1) : (isNaN(parsedX0) ? -10 : parsedX0 - 3);
  const chartXMax = needsInterval ? (isNaN(parsedB) ? 10 : parsedB + 1) : (isNaN(parsedX0) ? 10 : parsedX0 + 3);

  return (
    <div className="space-y-5">
      {/* Input Form */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="font-semibold text-sm mb-4">Datos de entrada — {methodName}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="sm:col-span-2 lg:col-span-3">
            <Label className="text-xs mb-1.5 block">f(x) =</Label>
            <MathInput value={inputs.expr} onChange={val => update('expr', val)} placeholder="x^3 - 2*x - 5" />
          </div>
          {isFixedPoint && (
            <div className="sm:col-span-2 lg:col-span-3">
              <Label className="text-xs mb-1.5 block">g(x) = (función de iteración)</Label>
              <MathInput value={inputs.gExpr} onChange={val => update('gExpr', val)} placeholder="(2*x + 5)^(1/3)" />
            </div>
          )}
          {needsInterval && (
            <>
              <div>
                <Label className="text-xs mb-1.5 block">a (límite inferior)</Label>
                <Input type="number" value={inputs.a} onChange={e => update('a', e.target.value)} />
              </div>
              <div>
                <Label className="text-xs mb-1.5 block">b (límite superior)</Label>
                <Input type="number" value={inputs.b} onChange={e => update('b', e.target.value)} />
              </div>
            </>
          )}
          {(methodId === 'newton' || isFixedPoint) && (
            <div>
              <Label className="text-xs mb-1.5 block">x₀ (valor inicial)</Label>
              <Input type="number" value={inputs.x0} onChange={e => update('x0', e.target.value)} />
            </div>
          )}
          {needsTwoPoints && (
            <>
              <div>
                <Label className="text-xs mb-1.5 block">x₀</Label>
                <Input type="number" value={inputs.x0} onChange={e => update('x0', e.target.value)} />
              </div>
              <div>
                <Label className="text-xs mb-1.5 block">x₁</Label>
                <Input type="number" value={inputs.x1} onChange={e => update('x1', e.target.value)} />
              </div>
            </>
          )}
          <div>
            <Label className="text-xs mb-1.5 block">Tolerancia</Label>
            <Input type="number" value={inputs.tol} onChange={e => update('tol', e.target.value)} step="0.0001" />
          </div>
          <div>
            <Label className="text-xs mb-1.5 block">Iteraciones máximas</Label>
            <Input type="number" value={inputs.maxIter} onChange={e => update('maxIter', e.target.value)} />
          </div>
        </div>
        <Button onClick={solve} className="mt-5 gap-2">
          <Play className="w-4 h-4" /> Calcular
        </Button>
      </div>

      {/* Live Chart */}
      <FunctionChart
        expr={inputs.expr}
        xMin={chartXMin}
        xMax={chartXMax}
        roots={result?.root !== undefined ? [result.root] : []}
      />

      {/* Results */}
      <ResultBanner result={result} />

      {result && !result.error && (
        <>
          <IterationTable columns={tableColumns[methodId]} data={result.steps} />
          <StepByStep steps={result.steps} />
        </>
      )}

      <TheorySection {...theory} />
    </div>
  );
}