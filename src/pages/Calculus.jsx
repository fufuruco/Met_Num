import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { calculusTopics, calcTopicList } from '@/lib/calculusData';
import FormulaCard from '@/components/calculus/FormulaCard';

export default function Calculus() {
  const [activeTopic, setActiveTopic] = useState('limits');
  const [search, setSearch] = useState('');

  const topic = calculusTopics[activeTopic];

  const filteredSections = topic.sections.filter(sec => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      sec.title.toLowerCase().includes(q) ||
      sec.formula.toLowerCase().includes(q) ||
      sec.rules.some(r => r.name.toLowerCase().includes(q) || r.formula.toLowerCase().includes(q))
    );
  });

  return (
    <div className="flex h-full min-h-screen">
      {/* Sidebar de temas */}
      <aside className="hidden lg:flex flex-col w-56 flex-shrink-0 border-r border-border bg-muted/20 p-4 gap-1">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 px-2">Temas</p>
        {calcTopicList.map(t => (
          <button
            key={t.id}
            onClick={() => { setActiveTopic(t.id); setSearch(''); }}
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
      <div className="flex-1 p-6 lg:p-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link to="/" className="p-2 rounded-lg hover:bg-muted transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${topic.color} flex items-center justify-center`}>
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg">{topic.title}</h1>
            <p className="text-xs text-muted-foreground">Formulario y referencia rápida</p>
          </div>
        </div>

        {/* Tabs móvil */}
        <div className="flex lg:hidden gap-1 flex-wrap mb-5">
          {calcTopicList.map(t => (
            <button
              key={t.id}
              onClick={() => { setActiveTopic(t.id); setSearch(''); }}
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

        {/* Búsqueda */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar fórmulas, reglas o propiedades..."
            className="pl-9"
          />
        </div>

        {/* Secciones con fórmulas */}
        <div className="space-y-4">
          {filteredSections.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <p className="text-sm">No se encontraron resultados para "<span className="font-semibold">{search}</span>"</p>
            </div>
          ) : (
            filteredSections.map((section, idx) => (
              <FormulaCard key={idx} section={section} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}