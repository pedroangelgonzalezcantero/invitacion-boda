import { NextRequest, NextResponse } from 'next/server'
import { checkMusicRateLimit, getClientIp, getRequestSourceHash } from '@/lib/music/rate-limit'
import { commitMusicRequest, previewMusicRequest, validateMusicTrackInput } from '@/lib/music/request-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const mode = body?.mode === 'preview' ? 'preview' : 'commit'
    const track = validateMusicTrackInput(body?.track)

    if (mode === 'preview') {
      const result = await previewMusicRequest(track)
      return NextResponse.json(result)
    }

    const ip = getClientIp(request.headers)
    const userAgent = request.headers.get('user-agent')
    const sourceHash = getRequestSourceHash(ip, userAgent)
    const rateLimit = await checkMusicRateLimit(sourceHash)

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Has enviado varias peticiones en muy poco tiempo. Espera unos minutos y vuelve a intentarlo.',
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateLimit.retryAfterSeconds),
          },
        }
      )
    }

    const result = await commitMusicRequest({
      track,
      sourceHash,
      userAgent,
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    const code = error instanceof Error ? error.message : 'UNKNOWN_ERROR'

    if (code === 'INVALID_PAYLOAD' || code === 'MISSING_TRACK_FIELDS') {
      return NextResponse.json(
        { error: 'La canción seleccionada no es válida.' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'No hemos podido guardar la petición. Inténtalo de nuevo.' },
      { status: 500 }
    )
  }
}

