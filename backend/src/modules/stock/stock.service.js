import { prisma } from '../../prisma.js';
import { HttpError } from '../../middleware/errorHandler.js';

/**
 * Servicio de Stock.
 * Solo expone consultas (modificar el stock se hace siempre via Movements,
 * para que cada cambio quede auditado). Eso es lo que pide el lineamiento.
 */
export const stockService = {
  async list() {
    const stocks = await prisma.stock.findMany({
      include: { product: true },
      orderBy: { id: 'desc' },
    });
    return stocks.map((s) => ({
      ...s,
      isLowStock: s.quantity < s.minQuantity,
    }));
  },

  async lowStock() {
    const stocks = await prisma.stock.findMany({ include: { product: true } });
    return stocks
      .filter((s) => s.quantity < s.minQuantity)
      .map((s) => ({ ...s, isLowStock: true }));
  },

  async setMinQuantity(productId, minQuantity) {
    if (minQuantity < 0) throw new HttpError(400, 'minQuantity no puede ser negativo');
    return prisma.stock.update({
      where: { productId },
      data: { minQuantity },
      include: { product: true },
    });
  },
};
