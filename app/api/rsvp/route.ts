import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export interface AttendeePayload {
  name: string
  type: 'adult' | 'child'
  age?: number
  menuPreference: string
  allergies: string[]
  allergiesOther?: string
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      guestName,
      attending,
      attendees = [] as AttendeePayload[],
      message = '',
    } = body

    if (!guestName?.trim() || attending === undefined) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios (guestName, attending)' },
        { status: 400 }
      )
    }

    const safeAttendees: AttendeePayload[] = attending
      ? (attendees as AttendeePayload[]).slice(0, 20)
      : []

    // ── Upsert: actualizar si existe, insertar si no ──────────
    const existing = await prisma.rsvpResponse.findFirst({
      where:  { guestName: guestName.trim() },
      select: { id: true },
    })

    let rsvpId: string

    if (existing?.id) {
      // UPDATE
      await prisma.rsvpResponse.update({
        where: { id: existing.id },
        data:  {
          attending: Boolean(attending),
          message,
          updatedAt: new Date(),
        },
      })
      rsvpId = existing.id
    } else {
      // INSERT
      const inserted = await prisma.rsvpResponse.create({
        data: {
          guestName: guestName.trim(),
          attending: Boolean(attending),
          message,
        },
        select: { id: true },
      })
      rsvpId = inserted.id
    }

    // ── Borrar asistentes previos y reinsertar ────────────────
    await prisma.rsvpAttendee.deleteMany({ where: { rsvpId } })

    if (safeAttendees.length > 0) {
      await prisma.rsvpAttendee.createMany({
        data: safeAttendees.map((a) => ({
          rsvpId,
          name:           a.name?.trim() || 'Sin nombre',
          type:           a.type === 'child' ? ('child' as const) : ('adult' as const),
          age:            a.type === 'child' ? (a.age ?? null) : null,
          menuPreference: a.menuPreference || 'standard',
          allergies:      a.allergies ?? [],
          allergiesOther: a.allergiesOther || null,
        })),
      })
    }

    return NextResponse.json(
      { success: true, rsvpId, attendeesCount: safeAttendees.length },
      { status: 201 }
    )
  } catch (err) {
    console.error('RSVP POST error:', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

