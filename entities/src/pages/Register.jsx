import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Mail, Lock, Loader2, ShieldCheck, Info, AlertCircle } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import AuthLayout from "@/components/AuthLayout";
import GoogleIcon from "@/components/GoogleIcon";

const inputStyle = {
  height: "2.75rem",
  paddingLeft: "2.5rem",
  background: "hsl(222 35% 11%)",
  border: "1px solid hsl(222 35% 20%)",
  color: "hsl(213 31% 91%)",
  borderRadius: "0.625rem",
  fontSize: "0.875rem",
  width: "100%",
  outline: "none",
  transition: "border-color 0.2s",
};

const labelStyle = {
  fontSize: "0.8125rem",
  fontWeight: 500,
  color: "hsl(213 31% 75%)",
  display: "block",
  marginBottom: "0.375rem",
};

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [devCode, setDevCode] = useState("");

  const { checkUserAuth } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Error al registrarse');
      }
      if (data?.otpCode) {
        setDevCode(data.otpCode);
      }
      setShowOtp(true);
    } catch (err) {
      if (err.status === 409) {
        setError("Este correo ya está registrado. ¿Quieres iniciar sesión?");
      } else {
        setError(err.message || "Error al registrarse. Intenta de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setError("");
    setLoading(true);
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otpCode })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Código de verificación inválido');
      }
      window.localStorage.setItem('local_auth_token', data.token);
      await checkUserAuth();
      window.location.href = "/";
    } catch (err) {
      setError(err.message || "Código de verificación inválido");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    try {
      const response = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Error al reenviar el código');
      }
      if (data?.otpCode) {
        setDevCode(data.otpCode);
      }
    } catch (err) {
      setError(err.message || "Error al reenviar el código");
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
        window.location.href = "/";
      }
    } catch (e) {
      console.error(e);
    }
  };

  /* ── OTP screen ── */
  if (showOtp) {
    return (
      <AuthLayout
        icon={ShieldCheck}
        title="Verificar correo"
        subtitle={`Código enviado a ${email}`}
      >
        {/* Dev-mode OTP display */}
        {devCode && (
          <div style={{
            marginBottom: "1.25rem",
            padding: "1rem",
            borderRadius: "0.75rem",
            background: "rgba(99,102,241,0.1)",
            border: "1px solid rgba(99,102,241,0.3)",
            display: "flex",
            alignItems: "flex-start",
            gap: "0.75rem"
          }}>
            <Info style={{ width: "1.125rem", height: "1.125rem", color: "#818cf8", flexShrink: 0, marginTop: "2px" }} />
            <div>
              <p style={{ fontSize: "0.7rem", fontWeight: 600, color: "#a5b4fc", marginBottom: "0.375rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Modo local — tu código de verificación
              </p>
              <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "1.75rem", fontWeight: 700, color: "#c7d2fe", letterSpacing: "0.25em" }}>
                {devCode}
              </p>
            </div>
          </div>
        )}

        {error && (
          <div style={{
            marginBottom: "1rem", padding: "0.75rem", borderRadius: "0.625rem",
            background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)",
            color: "#f87171", fontSize: "0.875rem", display: "flex", alignItems: "center", gap: "0.5rem"
          }}>
            <AlertCircle style={{ width: "1rem", height: "1rem", flexShrink: 0 }} />
            {error}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.5rem" }}>
          <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode} autoFocus autoComplete="one-time-code">
            <InputOTPGroup>
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <InputOTPSlot 
                  key={index} 
                  index={index} 
                  style={{
                    background: "hsl(222 35% 11%)",
                    borderColor: "hsl(222 35% 20%)",
                    color: "hsl(213 31% 91%)",
                    width: "2.75rem",
                    height: "3.25rem",
                    fontSize: "1.25rem"
                  }}
                />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>

        <button
          onClick={handleVerify}
          disabled={loading || otpCode.length < 6}
          style={{
            width: "100%", height: "2.75rem",
            background: (loading || otpCode.length < 6) ? "rgba(99,102,241,0.4)" : "linear-gradient(135deg, #6366f1, #7c3aed)",
            border: "none", borderRadius: "0.625rem", color: "white",
            fontWeight: 600, fontSize: "0.9rem", cursor: (loading || otpCode.length < 6) ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
            boxShadow: "0 4px 20px rgba(99,102,241,0.3)",
            transition: "all 0.2s"
          }}
        >
          {loading ? (
            <>
              <Loader2 style={{ width: "1rem", height: "1rem", animation: "spin 1s linear infinite" }} />
              Verificando...
            </>
          ) : "Verificar cuenta"}
        </button>

        <p style={{ textAlign: "center", fontSize: "0.8125rem", color: "hsl(215 16% 55%)", marginTop: "1rem" }}>
          ¿No ves el código?{" "}
          <button
            onClick={handleResend}
            style={{ color: "#818cf8", fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}
          >
            Reenviar
          </button>
        </p>
      </AuthLayout>
    );
  }

  /* ── Registration form ── */
  return (
    <AuthLayout
      icon={UserPlus}
      title="Crear cuenta"
      subtitle="Únete a NumLab — Métodos Numéricos"
      footer={
        <>
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" style={{ color: "#818cf8", fontWeight: 600, textDecoration: "none" }}>
            Iniciar sesión
          </Link>
        </>
      }
    >
      {/* Google */}
      <button
        onClick={handleGoogleLogin}
        style={{
          width: "100%", height: "2.75rem",
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: "0.625rem",
          color: "hsl(213 31% 85%)",
          fontSize: "0.875rem", fontWeight: 500,
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.625rem",
          marginBottom: "1.25rem",
          transition: "all 0.2s"
        }}
        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
        onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
      >
        <GoogleIcon style={{ width: "1.125rem", height: "1.125rem" }} />
        Continuar con Google
      </button>

      {/* Divider */}
      <div style={{ position: "relative", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <div style={{ flex: 1, height: "1px", background: "hsl(222 35% 18%)" }} />
        <span style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "hsl(215 16% 45%)", fontWeight: 500 }}>
          o con correo
        </span>
        <div style={{ flex: 1, height: "1px", background: "hsl(222 35% 18%)" }} />
      </div>

      {/* Error */}
      {error && (
        <div style={{
          marginBottom: "1rem", padding: "0.75rem 1rem", borderRadius: "0.625rem",
          background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)",
          color: "#f87171", fontSize: "0.875rem", display: "flex", alignItems: "center", gap: "0.5rem"
        }}>
          <AlertCircle style={{ width: "1rem", height: "1rem", flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {/* Email */}
        <div>
          <label htmlFor="email" style={labelStyle}>Correo electrónico</label>
          <div style={{ position: "relative" }}>
            <Mail style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", width: "1rem", height: "1rem", color: "hsl(215 16% 45%)" }} />
            <input
              id="email"
              type="email"
              autoComplete="email"
              autoFocus
              placeholder="tu@correo.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={inputStyle}
              required
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" style={labelStyle}>Contraseña</label>
          <div style={{ position: "relative" }}>
            <Lock style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", width: "1rem", height: "1rem", color: "hsl(215 16% 45%)" }} />
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={inputStyle}
              required
            />
          </div>
        </div>

        {/* Confirm */}
        <div>
          <label htmlFor="confirm" style={labelStyle}>Confirmar contraseña</label>
          <div style={{ position: "relative" }}>
            <Lock style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", width: "1rem", height: "1rem", color: "hsl(215 16% 45%)" }} />
            <input
              id="confirm"
              type="password"
              autoComplete="new-password"
              placeholder="Repite tu contraseña"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              style={inputStyle}
              required
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%", height: "2.75rem", marginTop: "0.25rem",
            background: loading ? "rgba(99,102,241,0.5)" : "linear-gradient(135deg, #6366f1, #7c3aed)",
            border: "none", borderRadius: "0.625rem", color: "white",
            fontWeight: 600, fontSize: "0.9rem",
            cursor: loading ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
            boxShadow: "0 4px 20px rgba(99,102,241,0.35)",
            transition: "all 0.2s"
          }}
        >
          {loading ? (
            <>
              <Loader2 style={{ width: "1rem", height: "1rem", animation: "spin 1s linear infinite" }} />
              Creando cuenta...
            </>
          ) : "Crear cuenta"}
        </button>
      </form>
    </AuthLayout>
  );
}