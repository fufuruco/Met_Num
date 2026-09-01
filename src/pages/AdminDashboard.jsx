import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { ShieldCheck, Plus, Trash2, KeyRound, Users, Pencil, X, UserPlus, Crown, Search } from 'lucide-react';
import { authClient } from '@/api/authClient';
import { Navigate } from 'react-router-dom';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('codes');

  // --- Promo Code State ---
  const [codes, setCodes] = useState([]);
  const [codesLoading, setCodesLoading] = useState(true);
  const [newCode, setNewCode] = useState('');
  const [duration, setDuration] = useState('30');
  const [uses, setUses] = useState('1');

  // --- Users State ---
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [userSearch, setUserSearch] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'free' });

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchCodes();
      fetchUsers();
    }
  }, [user?.role]);

  // Clear success message after 3s
  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(t);
    }
  }, [success]);

  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  // ===================== PROMO CODE HANDLERS =====================
  const fetchCodes = async () => {
    try {
      const data = await authClient.getPromoCodes();
      setCodes(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setCodesLoading(false);
    }
  };

  const handleGenerateCode = () => {
    const random = Math.random().toString(36).substring(2, 10).toUpperCase();
    setNewCode(`PROMO-${random}`);
  };

  const handleCreateCode = async (e) => {
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
      setSuccess('Código creado exitosamente');
      fetchCodes();
    } catch (e) {
      setError(e.message);
    }
  };

  const handleDeleteCode = async (codeStr) => {
    if (!confirm(`¿Eliminar código ${codeStr}?`)) return;
    try {
      await authClient.deletePromoCode(codeStr);
      setSuccess('Código eliminado');
      fetchCodes();
    } catch (e) {
      alert(e.message);
    }
  };

  // ===================== USER HANDLERS =====================
  const fetchUsers = async () => {
    try {
      const data = await authClient.getUsers();
      setUsers(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setUsersLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUser.email || !newUser.password) {
      setError('Email y contraseña son requeridos');
      return;
    }
    try {
      setError(null);
      await authClient.createUser(newUser);
      setNewUser({ name: '', email: '', password: '', role: 'free' });
      setShowCreateUser(false);
      setSuccess('Usuario creado exitosamente');
      fetchUsers();
    } catch (e) {
      setError(e.message);
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    try {
      setError(null);
      const payload = {
        name: editingUser.name,
        email: editingUser.email,
        role: editingUser.role,
        dailyCredits: editingUser.dailyCredits,
      };
      if (editingUser.newPassword) {
        payload.password = editingUser.newPassword;
      }
      if (editingUser.role === 'premium') {
        payload.premiumUntil = editingUser.premiumUntil || (Date.now() + 30 * 24 * 60 * 60 * 1000);
      }
      await authClient.updateUser(editingUser.id, payload);
      setEditingUser(null);
      setSuccess('Usuario actualizado');
      fetchUsers();
    } catch (e) {
      setError(e.message);
    }
  };

  const handleDeleteUser = async (u) => {
    if (!confirm(`¿Eliminar al usuario "${u.name}" (${u.email})? Esta acción no se puede deshacer.`)) return;
    try {
      await authClient.deleteUser(u.id);
      setSuccess('Usuario eliminado');
      fetchUsers();
    } catch (e) {
      setError(e.message);
    }
  };

  const filteredUsers = users.filter(u => {
    if (!userSearch) return true;
    const q = userSearch.toLowerCase();
    return u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.role?.toLowerCase().includes(q);
  });

  const getRoleBadge = (role) => {
    const styles = {
      admin: 'bg-violet-500/10 text-violet-500',
      premium: 'bg-amber-500/10 text-amber-500',
      free: 'bg-muted text-muted-foreground',
    };
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${styles[role] || styles.free}`}>
        {role === 'admin' && <Crown className="w-3 h-3" />}
        {role}
      </span>
    );
  };

  const formatDate = (d) => {
    if (!d) return '—';
    try { return new Date(d).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' }); }
    catch { return '—'; }
  };

  const formatPremiumUntil = (ts) => {
    if (!ts) return '—';
    const d = new Date(ts);
    if (d.getFullYear() > 2100) return '∞ Ilimitado';
    return d.toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // ===================== RENDER =====================
  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <div className="p-2 bg-primary/10 rounded-lg text-primary">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Panel de Administración</h1>
          <p className="text-sm text-muted-foreground">Gestión de accesos, códigos y usuarios</p>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg text-sm flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="p-1 hover:bg-red-500/10 rounded"><X className="w-4 h-4" /></button>
        </div>
      )}
      {success && (
        <div className="p-3 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-lg text-sm">
          {success}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-muted/50 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('codes')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'codes' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
        >
          <KeyRound className="w-4 h-4" />
          Códigos Promo
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'users' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
        >
          <Users className="w-4 h-4" />
          Usuarios ({users.length})
        </button>
      </div>

      {/* =================== TAB: CODES =================== */}
      {activeTab === 'codes' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Create form */}
          <div className="md:col-span-1 bg-card border border-border rounded-xl p-5 shadow-sm h-fit">
            <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-primary" />
              Nuevo Código
            </h2>
            <form onSubmit={handleCreateCode} className="space-y-4">
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

          {/* Codes table */}
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
                  {codesLoading ? (
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
                            onClick={() => handleDeleteCode(c.code)}
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
      )}

      {/* =================== TAB: USERS =================== */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar por nombre, email o rol..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-background border border-border rounded-lg"
              />
            </div>
            <button
              onClick={() => { setShowCreateUser(!showCreateUser); setError(null); }}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              Crear Usuario
            </button>
          </div>

          {/* Create user form */}
          {showCreateUser && (
            <div className="bg-card border border-primary/30 rounded-xl p-5 shadow-sm">
              <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-primary" />
                Nuevo Usuario
              </h3>
              <form onSubmit={handleCreateUser} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Nombre</label>
                  <input
                    type="text"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    placeholder="Juan Pérez"
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Email *</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    placeholder="correo@ejemplo.com"
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Contraseña *</label>
                  <input
                    type="text"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    placeholder="Contraseña"
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Rol</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg"
                  >
                    <option value="free">Free</option>
                    <option value="premium">Premium</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="sm:col-span-2 lg:col-span-4 flex gap-2">
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Crear
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateUser(false)}
                    className="px-4 py-2 bg-muted text-muted-foreground rounded-lg text-sm font-medium hover:bg-border transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Users table */}
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/20 flex items-center justify-between">
              <h2 className="text-sm font-semibold">{filteredUsers.length} usuario{filteredUsers.length !== 1 ? 's' : ''} registrado{filteredUsers.length !== 1 ? 's' : ''}</h2>
              <button onClick={fetchUsers} className="text-xs text-primary hover:underline">Refrescar</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 font-medium">NOMBRE</th>
                    <th className="px-4 py-3 font-medium">EMAIL</th>
                    <th className="px-4 py-3 font-medium">ROL</th>
                    <th className="px-4 py-3 font-medium">CRÉDITOS</th>
                    <th className="px-4 py-3 font-medium">PREMIUM HASTA</th>
                    <th className="px-4 py-3 font-medium">REGISTRO</th>
                    <th className="px-4 py-3 font-medium text-right">ACCIONES</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {usersLoading ? (
                    <tr><td colSpan="7" className="p-4 text-center text-muted-foreground">Cargando...</td></tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr><td colSpan="7" className="p-4 text-center text-muted-foreground">No se encontraron usuarios</td></tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-muted/10">
                        <td className="px-4 py-3 font-medium">{u.name || '—'}</td>
                        <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{u.email}</td>
                        <td className="px-4 py-3">{getRoleBadge(u.role)}</td>
                        <td className="px-4 py-3 text-center">{u.dailyCredits ?? '—'}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{formatPremiumUntil(u.premiumUntil)}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(u.createdAt)}</td>
                        <td className="px-4 py-3 text-right flex gap-1 justify-end">
                          <button
                            onClick={() => setEditingUser({ ...u, newPassword: '' })}
                            className="p-1.5 text-primary hover:bg-primary/10 rounded-md transition-colors"
                            title="Editar usuario"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u)}
                            className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-md transition-colors"
                            title="Eliminar usuario"
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
      )}

      {/* =================== EDIT USER MODAL =================== */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-xl shadow-xl p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Pencil className="w-4 h-4 text-primary" />
                Editar Usuario
              </h3>
              <button onClick={() => setEditingUser(null)} className="p-1 hover:bg-muted rounded-md">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Nombre</label>
                <input
                  type="text"
                  value={editingUser.name || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Email</label>
                <input
                  type="email"
                  value={editingUser.email || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Rol</label>
                <select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg"
                >
                  <option value="free">Free</option>
                  <option value="premium">Premium</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Créditos Diarios</label>
                <input
                  type="number"
                  value={editingUser.dailyCredits ?? 5}
                  onChange={(e) => setEditingUser({ ...editingUser, dailyCredits: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Nueva Contraseña (dejar vacío para no cambiar)</label>
                <input
                  type="text"
                  value={editingUser.newPassword || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, newPassword: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleUpdateUser}
                className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
              >
                Guardar Cambios
              </button>
              <button
                onClick={() => setEditingUser(null)}
                className="px-4 py-2.5 bg-muted text-muted-foreground rounded-lg text-sm font-medium hover:bg-border transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
