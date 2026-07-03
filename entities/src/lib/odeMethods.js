// ODE methods: solve dy/dx = f(x, y)
function evalODE(expr, x, y) {
  const sanitized = expr
    .replace(/\^/g, '**')
    .replace(/sen\(/gi, 'Math.sin(')
    .replace(/cos\(/gi, 'Math.cos(')
    .replace(/tan\(/gi, 'Math.tan(')
    .replace(/sin\(/gi, 'Math.sin(')
    .replace(/log\(/gi, 'Math.log10(')
    .replace(/ln\(/gi, 'Math.log(')
    .replace(/sqrt\(/gi, 'Math.sqrt(')
    .replace(/exp\(/gi, 'Math.exp(')
    .replace(/pi/gi, 'Math.PI');
  try {
    const fn = new Function('x', 'y', `return ${sanitized}`);
    return fn(x, y);
  } catch {
    return NaN;
  }
}

export function euler(expr, x0, y0, xEnd, h) {
  const steps = [];
  let x = x0, y = y0;
  const points = [{ x, y }];
  let i = 0;
  
  while (x < xEnd - 1e-10) {
    const fxy = evalODE(expr, x, y);
    const yNew = y + h * fxy;
    steps.push({
      i: i + 1,
      x, y, fxy, yNew,
      procedure: [
        `**Paso ${i + 1}**`,
        `x${i} = ${x.toFixed(6)}, y${i} = ${y.toFixed(6)}`,
        `f(x${i}, y${i}) = ${fxy.toFixed(6)}`,
        `y${i+1} = y${i} + h·f(x${i}, y${i}) = ${y.toFixed(6)} + (${h})(${fxy.toFixed(6)}) = ${yNew.toFixed(6)}`,
      ]
    });
    y = yNew;
    x = parseFloat((x + h).toFixed(10));
    points.push({ x, y });
    i++;
  }
  return { points, steps };
}

export function eulerImproved(expr, x0, y0, xEnd, h) {
  const steps = [];
  let x = x0, y = y0;
  const points = [{ x, y }];
  let i = 0;
  
  while (x < xEnd - 1e-10) {
    const k1 = evalODE(expr, x, y);
    const yPredict = y + h * k1;
    const k2 = evalODE(expr, x + h, yPredict);
    const yNew = y + (h / 2) * (k1 + k2);
    steps.push({
      i: i + 1, x, y, k1, k2, yNew,
      procedure: [
        `**Paso ${i + 1}**`,
        `k1 = f(${x.toFixed(4)}, ${y.toFixed(6)}) = ${k1.toFixed(6)}`,
        `y* = ${y.toFixed(6)} + (${h})(${k1.toFixed(6)}) = ${yPredict.toFixed(6)}`,
        `k2 = f(${(x+h).toFixed(4)}, ${yPredict.toFixed(6)}) = ${k2.toFixed(6)}`,
        `y${i+1} = ${y.toFixed(6)} + (${h}/2)(${k1.toFixed(6)} + ${k2.toFixed(6)}) = ${yNew.toFixed(6)}`,
      ]
    });
    y = yNew;
    x = parseFloat((x + h).toFixed(10));
    points.push({ x, y });
    i++;
  }
  return { points, steps };
}

export function rungeKutta2(expr, x0, y0, xEnd, h) {
  const steps = [];
  let x = x0, y = y0;
  const points = [{ x, y }];
  let i = 0;
  
  while (x < xEnd - 1e-10) {
    const k1 = h * evalODE(expr, x, y);
    const k2 = h * evalODE(expr, x + h, y + k1);
    const yNew = y + (k1 + k2) / 2;
    steps.push({
      i: i + 1, x, y, k1, k2, yNew,
      procedure: [
        `**Paso ${i + 1}**`,
        `k1 = h·f(${x.toFixed(4)}, ${y.toFixed(6)}) = ${k1.toFixed(6)}`,
        `k2 = h·f(${(x+h).toFixed(4)}, ${(y+k1).toFixed(6)}) = ${k2.toFixed(6)}`,
        `y${i+1} = ${y.toFixed(6)} + (k1 + k2)/2 = ${yNew.toFixed(6)}`,
      ]
    });
    y = yNew;
    x = parseFloat((x + h).toFixed(10));
    points.push({ x, y });
    i++;
  }
  return { points, steps };
}

export function rungeKutta4(expr, x0, y0, xEnd, h) {
  const steps = [];
  let x = x0, y = y0;
  const points = [{ x, y }];
  let i = 0;
  
  while (x < xEnd - 1e-10) {
    const k1 = h * evalODE(expr, x, y);
    const k2 = h * evalODE(expr, x + h/2, y + k1/2);
    const k3 = h * evalODE(expr, x + h/2, y + k2/2);
    const k4 = h * evalODE(expr, x + h, y + k3);
    const yNew = y + (k1 + 2*k2 + 2*k3 + k4) / 6;
    steps.push({
      i: i + 1, x, y, k1, k2, k3, k4, yNew,
      procedure: [
        `**Paso ${i + 1}**`,
        `k1 = h·f(${x.toFixed(4)}, ${y.toFixed(6)}) = ${k1.toFixed(6)}`,
        `k2 = h·f(${(x+h/2).toFixed(4)}, ${(y+k1/2).toFixed(6)}) = ${k2.toFixed(6)}`,
        `k3 = h·f(${(x+h/2).toFixed(4)}, ${(y+k2/2).toFixed(6)}) = ${k3.toFixed(6)}`,
        `k4 = h·f(${(x+h).toFixed(4)}, ${(y+k3).toFixed(6)}) = ${k4.toFixed(6)}`,
        `y${i+1} = ${y.toFixed(6)} + (k1 + 2k2 + 2k3 + k4)/6 = ${yNew.toFixed(6)}`,
      ]
    });
    y = yNew;
    x = parseFloat((x + h).toFixed(10));
    points.push({ x, y });
    i++;
  }
  return { points, steps };
}