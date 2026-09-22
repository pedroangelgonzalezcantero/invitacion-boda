import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getDjUnauthorizedResponse, isDjAuthorized } from '@/lib/music/dj-auth'
import { serializeQueueItem } from '@/lib/music/serializers'

export async function GET(request: NextRequest) {
  if (!isDjAuthorized(request)) {
    return getDjUnauthorizedResponse()
  }

  const items = await prisma.musicQueueItem.findMany({
    where: {
      status: 'PENDING',
    },
    orderBy: [
      { lastRequestedAt: 'desc' },
      { createdAt: 'desc' },
    ],
  })

  return NextResponse.json({
    items: items.map(serializeQueueItem),
  })
}

