export type MusicRequestPreviewResult = 'NEW' | 'ALREADY_PENDING' | 'ALREADY_PLAYED'

export interface SpotifyTrackResult {
  spotifyTrackId: string
  songName: string
  artistName: string
  albumName: string | null
  albumImageUrl: string | null
  spotifyUrl: string | null
}

export interface MusicTrackInput {
  spotifyTrackId: string
  songName: string
  artistName: string
  albumName?: string | null
  albumImageUrl?: string | null
  spotifyUrl?: string | null
}

export interface MusicPreviewResponse {
  ok: true
  mode: 'preview'
  resultType: MusicRequestPreviewResult
  title: string
  message: string
}

export interface MusicCommitResponse {
  ok: true
  mode: 'commit'
  resultType: MusicRequestPreviewResult
  title: string
  message: string
  queueItemId: string
  requestCount: number
}

export interface DjQueueItemDto {
  id: string
  spotifyTrackId: string
  songName: string
  artistName: string
  albumName: string | null
  albumImageUrl: string | null
  spotifyUrl: string | null
  status: 'PENDING' | 'PLAYED'
  requestCount: number
  firstRequestedAt: string
  lastRequestedAt: string
  playedAt: string | null
  wasPlayedBefore: boolean
  isRepeatedInQueue: boolean
}

export interface DjHistoryItemDto extends DjQueueItemDto {
  requestedAgainAfterPlayedCount: number
}

export interface DjStatsDto {
  totalRequests: number
  totalPlayedSongs: number
  repeatedSongs: number
  topSong: {
    songName: string
    artistName: string
    requestCount: number
  } | null
}
