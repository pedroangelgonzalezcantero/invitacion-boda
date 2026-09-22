import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

/**
 * Endpoint de diagnóstico para verificar credenciales de Spotify
 * GET /api/spotify-test
 */
export async function GET(request: NextRequest) {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'unknown',
    clientIdLoaded: !!process.env.SPOTIFY_CLIENT_ID,
    clientSecretLoaded: !!process.env.SPOTIFY_CLIENT_SECRET,
    clientIdLength: process.env.SPOTIFY_CLIENT_ID?.length || 0,
    clientSecretLength: process.env.SPOTIFY_CLIENT_SECRET?.length || 0,
    tests: [] as Array<{ name: string; status: 'ok' | 'error'; message: string }>
  }

  // Test 1: Verificar que las variables están cargadas
  if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET) {
    diagnostics.tests.push({
      name: 'Variables de Entorno',
      status: 'error',
      message: `Falta SPOTIFY_CLIENT_ID (${!!process.env.SPOTIFY_CLIENT_ID}) o SPOTIFY_CLIENT_SECRET (${!!process.env.SPOTIFY_CLIENT_SECRET})`
    })
    return NextResponse.json(diagnostics, { status: 400 })
  }

  diagnostics.tests.push({
    name: 'Variables de Entorno',
    status: 'ok',
    message: `Ambas variables están configuradas`
  })

  // Test 2: Intentar obtener token de Spotify
  try {
    const clientId = process.env.SPOTIFY_CLIENT_ID.trim()
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET.trim()

    // Remover comillas si existen
    const cleanClientId = clientId.startsWith('"') && clientId.endsWith('"')
      ? clientId.slice(1, -1)
      : clientId
    const cleanClientSecret = clientSecret.startsWith('"') && clientSecret.endsWith('"')
      ? clientSecret.slice(1, -1)
      : clientSecret

    const basic = Buffer.from(`${cleanClientId}:${cleanClientSecret}`).toString('base64')

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
      diagnostics.tests.push({
        name: 'Autenticación Spotify',
        status: 'error',
        message: `Error ${response.status}: ${details.slice(0, 200)}`
      })
      return NextResponse.json(diagnostics, { status: 502 })
    }

    const json = await response.json() as { access_token?: string; expires_in?: number }

    if (!json.access_token) {
      diagnostics.tests.push({
        name: 'Autenticación Spotify',
        status: 'error',
        message: `No se recibió access_token en la respuesta`
      })
      return NextResponse.json(diagnostics, { status: 502 })
    }

    diagnostics.tests.push({
      name: 'Autenticación Spotify',
      status: 'ok',
      message: `Token obtenido exitosamente (expira en ${json.expires_in} segundos)`
    })

    // Test 3: Intentar una búsqueda simple
    const searchResponse = await fetch(
      `https://api.spotify.com/v1/search?type=track&market=ES&limit=1&q=test`,
      {
        headers: {
          Authorization: `Bearer ${json.access_token}`,
        },
        cache: 'no-store',
      }
    )

    if (!searchResponse.ok) {
      const searchDetails = await searchResponse.text().catch(() => '')
      diagnostics.tests.push({
        name: 'Búsqueda Spotify',
        status: 'error',
        message: `Error ${searchResponse.status}: ${searchDetails.slice(0, 200)}`
      })
      return NextResponse.json(diagnostics, { status: 502 })
    }

    diagnostics.tests.push({
      name: 'Búsqueda Spotify',
      status: 'ok',
      message: `Búsqueda ejecutada exitosamente`
    })

    return NextResponse.json(diagnostics, { status: 200 })

  } catch (error) {
    diagnostics.tests.push({
      name: 'Error General',
      status: 'error',
      message: error instanceof Error ? error.message : 'Error desconocido'
    })
    return NextResponse.json(diagnostics, { status: 500 })
  }
}

