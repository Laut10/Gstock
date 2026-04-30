import { z } from 'zod';

export const createMovementSchema = z.object({
  productId: z.number().int().positive(),
  type:      z.enum(['IN', 'OUT']),
  quantity:  z.number().int().positive('quantity debe ser mayor a 0'),
});
