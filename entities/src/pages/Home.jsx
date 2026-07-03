import React from 'react';
import { Link } from 'react-router-dom';
import { Binary, Grid3X3, GitBranch, TrendingUp, Sigma, ArrowRight } from 'lucide-react';

const modules = [
  {
    title: 'Ecuaciones No Lineales',
    desc: 'Bisección, Regula Falsi, Newton-Raphson, Secante, Punto Fijo',
    icon: Binary,
    path: '/nonlinear',
    bgColor: 'bg-blue-600',
    badge: '5 métodos',
  },
  {
    title: 'Cálculo Matricial',
    desc: 'Suma, Resta, Multiplicación, Determinante, Inversa, Transpuesta',
    icon: Grid3X3,
    path: '/matrices',
    bgColor: 'bg-emerald-600',
    badge: '6 operaciones',
  },
  {
    title: 'Sistemas de Ecuaciones Lineales',
    desc: 'Gauss, Gauss-Jordan, LU, Jacobi, Gauss-Seidel',
    icon: GitBranch,
    path: '/linear-systems',
    bgColor: 'bg-orange-600',
    badge: '5 métodos',
  },
  {
    title: 'Integración y Derivación',
    desc: 'Trapecio, Simpson 1/3, Simpson 3/8, Diferencias finitas',
    icon: TrendingUp,
    path: '/integration',
    bgColor: 'bg-fuchsia-500',
    badge: '4 métodos',
  },
  {
    title: 'Ecuaciones Diferenciales',
    desc: 'Euler, Euler Mejorado, Runge-Kutta 2° y 4° orden',
    icon: Sigma,
    path: '/ode',
    bgColor: 'bg-blue-600',
    badge: '4 métodos',
  },
];

export default function Home() {
  return (
    <div className="p-8 lg:p-12 max-w-6xl mx-auto min-h-screen">
      {/* Hero header */}
      <div className="mb-10">
        <div className="flex items-center gap-4 mb-1">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-md">
            <Sigma className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight">NumLab</h1>
        </div>
        <p className="text-blue-400 font-bold mb-4" style={{ fontSize: '16px' }}>
          Ing. Jorge Pereira Hernandez
        </p>
        <p className="text-slate-300 text-base lg:text-lg max-w-2xl leading-relaxed">
          Laboratorio virtual de Métodos Numéricos para estudiantes de ingeniería.<br/>
          Selecciona un módulo para comenzar.
        </p>
      </div>

      {/* Module grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((mod) => {
          const Icon = mod.icon;
          return (
            <Link
              key={mod.path}
              to={mod.path}
              className="group flex flex-col bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-shadow duration-300"
            >
              <div className="flex items-start justify-between mb-6">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${mod.bgColor}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
              </div>

              <h2 className="font-bold text-lg text-slate-800 mb-2">{mod.title}</h2>
              <p className="text-sm text-slate-500 leading-relaxed mb-6 flex-grow">
                {mod.desc}
              </p>

              <div>
                <span className="inline-block text-xs font-medium text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                  {mod.badge}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}