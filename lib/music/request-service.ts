import { Prisma, MusicDuplicateType, MusicQueueStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { createCommitCopy, createPreviewCopy } from '@/lib/music/serializers'
import { MusicTrackInput, MusicRequestPreviewResult } from '@/lib/music/types'

const MAX_TEXT = 255

function cleanText(value: string, maxLength = MAX_TEXT) {
  return value.trim().slice(0, maxLength)
}

export function validateMusicTrackInput(payload: unknown): MusicTrackInput {
  if (!payload || typeof payload !== 'object') {
    throw new Error('INVALID_PAYLOAD')
  }

  const record = payload as Record<string, unknown>
  const spotifyTrackId = cleanText(String(record.spotifyTrackId || ''), 100)
  const songName = cleanText(String(record.songName || ''))
  const artistName = cleanText(String(record.artistName || ''))
  const albumName = record.albumName ? cleanText(String(record.albumName)) : null
  const albumImageUrl = record.albumImageUrl ? String(record.albumImageUrl).trim().slice(0, 2000) : null
  const spotifyUrl = record.spotifyUrl ? String(record.spotifyUrl).trim().slice(0, 2000) : null

  if (!spotifyTrackId || !songName || !artistName) {
    throw new Error('MISSING_TRACK_FIELDS')
  }

  return {
    spotifyTrackId,
    songName,
    artistName,
    albumName,
    albumImageUrl,
    spotifyUrl,
  }
}

export async function previewMusicRequest(track: MusicTrackInput) {
  const resultType = await getMusicRequestState(track.spotifyTrackId)
  const copy = createPreviewCopy(resultType)

  return {
    ok: true as const,
    mode: 'preview' as const,
    resultType,
    ...copy,
  }
}

async function getMusicRequestState(spotifyTrackId: string): Promise<MusicRequestPreviewResult> {
  const pending = await prisma.musicQueueItem.findUnique({
    where: {
      pendingTrackKey: spotifyTrackId,
    },
    select: { id: true },
  })

  if (pending) return 'ALREADY_PENDING'

  const played = await prisma.musicQueueItem.findFirst({
    where: {
      spotifyTrackId,
      status: MusicQueueStatus.PLAYED,
    },
    select: { id: true },
  })

  return played ? 'ALREADY_PLAYED' : 'NEW'
}

export async function commitMusicRequest(params: {
  track: MusicTrackInput
  sourceHash: string | null
  userAgent: string | null
}) {
  try {
    return await createMusicRequest(params)
  } catch (error) {
    if (isPendingTrackConflict(error)) {
      return attachToExistingPending(params)
    }

    if (error instanceof Error && error.message === 'RETRY_CREATE_REQUEST') {
      return createMusicRequest(params)
    }

    throw error
  }
}

async function createMusicRequest(params: {
  track: MusicTrackInput
  sourceHash: string | null
  userAgent: string | null
}) {
  const now = new Date()
  const { track, sourceHash, userAgent } = params

  return prisma.$transaction(async (tx) => {
    const pending = await tx.musicQueueItem.findUnique({
      where: {
        pendingTrackKey: track.spotifyTrackId,
      },
    })

    if (pending) {
      return attachPendingInTransaction({ tx, pendingId: pending.id, track, sourceHash, userAgent, now })
    }

    const playedBefore = await tx.musicQueueItem.findFirst({
      where: {
        spotifyTrackId: track.spotifyTrackId,
        status: MusicQueueStatus.PLAYED,
      },
      select: { id: true },
    })

    const duplicateType: MusicDuplicateType = playedBefore
      ? MusicDuplicateType.ALREADY_PLAYED
      : MusicDuplicateType.NEW

    const queueItem = await tx.musicQueueItem.create({
      data: {
        spotifyTrackId: track.spotifyTrackId,
        songName: track.songName,
        artistName: track.artistName,
        albumName: track.albumName,
        albumImageUrl: track.albumImageUrl,
        spotifyUrl: track.spotifyUrl,
        status: MusicQueueStatus.PENDING,
        requestCount: 1,
        firstRequestedAt: now,
        lastRequestedAt: now,
        wasPlayedBefore: Boolean(playedBefore),
        pendingTrackKey: track.spotifyTrackId,
      },
    })

    await tx.musicRequest.create({
      data: {
        queueItemId: queueItem.id,
        spotifyTrackId: track.spotifyTrackId,
        requestSourceHash: sourceHash,
        userAgent,
        duplicateType,
      },
    })

    const copy = createCommitCopy(duplicateType)

    return {
      ok: true as const,
      mode: 'commit' as const,
      resultType: duplicateType,
      queueItemId: queueItem.id,
      requestCount: 1,
      ...copy,
    }
  })
}

async function attachToExistingPending(params: {
  track: MusicTrackInput
  sourceHash: string | null
  userAgent: string | null
}) {
  const now = new Date()
  const { track, sourceHash, userAgent } = params

  return prisma.$transaction(async (tx) => {
    const pending = await tx.musicQueueItem.findUnique({
      where: {
        pendingTrackKey: track.spotifyTrackId,
      },
      select: {
        id: true,
      },
    })

    if (!pending) {
      throw new Error('RETRY_CREATE_REQUEST')
    }

    return attachPendingInTransaction({ tx, pendingId: pending.id, track, sourceHash, userAgent, now })
  })
}

async function attachPendingInTransaction(params: {
  tx: Prisma.TransactionClient
  pendingId: string
  track: MusicTrackInput
  sourceHash: string | null
  userAgent: string | null
  now: Date
}) {
  const { tx, pendingId, track, sourceHash, userAgent, now } = params

  const queueItem = await tx.musicQueueItem.update({
    where: {
      id: pendingId,
    },
    data: {
      requestCount: {
        increment: 1,
      },
      lastRequestedAt: now,
    },
  })

  await tx.musicRequest.create({
    data: {
      queueItemId: queueItem.id,
      spotifyTrackId: track.spotifyTrackId,
      requestSourceHash: sourceHash,
      userAgent,
      duplicateType: MusicDuplicateType.ALREADY_PENDING,
    },
  })

  const copy = createCommitCopy('ALREADY_PENDING')

  return {
    ok: true as const,
    mode: 'commit' as const,
    resultType: 'ALREADY_PENDING' as const,
    queueItemId: queueItem.id,
    requestCount: queueItem.requestCount,
    ...copy,
  }
}

function isPendingTrackConflict(error: unknown) {
  const target = error instanceof Prisma.PrismaClientKnownRequestError ? error.meta?.target : null
  const normalizedTarget = Array.isArray(target)
    ? target.join(',')
    : typeof target === 'string'
      ? target
      : ''

  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002' &&
    normalizedTarget.includes('pending_track_key')
  )
}



