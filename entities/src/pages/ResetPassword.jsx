import React, { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Loader2, AlertTriangle } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";

import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  // Firebase sends "oobCode" as the query param in its reset links
  const oobCode = searchParams.get("oobCode") || searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

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
      await confirmPasswordReset(auth, oobCode, newPassword);
      setDone(true);
      setTimeout(() => {
        window.location.href = "/login";
      }, 2500);
    } catch (err) {
      if (err.code === "auth/invalid-action-code") {
        setError("El enlace de restablecimiento ya fue usado o ha expirado. Solicita uno nuevo.");
      } else {
        setError(err.message || "Error al restablecer la contraseña");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!oobCode) {
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

  if (done) {
    return (
      <AuthLayout
        icon={Lock}
        title="¡Contraseña actualizada!"
        subtitle="Serás redirigido al inicio de sesión en un momento..."
      >
        <p className="text-sm text-muted-foreground text-center">
          Tu contraseña fue restablecida exitosamente. Redirigiendo...
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