import { NextRequest, NextResponse } from 'next/server'
import { searchSpotifyTracks } from '@/lib/music/spotify'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const query = (request.nextUrl.searchParams.get('q') || '').trim()

  if (query.length < 2) {
    return NextResponse.json({ items: [] })
  }

  try {
    const items = await searchSpotifyTracks(query)
    return NextResponse.json({ items })
  } catch (error) {
    const code = error instanceof Error ? error.message : 'UNKNOWN_ERROR'
    console.error('Music search error:', code)

    if (code === 'SPOTIFY_NOT_CONFIGURED') {
      return NextResponse.json(
        { error: 'La búsqueda musical no está disponible temporalmente.' },
        { status: 503 }
      )
    }

    if (code.startsWith('SPOTIFY_TOKEN_ERROR')) {
      return NextResponse.json(
        { error: 'No hemos podido autenticar la búsqueda con Spotify en este despliegue.' },
        { status: 502 }
      )
    }

    if (code.startsWith('SPOTIFY_SEARCH_ERROR')) {
      return NextResponse.json(
        { error: 'Spotify no ha podido devolver resultados ahora mismo. Inténtalo de nuevo en un momento.' },
        { status: 502 }
      )
    }

    return NextResponse.json(
      { error: 'No hemos podido buscar canciones ahora mismo. Inténtalo de nuevo en un momento.' },
      { status: 502 }
    )
  }
}

