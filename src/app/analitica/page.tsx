"use client";
import { useEffect, useState } from "react";
import { db } from "@/firebase/config";
import { collection, getDocs, query, orderBy, Timestamp } from "firebase/firestore";
import dynamic from "next/dynamic";
import { ComponentType } from "react";
import { useAlertas } from "@/hooks/useAlertas";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/firebase/config";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import IAChatFloating from "@/components/common/IAChatFloating";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false }) as ComponentType<any>; // eslint-disable-line @typescript-eslint/no-explicit-any

// Type guard para Firestore Timestamp
function isTimestamp(obj: unknown): obj is Timestamp {
  return !!obj && typeof obj === "object" && typeof (obj as Timestamp).toDate === "function";
}

interface Venta {
  fecha: Timestamp | string;
  total: number;
}
interface Gasto {
  fecha: Timestamp | string;
  monto: number;
}

export default function Analitica() {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [loading, setLoading] = useState(true);
  const alertas = useAlertas();
  const [user, setUser] = useState<User | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const ventasSnap = await getDocs(query(collection(db, "ventas"), orderBy("fecha", "asc")));
      const gastosSnap = await getDocs(query(collection(db, "gastos"), orderBy("fecha", "asc")));
      setVentas(ventasSnap.docs.map(doc => doc.data() as Venta));
      setGastos(gastosSnap.docs.map(doc => doc.data() as Gasto));
      setLoading(false);
    };
    fetchData();
  }, []);

  // Enviar email si hay alerta crítica y no se ha enviado aún
  useEffect(() => {
    if (!user?.email || emailSent) return;
    const alertaCritica = alertas.find(a => a.nivel === "danger");
    if (alertaCritica) {
      fetch("/api/send-alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: user.email,
          subject: "Alerta crítica en Malinoise",
          message: alertaCritica.mensaje
        })
      }).then(() => setEmailSent(true));
    }
  }, [alertas, user, emailSent]);

  const ventasData = ventas.map(v => ({
    x: isTimestamp(v.fecha) ? v.fecha.toDate() : v.fecha,
    y: v.total || 0
  }));
  const gastosData = gastos.map(g => ({
    x: isTimestamp(g.fecha) ? g.fecha.toDate() : g.fecha,
    y: g.monto || 0
  }));

  // Proyección simple de flujo de caja (promedio mensual)
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const ventasMes = ventas.filter(v => {
    const fecha = isTimestamp(v.fecha) ? v.fecha.toDate() : new Date(v.fecha as string);
    return fecha.getMonth() === currentMonth && fecha.getFullYear() === currentYear;
  });
  const gastosMes = gastos.filter(g => {
    const fecha = isTimestamp(g.fecha) ? g.fecha.toDate() : new Date(g.fecha as string);
    return fecha.getMonth() === currentMonth && fecha.getFullYear() === currentYear;
  });
  const totalVentasMes = ventasMes.reduce((sum, v) => sum + (v.total || 0), 0);
  const totalGastosMes = gastosMes.reduce((sum, g) => sum + (g.monto || 0), 0);
  const flujoCaja = totalVentasMes - totalGastosMes;

  // Recomendaciones simples
  const recomendaciones: string[] = [];
  if (flujoCaja < 0) {
    recomendaciones.push("¡Atención! Tu flujo de caja es negativo este mes. Considera reducir gastos o aumentar ingresos.");
  } else if (flujoCaja < totalGastosMes * 0.2) {
    recomendaciones.push("Tu flujo de caja es bajo respecto a tus gastos. Revisa oportunidades para optimizar costos o impulsar ventas.");
  } else {
    recomendaciones.push("¡Buen trabajo! Tu flujo de caja es saludable este mes.");
  }
  if (ventasMes.length > 0) {
    const promedioVenta = totalVentasMes / ventasMes.length;
    if (promedioVenta < 50) {
      recomendaciones.push("Las ventas promedio por transacción son bajas. Considera promociones o ventas cruzadas.");
    }
  }

  // Proyección avanzada de ventas y gastos para el próximo mes (promedio móvil de 3 meses)
  function getMonthYear(date: Date) {
    return `${date.getFullYear()}-${date.getMonth() + 1}`;
  }
  const ventasPorMes: Record<string, number[]> = {};
  ventas.forEach(v => {
    const fecha = isTimestamp(v.fecha) ? v.fecha.toDate() : new Date(v.fecha as string);
    const key = getMonthYear(fecha);
    if (!ventasPorMes[key]) ventasPorMes[key] = [];
    ventasPorMes[key].push(v.total || 0);
  });
  const gastosPorMes: Record<string, number[]> = {};
  gastos.forEach(g => {
    const fecha = isTimestamp(g.fecha) ? g.fecha.toDate() : new Date(g.fecha as string);
    const key = getMonthYear(fecha);
    if (!gastosPorMes[key]) gastosPorMes[key] = [];
    gastosPorMes[key].push(g.monto || 0);
  });
  const meses = Object.keys(ventasPorMes).sort();
  const ultimos3Meses = meses.slice(-3);
  const promedioVentas = ultimos3Meses.length > 0 ? ultimos3Meses.map(m => ventasPorMes[m].reduce((a, b) => a + b, 0)).reduce((a, b) => a + b, 0) / ultimos3Meses.length : 0;
  const promedioGastos = ultimos3Meses.length > 0 ? ultimos3Meses.map(m => (gastosPorMes[m]?.reduce((a, b) => a + b, 0) || 0)).reduce((a, b) => a + b, 0) / ultimos3Meses.length : 0;
  const proyeccionVentas = promedioVentas;
  const proyeccionGastos = promedioGastos;
  const proyeccionFlujo = proyeccionVentas - proyeccionGastos;

  // Estado para simulador de escenarios
  const [simVentas, setSimVentas] = useState<number>(proyeccionVentas);
  const [simGastos, setSimGastos] = useState<number>(proyeccionGastos);
  const simFlujo = simVentas - simGastos;
  const simRecomendaciones: string[] = [];
  if (simFlujo < 0) {
    simRecomendaciones.push("¡Atención! El flujo de caja simulado es negativo. Considera reducir gastos o aumentar ingresos.");
  } else if (simFlujo < simGastos * 0.2) {
    simRecomendaciones.push("El flujo de caja simulado es bajo respecto a los gastos. Revisa oportunidades para optimizar costos o impulsar ventas.");
  } else {
    simRecomendaciones.push("¡Buen escenario! El flujo de caja simulado es saludable.");
  }
  if (simVentas < 50) {
    simRecomendaciones.push("Las ventas promedio por transacción en el escenario simulado son bajas. Considera promociones o ventas cruzadas.");
  }

  // Exportar dashboard a PDF
  const exportarPDF = async () => {
    const input = document.getElementById("analitica-dashboard");
    if (!input) return;
    const canvas = await html2canvas(input, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    // const pageHeight = pdf.internal.pageSize.getHeight();
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pageWidth;
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`reporte_analitica_${new Date().toISOString().slice(0,10)}.pdf`);
  };

  return (
    <>
      <div id="analitica-dashboard" className="max-w-4xl mx-auto mt-8 p-6 bg-white rounded shadow space-y-8">
        <div className="flex justify-end mb-4">
          <button onClick={exportarPDF} className="bg-fuchsia-600 text-white px-4 py-2 rounded shadow hover:bg-fuchsia-700">Descargar PDF</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-gradient-to-br from-teal-50 to-white rounded shadow flex flex-col items-center">
            <span className="text-slate-500">Flujo de Caja (mes actual)</span>
            <span className={`text-2xl font-bold mt-2 ${flujoCaja < 0 ? "text-red-600" : "text-green-600"}`}>{flujoCaja >= 0 ? `+${flujoCaja.toFixed(2)} €` : `${flujoCaja.toFixed(2)} €`}</span>
          </div>
          <div className="p-4 bg-gradient-to-br from-yellow-50 to-white rounded shadow flex flex-col items-center">
            <span className="text-slate-500">Ventas estimadas (próx. mes)</span>
            <span className="text-2xl font-bold mt-2">{proyeccionVentas.toFixed(2)} €</span>
          </div>
          <div className="p-4 bg-gradient-to-br from-rose-50 to-white rounded shadow flex flex-col items-center">
            <span className="text-slate-500">Gastos estimados (próx. mes)</span>
            <span className="text-2xl font-bold mt-2">{proyeccionGastos.toFixed(2)} €</span>
          </div>
        </div>
        <div className="mb-6 p-4 bg-slate-100 rounded shadow">
          <h3 className="font-semibold mb-2 flex items-center gap-2"><span className="text-teal-600">💡</span>Recomendaciones</h3>
          <ul className="list-disc pl-5 space-y-1">
            {recomendaciones.map((rec, i) => (
              <li key={i} className="text-slate-700">{rec}</li>
            ))}
          </ul>
        </div>
        <div className="mb-6 p-4 bg-slate-100 rounded shadow">
          <h3 className="font-semibold mb-2 flex items-center gap-2"><span className="text-indigo-600">🔮</span>Proyección Próximo Mes</h3>
          <div className="flex flex-col md:flex-row gap-6">
            <div>
              <div className="text-slate-600">Ventas estimadas</div>
              <div className="text-lg font-bold">{proyeccionVentas.toFixed(2)} €</div>
            </div>
            <div>
              <div className="text-slate-600">Gastos estimados</div>
              <div className="text-lg font-bold">{proyeccionGastos.toFixed(2)} €</div>
            </div>
            <div>
              <div className="text-slate-600">Flujo de caja estimado</div>
              <div className={`text-lg font-bold ${proyeccionFlujo < 0 ? "text-red-600" : "text-green-600"}`}>{proyeccionFlujo >= 0 ? `+${proyeccionFlujo.toFixed(2)} €` : `${proyeccionFlujo.toFixed(2)} €`}</div>
            </div>
          </div>
        </div>
        <div className="mb-6 p-4 bg-slate-100 rounded shadow">
          <h3 className="font-semibold mb-2 flex items-center gap-2"><span className="text-fuchsia-600">🧮</span>Simulador de Escenarios (What-if)</h3>
          <div className="flex flex-col md:flex-row gap-6 items-end">
            <div>
              <label className="block text-slate-600 mb-1" htmlFor="sim-ventas">Ventas estimadas (€)</label>
              <input id="sim-ventas" type="number" className="border rounded p-2 w-32" value={simVentas} min={0} onChange={e => setSimVentas(Number(e.target.value))} placeholder="Ventas" title="Ventas estimadas en euros" />
            </div>
            <div>
              <label className="block text-slate-600 mb-1" htmlFor="sim-gastos">Gastos estimados (€)</label>
              <input id="sim-gastos" type="number" className="border rounded p-2 w-32" value={simGastos} min={0} onChange={e => setSimGastos(Number(e.target.value))} placeholder="Gastos" title="Gastos estimados en euros" />
            </div>
            <div>
              <div className="text-slate-600">Flujo de caja simulado</div>
              <div className={`text-lg font-bold ${simFlujo < 0 ? "text-red-600" : "text-green-600"}`}>{simFlujo >= 0 ? `+${simFlujo.toFixed(2)} €` : `${simFlujo.toFixed(2)} €`}</div>
            </div>
          </div>
          <div className="mt-3">
            <h4 className="font-semibold mb-1">Recomendaciones para este escenario</h4>
            <ul className="list-disc pl-5 space-y-1">
              {simRecomendaciones.map((rec, i) => (
                <li key={i} className="text-slate-700">{rec}</li>
              ))}
            </ul>
          </div>
        </div>
        {loading ? (
          <div className="text-center text-slate-400">Cargando datos...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2"><span className="text-teal-600">📈</span>Tendencia de Ventas</h3>
              <Chart
                options={{
                  chart: { id: "ventas" },
                  xaxis: { type: "datetime" },
                  title: { text: "Ventas en el tiempo" }
                }}
                series={[{ name: "Ventas", data: ventasData }]}
                type="line"
                height={300}
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2"><span className="text-rose-600">💸</span>Tendencia de Gastos</h3>
              <Chart
                options={{
                  chart: { id: "gastos" },
                  xaxis: { type: "datetime" },
                  title: { text: "Gastos en el tiempo" }
                }}
                series={[{ name: "Gastos", data: gastosData }]}
                type="line"
                height={300}
              />
            </div>
          </div>
        )}
      </div>
      <IAChatFloating />
    </>
  );
}
