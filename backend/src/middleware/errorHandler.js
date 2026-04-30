import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

// Middleware central de manejo de errores.
// Mantiene los controllers limpios: ellos lanzan, este middleware traduce.
export function errorHandler(err, req, res, next) {
  // Errores de validación (Zod)
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'ValidationError',
      details: err.errors.map((e) => ({ path: e.path.join('.'), message: e.message })),
    });
  }

  // Errores conocidos de Prisma
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'Conflict', message: 'Recurso duplicado (campo único).' });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'NotFound', message: 'El recurso no existe.' });
    }
  }

  // Errores de negocio que lanzamos a mano
  if (err.status && err.message) {
    return res.status(err.status).json({ error: err.name || 'Error', message: err.message });
  }

  console.error('[Unhandled error]', err);
  return res.status(500).json({ error: 'InternalServerError', message: 'Algo salió mal.' });
}

// Helper para crear errores de negocio con status HTTP.
export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }
}
