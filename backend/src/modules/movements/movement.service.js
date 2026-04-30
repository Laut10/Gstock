import { prisma } from '../../prisma.js';
import { HttpError } from '../../middleware/errorHandler.js';

/**
 * Servicio de Movements.
 *
 * Reglas de negocio del lineamiento:
 * - Registrar entrada (IN)  -> crear Movement + sumar al stock.
 * - Registrar salida (OUT)  -> crear Movement + restar del stock, validando no-negativo.
 *
 * Todo se hace dentro de una transacción Prisma para garantizar consistencia.
 */
export const movementService = {
  async list({ productId, type } = {}) {
    return prisma.movement.findMany({
      where: {
        productId: productId ? Number(productId) : undefined,
        type:      type || undefined,
      },
      include: { product: true },
      orderBy: { date: 'desc' },
    });
  },

  async create({ productId, type, quantity }) {
    return prisma.$transaction(async (tx) => {
      const stock = await tx.stock.findUnique({ where: { productId } });
      if (!stock) throw new HttpError(404, `No existe stock para el producto ${productId}`);

      let newQty = stock.quantity;
      if (type === 'IN')  newQty += quantity;
      if (type === 'OUT') newQty -= quantity;

      if (newQty < 0) {
        throw new HttpError(
          400,
          `Stock insuficiente. Disponible: ${stock.quantity}, intentaste retirar: ${quantity}.`
        );
      }

      await tx.stock.update({
        where: { productId },
        data:  { quantity: newQty },
      });

      return tx.movement.create({
        data: { productId, type, quantity },
        include: { product: true },
      });
    });
  },
};
