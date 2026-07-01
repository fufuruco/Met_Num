import { evaluateFunction } from './mathParser';

export function trapezoidal(expr, a, b, n) {
  const h = (b - a) / n;
  const steps = [`**Método del Trapecio**`, `h = (b - a) / n = (${b} - ${a}) / ${n} = ${h.toFixed(6)}`];
  let sum = evaluateFunction(expr, a) + evaluateFunction(expr, b);
  steps.push(`f(x0) = f(${a}) = ${evaluateFunction(expr, a).toFixed(6)}`);
  
  const tableRows = [{ i: 0, x: a, fx: evaluateFunction(expr, a) }];
  for (let i = 1; i < n; i++) {
    const xi = a + i * h;
    const fxi = evaluateFunction(expr, xi);
    sum += 2 * fxi;
    tableRows.push({ i, x: xi, fx: fxi });
    steps.push(`f(x${i}) = f(${xi.toFixed(6)}) = ${fxi.toFixed(6)}`);
  }
  tableRows.push({ i: n, x: b, fx: evaluateFunction(expr, b) });
  steps.push(`f(x${n}) = f(${b}) = ${evaluateFunction(expr, b).toFixed(6)}`);
  
  const result = (h / 2) * sum;
  steps.push(`\nI = (h/2) · [f(x0) + 2·Σf(xi) + f(xn)]`);
  steps.push(`I = (${h.toFixed(6)}/2) · ${sum.toFixed(6)} = **${result.toFixed(6)}**`);
  return { result, steps, tableRows };
}

export function simpson13(expr, a, b, n) {
  if (n % 2 !== 0) return { error: 'n debe ser par para Simpson 1/3.' };
  const h = (b - a) / n;
  const steps = [`**Simpson 1/3**`, `h = (${b} - ${a}) / ${n} = ${h.toFixed(6)}`];
  
  let sum = evaluateFunction(expr, a) + evaluateFunction(expr, b);
  const tableRows = [{ i: 0, x: a, fx: evaluateFunction(expr, a) }];
  
  for (let i = 1; i < n; i++) {
    const xi = a + i * h;
    const fxi = evaluateFunction(expr, xi);
    sum += (i % 2 === 0 ? 2 : 4) * fxi;
    tableRows.push({ i, x: xi, fx: fxi, coeff: i % 2 === 0 ? 2 : 4 });
    steps.push(`f(x${i}) = f(${xi.toFixed(6)}) = ${fxi.toFixed(6)} [coef: ${i % 2 === 0 ? 2 : 4}]`);
  }
  tableRows.push({ i: n, x: b, fx: evaluateFunction(expr, b) });
  
  const result = (h / 3) * sum;
  steps.push(`\nI = (h/3) · [f(x0) + 4·f(x1) + 2·f(x2) + ... + f(xn)]`);
  steps.push(`I = (${h.toFixed(6)}/3) · ${sum.toFixed(6)} = **${result.toFixed(6)}**`);
  return { result, steps, tableRows };
}

export function simpson38(expr, a, b, n) {
  if (n % 3 !== 0) return { error: 'n debe ser múltiplo de 3 para Simpson 3/8.' };
  const h = (b - a) / n;
  const steps = [`**Simpson 3/8**`, `h = (${b} - ${a}) / ${n} = ${h.toFixed(6)}`];
  
  let sum = evaluateFunction(expr, a) + evaluateFunction(expr, b);
  const tableRows = [{ i: 0, x: a, fx: evaluateFunction(expr, a) }];
  
  for (let i = 1; i < n; i++) {
    const xi = a + i * h;
    const fxi = evaluateFunction(expr, xi);
    const coeff = i % 3 === 0 ? 2 : 3;
    sum += coeff * fxi;
    tableRows.push({ i, x: xi, fx: fxi, coeff });
    steps.push(`f(x${i}) = f(${xi.toFixed(6)}) = ${fxi.toFixed(6)} [coef: ${coeff}]`);
  }
  tableRows.push({ i: n, x: b, fx: evaluateFunction(expr, b) });
  
  const result = (3 * h / 8) * sum;
  steps.push(`\nI = (3h/8) · [f(x0) + 3·f(x1) + 3·f(x2) + 2·f(x3) + ... + f(xn)]`);
  steps.push(`I = ${result.toFixed(6)}`);
  return { result, steps, tableRows };
}

export function finiteDifferences(expr, x, h) {
  const fxMinus2 = evaluateFunction(expr, x - 2 * h);
  const fxMinus1 = evaluateFunction(expr, x - h);
  const fx = evaluateFunction(expr, x);
  const fxPlus1 = evaluateFunction(expr, x + h);
  const fxPlus2 = evaluateFunction(expr, x + 2 * h);
  
  const forward = (fxPlus1 - fx) / h;
  const backward = (fx - fxMinus1) / h;
  const central = (fxPlus1 - fxMinus1) / (2 * h);
  const second = (fxPlus1 - 2 * fx + fxMinus1) / (h * h);
  
  const steps = [
    `**Diferencias Finitas en x = ${x}, h = ${h}**`,
    `f(x-2h) = f(${(x - 2*h).toFixed(4)}) = ${fxMinus2.toFixed(6)}`,
    `f(x-h) = f(${(x - h).toFixed(4)}) = ${fxMinus1.toFixed(6)}`,
    `f(x) = f(${x}) = ${fx.toFixed(6)}`,
    `f(x+h) = f(${(x + h).toFixed(4)}) = ${fxPlus1.toFixed(6)}`,
    `f(x+2h) = f(${(x + 2*h).toFixed(4)}) = ${fxPlus2.toFixed(6)}`,
    ``,
    `**Diferencia hacia adelante:** f'(x) ≈ [f(x+h) - f(x)] / h = ${forward.toFixed(6)}`,
    `**Diferencia hacia atrás:** f'(x) ≈ [f(x) - f(x-h)] / h = ${backward.toFixed(6)}`,
    `**Diferencia central:** f'(x) ≈ [f(x+h) - f(x-h)] / 2h = ${central.toFixed(6)}`,
    `**Segunda derivada:** f''(x) ≈ [f(x+h) - 2f(x) + f(x-h)] / h² = ${second.toFixed(6)}`,
  ];
  
  return { forward, backward, central, second, steps };
}