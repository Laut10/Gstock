# 💊 Pharmacy Stock — Sistema de control de stock para farmacia

Aplicación full-stack para gestionar productos, stock y movimientos (entradas/salidas) de una farmacia. Está pensada como proyecto de portfolio: poco código pero con buenas decisiones de arquitectura.

## Stack

| Capa     | Tecnología                                        |
| -------- | ------------------------------------------------- |
| Backend  | Node.js · Express · Prisma ORM · SQLite · Zod     |
| Frontend | React 18 · Vite · React Router · Tailwind CSS     |
| DB       | SQLite (archivo local, sin instalación)           |

## Estructura

```
pharmacy-stock/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Product, Stock, Movement
│   │   └── seed.js                # Datos de ejemplo
│   └── src/
│       ├── server.js              # Punto de entrada Express
│       ├── prisma.js              # Cliente Prisma compartido
│       ├── middleware/            # errorHandler, asyncHandler
│       └── modules/
│           ├── products/          # controller · service · dto
│           ├── stock/
│           └── movements/
└── frontend/
    └── src/
        ├── App.jsx                # Rutas
        ├── api/                   # Cliente HTTP + endpoints
        ├── components/            # Layout y UI reutilizable
        └── pages/                 # ProductsPage, StockPage, MovementsPage
```

## Cómo levantarlo

Necesitás Node.js 18+.

### 1) Instalar dependencias

Desde la raíz del repo:

```bash
npm run install:all
```

(o, si preferís manual: `cd backend && npm install`, después `cd ../frontend && npm install`)

### 2) Crear la base SQLite y poblarla

```bash
cd backend
npx prisma migrate dev --name init
npm run seed
```

Eso genera el archivo `backend/prisma/dev.db` y carga 5 productos de ejemplo.

### 3) Levantar el backend

```bash
cd backend
npm run dev
```

API en `http://localhost:3001`. Probá `GET /api/health`.

### 4) Levantar el frontend

En otra terminal:

```bash
cd frontend
npm run dev
```

App en `http://localhost:5173`. El Vite dev server proxea `/api/*` al backend, así que no hay drama de CORS en desarrollo.

## Reglas de negocio implementadas

Las que pide el lineamiento:

- Crear producto inicializa su stock en 0 (transacción Prisma).
- Registrar **IN** crea un Movement y suma al stock.
- Registrar **OUT** crea un Movement, resta del stock y **valida que no quede negativo**.
- Cada producto trae un flag `isLowStock = quantity < minQuantity` directamente desde la API.
- Toda modificación de stock pasa siempre por `Movements` → queda auditada con fecha.

## Endpoints

```
GET    /api/health
GET    /api/products[?q=texto]
GET    /api/products/:id
POST   /api/products             { name, brand, category, barcode, price, minQuantity? }
PATCH  /api/products/:id
DELETE /api/products/:id

GET    /api/stock
GET    /api/stock/low
PATCH  /api/stock/:productId/min { minQuantity }

GET    /api/movements[?productId=&type=IN|OUT]
POST   /api/movements            { productId, type: "IN"|"OUT", quantity }
```

## Para escalar mañana

La base ya está pensada para sumar:

- Lotes y vencimientos (relación 1:N desde Product)
- Proveedores
- Usuarios y autenticación (JWT)
- Reportes y exportación (Excel/PDF)
- Integración con lectores de códigos de barras
