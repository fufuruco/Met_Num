import React, { useState } from 'react';
import MathRenderer from '@/components/calculus/MathRenderer';
import { Sparkles, ChevronDown, ChevronUp, Lock, CheckCircle2, Zap, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/AuthContext';

export default function StepByStepViewer({ steps = [] }) {
  const { isPremium, credits, useCredit, redeemCode } = useAuth();
  const [expanded, setExpanded] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [redeemError, setRedeemError] = useState('');
  const [redeemSuccess, setRedeemSuccess] = useState('');
  const [redeeming, setRedeeming] = useState(false);

  if (!steps || steps.length === 0) return null;

  const hasAccess = isPremium || credits > 0;
  const visibleSteps = hasAccess ? steps : steps.slice(0, 2);

  const handleRedeem = async (e) => {
    e.preventDefault();
    setRedeemError('');
    setRedeemSuccess('');
    setRedeeming(true);

    try {
      const res = await redeemCode(promoCode);
      setRedeemSuccess(res.message || '¡Código activado con éxito!');
      setPromoCode('');
      setTimeout(() => setShowUpgradeModal(false), 2000);
    } catch (err) {
      setRedeemError(err.message || 'Código inválido o expirado.');
    } finally {
      setRedeeming(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-border pb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">Solución Paso a Paso</h3>
            <p className="text-xs text-muted-foreground">Procedimiento algebraico deductivo</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isPremium ? (
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1.5 shadow-sm">
              👑 Premium Ilimitado (∞)
            </span>
          ) : (
            <span
              onClick={() => setShowUpgradeModal(true)}
              className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center gap-1.5 cursor-pointer hover:bg-indigo-500/20 transition-all"
              title="Haz clic para activar Premium o canjear código"
            >
              <Zap className="w-3.5 h-3.5 fill-indigo-500" />
              {credits}/5 Créditos diarios
            </span>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="h-8 w-8 p-0 rounded-xl"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {expanded && (
        <div className="space-y-5 pt-2">
          {visibleSteps.map((step, idx) => (
            <div
              key={idx}
              className="relative pl-6 pb-4 border-l-2 border-primary/30 last:border-l-0 last:pb-0"
            >
              {/* Dot */}
              <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-background border-2 border-primary flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">
                    Paso {idx + 1}:
                  </span>
                  <span className="text-xs font-bold text-foreground">
                    {step.title}
                  </span>
                </div>

                {step.explanation && (
                  <div className="text-xs text-muted-foreground leading-relaxed">
                    <MathRenderer text={step.explanation} />
                  </div>
                )}

                {step.latex && (
                  <div className="p-3.5 bg-muted/30 rounded-2xl border border-border/50 text-sm overflow-x-auto">
                    <MathRenderer text={`$$${step.latex}$$`} />
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Banner if credits ran out */}
          {!hasAccess && steps.length > 2 && (
            <div className="mt-4 p-5 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-center sm:text-left">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-indigo-500/20">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground">
                    Has usado tus 5 créditos diarios de paso a paso
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Se renovarán mañana automáticamente a las 00:00 o puedes activar Premium para pasos ilimitados.
                  </p>
                </div>
              </div>

              <Button
                size="sm"
                onClick={() => setShowUpgradeModal(true)}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md shadow-indigo-500/25 flex-shrink-0 text-xs rounded-xl"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                Activar Premium / Código
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Upgrade & Redeem Code Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mx-auto text-white shadow-lg shadow-orange-500/30">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">Activar NumLab Premium</h3>
              <p className="text-xs text-muted-foreground">
                Pasos a paso infinitos, análisis avanzado SPSS y guardado ilimitado.
              </p>
            </div>

            {/* Canje de Código Promocional / Cupón */}
            <div className="p-4 bg-muted/40 rounded-2xl border border-border space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-primary" /> ¿Tienes un código de activación?
              </span>

              {redeemError && (
                <div className="p-2.5 rounded-xl bg-destructive/10 text-destructive text-xs font-medium">
                  {redeemError}
                </div>
              )}

              {redeemSuccess && (
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
                  {redeemSuccess}
                </div>
              )}

              <form onSubmit={handleRedeem} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ej: CODIGO100"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs font-mono font-bold rounded-xl border border-border bg-background uppercase focus:ring-1 focus:ring-primary"
                  required
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={redeeming}
                  className="bg-primary text-primary-foreground text-xs rounded-xl font-bold"
                >
                  {redeeming ? 'Canjeando...' : 'Canjear'}
                </Button>
              </form>
            </div>

            <div className="space-y-2.5 text-xs text-muted-foreground">
              {[
                'Pasos a paso infinitos e ilimitados en todas las operaciones',
                'Estadística Avanzada SPSS (ANOVA, t-Student, Chi²)',
                'Guardado de trabajos ilimitado en tu base de datos',
                'Impresión y exportación de reportes limpios',
              ].map((feat, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 rounded-xl"
                onClick={() => setShowUpgradeModal(false)}
              >
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
