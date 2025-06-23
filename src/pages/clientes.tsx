import { useEffect, useState } from 'react';

interface Cliente {
  id: number;
  nombre: string;
  email: string;
  telefono: string;
  fecha_registro: string;
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/clientes')
      .then(res => res.json())
      .then(data => {
        setClientes(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Error al cargar los clientes');
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Lista de Clientes</h2>
      {loading && <div>Cargando...</div>}
      {error && <div className="text-red-600">{error}</div>}
      {!loading && !error && (
        <table className="w-full text-left table-auto">
          <thead>
            <tr className="bg-slate-50 text-slate-600 uppercase text-sm">
              <th className="py-2 px-4">Nombre</th>
              <th className="py-2 px-4">Email</th>
              <th className="py-2 px-4">Teléfono</th>
              <th className="py-2 px-4">Fecha de Registro</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map(c => (
              <tr key={c.id} className="border-b">
                <td className="py-2 px-4">{c.nombre}</td>
                <td className="py-2 px-4">{c.email}</td>
                <td className="py-2 px-4">{c.telefono}</td>
                <td className="py-2 px-4">{new Date(c.fecha_registro).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
