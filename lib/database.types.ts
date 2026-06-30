/**
 * lib/database.types.ts
 * ─────────────────────────────────────────────────────────────
 * Tipos de dominio de la aplicación.
 * Ya NO se basan en el SDK de Supabase.
 * Se corresponden con los modelos del esquema Prisma.
 * ─────────────────────────────────────────────────────────────
 */

// ── guests ───────────────────────────────────────────────────
export interface Guest {
  id:            string
  createdAt:     Date
  name:          string
  code:          string
  maxCompanions: number
  email:         string | null
  phone:         string | null
  notes:         string | null
  isActive:      boolean
}

// ── rsvp_responses ───────────────────────────────────────────
export interface RsvpResponse {
  id:        string
  createdAt: Date
  updatedAt: Date
  guestId:   string | null
  guestName: string
  attending: boolean
  message:   string | null
}

// ── rsvp_attendees ───────────────────────────────────────────
export type AttendeeType = 'adult' | 'child'

export interface RsvpAttendee {
  id:             string
  createdAt:      Date
  rsvpId:         string
  guestId:        string | null
  name:           string
  type:           AttendeeType
  age:            number | null
  menuPreference: string
  allergies:      string[] | null
  allergiesOther: string | null
}

// ── uploads ──────────────────────────────────────────────────
export type UploadType = 'image' | 'video'

export interface Upload {
  id:          string
  createdAt:   Date
  fileUrl:     string
  fileType:    UploadType
  fileName:    string | null
  storagePath: string
  thumbUrl:    string | null
  userName:    string | null
  guestName:   string | null
  message:     string | null
}
