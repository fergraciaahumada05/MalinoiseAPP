"use client";
import { useState, useEffect } from "react";
import { db } from "@/firebase/config";
import { collection, addDoc, getDocs, Timestamp, query, orderBy } from "firebase/firestore";
import { saveAs } from "file-saver";
import IAChatFloating from "@/components/common/IAChatFloating";

interface Venta {
  id?: string;
  producto: string;
  cantidad: number;
  cliente: string;
  total: number;
  fecha: import("firebase/firestore").Timestamp | string;
}

export default function Ventas() {
  const [producto, setProducto] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [cliente, setCliente] = useState("");
  const [total, setTotal] = useState(0);
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchVentas = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, "ventas"), orderBy("fecha", "desc"));
        const querySnapshot = await getDocs(q);
        const data: Venta[] = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Venta));
        setVentas(data);
      } catch {
        setError("Error al cargar ventas");
      } finally {
        setLoading(false);
      }
    };
    fetchVentas();
  }, []);

  const handleAddVenta = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await addDoc(collection(db, "ventas"), {
        producto,
        cantidad,
        cliente,
        total,
        fecha: Timestamp.now()
      });
      setSuccess("Venta registrada correctamente");
      setProducto("");
      setCantidad(1);
      setCliente("");
      setTotal(0);
    } catch {
      setError("Error al registrar venta");
    } finally {
      setLoading(false);
    }
  };

  // Función para exportar ventas a CSV
  const exportarCSV = () => {
    const encabezado = "Producto,Cantidad,Cliente,Total,Fecha\n";
    const filas = ventas.map(v => [
      v.producto,
      v.cantidad,
      v.cliente,
      v.total,
      typeof v.fecha === 'string' ? v.fecha : (v.fecha ? (v.fecha as Timestamp).toDate().toLocaleString() : '')
    ].join(",")).join("\n");
    const csv = encabezado + filas;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `ventas_${new Date().toISOString().slice(0,10)}.csv`);
  };

  return (
    <>
      <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded shadow">
        <h2 className="text-2xl font-bold mb-4">Registrar Nueva Venta</h2>
        <form onSubmit={handleAddVenta} className="mb-6">
          <input type="text" placeholder="Producto" value={producto} onChange={e => setProducto(e.target.value)} className="w-full mb-2 p-2 border rounded" required />
          <input type="number" placeholder="Cantidad" value={cantidad} onChange={e => setCantidad(Number(e.target.value))} className="w-full mb-2 p-2 border rounded" min={1} required />
          <input type="text" placeholder="Cliente" value={cliente} onChange={e => setCliente(e.target.value)} className="w-full mb-2 p-2 border rounded" required />
          <input type="number" placeholder="Total (€)" value={total} onChange={e => setTotal(Number(e.target.value))} className="w-full mb-2 p-2 border rounded" min={0} required />
          <button type="submit" className="w-full bg-teal-600 text-white py-2 rounded" disabled={loading}>{loading ? "Guardando..." : "Registrar Venta"}</button>
        </form>
        {error && <div className="mb-2 text-red-600">{error}</div>}
        {success && <div className="mb-2 text-green-600">{success}</div>}
        <button onClick={exportarCSV} className="mb-4 bg-teal-600 text-white px-4 py-2 rounded shadow hover:bg-teal-700">Descargar CSV</button>
        <h3 className="text-xl font-semibold mb-2">Historial de Ventas</h3>
        <div className="overflow-x-auto">
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
                  <td className="py-2 px-4">{v.producto}</td>
                  <td className="py-2 px-4">{v.cantidad}</td>
                  <td className="py-2 px-4">{v.cliente}</td>
                  <td className="py-2 px-4">{v.total}</td>
                  <td className="py-2 px-4">{v.fecha && (typeof v.fecha === 'string' ? v.fecha : (v.fecha && typeof v.fecha.toDate === 'function' ? v.fecha.toDate().toLocaleString() : ''))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <IAChatFloating />
    </>
  );
}
