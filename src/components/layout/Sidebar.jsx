import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Binary, Grid3X3, GitBranch, 
  TrendingUp, Sigma, X, Menu, BookOpen, BarChart2, LogOut
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

const modules = [
  { label: 'Inicio', path: '/', icon: LayoutDashboard },
  { label: 'Métodos Numéricos', path: '/methods', icon: Binary },
  { label: 'Formulario de Cálculo', path: '/calculus', icon: BookOpen },
  { label: 'Análisis Estadístico', path: '/statistics', icon: BarChart2 },
];

export default function Sidebar({ open, onClose }) {
  const location = useLocation();
  const { isAuthenticated, logout } = useAuth();

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={onClose} />
      )}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-72 
        bg-[hsl(var(--sidebar-background))] text-[hsl(var(--sidebar-foreground))]
        flex flex-col transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:z-auto
        ${open ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-5 flex items-center justify-between border-b border-[hsl(var(--sidebar-border))]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Sigma className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-sm text-white tracking-tight">NumLab</h1>
              <p className="text-[10px] text-[hsl(var(--sidebar-foreground))] opacity-60">Métodos Numéricos</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden p-1 rounded hover:bg-[hsl(var(--sidebar-accent))]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {modules.map((mod) => {
            const Icon = mod.icon;
            const active = location.pathname === mod.path || 
              (mod.path !== '/' && location.pathname.startsWith(mod.path));
            return (
              <Link
                key={mod.path}
                to={mod.path}
                onClick={onClose}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                  ${active 
                    ? 'bg-[hsl(var(--sidebar-primary))] text-white shadow-lg shadow-blue-500/20' 
                    : 'hover:bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-foreground))]'}
                `}
              >
                <Icon className="w-4.5 h-4.5 flex-shrink-0" />
                <span>{mod.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[hsl(var(--sidebar-border))]">
          <div className="px-3 py-2 rounded-lg bg-[hsl(var(--sidebar-accent))] mb-4">
            <p className="text-[11px] opacity-70">Laboratorio Virtual</p>
            <p className="text-xs font-semibold text-white">Ingeniería</p>
          </div>
          
          {isAuthenticated && (
            <button
              onClick={() => {
                logout(true);
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white transition-colors text-sm font-medium"
            >
              <LogOut className="w-4 h-4" />
              Cerrar sesión
            </button>
          )}
        </div>
      </aside>
    </>
  );
}