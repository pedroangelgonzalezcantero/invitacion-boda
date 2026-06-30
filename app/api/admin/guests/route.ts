import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function isAuthorized(request: NextRequest): boolean {
  const token =
    request.headers.get('x-admin-token') ||
    request.nextUrl.searchParams.get('token')
  return token === process.env.ADMIN_SECRET_TOKEN
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const rsvps = await prisma.rsvpResponse.findMany({
    include: { attendees: true },
    orderBy: { updatedAt: 'desc' },
  })

  // Build summary stats
  const confirmed      = rsvps.filter((r) => r.attending).length
  const declined       = rsvps.filter((r) => !r.attending).length
  const allAttendees   = rsvps.filter((r) => r.attending).flatMap((r) => r.attendees)
  const totalAdults    = allAttendees.filter((a) => a.type === 'adult').length
  const totalChildren  = allAttendees.filter((a) => a.type === 'child').length
  const totalAttending = allAttendees.length

  // Menu breakdown
  const menuCount: Record<string, number> = {}
  allAttendees.forEach((a) => {
    menuCount[a.menuPreference] = (menuCount[a.menuPreference] ?? 0) + 1
  })

  // Allergy breakdown
  const allergyCount: Record<string, number> = {}
  allAttendees.forEach((a) => {
    const allergies = Array.isArray(a.allergies) ? (a.allergies as string[]) : []
    allergies.forEach((al: string) => {
      allergyCount[al] = (allergyCount[al] ?? 0) + 1
    })
    if (a.allergiesOther) {
      allergyCount['other'] = (allergyCount['other'] ?? 0) + 1
    }
  })

  // Serializar para el cliente (snake_case + fechas como string)
  const rsvpsSerialized = rsvps.map((r) => ({
    id:         r.id,
    created_at: r.createdAt.toISOString(),
    updated_at: r.updatedAt.toISOString(),
    guest_id:   r.guestId,
    guest_name: r.guestName,
    attending:  r.attending,
    message:    r.message,
    rsvp_attendees: r.attendees.map((a) => ({
      id:              a.id,
      name:            a.name,
      type:            a.type,
      age:             a.age,
      menu_preference: a.menuPreference,
      allergies:       a.allergies,
      allergies_other: a.allergiesOther,
    })),
  }))

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
    rsvps: rsvpsSerialized,
  })
}

// POST: kept for compatibility
export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  return NextResponse.json({ error: 'Endpoint no disponible en modo abierto' }, { status: 400 })
}
