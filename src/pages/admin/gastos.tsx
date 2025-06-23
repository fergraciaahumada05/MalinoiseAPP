// Página de gestión de gastos para el área admin (migrada desde pages/gastos.tsx)

import { withAuthProtection } from "@/components/common/withAuthProtection";
import { useEffect, useState } from 'react';
import { saveAs } from 'file-saver';

interface Gasto {
  id: number;
  concepto: string;
  importe: number;
  fecha: string;
}

function GastosAdminPage() {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/gastos')
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

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h1>Gestión de Gastos</h1>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Concepto</th>
            <th>Importe</th>
            <th>Fecha</th>
          </tr>
        </thead>
        <tbody>
          {gastos.map(gasto => (
            <tr key={gasto.id}>
              <td>{gasto.id}</td>
              <td>{gasto.concepto}</td>
              <td>{gasto.importe}</td>
              <td>{new Date(gasto.fecha).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default withAuthProtection(GastosAdminPage);
