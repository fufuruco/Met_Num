export function analyzeStatistics(rawInput) {
  if (!rawInput || typeof rawInput !== 'string') {
    return { error: 'Por favor ingresa una lista de datos válida.' };
  }

  const data = rawInput
    .replace(/[\r\n\t]/g, ' ')
    .replace(/,/g, ' ')
    .split(' ')
    .map(x => x.trim())
    .filter(x => x !== '')
    .map(Number)
    .filter(x => !isNaN(x));

  const n = data.length;
  if (n === 0) {
    return { error: 'No se encontraron números válidos en la entrada.' };
  }

  const sorted = [...data].sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[n - 1];
  const range = max - min;

  const sum = data.reduce((acc, val) => acc + val, 0);
  const mean = sum / n;

  // Mediana
  let median;
  let medianStep = '';
  if (n % 2 !== 0) {
    const idx = Math.floor(n / 2);
    median = sorted[idx];
    medianStep = `Como el número de datos es impar (N = ${n}), la mediana es el valor central en la posición ${idx + 1} (ordenado): ${median}`;
  } else {
    const idx1 = n / 2 - 1;
    const idx2 = n / 2;
    median = (sorted[idx1] + sorted[idx2]) / 2;
    medianStep = `Como el número de datos es par (N = ${n}), la mediana es el promedio de los dos valores centrales en las posiciones ${idx1 + 1} y ${idx2 + 1}: (${sorted[idx1]} + ${sorted[idx2]}) / 2 = ${median}`;
  }

  // Moda
  const freqs = {};
  data.forEach(x => { freqs[x] = (freqs[x] || 0) + 1; });
  let maxFreq = 0;
  Object.values(freqs).forEach(f => { if (f > maxFreq) maxFreq = f; });

  let modes = [];
  if (maxFreq > 1) {
    modes = Object.keys(freqs)
      .filter(k => freqs[k] === maxFreq)
      .map(Number);
  }

  const modeText = modes.length > 0
    ? `${modes.join(', ')} (Frecuencia: ${maxFreq})`
    : 'No hay moda (todos los valores aparecen una sola vez)';

  // Varianza y Desviación Estándar
  const squaredDiffs = data.map(x => Math.pow(x - mean, 2));
  const sumSquaredDiffs = squaredDiffs.reduce((acc, val) => acc + val, 0);

  const sampleVariance = n > 1 ? sumSquaredDiffs / (n - 1) : 0;
  const sampleStDev = Math.sqrt(sampleVariance);

  const popVariance = sumSquaredDiffs / n;
  const popStDev = Math.sqrt(popVariance);

  // Tabla de desviaciones individuales
  const deviationsTable = data.map((x, idx) => {
    const diff = x - mean;
    const diffSq = Math.pow(diff, 2);
    return {
      index: idx + 1,
      val: x,
      diff,
      diffSq
    };
  });

  // Límites de Clase (Tabla de frecuencias agrupadas) - Regla de Sturges
  let intervals = [];
  if (n > 3 && range > 0) {
    const k = Math.round(1 + 3.322 * Math.log10(n)); // número de clases
    const w = range / k; // ancho de clase

    let cumFreq = 0;
    for (let i = 0; i < k; i++) {
      const lower = min + i * w;
      const upper = min + (i + 1) * w;
      const mid = (lower + upper) / 2;

      // Contar datos en el intervalo
      // El último intervalo incluye el límite superior estricto
      const count = data.filter(x => {
        if (i === k - 1) {
          return x >= lower && x <= upper;
        }
        return x >= lower && x < upper;
      }).length;

      const relFreq = count / n;
      cumFreq += count;

      intervals.push({
        index: i + 1,
        label: `[${lower.toFixed(2)} - ${upper.toFixed(2)}${i === k - 1 ? ']' : ')'}`,
        lower,
        upper,
        mid,
        count,
        relFreq,
        cumFreq
      });
    }
  }

  return {
    n,
    sum,
    min,
    max,
    range,
    mean,
    median,
    medianStep,
    freqs,
    modeText,
    sampleVariance,
    sampleStDev,
    popVariance,
    popStDev,
    sumSquaredDiffs,
    sorted,
    deviationsTable,
    intervals
  };
}

// 3x3 Determinant Helper
function det3x3(m) {
  return m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) -
         m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) +
         m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
}

// Resolver regresión lineal y cuadrática
export function fitRegression(rawX, rawY) {
  if (!rawX || !rawY) {
    return { error: 'Por favor ingresa los datos para X y Y.' };
  }

  const parseList = (str) => str
    .replace(/[\r\n\t]/g, ' ')
    .replace(/,/g, ' ')
    .split(' ')
    .map(x => x.trim())
    .filter(x => x !== '')
    .map(Number)
    .filter(x => !isNaN(x));

  const xs = parseList(rawX);
  const ys = parseList(rawY);

  if (xs.length !== ys.length) {
    return { error: 'Las listas de X y Y deben tener la misma cantidad de elementos.' };
  }

  const n = xs.length;
  if (n < 2) {
    return { error: 'Se necesitan al menos 2 puntos para realizar una regresión.' };
  }

  // Sumas básicas
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
  let sumX3 = 0, sumX4 = 0, sumX2Y = 0;

  for (let i = 0; i < n; i++) {
    const x = xs[i];
    const y = ys[i];
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
    sumY2 += y * y;
    sumX3 += x * x * x;
    sumX4 += x * x * x * x;
    sumX2Y += x * x * y;
  }

  // REGRESIÓN LINEAL: y = mx + b
  const denL = n * sumX2 - sumX * sumX;
  let m = 0, b = 0, r2Linear = 0;
  let hasLinear = false;

  if (Math.abs(denL) > 1e-12) {
    m = (n * sumXY - sumX * sumY) / denL;
    b = (sumY - m * sumX) / n;
    hasLinear = true;

    // Calcular R2 lineal
    const yMean = sumY / n;
    let sst = 0, ssr = 0;
    for (let i = 0; i < n; i++) {
      const yPred = m * xs[i] + b;
      sst += Math.pow(ys[i] - yMean, 2);
      ssr += Math.pow(ys[i] - yPred, 2);
    }
    r2Linear = sst > 0 ? 1 - (ssr / sst) : 1;
  }

  // REGRESIÓN CUADRÁTICA: y = ax^2 + bx + c
  // Resolviendo por Cramer:
  // [ n    sumX   sumX2 ] [ c ]   [ sumY   ]
  // [ sumX sumX2  sumX3 ] [ b ] = [ sumXY  ]
  // [ sumX2 sumX3 sumX4 ] [ a ]   [ sumX2Y ]

  const M = [
    [n, sumX, sumX2],
    [sumX, sumX2, sumX3],
    [sumX2, sumX3, sumX4]
  ];
  const d = det3x3(M);

  let quadA = 0, quadB = 0, quadC = 0, r2Quad = 0;
  let hasQuad = false;

  if (Math.abs(d) > 1e-12) {
    const Ma = [
      [n, sumX, sumY],
      [sumX, sumX2, sumXY],
      [sumX2, sumX3, sumX2Y]
    ];
    const Mb = [
      [n, sumY, sumX2],
      [sumX, sumXY, sumX3],
      [sumX2, sumX2Y, sumX4]
    ];
    const Mc = [
      [sumY, sumX, sumX2],
      [sumXY, sumX2, sumX3],
      [sumX2Y, sumX3, sumX4]
    ];

    quadA = det3x3(Ma) / d;
    quadB = det3x3(Mb) / d;
    quadC = det3x3(Mc) / d;
    hasQuad = true;

    // R2 cuadrático
    const yMean = sumY / n;
    let sst = 0, ssr = 0;
    for (let i = 0; i < n; i++) {
      const yPred = quadA * Math.pow(xs[i], 2) + quadB * xs[i] + quadC;
      sst += Math.pow(ys[i] - yMean, 2);
      ssr += Math.pow(ys[i] - yPred, 2);
    }
    r2Quad = sst > 0 ? 1 - (ssr / sst) : 1;
  }

  // Generar puntos para la gráfica
  // 1. Puntos originales
  const scatterPoints = xs.map((x, i) => ({
    x,
    yRaw: ys[i],
    yLinear: null,
    yQuad: null
  }));

  // 2. Líneas suaves (50 puntos interpolados)
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const delta = (maxX - minX) / 49;
  const linePoints = [];

  for (let i = 0; i < 50; i++) {
    const x = minX + i * delta;
    const yL = hasLinear ? m * x + b : null;
    const yQ = hasQuad ? quadA * Math.pow(x, 2) + quadB * x + quadC : null;
    linePoints.push({
      x,
      yRaw: null,
      yLinear: yL,
      yQuad: yQ
    });
  }

  const chartData = [...scatterPoints, ...linePoints].sort((a, b) => a.x - b.x);

  return {
    n,
    xs,
    ys,
    sumX,
    sumY,
    sumXY,
    sumX2,
    sumX3,
    sumX4,
    sumX2Y,
    m,
    b,
    r2Linear,
    hasLinear,
    quadA,
    quadB,
    quadC,
    r2Quad,
    hasQuad,
    chartData
  };
}
