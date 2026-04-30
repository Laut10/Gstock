import { Router } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler.js';
import { productService } from './product.service.js';
import { createProductSchema, updateProductSchema } from './product.dto.js';
import { HttpError } from '../../middleware/errorHandler.js';

const router = Router();

const parseId = (raw) => {
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) throw new HttpError(400, 'ID inválido');
  return id;
};

router.get('/', asyncHandler(async (req, res) => {
  const products = await productService.list({ q: req.query.q });
  // Agregamos un flag de stock bajo para que el frontend no recalcule.
  const withFlag = products.map((p) => ({
    ...p,
    isLowStock: p.stock ? p.stock.quantity < p.stock.minQuantity : false,
  }));
  res.json(withFlag);
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  const product = await productService.getById(id);
  res.json({
    ...product,
    isLowStock: product.stock ? product.stock.quantity < product.stock.minQuantity : false,
  });
}));

router.post('/', asyncHandler(async (req, res) => {
  const data = createProductSchema.parse(req.body);
  const product = await productService.create(data);
  res.status(201).json(product);
}));

router.patch('/:id', asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  const data = updateProductSchema.parse(req.body);
  const product = await productService.update(id, data);
  res.json(product);
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  await productService.remove(id);
  res.status(204).send();
}));

export default router;
