import type { NextRequest } from "next/server";
import { db } from "@/firebase/config";
import { collection, getDocs, Timestamp } from "firebase/firestore";

export const runtime = "edge";

function toDateSafe(fecha: Timestamp | string): Date | null {
  if (typeof fecha === "string") {
    const d = new Date(fecha);
    return isNaN(d.getTime()) ? null : d;
  }
  if (fecha && typeof (fecha as Timestamp).toDate === "function") {
    return (fecha as Timestamp).toDate();
  }
  return null;
}

async function handleDataQuery(query: string) {
  // Ejemplo simple: responder a preguntas clave
  if (query.includes("ventas este mes")) {
    const ventasSnap = await getDocs(collection(db, "ventas"));
    const now = new Date();
    const mes = now.getMonth();
    const anio = now.getFullYear();
    const total = ventasSnap.docs
      .map(doc => doc.data() as { fecha: Timestamp | string; total: number })
      .filter(v => {
        const fecha = toDateSafe(v.fecha);
        return fecha && fecha.getMonth() === mes && fecha.getFullYear() === anio;
      })
      .reduce((sum, v) => sum + (v.total || 0), 0);
    return `Tus ventas totales este mes son: ${total} €.`;
  }
  if (query.includes("productos en inventario")) {
    const productosSnap = await getDocs(collection(db, "productos"));
    const total = productosSnap.docs.length;
    return `Tienes ${total} productos en inventario.`;
  }
  // Puedes agregar más reglas aquí
  return null;
}

export async function POST(req: NextRequest) {
  const { messages } = await req.json();
  const lastMsg = messages[messages.length - 1]?.content?.toLowerCase() || "";

  // Si detecta una consulta de datos, responde con datos reales
  const dataResponse = await handleDataQuery(lastMsg);
  if (dataResponse) {
    return new Response(JSON.stringify({ content: dataResponse }), { status: 200 });
  }

  // Reemplaza 'OPENAI_API_KEY' por tu variable de entorno real
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "Falta la clave de API de OpenAI" }), { status: 500 });
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages,
      temperature: 0.7,
      max_tokens: 512,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    return new Response(JSON.stringify({ error }), { status: 500 });
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || "[Sin respuesta de la IA]";
  return new Response(JSON.stringify({ content }), { status: 200 });
}
