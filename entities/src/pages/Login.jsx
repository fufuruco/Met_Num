import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, Mail, Lock, Loader2 } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import GoogleIcon from "@/components/GoogleIcon";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { checkUserAuth } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error en inicio de sesión');
      }

      window.localStorage.setItem('local_auth_token', data.token);
      await checkUserAuth();
      navigate('/');
    } catch (err) {
      setError(err.message || "Correo o contraseña incorrectos");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const response = await fetch('/api/auth/login-provider', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'google' })
      });
      const data = await response.json();
      if (response.ok && data.token) {
        window.localStorage.setItem('local_auth_token', data.token);
        await checkUserAuth();
        navigate('/');
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AuthLayout
      icon={LogIn}
      title="Bienvenido de nuevo"
      subtitle="Inicia sesión en tu cuenta de NumLab"
      footer={
        <>
          ¿No tienes cuenta?{" "}
          <Link to="/register" className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors">
            Regístrate gratis
          </Link>
        </>
      }
    >
      {/* Google */}
      <Button
        variant="outline"
        type="button"
        onClick={handleGoogleLogin}
        className="w-full h-11 text-sm font-medium mb-5 bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-foreground transition-all"
      >
        <GoogleIcon className="w-5 h-5 mr-2" />
        Continuar con Google
      </Button>

      {/* Divider */}
      <div className="relative mb-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-3 text-muted-foreground font-medium">o con tu correo</span>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-sm font-medium text-foreground/80">Correo electrónico</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              autoFocus
              placeholder="tu@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 h-11 bg-secondary/50 border-border/60 focus:border-indigo-500/60 transition-all"
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-sm font-medium text-foreground/80">Contraseña</Label>
            <Link to="/forgot-password" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 h-11 bg-secondary/50 border-border/60 focus:border-indigo-500/60 transition-all"
              required
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-11 font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 border-0 text-white shadow-lg shadow-indigo-500/25 transition-all mt-2"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Iniciando sesión...
            </>
          ) : (
            "Iniciar sesión"
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}