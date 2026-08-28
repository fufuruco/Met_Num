import nerdamer from 'nerdamer';
import 'nerdamer/Algebra';
import 'nerdamer/Calculus';
import 'nerdamer/Solve';
import { all, create } from 'mathjs';

const math = create(all);

const API_URL = '/api';

/**
 * Intenta resolver con IA (Gemini) primero. Si falla, devuelve null para usar el motor local.
 */
async function solveWithAI(expression, operation, context = {}) {
  try {
    const res = await fetch(`${API_URL}/solve-steps`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expression, operation, context }),
    });
    if (!res.ok) return null;
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) return null;
    const data = await res.json();
    if (data.steps && data.steps.length > 0) {
      return data;
    }
    return null;
  } catch (e) {
    console.warn('IA no disponible, usando motor local:', e.message);
    return null;
  }
}

/**
 * Convierte una expresión o resultado a código LaTeX limpio para KaTeX.
 */
export function toLatexSafe(expr) {
  try {
    if (!expr) return '';
    return nerdamer(expr).toTeX();
  } catch (e) {
    try {
      return math.parse(expr).toTex();
    } catch (err) {
      return String(expr);
    }
  }
}

/**
 * Resuelve y genera pasos para Simplificación / Factorización / Expansión.
 */
export async function processAlgebra(expression, operation = 'simplify') {
  const steps = [];
  const cleanExpr = expression.trim();

  // Intentar IA primero
  const aiResult = await solveWithAI(cleanExpr, operation);
  if (aiResult) {
    return {
      result: aiResult.result,
      latex: aiResult.resultLatex || aiResult.result,
      steps: aiResult.steps,
      aiPowered: true,
    };
  }

  // Fallback: motor local
  try {
    steps.push({
      title: 'Expresión inicial',
      explanation: 'Se ingresa la expresión original para ser procesada.',
      latex: toLatexSafe(cleanExpr),
    });

    if (operation === 'simplify') {
      const parsed = nerdamer(cleanExpr);
      steps.push({
        title: 'Agrupación de términos semejantes',
        explanation: 'Se identifican los términos con las mismas potencias y variables para combinarlos.',
        latex: toLatexSafe(cleanExpr),
      });

      const simplified = parsed.text();
      const latexRes = nerdamer(simplified).toTeX();

      steps.push({
        title: 'Resultado simplificado',
        explanation: 'Expresión reducida a su forma canónica más simple.',
        latex: latexRes,
      });

      return {
        result: simplified,
        latex: latexRes,
        steps,
      };
    }

    if (operation === 'expand') {
      steps.push({
        title: 'Aplicación de la propiedad distributiva',
        explanation: 'Se multiplican los polinomios término a término aplicando las leyes de los exponentes.',
        latex: toLatexSafe(cleanExpr),
      });

      const expanded = nerdamer.expand(cleanExpr).text();
      const latexRes = nerdamer(expanded).toTeX();

      steps.push({
        title: 'Expresión expandida',
        explanation: 'Suma de monomios resultante sin paréntesis.',
        latex: latexRes,
      });

      return {
        result: expanded,
        latex: latexRes,
        steps,
      };
    }

    if (operation === 'factor') {
      steps.push({
        title: 'Búsqueda de factor común y productos notables',
        explanation: 'Se extraen factores comunes algebraicos o se aplican identidades algebraicas (diferencia de cuadrados, trinomio cuadrado perfecto).',
        latex: toLatexSafe(cleanExpr),
      });

      const factored = nerdamer.factor(cleanExpr).text();
      const latexRes = nerdamer(factored).toTeX();

      steps.push({
        title: 'Expresión factorizada',
        explanation: 'Producto de factores irreducibles.',
        latex: latexRes,
      });

      return {
        result: factored,
        latex: latexRes,
        steps,
      };
    }

    throw new Error('Operación no soportada');
  } catch (error) {
    throw new Error(`Error algebraico: ${error.message}`);
  }
}

/**
 * Resuelve Ecuaciones con pasos deductivos detallados.
 */
export async function solveEquation(equationStr, variable = 'x') {
  const steps = [];
  try {
    let eq = equationStr.trim();

    // Intentar IA primero
    const aiResult = await solveWithAI(eq, 'solve', { variable });
    if (aiResult) {
      return {
        solutions: [aiResult.result],
        latexSolutions: [aiResult.resultLatex || aiResult.result],
        steps: aiResult.steps,
        aiPowered: true,
      };
    }

    // Fallback: motor local
    if (!eq.includes('=')) {
      eq = `${eq} = 0`;
    }

    const [leftSide, rightSide] = eq.split('=').map((s) => s.trim());

    steps.push({
      title: 'Ecuación original',
      explanation: `Se plantea la igualdad a resolver para la variable ${variable}.`,
      latex: `${toLatexSafe(leftSide)} = ${toLatexSafe(rightSide)}`,
    });

    // Paso 2: Igualar a cero
    const standardForm = `(${leftSide}) - (${rightSide})`;
    const simplifiedStandard = nerdamer(standardForm).text();
    steps.push({
      title: 'Forma general igualada a cero',
      explanation: 'Se trasladan todos los términos al miembro izquierdo restando el miembro derecho.',
      latex: `${toLatexSafe(simplifiedStandard)} = 0`,
    });

    // Resolver con nerdamer
    const rawSolutions = nerdamer.solve(eq, variable);
    let solutionsArray = [];

    // Parse array string representation like "[2, 3]" or Nerdamer Vector
    if (typeof rawSolutions.text === 'function') {
      const textSol = rawSolutions.text();
      solutionsArray = textSol
        .replace(/^\[|\]$/g, '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    } else if (Array.isArray(rawSolutions)) {
      solutionsArray = rawSolutions.map((s) => (s.text ? s.text() : String(s)));
    } else {
      solutionsArray = [String(rawSolutions)];
    }

    // Paso 3: Factorización o fórmula
    try {
      const factored = nerdamer.factor(simplifiedStandard).text();
      if (factored !== simplifiedStandard) {
        steps.push({
          title: 'Factorización de la ecuación',
          explanation: 'Se descompone la expresión en producto de factores lineales o cuadráticos.',
          latex: `${toLatexSafe(factored)} = 0`,
        });
      }
    } catch (e) {}

    // Paso 4: Despeje de raíces
    steps.push({
      title: 'Cálculo de las soluciones (raíces)',
      explanation: 'Se iguala cada factor a cero y se despeja la incógnita.',
      latex: solutionsArray.map((sol, idx) => `${variable}_{${idx + 1}} = ${toLatexSafe(sol)}`).join('\\quad,\\quad '),
    });

    return {
      solutions: solutionsArray,
      latexSolutions: solutionsArray.map((s) => toLatexSafe(s)),
      steps,
    };
  } catch (error) {
    throw new Error(`No se pudo resolver la ecuación: ${error.message}`);
  }
}

/**
 * Calcula Derivadas simbólicas con desglose de reglas de derivación.
 */
export async function calculateDerivative(funcStr, variable = 'x', order = 1) {
  const steps = [];
  try {
    const cleanFunc = funcStr.trim();

    // Intentar IA primero
    const aiResult = await solveWithAI(cleanFunc, 'derivative', { order });
    if (aiResult) {
      return {
        result: aiResult.result,
        latex: aiResult.resultLatex || aiResult.result,
        steps: aiResult.steps,
        aiPowered: true,
      };
    }

    // Fallback: motor local
    steps.push({
      title: 'Función a derivar',
      explanation: `Sea la función $f(${variable})$, se busca calcular su derivada de orden ${order}.`,
      latex: `f(${variable}) = ${toLatexSafe(cleanFunc)}`,
    });

    let current = cleanFunc;
    for (let i = 1; i <= order; i++) {
      const deriv = nerdamer(`diff(${current}, ${variable})`).text();
      const derivLatex = nerdamer(deriv).toTeX();

      const primeNotation = "'".repeat(i);
      steps.push({
        title: `Paso ${i}: Aplicación de reglas de diferenciación`,
        explanation: 'Se aplican las reglas básicas: linealidad, regla de la potencia $\\frac{d}{dx} x^n = n x^{n-1}$, y derivadas de funciones trigonométricas / trascendentes.',
        latex: `f^{${primeNotation}}(${variable}) = \\frac{d^{${i}}}{d${variable}^{${i}}}\\left(${toLatexSafe(cleanFunc)}\\right) = ${derivLatex}`,
      });

      current = deriv;
    }

    return {
      result: current,
      latex: nerdamer(current).toTeX(),
      steps,
    };
  } catch (error) {
    throw new Error(`Error al derivar: ${error.message}`);
  }
}

/**
 * Calcula Integrales Simbólicas (Indefinidas y Definidas) con pasos.
 */
export async function calculateIntegral(funcStr, variable = 'x', lowerLimit = null, upperLimit = null) {
  const steps = [];
  try {
    const cleanFunc = funcStr.trim();
    const isDefinite = lowerLimit !== null && upperLimit !== null && lowerLimit !== '' && upperLimit !== '';

    // Intentar IA primero
    const aiResult = await solveWithAI(cleanFunc, 'integral', {
      definite: isDefinite,
      a: lowerLimit,
      b: upperLimit,
    });
    if (aiResult) {
      return {
        result: aiResult.result,
        latex: aiResult.resultLatex || aiResult.result,
        steps: aiResult.steps,
        aiPowered: true,
        ...(isDefinite ? { numericResult: parseFloat(aiResult.result) || 0 } : {}),
      };
    }

    // Fallback: motor local
    if (!isDefinite) {
      steps.push({
        title: 'Integral indefinida planteada',
        explanation: 'Se busca la familia de primitivas (antiderivada general).',
        latex: `\\int \\left(${toLatexSafe(cleanFunc)}\\right) d${variable}`,
      });

      const antiderivative = nerdamer(`integrate(${cleanFunc}, ${variable})`).text();
      const antiLatex = nerdamer(antiderivative).toTeX();

      steps.push({
        title: 'Integración término a término',
        explanation: 'Se aplican las fórmulas fundamentales de integración (regla de la potencia $\\int x^n dx = \\frac{x^{n+1}}{n+1}$, integrales trigonométricas e integración por partes).',
        latex: `F(${variable}) = ${antiLatex}`,
      });

      steps.push({
        title: 'Resultado con constante de integración',
        explanation: 'Se añade la constante arbitraria $C \\in \\mathbb{R}$.',
        latex: `${antiLatex} + C`,
      });

      return {
        result: `${antiderivative} + C`,
        latex: `${antiLatex} + C`,
        steps,
      };
    } else {
      // Integral Definida
      steps.push({
        title: 'Integral definida planteada',
        explanation: `Se evaluará el área bajo la curva en el intervalo $[${lowerLimit}, ${upperLimit}]$.`,
        latex: `\\int_{${toLatexSafe(lowerLimit)}}^{${toLatexSafe(upperLimit)}} \\left(${toLatexSafe(cleanFunc)}\\right) d${variable}`,
      });

      const antiderivative = nerdamer(`integrate(${cleanFunc}, ${variable})`).text();
      const antiLatex = nerdamer(antiderivative).toTeX();

      steps.push({
        title: 'Cálculo de la antiderivada F(x)',
        explanation: 'Se obtiene la función primitiva antes de evaluar los límites.',
        latex: `F(${variable}) = ${antiLatex}`,
      });

      // Teorema Fundamental del Cálculo: F(b) - F(a)
      const upperEval = nerdamer(antiderivative, { [variable]: upperLimit }).evaluate().text();
      const lowerEval = nerdamer(antiderivative, { [variable]: lowerLimit }).evaluate().text();

      steps.push({
        title: 'Segundo Teorema Fundamental del Cálculo (Regla de Barrow)',
        explanation: 'Se evalúa $F(b) - F(a)$.',
        latex: `\\left[ ${antiLatex} \\right]_{${toLatexSafe(lowerLimit)}}^{${toLatexSafe(upperLimit)}} = F(${toLatexSafe(upperLimit)}) - F(${toLatexSafe(lowerLimit)})`,
      });

      const definiteResult = nerdamer(`defint(${cleanFunc}, ${lowerLimit}, ${upperLimit}, ${variable})`).text();
      const numResult = nerdamer(definiteResult).evaluate().text();

      steps.push({
        title: 'Valor numérico exacto',
        explanation: 'Sustitución y cálculo del área neta.',
        latex: `\\approx ${toLatexSafe(definiteResult)} = ${Number(numResult).toFixed(6)}`,
      });

      return {
        result: definiteResult,
        numericResult: Number(numResult),
        latex: toLatexSafe(definiteResult),
        steps,
      };
    }
  } catch (error) {
    throw new Error(`Error en la integración: ${error.message}`);
  }
}

/**
 * Calcula Límites analíticos.
 */
export function calculateLimit(funcStr, variable = 'x', point = '0', direction = 'both') {
  const steps = [];
  try {
    const cleanFunc = funcStr.trim();

    steps.push({
      title: 'Límite planteado',
      explanation: `Se analiza el comportamiento asintótico cuando $${variable} \\to ${point}$.`,
      latex: `\\lim_{${variable} \\to ${toLatexSafe(point)}} \\left(${toLatexSafe(cleanFunc)}\\right)`,
    });

    // Evaluación directa
    try {
      const direct = nerdamer(cleanFunc, { [variable]: point }).evaluate().text();
      if (!direct.includes('Infinity') && !direct.includes('NaN') && !direct.includes('undefined')) {
        steps.push({
          title: 'Sustitución directa',
          explanation: 'La función es continua en el punto dado.',
          latex: `f(${toLatexSafe(point)}) = ${toLatexSafe(direct)}`,
        });
        return {
          result: direct,
          latex: toLatexSafe(direct),
          steps,
        };
      }
    } catch (e) {}

    // Límite simbólico
    const limResult = nerdamer(`limit(${cleanFunc}, ${variable}, ${point})`).text();
    steps.push({
      title: 'Aplicación de regla de L’Hôpital / Límites Notables',
      explanation: 'Se resuelve la indeterminación algebraicamente o derivando numerador y denominador.',
      latex: `\\lim_{${variable} \\to ${toLatexSafe(point)}} f(${variable}) = ${toLatexSafe(limResult)}`,
    });

    return {
      result: limResult,
      latex: toLatexSafe(limResult),
      steps,
    };
  } catch (error) {
    throw new Error(`Error en el cálculo de límite: ${error.message}`);
  }
}
