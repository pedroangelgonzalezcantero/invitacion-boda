-- ============================================================
-- WEDDING INVITATION APP - Supabase Database Schema
-- Ejecuta este SQL en Supabase > SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ────────────────────────────────────────────
-- TABLE: guests
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS guests (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  name            TEXT NOT NULL,
  code            TEXT NOT NULL UNIQUE,
  max_companions  INTEGER DEFAULT 1 NOT NULL,
  email           TEXT,
  phone           TEXT,
  notes           TEXT,
  is_active       BOOLEAN DEFAULT TRUE NOT NULL
);

-- Index for fast code lookup
CREATE UNIQUE INDEX IF NOT EXISTS idx_guests_code ON guests(code);

-- ────────────────────────────────────────────
-- TABLE: rsvp_responses  (una fila por invitación)
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rsvp_responses (
  id                UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  guest_id          UUID REFERENCES guests(id) ON DELETE SET NULL,  -- nullable (sin código)
  guest_name        TEXT NOT NULL UNIQUE,                            -- unicidad por nombre
  attending         BOOLEAN NOT NULL,
  message           TEXT
);

-- ────────────────────────────────────────────
-- TABLE: rsvp_attendees  (una fila por persona dentro de la respuesta)
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rsvp_attendees (
  id                UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  rsvp_id           UUID NOT NULL REFERENCES rsvp_responses(id) ON DELETE CASCADE,
  guest_id          UUID REFERENCES guests(id) ON DELETE SET NULL,  -- nullable
  name              TEXT NOT NULL,
  type              TEXT NOT NULL CHECK (type IN ('adult', 'child')),
  age               INTEGER,
  menu_preference   TEXT NOT NULL DEFAULT 'standard',
  allergies         TEXT[],
  allergies_other   TEXT
);

-- Index for rsvp_id lookup
CREATE INDEX IF NOT EXISTS idx_rsvp_attendees_rsvp_id ON rsvp_attendees(rsvp_id);
-- Index for guest_id lookup
CREATE INDEX IF NOT EXISTS idx_rsvp_attendees_guest_id ON rsvp_attendees(guest_id);

-- ────────────────────────────────────────────
-- ROW LEVEL SECURITY (RLS)
-- ────────────────────────────────────────────

-- Enable RLS
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE rsvp_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE rsvp_attendees ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read active guests (for code verification)
CREATE POLICY "Public can read active guests by code"
  ON guests FOR SELECT
  USING (is_active = TRUE);

-- Allow anyone to read/insert/update rsvp_responses (guests confirming)
CREATE POLICY "Public can read rsvp_responses"
  ON rsvp_responses FOR SELECT
  USING (TRUE);

CREATE POLICY "Public can insert rsvp_responses"
  ON rsvp_responses FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Public can update own rsvp_response"
  ON rsvp_responses FOR UPDATE
  USING (TRUE);

-- Allow anyone to read rsvp_attendees
CREATE POLICY "Public read rsvp_attendees"
  ON rsvp_attendees FOR SELECT
  USING (TRUE);

-- Allow anyone to insert rsvp_attendees
CREATE POLICY "Public insert rsvp_attendees"
  ON rsvp_attendees FOR INSERT
  WITH CHECK (TRUE);

-- Allow anyone to delete rsvp_attendees
CREATE POLICY "Public delete rsvp_attendees"
  ON rsvp_attendees FOR DELETE
  USING (TRUE);

-- ────────────────────────────────────────────
-- SAMPLE DATA (optional - delete before production)
-- ────────────────────────────────────────────
INSERT INTO guests (name, code, max_companions, email) VALUES
  ('Ana García',        'ANA-001',   2, 'ana@example.com'),
  ('Carlos Martínez',   'CARLOS-002', 1, 'carlos@example.com'),
  ('Laura y Pedro',     'LAURA-003',  3, 'laura@example.com'),
  ('Familia Rodríguez', 'FAMILIA-004', 4, NULL),
  ('María López',       'MARIA-005',  1, 'maria@example.com')
ON CONFLICT (code) DO NOTHING;

