import React, { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Loader2, AlertTriangle } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const resetToken = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
    if (newPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resetToken, newPassword })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Error al restablecer la contraseña');
      }
      window.location.href = "/login";
    } catch (err) {
      setError(err.message || "Error al restablecer la contraseña");
    } finally {
      setLoading(false);
    }
  };

  if (!resetToken) {
    return (
      <AuthLayout
        icon={AlertTriangle}
        title="Enlace inválido"
        subtitle="Este enlace de restablecimiento no es válido o ha expirado"
        footer={
          <Link to="/forgot-password" className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors">
            Solicitar nuevo enlace
          </Link>
        }
      >
        <p className="text-sm text-muted-foreground text-center">
          El enlace que usaste parece estar incompleto. Por favor solicita un nuevo correo de restablecimiento.
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      icon={Lock}
      title="Nueva contraseña"
      subtitle="Ingresa tu nueva contraseña"
    >
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-sm font-medium text-foreground/80">Nueva contraseña</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              autoFocus
              placeholder="Mínimo 6 caracteres"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="pl-10 h-11 bg-secondary/50 border-border/60 focus:border-indigo-500/60 transition-all"
              required
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="confirm" className="text-sm font-medium text-foreground/80">Confirmar contraseña</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="confirm"
              type="password"
              autoComplete="new-password"
              placeholder="Repite tu contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pl-10 h-11 bg-secondary/50 border-border/60 focus:border-indigo-500/60 transition-all"
              required
            />
          </div>
        </div>
        <Button
          type="submit"
          className="w-full h-11 font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 border-0 text-white shadow-lg shadow-indigo-500/25 transition-all"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Guardando...
            </>
          ) : (
            "Restablecer contraseña"
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}