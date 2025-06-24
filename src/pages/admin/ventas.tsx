// Página de gestión de ventas para el área admin (migrada desde pages/ventas.tsx)

import { useEffect, useState } from 'react';
import withAuthProtection from "@/components/common/withAuthProtection";

interface Venta {
  id: number;
  producto: string;
  cantidad: number;
  precio: number;
  fecha: string;
}

function PaginaVentasAdmin() {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/ventas')
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

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-6">Gestión de Ventas</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 rounded">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border">ID</th>
              <th className="px-4 py-2 border">Producto</th>
              <th className="px-4 py-2 border">Cantidad</th>
              <th className="px-4 py-2 border">Precio</th>
              <th className="px-4 py-2 border">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {ventas.map(venta => (
              <tr key={venta.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border">{venta.id}</td>
                <td className="px-4 py-2 border">{venta.producto}</td>
                <td className="px-4 py-2 border">{venta.cantidad}</td>
                <td className="px-4 py-2 border">{venta.precio.toLocaleString("es-MX", { style: "currency", currency: "MXN" })}</td>
                <td className="px-4 py-2 border">{new Date(venta.fecha).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default withAuthProtection(PaginaVentasAdmin);
