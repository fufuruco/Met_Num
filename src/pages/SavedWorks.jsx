import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Folder, Loader2, Calendar, Eye, Trash2, Printer, ArrowLeft, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import MathRenderer from '@/components/calculus/MathRenderer';

export default function SavedWorks() {
  const { user } = useAuth();
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWork, setSelectedWork] = useState(null);

  useEffect(() => {
    if (user) {
      fetchWorks();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchWorks = () => {
    try {
      setLoading(true);
      const all = JSON.parse(localStorage.getItem('saved_works') || '[]');
      const data = all.filter((w) => w.userId === user?.id);
      setWorks(data || []);
    } catch (err) {
      console.error('Error al cargar trabajos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWork = (id) => {
    try {
      const all = JSON.parse(localStorage.getItem('saved_works') || '[]');
      const updated = all.filter((w) => w.id !== id);
      localStorage.setItem('saved_works', JSON.stringify(updated));
      setWorks((prev) => prev.filter((w) => w.id !== id));
      if (selectedWork?.id === id) {
        setSelectedWork(null);
      }
    } catch (err) {
      console.error('Error al eliminar trabajo:', err);
    }
  };

  const getModulePath = (moduleName) => {
    if (moduleName?.includes('Cálculo')) return '/calculus';
    if (moduleName?.includes('Estad')) return '/statistics';
    return '/methods';
  };

  if (!user) {
    return (
      <div className="p-6 lg:p-10 max-w-6xl mx-auto flex flex-col items-center justify-center min-h-[50vh]">
        <Folder className="w-12 h-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-bold mb-2">Inicia Sesión</h2>
        <p className="text-muted-foreground text-center mb-6">
          Debes iniciar sesión para ver tus trabajos guardados.
        </p>
        <Link to="/login" className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium">
          Ir a Iniciar Sesión
        </Link>
      </div>
    );
  }

  // --- VISTA DETALLADA DEL TRABAJO SELECCIONADO (VISTA COMPLETA DE REPORTE) ---
  if (selectedWork) {
    return (
      <div className="p-6 lg:p-10 max-w-5xl mx-auto space-y-6">
        {/* Barra superior de navegación / acciones */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4 print:hidden">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedWork(null)}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a Mis Trabajos
          </Button>

          <div className="flex items-center gap-2">
            <Link to={getModulePath(selectedWork.module)}>
              <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
                Ir al Módulo <ArrowUpRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              className="gap-2"
            >
              <Printer className="w-4 h-4" />
              Imprimir Reporte
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDeleteWork(selectedWork.id)}
              className="gap-1.5"
            >
              <Trash2 className="w-4 h-4" />
              Eliminar
            </Button>
          </div>
        </div>

        {/* Encabezado del reporte */}
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full">
              {selectedWork.module}
            </span>
            <span className="flex items-center text-xs text-muted-foreground gap-1.5 font-medium">
              <Calendar className="w-3.5 h-3.5" />
              Guardado el: {new Date(selectedWork.createdAt).toLocaleString()}
            </span>
          </div>

          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-foreground">
            {selectedWork.method}
          </h1>
        </div>

        {/* Parámetros de Entrada */}
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            Parámetros del Problema
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {Object.entries(selectedWork.problemSetup || {}).map(([key, val]) => (
              <div key={key} className="bg-muted/40 p-3 rounded-xl border border-border/60">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase block mb-1">
                  {key}
                </span>
                <span className="text-xs font-mono font-bold text-foreground break-all">
                  {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Resultados del Cálculo */}
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Resultados del Cálculo
          </h3>
          {renderResultData(selectedWork.resultData)}
        </div>
      </div>
    );
  }

  // --- VISTA LISTA DE TRABAJOS GUARDADOS (CARDS GRID) ---
  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20">
            <Folder className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Mis Trabajos Guardados</h1>
            <p className="text-xs text-muted-foreground">Historial de cálculos y resultados archivados</p>
          </div>
        </div>

        <span className="text-xs font-semibold px-3 py-1 bg-muted rounded-full text-muted-foreground">
          {works.length} {works.length === 1 ? 'trabajo' : 'trabajos'}
        </span>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : works.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border rounded-xl bg-card/50">
          <Folder className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <h3 className="font-semibold text-lg">No tienes trabajos guardados</h3>
          <p className="text-muted-foreground text-sm mt-1 max-w-md mx-auto mb-6">
            Realiza cualquier cálculo en los módulos y presiona el botón "Guardar Trabajo" para archivarlo aquí.
          </p>
          <Link
            to="/methods"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Ir a Métodos Numéricos
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {works.map((work) => (
            <div
              key={work.id}
              className="bg-card border border-border p-5 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex justify-between items-start mb-3 gap-2">
                  <span className="inline-block px-2.5 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full truncate">
                    {work.module}
                  </span>
                  <span className="flex items-center text-[11px] text-muted-foreground gap-1 flex-shrink-0">
                    <Calendar className="w-3 h-3" />
                    {new Date(work.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="font-bold text-base mb-2 group-hover:text-primary transition-colors">
                  {work.method}
                </h3>

                {/* Short preview of problem setup */}
                <div className="p-3 bg-muted/40 rounded-xl text-xs space-y-1.5 mb-4 border border-border/50">
                  <span className="font-semibold text-muted-foreground text-[10px] uppercase tracking-wider block">
                    Parámetros:
                  </span>
                  <div className="font-mono text-[11px] space-y-1 overflow-hidden max-h-20">
                    {Object.entries(work.problemSetup || {}).slice(0, 3).map(([key, val]) => (
                      <div key={key} className="flex justify-between gap-2">
                        <span className="text-muted-foreground capitalize">{key}:</span>
                        <span className="font-semibold text-foreground truncate">{String(val)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-3 border-t border-border/60">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setSelectedWork(work)}
                  className="gap-1.5 text-xs flex-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Abrir Trabajo
                </Button>

                <Link
                  to={getModulePath(work.module)}
                  className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  title="Ir al módulo"
                >
                  <ArrowUpRight className="w-4 h-4" />
                </Link>

                <button
                  onClick={() => handleDeleteWork(work.id)}
                  className="p-2 rounded-lg hover:bg-rose-500/10 text-rose-500 hover:text-rose-600 transition-colors"
                  title="Eliminar trabajo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Sub-componente para renderizar la data del resultado en formato completo
function renderResultData(data) {
  if (!data) return <p className="text-sm text-muted-foreground">Sin datos de resultado guardados.</p>;

  // Case 1: Iterations table (NonLinear / Integration)
  if (Array.isArray(data.iterations) && data.iterations.length > 0) {
    const keys = Object.keys(data.iterations[0]);
    return (
      <div className="space-y-4">
        {data.root !== undefined && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-center font-semibold text-base">
            Raíz Encontrada: <span className="font-mono text-xl font-bold ml-1">{String(data.root)}</span>
          </div>
        )}
        <div className="overflow-x-auto border border-border rounded-xl text-xs">
          <table className="w-full text-left border-collapse">
            <thead className="bg-muted font-semibold border-b border-border">
              <tr>
                {keys.map((k) => (
                  <th key={k} className="p-3 capitalize">{k}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.iterations.map((row, i) => (
                <tr key={i} className="border-b border-border/50 hover:bg-muted/30 font-mono">
                  {keys.map((k) => (
                    <td key={k} className="p-3">{typeof row[k] === 'number' ? row[k].toFixed(6) : String(row[k])}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Case 2: ODE Points
  if (Array.isArray(data.points) && data.points.length > 0) {
    return (
      <div className="overflow-x-auto border border-border rounded-xl text-xs">
        <table className="w-full text-left border-collapse">
          <thead className="bg-muted font-semibold border-b border-border">
            <tr>
              <th className="p-3">#</th>
              <th className="p-3">x</th>
              <th className="p-3">y</th>
            </tr>
          </thead>
          <tbody>
            {data.points.map((pt, i) => (
              <tr key={i} className="border-b border-border/50 hover:bg-muted/30 font-mono">
                <td className="p-3">{i}</td>
                <td className="p-3">{typeof pt.x === 'number' ? pt.x.toFixed(4) : pt.x}</td>
                <td className="p-3">{typeof pt.y === 'number' ? pt.y.toFixed(4) : pt.y}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Case 3: Matrices
  if (Array.isArray(data.resultMatrix) || Array.isArray(data.matrix)) {
    const mat = data.resultMatrix || data.matrix;
    return (
      <div className="p-6 bg-muted/30 rounded-xl flex flex-col items-center">
        <span className="text-xs font-semibold mb-3 text-muted-foreground">Matriz Resultante:</span>
        <div className="inline-block border-l-2 border-r-2 border-primary px-6 py-3 space-y-2 bg-background rounded-lg shadow-sm">
          {mat.map((row, r) => (
            <div key={r} className="flex gap-6 justify-center">
              {Array.isArray(row) ? (
                row.map((val, c) => (
                  <span key={c} className="font-mono text-sm min-w-[50px] text-center font-medium">
                    {typeof val === 'number' ? val.toFixed(2) : String(val)}
                  </span>
                ))
              ) : (
                <span className="font-mono text-sm">{String(row)}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Case 4: Statistics Object (Descriptive and Regression)
  if (typeof data === 'object' && (data.mean !== undefined || data.promedio !== undefined || data.m !== undefined || data.r2Linear !== undefined)) {
    // Filter out array/object values that shouldn't be printed as simple strings
    const simpleMetrics = Object.entries(data).filter(([key, val]) => {
      const isComplex = typeof val === 'object' || Array.isArray(val);
      const isExcluded = ['medianStep', 'modeText'].includes(key);
      return !isComplex && !isExcluded;
    });

    return (
      <div className="space-y-6">
        {/* Simple metrics grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-xs">
          {simpleMetrics.map(([key, val]) => (
            <div key={key} className="p-3 bg-muted/30 rounded-xl border border-border">
              <span className="text-muted-foreground text-[10px] uppercase font-bold block mb-1">{key}</span>
              <span className="font-mono font-bold text-sm text-primary">
                {typeof val === 'number' ? val.toFixed(4) : String(val)}
              </span>
            </div>
          ))}
        </div>

        {/* Text descriptions if available */}
        {data.medianStep && (
          <div className="p-4 bg-muted/20 border border-border rounded-xl text-xs space-y-1">
            <span className="font-bold text-[10px] text-muted-foreground uppercase block">Cálculo de Mediana:</span>
            <p className="text-foreground text-sm">{data.medianStep}</p>
          </div>
        )}

        {data.modeText && (
          <div className="p-4 bg-muted/20 border border-border rounded-xl text-xs space-y-1">
            <span className="font-bold text-[10px] text-muted-foreground uppercase block">Moda:</span>
            <p className="text-foreground text-sm">{data.modeText}</p>
          </div>
        )}

        {/* Intervals Table (Frecuencias Agrupadas) */}
        {Array.isArray(data.intervals) && data.intervals.length > 0 && (
          <div className="space-y-3">
            <span className="font-bold text-sm text-foreground block">Tabla de Frecuencias Agrupadas:</span>
            <div className="overflow-x-auto border border-border rounded-xl text-xs">
              <table className="w-full text-left border-collapse">
                <thead className="bg-muted font-semibold border-b border-border">
                  <tr>
                    <th className="p-3">Clase</th>
                    <th className="p-3">Intervalo</th>
                    <th className="p-3 text-center">Marca (Xi)</th>
                    <th className="p-3 text-center">fi</th>
                    <th className="p-3 text-center">hi</th>
                    <th className="p-3 text-center">Fi</th>
                  </tr>
                </thead>
                <tbody>
                  {data.intervals.map((row) => (
                    <tr key={row.index} className="border-b border-border/50 hover:bg-muted/30 font-mono">
                      <td className="p-3 font-semibold text-muted-foreground">{row.index}</td>
                      <td className="p-3">{row.label}</td>
                      <td className="p-3 text-center">{row.mid.toFixed(2)}</td>
                      <td className="p-3 text-center font-bold text-primary">{row.count}</td>
                      <td className="p-3 text-center">{(row.relFreq * 100).toFixed(1)}%</td>
                      <td className="p-3 text-center">{row.cumFreq}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Deviations Table */}
        {Array.isArray(data.deviationsTable) && data.deviationsTable.length > 0 && (
          <div className="space-y-3">
            <span className="font-bold text-sm text-foreground block">Tabla de Desviaciones:</span>
            <div className="overflow-x-auto border border-border rounded-xl text-xs">
              <table className="w-full text-left border-collapse">
                <thead className="bg-muted font-semibold border-b border-border">
                  <tr>
                    <th className="p-3">i</th>
                    <th className="p-3">Dato (xi)</th>
                    <th className="p-3">Diferencia (xi - x̄)</th>
                    <th className="p-3 text-right">Diferencia² (xi - x̄)²</th>
                  </tr>
                </thead>
                <tbody>
                  {data.deviationsTable.map((row) => (
                    <tr key={row.index} className="border-b border-border/50 hover:bg-muted/30 font-mono">
                      <td className="p-3 text-muted-foreground">{row.index}</td>
                      <td className="p-3 font-semibold">{row.val}</td>
                      <td className="p-3">{row.diff >= 0 ? '+' : ''}{row.diff.toFixed(4)}</td>
                      <td className="p-3 text-right text-primary font-semibold">{row.diffSq.toFixed(4)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Case 5: Math / Calculus steps / latex string
  if (data.latex || data.result) {
    return (
      <div className="p-6 bg-muted/30 rounded-xl space-y-4">
        {data.result && (
          <div className="text-base font-semibold">
            Resultado: <span className="font-mono text-primary font-bold ml-1">{String(data.result)}</span>
          </div>
        )}
        {data.latex && <MathRenderer text={`$$${data.latex}$$`} />}
      </div>
    );
  }

  // Fallback: Pretty JSON or raw string
  return (
    <pre className="p-4 bg-muted/50 rounded-xl text-xs font-mono overflow-x-auto text-foreground">
      {typeof data === 'string' ? data : JSON.stringify(data, null, 2)}
    </pre>
  );
}
