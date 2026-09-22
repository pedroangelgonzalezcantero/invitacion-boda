import { createHash } from 'crypto'
import { prisma } from '@/lib/prisma'

const WINDOW_MINUTES = 10
const MAX_REQUESTS = 5

export function getRequestSourceHash(ip: string | null, userAgent: string | null): string | null {
  if (!ip && !userAgent) return null

  const base = `${ip || 'unknown'}::${userAgent || 'unknown'}`
  return createHash('sha256').update(base).digest('hex')
}

export function getClientIp(requestHeaders: Headers): string | null {
  const forwarded = requestHeaders.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0]?.trim() || null
  }

  return requestHeaders.get('x-real-ip') || null
}

export async function checkMusicRateLimit(sourceHash: string | null) {
  if (!sourceHash) {
    return {
      allowed: true,
      limit: MAX_REQUESTS,
      remaining: MAX_REQUESTS,
      retryAfterSeconds: 0,
    }
  }

  const windowStart = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000)

  const count = await prisma.musicRequest.count({
    where: {
      requestSourceHash: sourceHash,
      createdAt: {
        gte: windowStart,
      },
    },
  })

  const allowed = count < MAX_REQUESTS
  const remaining = Math.max(MAX_REQUESTS - count, 0)

  return {
    allowed,
    limit: MAX_REQUESTS,
    remaining,
    retryAfterSeconds: allowed ? 0 : WINDOW_MINUTES * 60,
  }
}
