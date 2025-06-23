import { useEffect, useState } from 'react';

interface Producto {
  id: number;
  nombre: string;
  sku: string;
  stock: number;
  precio: number;
  fecha_alta: string;
}

export default function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/productos')
      .then(res => res.json())
      .then(data => {
        setProductos(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Error al cargar los productos');
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Inventario de Productos</h2>
      {loading && <div>Cargando...</div>}
      {error && <div className="text-red-600">{error}</div>}
      {!loading && !error && (
        <table className="w-full text-left table-auto">
          <thead>
            <tr className="bg-slate-50 text-slate-600 uppercase text-sm">
              <th className="py-2 px-4">Nombre</th>
              <th className="py-2 px-4">SKU</th>
              <th className="py-2 px-4">Stock</th>
              <th className="py-2 px-4">Precio (€)</th>
              <th className="py-2 px-4">Fecha de Alta</th>
            </tr>
          </thead>
          <tbody>
            {productos.map(p => (
              <tr key={p.id} className="border-b">
                <td className="py-2 px-4">{p.nombre}</td>
                <td className="py-2 px-4">{p.sku}</td>
                <td className="py-2 px-4">{p.stock}</td>
                <td className="py-2 px-4">{p.precio}</td>
                <td className="py-2 px-4">{new Date(p.fecha_alta).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
