import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Sigma, Play } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { euler, eulerImproved, rungeKutta2, rungeKutta4 } from '@/lib/odeMethods';
import StepByStep from '@/components/shared/StepByStep';
import IterationTable from '@/components/shared/IterationTable';
import FunctionChart from '@/components/shared/FunctionChart';
import TheorySection from '@/components/shared/TheorySection';

const theories = {
  euler: {
    title: 'Método de Euler',
    description: 'El método más simple para resolver EDOs. Aproxima la solución usando la pendiente en el punto actual para avanzar un paso.',
    formula: 'yᵢ₊₁ = yᵢ + h·f(xᵢ, yᵢ)',
    advantages: ['Muy simple de implementar', 'Intuitivo y fácil de entender'],
    disadvantages: ['Baja precisión (error O(h))', 'Puede ser inestable con pasos grandes'],
  },
  eulerImproved: {
    title: 'Método de Euler Mejorado (Heun)',
    description: 'Mejora el método de Euler usando un predictor-corrector: primero predice con Euler, luego corrige promediando las pendientes.',
    formula: 'yᵢ₊₁ = yᵢ + (h/2)·[f(xᵢ, yᵢ) + f(xᵢ₊₁, y*)]',
    advantages: ['Más preciso que Euler (error O(h²))', 'Relativamente simple'],
    disadvantages: ['Dos evaluaciones de f por paso', 'Aún puede acumular error'],
  },
  rk2: {
    title: 'Runge-Kutta de 2° Orden',
    description: 'Utiliza dos evaluaciones de la función para lograr mayor precisión que Euler, equivalente al método del punto medio.',
    formula: 'yᵢ₊₁ = yᵢ + (k₁ + k₂)/2',
    advantages: ['Buena relación precisión/costo', 'Error O(h²)'],
    disadvantages: ['Menos preciso que RK4', 'Dos evaluaciones por paso'],
  },
  rk4: {
    title: 'Runge-Kutta de 4° Orden',
    description: 'El método más popular para EDOs. Usa cuatro evaluaciones por paso para lograr alta precisión con error O(h⁴).',
    formula: 'yᵢ₊₁ = yᵢ + (k₁ + 2k₂ + 2k₃ + k₄)/6',
    advantages: ['Alta precisión (error O(h⁴))', 'Estable y robusto', 'Estándar de la industria'],
    disadvantages: ['Cuatro evaluaciones por paso', 'Más costoso computacionalmente'],
  },
};

const tableCols = {
  euler: [
    { key: 'i', label: 'Paso' }, { key: 'x', label: 'x' }, { key: 'y', label: 'y' }, { key: 'fxy', label: "f(x,y)" }, { key: 'yNew', label: 'y nuevo' },
  ],
  eulerImproved: [
    { key: 'i', label: 'Paso' }, { key: 'x', label: 'x' }, { key: 'y', label: 'y' }, { key: 'k1', label: 'k1' }, { key: 'k2', label: 'k2' }, { key: 'yNew', label: 'y nuevo' },
  ],
  rk2: [
    { key: 'i', label: 'Paso' }, { key: 'x', label: 'x' }, { key: 'y', label: 'y' }, { key: 'k1', label: 'k1' }, { key: 'k2', label: 'k2' }, { key: 'yNew', label: 'y nuevo' },
  ],
  rk4: [
    { key: 'i', label: 'Paso' }, { key: 'x', label: 'x' }, { key: 'y', label: 'y' },
    { key: 'k1', label: 'k1' }, { key: 'k2', label: 'k2' }, { key: 'k3', label: 'k3' }, { key: 'k4', label: 'k4' }, { key: 'yNew', label: 'y nuevo' },
  ],
};

export default function ODE() {
  const [tab, setTab] = useState('euler');
  const [expr, setExpr] = useState('x + y');
  const [x0, setX0] = useState('0');
  const [y0, setY0] = useState('1');
  const [xEnd, setXEnd] = useState('1');
  const [h, setH] = useState('0.1');
  const [result, setResult] = useState(null);

  const solve = () => {
    const args = [expr, parseFloat(x0), parseFloat(y0), parseFloat(xEnd), parseFloat(h)];
    let res;
    switch (tab) {
      case 'euler': res = euler(...args); break;
      case 'eulerImproved': res = eulerImproved(...args); break;
      case 'rk2': res = rungeKutta2(...args); break;
      case 'rk4': res = rungeKutta4(...args); break;
    }
    setResult(res);
  };

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/" className="p-2 rounded-lg hover:bg-muted transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
          <Sigma className="w-4 h-4 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-lg">Ecuaciones Diferenciales Ordinarias</h1>
          <p className="text-xs text-muted-foreground">dy/dx = f(x, y)</p>
        </div>
      </div>

      <Tabs value={tab} onValueChange={v => { setTab(v); setResult(null); }}>
        <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50 p-1.5 rounded-xl mb-6">
          <TabsTrigger value="euler" className="text-xs px-3 py-2 rounded-lg">Euler</TabsTrigger>
          <TabsTrigger value="eulerImproved" className="text-xs px-3 py-2 rounded-lg">Euler Mejorado</TabsTrigger>
          <TabsTrigger value="rk2" className="text-xs px-3 py-2 rounded-lg">RK2</TabsTrigger>
          <TabsTrigger value="rk4" className="text-xs px-3 py-2 rounded-lg">RK4</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-5">
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold text-sm mb-4">{theories[tab].title}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="sm:col-span-2 lg:col-span-3">
              <Label className="text-xs mb-1.5 block">dy/dx = f(x, y) =</Label>
              <Input value={expr} onChange={e => setExpr(e.target.value)} className="math-input" placeholder="x + y" />
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">x₀</Label>
              <Input type="number" value={x0} onChange={e => setX0(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">y₀</Label>
              <Input type="number" value={y0} onChange={e => setY0(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">x final</Label>
              <Input type="number" value={xEnd} onChange={e => setXEnd(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">h (paso)</Label>
              <Input type="number" value={h} onChange={e => setH(e.target.value)} step="0.01" />
            </div>
          </div>
          <Button onClick={solve} className="mt-5 gap-2">
            <Play className="w-4 h-4" /> Resolver
          </Button>
        </div>

        {result && result.points && (
          <>
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-4">
              <p className="text-sm font-semibold text-emerald-800">Valor final</p>
              <p className="font-mono text-lg font-bold text-emerald-900 mt-1">
                y({result.points[result.points.length - 1].x.toFixed(4)}) ≈ {result.points[result.points.length - 1].y.toFixed(8)}
              </p>
              <p className="text-xs text-emerald-700 mt-1">{result.steps.length} pasos calculados</p>
            </div>

            <IterationTable columns={tableCols[tab]} data={result.steps} />

            <StepByStep steps={result.steps} />

            <FunctionChart
              points={result.points}
              xMin={parseFloat(x0)}
              xMax={parseFloat(xEnd)}
              yLabel="y(x)"
            />
          </>
        )}

        <TheorySection {...theories[tab]} />
      </div>
    </div>
  );
}