import express from 'express';
import cors from 'cors';

import productsRouter  from './modules/products/product.controller.js';
import stockRouter     from './modules/stock/stock.controller.js';
import movementsRouter from './modules/movements/movement.controller.js';
import { errorHandler } from './middleware/errorHandler.js';

const app  = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(cors());
app.use(express.json());

// Healthcheck
app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'pharmacy-stock-api' }));

// Módulos
app.use('/api/products',  productsRouter);
app.use('/api/stock',     stockRouter);
app.use('/api/movements', movementsRouter);

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'NotFound', message: `Ruta no encontrada: ${req.method} ${req.url}` });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 API lista en http://localhost:${PORT}`);
});
