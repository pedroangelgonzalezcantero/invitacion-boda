import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const rsvps = await prisma.rsvpResponse.findMany({
      select: {
        attending: true,
        attendees: {
          select: { type: true },
        },
      },
    })

    const declined = rsvps.filter((r) => !r.attending).length
    const allAttendees = rsvps
      .filter((r) => r.attending)
      .flatMap((r) => r.attendees)
    const adults   = allAttendees.filter((a) => a.type === 'adult').length
    const children = allAttendees.filter((a) => a.type === 'child').length

    return NextResponse.json({ declined, adults, children })
  } catch {
    return NextResponse.json({ declined: 0, adults: 0, children: 0 })
  }
}

