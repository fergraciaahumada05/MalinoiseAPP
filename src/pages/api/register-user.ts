import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

// Endpoint para guardar usuario en la base de datos tras verificación
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Método no permitido' });
  }
  const { email, nombre, telefono } = req.body;
  if (!email || !nombre || !telefono) {
    return res.status(400).json({ error: 'Faltan datos requeridos' });
  }
  try {
    // Evitar duplicados
    const existe = await prisma.cliente.findUnique({ where: { email } });
    if (existe) {
      return res.status(200).json({ message: 'Usuario ya registrado' });
    }
    const nuevo = await prisma.cliente.create({
      data: {
        email,
        nombre,
        telefono,
        fecha_registro: new Date(),
      },
    });
    return res.status(201).json(nuevo);
  } catch (error) {
    console.error('Error al guardar usuario:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
