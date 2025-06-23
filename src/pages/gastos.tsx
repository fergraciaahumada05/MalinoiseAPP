import { useEffect, useState } from 'react';
import { saveAs } from 'file-saver';

interface Gasto {
  id: number;
  descripcion: string;
  categoria: string;
  monto: number;
  fecha: string;
}

export default function GastosPage() {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/gastos')
      .then(res => res.json())
      .then(data => {
        setGastos(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Error al cargar los gastos');
        setLoading(false);
      });
  }, []);

  // Exportar a CSV
  const exportarCSV = () => {
    const encabezado = 'Descripción,Categoría,Monto,Fecha\n';
    const filas = gastos.map(g => [
      g.descripcion,
      g.categoria,
      g.monto,
      new Date(g.fecha).toLocaleString()
    ].join(',')).join('\n');
    const csv = encabezado + filas;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `gastos_${new Date().toISOString().slice(0,10)}.csv`);
  };

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Lista de Gastos</h2>
      <button onClick={exportarCSV} className="mb-4 bg-teal-600 text-white px-4 py-2 rounded shadow hover:bg-teal-700">Descargar CSV</button>
      {loading && <div>Cargando...</div>}
      {error && <div className="text-red-600">{error}</div>}
      {!loading && !error && (
        <table className="w-full text-left table-auto">
          <thead>
            <tr className="bg-slate-50 text-slate-600 uppercase text-sm">
              <th className="py-2 px-4">Descripción</th>
              <th className="py-2 px-4">Categoría</th>
              <th className="py-2 px-4">Monto (€)</th>
              <th className="py-2 px-4">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {gastos.map(g => (
              <tr key={g.id} className="border-b">
                <td className="py-2 px-4">{g.descripcion}</td>
                <td className="py-2 px-4">{g.categoria}</td>
                <td className="py-2 px-4">{g.monto}</td>
                <td className="py-2 px-4">{new Date(g.fecha).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
