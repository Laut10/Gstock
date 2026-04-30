import { PrismaClient } from '@prisma/client';

// Cliente Prisma único compartido por toda la app
export const prisma = new PrismaClient();
