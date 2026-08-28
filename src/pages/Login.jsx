import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogIn, Mail, Lock, Loader2, Sparkles, UserCheck } from 'lucide-react';
import AuthLayout from '@/components/AuthLayout';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, loginAsGuest } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      window.location.href = '/';
    } catch (err) {
      setError(err.message || 'Correo o contraseña incorrectos.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = () => {
    loginAsGuest();
    window.location.href = '/';
  };

  return (
    <AuthLayout
      icon={LogIn}
      title="Bienvenido a NumLab"
      subtitle="Inicia sesión en tu cuenta para acceder al laboratorio"
      footer={
        <>
          ¿No tienes una cuenta?{' '}
          <Link to="/register" className="text-primary font-bold hover:underline">
            Crear cuenta gratis
          </Link>
        </>
      }
    >
      {/* Botón de Acceso como Invitado */}
      <Button
        type="button"
        variant="outline"
        className="w-full h-12 text-sm font-semibold mb-6 border-indigo-500/30 hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400 gap-2 rounded-xl"
        onClick={handleGuest}
      >
        <UserCheck className="w-5 h-5 text-indigo-500" />
        Entrar como Invitado (Acceso Inmediato)
      </Button>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-3 text-muted-foreground font-medium">o con tu correo</span>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-xs font-semibold">Correo Electrónico</Label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="email"
              type="text"
              autoComplete="email"
              autoFocus
              placeholder="tu.correo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 h-12 rounded-xl text-sm"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-xs font-semibold">Contraseña</Label>
            <Link to="/forgot-password" className="text-xs text-primary font-medium hover:underline">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 h-12 rounded-xl text-sm"
              required
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-12 font-bold text-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-md shadow-blue-500/20"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Iniciando sesión...
            </>
          ) : (
            'Iniciar Sesión'
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}
