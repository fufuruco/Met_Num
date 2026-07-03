import { evaluateFunction, evaluateDerivative } from './mathParser';

export function bisection(expr, a, b, tol, maxIter) {
  const steps = [];
  let fa = evaluateFunction(expr, a);
  let fb = evaluateFunction(expr, b);
  
  if (fa * fb > 0) return { error: 'No hay cambio de signo en el intervalo [a, b]. Verifique que f(a) y f(b) tengan signos opuestos.', steps: [] };
  
  for (let i = 1; i <= maxIter; i++) {
    const xr = (a + b) / 2;
    const fxr = evaluateFunction(expr, xr);
    const error = i === 1 ? 100 : Math.abs((xr - steps[steps.length - 1].xr) / xr) * 100;
    
    const procedure = [
      `**Iteración ${i}**`,
      `a = ${a.toFixed(6)}, b = ${b.toFixed(6)}`,
      `f(a) = f(${a.toFixed(6)}) = ${fa.toFixed(6)}`,
      `f(b) = f(${b.toFixed(6)}) = ${fb.toFixed(6)}`,
      `xr = (a + b) / 2 = (${a.toFixed(6)} + ${b.toFixed(6)}) / 2 = ${xr.toFixed(6)}`,
      `f(xr) = f(${xr.toFixed(6)}) = ${fxr.toFixed(6)}`,
    ];
    
    if (fa * fxr < 0) {
      procedure.push(`f(a) × f(xr) = ${(fa * fxr).toFixed(6)} < 0 → La raíz está en [${a.toFixed(6)}, ${xr.toFixed(6)}]`);
      procedure.push(`Nuevo intervalo: [${a.toFixed(6)}, ${xr.toFixed(6)}]`);
      b = xr; fb = fxr;
    } else if (fa * fxr > 0) {
      procedure.push(`f(a) × f(xr) = ${(fa * fxr).toFixed(6)} > 0 → La raíz está en [${xr.toFixed(6)}, ${b.toFixed(6)}]`);
      procedure.push(`Nuevo intervalo: [${xr.toFixed(6)}, ${b.toFixed(6)}]`);
      a = xr; fa = fxr;
    } else {
      procedure.push(`f(xr) = 0 → ¡Raíz exacta encontrada!`);
    }
    
    steps.push({ i, a: parseFloat(a.toFixed(8)), b: parseFloat(b.toFixed(8)), xr, fxr, error, procedure });
    
    if (Math.abs(fxr) < tol || error < tol) {
      return { root: xr, steps, iterations: i };
    }
  }
  return { root: steps[steps.length - 1].xr, steps, iterations: maxIter, warning: 'Se alcanzó el número máximo de iteraciones.' };
}

export function regulaFalsi(expr, a, b, tol, maxIter) {
  const steps = [];
  let fa = evaluateFunction(expr, a);
  let fb = evaluateFunction(expr, b);
  
  if (fa * fb > 0) return { error: 'No hay cambio de signo en el intervalo [a, b].', steps: [] };
  
  for (let i = 1; i <= maxIter; i++) {
    const xr = a - (fa * (b - a)) / (fb - fa);
    const fxr = evaluateFunction(expr, xr);
    const error = i === 1 ? 100 : Math.abs((xr - steps[steps.length - 1].xr) / xr) * 100;
    
    const procedure = [
      `**Iteración ${i}**`,
      `a = ${a.toFixed(6)}, b = ${b.toFixed(6)}`,
      `f(a) = ${fa.toFixed(6)}, f(b) = ${fb.toFixed(6)}`,
      `xr = a - f(a)·(b - a) / (f(b) - f(a))`,
      `xr = ${a.toFixed(6)} - (${fa.toFixed(6)})(${(b - a).toFixed(6)}) / (${fb.toFixed(6)} - ${fa.toFixed(6)})`,
      `xr = ${xr.toFixed(6)}`,
      `f(xr) = ${fxr.toFixed(6)}`,
    ];
    
    if (fa * fxr < 0) {
      procedure.push(`f(a) × f(xr) < 0 → Nuevo intervalo: [${a.toFixed(6)}, ${xr.toFixed(6)}]`);
      b = xr; fb = fxr;
    } else {
      procedure.push(`f(a) × f(xr) > 0 → Nuevo intervalo: [${xr.toFixed(6)}, ${b.toFixed(6)}]`);
      a = xr; fa = fxr;
    }
    
    steps.push({ i, a: parseFloat(a.toFixed(8)), b: parseFloat(b.toFixed(8)), xr, fxr, error, procedure });
    
    if (Math.abs(fxr) < tol || error < tol) {
      return { root: xr, steps, iterations: i };
    }
  }
  return { root: steps[steps.length - 1].xr, steps, iterations: maxIter, warning: 'Se alcanzó el máximo de iteraciones.' };
}

export function newtonRaphson(expr, x0, tol, maxIter) {
  const steps = [];
  let xi = x0;
  
  for (let i = 1; i <= maxIter; i++) {
    const fxi = evaluateFunction(expr, xi);
    const fpxi = evaluateDerivative(expr, xi);
    
    if (Math.abs(fpxi) < 1e-12) return { error: `La derivada es cero en x = ${xi.toFixed(6)}. El método no puede continuar.`, steps };
    
    const xiNew = xi - fxi / fpxi;
    const error = Math.abs((xiNew - xi) / xiNew) * 100;
    
    const procedure = [
      `**Iteración ${i}**`,
      `xi = ${xi.toFixed(6)}`,
      `f(xi) = f(${xi.toFixed(6)}) = ${fxi.toFixed(6)}`,
      `f'(xi) ≈ ${fpxi.toFixed(6)}`,
      `xi+1 = xi - f(xi)/f'(xi)`,
      `xi+1 = ${xi.toFixed(6)} - (${fxi.toFixed(6)}) / (${fpxi.toFixed(6)})`,
      `xi+1 = ${xiNew.toFixed(6)}`,
      `Error = |${xiNew.toFixed(6)} - ${xi.toFixed(6)}| / |${xiNew.toFixed(6)}| × 100 = ${error.toFixed(6)}%`,
    ];
    
    steps.push({ i, xi, xiNew, fxi, fpxi, error, procedure });
    xi = xiNew;
    
    if (error < tol || Math.abs(fxi) < tol) {
      return { root: xiNew, steps, iterations: i };
    }
  }
  return { root: xi, steps, iterations: maxIter, warning: 'Se alcanzó el máximo de iteraciones.' };
}

export function secant(expr, x0, x1, tol, maxIter) {
  const steps = [];
  let xiPrev = x0;
  let xi = x1;
  
  for (let i = 1; i <= maxIter; i++) {
    const fPrev = evaluateFunction(expr, xiPrev);
    const fi = evaluateFunction(expr, xi);
    
    if (Math.abs(fi - fPrev) < 1e-12) return { error: 'f(xi) - f(xi-1) ≈ 0. El método no puede continuar.', steps };
    
    const xiNew = xi - fi * (xi - xiPrev) / (fi - fPrev);
    const error = Math.abs((xiNew - xi) / xiNew) * 100;
    
    const procedure = [
      `**Iteración ${i}**`,
      `xi-1 = ${xiPrev.toFixed(6)}, xi = ${xi.toFixed(6)}`,
      `f(xi-1) = ${fPrev.toFixed(6)}, f(xi) = ${fi.toFixed(6)}`,
      `xi+1 = xi - f(xi)·(xi - xi-1) / (f(xi) - f(xi-1))`,
      `xi+1 = ${xi.toFixed(6)} - (${fi.toFixed(6)})(${(xi - xiPrev).toFixed(6)}) / (${(fi - fPrev).toFixed(6)})`,
      `xi+1 = ${xiNew.toFixed(6)}`,
      `Error = ${error.toFixed(6)}%`,
    ];
    
    steps.push({ i, xiPrev, xi, xiNew, fPrev, fi, error, procedure });
    xiPrev = xi;
    xi = xiNew;
    
    if (error < tol || Math.abs(fi) < tol) {
      return { root: xiNew, steps, iterations: i };
    }
  }
  return { root: xi, steps, iterations: maxIter, warning: 'Se alcanzó el máximo de iteraciones.' };
}

export function fixedPoint(expr, gExpr, x0, tol, maxIter) {
  const steps = [];
  let xi = x0;
  
  for (let i = 1; i <= maxIter; i++) {
    const fxi = evaluateFunction(expr, xi);
    const gxi = evaluateFunction(gExpr, xi);
    const error = i === 1 ? 100 : Math.abs((gxi - xi) / gxi) * 100;
    
    const procedure = [
      `**Iteración ${i}**`,
      `xi = ${xi.toFixed(6)}`,
      `f(xi) = f(${xi.toFixed(6)}) = ${fxi.toFixed(6)}`,
      `g(xi) = g(${xi.toFixed(6)}) = ${gxi.toFixed(6)}`,
      `xi+1 = g(xi) = ${gxi.toFixed(6)}`,
      `Error = ${error.toFixed(6)}%`,
    ];
    
    steps.push({ i, xi, gxi, fxi, error, procedure });
    
    if (error < tol || Math.abs(fxi) < tol) {
      return { root: gxi, steps, iterations: i };
    }
    
    if (!isFinite(gxi)) return { error: 'El método diverge. Verifique la función g(x).', steps };
    
    xi = gxi;
  }
  return { root: xi, steps, iterations: maxIter, warning: 'Se alcanzó el máximo de iteraciones.' };
}