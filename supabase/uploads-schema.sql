-- ============================================================
-- WEDDING UPLOADS - Ejecuta en Supabase > SQL Editor
-- ============================================================

-- ────────────────────────────────────────────
-- TABLE: uploads
-- ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS uploads (
  id           UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  file_url     TEXT NOT NULL,
  file_type    TEXT NOT NULL CHECK (file_type IN ('image', 'video')),
  file_name    TEXT,
  storage_path TEXT NOT NULL,
  guest_name   TEXT,
  message      TEXT
);

CREATE INDEX IF NOT EXISTS idx_uploads_created_at ON uploads(created_at DESC);

-- RLS
ALTER TABLE uploads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can insert uploads"
  ON uploads FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Public can read uploads"
  ON uploads FOR SELECT USING (TRUE);

-- ────────────────────────────────────────────
-- STORAGE: bucket wedding-uploads
-- ────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'wedding-uploads',
  'wedding-uploads',
  true,
  209715200,
  ARRAY[
    'image/jpeg','image/jpg','image/png','image/gif','image/webp','image/heic','image/heif',
    'video/mp4','video/quicktime','video/webm','video/mpeg','video/3gpp','video/x-msvideo'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Public upload wedding media"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'wedding-uploads');

CREATE POLICY "Public read wedding media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'wedding-uploads');

CREATE POLICY "Public delete wedding media"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'wedding-uploads');

