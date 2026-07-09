import React from 'react';
import { Link } from 'react-router-dom';
import { Binary, Grid3X3, GitBranch, TrendingUp, Sigma, ArrowRight, BookOpen, BarChart2 } from 'lucide-react';

const modules = [
  {
    title: 'Métodos Numéricos',
    desc: 'Ecuaciones No Lineales, Cálculo Matricial, Sistemas Lineales, Integración y ODEs',
    icon: Binary,
    path: '/methods',
    color: 'from-blue-500 to-indigo-600',
    badge: '5 módulos',
  },
  {
    title: 'Formulario de Cálculo',
    desc: 'Límites, Derivadas, Integrales, Multivariable, Laplace, Fourier',
    icon: BookOpen,
    path: '/calculus',
    color: 'from-rose-500 to-pink-600',
    badge: 'Cálculo 1–4',
  },
  {
    title: 'Análisis Estadístico',
    desc: 'Media, Mediana, Moda, Varianza, Desviación Estándar e Histograma',
    icon: BarChart2,
    path: '/statistics',
    color: 'from-sky-500 to-indigo-600',
    badge: 'Estadística descriptiva',
  },
];

export default function Home() {
  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <Sigma className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">NumLab</h1>
        </div>
        <p className="text-muted-foreground text-sm lg:text-base max-w-xl">
          Laboratorio virtual de Métodos Numéricos para estudiantes de ingeniería. 
          Selecciona un módulo para comenzar.
        </p>
        <p className="text-base font-bold text-blue-600 mt-1">Ing. Jorge Alberto Pereira Hernández</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {modules.map((mod) => {
          const Icon = mod.icon;
          return (
            <Link
              key={mod.path}
              to={mod.path}
              className="group relative bg-card rounded-2xl border border-border p-6 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/30 transition-all duration-300"
            >
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${mod.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex items-start justify-between mb-2">
                <h2 className="font-bold text-base">{mod.title}</h2>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">{mod.desc}</p>
              <span className="inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
                {mod.badge}
              </span>
            </Link>
          );
        })}
      </div>

      <div className="mt-10 p-5 rounded-2xl bg-muted/50 border border-border">
        <h3 className="font-semibold text-sm mb-2">💡 Guía rápida de funciones</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono text-muted-foreground">
          <div><span className="text-foreground font-semibold">x^2</span> → x²</div>
          <div><span className="text-foreground font-semibold">sin(x)</span> → seno</div>
          <div><span className="text-foreground font-semibold">cos(x)</span> → coseno</div>
          <div><span className="text-foreground font-semibold">exp(x)</span> → eˣ</div>
          <div><span className="text-foreground font-semibold">sqrt(x)</span> → √x</div>
          <div><span className="text-foreground font-semibold">log(x)</span> → log₁₀</div>
          <div><span className="text-foreground font-semibold">ln(x)</span> → ln</div>
          <div><span className="text-foreground font-semibold">pi</span> → π</div>
        </div>
      </div>
    </div>
  );
}