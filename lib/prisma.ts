/**
 * lib/prisma.ts
 * ─────────────────────────────────────────────────────────────
 * Singleton de PrismaClient para Next.js (Prisma 7).
 *
 * Prisma 7 lee DATABASE_URL del entorno automáticamente.
 * La URL se configura en .env.local (dev) y en las variables
 * de entorno de Vercel (producción).
 * ─────────────────────────────────────────────────────────────
 */

import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
