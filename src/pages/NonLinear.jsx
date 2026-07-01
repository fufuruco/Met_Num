import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Binary } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import NonLinearMethod from '@/components/nonlinear/NonLinearMethod';

const methods = [
  { id: 'bisection', label: 'Bisección' },
  { id: 'regulaFalsi', label: 'Regula Falsi' },
  { id: 'newton', label: 'Newton-Raphson' },
  { id: 'secant', label: 'Secante' },
  { id: 'fixedPoint', label: 'Punto Fijo' },
];

export default function NonLinear() {
  const [activeTab, setActiveTab] = useState('bisection');

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/" className="p-2 rounded-lg hover:bg-muted transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
          <Binary className="w-4 h-4 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-lg">Ecuaciones No Lineales</h1>
          <p className="text-xs text-muted-foreground">Encuentra raíces de funciones</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50 p-1.5 rounded-xl mb-6">
          {methods.map(m => (
            <TabsTrigger key={m.id} value={m.id} className="text-xs px-3 py-2 rounded-lg">
              {m.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {methods.map(m => (
          <TabsContent key={m.id} value={m.id}>
            <NonLinearMethod methodId={m.id} methodName={m.label} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}