import { SpotifyTrackResult } from '@/lib/music/types'

type SpotifyTokenCache = {
  accessToken: string
  expiresAt: number
}

const globalForSpotify = globalThis as typeof globalThis & {
  __spotifyTokenCache?: SpotifyTokenCache
}

async function getSpotifyAccessToken() {
  const clientId = process.env.SPOTIFY_CLIENT_ID
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error('SPOTIFY_NOT_CONFIGURED')
  }

  const cached = globalForSpotify.__spotifyTokenCache
  if (cached && cached.expiresAt > Date.now() + 30_000) {
    return cached.accessToken
  }

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
    cache: 'no-store',
  })

  if (!response.ok) {
    const details = await response.text().catch(() => '')
    throw new Error(`SPOTIFY_TOKEN_ERROR:${response.status}:${details.slice(0, 300)}`)
  }

  const json = await response.json() as {
    access_token: string
    expires_in: number
  }

  globalForSpotify.__spotifyTokenCache = {
    accessToken: json.access_token,
    expiresAt: Date.now() + json.expires_in * 1000,
  }

  return json.access_token
}

export async function searchSpotifyTracks(query: string, limit = 8): Promise<SpotifyTrackResult[]> {
  const normalizedQuery = query.trim()
  if (normalizedQuery.length < 2) return []

  const token = await getSpotifyAccessToken()
  const response = await fetch(
    `https://api.spotify.com/v1/search?type=track&market=ES&limit=${limit}&q=${encodeURIComponent(normalizedQuery)}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    }
  )

  if (!response.ok) {
    const details = await response.text().catch(() => '')
    throw new Error(`SPOTIFY_SEARCH_ERROR:${response.status}:${details.slice(0, 300)}`)
  }

  const json = await response.json() as {
    tracks?: {
      items?: Array<{
        id: string
        name: string
        external_urls?: { spotify?: string }
        album?: {
          name?: string
          images?: Array<{ url: string }>
        }
        artists?: Array<{ name: string }>
      }>
    }
  }

  return (json.tracks?.items || []).map((track) => ({
    spotifyTrackId: track.id,
    songName: track.name,
    artistName: (track.artists || []).map((artist) => artist.name).join(', '),
    albumName: track.album?.name || null,
    albumImageUrl: track.album?.images?.[0]?.url || null,
    spotifyUrl: track.external_urls?.spotify || null,
  }))
}

