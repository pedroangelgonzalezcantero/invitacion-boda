-- ============================================================
-- CLOUDINARY + SUPABASE SCHEMA
-- Ejecuta este script en Supabase > SQL Editor
-- ============================================================
-- Cloudinary gestiona los archivos (imágenes y vídeos).
-- Supabase solo guarda la URL y metadata (sin Storage).
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. Extensión UUID (ya activada en Supabase por defecto)
-- ────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ────────────────────────────────────────────────────────────
-- 2. Tabla principal: uploads
--    storage_path = public_id de Cloudinary (para thumbnails)
--    user_name    = nombre opcional del invitado
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS uploads (
  id           UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  file_url     TEXT        NOT NULL,                          -- secure_url de Cloudinary
  file_type    TEXT        NOT NULL CHECK (file_type IN ('image', 'video')),
  file_name    TEXT,
  storage_path TEXT        NOT NULL,                          -- public_id de Cloudinary
  user_name    TEXT,                                          -- nombre del invitado (opcional)
  guest_name   TEXT,                                          -- alias legacy (compat.)
  message      TEXT
);

-- Si la tabla ya existía, añade la columna user_name si no está:
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'uploads' AND column_name = 'user_name'
  ) THEN
    ALTER TABLE uploads ADD COLUMN user_name TEXT;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_uploads_created_at ON uploads(created_at DESC);

-- ────────────────────────────────────────────────────────────
-- 3. Row Level Security (RLS)
-- ────────────────────────────────────────────────────────────
ALTER TABLE uploads ENABLE ROW LEVEL SECURITY;

-- Política: cualquier usuario puede insertar (invitados sin autenticar)
DROP POLICY IF EXISTS "Public can insert uploads" ON uploads;
CREATE POLICY "Public can insert uploads"
  ON uploads FOR INSERT WITH CHECK (TRUE);

-- Política: cualquier usuario puede leer la galería
DROP POLICY IF EXISTS "Public can read uploads" ON uploads;
CREATE POLICY "Public can read uploads"
  ON uploads FOR SELECT USING (TRUE);

-- ────────────────────────────────────────────────────────────
-- 4. Tabla alternativa: media (más semántica, opcional)
--    Útil si prefieres empezar desde cero sin la tabla uploads
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS media (
  id           UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  url          TEXT        NOT NULL,    -- secure_url de Cloudinary
  public_id    TEXT        NOT NULL,    -- public_id de Cloudinary (para thumbnails)
  type         TEXT        NOT NULL CHECK (type IN ('image', 'video')),
  file_name    TEXT,
  user_name    TEXT                     -- nombre del invitado (opcional)
);

CREATE INDEX IF NOT EXISTS idx_media_created_at ON media(created_at DESC);

ALTER TABLE media ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public insert media" ON media;
CREATE POLICY "Public insert media"  ON media FOR INSERT WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Public read media" ON media;
CREATE POLICY "Public read media"    ON media FOR SELECT USING (TRUE);
