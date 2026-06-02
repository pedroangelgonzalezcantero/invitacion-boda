import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.json({ error: 'El código de invitación es requerido' }, { status: 400 })
  }

  const { data: guest, error } = await supabase
    .from('guests')
    .select('id, name, max_companions, is_active')
    .eq('code', code.toUpperCase())
    .eq('is_active', true)
    .single()

  if (error || !guest) {
    return NextResponse.json(
      { error: 'Código no válido o invitado no encontrado. Comprueba tu invitación.' },
      { status: 404 }
    )
  }

  // Check if already responded
  const { data: existingRSVP } = await supabase
    .from('rsvp_responses')
    .select('id, attending, updated_at')
    .eq('guest_id', guest.id)
    .single()

  return NextResponse.json({
    guest,
    alreadyResponded: !!existingRSVP,
    existingRSVP: existingRSVP || null,
  })
}

