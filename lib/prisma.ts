/**
 * lib/prisma.ts
 * ─────────────────────────────────────────────────────────────
 * Singleton de PrismaClient para Next.js (Prisma 5 + Vercel serverless).
 *
 * En Prisma 5, la URL se lee de DATABASE_URL automáticamente
 * (definida en prisma/schema.prisma como url = env("DATABASE_URL")).
 * Solo necesitamos el singleton pattern y connection_limit en la URL.
 * ─────────────────────────────────────────────────────────────
 */

import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
