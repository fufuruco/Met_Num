// Simple math expression parser that evaluates f(x) from a string
export function evaluateFunction(expr, x) {
  const sanitized = expr
    .replace(/\^/g, '**')
    .replace(/sen\(/gi, 'Math.sin(')
    .replace(/cos\(/gi, 'Math.cos(')
    .replace(/tan\(/gi, 'Math.tan(')
    .replace(/sin\(/gi, 'Math.sin(')
    .replace(/log\(/gi, 'Math.log10(')
    .replace(/ln\(/gi, 'Math.log(')
    .replace(/sqrt\(/gi, 'Math.sqrt(')
    .replace(/abs\(/gi, 'Math.abs(')
    .replace(/exp\(/gi, 'Math.exp(')
    .replace(/pi/gi, 'Math.PI')
    .replace(/e(?![x])/gi, 'Math.E');
  
  try {
    const fn = new Function('x', `return ${sanitized}`);
    return fn(x);
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