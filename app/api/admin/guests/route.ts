import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

function isAuthorized(request: NextRequest): boolean {
  const token =
    request.headers.get('x-admin-token') ||
    request.nextUrl.searchParams.get('token')
  return token === process.env.ADMIN_SECRET_TOKEN
}

function isDemoMode() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
  return !url || !key || url.includes('your-project') || key.includes('your-anon-key')
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  // ── Supabase no configurado → devolver datos vacíos con aviso ──
  if (isDemoMode()) {
    return NextResponse.json({
      demo: true,
      summary: {
        totalResponses: 0, confirmed: 0, declined: 0,
        totalAttending: 0, totalAdults: 0, totalChildren: 0,
        menuCount: {}, allergyCount: {},
      },
      rsvps: [],
    })
  }

  // Fetch all RSVP responses with their attendees
  const { data: rsvpsRaw, error: rsvpsError } = await supabase
    .from('rsvp_responses')
    .select('*, rsvp_attendees(*)')
    .order('updated_at', { ascending: false })

  if (rsvpsError) {
    return NextResponse.json({ error: 'Error al obtener respuestas: ' + rsvpsError.message }, { status: 500 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rsvps: any[] = rsvpsRaw ?? []

  // Build summary stats
  const confirmed      = rsvps.filter(r => r.attending).length
  const declined       = rsvps.filter(r => !r.attending).length
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allAttendees   = rsvps.filter(r => r.attending).flatMap((r: any) => r.rsvp_attendees ?? [])
  const totalAdults    = allAttendees.filter((a: { type: string }) => a.type === 'adult').length
  const totalChildren  = allAttendees.filter((a: { type: string }) => a.type === 'child').length
  const totalAttending = allAttendees.length

  // Menu breakdown
  const menuCount: Record<string, number> = {}
  allAttendees.forEach((a: { menu_preference: string }) => {
    menuCount[a.menu_preference] = (menuCount[a.menu_preference] ?? 0) + 1
  })

  // Allergy breakdown
  const allergyCount: Record<string, number> = {}
  allAttendees.forEach((a: { allergies?: string[]; allergies_other?: string }) => {
    ;(a.allergies ?? []).forEach((al: string) => {
      allergyCount[al] = (allergyCount[al] ?? 0) + 1
    })
    if (a.allergies_other) {
      allergyCount['other'] = (allergyCount['other'] ?? 0) + 1
    }
  })

  return NextResponse.json({
    summary: {
      totalResponses: rsvps.length,
      confirmed,
      declined,
      totalAttending,
      totalAdults,
      totalChildren,
      menuCount,
      allergyCount,
    },
    rsvps,
  })
}

// POST: not needed anymore (no guest list), kept for compatibility
export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  return NextResponse.json({ error: 'Endpoint no disponible en modo abierto' }, { status: 400 })
}
