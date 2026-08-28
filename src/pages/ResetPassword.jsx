import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { authClient } from '@/api/authClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react';
import AuthLayout from '@/components/AuthLayout';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get('token') || '';

  const [token, setToken] = useState(tokenFromUrl);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (!token.trim()) {
      setError('El token de restablecimiento es requerido.');
      return;
    }

    setLoading(true);
    try {
      await authClient.resetPassword(token.trim(), newPassword);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Error al restablecer la contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      icon={Lock}
      title="Nueva Contraseña"
      subtitle="Crea una nueva contraseña segura para tu cuenta"
      footer={
        <Link to="/login" className="inline-flex items-center text-sm font-semibold text-primary hover:underline gap-1.5">
          <ArrowLeft className="w-4 h-4" /> Volver al Login
        </Link>
      }
    >
      {error && (
        <div className="mb-4 p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium">
          {error}
        </div>
      )}

      {success ? (
        <div className="space-y-4 p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
          <h3 className="font-bold text-sm text-foreground">¡Contraseña Actualizada!</h3>
          <p className="text-xs text-muted-foreground">
            Tu contraseña se ha cambiado exitosamente. Ya puedes iniciar sesión con tus nuevas credenciales.
          </p>
          <Button
            className="w-full h-11 bg-primary text-primary-foreground font-bold text-xs rounded-xl"
            onClick={() => navigate('/login')}
          >
            Iniciar Sesión Ahora
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {!tokenFromUrl && (
            <div className="space-y-2">
              <Label htmlFor="token" className="text-xs font-semibold">Token de Restablecimiento</Label>
              <Input
                id="token"
                type="text"
                placeholder="rst_..."
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="h-12 rounded-xl text-sm font-mono"
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="newPassword" className="text-xs font-semibold">Nueva Contraseña</Label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="newPassword"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="pl-10 h-12 rounded-xl text-sm"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-xs font-semibold">Confirmar Contraseña</Label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Repite la contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
                Actualizando contraseña...
              </>
            ) : (
              'Guardar Nueva Contraseña'
            )}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
