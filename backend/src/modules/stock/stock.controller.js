import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../middleware/asyncHandler.js';
import { stockService } from './stock.service.js';
import { HttpError } from '../../middleware/errorHandler.js';

const router = Router();

const parseId = (raw) => {
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) throw new HttpError(400, 'ID inválido');
  return id;
};

router.get('/', asyncHandler(async (_req, res) => {
  res.json(await stockService.list());
}));

router.get('/low', asyncHandler(async (_req, res) => {
  res.json(await stockService.lowStock());
}));

const minQtySchema = z.object({ minQuantity: z.number().int().nonnegative() });

router.patch('/:productId/min', asyncHandler(async (req, res) => {
  const productId = parseId(req.params.productId);
  const { minQuantity } = minQtySchema.parse(req.body);
  res.json(await stockService.setMinQuantity(productId, minQuantity));
}));

export default router;
