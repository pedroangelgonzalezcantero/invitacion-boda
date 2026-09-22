import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getDjUnauthorizedResponse, isDjAuthorized } from '@/lib/music/dj-auth'
import { serializeHistoryItem } from '@/lib/music/serializers'

export async function GET(request: NextRequest) {
  if (!isDjAuthorized(request)) {
    return getDjUnauthorizedResponse()
  }

  const search = (request.nextUrl.searchParams.get('q') || '').trim().toLowerCase()
  const filter = (request.nextUrl.searchParams.get('filter') || 'all').trim()
  const now = new Date()
  const todayStart = new Date(now)
  todayStart.setHours(0, 0, 0, 0)
  const lastHoursStart = new Date(now.getTime() - 6 * 60 * 60 * 1000)

  const baseItems = await prisma.musicQueueItem.findMany({
    where: {
      status: 'PLAYED',
    },
    orderBy: [
      { playedAt: 'desc' },
      { lastRequestedAt: 'desc' },
    ],
  })

  const repeatedTrackIds = Array.from(new Set(baseItems.map((item) => item.spotifyTrackId)))
  const siblingItems = repeatedTrackIds.length > 0
    ? await prisma.musicQueueItem.findMany({
        where: {
          spotifyTrackId: { in: repeatedTrackIds },
        },
        select: {
          spotifyTrackId: true,
          firstRequestedAt: true,
          requestCount: true,
        },
      })
    : []

  const withCounts = baseItems.map((item) => {
    const requestedAgainAfterPlayedCount = siblingItems
      .filter((candidate) => item.playedAt && candidate.spotifyTrackId === item.spotifyTrackId && candidate.firstRequestedAt > item.playedAt)
      .reduce((sum, candidate) => sum + candidate.requestCount, 0)

    return serializeHistoryItem(item, requestedAgainAfterPlayedCount)
  })

  const filtered = withCounts.filter((item) => {
    const matchesSearch = !search || [item.songName, item.artistName, item.albumName || '']
      .join(' ')
      .toLowerCase()
      .includes(search)

    if (!matchesSearch) return false

    const playedAt = item.playedAt ? new Date(item.playedAt) : null
    if (!playedAt) return false

    if (filter === 'today') return playedAt >= todayStart
    if (filter === 'hours') return playedAt >= lastHoursStart
    if (filter === 'repeated') return item.requestCount > 1 || item.requestedAgainAfterPlayedCount > 0

    return true
  })

  const sorted = filter === 'top'
    ? [...filtered].sort((a, b) => b.requestCount - a.requestCount || Date.parse(b.playedAt || '') - Date.parse(a.playedAt || ''))
    : filtered

  return NextResponse.json({ items: sorted })
}

