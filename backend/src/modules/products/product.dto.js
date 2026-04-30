import { z } from 'zod';

// DTOs de Products — validación de entrada con Zod.
export const createProductSchema = z.object({
  name:     z.string().min(1, 'name es obligatorio'),
  brand:    z.string().min(1, 'brand es obligatorio'),
  category: z.string().min(1, 'category es obligatorio'),
  barcode:  z.string().min(3, 'barcode debe tener al menos 3 caracteres'),
  price:    z.number().positive('price debe ser mayor a 0'),
  // Permite definir el stock mínimo desde la creación; default = 5.
  minQuantity: z.number().int().nonnegative().optional(),
});

export const updateProductSchema = createProductSchema.partial().omit({ minQuantity: true });
