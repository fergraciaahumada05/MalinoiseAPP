// Página de gestión de ventas para el área admin (migrada desde pages/ventas.tsx)

import { withAuthProtection } from "@/components/common/withAuthProtection";
import { useEffect, useState } from 'react';
import { saveAs } from 'file-saver';

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
    <div>
      <h1>Gestión de Ventas</h1>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Producto</th>
            <th>Cantidad</th>
            <th>Precio</th>
            <th>Fecha</th>
          </tr>
        </thead>
        <tbody>
          {ventas.map(venta => (
            <tr key={venta.id}>
              <td>{venta.id}</td>
              <td>{venta.producto}</td>
              <td>{venta.cantidad}</td>
              <td>{venta.precio}</td>
              <td>{new Date(venta.fecha).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default withAuthProtection(PaginaVentasAdmin);
