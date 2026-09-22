import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getDjUnauthorizedResponse, isDjAuthorized } from '@/lib/music/dj-auth'

export async function POST(request: NextRequest) {
  if (!isDjAuthorized(request)) {
    return getDjUnauthorizedResponse()
  }

  try {
    const body = await request.json()
    const queueItemId = String(body?.queueItemId || '').trim()

    if (!queueItemId) {
      return NextResponse.json({ error: 'Petición no válida' }, { status: 400 })
    }

    const item = await prisma.musicQueueItem.update({
      where: {
        id: queueItemId,
      },
      data: {
        status: 'PLAYED',
        playedAt: new Date(),
        pendingTrackKey: null,
      },
    })

    return NextResponse.json({
      ok: true,
      playedAt: item.playedAt?.toISOString() || null,
    })
  } catch {
    return NextResponse.json(
      { error: 'No hemos podido marcar la canción como reproducida.' },
      { status: 500 }
    )
  }
}

