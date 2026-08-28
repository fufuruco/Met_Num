import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { ShieldCheck, Plus, Trash2, KeyRound } from 'lucide-react';
import { authClient } from '@/api/authClient';
import { Navigate } from 'react-router-dom';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCode, setNewCode] = useState('');
  const [duration, setDuration] = useState('30');
  const [uses, setUses] = useState('1');
  const [error, setError] = useState(null);

  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    fetchCodes();
  }, []);

  const fetchCodes = async () => {
    try {
      const data = await authClient.getPromoCodes();
      setCodes(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCode = () => {
    const random = Math.random().toString(36).substring(2, 10).toUpperCase();
    setNewCode(`PROMO-${random}`);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newCode) return;
    try {
      setError(null);
      await authClient.createPromoCode({
        code: newCode,
        durationDays: parseInt(duration, 10),
        maxUses: parseInt(uses, 10)
      });
      setNewCode('');
      fetchCodes();
    } catch (e) {
      setError(e.message);
    }
  };

  const handleDelete = async (codeStr) => {
    if (!confirm(`¿Eliminar código ${codeStr}?`)) return;
    try {
      await authClient.deletePromoCode(codeStr);
      fetchCodes();
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <div className="p-2 bg-primary/10 rounded-lg text-primary">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Panel de Administración</h1>
          <p className="text-sm text-muted-foreground">Gestión de accesos y códigos promocionales</p>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Formulario de creación */}
        <div className="md:col-span-1 bg-card border border-border rounded-xl p-5 shadow-sm h-fit">
          <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-primary" />
            Nuevo Código
          </h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Código (Texto)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                  placeholder="Ej: PREMIUM2026"
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg font-mono uppercase"
                  required
                />
                <button
                  type="button"
                  onClick={handleGenerateCode}
                  className="px-3 bg-muted hover:bg-border transition-colors border border-border rounded-lg text-xs font-medium whitespace-nowrap"
                >
                  Generar
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Duración (Días Premium)</label>
              <select 
                value={duration} 
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg"
              >
                <option value="1">1 día (Prueba)</option>
                <option value="30">30 días (1 mes)</option>
                <option value="90">90 días (3 meses)</option>
                <option value="365">365 días (1 año)</option>
                <option value="36500">Ilimitado (100 años)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Usos Máximos</label>
              <input
                type="number"
                min="1"
                value={uses}
                onChange={(e) => setUses(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Crear Código
            </button>
          </form>
        </div>

        {/* Tabla de códigos */}
        <div className="md:col-span-2 bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border bg-muted/20">
            <h2 className="text-sm font-semibold">Códigos Activos e Históricos</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground bg-muted/50">
                <tr>
                  <th className="px-4 py-3 font-medium">CÓDIGO</th>
                  <th className="px-4 py-3 font-medium">DÍAS</th>
                  <th className="px-4 py-3 font-medium">USOS</th>
                  <th className="px-4 py-3 font-medium">ESTADO</th>
                  <th className="px-4 py-3 font-medium text-right">ACCIONES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr><td colSpan="5" className="p-4 text-center text-muted-foreground">Cargando...</td></tr>
                ) : codes.length === 0 ? (
                  <tr><td colSpan="5" className="p-4 text-center text-muted-foreground">No hay códigos creados</td></tr>
                ) : (
                  codes.map((c) => (
                    <tr key={c.code} className="hover:bg-muted/10">
                      <td className="px-4 py-3 font-mono font-bold">{c.code}</td>
                      <td className="px-4 py-3 text-muted-foreground">{c.durationDays}</td>
                      <td className="px-4 py-3">
                        <span className="font-semibold">{c.uses}</span>
                        <span className="text-muted-foreground"> / {c.maxUses}</span>
                      </td>
                      <td className="px-4 py-3">
                        {c.isActive && c.uses < c.maxUses ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 uppercase">
                            Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-muted text-muted-foreground uppercase">
                            Agotado
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDelete(c.code)}
                          className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-md transition-colors"
                          title="Eliminar código"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
