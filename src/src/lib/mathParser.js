// Math expression parser that evaluates f(x) from a string
// Handles implicit multiplication (2x → 2*x, 2(x+1) → 2*(x+1), ex → e*x, etc.)
export function evaluateFunction(expr, x) {
  let s = expr.replace(/\^/g, '**');

  // Step 1: Protect function names with placeholders so implicit multiplication
  // and constant replacement don't break them apart (e.g. "exp" → "e*x*p")
  s = s
    .replace(/\bsen\(/gi, '__SEN__(')
    .replace(/\bsin\(/gi, '__SIN__(')
    .replace(/\bcos\(/gi, '__COS__(')
    .replace(/\btan\(/gi, '__TAN__(')
    .replace(/\bln\(/gi, '__LN__(')
    .replace(/\blog\(/gi, '__LOG__(')
    .replace(/\bsqrt\(/gi, '__SQRT__(')
    .replace(/\babs\(/gi, '__ABS__(')
    .replace(/\bexp\(/gi, '__EXP__(');

  // Step 2: Replace bare 'exp' (not followed by '(') with Euler's number e
  s = s.replace(/\bexp\b/gi, 'e');

  // Step 3: Implicit multiplication (function names are now safe as __NAME__ tokens)
  let prev;
  let count = 0;
  do {
    prev = s;
    s = s
      .replace(/(\d)([a-zA-Z_(])/g, '$1*$2')
      .replace(/(\))([a-zA-Z0-9_(])/g, '$1*$2')
      .replace(/(^|[^a-zA-Z_])x([a-zA-Z0-9_(])/gi, '$1x*$2')
      .replace(/(^|[^a-zA-Z_])e([a-zA-Z0-9_(])/gi, '$1e*$2')
      .replace(/(^|[^a-zA-Z_])pi([a-zA-Z0-9_(])/gi, '$1pi*$2');
  } while (s !== prev && count++ < 20);

  // Step 4: Restore function placeholders → Math.*
  s = s
    .replace(/__SEN__/g, 'Math.sin')
    .replace(/__SIN__/g, 'Math.sin')
    .replace(/__COS__/g, 'Math.cos')
    .replace(/__TAN__/g, 'Math.tan')
    .replace(/__LN__/g, 'Math.log')
    .replace(/__LOG__/g, 'Math.log10')
    .replace(/__SQRT__/g, 'Math.sqrt')
    .replace(/__ABS__/g, 'Math.abs')
    .replace(/__EXP__/g, 'Math.exp');

  // Step 5: Replace constants e and pi (not inside Math.* or __*__ tokens)
  s = s
    .replace(/(^|[^a-zA-Z_])pi(?![a-zA-Z_])/gi, '$1Math.PI')
    .replace(/(^|[^a-zA-Z_])e(?![a-zA-Z_])/gi, '$1Math.E');

  // Step 6: Implicit multiplication for Math.E and Math.PI followed by factors
  s = s
    .replace(/(Math\.E)([a-zA-Z0-9_(])/g, '$1*$2')
    .replace(/(Math\.PI)([a-zA-Z0-9_(])/g, '$1*$2');

  try {
    const fn = new Function('x', `return ${s}`);
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