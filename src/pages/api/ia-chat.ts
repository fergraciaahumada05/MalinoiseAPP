import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Método no permitido' });
  }
  const { question } = req.body;
  if (!question) {
    return res.status(400).json({ error: 'Falta la pregunta' });
  }
  try {
    // Llama a la API de OpenAI (requiere tu clave en el entorno)
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'Eres un asistente experto en negocios, finanzas, inventario, proveedores, exportación e importación. Da consejos útiles, prácticos y actualizados para empresarios y emprendedores.' },
          { role: 'user', content: question }
        ],
        max_tokens: 600
      })
    });
    const data = await openaiRes.json();
    const answer = data.choices?.[0]?.message?.content || 'No se pudo obtener respuesta.';
    return res.status(200).json({ answer });
  } catch (error) {
    console.error('Error al consultar la IA:', error);
    return res.status(500).json({ error: 'Error interno al consultar la IA' });
  }
}
