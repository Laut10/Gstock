import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const products = [
  { name: 'Ibuprofeno 400mg',  brand: 'Bayer',     category: 'Analgésico',     barcode: '7791234500011', price: 850,  stock: 30, minQuantity: 5  },
  { name: 'Paracetamol 500mg', brand: 'Genérico',  category: 'Analgésico',     barcode: '7791234500028', price: 420,  stock: 12, minQuantity: 10 },
  { name: 'Amoxicilina 500mg', brand: 'Roemmers',  category: 'Antibiótico',    barcode: '7791234500035', price: 2100, stock: 4,  minQuantity: 5  },
  { name: 'Loratadina 10mg',   brand: 'Bagó',      category: 'Antialérgico',   barcode: '7791234500042', price: 980,  stock: 18, minQuantity: 6  },
  { name: 'Omeprazol 20mg',    brand: 'Gador',     category: 'Gastrointestinal', barcode: '7791234500059', price: 1340, stock: 2,  minQuantity: 8  },
];

async function main() {
  console.log('🌱 Seeding database...');

  for (const p of products) {
    const { stock, minQuantity, ...productData } = p;
    await prisma.product.upsert({
      where: { barcode: productData.barcode },
      update: {},
      create: {
        ...productData,
        stock: { create: { quantity: stock, minQuantity } },
      },
    });
  }

  console.log(`✅ Seed completo: ${products.length} productos cargados.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
