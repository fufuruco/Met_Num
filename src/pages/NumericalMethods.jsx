import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Binary, Grid3X3, GitBranch, TrendingUp, Sigma } from 'lucide-react';
import NonLinear from './NonLinear';
import Matrices from './Matrices';
import LinearSystems from './LinearSystems';
import Integration from './Integration';
import ODE from './ODE';

const topics = [
  { id: 'nonlinear',      label: 'Ecuaciones No Lineales',     subtitle: 'Encuentra raíces',   icon: Binary,         color: 'from-blue-500 to-indigo-600' },
  { id: 'matrices',       label: 'Cálculo Matricial',          subtitle: 'Operaciones',        icon: Grid3X3,        color: 'from-emerald-500 to-teal-600' },
  { id: 'linearsystems',  label: 'Sistemas de Ecuaciones',     subtitle: 'Ax = b',             icon: GitBranch,      color: 'from-orange-500 to-red-500' },
  { id: 'integration',    label: 'Integración y Derivación',   subtitle: 'Aproximaciones',     icon: TrendingUp,     color: 'from-purple-500 to-pink-500' },
  { id: 'ode',            label: 'Ecuaciones Diferenciales',   subtitle: 'EDOs',               icon: Sigma,          color: 'from-cyan-500 to-blue-600' },
];

export default function NumericalMethods() {
  const [activeTopic, setActiveTopic] = useState('nonlinear');

  const topic = topics.find(t => t.id === activeTopic);
  const Icon = topic.icon;

  return (
    <div className="flex h-full min-h-screen">
      {/* Sidebar de temas */}
      <aside className="hidden lg:flex flex-col w-56 flex-shrink-0 border-r border-border bg-muted/20 p-4 gap-1">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 px-2">Temas</p>
        {topics.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTopic(t.id)}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all ${
              activeTopic === t.id
                ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                : 'hover:bg-muted text-foreground'
            }`}
          >
            <span className="block font-medium">{t.label}</span>
            <span className={`text-[10px] ${activeTopic === t.id ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
              {t.subtitle}
            </span>
          </button>
        ))}
      </aside>

      {/* Contenido principal */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <Link to="/" className="p-2 rounded-lg hover:bg-muted transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${topic.color} flex items-center justify-center`}>
              <Icon className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg">{topic.label}</h1>
              <p className="text-xs text-muted-foreground">Método interactivo y paso a paso</p>
            </div>
          </div>

          {/* Tabs móvil */}
          <div className="flex lg:hidden gap-1 flex-wrap">
            {topics.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTopic(t.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTopic === t.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Renderizado del componente correspondiente */}
          <div className="mt-2">
            {activeTopic === 'nonlinear' && <NonLinear isEmbedded={true} />}
            {activeTopic === 'matrices' && <Matrices isEmbedded={true} />}
            {activeTopic === 'linearsystems' && <LinearSystems isEmbedded={true} />}
            {activeTopic === 'integration' && <Integration isEmbedded={true} />}
            {activeTopic === 'ode' && <ODE isEmbedded={true} />}
          </div>
        </div>
      </div>
    </div>
  );
}
