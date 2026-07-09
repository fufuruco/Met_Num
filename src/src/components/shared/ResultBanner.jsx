import React from 'react';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

export default function ResultBanner({ result }) {
  if (!result) return null;

  if (result.error) {
    return (
      <div className="flex items-start gap-3 px-5 py-4 rounded-xl bg-red-50 border border-red-200 text-red-800">
        <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-sm">Error</p>
          <p className="text-sm mt-0.5">{result.error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 px-5 py-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800">
      {result.warning ? (
        <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-600" />
      ) : (
        <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
      )}
      <div className="flex-1">
        <p className="font-semibold text-sm">
          {result.warning ? 'Resultado (con advertencia)' : 'Resultado'}
        </p>
        {result.root !== undefined && (
          <p className="font-mono text-lg font-bold mt-1">Raíz ≈ {result.root.toFixed(8)}</p>
        )}
        {result.iterations && (
          <p className="text-sm mt-0.5">Convergió en {result.iterations} iteraciones</p>
        )}
        {result.warning && (
          <p className="text-sm text-amber-700 mt-1">{result.warning}</p>
        )}
      </div>
    </div>
  );
}