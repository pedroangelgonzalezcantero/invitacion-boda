/**
 * app/api/db-test/route.ts
 * Endpoint temporal de diagnóstico — borrar tras resolver el problema
 */
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const info: Record<string, unknown> = {
    databaseUrl: process.env.DATABASE_URL
      ? process.env.DATABASE_URL.replace(/:([^:@]+)@/, ':***@') // oculta contraseña
      : 'NO CONFIGURADA',
    nodeEnv: process.env.NODE_ENV,
  }

  try {
    const guestCount  = await prisma.guest.count()
    const rsvpCount   = await prisma.rsvpResponse.count()
    const uploadCount = await prisma.upload.count()
    return NextResponse.json({
      ok: true,
      ...info,
      counts: { guests: guestCount, rsvps: rsvpCount, uploads: uploadCount },
    })
  } catch (err) {
    return NextResponse.json({
      ok: false,
      ...info,
      error: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack?.split('\n').slice(0, 5) : undefined,
    }, { status: 500 })
  }
}

