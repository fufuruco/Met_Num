import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { all, create } from 'mathjs';
import MathRenderer from '@/components/calculus/MathRenderer';
import MathKeyboard from '@/components/shared/MathKeyboard';
import ResultActions from '@/components/shared/ResultActions';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Eye, EyeOff, RotateCcw, LineChart as ChartIcon, Sparkles } from 'lucide-react';
import { toLatexSafe } from '@/lib/symbolicEngine';

const math = create(all);

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

export default function Grapher() {
  const [functions, setFunctions] = useState([
    { id: '1', expr: 'sin(x)', color: '#3b82f6', visible: true },
    { id: '2', expr: 'cos(x)', color: '#8b5cf6', visible: true },
  ]);

  const [xMin, setXMin] = useState(-10);
  const [xMax, setXMax] = useState(10);
  const [samples, setSamples] = useState(200);

  const [selectedFnIndex, setSelectedFnIndex] = useState(0);

  // Generate plotting points
  const chartData = useMemo(() => {
    const data = [];
    const min = Number(xMin) || -10;
    const max = Number(xMax) || 10;
    const step = (max - min) / (samples || 200);

    const compiledList = functions.map((fn) => {
      try {
        if (!fn.visible || !fn.expr.trim()) return null;
        return { id: fn.id, compiled: math.compile(fn.expr) };
      } catch (e) {
        return null;
      }
    });

    for (let x = min; x <= max; x += step) {
      const point = { x: Number(x.toFixed(3)) };
      compiledList.forEach((c) => {
        if (c) {
          try {
            const yVal = c.compiled.evaluate({ x });
            if (typeof yVal === 'number' && !isNaN(yVal) && isFinite(yVal)) {
              point[c.id] = Number(yVal.toFixed(4));
            } else {
              point[c.id] = null;
            }
          } catch (e) {
            point[c.id] = null;
          }
        }
      });
      data.push(point);
    }
    return data;
  }, [functions, xMin, xMax, samples]);

  const handleAddFunction = () => {
    if (functions.length >= 5) return;
    const nextColor = COLORS[functions.length % COLORS.length];
    setFunctions([
      ...functions,
      {
        id: String(Date.now()),
        expr: 'x^2 - 4',
        color: nextColor,
        visible: true,
      },
    ]);
  };

  const handleRemoveFunction = (id) => {
    if (functions.length <= 1) return;
    setFunctions(functions.filter((f) => f.id !== id));
  };

  const handleUpdateExpr = (id, newExpr) => {
    setFunctions(
      functions.map((f) => (f.id === id ? { ...f, expr: newExpr } : f))
    );
  };

  const handleToggleVisible = (id) => {
    setFunctions(
      functions.map((f) => (f.id === id ? { ...f, visible: !f.visible } : f))
    );
  };

  const resetView = () => {
    setXMin(-10);
    setXMax(10);
  };

  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white">
            <ChartIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Graficador Interactivo</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
                2D Curves
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Trazo continuo de funciones matemáticas en tiempo real con zoom y múltiples curvas
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={resetView}
          className="gap-1.5 text-xs rounded-xl"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Restablecer Vista
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Functions List & Keyboard */}
        <div className="space-y-6">
          <div className="bg-card border border-border p-5 rounded-3xl shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Funciones ({functions.length}/5)
              </h3>
              <Button
                size="sm"
                variant="outline"
                onClick={handleAddFunction}
                disabled={functions.length >= 5}
                className="h-8 gap-1.5 text-xs rounded-xl"
              >
                <Plus className="w-3.5 h-3.5" />
                Añadir Función
              </Button>
            </div>

            <div className="space-y-3">
              {functions.map((fn, idx) => (
                <div
                  key={fn.id}
                  onClick={() => setSelectedFnIndex(idx)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                    selectedFnIndex === idx
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-border bg-muted/20 hover:bg-muted/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: fn.color }}
                      />
                      <span className="font-mono text-xs font-bold text-foreground">
                        f_{idx + 1}(x) =
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleVisible(fn.id);
                        }}
                        className="p-1 rounded-lg hover:bg-muted text-muted-foreground"
                        title={fn.visible ? 'Ocultar' : 'Mostrar'}
                      >
                        {fn.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 opacity-50" />}
                      </button>

                      {functions.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveFunction(fn.id);
                          }}
                          className="p-1 rounded-lg hover:bg-rose-500/10 text-rose-500"
                          title="Eliminar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <input
                    type="text"
                    value={fn.expr}
                    onChange={(e) => handleUpdateExpr(fn.id, e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background font-mono text-xs focus:ring-1 focus:ring-primary"
                    placeholder="Ej: sin(x) + x/2"
                  />

                  {fn.expr && (
                    <div className="text-[11px] text-muted-foreground overflow-x-auto">
                      <MathRenderer text={`$$${toLatexSafe(fn.expr)}$$`} />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Rango del eje X */}
            <div className="pt-3 border-t border-border space-y-2">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                Dominio de visualización:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-muted-foreground">X Mín:</label>
                  <input
                    type="number"
                    value={xMin}
                    onChange={(e) => setXMin(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg border border-border bg-muted/30 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground">X Máx:</label>
                  <input
                    type="number"
                    value={xMax}
                    onChange={(e) => setXMax(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg border border-border bg-muted/30 font-mono text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Math Keyboard targeting selected function */}
          {functions[selectedFnIndex] && (
            <MathKeyboard
              value={functions[selectedFnIndex].expr}
              onChange={(newVal) => handleUpdateExpr(functions[selectedFnIndex].id, newVal)}
            />
          )}
        </div>

        {/* Right Column: Chart Viewport */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border p-6 rounded-3xl shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Plano Cartesiano
              </span>
              <span className="text-xs text-muted-foreground font-mono">
                {samples} puntos interpolados
              </span>
            </div>

            {/* Chart */}
            <div className="h-[420px] w-full bg-muted/10 rounded-2xl border border-border p-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis
                    dataKey="x"
                    type="number"
                    domain={[Number(xMin) || -10, Number(xMax) || 10]}
                    tick={{ fontSize: 11 }}
                    stroke="currentColor"
                    className="text-muted-foreground"
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    stroke="currentColor"
                    className="text-muted-foreground"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '1rem',
                      fontSize: '12px',
                      fontFamily: 'monospace',
                    }}
                  />
                  <Legend verticalAlign="top" height={36} />
                  <ReferenceLine y={0} stroke="#64748b" strokeWidth={1.5} />
                  <ReferenceLine x={0} stroke="#64748b" strokeWidth={1.5} />

                  {functions.map((fn, idx) => {
                    if (!fn.visible) return null;
                    return (
                      <Line
                        key={fn.id}
                        type="monotone"
                        dataKey={fn.id}
                        name={`f_${idx + 1}(x) = ${fn.expr}`}
                        stroke={fn.color}
                        strokeWidth={2.5}
                        dot={false}
                        isAnimationActive={false}
                      />
                    );
                  })}
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Actions: Save to Works / Print */}
            <ResultActions
              moduleName="Graficador 2D"
              methodName="Trazado de Curvas"
              problemSetup={{
                funciones: functions.map((f) => f.expr).join(' | '),
                rangoX: `[${xMin}, ${xMax}]`,
              }}
              resultData={{
                numCurvas: functions.length,
                curvas: functions.map((f) => ({ expr: f.expr, color: f.color })),
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
