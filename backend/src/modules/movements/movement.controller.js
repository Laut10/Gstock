import { Router } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler.js';
import { movementService } from './movement.service.js';
import { createMovementSchema } from './movement.dto.js';

const router = Router();

router.get('/', asyncHandler(async (req, res) => {
  res.json(await movementService.list({
    productId: req.query.productId,
    type: req.query.type,
  }));
}));

router.post('/', asyncHandler(async (req, res) => {
  const data = createMovementSchema.parse(req.body);
  const movement = await movementService.create(data);
  res.status(201).json(movement);
}));

export default router;
