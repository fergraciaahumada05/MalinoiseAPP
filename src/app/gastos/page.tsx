"use client";
import { useState, useEffect } from "react";
import { db } from "@/firebase/config";
import { collection, addDoc, getDocs, Timestamp, query, orderBy } from "firebase/firestore";
import { saveAs } from "file-saver";
import IAChatFloating from "@/components/common/IAChatFloating";
import NavbarClient from "@/components/common/NavbarClient";

interface Gasto {
  id?: string;
  descripcion: string;
  categoria: string;
  monto: number;
  fecha: import("firebase/firestore").Timestamp | string;
}

export default function Gastos() {
  const [descripcion, setDescripcion] = useState("");
  const [categoria, setCategoria] = useState("");
  const [monto, setMonto] = useState(0);
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchGastos = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, "gastos"), orderBy("fecha", "desc"));
        const querySnapshot = await getDocs(q);
        const data: Gasto[] = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Gasto));
        setGastos(data);
      } catch {
        setError("Error al cargar gastos");
      } finally {
        setLoading(false);
      }
    };
    fetchGastos();
  }, []);

  const handleAddGasto = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await addDoc(collection(db, "gastos"), {
        descripcion,
        categoria,
        monto,
        fecha: Timestamp.now()
      });
      setSuccess("Gasto registrado correctamente");
      setDescripcion("");
      setCategoria("");
      setMonto(0);
    } catch {
      setError("Error al registrar gasto");
    } finally {
      setLoading(false);
    }
  };

  // Función para exportar gastos a CSV
  const exportarCSV = () => {
    const encabezado = "Descripción,Categoría,Monto,Fecha\n";
    const filas = gastos.map(g => [
      g.descripcion,
      g.categoria,
      g.monto,
      typeof g.fecha === 'string' ? g.fecha : (g.fecha ? (g.fecha as Timestamp).toDate().toLocaleString() : '')
    ].join(",")).join("\n");
    const csv = encabezado + filas;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `gastos_${new Date().toISOString().slice(0,10)}.csv`);
  };

  return (
    <>
      <NavbarClient />
      <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded shadow">
        <h2 className="text-2xl font-bold mb-4">Registrar Nuevo Gasto</h2>
        <form onSubmit={handleAddGasto} className="mb-6">
          <input type="text" placeholder="Descripción" value={descripcion} onChange={e => setDescripcion(e.target.value)} className="w-full mb-2 p-2 border rounded" required />
          <input type="text" placeholder="Categoría" value={categoria} onChange={e => setCategoria(e.target.value)} className="w-full mb-2 p-2 border rounded" required />
          <input type="number" placeholder="Monto (€)" value={monto} onChange={e => setMonto(Number(e.target.value))} className="w-full mb-2 p-2 border rounded" min={0} required />
          <button type="submit" className="w-full bg-teal-600 text-white py-2 rounded" disabled={loading}>{loading ? "Guardando..." : "Registrar Gasto"}</button>
        </form>
        {error && <div className="mb-2 text-red-600">{error}</div>}
        {success && <div className="mb-2 text-green-600">{success}</div>}
        <button onClick={exportarCSV} className="mb-4 bg-teal-600 text-white px-4 py-2 rounded shadow hover:bg-teal-700">Descargar CSV</button>
        <h3 className="text-xl font-semibold mb-2">Historial de Gastos</h3>
        <div className="overflow-x-auto">
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
                  <td className="py-2 px-4">{g.fecha && (typeof g.fecha === 'string' ? g.fecha : g.fecha.toDate().toLocaleString())}</td>
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
