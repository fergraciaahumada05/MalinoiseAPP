import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

// Endpoint para obtener la lista de ventas
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Método no permitido' });
  }
  try {
    const ventas = await prisma.venta.findMany();
    return res.status(200).json(ventas);
  } catch (error) {
    console.error('Error al obtener las ventas:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
