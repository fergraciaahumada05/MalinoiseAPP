import type { NextRequest } from "next/server";

export const runtime = "edge";

// Este endpoint está listo para usarse con Resend (https://resend.com/)
// Solo necesitas tu API key y el email destino
export async function POST(req: NextRequest) {
  const { to, subject, message } = await req.json();
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "Falta la clave de API de Resend" }), { status: 500 });
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from: "alertas@malinoise.app", // Cambia por tu dominio verificado en Resend
      to,
      subject,
      html: `<p>${message}</p>`
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    return new Response(JSON.stringify({ error }), { status: 500 });
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
