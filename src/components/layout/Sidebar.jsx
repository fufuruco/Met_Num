import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Binary, Grid3X3, GitBranch, 
  TrendingUp, Sigma, X, Menu, BookOpen, BarChart2, LogOut, Folder
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

const modules = [
  { label: 'Inicio', path: '/', icon: LayoutDashboard },
  { label: 'Métodos Numéricos', path: '/methods', icon: Binary },
  { label: 'Formulario de Cálculo', path: '/calculus', icon: BookOpen },
  { label: 'Análisis Estadístico', path: '/statistics', icon: BarChart2 },
  { label: 'Mis Trabajos', path: '/mis-trabajos', icon: Folder },
];

export default function Sidebar({ open, onClose }) {
  const location = useLocation();
  const { user, logout, navigateToLogin } = useAuth();

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

        <div className="p-4 border-t border-[hsl(var(--sidebar-border))] space-y-4">
          {user ? (
            <>
              <button
                onClick={() => logout()}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Cerrar Sesión</span>
              </button>
              
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 shadow-md">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/30 border border-blue-400/20">
                  <span className="text-white font-bold text-sm">
                    {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
                  </span>
                </div>
                <div className="overflow-hidden flex-1">
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 mb-0.5">Sesión Activa</p>
                  <p className="text-xs font-medium text-slate-200 truncate" title={user.email}>{user.email}</p>
                </div>
              </div>
            </>
          ) : (
            <button
              onClick={() => navigateToLogin && navigateToLogin()}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all"
            >
              <span>Iniciar Sesión</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
}