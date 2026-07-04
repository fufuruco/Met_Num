// Simple math expression parser that evaluates f(x) from a string
export function evaluateFunction(expr, x) {
  // Replace functions first (order matters: longer names before shorter)
  const sanitized = expr
    .replace(/\^/g, '**')
    .replace(/sen\s*\(/gi, 'Math.sin(')
    .replace(/sin\s*\(/gi, 'Math.sin(')
    .replace(/cos\s*\(/gi, 'Math.cos(')
    .replace(/tan\s*\(/gi, 'Math.tan(')
    .replace(/sqrt\s*\(/gi, 'Math.sqrt(')
    .replace(/abs\s*\(/gi, 'Math.abs(')
    .replace(/exp\s*\(/gi, 'Math.exp(')
    .replace(/ln\s*\(/gi, 'Math.log(')
    .replace(/log\s*\(/gi, 'Math.log10(')
    // pi and e as standalone constants (not inside words like "Math.exp")
    .replace(/\bpi\b/gi, 'Math.PI')
    .replace(/\be\b/g, 'Math.E');
  
  try {
    const fn = new Function('x', `return ${sanitized}`);
    const result = fn(x);
    return result;
  } catch {
    return NaN;
  }
}

export function evaluateDerivative(expr, x, h = 1e-8) {
  const fx = evaluateFunction(expr, x);
  const fxh = evaluateFunction(expr, x + h);
  return (fxh - fx) / h;
}

export function generatePlotPoints(expr, xMin, xMax, numPoints = 200) {
  const points = [];
  const step = (xMax - xMin) / numPoints;
  for (let i = 0; i <= numPoints; i++) {
    const x = xMin + i * step;
    const y = evaluateFunction(expr, x);
    if (isFinite(y) && Math.abs(y) < 1e6) {
      points.push({ x: parseFloat(x.toFixed(8)), y: parseFloat(y.toFixed(8)) });
    }
  }
  return points;
}