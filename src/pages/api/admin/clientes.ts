import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

// Endpoint API de clientes para el área admin (migrado desde pages/api/clientes.ts)

// Endpoint para obtener la lista de clientes (admin)
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Método no permitido' });
  }
  try {
    const clientes = await prisma.cliente.findMany();
    return res.status(200).json(clientes);
  } catch (error) {
    console.error('Error al obtener los clientes:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
