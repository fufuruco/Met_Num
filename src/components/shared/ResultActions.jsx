import React, { useState } from 'react';
import { Save, Printer, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/AuthContext';
import { authClient } from '@/api/authClient';

export default function ResultActions({
  module,
  moduleName,
  method,
  methodName,
  problemSetup,
  resultData,
}) {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const mod = moduleName || module || 'Cálculo';
  const meth = methodName || method || 'Resultado';

  const handleSave = async () => {
    if (!user) {
      alert('Debes iniciar sesión o entrar como invitado para guardar trabajos.');
      return;
    }
    setSaving(true);
    try {
      await authClient.saveWork({
        module: mod,
        method: meth,
        problemSetup,
        resultData,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Error guardando:', err);
      alert('Hubo un error al guardar el trabajo.');
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex items-center gap-2 justify-end mt-4 pt-4 border-t border-border/40 print:hidden">
      <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2 rounded-xl text-xs">
        <Printer className="w-4 h-4" />
        Imprimir Reporte
      </Button>
      <Button
        size="sm"
        onClick={handleSave}
        disabled={saving || saved}
        className="gap-2 rounded-xl text-xs bg-primary text-primary-foreground font-semibold"
      >
        {saving ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : saved ? (
          <CheckCircle className="w-4 h-4 text-emerald-300" />
        ) : (
          <Save className="w-4 h-4" />
        )}
        {saved ? '¡Guardado con Éxito!' : 'Guardar Trabajo'}
      </Button>
    </div>
  );
}
