import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

function isDemoMode() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
  return !url || !key || url.includes('your-project') || key.includes('your-anon-key')
}

export async function GET() {
  if (isDemoMode()) {
    return NextResponse.json({ declined: 0, adults: 0, children: 0 })
  }

  try {
    const { data: rsvpsRaw } = await supabase
      .from('rsvp_responses')
      .select('attending, rsvp_attendees(type)')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rsvps: any[] = rsvpsRaw ?? []

    const declined = rsvps.filter(r => !r.attending).length
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allAttendees = rsvps.filter(r => r.attending).flatMap((r: any) => r.rsvp_attendees ?? [])
    const adults   = allAttendees.filter((a: { type: string }) => a.type === 'adult').length
    const children = allAttendees.filter((a: { type: string }) => a.type === 'child').length

    return NextResponse.json({ declined, adults, children })
  } catch {
    return NextResponse.json({ declined: 0, adults: 0, children: 0 })
  }
}

