"use client";
import { useState, useEffect } from "react";
import { db } from "@/firebase/config";
import { collection, addDoc, getDocs, Timestamp, query, orderBy } from "firebase/firestore";
import { saveAs } from "file-saver";

interface Producto {
  id?: string;
  nombre: string;
  sku: string;
  stock: number;
  precio: number;
  fecha: import("firebase/firestore").Timestamp | string;
}

export default function Inventario() {
  const [nombre, setNombre] = useState("");
  const [sku, setSku] = useState("");
  const [stock, setStock] = useState(0);
  const [precio, setPrecio] = useState(0);
  // Sugerencias de reabastecimiento y promociones
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchProductos = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, "productos"), orderBy("fecha", "desc"));
        const querySnapshot = await getDocs(q);
        const data: Producto[] = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Producto));
        setProductos(data);
      } catch {
        setError("Error al cargar productos");
      } finally {
        setLoading(false);
      }
    };
    fetchProductos();
  }, []);

  // Sugerencias de reabastecimiento: productos con stock bajo
  const productosBajoStock = productos.filter(p => p.stock <= 5);
  // Sugerencias de promociones: productos con stock alto y ventas bajas (requiere ventas por producto)
  // Aquí solo sugerimos por stock alto
  const productosAltoStock = productos.filter(p => p.stock >= 50);

  const handleAddProducto = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await addDoc(collection(db, "productos"), {
        nombre,
        sku,
        stock,
        precio,
        fecha: Timestamp.now()
      });
      setSuccess("Producto añadido correctamente");
      setNombre("");
      setSku("");
      setStock(0);
      setPrecio(0);
    } catch {
      setError("Error al añadir producto");
    } finally {
      setLoading(false);
    }
  };

  // Función para exportar inventario a CSV
  const exportarCSV = () => {
    const encabezado = "Nombre,SKU,Stock,Precio,Fecha\n";
    const filas = productos.map(p => [
      p.nombre,
      p.sku,
      p.stock,
      p.precio,
      typeof p.fecha === 'string' ? p.fecha : (p.fecha ? (p.fecha as Timestamp).toDate().toLocaleString() : '')
    ].join(",")).join("\n");
    const csv = encabezado + filas;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `inventario_${new Date().toISOString().slice(0,10)}.csv`);
  };

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Añadir Nuevo Producto</h2>
      <form onSubmit={handleAddProducto} className="mb-6">
        <input type="text" placeholder="Nombre del producto" value={nombre} onChange={e => setNombre(e.target.value)} className="w-full mb-2 p-2 border rounded" required />
        <input type="text" placeholder="SKU" value={sku} onChange={e => setSku(e.target.value)} className="w-full mb-2 p-2 border rounded" required />
        <input type="number" placeholder="Stock" value={stock} onChange={e => setStock(Number(e.target.value))} className="w-full mb-2 p-2 border rounded" min={0} required />
        <input type="number" placeholder="Precio (€)" value={precio} onChange={e => setPrecio(Number(e.target.value))} className="w-full mb-2 p-2 border rounded" min={0} required />
        <button type="submit" className="w-full bg-teal-600 text-white py-2 rounded" disabled={loading}>{loading ? "Guardando..." : "Añadir Producto"}</button>
      </form>
      {error && <div className="mb-2 text-red-600">{error}</div>}
      {success && <div className="mb-2 text-green-600">{success}</div>}
      <button onClick={exportarCSV} className="mb-4 bg-teal-600 text-white px-4 py-2 rounded shadow hover:bg-teal-700">Descargar CSV</button>
      <h3 className="text-xl font-semibold mb-2">Sugerencias</h3>
      <ul className="mb-4 list-disc pl-5">
        {productosBajoStock.length > 0 && <li>Reabastece pronto: {productosBajoStock.map(p => p.nombre).join(", ")}</li>}
        {productosAltoStock.length > 0 && <li>Considera promociones para: {productosAltoStock.map(p => p.nombre).join(", ")}</li>}
        {productosBajoStock.length === 0 && productosAltoStock.length === 0 && <li>No hay sugerencias especiales en este momento.</li>}
      </ul>
      <h3 className="text-xl font-semibold mb-2">Inventario</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left table-auto">
          <thead>
            <tr className="bg-slate-50 text-slate-600 uppercase text-sm">
              <th className="py-2 px-4">Nombre</th>
              <th className="py-2 px-4">SKU</th>
              <th className="py-2 px-4">Stock</th>
              <th className="py-2 px-4">Precio (€)</th>
              <th className="py-2 px-4">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {productos.map(p => (
              <tr key={p.id} className="border-b">
                <td className="py-2 px-4">{p.nombre}</td>
                <td className="py-2 px-4">{p.sku}</td>
                <td className="py-2 px-4">{p.stock}</td>
                <td className="py-2 px-4">{p.precio}</td>
                <td className="py-2 px-4">{p.fecha && (typeof p.fecha === 'string' ? p.fecha : (p.fecha && typeof p.fecha.toDate === 'function' ? p.fecha.toDate().toLocaleString() : ''))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
