import { useEffect, useState } from "react";
import { db } from "@/firebase/config";
import { collection, getDocs, query, orderBy, Timestamp } from "firebase/firestore";

interface Alerta {
  tipo: "gasto" | "venta" | "inventario";
  mensaje: string;
  nivel: "info" | "warning" | "danger";
}

export function useAlertas() {
  const [alertas, setAlertas] = useState<Alerta[]>([]);

  useEffect(() => {
    async function detectarAlertas() {
      const nuevas: Alerta[] = [];
      // Ejemplo: detectar gastos inusuales (mayores al doble del promedio)
      const gastosSnap = await getDocs(query(collection(db, "gastos"), orderBy("fecha", "desc")));
      const gastos = gastosSnap.docs.map(doc => doc.data() as { monto: number; fecha: Timestamp | string });
      if (gastos.length > 5) {
        const montos = gastos.map(g => g.monto);
        const promedio = montos.reduce((a, b) => a + b, 0) / montos.length;
        const umbral = promedio * 2;
        const inusuales = gastos.filter(g => g.monto > umbral);
        if (inusuales.length > 0) {
          nuevas.push({
            tipo: "gasto",
            mensaje: `¡Atención! Se detectaron ${inusuales.length} gastos inusuales (mayores a ${umbral.toFixed(2)} €).`,
            nivel: "danger"
          });
        }
      }
      // Ejemplo: detectar caídas de ventas (última venta < 50% del promedio)
      const ventasSnap = await getDocs(query(collection(db, "ventas"), orderBy("fecha", "desc")));
      const ventas = ventasSnap.docs.map(doc => doc.data() as { total: number; fecha: Timestamp | string });
      if (ventas.length > 5) {
        const totales = ventas.map(v => v.total);
        const promedio = totales.reduce((a, b) => a + b, 0) / totales.length;
        const ultima = ventas[0].total;
        if (ultima < promedio * 0.5) {
          nuevas.push({
            tipo: "venta",
            mensaje: `¡Alerta! La última venta (${ultima} €) es menor al 50% del promedio (${promedio.toFixed(2)} €).`,
            nivel: "warning"
          });
        }
      }
      setAlertas(nuevas);
    }
    detectarAlertas();
  }, []);

  return alertas;
}
