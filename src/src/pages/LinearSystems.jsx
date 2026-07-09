import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, GitBranch, Play } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { gaussElimination, gaussJordan, luDecomposition, jacobi, gaussSeidel } from '@/lib/linearSystemMethods';
import StepByStep from '@/components/shared/StepByStep';
import ResultBanner from '@/components/shared/ResultBanner';
import IterationTable from '@/components/shared/IterationTable';

const methods = [
  { id: 'gauss', label: 'Gauss' },
  { id: 'gaussJordan', label: 'Gauss-Jordan' },
  { id: 'lu', label: 'LU' },
  { id: 'jacobi', label: 'Jacobi' },
  { id: 'gaussSeidel', label: 'Gauss-Seidel' },
];

export default function LinearSystems() {
  const [tab, setTab] = useState('gauss');
  const [n, setN] = useState(3);
  const [matA, setMatA] = useState([[2, 1, -1], [-3, -1, 2], [-2, 1, 2]]);
  const [vecB, setVecB] = useState([8, -11, -3]);
  const [tol, setTol] = useState('0.0001');
  const [maxIter, setMaxIter] = useState('100');
  const [result, setResult] = useState(null);

  const resize = (newN) => {
    setN(newN);
    setMatA(Array.from({ length: newN }, (_, i) => Array.from({ length: newN }, (_, j) => matA[i]?.[j] ?? 0)));
    setVecB(Array.from({ length: newN }, (_, i) => vecB[i] ?? 0));
    setResult(null);
  };

  const updateA = (i, j, val) => {
    const copy = matA.map(r => [...r]);
    copy[i][j] = parseFloat(val) || 0;
    setMatA(copy);
  };

  const updateB = (i, val) => {
    const copy = [...vecB];
    copy[i] = parseFloat(val) || 0;
    setVecB(copy);
  };

  const solve = () => {
    let res;
    const isIterative = tab === 'jacobi' || tab === 'gaussSeidel';
    const x0 = Array(n).fill(0);
    switch (tab) {
      case 'gauss': res = gaussElimination(matA, vecB); break;
      case 'gaussJordan': res = gaussJordan(matA, vecB); break;
      case 'lu': res = luDecomposition(matA, vecB); break;
      case 'jacobi': res = jacobi(matA, vecB, x0, parseFloat(tol), parseInt(maxIter)); break;
      case 'gaussSeidel': res = gaussSeidel(matA, vecB, x0, parseFloat(tol), parseInt(maxIter)); break;
    }
    setResult(res);
  };

  const isIterative = tab === 'jacobi' || tab === 'gaussSeidel';

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/" className="p-2 rounded-lg hover:bg-muted transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
          <GitBranch className="w-4 h-4 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-lg">Sistemas de Ecuaciones Lineales</h1>
          <p className="text-xs text-muted-foreground">Ax = b</p>
        </div>
      </div>

      <Tabs value={tab} onValueChange={v => { setTab(v); setResult(null); }}>
        <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50 p-1.5 rounded-xl mb-6">
          {methods.map(m => (
            <TabsTrigger key={m.id} value={m.id} className="text-xs px-3 py-2 rounded-lg">{m.label}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="space-y-5">
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex flex-wrap gap-4 mb-5 items-end">
            <div>
              <Label className="text-xs mb-1.5 block">Tamaño del sistema (n)</Label>
              <Input type="number" min={2} max={6} value={n} onChange={e => resize(parseInt(e.target.value) || 2)} className="w-20" />
            </div>
            {isIterative && (
              <>
                <div>
                  <Label className="text-xs mb-1.5 block">Tolerancia</Label>
                  <Input type="number" value={tol} onChange={e => setTol(e.target.value)} className="w-32" step="0.0001" />
                </div>
                <div>
                  <Label className="text-xs mb-1.5 block">Max iteraciones</Label>
                  <Input type="number" value={maxIter} onChange={e => setMaxIter(e.target.value)} className="w-24" />
                </div>
              </>
            )}
          </div>

          <div className="flex flex-wrap gap-6 mb-5">
            <div>
              <Label className="text-xs mb-2 block font-semibold">Matriz A</Label>
              <div className="inline-flex flex-col gap-1 p-3 bg-muted/30 rounded-lg border border-border">
                {Array.from({ length: n }).map((_, i) => (
                  <div key={i} className="flex gap-1">
                    {Array.from({ length: n }).map((_, j) => (
                      <Input key={j} type="number" className="w-16 h-9 text-center math-input text-xs" value={matA[i]?.[j] ?? 0}
                        onChange={e => updateA(i, j, e.target.value)} />
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-xs mb-2 block font-semibold">Vector b</Label>
              <div className="inline-flex flex-col gap-1 p-3 bg-muted/30 rounded-lg border border-border">
                {Array.from({ length: n }).map((_, i) => (
                  <Input key={i} type="number" className="w-16 h-9 text-center math-input text-xs" value={vecB[i] ?? 0}
                    onChange={e => updateB(i, e.target.value)} />
                ))}
              </div>
            </div>
          </div>

          <Button onClick={solve} className="gap-2">
            <Play className="w-4 h-4" /> Resolver
          </Button>
        </div>

        {result && result.error && <ResultBanner result={result} />}

        {result && !result.error && result.result && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-4">
            <p className="text-sm font-semibold text-emerald-800 mb-2">Solución</p>
            <div className="flex flex-wrap gap-4">
              {result.result.map((val, i) => (
                <div key={i} className="bg-white rounded-lg px-4 py-2 border border-emerald-200">
                  <span className="text-xs text-emerald-600">x{i + 1}</span>
                  <p className="font-mono font-bold text-emerald-900">{val.toFixed(6)}</p>
                </div>
              ))}
            </div>
            {result.iterations && <p className="text-sm text-emerald-700 mt-2">Convergió en {result.iterations} iteraciones</p>}
          </div>
        )}

        {result && result.steps && (
          <StepByStep steps={typeof result.steps[0] === 'string' ? result.steps.map(s => s) : result.steps} />
        )}

        {isIterative && result && result.steps && result.steps[0]?.i && (
          <IterationTable
            columns={[
              { key: 'i', label: 'Iter' },
              ...Array.from({ length: n }, (_, i) => ({ key: `x${i}`, label: `x${i + 1}` })),
              { key: 'error', label: 'Error' },
            ]}
            data={result.steps.map(s => ({
              i: s.i,
              ...Object.fromEntries(s.x.map((v, idx) => [`x${idx}`, v])),
              error: s.error,
            }))}
          />
        )}
      </div>
    </div>
  );
}