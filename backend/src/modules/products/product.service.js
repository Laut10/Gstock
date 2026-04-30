import { prisma } from '../../prisma.js';
import { HttpError } from '../../middleware/errorHandler.js';

/**
 * Servicio de Products.
 * Encapsula la lógica de negocio para que los controllers queden finos.
 */
export const productService = {
  async list({ q } = {}) {
    return prisma.product.findMany({
      where: q
        ? {
            OR: [
              { name:    { contains: q } },
              { brand:   { contains: q } },
              { barcode: { contains: q } },
            ],
          }
        : undefined,
      include: { stock: true },
      orderBy: { id: 'desc' },
    });
  },

  async getById(id) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { stock: true },
    });
    if (!product) throw new HttpError(404, `Producto ${id} no encontrado`);
    return product;
  },

  /**
   * Crea producto + stock inicial en 0 dentro de una transacción.
   * Esto cumple la regla del lineamiento: "Crea el producto y su stock inicial en 0".
   */
  async create(input) {
    const { minQuantity, ...productData } = input;
    return prisma.product.create({
      data: {
        ...productData,
        stock: {
          create: {
            quantity: 0,
            minQuantity: minQuantity ?? 5,
          },
        },
      },
      include: { stock: true },
    });
  },

  async update(id, input) {
    return prisma.product.update({
      where: { id },
      data: input,
      include: { stock: true },
    });
  },

  async remove(id) {
    // onDelete: Cascade en Prisma se ocupa de stock y movements.
    await prisma.product.delete({ where: { id } });
  },
};
