import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BarChart2, Play, Table, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { analyzeStatistics, fitRegression } from '@/lib/statisticsMethods';
import ResultBanner from '@/components/shared/ResultBanner';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ComposedChart, Scatter, Line, Legend
} from 'recharts';

export default function Statistics() {
  const [activeModule, setActiveModule] = useState('descriptive');

  // Descriptive state
  const [inputData, setInputData] = useState('12, 15, 12, 18, 20, 22, 18, 15, 12, 13, 14, 15, 18, 20');
  const [result, setResult] = useState(null);

  // Regression state
  const [inputX, setInputX] = useState('1, 2, 3, 4, 5, 6, 7');
  const [inputY, setInputY] = useState('2.2, 3.8, 6.1, 8.0, 10.2, 12.1, 14.3');
  const [resultReg, setResultReg] = useState(null);

  const handleCalculateDescriptive = () => {
    const res = analyzeStatistics(inputData);
    setResult(res);
  };

  const handleCalculateRegression = () => {
    const res = fitRegression(inputX, inputY);
    setResultReg(res);
  };

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link to="/" className="p-2 rounded-lg hover:bg-muted transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center">
          <BarChart2 className="w-4 h-4 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-lg">Análisis Estadístico</h1>
          <p className="text-xs text-muted-foreground">Estadística descriptiva y regresión</p>
        </div>
      </div>

      {/* Tabs principal */}
      <Tabs value={activeModule} onValueChange={setActiveModule} className="space-y-6">
        <TabsList className="bg-muted/50 p-1 rounded-xl w-full sm:w-auto grid sm:flex grid-cols-2">
          <TabsTrigger value="descriptive" className="rounded-lg text-xs font-semibold px-4 py-2">
            Estadística Descriptiva
          </TabsTrigger>
          <TabsTrigger value="regression" className="rounded-lg text-xs font-semibold px-4 py-2">
            Regresión y Ajuste
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: ESTADÍSTICA DESCRIPTIVA */}
        <TabsContent value="descriptive" className="space-y-5">
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-sm mb-4 text-slate-800">Ingreso de Datos Brutos</h3>
            <div className="space-y-4">
              <div>
                <Label className="text-xs mb-1.5 block text-slate-600">
                  Ingresa tus datos numéricos (separados por comas, espacios o saltos de línea):
                </Label>
                <textarea
                  value={inputData}
                  onChange={e => setInputData(e.target.value)}
                  placeholder="Ejemplo: 12, 15, 12, 18, 20, 22..."
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 font-mono"
                />
              </div>
              <Button onClick={handleCalculateDescriptive} className="gap-2">
                <Play className="w-4 h-4" /> Calcular Medidas
              </Button>
            </div>
          </div>

          {result && result.error && <ResultBanner result={result} />}

          {result && !result.error && (
            <>
              {/* Tarjetas de Medidas de Tendencia Central y Límites */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Resumen de Medidas Básicas
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-white border border-border rounded-xl p-4 shadow-sm">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Total Datos (N)</span>
                    <p className="text-2xl font-bold text-indigo-600 mt-0.5">{result.n}</p>
                  </div>
                  <div className="bg-white border border-border rounded-xl p-4 shadow-sm">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Media Aritmética (x̄)</span>
                    <p className="text-2xl font-bold text-indigo-600 mt-0.5">{result.mean.toFixed(4)}</p>
                  </div>
                  <div className="bg-white border border-border rounded-xl p-4 shadow-sm">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Mediana</span>
                    <p className="text-2xl font-bold text-emerald-600 mt-0.5">{result.median}</p>
                  </div>
                  <div className="bg-white border border-border rounded-xl p-4 shadow-sm">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Moda</span>
                    <p className="text-sm font-bold text-amber-600 mt-2 truncate" title={result.modeText}>
                      {result.modeText}
                    </p>
                  </div>
                </div>
              </div>

              {/* Rango, Mínimo y Máximo */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white border border-border rounded-xl p-4 shadow-sm text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Valor Mínimo</span>
                  <p className="text-xl font-bold text-slate-700 mt-0.5">{result.min}</p>
                </div>
                <div className="bg-white border border-border rounded-xl p-4 shadow-sm text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Valor Máximo</span>
                  <p className="text-xl font-bold text-slate-700 mt-0.5">{result.max}</p>
                </div>
                <div className="bg-white border border-border rounded-xl p-4 shadow-sm text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Rango (Amplitud)</span>
                  <p className="text-xl font-bold text-slate-700 mt-0.5">{result.range}</p>
                </div>
              </div>

              {/* Varianza y Desviación */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 shadow-sm">
                  <h4 className="font-semibold text-emerald-800 text-sm mb-3">Análisis Muestral (s)</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] text-emerald-600 uppercase font-semibold">Varianza Muestral (s²)</span>
                      <p className="font-mono font-bold text-emerald-950 text-lg mt-0.5">{result.sampleVariance.toFixed(6)}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-emerald-600 uppercase font-semibold">Desv. Estándar Muestral (s)</span>
                      <p className="font-mono font-bold text-emerald-950 text-lg mt-0.5">{result.sampleStDev.toFixed(6)}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-sky-50 border border-sky-200 rounded-xl p-5 shadow-sm">
                  <h4 className="font-semibold text-sky-800 text-sm mb-3">Análisis Poblacional (σ)</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] text-sky-600 uppercase font-semibold">Varianza Poblacional (σ²)</span>
                      <p className="font-mono font-bold text-sky-950 text-lg mt-0.5">{result.popVariance.toFixed(6)}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-sky-600 uppercase font-semibold">Desv. Estándar Poblacional (σ)</span>
                      <p className="font-mono font-bold text-sky-950 text-lg mt-0.5">{result.popStDev.toFixed(6)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabla de Frecuencias Agrupadas (Límites de clase) */}
              {result.intervals && result.intervals.length > 0 && (
                <div className="bg-white border border-border rounded-xl p-5 shadow-sm">
                  <h3 className="font-semibold text-sm mb-4 text-slate-800 flex items-center gap-2">
                    <Table className="w-4 h-4 text-primary" /> Tabla de Frecuencias Agrupadas (Límites de Clase)
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left border-collapse">
                      <thead>
                        <tr className="border-b border-border bg-slate-50 text-[11px] uppercase font-bold text-slate-500">
                          <th className="py-2 px-3">Clase</th>
                          <th className="py-2 px-3">Intervalo de Clase</th>
                          <th className="py-2 px-3 text-center">Marca de Clase (Xi)</th>
                          <th className="py-2 px-3 text-center">Frecuencia Absoluta (fi)</th>
                          <th className="py-2 px-3 text-center">Frecuencia Relativa (hi)</th>
                          <th className="py-2 px-3 text-center">Frecuencia Acumulada (Fi)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.intervals.map(row => (
                          <tr key={row.index} className="border-b border-border hover:bg-slate-50/50">
                            <td className="py-2.5 px-3 font-semibold text-slate-600">{row.index}</td>
                            <td className="py-2.5 px-3 font-mono">{row.label}</td>
                            <td className="py-2.5 px-3 text-center font-mono">{row.mid.toFixed(2)}</td>
                            <td className="py-2.5 px-3 text-center font-bold text-indigo-600">{row.count}</td>
                            <td className="py-2.5 px-3 text-center font-mono">{(row.relFreq * 100).toFixed(1)}%</td>
                            <td className="py-2.5 px-3 text-center font-mono text-slate-600">{row.cumFreq}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Histograma */}
              <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
                <h3 className="font-semibold text-sm mb-4 text-slate-800">
                  {result.intervals && result.intervals.length > 0
                    ? 'Histograma de Frecuencias Agrupadas'
                    : 'Histograma de Frecuencias'}
                </h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={
                        result.intervals && result.intervals.length > 0
                          ? result.intervals.map(i => ({ name: i.label, Frecuencia: i.count }))
                          : Object.entries(result.freqs).map(([val, freq]) => ({ name: val, Frecuencia: freq }))
                      }
                    >
                      <CartesianGrid strokeDasharray="3 3" className="stroke-slate-100" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis allowDecimals={false} />
                      <Tooltip cursor={{ fill: 'rgba(0, 0, 0, 0.03)' }} />
                      <Bar dataKey="Frecuencia" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Procedimiento paso a paso súper premium */}
              <div className="border border-border rounded-xl overflow-hidden bg-white shadow-sm">
                <div className="px-5 py-4 border-b border-border bg-slate-50 flex items-center gap-3">
                  <BarChart2 className="w-5 h-5 text-indigo-600" />
                  <div>
                    <h3 className="font-bold text-base text-indigo-700">Procedimiento Paso a Paso</h3>
                    <p className="text-xs text-slate-500">Cálculos detallados explicados</p>
                  </div>
                </div>
                <div className="p-6 space-y-6">
                  {/* Título Principal Vistoso */}
                  <div>
                    <h2 className="text-xl font-bold bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent mb-1">
                      Análisis Estadístico Descriptivo
                    </h2>
                    <p className="text-sm text-slate-600">
                      Cálculo detallado de las medidas de tendencia central y dispersión para el conjunto de datos ordenados.
                    </p>
                  </div>

                  {/* 1. Datos ordenados */}
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Datos Ordenados</p>
                    <p className="font-mono text-sm text-slate-700 leading-relaxed">[ {result.sorted.join(', ')} ]</p>
                  </div>

                  {/* Variables */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-800 border-b pb-1.5">
                      1. Fórmulas y Medidas de Tendencia Central
                    </h3>

                    {/* N */}
                    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4">
                      <div className="w-24 flex-shrink-0">
                        <span className="font-bold text-base text-sky-600">N</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          Cantidad total de observaciones (número de datos):{' '}
                          <span className="text-indigo-600 font-bold text-base">{result.n}</span>
                        </p>
                        <p className="text-xs text-slate-500">Representa el tamaño de la muestra o población.</p>
                      </div>
                    </div>

                    {/* Media x̄ */}
                    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 border-t pt-4">
                      <div className="w-24 flex-shrink-0">
                        <span className="font-bold text-base text-sky-600">Media (x̄)</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          Suma de todos los valores de la muestra dividida entre N:
                        </p>
                        <p className="font-mono text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-100 mt-2">
                          x̄ = (Σ xi) / N = ({result.sorted.join(' + ')}) / {result.n} = {result.sum} / {result.n} ={' '}
                          <span className="text-indigo-600 font-bold">{result.mean.toFixed(6)}</span>
                        </p>
                      </div>
                    </div>

                    {/* Mediana */}
                    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 border-t pt-4">
                      <div className="w-24 flex-shrink-0">
                        <span className="font-bold text-base text-sky-600">Mediana</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{result.medianStep}</p>
                      </div>
                    </div>

                    {/* Moda */}
                    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 border-t pt-4">
                      <div className="w-24 flex-shrink-0">
                        <span className="font-bold text-base text-sky-600">Moda</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          El valor que tiene mayor frecuencia absoluta: <span className="text-indigo-600 font-bold">{result.modeText}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Medidas de dispersión */}
                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="text-sm font-bold text-slate-800 border-b pb-1.5">
                      2. Medidas de Dispersión y Desviación
                    </h3>

                    {/* Rango */}
                    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4">
                      <div className="w-24 flex-shrink-0">
                        <span className="font-bold text-base text-sky-600">Rango</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          Diferencia entre el valor máximo y el mínimo:
                        </p>
                        <p className="font-mono text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-100 mt-2">
                          Rango = Max - Min = {result.max} - {result.min} ={' '}
                          <span className="text-indigo-600 font-bold">{result.range}</span>
                        </p>
                      </div>
                    </div>

                    {/* Tabla de desviaciones */}
                    <div className="space-y-2 mt-4">
                      <p className="text-xs font-bold text-slate-600">Tabla de desviaciones respecto a la media (x̄ = {result.mean.toFixed(4)}):</p>
                      <div className="overflow-x-auto border border-slate-100 rounded-lg">
                        <table className="w-full text-xs text-left border-collapse">
                          <thead>
                            <tr className="border-b border-border bg-slate-50 text-[10px] uppercase font-bold text-slate-400">
                              <th className="py-1 px-3">i</th>
                              <th className="py-1 px-3">Dato (xi)</th>
                              <th className="py-1 px-3">Diferencia (xi - x̄)</th>
                              <th className="py-1 px-3 text-right">Diferencia² (xi - x̄)²</th>
                            </tr>
                          </thead>
                          <tbody>
                            {result.deviationsTable.map(row => (
                              <tr key={row.index} className="border-b border-slate-50 hover:bg-slate-50/50">
                                <td className="py-1.5 px-3 text-slate-400">{row.index}</td>
                                <td className="py-1.5 px-3 font-mono font-semibold text-slate-700">{row.val}</td>
                                <td className="py-1.5 px-3 font-mono text-slate-500">
                                  {row.diff >= 0 ? '+' : ''}{row.diff.toFixed(4)}
                                </td>
                                <td className="py-1.5 px-3 text-right font-mono text-indigo-600">{row.diffSq.toFixed(4)}</td>
                              </tr>
                            ))}
                            <tr className="bg-slate-50 font-bold text-slate-800">
                              <td className="py-2 px-3" colSpan="3">Suma de diferencias al cuadrado (Σ):</td>
                              <td className="py-2 px-3 text-right font-mono text-indigo-700">
                                {result.sumSquaredDiffs.toFixed(6)}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Varianza Muestral */}
                    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 border-t pt-4">
                      <div className="w-24 flex-shrink-0">
                        <span className="font-bold text-base text-sky-600">s² (Muestral)</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          Varianza Muestral (s²): Divide entre N − 1 (aplica para una muestra):
                        </p>
                        <p className="font-mono text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-100 mt-2">
                          s² = Σ(xi - x̄)² / (N - 1) = {result.sumSquaredDiffs.toFixed(6)} / ({result.n} - 1) ={' '}
                          <span className="text-indigo-600 font-bold text-sm">{result.sampleVariance.toFixed(6)}</span>
                        </p>
                      </div>
                    </div>

                    {/* Desviación Muestral */}
                    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 border-t pt-4">
                      <div className="w-24 flex-shrink-0">
                        <span className="font-bold text-base text-sky-600">s (Muestral)</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          Desviación Estándar Muestral (s): Raíz cuadrada de s²:
                        </p>
                        <p className="font-mono text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-100 mt-2">
                          s = √s² = √{result.sampleVariance.toFixed(6)} ={' '}
                          <span className="text-indigo-600 font-bold text-sm">{result.sampleStDev.toFixed(6)}</span>
                        </p>
                      </div>
                    </div>

                    {/* Varianza Poblacional */}
                    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 border-t pt-4">
                      <div className="w-24 flex-shrink-0">
                        <span className="font-bold text-base text-sky-600">σ² (Pob.)</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          Varianza Poblacional (σ²): Divide entre N (aplica para la población total):
                        </p>
                        <p className="font-mono text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-100 mt-2">
                          σ² = Σ(xi - x̄)² / N = {result.sumSquaredDiffs.toFixed(6)} / {result.n} ={' '}
                          <span className="text-indigo-600 font-bold text-sm">{result.popVariance.toFixed(6)}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </TabsContent>

        {/* TAB 2: REGRESIÓN Y AJUSTE */}
        <TabsContent value="regression" className="space-y-5">
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-sm mb-4 text-slate-800">Ingreso de Datos de Dispersión (X y Y)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs mb-1.5 block text-slate-600">Valores de X (separados por comas o espacios):</Label>
                <textarea
                  value={inputX}
                  onChange={e => setInputX(e.target.value)}
                  placeholder="Ejemplo: 1, 2, 3, 4, 5"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring font-mono"
                />
              </div>
              <div>
                <Label className="text-xs mb-1.5 block text-slate-600">Valores de Y (separados por comas o espacios):</Label>
                <textarea
                  value={inputY}
                  onChange={e => setInputY(e.target.value)}
                  placeholder="Ejemplo: 2.2, 3.8, 6.1, 8.0, 10.2"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring font-mono"
                />
              </div>
            </div>
            <div className="mt-4">
              <Button onClick={handleCalculateRegression} className="gap-2">
                <Play className="w-4 h-4" /> Calcular Regresión
              </Button>
            </div>
          </div>

          {resultReg && resultReg.error && <ResultBanner result={resultReg} />}

          {resultReg && !resultReg.error && (
            <>
              {/* Tarjetas de Resultados de Regresión */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Lineal */}
                <div className="bg-white border border-border rounded-xl p-5 shadow-sm">
                  <h4 className="font-bold text-xs uppercase text-slate-400 mb-2">Regresión Lineal (y = mx + b)</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-semibold">Ecuación Ajustada</span>
                      <p className="font-mono font-bold text-blue-600 text-lg">
                        y = {resultReg.m.toFixed(4)}x {resultReg.b >= 0 ? '+' : '-'} {Math.abs(resultReg.b).toFixed(4)}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-semibold">Coeficiente de Determinación (R²)</span>
                      <p className="font-mono font-bold text-slate-700 text-base">{resultReg.r2Linear.toFixed(6)}</p>
                    </div>
                  </div>
                </div>

                {/* Cuadrática */}
                <div className="bg-white border border-border rounded-xl p-5 shadow-sm">
                  <h4 className="font-bold text-xs uppercase text-slate-400 mb-2">Regresión Cuadrática (y = ax² + bx + c)</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-semibold">Ecuación Ajustada</span>
                      <p className="font-mono font-bold text-emerald-600 text-lg">
                        y = {resultReg.quadA.toFixed(4)}x² {resultReg.quadB >= 0 ? '+' : '-'} {Math.abs(resultReg.quadB).toFixed(4)}x {resultReg.quadC >= 0 ? '+' : '-'} {Math.abs(resultReg.quadC).toFixed(4)}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-semibold">Coeficiente de Determinación (R²)</span>
                      <p className="font-mono font-bold text-slate-700 text-base">{resultReg.r2Quad.toFixed(6)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Gráfica de Regresión */}
              <div className="bg-white border border-border rounded-xl p-5 shadow-sm">
                <h3 className="font-semibold text-sm mb-4 text-slate-800">Gráfico de Dispersión y Modelos de Ajuste</h3>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={resultReg.chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-slate-100" />
                      <XAxis dataKey="x" type="number" domain={['auto', 'auto']} />
                      <YAxis type="number" domain={['auto', 'auto']} />
                      <Tooltip />
                      <Legend />
                      <Scatter name="Puntos Reales" dataKey="yRaw" fill="#ef4444" />
                      <Line name="Ajuste Lineal" dataKey="yLinear" stroke="#2563eb" strokeWidth={2} dot={false} connectNulls />
                      <Line name="Ajuste Cuadrático" dataKey="yQuad" stroke="#10b981" strokeWidth={2} dot={false} connectNulls />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Paso a paso de regresión */}
              <div className="border border-border rounded-xl overflow-hidden bg-white shadow-sm">
                <div className="px-5 py-4 border-b border-border bg-slate-50 flex items-center gap-3">
                  <Table className="w-5 h-5 text-indigo-600" />
                  <div>
                    <h3 className="font-bold text-base text-indigo-700">Procedimiento Paso a Paso (Ajuste)</h3>
                    <p className="text-xs text-slate-500">Cálculos de sumatorias y coeficientes</p>
                  </div>
                </div>
                <div className="p-6 space-y-6">
                  {/* Título */}
                  <div>
                    <h2 className="text-xl font-bold bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent mb-1">
                      Ajuste de Mínimos Cuadrados
                    </h2>
                    <p className="text-sm text-slate-600">
                      Cálculo de los coeficientes del modelo a través del método de sumatorias de desviaciones mínimas cuadráticas.
                    </p>
                  </div>

                  {/* Tabla de Sumatorias */}
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-600">Tabla de sumatorias calculadas:</p>
                    <div className="overflow-x-auto border border-slate-100 rounded-lg">
                      <table className="w-full text-xs text-left border-collapse">
                        <thead>
                          <tr className="border-b border-border bg-slate-50 text-[10px] uppercase font-bold text-slate-500">
                            <th className="py-1 px-3">i</th>
                            <th className="py-1 px-3">X</th>
                            <th className="py-1 px-3">Y</th>
                            <th className="py-1 px-3">X²</th>
                            <th className="py-1 px-3">X³</th>
                            <th className="py-1 px-3">X⁴</th>
                            <th className="py-1 px-3">X·Y</th>
                            <th className="py-1 px-3 text-right">X²·Y</th>
                          </tr>
                        </thead>
                        <tbody>
                          {resultReg.xs.map((x, i) => (
                            <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50">
                              <td className="py-1.5 px-3 text-slate-400">{i + 1}</td>
                              <td className="py-1.5 px-3 font-mono font-semibold text-slate-700">{x}</td>
                              <td className="py-1.5 px-3 font-mono text-slate-700">{resultReg.ys[i]}</td>
                              <td className="py-1.5 px-3 font-mono text-slate-500">{(x * x).toFixed(2)}</td>
                              <td className="py-1.5 px-3 font-mono text-slate-500">{(x * x * x).toFixed(2)}</td>
                              <td className="py-1.5 px-3 font-mono text-slate-500">{(x * x * x * x).toFixed(2)}</td>
                              <td className="py-1.5 px-3 font-mono text-slate-500">{(x * resultReg.ys[i]).toFixed(2)}</td>
                              <td className="py-1.5 px-3 text-right font-mono text-slate-500">{(x * x * resultReg.ys[i]).toFixed(2)}</td>
                            </tr>
                          ))}
                          <tr className="bg-slate-50 font-bold text-slate-800">
                            <td className="py-2 px-3">Σ:</td>
                            <td className="py-2 px-3 font-mono text-indigo-700">{resultReg.sumX.toFixed(2)}</td>
                            <td className="py-2 px-3 font-mono text-indigo-700">{resultReg.sumY.toFixed(2)}</td>
                            <td className="py-2 px-3 font-mono text-slate-700">{resultReg.sumX2.toFixed(2)}</td>
                            <td className="py-2 px-3 font-mono text-slate-700">{resultReg.sumX3.toFixed(2)}</td>
                            <td className="py-2 px-3 font-mono text-slate-700">{resultReg.sumX4.toFixed(2)}</td>
                            <td className="py-2 px-3 font-mono text-slate-700">{resultReg.sumXY.toFixed(2)}</td>
                            <td className="py-2 px-3 text-right font-mono text-slate-700">{resultReg.sumX2Y.toFixed(2)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* 1. Cálculo de regresión lineal */}
                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="text-sm font-bold text-slate-800 border-b pb-1.5">
                      Cálculo de Regresión Lineal (y = mx + b)
                    </h3>
                    <div className="flex flex-col gap-3">
                      <div>
                        <p className="text-xs text-slate-500">Fórmula de la pendiente (m):</p>
                        <p className="font-mono text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-100 mt-1">
                          m = (N·ΣXY - ΣX·ΣY) / (N·ΣX² - (ΣX)²) = ({resultReg.n}·{resultReg.sumXY.toFixed(2)} - {resultReg.sumX.toFixed(2)}·{resultReg.sumY.toFixed(2)}) / ({resultReg.n}·{resultReg.sumX2.toFixed(2)} - ({resultReg.sumX.toFixed(2)})²)
                          <br />
                          m = <span className="text-indigo-600 font-bold">{resultReg.m.toFixed(6)}</span>
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-500">Fórmula del intercepto (b):</p>
                        <p className="font-mono text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-100 mt-1">
                          b = (ΣY - m·ΣX) / N = ({resultReg.sumY.toFixed(2)} - {resultReg.m.toFixed(4)}·{resultReg.sumX.toFixed(2)}) / {resultReg.n}
                          <br />
                          b = <span className="text-indigo-600 font-bold">{resultReg.b.toFixed(6)}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 2. Cálculo de regresión cuadrática */}
                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="text-sm font-bold text-slate-800 border-b pb-1.5">
                      Cálculo de Regresión Cuadrática (y = ax² + bx + c)
                    </h3>
                    <div>
                      <p className="text-xs text-slate-500">Sistema de Ecuaciones Lineales para coeficientes:</p>
                      <div className="font-mono text-xs text-slate-600 bg-slate-50 p-3 rounded border border-slate-100 mt-1 space-y-1">
                        <p>│ {resultReg.n}c + {resultReg.sumX.toFixed(2)}b + {resultReg.sumX2.toFixed(2)}a = {resultReg.sumY.toFixed(2)}</p>
                        <p>│ {resultReg.sumX.toFixed(2)}c + {resultReg.sumX2.toFixed(2)}b + {resultReg.sumX3.toFixed(2)}a = {resultReg.sumXY.toFixed(2)}</p>
                        <p>│ {resultReg.sumX2.toFixed(2)}c + {resultReg.sumX3.toFixed(2)}b + {resultReg.sumX4.toFixed(2)}a = {resultReg.sumX2Y.toFixed(2)}</p>
                      </div>
                      <p className="text-xs text-slate-500 mt-3">Resolviendo para los coeficientes:</p>
                      <div className="grid grid-cols-3 gap-2 font-mono text-xs text-indigo-700 bg-slate-50 p-2.5 rounded border border-slate-100 mt-1">
                        <div>a = <strong>{resultReg.quadA.toFixed(6)}</strong></div>
                        <div>b = <strong>{resultReg.quadB.toFixed(6)}</strong></div>
                        <div>c = <strong>{resultReg.quadC.toFixed(6)}</strong></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
