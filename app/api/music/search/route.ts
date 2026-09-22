import { NextRequest, NextResponse } from 'next/server'
import { searchSpotifyTracks } from '@/lib/music/spotify'

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

    if (code === 'SPOTIFY_NOT_CONFIGURED') {
      return NextResponse.json(
        { error: 'La búsqueda musical no está disponible temporalmente.' },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { error: 'No hemos podido buscar canciones ahora mismo. Inténtalo de nuevo en un momento.' },
      { status: 502 }
    )
  }
}

