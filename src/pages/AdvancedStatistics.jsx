import React, { useState } from 'react';
import {
  oneSampleTTest,
  twoSampleTTest,
  oneWayANOVA,
  chiSquareIndependence,
  calculateDistribution,
} from '@/lib/advancedStatistics';
import ResultActions from '@/components/shared/ResultActions';
import { Button } from '@/components/ui/button';
import {
  BarChart2,
  Table,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Layers,
  Percent,
} from 'lucide-react';

const TESTS = [
  { id: 't1', label: 't-Student (1 Muestra)', desc: 'Compara la media de una muestra con un valor de referencia (μ₀)' },
  { id: 't2', label: 't-Student (2 Muestras)', desc: 'Compara si las medias de dos grupos independientes son diferentes' },
  { id: 'anova', label: 'ANOVA (1 Vía)', desc: 'Compara simultáneamente las medias de 3 o más grupos' },
  { id: 'chi2', label: 'Chi-Cuadrado (χ²)', desc: 'Prueba de independencia para tablas de contingencia r × c' },
  { id: 'dist', label: 'Distribuciones', desc: 'Cálculo de probabilidades y valores críticos (Normal, t, F, χ²)' },
];

export default function AdvancedStatistics() {
  const [activeTest, setActiveTest] = useState('t1');

  // t1 inputs
  const [t1Data, setT1Data] = useState('12.5, 13.1, 12.8, 14.2, 13.5, 12.9, 13.8, 14.0');
  const [t1Mu0, setT1Mu0] = useState('13.0');
  const [t1Alpha, setT1Alpha] = useState('0.05');

  // t2 inputs
  const [t2Group1, setT2Group1] = useState('23, 25, 28, 22, 27, 24, 26');
  const [t2Group2, setT2Group2] = useState('19, 21, 20, 18, 22, 19, 21');
  const [t2Alpha, setT2Alpha] = useState('0.05');

  // anova inputs
  const [anovaGroups, setAnovaGroups] = useState(
    'Método A: 85, 88, 90, 82, 87\nMétodo B: 78, 80, 75, 82, 79\nMétodo C: 92, 95, 89, 94, 91'
  );
  const [anovaAlpha, setAnovaAlpha] = useState('0.05');

  // chi2 inputs
  const [chi2Rows, setChi2Rows] = useState('20, 30\n15, 35');
  const [chi2Alpha, setChi2Alpha] = useState('0.05');

  // distributions inputs
  const [distType, setDistType] = useState('normal');
  const [distX, setDistX] = useState('1.96');
  const [distParam1, setDistParam1] = useState('0'); // mean or df
  const [distParam2, setDistParam2] = useState('1'); // std or df2

  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const parseArray = (str) =>
    str
      .split(/[,\s\n]+/)
      .map((s) => parseFloat(s.trim()))
      .filter((n) => !isNaN(n));

  const handleCalculate = () => {
    setError('');
    setResult(null);

    try {
      if (activeTest === 't1') {
        const sample = parseArray(t1Data);
        const mu = parseFloat(t1Mu0) || 0;
        const a = parseFloat(t1Alpha) || 0.05;
        setResult(oneSampleTTest(sample, mu, a));
      } else if (activeTest === 't2') {
        const g1 = parseArray(t2Group1);
        const g2 = parseArray(t2Group2);
        const a = parseFloat(t2Alpha) || 0.05;
        setResult(twoSampleTTest(g1, g2, a));
      } else if (activeTest === 'anova') {
        const lines = anovaGroups.split('\n').filter((l) => l.trim().length > 0);
        const groups = lines.map((l) => {
          const content = l.includes(':') ? l.split(':')[1] : l;
          return parseArray(content);
        });
        const a = parseFloat(anovaAlpha) || 0.05;
        setResult(oneWayANOVA(groups, a));
      } else if (activeTest === 'chi2') {
        const rows = chi2Rows
          .split('\n')
          .filter((r) => r.trim().length > 0)
          .map((r) => parseArray(r));
        const a = parseFloat(chi2Alpha) || 0.05;
        setResult(chiSquareIndependence(rows, a));
      } else if (activeTest === 'dist') {
        const xVal = parseFloat(distX) || 0;
        let params = {};
        if (distType === 'normal') {
          params = { mean: parseFloat(distParam1) || 0, std: parseFloat(distParam2) || 1 };
        } else if (distType === 't' || distType === 'chisquare') {
          params = { df: parseFloat(distParam1) || 10 };
        } else if (distType === 'f') {
          params = { df1: parseFloat(distParam1) || 5, df2: parseFloat(distParam2) || 10 };
        }
        setResult(calculateDistribution({ dist: distType, params, x: xVal }));
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error en el cálculo estadístico.');
    }
  };

  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white">
            <BarChart2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Estadística Avanzada</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                SPSS Engine
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Pruebas de hipótesis inferenciales, ANOVA, Chi-Cuadrado y distribuciones de probabilidad
            </p>
          </div>
        </div>
      </div>

      {/* Tests Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2 bg-muted/40 p-1.5 rounded-2xl border border-border">
        {TESTS.map((test) => {
          const isActive = activeTest === test.id;
          return (
            <button
              key={test.id}
              onClick={() => {
                setActiveTest(test.id);
                setResult(null);
                setError('');
              }}
              className={`p-3 rounded-xl text-left transition-all ${
                isActive
                  ? 'bg-card text-emerald-600 dark:text-emerald-400 shadow-sm border border-border'
                  : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
              }`}
            >
              <span className="text-xs font-bold block mb-0.5">{test.label}</span>
              <span className="text-[10px] text-muted-foreground line-clamp-1">{test.desc}</span>
            </button>
          );
        })}
      </div>

      {/* Form Input Card */}
      <div className="bg-card border border-border p-6 rounded-3xl shadow-sm space-y-6">
        {/* Test 1: One Sample t-Test */}
        {activeTest === 't1' && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Datos de la Muestra (separados por coma o espacio):
              </label>
              <textarea
                value={t1Data}
                onChange={(e) => setT1Data(e.target.value)}
                rows={3}
                className="w-full p-3 rounded-xl border border-border bg-muted/30 font-mono text-xs focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Media de Prueba Teórica (μ₀):
                </label>
                <input
                  type="number"
                  value={t1Mu0}
                  onChange={(e) => setT1Mu0(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-muted/30 font-mono text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Nivel de Significancia (α):
                </label>
                <select
                  value={t1Alpha}
                  onChange={(e) => setT1Alpha(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-muted/30 font-mono text-xs"
                >
                  <option value="0.01">0.01 (99% confianza)</option>
                  <option value="0.05">0.05 (95% confianza)</option>
                  <option value="0.10">0.10 (90% confianza)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Test 2: Two Sample t-Test */}
        {activeTest === 't2' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Muestra 1 (Grupo A):</label>
                <textarea
                  value={t2Group1}
                  onChange={(e) => setT2Group1(e.target.value)}
                  rows={3}
                  className="w-full p-3 rounded-xl border border-border bg-muted/30 font-mono text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Muestra 2 (Grupo B):</label>
                <textarea
                  value={t2Group2}
                  onChange={(e) => setT2Group2(e.target.value)}
                  rows={3}
                  className="w-full p-3 rounded-xl border border-border bg-muted/30 font-mono text-xs"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">
                Nivel de Significancia (α):
              </label>
              <select
                value={t2Alpha}
                onChange={(e) => setT2Alpha(e.target.value)}
                className="w-full sm:w-64 px-3 py-2 rounded-xl border border-border bg-muted/30 font-mono text-xs"
              >
                <option value="0.01">0.01 (99% confianza)</option>
                <option value="0.05">0.05 (95% confianza)</option>
                <option value="0.10">0.10 (90% confianza)</option>
              </select>
            </div>
          </div>
        )}

        {/* Test 3: ANOVA */}
        {activeTest === 'anova' && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Grupos de Tratamiento (un grupo por fila):
              </label>
              <textarea
                value={anovaGroups}
                onChange={(e) => setAnovaGroups(e.target.value)}
                rows={4}
                className="w-full p-3 rounded-xl border border-border bg-muted/30 font-mono text-xs"
                placeholder="Grupo 1: 10, 12, 14&#10;Grupo 2: 15, 17, 18&#10;Grupo 3: 20, 22, 21"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">
                Nivel de Significancia (α):
              </label>
              <select
                value={anovaAlpha}
                onChange={(e) => setAnovaAlpha(e.target.value)}
                className="w-full sm:w-64 px-3 py-2 rounded-xl border border-border bg-muted/30 font-mono text-xs"
              >
                <option value="0.01">0.01 (99% confianza)</option>
                <option value="0.05">0.05 (95% confianza)</option>
                <option value="0.10">0.10 (90% confianza)</option>
              </select>
            </div>
          </div>
        )}

        {/* Test 4: Chi-Square */}
        {activeTest === 'chi2' && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Tabla de Contingencia (filas y columnas separadas por comas):
              </label>
              <textarea
                value={chi2Rows}
                onChange={(e) => setChi2Rows(e.target.value)}
                rows={3}
                className="w-full p-3 rounded-xl border border-border bg-muted/30 font-mono text-xs"
                placeholder="20, 30&#10;15, 35"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">
                Nivel de Significancia (α):
              </label>
              <select
                value={chi2Alpha}
                onChange={(e) => setChi2Alpha(e.target.value)}
                className="w-full sm:w-64 px-3 py-2 rounded-xl border border-border bg-muted/30 font-mono text-xs"
              >
                <option value="0.01">0.01 (99% confianza)</option>
                <option value="0.05">0.05 (95% confianza)</option>
                <option value="0.10">0.10 (90% confianza)</option>
              </select>
            </div>
          </div>
        )}

        {/* Test 5: Distributions */}
        {activeTest === 'dist' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Distribución:</label>
                <select
                  value={distType}
                  onChange={(e) => setDistType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-muted/30 font-mono text-xs"
                >
                  <option value="normal">Normal (μ, σ)</option>
                  <option value="t">t de Student (gl)</option>
                  <option value="chisquare">Chi-Cuadrado (gl)</option>
                  <option value="f">F de Snedecor (gl1, gl2)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Valor de x:</label>
                <input
                  type="number"
                  step="0.01"
                  value={distX}
                  onChange={(e) => setDistX(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-muted/30 font-mono text-xs"
                />
              </div>
              {distType === 'normal' ? (
                <>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1">Media (μ):</label>
                    <input
                      type="number"
                      value={distParam1}
                      onChange={(e) => setDistParam1(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-border bg-muted/30 font-mono text-xs"
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Grados Libertad (gl):</label>
                  <input
                    type="number"
                    value={distParam1}
                    onChange={(e) => setDistParam1(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-muted/30 font-mono text-xs"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Calculate button */}
        <Button
          onClick={handleCalculate}
          className="w-full h-12 rounded-xl text-sm font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25"
        >
          Ejecutar Análisis Estadístico
        </Button>

        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-2xl text-xs font-medium">
            {error}
          </div>
        )}
      </div>

      {/* Results Rendering in SPSS Table Style */}
      {result && (
        <div className="space-y-6">
          {/* Conclusion Banner */}
          {result.conclusion && (
            <div
              className={`p-5 rounded-2xl border flex items-start gap-3 shadow-sm ${
                result.rejectH0
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-900 dark:text-emerald-300'
                  : 'bg-amber-500/10 border-amber-500/20 text-amber-900 dark:text-amber-300'
              }`}
            >
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm">Conclusión de la Prueba de Hipótesis:</h4>
                <p className="text-xs mt-1 leading-relaxed">{result.conclusion}</p>
              </div>
            </div>
          )}

          {/* SPSS Tables Container */}
          <div className="bg-card border border-border p-6 rounded-3xl shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Table className="w-4 h-4 text-emerald-500" />
                {result.testName || 'Resultados de Distribución'}
              </h3>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 bg-muted rounded-full text-muted-foreground">
                SPSS Output Format
              </span>
            </div>

            {/* Test 1 & Test 2 Metrics Grid */}
            {(activeTest === 't1' || activeTest === 't2') && (
              <div className="overflow-x-auto border border-border rounded-xl text-xs">
                <table className="w-full text-left border-collapse font-mono">
                  <thead className="bg-muted/60 font-semibold border-b border-border text-foreground">
                    <tr>
                      <th className="p-3">Estadístico t</th>
                      <th className="p-3">gl</th>
                      <th className="p-3">Sig. (bilateral) p</th>
                      <th className="p-3">t Crítico (α={result.alpha})</th>
                      <th className="p-3">Error Estándar</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border/50">
                      <td className="p-3 font-bold text-emerald-600 dark:text-emerald-400">{result.tStat.toFixed(4)}</td>
                      <td className="p-3">{result.df.toFixed(1)}</td>
                      <td className="p-3 font-bold">{result.pValue.toFixed(6)}</td>
                      <td className="p-3">{result.tCrit.toFixed(4)}</td>
                      <td className="p-3">{result.se.toFixed(4)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* ANOVA Table */}
            {activeTest === 'anova' && result.table && (
              <div className="space-y-4">
                <div className="overflow-x-auto border border-border rounded-xl text-xs">
                  <table className="w-full text-left border-collapse font-mono">
                    <thead className="bg-muted/60 font-semibold border-b border-border text-foreground">
                      <tr>
                        <th className="p-3">Fuente de Variación</th>
                        <th className="p-3">Suma de Cuadrados (SS)</th>
                        <th className="p-3">gl</th>
                        <th className="p-3">Media Cuadrática (MS)</th>
                        <th className="p-3">F</th>
                        <th className="p-3">Sig. (p-valor)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-border/50">
                        <td className="p-3 font-semibold">Entre Grupos</td>
                        <td className="p-3">{result.table.between.ss.toFixed(4)}</td>
                        <td className="p-3">{result.table.between.df}</td>
                        <td className="p-3">{result.table.between.ms.toFixed(4)}</td>
                        <td className="p-3 font-bold text-emerald-600 dark:text-emerald-400">{result.table.between.f.toFixed(4)}</td>
                        <td className="p-3 font-bold">{result.table.between.p.toFixed(6)}</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="p-3 font-semibold">Dentro de Grupos (Error)</td>
                        <td className="p-3">{result.table.within.ss.toFixed(4)}</td>
                        <td className="p-3">{result.table.within.df}</td>
                        <td className="p-3">{result.table.within.ms.toFixed(4)}</td>
                        <td className="p-3 text-muted-foreground">-</td>
                        <td className="p-3 text-muted-foreground">-</td>
                      </tr>
                      <tr className="bg-muted/20 font-bold">
                        <td className="p-3">Total</td>
                        <td className="p-3">{result.table.total.ss.toFixed(4)}</td>
                        <td className="p-3">{result.table.total.df}</td>
                        <td className="p-3 text-muted-foreground">-</td>
                        <td className="p-3 text-muted-foreground">-</td>
                        <td className="p-3 text-muted-foreground">-</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Chi-Square Output */}
            {activeTest === 'chi2' && (
              <div className="overflow-x-auto border border-border rounded-xl text-xs">
                <table className="w-full text-left border-collapse font-mono">
                  <thead className="bg-muted/60 font-semibold border-b border-border text-foreground">
                    <tr>
                      <th className="p-3">Estadístico Chi-Cuadrado (χ²)</th>
                      <th className="p-3">gl</th>
                      <th className="p-3">Sig. asintótica (p-valor)</th>
                      <th className="p-3">χ² Crítico (α={result.alpha})</th>
                      <th className="p-3">N Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-3 font-bold text-emerald-600 dark:text-emerald-400">{result.chiSquare.toFixed(4)}</td>
                      <td className="p-3">{result.df}</td>
                      <td className="p-3 font-bold">{result.pValue.toFixed(6)}</td>
                      <td className="p-3">{result.chiCrit.toFixed(4)}</td>
                      <td className="p-3">{result.grandTotal}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* Probability Distribution Output */}
            {activeTest === 'dist' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
                <div className="p-4 bg-muted/30 rounded-2xl border border-border">
                  <span className="text-muted-foreground text-[10px] uppercase font-bold block mb-1">
                    Densidad f(x):
                  </span>
                  <span className="text-lg font-bold text-foreground">{result.pdf.toFixed(6)}</span>
                </div>
                <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                  <span className="text-emerald-600 dark:text-emerald-400 text-[10px] uppercase font-bold block mb-1">
                    P(X ≤ {result.x}):
                  </span>
                  <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                    {(result.pLessThanX * 100).toFixed(4)}%
                  </span>
                </div>
                <div className="p-4 bg-muted/30 rounded-2xl border border-border">
                  <span className="text-muted-foreground text-[10px] uppercase font-bold block mb-1">
                    P(X &gt; {result.x}):
                  </span>
                  <span className="text-lg font-bold text-foreground">
                    {(result.pGreaterThanX * 100).toFixed(4)}%
                  </span>
                </div>
              </div>
            )}

            {/* Result Actions: Save to Works & Print */}
            <ResultActions
              moduleName="Estadística Avanzada (SPSS)"
              methodName={result.testName || 'Distribución de Probabilidad'}
              problemSetup={{
                prueba: activeTest,
                alpha: result.alpha || t1Alpha,
              }}
              resultData={result}
            />
          </div>
        </div>
      )}
    </div>
  );
}
