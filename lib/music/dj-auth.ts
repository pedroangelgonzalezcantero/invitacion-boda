import { NextRequest, NextResponse } from 'next/server'

export function getDjToken(request: NextRequest): string {
  return (
    request.headers.get('x-dj-token') ||
    request.nextUrl.searchParams.get('token') ||
    ''
  )
}

export function isDjAuthorized(request: NextRequest): boolean {
  const expected = process.env.DJ_MUSIC_TOKEN || ''
  return Boolean(expected) && getDjToken(request) === expected
}

export function getDjUnauthorizedResponse() {
  return NextResponse.json(
    { error: 'No autorizado' },
    { status: 401 }
  )
}
