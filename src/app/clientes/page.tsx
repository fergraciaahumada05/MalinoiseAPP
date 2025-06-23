"use client";
import { useState, useEffect } from "react";
import { db } from "@/firebase/config";
import { collection, addDoc, getDocs, Timestamp, query, orderBy } from "firebase/firestore";
import { saveAs } from "file-saver";

interface Cliente {
  id?: string;
  nombre: string;
  email: string;
  telefono: string;
  fecha: import("firebase/firestore").Timestamp | string;
}

export default function Clientes() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchClientes = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, "clientes"), orderBy("fecha", "desc"));
        const querySnapshot = await getDocs(q);
        const data: Cliente[] = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Cliente));
        setClientes(data);
      } catch {
        setError("Error al cargar clientes");
      } finally {
        setLoading(false);
      }
    };
    fetchClientes();
  }, []);

  const handleAddCliente = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await addDoc(collection(db, "clientes"), {
        nombre,
        email,
        telefono,
        fecha: Timestamp.now()
      });
      setSuccess("Cliente añadido correctamente");
      setNombre("");
      setEmail("");
      setTelefono("");
    } catch {
      setError("Error al añadir cliente");
    } finally {
      setLoading(false);
    }
  };

  // Función para exportar clientes a CSV
  const exportarCSV = () => {
    const encabezado = "Nombre,Email,Teléfono,Fecha\n";
    const filas = clientes.map(c => [
      c.nombre,
      c.email,
      c.telefono,
      typeof c.fecha === 'string' ? c.fecha : (c.fecha ? (c.fecha as Timestamp).toDate().toLocaleString() : '')
    ].join(",")).join("\n");
    const csv = encabezado + filas;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `clientes_${new Date().toISOString().slice(0,10)}.csv`);
  };

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Añadir Nuevo Cliente</h2>
      <form onSubmit={handleAddCliente} className="mb-6">
        <input type="text" placeholder="Nombre" value={nombre} onChange={e => setNombre(e.target.value)} className="w-full mb-2 p-2 border rounded" required />
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full mb-2 p-2 border rounded" required />
        <input type="text" placeholder="Teléfono" value={telefono} onChange={e => setTelefono(e.target.value)} className="w-full mb-2 p-2 border rounded" required />
        <button type="submit" className="w-full bg-teal-600 text-white py-2 rounded" disabled={loading}>{loading ? "Guardando..." : "Añadir Cliente"}</button>
      </form>
      {error && <div className="mb-2 text-red-600">{error}</div>}
      {success && <div className="mb-2 text-green-600">{success}</div>}
      <button onClick={exportarCSV} className="mb-4 bg-teal-600 text-white px-4 py-2 rounded shadow hover:bg-teal-700">Descargar CSV</button>
      <h3 className="text-xl font-semibold mb-2">Lista de Clientes</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left table-auto">
          <thead>
            <tr className="bg-slate-50 text-slate-600 uppercase text-sm">
              <th className="py-2 px-4">Nombre</th>
              <th className="py-2 px-4">Email</th>
              <th className="py-2 px-4">Teléfono</th>
              <th className="py-2 px-4">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map(c => (
              <tr key={c.id} className="border-b">
                <td className="py-2 px-4">{c.nombre}</td>
                <td className="py-2 px-4">{c.email}</td>
                <td className="py-2 px-4">{c.telefono}</td>
                <td className="py-2 px-4">{c.fecha && (typeof c.fecha === 'string' ? c.fecha : c.fecha.toDate().toLocaleString())}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
