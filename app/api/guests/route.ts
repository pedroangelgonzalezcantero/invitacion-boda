import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.json({ error: 'El código de invitación es requerido' }, { status: 400 })
  }

  const guest = await prisma.guest.findFirst({
    where: {
      code:     code.toUpperCase(),
      isActive: true,
    },
    select: {
      id:            true,
      name:          true,
      maxCompanions: true,
      isActive:      true,
    },
  })

  if (!guest) {
    return NextResponse.json(
      { error: 'Código no válido o invitado no encontrado. Comprueba tu invitación.' },
      { status: 404 }
    )
  }

  // Check if already responded
  const existingRSVP = await prisma.rsvpResponse.findFirst({
    where:  { guestId: guest.id },
    select: { id: true, attending: true, updatedAt: true },
  })

  return NextResponse.json({
    guest: {
      id:             guest.id,
      name:           guest.name,
      max_companions: guest.maxCompanions,
      is_active:      guest.isActive,
    },
    alreadyResponded: !!existingRSVP,
    existingRSVP: existingRSVP
      ? { id: existingRSVP.id, attending: existingRSVP.attending, updated_at: existingRSVP.updatedAt }
      : null,
  })
}

