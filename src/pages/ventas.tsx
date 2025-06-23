import { useEffect, useState } from 'react';
import { saveAs } from 'file-saver';

interface Venta {
  id: number;
  cantidad: number;
  total: number;
  fecha: string;
  producto: { nombre: string };
  cliente: { nombre: string } | null;
}

export default function VentasPage() {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/ventas')
      .then(res => res.json())
      .then(data => {
        setVentas(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Error al cargar las ventas');
        setLoading(false);
      });
  }, []);

  // Exportar a CSV
  const exportarCSV = () => {
    const encabezado = 'Producto,Cantidad,Cliente,Total,Fecha\n';
    const filas = ventas.map(v => [
      v.producto?.nombre,
      v.cantidad,
      v.cliente?.nombre || '-',
      v.total,
      new Date(v.fecha).toLocaleString()
    ].join(',')).join('\n');
    const csv = encabezado + filas;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `ventas_${new Date().toISOString().slice(0,10)}.csv`);
  };

  return (
    <div className="max-w-3xl mx-auto mt-8 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Historial de Ventas</h2>
      <button onClick={exportarCSV} className="mb-4 bg-teal-600 text-white px-4 py-2 rounded shadow hover:bg-teal-700">Descargar CSV</button>
      {loading && <div>Cargando...</div>}
      {error && <div className="text-red-600">{error}</div>}
      {!loading && !error && (
        <table className="w-full text-left table-auto">
          <thead>
            <tr className="bg-slate-50 text-slate-600 uppercase text-sm">
              <th className="py-2 px-4">Producto</th>
              <th className="py-2 px-4">Cantidad</th>
              <th className="py-2 px-4">Cliente</th>
              <th className="py-2 px-4">Total (€)</th>
              <th className="py-2 px-4">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {ventas.map(v => (
              <tr key={v.id} className="border-b">
                <td className="py-2 px-4">{v.producto?.nombre}</td>
                <td className="py-2 px-4">{v.cantidad}</td>
                <td className="py-2 px-4">{v.cliente?.nombre || '-'}</td>
                <td className="py-2 px-4">{v.total}</td>
                <td className="py-2 px-4">{new Date(v.fecha).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
