import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Binary, Grid3X3, GitBranch, 
  TrendingUp, Sigma, X, LogOut
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

const modules = [
  { label: 'Inicio', path: '/', icon: LayoutDashboard, gradient: 'from-indigo-500 to-violet-600' },
  { label: 'Ecuaciones No Lineales', path: '/nonlinear', icon: Binary, gradient: 'from-blue-500 to-indigo-600' },
  { label: 'Cálculo Matricial', path: '/matrices', icon: Grid3X3, gradient: 'from-emerald-500 to-teal-600' },
  { label: 'Sistemas Lineales', path: '/linear-systems', icon: GitBranch, gradient: 'from-orange-500 to-red-500' },
  { label: 'Integración y Derivación', path: '/integration', icon: TrendingUp, gradient: 'from-purple-500 to-pink-600' },
  { label: 'Ecuaciones Diferenciales', path: '/ode', icon: Sigma, gradient: 'from-cyan-500 to-blue-600' },
];

export default function Sidebar({ open, onClose }) {
  const location = useLocation();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={onClose} />
      )}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-72 
        bg-[hsl(var(--sidebar-background))]
        flex flex-col transition-transform duration-300 ease-in-out
        border-r border-[hsl(var(--sidebar-border))]
        lg:translate-x-0 lg:static lg:z-auto
        ${open ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Header */}
        <div className="p-5 flex items-center justify-between border-b border-[hsl(var(--sidebar-border))]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Sigma className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-sm text-white tracking-tight">NumLab</h1>
              <p className="text-[10px] text-[hsl(var(--sidebar-foreground))] opacity-50 font-mono">v1.0 · Métodos Numéricos</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden p-1.5 rounded-lg hover:bg-white/5 text-[hsl(var(--sidebar-foreground))] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[hsl(var(--sidebar-foreground))] opacity-35 px-3 mb-2">
            Módulos
          </p>
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
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                  ${active 
                    ? 'bg-indigo-600/20 text-white border border-indigo-500/30 shadow-sm' 
                    : 'hover:bg-white/5 text-[hsl(var(--sidebar-foreground))] border border-transparent hover:border-white/5'}
                `}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  active 
                    ? `bg-gradient-to-br ${mod.gradient} shadow-md` 
                    : 'bg-white/5'
                }`}>
                  <Icon className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="truncate">{mod.label}</span>
                {active && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-[hsl(var(--sidebar-border))] space-y-2">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[hsl(var(--sidebar-foreground))] hover:bg-red-500/10 hover:text-red-400 border border-transparent hover:border-red-500/20 transition-all duration-200"
          >
            <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center">
              <LogOut className="w-3.5 h-3.5" />
            </div>
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
}