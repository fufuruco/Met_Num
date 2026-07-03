import React from "react";

export default function AuthLayout({ icon: Icon, title, subtitle, footer, children }) {
  return (
    <div
      className="auth-bg"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2.5rem 1rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative background orbs */}
      <div style={{
        position: "absolute", top: "-10%", left: "-5%",
        width: "24rem", height: "24rem", borderRadius: "9999px",
        background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)",
        pointerEvents: "none"
      }} />
      <div style={{
        position: "absolute", bottom: "-10%", right: "-5%",
        width: "24rem", height: "24rem", borderRadius: "9999px",
        background: "radial-gradient(circle, rgba(20,184,166,0.12) 0%, transparent 70%)",
        pointerEvents: "none"
      }} />

      <div style={{ width: "100%", maxWidth: "28rem", position: "relative", zIndex: 10 }} className="animate-fade-in">
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: "4rem", height: "4rem", borderRadius: "1rem",
            background: "linear-gradient(135deg, #6366f1, #7c3aed)",
            marginBottom: "1.25rem",
            boxShadow: "0 0 25px rgba(99,102,241,0.4), 0 8px 32px rgba(0,0,0,0.4)"
          }}>
            <Icon style={{ width: "2rem", height: "2rem", color: "white" }} aria-hidden="true" />
          </div>
          <h1 className="gradient-text" style={{ fontSize: "1.875rem", fontWeight: 800, lineHeight: 1.2, letterSpacing: "-0.02em" }}>
            {title}
          </h1>
          {subtitle && (
            <p style={{ color: "hsl(215 16% 55%)", fontSize: "0.875rem", marginTop: "0.5rem", lineHeight: 1.5 }}>
              {subtitle}
            </p>
          )}
        </div>

        {/* Card */}
        <div style={{
          background: "hsl(222 47% 9% / 0.95)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(99,102,241,0.25)",
          borderRadius: "1.25rem",
          padding: "2rem",
          boxShadow: "0 0 0 1px rgba(255,255,255,0.04), 0 25px 50px rgba(0,0,0,0.5), 0 0 30px rgba(99,102,241,0.08)"
        }}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <p style={{
            textAlign: "center",
            fontSize: "0.875rem",
            color: "hsl(215 16% 55%)",
            marginTop: "1.5rem"
          }}>
            {footer}
          </p>
        )}

        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", marginTop: "2rem", opacity: 0.35 }}>
          <div style={{
            width: "1.25rem", height: "1.25rem", borderRadius: "0.375rem",
            background: "linear-gradient(135deg, #6366f1, #7c3aed)",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <svg viewBox="0 0 10 10" style={{ width: "0.6rem", height: "0.6rem", fill: "white" }}>
              <path d="M5 1 L8.5 4 L5 9.5 L1.5 4 Z" />
            </svg>
          </div>
          <span style={{ fontSize: "0.7rem", color: "hsl(215 16% 60%)", fontWeight: 500 }}>
            NumLab · Ing. Jorge Pereira Hernandez
          </span>
        </div>
      </div>
    </div>
  );
}