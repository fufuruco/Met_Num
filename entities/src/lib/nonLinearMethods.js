import { evaluateFunction, evaluateDerivative, substituteExpr } from './mathParser';

/* ── helpers ──────────────────────────────────────────────────────── */
const fmt = (n, d = 8) => (typeof n === 'number' && isFinite(n) ? n.toFixed(d) : String(n));
const pct = (n) => (isFinite(n) ? n.toFixed(6) + '%' : '—');

/* ════════════════════════════════════════════════════════════════════
   BISECCIÓN
════════════════════════════════════════════════════════════════════ */
export function bisection(expr, a, b, tol, maxIter) {
  const steps = [];
  let fa = evaluateFunction(expr, a);
  let fb = evaluateFunction(expr, b);

  if (!isFinite(fa) || !isFinite(fb))
    return { error: `No se pudo evaluar f(x) en el intervalo. Revisa la expresión.`, steps: [] };
  if (fa * fb > 0)
    return { error: 'No hay cambio de signo en [a, b]. f(a) y f(b) deben tener signos opuestos.', steps: [] };

  for (let i = 1; i <= maxIter; i++) {
    // Snapshot BEFORE updating
    const ai = a, bi = b, fai = fa, fbi = fb;

    const xr  = (ai + bi) / 2;
    const fxr = evaluateFunction(expr, xr);
    const error = i === 1 ? 100 : Math.abs((xr - steps[steps.length - 1].xr) / xr) * 100;

    const procedure = [
      `**Iteración ${i}**`,
      `a = ${fmt(ai)},   b = ${fmt(bi)}`,
      `f(a) = f(${fmt(ai)}) = ${substituteExpr(expr, ai)} = ${fmt(fai)}`,
      `f(b) = f(${fmt(bi)}) = ${substituteExpr(expr, bi)} = ${fmt(fbi)}`,
      `─────────────────────────────────`,
      `xr = (a + b) / 2`,
      `xr = (${fmt(ai)} + ${fmt(bi)}) / 2`,
      `xr = ${fmt(xr)}`,
      `f(xr) = f(${fmt(xr)}) = ${substituteExpr(expr, xr)} = ${fmt(fxr)}`,
      `─────────────────────────────────`,
    ];

    if (!isFinite(fxr)) {
      procedure.push(`⚠ f(xr) = NaN — la función no es evaluable en xr = ${fmt(xr)}`);
      return { error: `Evaluación inválida en xr = ${fmt(xr)}. Revisa la expresión.`, steps };
    }

    if (fai * fxr < 0) {
      procedure.push(`f(a)·f(xr) = ${fmt(fai * fxr)} < 0`);
      procedure.push(`→ La raíz está en [${fmt(ai)}, ${fmt(xr)}]`);
      procedure.push(`Nuevo intervalo: a = ${fmt(ai)}, b = ${fmt(xr)}`);
      b = xr; fb = fxr;
    } else if (fai * fxr > 0) {
      procedure.push(`f(a)·f(xr) = ${fmt(fai * fxr)} > 0`);
      procedure.push(`→ La raíz está en [${fmt(xr)}, ${fmt(bi)}]`);
      procedure.push(`Nuevo intervalo: a = ${fmt(xr)}, b = ${fmt(bi)}`);
      a = xr; fa = fxr;
    } else {
      procedure.push(`f(xr) = 0 → ¡Raíz exacta encontrada!`);
      steps.push({ i, a: ai, b: bi, fa: fai, fb: fbi, xr, fxr, error });
      return { root: xr, steps, iterations: i };
    }

    // Error expandido
    if (i === 1) {
      procedure.push(`Error relativo = 100% (primera iteración, no hay xr previo)`);
    } else {
      const xrPrev = steps[steps.length - 1].xr;
      procedure.push(`Error relativo = |( xr_actual − xr_prev ) / xr_actual| × 100`);
      procedure.push(`Error relativo = |(${fmt(xr)} − ${fmt(xrPrev)}) / ${fmt(xr)}| × 100`);
      procedure.push(`Error relativo = ${pct(error)}`);
    }

    // Store the BEFORE-UPDATE snapshot for the table
    steps.push({ i, a: ai, b: bi, fa: fai, fb: fbi, xr, fxr, error, procedure });

    if (Math.abs(fxr) < tol || error < tol)
      return { root: xr, steps, iterations: i };
  }

  return {
    root: steps[steps.length - 1].xr,
    steps,
    iterations: maxIter,
    warning: 'Se alcanzó el número máximo de iteraciones.',
  };
}

/* ════════════════════════════════════════════════════════════════════
   REGULA FALSI
════════════════════════════════════════════════════════════════════ */
export function regulaFalsi(expr, a, b, tol, maxIter) {
  const steps = [];
  let fa = evaluateFunction(expr, a);
  let fb = evaluateFunction(expr, b);

  if (!isFinite(fa) || !isFinite(fb))
    return { error: `No se pudo evaluar f(x) en el intervalo. Revisa la expresión.`, steps: [] };
  if (fa * fb > 0)
    return { error: 'No hay cambio de signo en [a, b].', steps: [] };

  for (let i = 1; i <= maxIter; i++) {
    const ai = a, bi = b, fai = fa, fbi = fb;

    const denom = fbi - fai;
    if (Math.abs(denom) < 1e-15)
      return { error: 'f(b) - f(a) ≈ 0, división por cero.', steps };

    const xr  = ai - fai * (bi - ai) / denom;
    const fxr = evaluateFunction(expr, xr);
    const error = i === 1 ? 100 : Math.abs((xr - steps[steps.length - 1].xr) / xr) * 100;

    const procedure = [
      `**Iteración ${i}**`,
      `a = ${fmt(ai)},   b = ${fmt(bi)}`,
      `f(a) = f(${fmt(ai)}) = ${substituteExpr(expr, ai)} = ${fmt(fai)}`,
      `f(b) = f(${fmt(bi)}) = ${substituteExpr(expr, bi)} = ${fmt(fbi)}`,
      `─────────────────────────────────`,
      `xr = a − f(a)·(b − a) / (f(b) − f(a))`,
      `xr = ${fmt(ai)} − (${fmt(fai)})·(${fmt(bi - ai)}) / (${fmt(denom)})`,
      `xr = ${fmt(xr)}`,
      `f(xr) = f(${fmt(xr)}) = ${substituteExpr(expr, xr)} = ${fmt(fxr)}`,
      `─────────────────────────────────`,
    ];

    if (fai * fxr < 0) {
      procedure.push(`f(a)·f(xr) < 0 → Raíz en [${fmt(ai)}, ${fmt(xr)}]`);
      b = xr; fb = fxr;
    } else {
      procedure.push(`f(a)·f(xr) > 0 → Raíz en [${fmt(xr)}, ${fmt(bi)}]`);
      a = xr; fa = fxr;
    }
    // Error expandido
    if (i === 1) {
      procedure.push(`Error relativo = 100% (primera iteración, no hay xr previo)`);
    } else {
      const xrPrev = steps[steps.length - 1].xr;
      procedure.push(`Error relativo = |( xr_actual − xr_prev ) / xr_actual| × 100`);
      procedure.push(`Error relativo = |(${fmt(xr)} − ${fmt(xrPrev)}) / ${fmt(xr)}| × 100`);
      procedure.push(`Error relativo = ${pct(error)}`);
    }

    steps.push({ i, a: ai, b: bi, fa: fai, fb: fbi, xr, fxr, error, procedure });

    if (Math.abs(fxr) < tol || error < tol)
      return { root: xr, steps, iterations: i };
  }

  return {
    root: steps[steps.length - 1].xr,
    steps,
    iterations: maxIter,
    warning: 'Se alcanzó el máximo de iteraciones.',
  };
}

/* ════════════════════════════════════════════════════════════════════
   NEWTON-RAPHSON
════════════════════════════════════════════════════════════════════ */
export function newtonRaphson(expr, x0, tol, maxIter) {
  const steps = [];
  let xi = x0;

  for (let i = 1; i <= maxIter; i++) {
    const fxi  = evaluateFunction(expr, xi);
    const fpxi = evaluateDerivative(expr, xi);

    if (!isFinite(fxi))
      return { error: `f(${fmt(xi)}) no es finita. Revisa la expresión.`, steps };
    if (Math.abs(fpxi) < 1e-12)
      return { error: `La derivada es ≈ 0 en x = ${fmt(xi)}. El método no puede continuar.`, steps };

    const xiNew = xi - fxi / fpxi;
    const error = Math.abs(xiNew) > 1e-15
      ? Math.abs((xiNew - xi) / xiNew) * 100
      : Math.abs(xiNew - xi) * 100;

    const procedure = [
      `**Iteración ${i}**`,
      `xi = ${fmt(xi)}`,
      `f(xi) = f(${fmt(xi)}) = ${substituteExpr(expr, xi)} = ${fmt(fxi)}`,
      `f'(xi) ≈ ${fmt(fpxi)}  (derivada numérica central)`,
      `─────────────────────────────────`,
      `xi+1 = xi − f(xi) / f'(xi)`,
      `xi+1 = ${fmt(xi)} − (${fmt(fxi)}) / (${fmt(fpxi)})`,
      `xi+1 = ${fmt(xiNew)}`,
      `─────────────────────────────────`,
      `Error relativo = |( xi+1 − xi ) / xi+1| × 100`,
      `Error relativo = |(${fmt(xiNew)} − ${fmt(xi)}) / ${fmt(xiNew)}| × 100`,
      `Error relativo = ${pct(error)}`,
    ];

    steps.push({ i, xi, fxi, fpxi, xiNew, error, procedure });
    xi = xiNew;

    if (error < tol || Math.abs(fxi) < tol)
      return { root: xiNew, steps, iterations: i };
  }

  return { root: xi, steps, iterations: maxIter, warning: 'Se alcanzó el máximo de iteraciones.' };
}

/* ════════════════════════════════════════════════════════════════════
   SECANTE
════════════════════════════════════════════════════════════════════ */
export function secant(expr, x0, x1, tol, maxIter) {
  const steps = [];
  let xiPrev = x0;
  let xi     = x1;

  for (let i = 1; i <= maxIter; i++) {
    const fPrev = evaluateFunction(expr, xiPrev);
    const fi    = evaluateFunction(expr, xi);
    const denom = fi - fPrev;

    if (Math.abs(denom) < 1e-12)
      return { error: 'f(xi) − f(xi−1) ≈ 0. El método no puede continuar.', steps };

    const xiNew = xi - fi * (xi - xiPrev) / denom;
    const error = Math.abs(xiNew) > 1e-15
      ? Math.abs((xiNew - xi) / xiNew) * 100
      : Math.abs(xiNew - xi) * 100;

    const procedure = [
      `**Iteración ${i}**`,
      `xi−1 = ${fmt(xiPrev)},   xi = ${fmt(xi)}`,
      `f(xi−1) = f(${fmt(xiPrev)}) = ${substituteExpr(expr, xiPrev)} = ${fmt(fPrev)}`,
      `f(xi)   = f(${fmt(xi)}) = ${substituteExpr(expr, xi)} = ${fmt(fi)}`,
      `─────────────────────────────────`,
      `xi+1 = xi − f(xi)·(xi − xi−1) / (f(xi) − f(xi−1))`,
      `xi+1 = ${fmt(xi)} − (${fmt(fi)})·(${fmt(xi - xiPrev)}) / (${fmt(denom)})`,
      `xi+1 = ${fmt(xiNew)}`,
      `─────────────────────────────────`,
      `Error relativo = |( xi+1 − xi ) / xi+1| × 100`,
      `Error relativo = |(${fmt(xiNew)} − ${fmt(xi)}) / ${fmt(xiNew)}| × 100`,
      `Error relativo = ${pct(error)}`,
    ];

    steps.push({ i, xiPrev, xi, fPrev, fi, xiNew, error, procedure });
    xiPrev = xi;
    xi     = xiNew;

    if (error < tol || Math.abs(fi) < tol)
      return { root: xiNew, steps, iterations: i };
  }

  return { root: xi, steps, iterations: maxIter, warning: 'Se alcanzó el máximo de iteraciones.' };
}

/* ════════════════════════════════════════════════════════════════════
   PUNTO FIJO
════════════════════════════════════════════════════════════════════ */
export function fixedPoint(expr, gExpr, x0, tol, maxIter) {
  const steps = [];
  let xi = x0;

  for (let i = 1; i <= maxIter; i++) {
    const fxi = evaluateFunction(expr, xi);
    const gxi = evaluateFunction(gExpr, xi);

    if (!isFinite(gxi))
      return { error: `g(${fmt(xi)}) diverge. Verifica que |g'(x)| < 1 cerca de la raíz.`, steps };

    const error = i === 1
      ? 100
      : Math.abs(gxi) > 1e-15
        ? Math.abs((gxi - xi) / gxi) * 100
        : Math.abs(gxi - xi) * 100;

    const procedure = [
      `**Iteración ${i}**`,
      `xi = ${fmt(xi)}`,
      `f(xi) = f(${fmt(xi)}) = ${substituteExpr(expr, xi)} = ${fmt(fxi)}`,
      `g(xi) = g(${fmt(xi)}) = ${substituteExpr(gExpr, xi)} = ${fmt(gxi)}`,
      `─────────────────────────────────`,
      `xi+1 = g(xi) = ${fmt(gxi)}`,
    ];

    // Agregar líneas de error expandidas después del array
    if (i === 1) {
      procedure.push(`Error relativo = 100% (primera iteración, no hay xi previo)`);
    } else {
      procedure.push(`Error relativo = |( xi+1 − xi ) / xi+1| × 100`);
      procedure.push(`Error relativo = |(${fmt(gxi)} − ${fmt(xi)}) / ${fmt(gxi)}| × 100`);
      procedure.push(`Error relativo = ${pct(error)}`);
    }

    steps.push({ i, xi, fxi, gxi, error, procedure });

    if (error < tol || Math.abs(fxi) < tol)
      return { root: gxi, steps, iterations: i };

    xi = gxi;
  }

  return { root: xi, steps, iterations: maxIter, warning: 'Se alcanzó el máximo de iteraciones.' };
}