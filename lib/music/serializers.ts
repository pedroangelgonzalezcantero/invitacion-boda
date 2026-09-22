import { MusicQueueItem } from '@prisma/client'
import { DjHistoryItemDto, DjQueueItemDto, DjStatsDto } from '@/lib/music/types'

export function serializeQueueItem(item: MusicQueueItem): DjQueueItemDto {
  return {
    id: item.id,
    spotifyTrackId: item.spotifyTrackId,
    songName: item.songName,
    artistName: item.artistName,
    albumName: item.albumName,
    albumImageUrl: item.albumImageUrl,
    spotifyUrl: item.spotifyUrl,
    status: item.status,
    requestCount: item.requestCount,
    firstRequestedAt: item.firstRequestedAt.toISOString(),
    lastRequestedAt: item.lastRequestedAt.toISOString(),
    playedAt: item.playedAt ? item.playedAt.toISOString() : null,
    wasPlayedBefore: item.wasPlayedBefore,
    isRepeatedInQueue: item.requestCount > 1,
  }
}

export function serializeHistoryItem(
  item: MusicQueueItem,
  requestedAgainAfterPlayedCount: number
): DjHistoryItemDto {
  return {
    ...serializeQueueItem(item),
    requestedAgainAfterPlayedCount,
  }
}

export function createPreviewCopy(resultType: 'NEW' | 'ALREADY_PENDING' | 'ALREADY_PLAYED') {
  if (resultType === 'ALREADY_PENDING') {
    return {
      title: '🎶 ¡Esta canción ya está en la lista!',
      message: 'Otra persona ya la ha pedido. Si quieres, puedes volver a pedirla y se lo haremos saber al DJ.',
    }
  }

  if (resultType === 'ALREADY_PLAYED') {
    return {
      title: '🎶 ¡Esta canción ya ha sonado!',
      message: 'Parece que alguien se te ha adelantado 😎 Si quieres volver a pedirla, puedes hacerlo y se lo haremos saber al DJ.',
    }
  }

  return {
    title: '🎵 Ya casi está',
    message: 'Tu canción está lista para enviarse al DJ. Confirma y quedará en su cola.',
  }
}

export function createCommitCopy(resultType: 'NEW' | 'ALREADY_PENDING' | 'ALREADY_PLAYED') {
  if (resultType === 'ALREADY_PENDING') {
    return {
      title: '🎶 ¡Petición añadida!',
      message: 'La canción ya estaba en la lista y acabas de reforzarla. El DJ verá que ha sido solicitada de nuevo.',
    }
  }

  if (resultType === 'ALREADY_PLAYED') {
    return {
      title: '🔁 ¡La volvéis a pedir!',
      message: 'La canción ya había sonado, pero tu petición ha quedado registrada para que el DJ sepa que queréis repetirla.',
    }
  }

  return {
    title: '🎉 ¡Petición enviada!',
    message: 'El DJ ya la tiene.',
  }
}

export function serializeStats(stats: DjStatsDto) {
  return stats
}

