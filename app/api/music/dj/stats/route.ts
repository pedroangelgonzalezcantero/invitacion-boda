import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getDjUnauthorizedResponse, isDjAuthorized } from '@/lib/music/dj-auth'

export async function GET(request: NextRequest) {
  if (!isDjAuthorized(request)) {
    return getDjUnauthorizedResponse()
  }

  const [requestCount, playedCount, repeatedCount, grouped] = await Promise.all([
    prisma.musicRequest.count(),
    prisma.musicQueueItem.count({ where: { status: 'PLAYED' } }),
    prisma.musicQueueItem.count({ where: { requestCount: { gt: 1 } } }),
    prisma.musicQueueItem.groupBy({
      by: ['spotifyTrackId', 'songName', 'artistName'],
      _sum: { requestCount: true },
      orderBy: {
        _sum: {
          requestCount: 'desc',
        },
      },
      take: 1,
    }),
  ])

  const top = grouped[0]

  return NextResponse.json({
    totalRequests: requestCount,
    totalPlayedSongs: playedCount,
    repeatedSongs: repeatedCount,
    topSong: top
      ? {
          songName: top.songName,
          artistName: top.artistName,
          requestCount: top._sum.requestCount || 0,
        }
      : null,
  })
}

