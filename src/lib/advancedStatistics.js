import jStat from 'jstat';

/**
 * Prueba t de Student para 1 Muestra
 * H0: mu = mu0 vs H1: mu != mu0
 */
export function oneSampleTTest(sample = [], mu0 = 0, alpha = 0.05) {
  const n = sample.length;
  if (n < 2) throw new Error('La muestra debe contener al menos 2 datos.');

  const mean = jStat.mean(sample);
  const std = jStat.stdev(sample, true); // sample standard deviation (n-1)
  const se = std / Math.sqrt(n);
  const df = n - 1;
  const tStat = (mean - mu0) / se;
  const pValue = 2 * (1 - jStat.studentt.cdf(Math.abs(tStat), df));
  const tCrit = jStat.studentt.inv(1 - alpha / 2, df);

  const rejectH0 = pValue < alpha;

  return {
    testName: 'Prueba t de Student para una Muestra',
    n,
    mean,
    std,
    se,
    mu0,
    df,
    tStat,
    pValue,
    tCrit,
    alpha,
    rejectH0,
    conclusion: rejectH0
      ? `Se rechaza la hipótesis nula H₀ (p = ${pValue.toFixed(4)} < ${alpha}). Existe evidencia estadísticamente significativa de que la media poblacional es diferente de ${mu0}.`
      : `No se rechaza la hipótesis nula H₀ (p = ${pValue.toFixed(4)} ≥ ${alpha}). No existe suficiente evidencia estadística para afirmar que la media es diferente de ${mu0}.`,
  };
}

/**
 * Prueba t de Student para 2 Muestras Independientes
 * H0: mu1 = mu2 vs H1: mu1 != mu2
 */
export function twoSampleTTest(sample1 = [], sample2 = [], alpha = 0.05, equalVariance = true) {
  const n1 = sample1.length;
  const n2 = sample2.length;
  if (n1 < 2 || n2 < 2) throw new Error('Ambas muestras deben contener al menos 2 datos.');

  const mean1 = jStat.mean(sample1);
  const mean2 = jStat.mean(sample2);
  const s1 = jStat.stdev(sample1, true);
  const s2 = jStat.stdev(sample2, true);

  let df, se, tStat;
  if (equalVariance) {
    // Varianzas iguales (Pooled)
    const sp2 = ((n1 - 1) * s1 ** 2 + (n2 - 1) * s2 ** 2) / (n1 + n2 - 2);
    const sp = Math.sqrt(sp2);
    se = sp * Math.sqrt(1 / n1 + 1 / n2);
    df = n1 + n2 - 2;
    tStat = (mean1 - mean2) / se;
  } else {
    // Welch's t-test (Varianzas desiguales)
    const v1 = s1 ** 2 / n1;
    const v2 = s2 ** 2 / n2;
    se = Math.sqrt(v1 + v2);
    df = (v1 + v2) ** 2 / (v1 ** 2 / (n1 - 1) + v2 ** 2 / (n2 - 1));
    tStat = (mean1 - mean2) / se;
  }

  const pValue = 2 * (1 - jStat.studentt.cdf(Math.abs(tStat), df));
  const tCrit = jStat.studentt.inv(1 - alpha / 2, df);
  const rejectH0 = pValue < alpha;

  return {
    testName: 'Prueba t para dos Muestras Independientes',
    n1, n2,
    mean1, mean2,
    s1, s2,
    diff: mean1 - mean2,
    se,
    df,
    tStat,
    pValue,
    tCrit,
    alpha,
    rejectH0,
    conclusion: rejectH0
      ? `Se rechaza H₀ (p = ${pValue.toFixed(4)} < ${alpha}). Existe diferencia significativa entre las medias de ambos grupos.`
      : `No se rechaza H₀ (p = ${pValue.toFixed(4)} ≥ ${alpha}). No se encontró diferencia significativa entre los dos grupos.`,
  };
}

/**
 * ANOVA de Un Factor (One-Way ANOVA)
 */
export function oneWayANOVA(groups = [], alpha = 0.05) {
  if (groups.length < 2) throw new Error('Se requieren al menos 2 grupos para ANOVA.');

  const k = groups.length;
  let N = 0;
  let grandTotal = 0;
  let sumSqTotal = 0;

  const groupStats = groups.map((g, idx) => {
    const count = g.length;
    if (count < 1) throw new Error(`El grupo ${idx + 1} está vacío.`);
    const sum = jStat.sum(g);
    const mean = sum / count;
    const s = count > 1 ? jStat.stdev(g, true) : 0;
    N += count;
    grandTotal += sum;
    g.forEach((val) => {
      sumSqTotal += val ** 2;
    });
    return { name: `Grupo ${idx + 1}`, count, sum, mean, std: s };
  });

  const grandMean = grandTotal / N;
  const ssTotal = sumSqTotal - (grandTotal ** 2) / N;

  let ssBetween = 0;
  groupStats.forEach((g) => {
    ssBetween += (g.sum ** 2) / g.count;
  });
  ssBetween -= (grandTotal ** 2) / N;

  const ssWithin = Math.max(0, ssTotal - ssBetween);

  const dfBetween = k - 1;
  const dfWithin = N - k;
  const dfTotal = N - 1;

  const msBetween = ssBetween / dfBetween;
  const msWithin = ssWithin / dfWithin;

  const fStat = msBetween / msWithin;
  const pValue = 1 - jStat.centralF.cdf(fStat, dfBetween, dfWithin);
  const fCrit = jStat.centralF.inv(1 - alpha, dfBetween, dfWithin);

  const rejectH0 = pValue < alpha;

  return {
    testName: 'ANOVA de Un Factor (One-Way ANOVA)',
    k,
    N,
    grandMean,
    groupStats,
    table: {
      between: { ss: ssBetween, df: dfBetween, ms: msBetween, f: fStat, p: pValue, fCrit },
      within: { ss: ssWithin, df: dfWithin, ms: msWithin },
      total: { ss: ssTotal, df: dfTotal },
    },
    alpha,
    rejectH0,
    conclusion: rejectH0
      ? `Se rechaza H₀ (F = ${fStat.toFixed(3)}, p = ${pValue.toFixed(4)} < ${alpha}). Al menos uno de los grupos difiere significativamente de los demás.`
      : `No se rechaza H₀ (F = ${fStat.toFixed(3)}, p = ${pValue.toFixed(4)} ≥ ${alpha}). No se encontraron diferencias significativas entre las medias de los grupos.`,
  };
}

/**
 * Prueba de Chi-Cuadrado de Independencia / Tabla de Contingencia
 */
export function chiSquareIndependence(observedMatrix = [], alpha = 0.05) {
  const r = observedMatrix.length;
  if (r < 2) throw new Error('La matriz debe tener al menos 2 filas.');
  const c = observedMatrix[0].length;
  if (c < 2) throw new Error('La matriz debe tener al menos 2 columnas.');

  const rowTotals = new Array(r).fill(0);
  const colTotals = new Array(c).fill(0);
  let grandTotal = 0;

  for (let i = 0; i < r; i++) {
    for (let j = 0; j < c; j++) {
      const val = Number(observedMatrix[i][j]) || 0;
      rowTotals[i] += val;
      colTotals[j] += val;
      grandTotal += val;
    }
  }

  const expectedMatrix = [];
  let chiSquare = 0;

  for (let i = 0; i < r; i++) {
    expectedMatrix[i] = [];
    for (let j = 0; j < c; j++) {
      const exp = (rowTotals[i] * colTotals[j]) / grandTotal;
      expectedMatrix[i][j] = exp;
      const obs = Number(observedMatrix[i][j]) || 0;
      chiSquare += ((obs - exp) ** 2) / exp;
    }
  }

  const df = (r - 1) * (c - 1);
  const pValue = 1 - jStat.chisquare.cdf(chiSquare, df);
  const chiCrit = jStat.chisquare.inv(1 - alpha, df);
  const rejectH0 = pValue < alpha;

  return {
    testName: 'Prueba de Chi-Cuadrado de Independencia',
    r, c,
    grandTotal,
    observedMatrix,
    expectedMatrix,
    df,
    chiSquare,
    pValue,
    chiCrit,
    alpha,
    rejectH0,
    conclusion: rejectH0
      ? `Se rechaza H₀ (χ² = ${chiSquare.toFixed(3)}, p = ${pValue.toFixed(4)} < ${alpha}). Existe asociación o dependencia estadística significativa entre las dos variables.`
      : `No se rechaza H₀ (χ² = ${chiSquare.toFixed(3)}, p = ${pValue.toFixed(4)} ≥ ${alpha}). Las variables son independientes.`,
  };
}

// Auxiliares para combinación y distribución hipergeométrica
function combinations(n, k) {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  let cK = k;
  if (cK > n / 2) cK = n - cK;
  let res = 1;
  for (let i = 1; i <= cK; i++) {
    res = (res * (n - cK + i)) / i;
  }
  return res;
}

function hypergeomPdf(k, N, K, n) {
  if (k < Math.max(0, n - (N - K)) || k > Math.min(n, K)) return 0;
  const num = combinations(K, k) * combinations(N - K, n - k);
  const den = combinations(N, n);
  return den > 0 ? num / den : 0;
}

function hypergeomCdf(k, N, K, n) {
  let sum = 0;
  const minK = Math.max(0, n - (N - K));
  const targetK = Math.min(k, Math.min(n, K));
  for (let i = minK; i <= targetK; i++) {
    sum += hypergeomPdf(i, N, K, n);
  }
  return sum;
}

/**
 * Calculadora Completa de Distribuciones de Probabilidad
 */
export function calculateDistribution({ dist = 'normal', params = {}, x = 0 }) {
  let cdf = 0;
  let pdf = 0;
  let isDiscrete = false;
  let distName = '';
  let formula = '';
  let meanVal = 0;
  let varianceVal = 0;
  let stdVal = 0;
  let zScore = null;
  let pStrictlyLessThanX = 0;
  let pGreaterOrEqualX = 0;
  const chartData = [];

  const xNum = Number(x) || 0;

  if (dist === 'normal') {
    distName = 'Distribución Normal (Gaussiana)';
    const mean = params.mean !== undefined ? Number(params.mean) : 0;
    const std = params.std ? Math.max(0.00001, Number(params.std)) : 1;
    meanVal = mean;
    varianceVal = std * std;
    stdVal = std;
    zScore = (xNum - mean) / std;

    pdf = jStat.normal.pdf(xNum, mean, std);
    cdf = jStat.normal.cdf(xNum, mean, std);
    pStrictlyLessThanX = cdf;
    pGreaterOrEqualX = 1 - cdf;
    formula = 'f(x) = \\frac{1}{\\sigma \\sqrt{2\\pi}} e^{-\\frac{1}{2}\\left(\\frac{x-\\mu}{\\sigma}\\right)^2}';

    const minX = mean - 3.8 * std;
    const maxX = mean + 3.8 * std;
    const step = (maxX - minX) / 60;
    for (let pt = minX; pt <= maxX; pt += step) {
      const pDensity = jStat.normal.pdf(pt, mean, std);
      chartData.push({
        x: Number(pt.toFixed(2)),
        density: Number(pDensity.toFixed(5)),
        isLower: pt <= xNum,
      });
    }
  } else if (dist === 'binomial') {
    isDiscrete = true;
    distName = 'Distribución Binomial B(n, p)';
    const n = Math.max(1, Math.round(Number(params.n) || 10));
    const p = Math.min(1, Math.max(0, Number(params.p) ?? 0.5));
    const k = Math.max(0, Math.min(n, Math.round(xNum)));

    pdf = jStat.binomial.pdf(k, n, p);
    cdf = jStat.binomial.cdf(k, n, p);
    pStrictlyLessThanX = k > 0 ? jStat.binomial.cdf(k - 1, n, p) : 0;
    pGreaterOrEqualX = 1 - pStrictlyLessThanX;

    meanVal = n * p;
    varianceVal = n * p * (1 - p);
    stdVal = Math.sqrt(varianceVal);
    formula = 'P(X = k) = \\binom{n}{k} p^k (1-p)^{n-k}';

    for (let i = 0; i <= n; i++) {
      const prob = jStat.binomial.pdf(i, n, p);
      chartData.push({
        k: i,
        prob: Number(prob.toFixed(5)),
        percentage: Number((prob * 100).toFixed(2)),
        isSelected: i === k,
        isLowerEq: i <= k,
      });
    }
  } else if (dist === 'poisson') {
    isDiscrete = true;
    distName = 'Distribución de Poisson P(λ)';
    const lambda = Math.max(0.0001, Number(params.lambda) || 3);
    const k = Math.max(0, Math.round(xNum));

    pdf = jStat.poisson.pdf(k, lambda);
    cdf = jStat.poisson.cdf(k, lambda);
    pStrictlyLessThanX = k > 0 ? jStat.poisson.cdf(k - 1, lambda) : 0;
    pGreaterOrEqualX = 1 - pStrictlyLessThanX;

    meanVal = lambda;
    varianceVal = lambda;
    stdVal = Math.sqrt(lambda);
    formula = 'P(X = k) = \\frac{e^{-\\lambda} \\lambda^k}{k!}';

    const maxK = Math.max(15, Math.ceil(lambda + 4 * Math.sqrt(lambda)));
    for (let i = 0; i <= maxK; i++) {
      const prob = jStat.poisson.pdf(i, lambda);
      chartData.push({
        k: i,
        prob: Number(prob.toFixed(5)),
        percentage: Number((prob * 100).toFixed(2)),
        isSelected: i === k,
        isLowerEq: i <= k,
      });
    }
  } else if (dist === 'hypergeometric') {
    isDiscrete = true;
    distName = 'Distribución Hipergeométrica H(N, K, n)';
    const N = Math.max(1, Math.round(Number(params.N) || 50));
    const K = Math.max(0, Math.min(N, Math.round(Number(params.K) || 10)));
    const n = Math.max(1, Math.min(N, Math.round(Number(params.n) || 10)));
    const minK = Math.max(0, n - (N - K));
    const maxK = Math.min(n, K);
    const k = Math.max(minK, Math.min(maxK, Math.round(xNum)));

    pdf = hypergeomPdf(k, N, K, n);
    cdf = hypergeomCdf(k, N, K, n);
    pStrictlyLessThanX = k > minK ? hypergeomCdf(k - 1, N, K, n) : 0;
    pGreaterOrEqualX = 1 - pStrictlyLessThanX;

    meanVal = n * (K / N);
    varianceVal = N > 1 ? n * (K / N) * (1 - K / N) * ((N - n) / (N - 1)) : 0;
    stdVal = Math.sqrt(varianceVal);
    formula = 'P(X = k) = \\frac{\\binom{K}{k}\\binom{N-K}{n-k}}{\\binom{N}{n}}';

    for (let i = minK; i <= maxK; i++) {
      const prob = hypergeomPdf(i, N, K, n);
      chartData.push({
        k: i,
        prob: Number(prob.toFixed(5)),
        percentage: Number((prob * 100).toFixed(2)),
        isSelected: i === k,
        isLowerEq: i <= k,
      });
    }
  } else if (dist === 'exponential') {
    distName = 'Distribución Exponencial Exp(λ)';
    const rate = Math.max(0.0001, Number(params.rate || params.lambda) || 1);
    const xValPos = Math.max(0, xNum);

    pdf = jStat.exponential.pdf(xValPos, rate);
    cdf = jStat.exponential.cdf(xValPos, rate);
    pStrictlyLessThanX = cdf;
    pGreaterOrEqualX = 1 - cdf;

    meanVal = 1 / rate;
    varianceVal = 1 / (rate * rate);
    stdVal = 1 / rate;
    formula = 'f(x) = \\lambda e^{-\\lambda x}, \\quad x \\ge 0';

    const maxPlot = Math.max(5, 4 / rate);
    const step = maxPlot / 50;
    for (let pt = 0; pt <= maxPlot; pt += step) {
      const pDensity = jStat.exponential.pdf(pt, rate);
      chartData.push({
        x: Number(pt.toFixed(2)),
        density: Number(pDensity.toFixed(5)),
        isLower: pt <= xValPos,
      });
    }
  } else if (dist === 't') {
    distName = 'Distribución t de Student';
    const df = Math.max(1, Number(params.df) || 10);
    pdf = jStat.studentt.pdf(xNum, df);
    cdf = jStat.studentt.cdf(xNum, df);
    pStrictlyLessThanX = cdf;
    pGreaterOrEqualX = 1 - cdf;

    meanVal = df > 1 ? 0 : 'Indefinido';
    varianceVal = df > 2 ? df / (df - 2) : 'Indefinido';
    stdVal = typeof varianceVal === 'number' ? Math.sqrt(varianceVal) : 'Indefinido';
    formula = `t_{(df=${df})}`;

    const step = 8 / 60;
    for (let pt = -4; pt <= 4; pt += step) {
      const pDensity = jStat.studentt.pdf(pt, df);
      chartData.push({
        x: Number(pt.toFixed(2)),
        density: Number(pDensity.toFixed(5)),
        isLower: pt <= xNum,
      });
    }
  } else if (dist === 'chisquare') {
    distName = 'Distribución Chi-Cuadrado (χ²)';
    const df = Math.max(1, Number(params.df) || 5);
    const xValPos = Math.max(0, xNum);
    pdf = jStat.chisquare.pdf(xValPos, df);
    cdf = jStat.chisquare.cdf(xValPos, df);
    pStrictlyLessThanX = cdf;
    pGreaterOrEqualX = 1 - cdf;

    meanVal = df;
    varianceVal = 2 * df;
    stdVal = Math.sqrt(2 * df);
    formula = `\\chi^2_{(df=${df})}`;

    const maxPlot = Math.max(10, df + 4 * Math.sqrt(2 * df));
    const step = maxPlot / 50;
    for (let pt = 0; pt <= maxPlot; pt += step) {
      const pDensity = jStat.chisquare.pdf(pt, df);
      chartData.push({
        x: Number(pt.toFixed(2)),
        density: Number(pDensity.toFixed(5)),
        isLower: pt <= xValPos,
      });
    }
  } else if (dist === 'f') {
    distName = 'Distribución F de Snedecor';
    const df1 = Math.max(1, Number(params.df1) || 5);
    const df2 = Math.max(1, Number(params.df2) || 10);
    const xValPos = Math.max(0, xNum);
    pdf = jStat.centralF.pdf(xValPos, df1, df2);
    cdf = jStat.centralF.cdf(xValPos, df1, df2);
    pStrictlyLessThanX = cdf;
    pGreaterOrEqualX = 1 - cdf;

    meanVal = df2 > 2 ? df2 / (df2 - 2) : 'Indefinido';
    varianceVal = df2 > 4 ? (2 * df2 * df2 * (df1 + df2 - 2)) / (df1 * (df2 - 2) * (df2 - 2) * (df2 - 4)) : 'Indefinido';
    stdVal = typeof varianceVal === 'number' ? Math.sqrt(varianceVal) : 'Indefinido';
    formula = `F_{(df_1=${df1}, df_2=${df2})}`;

    const maxPlot = 6;
    const step = maxPlot / 50;
    for (let pt = 0; pt <= maxPlot; pt += step) {
      const pDensity = jStat.centralF.pdf(pt, df1, df2);
      chartData.push({
        x: Number(pt.toFixed(2)),
        density: Number(pDensity.toFixed(5)),
        isLower: pt <= xValPos,
      });
    }
  }

  return {
    testName: `Distribución: ${distName}`,
    dist,
    distName,
    isDiscrete,
    x: xNum,
    pdf,
    pLessThanX: cdf,
    pStrictlyLessThanX,
    pGreaterThanX: 1 - cdf,
    pGreaterOrEqualX,
    mean: meanVal,
    variance: varianceVal,
    std: stdVal,
    zScore,
    formula,
    chartData,
  };
}

