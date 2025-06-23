import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

// Endpoint para obtener la lista de gastos (admin)
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Método no permitido' });
  }
  try {
    const gastos = await prisma.gasto.findMany();
    return res.status(200).json(gastos);
  } catch (error) {
    console.error('Error al obtener los gastos:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
