import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer, Scatter, ComposedChart } from 'recharts';
import { generatePlotPoints } from '@/lib/mathParser';

export default function FunctionChart({ expr, xMin, xMax, roots = [], points = [], yLabel = "f(x)" }) {
  const plotData = expr ? generatePlotPoints(expr, xMin, xMax) : [];
  
  const rootPoints = roots.filter(r => isFinite(r)).map(r => ({
    x: parseFloat(r.toFixed(6)),
    y: 0,
  }));

  let data = plotData.length > 0 ? plotData : points;
  if (data.length === 0) {
    // Provide a dummy dataset so the chart still renders the grid and axes while typing invalid expressions
    data = [{ x: xMin, y: 0 }, { x: xMax, y: 0 }];
  }

  return (
    <div className="border border-border rounded-xl p-5 bg-card">
      <h3 className="text-sm font-semibold mb-4">Gráfica</h3>
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,90%)" />
          <XAxis 
            dataKey="x" 
            type="number" 
            domain={['dataMin', 'dataMax']}
            tick={{ fontSize: 11 }}
            tickFormatter={v => v.toFixed(2)}
          />
          <YAxis 
            tick={{ fontSize: 11 }}
            tickFormatter={v => v.toFixed(2)}
            label={{ value: yLabel, angle: -90, position: 'insideLeft', style: { fontSize: 11 } }}
          />
          <Tooltip 
            formatter={(v) => v.toFixed(6)} 
            labelFormatter={(v) => `x = ${Number(v).toFixed(6)}`}
            contentStyle={{ fontSize: 12, borderRadius: 8 }}
          />
          <ReferenceLine y={0} stroke="hsl(220,20%,70%)" strokeWidth={1} />
          <Line type="monotone" dataKey="y" stroke="hsl(230,80%,55%)" strokeWidth={2} dot={false} />
          {rootPoints.length > 0 && (
            <Scatter data={rootPoints} fill="hsl(0,80%,55%)" shape="circle" r={6} />
          )}
        </ComposedChart>
      </ResponsiveContainer>
      {rootPoints.length > 0 && (
        <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-primary inline-block rounded" /> f(x)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-red-500 rounded-full inline-block" /> Raíz
          </span>
        </div>
      )}
    </div>
  );
}