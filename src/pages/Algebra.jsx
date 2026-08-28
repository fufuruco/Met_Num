import React, { useState } from 'react';
import {
  processAlgebra,
  solveEquation,
  calculateDerivative,
  calculateIntegral,
  calculateLimit,
  toLatexSafe,
} from '@/lib/symbolicEngine';
import MathRenderer from '@/components/calculus/MathRenderer';
import MathKeyboard from '@/components/shared/MathKeyboard';
import StepByStepViewer from '@/components/shared/StepByStepViewer';
import ResultActions from '@/components/shared/ResultActions';
import {
  Calculator,
  Sigma,
  Split,
  Expand,
  Minimize2,
  TrendingUp,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const MODES = [
  { id: 'simplify', label: 'Simplificar', icon: Minimize2, placeholder: '2*x + 5*x - 3 + 10', help: 'Agrupa términos semejantes y reduce fracciones' },
  { id: 'expand', label: 'Expandir', icon: Expand, placeholder: '(x + 3)^2 * (x - 2)', help: 'Aplica propiedad distributiva y productos notables' },
  { id: 'factor', label: 'Factorizar', icon: Split, placeholder: 'x^2 - 5*x + 6', help: 'Encuentra factores comunes y raíces cuadráticas' },
  { id: 'solve', label: 'Resolver Ecuación', icon: Calculator, placeholder: '2*x^2 - 8 = 0', help: 'Encuentra las soluciones exactas para la variable' },
  { id: 'derivative', label: 'Derivada', icon: TrendingUp, placeholder: 'x^3 * sin(x) + exp(x)', help: 'Cálculo de derivadas simbólicas de cualquier orden' },
  { id: 'integral', label: 'Integral', icon: Sigma, placeholder: 'x^2 * cos(x)', help: 'Integrales indefinidas y definidas con Barrow' },
];

import { useAuth } from '@/lib/AuthContext';

export default function Algebra() {
  const { isPremium, credits, useCredit } = useAuth();
  const [activeMode, setActiveMode] = useState('simplify');
  const [inputExpr, setInputExpr] = useState('2*x^2 + 4*x - 6');
  const [variable, setVariable] = useState('x');
  const [derivOrder, setDerivOrder] = useState('1');
  const [isDefinite, setIsDefinite] = useState(false);
  const [lowerLim, setLowerLim] = useState('0');
  const [upperLim, setUpperLim] = useState('pi');
  
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCalculate = async () => {
    setError('');
    setResult(null);
    setLoading(true);

    try {
      if (!inputExpr.trim()) {
        throw new Error('Ingresa una expresión matemática para calcular.');
      }

      let res = null;
      if (activeMode === 'simplify' || activeMode === 'expand' || activeMode === 'factor') {
        res = await processAlgebra(inputExpr, activeMode);
      } else if (activeMode === 'solve') {
        res = await solveEquation(inputExpr, variable);
      } else if (activeMode === 'derivative') {
        res = await calculateDerivative(inputExpr, variable, parseInt(derivOrder) || 1);
      } else if (activeMode === 'integral') {
        res = await calculateIntegral(
          inputExpr,
          variable,
          isDefinite ? lowerLim : null,
          isDefinite ? upperLim : null
        );
      }

      setResult(res);

      // Descontar 1 crédito diario si no es usuario Premium
      if (!isPremium && credits > 0) {
        await useCredit();
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error en la evaluación simbólica. Revisa la sintaxis.');
    } finally {
      setLoading(false);
    }
  };

  const currentModeObj = MODES.find((m) => m.id === activeMode) || MODES[0];

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20 text-white">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Álgebra Simbólica</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                Symbolab Engine
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Simplificación, ecuaciones, cálculo simbólico y desglose paso a paso
            </p>
          </div>
        </div>
      </div>

      {/* Mode Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 bg-muted/40 p-1.5 rounded-2xl border border-border">
        {MODES.map((mode) => {
          const Icon = mode.icon;
          const isActive = activeMode === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => {
                setActiveMode(mode.id);
                setResult(null);
                setError('');
              }}
              className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-card text-primary shadow-sm border border-border'
                  : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
              <span>{mode.label}</span>
            </button>
          );
        })}
      </div>

      {/* Input Form Card */}
      <div className="bg-card border border-border p-6 rounded-3xl shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {currentModeObj.label}
            </span>
            <span className="text-xs text-muted-foreground">— {currentModeObj.help}</span>
          </div>
        </div>

        {/* Math input */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-foreground flex items-center justify-between">
            <span>Expresión o Ecuación:</span>
            <span className="text-[11px] text-muted-foreground font-mono">
              Ej: {currentModeObj.placeholder}
            </span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={inputExpr}
              onChange={(e) => setInputExpr(e.target.value)}
              placeholder={currentModeObj.placeholder}
              className="flex-1 px-4 py-3 rounded-xl border border-border bg-muted/30 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
              onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
            />
          </div>
        </div>

        {/* Live LaTeX preview */}
        {inputExpr && (
          <div className="p-3.5 bg-muted/20 rounded-xl border border-border/40 flex items-center justify-between gap-4 overflow-x-auto">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex-shrink-0">
              Vista previa:
            </span>
            <div className="text-sm font-semibold text-primary">
              <MathRenderer text={`$$${toLatexSafe(inputExpr)}$$`} />
            </div>
          </div>
        )}

        {/* Additional Parameters for Derivative / Integral / Equation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2 border-t border-border/40">
          {(activeMode === 'solve' || activeMode === 'derivative' || activeMode === 'integral') && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Variable de cálculo:</label>
              <input
                type="text"
                value={variable}
                onChange={(e) => setVariable(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border bg-muted/30 font-mono text-xs"
              />
            </div>
          )}

          {activeMode === 'derivative' && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Orden de derivada:</label>
              <select
                value={derivOrder}
                onChange={(e) => setDerivOrder(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border bg-muted/30 font-mono text-xs"
              >
                <option value="1">1ª Derivada (f')</option>
                <option value="2">2ª Derivada (f'')</option>
                <option value="3">3ª Derivada (f''')</option>
              </select>
            </div>
          )}

          {activeMode === 'integral' && (
            <div className="space-y-1.5 col-span-full">
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  id="defint"
                  checked={isDefinite}
                  onChange={(e) => setIsDefinite(e.target.checked)}
                  className="rounded border-border"
                />
                <label htmlFor="defint" className="text-xs font-semibold cursor-pointer">
                  Integral Definida (con límites de integración)
                </label>
              </div>

              {isDefinite && (
                <div className="grid grid-cols-2 gap-3 p-3 bg-muted/30 rounded-xl border border-border">
                  <div>
                    <label className="text-[11px] text-muted-foreground block mb-1">Límite Inferior (a):</label>
                    <input
                      type="text"
                      value={lowerLim}
                      onChange={(e) => setLowerLim(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-border bg-background font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-muted-foreground block mb-1">Límite Superior (b):</label>
                    <input
                      type="text"
                      value={upperLim}
                      onChange={(e) => setUpperLim(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-border bg-background font-mono text-xs"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Teclado Matemático */}
        <MathKeyboard value={inputExpr} onChange={setInputExpr} />

        {/* Action Button */}
        <Button
          onClick={handleCalculate}
          disabled={loading}
          className="w-full h-12 rounded-xl text-sm font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25"
        >
          {loading ? 'Calculando paso a paso...' : `Resolver ${currentModeObj.label}`}
        </Button>

        {/* Error message */}
        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-2xl text-xs font-medium">
            {error}
          </div>
        )}
      </div>

      {/* Result Section */}
      {result && (
        <div className="space-y-6">
          <div className="bg-card border border-border p-6 rounded-3xl shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Resultado Final
              </span>
              <span className="text-xs font-mono px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold rounded-full">
                Exacto
              </span>
            </div>

            {/* Main Result Display */}
            <div className="p-6 bg-gradient-to-br from-muted/50 to-muted/20 rounded-2xl border border-border text-center overflow-x-auto">
              {result.solutions ? (
                <div className="space-y-2">
                  <span className="text-xs text-muted-foreground block">Soluciones de la ecuación:</span>
                  <div className="text-lg sm:text-xl font-bold text-foreground">
                    <MathRenderer
                      text={`$$${result.solutions
                        .map((sol, idx) => `${variable}_{${idx + 1}} = ${toLatexSafe(sol)}`)
                        .join('\\quad,\\quad ')}$$`}
                    />
                  </div>
                </div>
              ) : (
                <div className="text-xl sm:text-2xl font-bold text-foreground">
                  <MathRenderer text={`$$${result.latex}$$`} />
                </div>
              )}
            </div>

            {/* Actions: Save & Print */}
            <ResultActions
              moduleName="Álgebra Simbólica (Symbolab)"
              methodName={`${currentModeObj.label}: ${inputExpr}`}
              problemSetup={{
                operacion: currentModeObj.label,
                expresion: inputExpr,
                variable,
                ...(activeMode === 'derivative' && { orden: derivOrder }),
                ...(activeMode === 'integral' && isDefinite && { a: lowerLim, b: upperLim }),
              }}
              resultData={result}
            />
          </div>

          {/* Step by Step Breakdown */}
          <StepByStepViewer steps={result.steps} />
        </div>
      )}
    </div>
  );
}
