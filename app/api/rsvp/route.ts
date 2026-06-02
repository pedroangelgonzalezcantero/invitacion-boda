import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// ── Demo mode: active when Supabase is not configured ─────────
function isDemoMode() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
  return (
    !url ||
    !key ||
    url.includes('your-project') ||
    key.includes('your-anon-key')
  )
}

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

    // ── DEMO MODE — Supabase not configured ───────────────────
    if (isDemoMode()) {
      console.log('🟡 DEMO MODE — RSVP no guardado en BD (Supabase no configurado)')
      console.log('   Nombre:', guestName, '| Asiste:', attending, '| Asistentes:', attendees.length)
      // Simulate a small delay for realism
      await new Promise(r => setTimeout(r, 600))
      return NextResponse.json(
        { success: true, demo: true, rsvpId: 'demo-' + Date.now(), attendeesCount: attendees.length },
        { status: 201 }
      )
    }

    const safeAttendees: AttendeePayload[] = attending
      ? (attendees as AttendeePayload[]).slice(0, 20)
      : []

    const now = new Date().toISOString()

    // ── Check if this guest already has a response ─────────────
    const { data: existing } = await supabase
      .from('rsvp_responses')
      .select('id')
      .eq('guest_name', guestName.trim())
      .maybeSingle()

    let rsvpId: string

    if (existing?.id) {
      // UPDATE existing response
      const { data: updated, error: updateError } = await supabase
        .from('rsvp_responses')
        .update({ attending: Boolean(attending), message, updated_at: now })
        .eq('id', existing.id)
        .select('id')
        .single()

      if (updateError || !updated) {
        console.error('RSVP update error:', updateError)
        return NextResponse.json({ error: 'Error al actualizar tu respuesta.' }, { status: 500 })
      }
      rsvpId = updated.id
    } else {
      // INSERT new response — omit guest_id entirely so nullable constraint applies
      const insertPayload: Record<string, unknown> = {
        guest_name: guestName.trim(),
        attending: Boolean(attending),
        message,
        updated_at: now,
      }

      const { data: inserted, error: insertError } = await supabase
        .from('rsvp_responses')
        .insert(insertPayload)
        .select('id')
        .single()

      if (insertError || !inserted) {
        console.error('RSVP insert error:', insertError)
        return NextResponse.json({ error: 'Error al guardar tu respuesta. Comprueba la configuración de Supabase.' }, { status: 500 })
      }
      rsvpId = inserted.id
    }

    // ── Delete existing attendees and re-insert ────────────────
    await supabase.from('rsvp_attendees').delete().eq('rsvp_id', rsvpId)

    if (safeAttendees.length > 0) {
      const attendeeRows = safeAttendees.map((a) => ({
        rsvp_id: rsvpId,
        name: a.name?.trim() || 'Sin nombre',
        type: a.type,
        age: a.type === 'child' ? (a.age ?? null) : null,
        menu_preference: a.menuPreference || 'standard',
        allergies: a.allergies ?? [],
        allergies_other: a.allergiesOther || null,
      }))

      const { error: attendeesError } = await supabase
        .from('rsvp_attendees')
        .insert(attendeeRows)

      if (attendeesError) {
        console.error('Attendees insert error:', attendeesError)
        // Don't fail the whole request — RSVP is saved, attendees might fail if table doesn't exist yet
        return NextResponse.json({
          success: true,
          rsvpId,
          warning: 'Respuesta guardada, pero hubo un problema con los asistentes: ' + attendeesError.message,
          attendeesCount: 0,
        }, { status: 201 })
      }
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

