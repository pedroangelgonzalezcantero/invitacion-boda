import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/track  →  registra una visita
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const path = (body.path as string) || '/'
    await prisma.pageView.create({ data: { path } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false })
  }
}

// GET /api/track  →  devuelve el total de visitas (solo admin)
export async function GET(request: NextRequest) {
  const token =
    request.headers.get('x-admin-token') ||
    request.nextUrl.searchParams.get('token')
  if (token !== process.env.ADMIN_SECRET_TOKEN) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  try {
    const total = await prisma.pageView.count()
    const today = await prisma.pageView.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    })
    return NextResponse.json({ total, today })
  } catch {
    return NextResponse.json({ total: 0, today: 0 })
  }
}

