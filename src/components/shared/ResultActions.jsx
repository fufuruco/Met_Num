import React, { useState } from 'react';
import { Save, Printer, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/AuthContext';

export default function ResultActions({ module, method, problemSetup, resultData }) {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (!user) {
      alert('Debes iniciar sesión para guardar trabajos.');
      return;
    }
    setSaving(true);
    try {
      const existing = JSON.parse(localStorage.getItem('saved_works') || '[]');
      existing.push({
        id: Date.now().toString(),
        userId: user.id,
        module,
        method,
        problemSetup,
        resultData,
        createdAt: new Date().toISOString()
      });
      localStorage.setItem('saved_works', JSON.stringify(existing));
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
    <div className="flex gap-2 justify-end mt-4 print:hidden">
      <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2">
        <Printer className="w-4 h-4" />
        Imprimir
      </Button>
      <Button size="sm" onClick={handleSave} disabled={saving || saved} className="gap-2">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
        {saved ? 'Guardado' : 'Guardar Trabajo'}
      </Button>
    </div>
  );
}
