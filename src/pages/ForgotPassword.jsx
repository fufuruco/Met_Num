import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authClient } from '@/api/authClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { KeyRound, Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import AuthLayout from '@/components/AuthLayout';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await authClient.forgotPassword(email);
      setSuccess(data);
    } catch (err) {
      setError(err.message || 'Error al procesar la solicitud.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      icon={KeyRound}
      title="Recuperar Contraseña"
      subtitle="Ingresa tu correo para generar tu enlace de restablecimiento"
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
        <div className="space-y-4 p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-900 dark:text-emerald-300">
          <div className="flex items-center gap-2 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <span>Enlace de Recuperación Listo</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Se ha generado un token seguro para restablecer tu cuenta. Haz clic en el botón a continuación para crear tu nueva contraseña:
          </p>
          <Button
            className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl"
            onClick={() => navigate(success.resetUrl)}
          >
            Restablecer Mi Contraseña Ahora
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs font-semibold">Correo Registrado</Label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="tu.correo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                Generando token...
              </>
            ) : (
              'Generar Enlace de Recuperación'
            )}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
