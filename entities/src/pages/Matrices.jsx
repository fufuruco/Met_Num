import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Grid3X3 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play } from 'lucide-react';
import { addMatrices, subtractMatrices, multiplyMatrices, determinant, inverse, transpose } from '@/lib/matrixMethods';
import StepByStep from '@/components/shared/StepByStep';
import ResultBanner from '@/components/shared/ResultBanner';

function MatrixInput({ label, rows, cols, matrix, onChange }) {
  return (
    <div>
      <Label className="text-xs mb-2 block font-semibold">{label}</Label>
      <div className="inline-flex flex-col gap-1 p-3 bg-muted/30 rounded-lg border border-border">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-1">
            {Array.from({ length: cols }).map((_, j) => (
              <Input
                key={j}
                type="number"
                className="w-16 h-9 text-center math-input text-xs"
                value={matrix[i]?.[j] ?? 0}
                onChange={e => {
                  const val = parseFloat(e.target.value) || 0;
                  const copy = matrix.map(r => [...r]);
                  if (!copy[i]) copy[i] = Array(cols).fill(0);
                  copy[i][j] = val;
                  onChange(copy);
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function MatrixDisplay({ label, matrix }) {
  if (!matrix) return null;
  return (
    <div>
      <Label className="text-xs mb-2 block font-semibold">{label}</Label>
      <div className="inline-flex flex-col gap-1 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
        {matrix.map((row, i) => (
          <div key={i} className="flex gap-1">
            {row.map((val, j) => (
              <div key={j} className="w-16 h-9 flex items-center justify-center text-xs font-mono font-bold text-emerald-800">
                {typeof val === 'number' ? val.toFixed(4) : val}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Matrices() {
  const [tab, setTab] = useState('binary');
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [matA, setMatA] = useState(Array.from({ length: 3 }, () => Array(3).fill(0)));
  const [matB, setMatB] = useState(Array.from({ length: 3 }, () => Array(3).fill(0)));
  const [operation, setOperation] = useState('add');
  const [result, setResult] = useState(null);

  const resizeMat = (mat, r, c) => {
    return Array.from({ length: r }, (_, i) => Array.from({ length: c }, (_, j) => mat[i]?.[j] ?? 0));
  };

  const handleResize = (r, c) => {
    setRows(r); setCols(c);
    setMatA(resizeMat(matA, r, c));
    setMatB(resizeMat(matB, r, c));
    setResult(null);
  };

  const solve = () => {
    let res;
    switch (operation) {
      case 'add': res = addMatrices(matA, matB); break;
      case 'subtract': res = subtractMatrices(matA, matB); break;
      case 'multiply': res = multiplyMatrices(matA, matB); break;
      case 'determinant': res = determinant(matA); break;
      case 'inverse': res = inverse(matA); break;
      case 'transpose': res = transpose(matA); break;
    }
    setResult(res);
  };

  const isBinary = ['add', 'subtract', 'multiply'].includes(operation);

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/" className="p-2 rounded-lg hover:bg-muted transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
          <Grid3X3 className="w-4 h-4 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-lg">Cálculo Matricial</h1>
          <p className="text-xs text-muted-foreground">Operaciones con matrices</p>
        </div>
      </div>

      <div className="space-y-5">
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex flex-wrap gap-4 mb-5 items-end">
            <div>
              <Label className="text-xs mb-1.5 block">Operación</Label>
              <Select value={operation} onValueChange={v => { setOperation(v); setResult(null); }}>
                <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="add">Suma (A + B)</SelectItem>
                  <SelectItem value="subtract">Resta (A - B)</SelectItem>
                  <SelectItem value="multiply">Multiplicación (A × B)</SelectItem>
                  <SelectItem value="determinant">Determinante (det A)</SelectItem>
                  <SelectItem value="inverse">Inversa (A⁻¹)</SelectItem>
                  <SelectItem value="transpose">Transpuesta (Aᵀ)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">Filas</Label>
              <Input type="number" min={1} max={6} value={rows} onChange={e => handleResize(parseInt(e.target.value) || 1, cols)} className="w-20" />
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">Columnas</Label>
              <Input type="number" min={1} max={6} value={cols} onChange={e => handleResize(rows, parseInt(e.target.value) || 1)} className="w-20" />
            </div>
          </div>

          <div className="flex flex-wrap gap-8 mb-5">
            <MatrixInput label="Matriz A" rows={rows} cols={cols} matrix={matA} onChange={setMatA} />
            {isBinary && (
              <MatrixInput label="Matriz B" rows={rows} cols={cols} matrix={matB} onChange={setMatB} />
            )}
          </div>

          <Button onClick={solve} className="gap-2">
            <Play className="w-4 h-4" /> Calcular
          </Button>
        </div>

        {result && result.error && <ResultBanner result={result} />}

        {result && !result.error && (
          <>
            {result.result !== undefined && typeof result.result === 'number' ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-4">
                <p className="text-sm font-semibold text-emerald-800">Resultado</p>
                <p className="font-mono text-2xl font-bold text-emerald-900 mt-1">{result.result.toFixed(6)}</p>
              </div>
            ) : result.result ? (
              <MatrixDisplay label="Resultado" matrix={result.result} />
            ) : null}
            <StepByStep steps={result.steps} />
          </>
        )}
      </div>
    </div>
  );
}