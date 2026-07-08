// ============================================================
// BASE DE CONOCIMIENTO: CÁLCULO 1, 2, 3 y 4
// ============================================================

export const calculusTopics = {

  // ─────────────────────────────────────────────
  // CÁLCULO 1 — LÍMITES Y DERIVADAS
  // ─────────────────────────────────────────────
  limits: {
    title: 'Límites',
    color: 'from-blue-500 to-indigo-600',
    sections: [
      {
        title: 'Definición de Límite',
        formula: 'lim x→a f(x) = L',
        description: 'El límite de f(x) cuando x se aproxima a "a" es L si f(x) se acerca arbitrariamente a L conforme x → a.',
        rules: [
          { name: 'Límite de una constante', formula: 'lim x→a c = c' },
          { name: 'Límite de x', formula: 'lim x→a x = a' },
          { name: 'Suma/Resta', formula: 'lim [f(x) ± g(x)] = lim f(x) ± lim g(x)' },
          { name: 'Producto', formula: 'lim [f(x)·g(x)] = lim f(x) · lim g(x)' },
          { name: 'Cociente', formula: 'lim [f(x)/g(x)] = lim f(x) / lim g(x),  lim g(x) ≠ 0' },
          { name: 'Potencia', formula: 'lim [f(x)]ⁿ = [lim f(x)]ⁿ' },
        ],
      },
      {
        title: 'Límites Indeterminados',
        formula: '0/0,  ∞/∞,  0·∞,  ∞−∞,  0⁰,  1^∞,  ∞⁰',
        description: 'Formas que requieren técnicas algebraicas o la Regla de L\'Hôpital para resolverse.',
        rules: [
          { name: 'Regla de L\'Hôpital (0/0 o ∞/∞)', formula: 'lim f(x)/g(x) = lim f\'(x)/g\'(x)' },
          { name: 'Límite fundamental trigonométrico', formula: 'lim x→0 sin(x)/x = 1' },
          { name: 'Límite fundamental exponencial', formula: 'lim x→0 (1 + x)^(1/x) = e' },
          { name: 'Límite al infinito (n > m)', formula: 'lim x→∞ xⁿ/xᵐ = ∞' },
        ],
      },
      {
        title: 'Continuidad',
        formula: 'f continua en a ⟺ lim x→a f(x) = f(a)',
        description: 'Una función es continua en un punto si el límite existe, f(a) está definida y ambos son iguales.',
        rules: [
          { name: 'Condición 1', formula: 'f(a) está definida' },
          { name: 'Condición 2', formula: 'lim x→a f(x) existe' },
          { name: 'Condición 3', formula: 'lim x→a f(x) = f(a)' },
        ],
      },
    ],
  },

  derivatives: {
    title: 'Derivadas',
    color: 'from-violet-500 to-purple-600',
    sections: [
      {
        title: 'Definición y Reglas Básicas',
        formula: "f'(x) = lim h→0 [f(x+h) - f(x)] / h",
        description: 'La derivada mide la tasa de cambio instantánea de una función.',
        rules: [
          { name: 'Constante', formula: "d/dx [c] = 0" },
          { name: 'Potencia', formula: "d/dx [xⁿ] = n·xⁿ⁻¹" },
          { name: 'Suma/Resta', formula: "d/dx [f ± g] = f' ± g'" },
          { name: 'Producto', formula: "d/dx [f·g] = f'·g + f·g'" },
          { name: 'Cociente', formula: "d/dx [f/g] = (f'·g - f·g') / g²" },
          { name: 'Regla de la cadena', formula: "d/dx [f(g(x))] = f'(g(x))·g'(x)" },
        ],
      },
      {
        title: 'Derivadas de Funciones Elementales',
        formula: "d/dx [sin(x)] = cos(x)",
        description: 'Tabla de derivadas fundamentales para funciones trigonométricas, exponenciales y logarítmicas.',
        rules: [
          { name: 'Seno', formula: "d/dx [sin(x)] = cos(x)" },
          { name: 'Coseno', formula: "d/dx [cos(x)] = −sin(x)" },
          { name: 'Tangente', formula: "d/dx [tan(x)] = sec²(x)" },
          { name: 'Exponencial', formula: "d/dx [eˣ] = eˣ" },
          { name: 'Exponencial base a', formula: "d/dx [aˣ] = aˣ·ln(a)" },
          { name: 'Logaritmo natural', formula: "d/dx [ln(x)] = 1/x" },
          { name: 'Logaritmo base a', formula: "d/dx [logₐ(x)] = 1/(x·ln(a))" },
          { name: 'Raíz cuadrada', formula: "d/dx [√x] = 1/(2√x)" },
          { name: 'Arcoseno', formula: "d/dx [arcsin(x)] = 1/√(1−x²)" },
          { name: 'Arcotangente', formula: "d/dx [arctan(x)] = 1/(1+x²)" },
        ],
      },
      {
        title: 'Aplicaciones de la Derivada',
        formula: "f'(c) = 0  →  punto crítico",
        description: 'Criterios para encontrar máximos, mínimos y analizar el comportamiento de funciones.',
        rules: [
          { name: 'Criterio 1ª derivada (máx)', formula: "f' cambia +→−  en c  →  máximo local" },
          { name: 'Criterio 1ª derivada (mín)', formula: "f' cambia −→+  en c  →  mínimo local" },
          { name: 'Criterio 2ª derivada (máx)', formula: "f'(c)=0 y f''(c)<0  →  máximo local" },
          { name: 'Criterio 2ª derivada (mín)', formula: "f'(c)=0 y f''(c)>0  →  mínimo local" },
          { name: 'Concavidad hacia arriba', formula: "f''(x) > 0" },
          { name: 'Punto de inflexión', formula: "f''(c) = 0  y  f'' cambia de signo en c" },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────
  // CÁLCULO 2 — INTEGRALES
  // ─────────────────────────────────────────────
  integrals: {
    title: 'Integrales',
    color: 'from-emerald-500 to-teal-600',
    sections: [
      {
        title: 'Integrales Básicas',
        formula: '∫f(x)dx = F(x) + C  donde  F\'(x) = f(x)',
        description: 'Tabla de integrales fundamentales. Recuerda siempre añadir la constante de integración C.',
        rules: [
          { name: 'Constante', formula: '∫c dx = cx + C' },
          { name: 'Potencia (n ≠ −1)', formula: '∫xⁿ dx = xⁿ⁺¹/(n+1) + C' },
          { name: '1/x', formula: '∫(1/x) dx = ln|x| + C' },
          { name: 'Exponencial', formula: '∫eˣ dx = eˣ + C' },
          { name: 'Exponencial base a', formula: '∫aˣ dx = aˣ/ln(a) + C' },
          { name: 'Seno', formula: '∫sin(x) dx = −cos(x) + C' },
          { name: 'Coseno', formula: '∫cos(x) dx = sin(x) + C' },
          { name: 'Secante²', formula: '∫sec²(x) dx = tan(x) + C' },
          { name: '1/√(1−x²)', formula: '∫1/√(1−x²) dx = arcsin(x) + C' },
          { name: '1/(1+x²)', formula: '∫1/(1+x²) dx = arctan(x) + C' },
        ],
      },
      {
        title: 'Técnicas de Integración',
        formula: '∫u dv = uv − ∫v du',
        description: 'Métodos avanzados para resolver integrales más complejas.',
        rules: [
          { name: 'Integración por partes (ILATE)', formula: '∫u dv = uv − ∫v du' },
          { name: 'Sustitución (u = g(x))', formula: '∫f(g(x))g\'(x)dx = ∫f(u)du' },
          { name: 'Fracciones parciales', formula: 'P(x)/Q(x) = A/(x−a) + B/(x−b) + ...' },
          { name: 'Sustitución trigonométrica √(a²−x²)', formula: 'x = a·sin(θ)' },
          { name: 'Sustitución trigonométrica √(a²+x²)', formula: 'x = a·tan(θ)' },
          { name: 'Sustitución trigonométrica √(x²−a²)', formula: 'x = a·sec(θ)' },
        ],
      },
      {
        title: 'Integral Definida y Teorema Fundamental',
        formula: '∫[a,b] f(x)dx = F(b) − F(a)',
        description: 'El Teorema Fundamental del Cálculo conecta la derivada con la integral.',
        rules: [
          { name: 'TFC Parte 1', formula: 'd/dx [∫[a,x] f(t)dt] = f(x)' },
          { name: 'TFC Parte 2', formula: '∫[a,b] f(x)dx = F(b) − F(a)' },
          { name: 'Área entre curvas', formula: 'A = ∫[a,b] [f(x)−g(x)] dx' },
          { name: 'Volumen (discos)', formula: 'V = π∫[a,b] [f(x)]² dx' },
          { name: 'Volumen (cascarones)', formula: 'V = 2π∫[a,b] x·f(x) dx' },
          { name: 'Longitud de arco', formula: 'L = ∫[a,b] √(1+[f\'(x)]²) dx' },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────
  // CÁLCULO 3 — MULTIVARIABLE
  // ─────────────────────────────────────────────
  multivariable: {
    title: 'Cálculo Multivariable',
    color: 'from-orange-500 to-red-500',
    sections: [
      {
        title: 'Derivadas Parciales',
        formula: '∂f/∂x = lim h→0 [f(x+h,y) − f(x,y)] / h',
        description: 'Derivadas de funciones de varias variables, tratando las demás como constantes.',
        rules: [
          { name: 'Derivada parcial respecto a x', formula: 'fₓ = ∂f/∂x  (y constante)' },
          { name: 'Derivada parcial respecto a y', formula: 'fᵧ = ∂f/∂y  (x constante)' },
          { name: 'Derivadas de segundo orden', formula: 'fₓₓ, fᵧᵧ, fₓᵧ, fᵧₓ' },
          { name: 'Teorema de Clairaut', formula: 'fₓᵧ = fᵧₓ  (si son continuas)' },
          { name: 'Regla de la cadena (2 vars)', formula: 'dz/dt = (∂z/∂x)(dx/dt) + (∂z/∂y)(dy/dt)' },
          { name: 'Diferencial total', formula: 'dz = (∂f/∂x)dx + (∂f/∂y)dy' },
        ],
      },
      {
        title: 'Gradiente, Divergencia y Rotacional',
        formula: '∇f = (∂f/∂x)î + (∂f/∂y)ĵ + (∂f/∂z)k̂',
        description: 'Operadores vectoriales fundamentales del cálculo vectorial.',
        rules: [
          { name: 'Gradiente', formula: '∇f = ⟨∂f/∂x, ∂f/∂y, ∂f/∂z⟩' },
          { name: 'Derivada direccional', formula: 'D_u f = ∇f · û' },
          { name: 'Divergencia', formula: 'div F = ∂P/∂x + ∂Q/∂y + ∂R/∂z' },
          { name: 'Rotacional', formula: 'rot F = ∇ × F' },
          { name: 'Laplaciano', formula: '∇²f = ∂²f/∂x² + ∂²f/∂y² + ∂²f/∂z²' },
          { name: 'Puntos críticos', formula: '∇f = 0  →  fₓ=0 y fᵧ=0' },
        ],
      },
      {
        title: 'Integrales Dobles',
        formula: '∬_R f(x,y) dA = ∫[a,b]∫[c,d] f(x,y) dy dx',
        description: 'Extensión de la integral definida a funciones de dos variables sobre regiones planas.',
        rules: [
          { name: 'Orden de integración', formula: '∫[a,b]∫[g₁(x),g₂(x)] f(x,y) dy dx' },
          { name: 'Cambio de orden', formula: '∬ f dA  (intercambiar límites según región)' },
          { name: 'Coordenadas polares', formula: '∬ f(r,θ) r dr dθ,  x=r·cos θ, y=r·sin θ' },
          { name: 'Área de región', formula: 'A = ∬_R dA' },
          { name: 'Volumen bajo superficie', formula: 'V = ∬_R f(x,y) dA' },
          { name: 'Valor promedio', formula: 'f̄ = (1/A) ∬_R f(x,y) dA' },
        ],
      },
      {
        title: 'Integrales Triples',
        formula: '∭_E f(x,y,z) dV = ∫∫∫ f(x,y,z) dz dy dx',
        description: 'Integrales sobre regiones tridimensionales, con múltiples sistemas de coordenadas.',
        rules: [
          { name: 'Coordenadas rectangulares', formula: 'dV = dx dy dz' },
          { name: 'Coordenadas cilíndricas', formula: 'dV = r dr dθ dz,  x=r·cosθ, y=r·sinθ' },
          { name: 'Coordenadas esféricas', formula: 'dV = ρ²sin(φ) dρ dφ dθ' },
          { name: 'Esféricas: relaciones', formula: 'x=ρsinφcosθ, y=ρsinφsinθ, z=ρcosφ' },
          { name: 'Volumen de sólido', formula: 'V = ∭_E dV' },
          { name: 'Masa de sólido', formula: 'M = ∭_E ρ(x,y,z) dV' },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────
  // CÁLCULO 4 — TRANSFORMADAS Y SERIES
  // ─────────────────────────────────────────────
  transforms: {
    title: 'Transformadas y Series',
    color: 'from-cyan-500 to-blue-600',
    sections: [
      {
        title: 'Series de Taylor y Maclaurin',
        formula: 'f(x) = Σ [f⁽ⁿ⁾(a)/n!] · (x−a)ⁿ',
        description: 'Representación de funciones como sumas infinitas de potencias. Maclaurin es Taylor centrada en a=0.',
        rules: [
          { name: 'Serie de Taylor', formula: 'f(x) = Σₙ [f⁽ⁿ⁾(a)/n!](x−a)ⁿ' },
          { name: 'Maclaurin de eˣ', formula: 'eˣ = 1 + x + x²/2! + x³/3! + ...' },
          { name: 'Maclaurin de sin(x)', formula: 'sin(x) = x − x³/3! + x⁵/5! − ...' },
          { name: 'Maclaurin de cos(x)', formula: 'cos(x) = 1 − x²/2! + x⁴/4! − ...' },
          { name: 'Maclaurin de 1/(1−x)', formula: '1/(1−x) = 1 + x + x² + x³ + ...  |x|<1' },
          { name: 'Maclaurin de ln(1+x)', formula: 'ln(1+x) = x − x²/2 + x³/3 − ...  |x|≤1' },
        ],
      },
      {
        title: 'Transformada de Laplace — Tabla',
        formula: 'L{f(t)} = F(s) = ∫₀^∞ e^(−st) f(t) dt',
        description: 'La transformada de Laplace convierte EDOs en ecuaciones algebraicas. Tabla de pares fundamentales.',
        rules: [
          { name: 'L{1}', formula: 'L{1} = 1/s' },
          { name: 'L{t}', formula: 'L{t} = 1/s²' },
          { name: 'L{tⁿ}', formula: 'L{tⁿ} = n!/s^(n+1)' },
          { name: 'L{eᵃᵗ}', formula: 'L{eᵃᵗ} = 1/(s−a)' },
          { name: 'L{sin(at)}', formula: 'L{sin(at)} = a/(s²+a²)' },
          { name: 'L{cos(at)}', formula: 'L{cos(at)} = s/(s²+a²)' },
          { name: 'L{sinh(at)}', formula: 'L{sinh(at)} = a/(s²−a²)' },
          { name: 'L{cosh(at)}', formula: 'L{cosh(at)} = s/(s²−a²)' },
          { name: 'L{t·eᵃᵗ}', formula: 'L{t·eᵃᵗ} = 1/(s−a)²' },
          { name: 'L{eᵃᵗ·sin(bt)}', formula: 'L{eᵃᵗ·sin(bt)} = b/[(s−a)²+b²]' },
          { name: 'L{eᵃᵗ·cos(bt)}', formula: 'L{eᵃᵗ·cos(bt)} = (s−a)/[(s−a)²+b²]' },
          { name: 'L{δ(t)} (impulso)', formula: 'L{δ(t)} = 1' },
        ],
      },
      {
        title: 'Propiedades de la Transformada de Laplace',
        formula: 'L{f\'(t)} = s·F(s) − f(0)',
        description: 'Propiedades operacionales que permiten resolver EDOs usando tablas y álgebra.',
        rules: [
          { name: 'Linealidad', formula: 'L{af+bg} = a·L{f} + b·L{g}' },
          { name: '1ª Derivada', formula: "L{f'(t)} = s·F(s) − f(0)" },
          { name: '2ª Derivada', formula: "L{f''(t)} = s²F(s) − s·f(0) − f'(0)" },
          { name: 'nª Derivada', formula: 'L{f⁽ⁿ⁾} = sⁿF(s) − sⁿ⁻¹f(0) − ... − f⁽ⁿ⁻¹⁾(0)' },
          { name: 'Desplazamiento en s', formula: 'L{eᵃᵗf(t)} = F(s−a)' },
          { name: 'Desplazamiento en t', formula: 'L{f(t−a)u(t−a)} = e^(−as)·F(s)' },
          { name: 'Convolución', formula: 'L{f*g} = F(s)·G(s)' },
          { name: 'Transformada inversa', formula: 'L⁻¹{F(s)} = f(t)' },
        ],
      },
      {
        title: 'Serie de Fourier',
        formula: 'f(x) = a₀/2 + Σ[aₙcos(nx) + bₙsin(nx)]',
        description: 'Representa funciones periódicas como sumas de senos y cosenos.',
        rules: [
          { name: 'Coeficiente a₀', formula: 'a₀ = (1/π)∫[−π,π] f(x) dx' },
          { name: 'Coeficiente aₙ', formula: 'aₙ = (1/π)∫[−π,π] f(x)cos(nx) dx' },
          { name: 'Coeficiente bₙ', formula: 'bₙ = (1/π)∫[−π,π] f(x)sin(nx) dx' },
          { name: 'Función par (solo cosenos)', formula: 'f(−x) = f(x)  →  bₙ = 0' },
          { name: 'Función impar (solo senos)', formula: 'f(−x) = −f(x)  →  aₙ = 0' },
          { name: 'Teorema de Parseval', formula: '(1/π)∫|f(x)|² dx = a₀²/2 + Σ(aₙ²+bₙ²)' },
        ],
      },
    ],
  },
};

export const calcTopicList = [
  { id: 'limits',        label: 'Límites',              subtitle: 'Cálculo 1', color: 'from-blue-500 to-indigo-600' },
  { id: 'derivatives',   label: 'Derivadas',            subtitle: 'Cálculo 1', color: 'from-violet-500 to-purple-600' },
  { id: 'integrals',     label: 'Integrales',           subtitle: 'Cálculo 2', color: 'from-emerald-500 to-teal-600' },
  { id: 'multivariable', label: 'Multivariable',        subtitle: 'Cálculo 3', color: 'from-orange-500 to-red-500' },
  { id: 'transforms',   label: 'Transformadas',         subtitle: 'Cálculo 4', color: 'from-cyan-500 to-blue-600' },
];