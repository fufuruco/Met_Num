/**
 * mathParser.js — evaluador seguro de expresiones matemáticas.
 *
 * Estrategia: remplazar todas las funciones con placeholders únicos
 * primero, para evitar que un reemplazo posterior corrompa uno anterior.
 * Ejemplo: "ln(x)" → placeholder → "Math.log(x)"
 *          sin que la regex de "log" lo convierta después en "Math.Math.log10(x)".
 */

const FUNC_MAP = [
  // Inversas trigonométricas (antes de sin/cos/tan)
  ['asin',  'Math.asin'],
  ['acos',  'Math.acos'],
  ['atan',  'Math.atan'],
  // Hiperbólicas (antes de sin/cos/tan)
  ['sinh',  'Math.sinh'],
  ['cosh',  'Math.cosh'],
  ['tanh',  'Math.tanh'],
  // Trigonométricas básicas
  ['sin',   'Math.sin'],
  ['sen',   'Math.sin'],   // alias español
  ['cos',   'Math.cos'],
  ['tan',   'Math.tan'],
  // Logaritmos (log10 antes de log, para evitar match parcial)
  ['log10', 'Math.log10'],
  ['ln',    'Math.log'],   // logaritmo natural
  ['log',   'Math.log10'], // sin prefijo → base 10
  // Otras
  ['sqrt',  'Math.sqrt'],
  ['abs',   'Math.abs'],
  ['exp',   'Math.exp'],
  ['ceil',  'Math.ceil'],
  ['floor', 'Math.floor'],
];

export function evaluateFunction(expr, x) {
  if (!expr || typeof expr !== 'string') return NaN;

  let s = expr.trim();

  // 1. Potencias
  s = s.replace(/\^/g, '**');

  // 2. Reemplazar funciones con placeholders únicos (evita doble-reemplazo)
  const restore = [];
  FUNC_MAP.forEach(([name, jsName], idx) => {
    const token = `\x00F${idx}\x00`;          // token imposible de generar a mano
    const regex = new RegExp(`\\b${name}\\s*\\(`, 'gi');
    if (regex.test(s)) {
      s = s.replace(regex, token);
      restore.push([token, jsName + '(']);
    }
  });

  // 3. Constantes (después de reemplazar funciones, para no tocar "exp", etc.)
  s = s.replace(/\bpi\b/gi, 'Math.PI');
  // "e" suelto: no precedido ni seguido de letra/dígito/guión bajo/paréntesis
  s = s.replace(/(?<![0-9A-Za-z_])e(?![0-9A-Za-z_(])/g, 'Math.E');

  // 4. Restaurar placeholders → nombres JS reales
  restore.forEach(([token, jsName]) => {
    s = s.split(token).join(jsName);
  });

  // 5. Multiplicación implícita (2x → 2*x, 2( → 2*(, )( → )*(  )
  s = s.replace(/(\d)([A-Za-z(])/g, '$1*$2');
  s = s.replace(/\)\s*\(/g, ')*(');

  try {
    // eslint-disable-next-line no-new-func
    const fn = new Function('x', `"use strict"; return (${s});`);
    const result = fn(x);
    return (typeof result === 'number' && !Number.isNaN(result)) ? result : NaN;
  } catch {
    return NaN;
  }
}

/**
 * Derivada numérica por diferencia central (más precisa que diferencia hacia adelante).
 */
export function evaluateDerivative(expr, x, h = 1e-7) {
  const fph = evaluateFunction(expr, x + h);
  const fmh = evaluateFunction(expr, x - h);
  return (fph - fmh) / (2 * h);
}

export function generatePlotPoints(expr, xMin, xMax, numPoints = 300) {
  const points = [];
  const step = (xMax - xMin) / numPoints;
  for (let i = 0; i <= numPoints; i++) {
    const xv = xMin + i * step;
    const y  = evaluateFunction(expr, xv);
    if (isFinite(y) && Math.abs(y) < 1e6) {
      points.push({ x: parseFloat(xv.toFixed(8)), y: parseFloat(y.toFixed(8)) });
    }
  }
  return points;
}

/**
 * substituteExpr — devuelve la expresión con 'x' reemplazada por el valor,
 * para mostrar el cálculo expandido: substituteExpr('x^3 - 2*x - 5', 1)
 * → '(1)^3 - 2*(1) - 5'
 */
export function substituteExpr(expr, x) {
  if (!expr || typeof expr !== 'string') return String(x);
  // Formato limpio del número: sin ceros innecesarios
  const numStr = Number.isInteger(x) ? String(x) : parseFloat(x.toPrecision(6)).toString();
  const wrapped = `(${numStr})`;
  // Reemplaza 'x' que no forma parte de otro identificador (sin x dentro de exp, xr, etc.)
  return expr.replace(/\bx\b/g, wrapped);
}