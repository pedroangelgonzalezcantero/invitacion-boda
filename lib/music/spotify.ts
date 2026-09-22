import { SpotifyTrackResult } from '@/lib/music/types'

function getNormalizedEnvValue(value: string | undefined) {
  if (!value) return ''

  const trimmed = value.trim()
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim()
  }

  return trimmed
}

type SpotifyTokenCache = {
  accessToken: string
  expiresAt: number
}

const globalForSpotify = globalThis as typeof globalThis & {
  __spotifyTokenCache?: SpotifyTokenCache
}

async function getSpotifyAccessToken() {
  const clientId = getNormalizedEnvValue(process.env.SPOTIFY_CLIENT_ID)
  const clientSecret = getNormalizedEnvValue(process.env.SPOTIFY_CLIENT_SECRET)

  if (!clientId || !clientSecret) {
    console.error('[Spotify] Missing credentials - SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET not configured')
    throw new Error('SPOTIFY_NOT_CONFIGURED')
  }

  console.log('[Spotify] Using credentials for client:', clientId.slice(0, 5) + '...')

  const cached = globalForSpotify.__spotifyTokenCache
  if (cached && cached.expiresAt > Date.now() + 30_000) {
    console.log('[Spotify] Using cached token')
    return cached.accessToken
  }

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

  try {
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
      console.error(`[Spotify] Auth failed - Status: ${response.status}, Details: ${details.slice(0, 300)}`)
      throw new Error(`SPOTIFY_TOKEN_ERROR:${response.status}:${details.slice(0, 300)}`)
    }

    console.log('[Spotify] Successfully obtained access token')

    const json = await response.json() as {
      access_token: string
      expires_in: number
    }

    globalForSpotify.__spotifyTokenCache = {
      accessToken: json.access_token,
      expiresAt: Date.now() + json.expires_in * 1000,
    }

    return json.access_token
  } catch (error) {
    if (error instanceof Error && error.message.includes('SPOTIFY_TOKEN_ERROR')) {
      throw error
    }
    console.error('[Spotify] Network error during auth:', error)
    throw new Error(`SPOTIFY_TOKEN_ERROR:NETWORK:${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export async function searchSpotifyTracks(query: string, limit = 8): Promise<SpotifyTrackResult[]> {
  const normalizedQuery = query.trim()
  if (normalizedQuery.length < 2) return []

  console.log(`[Spotify] Searching for: "${normalizedQuery}"`)

  let token: string
  try {
    token = await getSpotifyAccessToken()
  } catch (error) {
    console.error('[Spotify] Failed to get access token:', error)
    throw error
  }

  try {
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
      console.error(`[Spotify] Search failed - Status: ${response.status}, Details: ${details.slice(0, 300)}`)
      throw new Error(`SPOTIFY_SEARCH_ERROR:${response.status}:${details.slice(0, 300)}`)
    }

    console.log('[Spotify] Search successful')
  } catch (error) {
    if (error instanceof Error && error.message.includes('SPOTIFY_SEARCH_ERROR')) {
      throw error
    }
    console.error('[Spotify] Network error during search:', error)
    throw new Error(`SPOTIFY_SEARCH_ERROR:NETWORK:${error instanceof Error ? error.message : 'Unknown error'}`)
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

  const results = (json.tracks?.items || []).map((track) => ({
    spotifyTrackId: track.id,
    songName: track.name,
    artistName: (track.artists || []).map((artist) => artist.name).join(', '),
    albumName: track.album?.name || null,
    albumImageUrl: track.album?.images?.[0]?.url || null,
    spotifyUrl: track.external_urls?.spotify || null,
  }))

  console.log(`[Spotify] Found ${results.length} results`)
  return results
}

