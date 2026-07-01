import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function IterationTable({ columns, data }) {
  if (!data || data.length === 0) return null;

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card">
      <div className="px-5 py-3 border-b border-border">
        <h3 className="text-sm font-semibold">Tabla de Iteraciones</h3>
      </div>
      <div className="overflow-x-auto max-h-80 overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              {columns.map((col) => (
                <TableHead key={col.key} className="text-xs font-semibold whitespace-nowrap">
                  {col.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, idx) => (
              <TableRow key={idx} className="hover:bg-muted/30">
                {columns.map((col) => (
                  <TableCell key={col.key} className="font-mono text-xs whitespace-nowrap">
                    {typeof row[col.key] === 'number' 
                      ? col.key === 'i' ? row[col.key] : row[col.key].toFixed(6)
                      : row[col.key]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}