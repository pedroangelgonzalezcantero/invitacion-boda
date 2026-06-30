/**
 * lib/prisma.ts
 * ─────────────────────────────────────────────────────────────
 * Singleton de PrismaClient para Next.js (Prisma 5 + Vercel serverless).
 *
 * IMPORTANTE para Vercel: cada invocación de una función serverless puede
 * crear una nueva instancia. connection_limit=1 evita que se agoten las
 * conexiones disponibles en MySQL Hostinger.
 * ─────────────────────────────────────────────────────────────
 */

import { PrismaClient } from '@prisma/client'

// Añade connection_limit=1 si la URL no lo tiene ya (necesario en serverless)
function buildDatabaseUrl(): string | undefined {
  const url = process.env.DATABASE_URL
  if (!url) return undefined
  if (url.includes('connection_limit')) return url
  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}connection_limit=1&pool_timeout=10`
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: buildDatabaseUrl(),
    log:
      process.env.NODE_ENV === 'development'
        ? ['error', 'warn']
        : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
