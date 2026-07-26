// Simple math expression parser that evaluates f(x) or f(x,y,z) from a string
export function evaluateFunction(expr, variables = {}) {
  // Manejar el caso de que "variables" sea solo "x" por retrocompatibilidad
  let scope = variables;
  if (typeof variables !== 'object') {
    scope = { x: variables };
  }

  // Si es una ecuación (e.g. x^2 = 4), la convertimos en (x^2) - (4) para graficar sus raíces
  let parseExpr = expr;
  if (parseExpr.includes('=')) {
    const parts = parseExpr.split('=');
    parseExpr = `(${parts[0]}) - (${parts[1]})`;
  }

  let sanitized = parseExpr
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
    .replace(/\bpi\b/gi, 'Math.PI')
    .replace(/\be\b/g, 'Math.E')
    // Soportar multiplicación implícita básica: 2x -> 2*x, 3y -> 3*y
    .replace(/(\d)([xyz])/gi, '$1*$2')
    // Soportar x( -> x*(
    .replace(/([xyz])\(/gi, '$1*(')
    // Soportar )x -> )*x
    .replace(/\)([xyz])/gi, ')*$1');

  try {
    const varNames = Object.keys(scope);
    const varValues = Object.values(scope);
    const fn = new Function(...varNames, `return ${sanitized}`);
    const result = fn(...varValues);
    return result;
  } catch {
    return NaN;
  }
}

export function evaluateDerivative(expr, x, h = 1e-8) {
  const fx = evaluateFunction(expr, { x });
  const fxh = evaluateFunction(expr, { x: x + h });
  return (fxh - fx) / h;
}

export function generatePlotPoints(expr, xMin, xMax, numPoints = 200) {
  const points = [];
  const step = (xMax - xMin) / numPoints;
  for (let i = 0; i <= numPoints; i++) {
    const x = xMin + i * step;
    const y = evaluateFunction(expr, { x });
    if (isFinite(y) && Math.abs(y) < 1e6) {
      points.push({ x: parseFloat(x.toFixed(8)), y: parseFloat(y.toFixed(8)) });
    }
  }
  return points;
}