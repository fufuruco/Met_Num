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

/**
 * Calculadora de Distribuciones de Probabilidad
 */
export function calculateDistribution({ dist = 'normal', params = {}, x = 0 }) {
  let cdf = 0;
  let pdf = 0;

  if (dist === 'normal') {
    const mean = params.mean || 0;
    const std = params.std || 1;
    pdf = jStat.normal.pdf(x, mean, std);
    cdf = jStat.normal.cdf(x, mean, std);
  } else if (dist === 't') {
    const df = params.df || 10;
    pdf = jStat.studentt.pdf(x, df);
    cdf = jStat.studentt.cdf(x, df);
  } else if (dist === 'chisquare') {
    const df = params.df || 5;
    pdf = jStat.chisquare.pdf(x, df);
    cdf = jStat.chisquare.cdf(x, df);
  } else if (dist === 'f') {
    const df1 = params.df1 || 5;
    const df2 = params.df2 || 10;
    pdf = jStat.centralF.pdf(x, df1, df2);
    cdf = jStat.centralF.cdf(x, df1, df2);
  } else if (dist === 'binomial') {
    const n = params.n || 10;
    const p = params.p || 0.5;
    const k = Math.floor(x);
    pdf = jStat.binomial.pdf(k, n, p);
    cdf = jStat.binomial.cdf(k, n, p);
  } else if (dist === 'poisson') {
    const lambda = params.lambda || 3;
    const k = Math.floor(x);
    pdf = jStat.poisson.pdf(k, lambda);
    cdf = jStat.poisson.cdf(k, lambda);
  }

  return {
    dist,
    x,
    pdf,
    pLessThanX: cdf,
    pGreaterThanX: 1 - cdf,
  };
}
