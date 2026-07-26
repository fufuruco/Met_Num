import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine
} from 'recharts';
import { generatePlotPoints } from '@/lib/mathParser';

export default function FunctionPlotter2D({ expr, a, b }) {
  // Generar un dominio más amplio para ver el contexto de la integral
  const numA = parseFloat(a);
  const numB = parseFloat(b);
  
  const hasLimits = !isNaN(numA) && !isNaN(numB) && numA < numB;
  
  // Si hay límites, graficamos desde a - padding hasta b + padding
  let xMin = -10;
  let xMax = 10;
  
  if (hasLimits) {
    const range = numB - numA;
    const padding = Math.max(range * 0.5, 2);
    xMin = numA - padding;
    xMax = numB + padding;
  }

  const data = useMemo(() => {
    if (!expr) return [];
    const points = generatePlotPoints(expr, xMin, xMax, 300);
    
    // Add shading data if limits exist
    if (hasLimits) {
      return points.map(p => ({
        ...p,
        yArea: (p.x >= numA && p.x <= numB) ? p.y : null
      }));
    }
    
    return points;
  }, [expr, xMin, xMax, hasLimits, numA, numB]);

  if (!data || data.length === 0) return null;

  return (
    <div className="w-full h-[300px] bg-card rounded-lg border border-border p-4 mt-4">
      <h3 className="text-xs font-bold text-muted-foreground mb-2 text-center">
        Gráfica de f(x) = {expr}
        {hasLimits && ` en intervalo [${numA}, ${numB}]`}
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis 
            dataKey="x" 
            type="number"
            domain={['dataMin', 'dataMax']}
            tickCount={9}
            tickFormatter={(val) => val.toFixed(1)}
            style={{ fontSize: '10px' }}
          />
          <YAxis 
            domain={['auto', 'auto']}
            style={{ fontSize: '10px' }}
          />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
            formatter={(value) => [value.toFixed(4), 'y']}
            labelFormatter={(label) => `x = ${Number(label).toFixed(4)}`}
          />
          
          <ReferenceLine y={0} stroke="var(--foreground)" opacity={0.2} />
          <ReferenceLine x={0} stroke="var(--foreground)" opacity={0.2} />

          {/* Sombreado de la integral si aplica */}
          {hasLimits && (
            <Area 
              type="monotone" 
              dataKey="yArea" 
              stroke="none" 
              fill="hsl(var(--primary))" 
              fillOpacity={0.3} 
              isAnimationActive={false}
            />
          )}

          {/* Línea principal */}
          <Line 
            type="monotone" 
            dataKey="y" 
            stroke="hsl(var(--primary))" 
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
