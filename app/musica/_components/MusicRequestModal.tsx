/* eslint-disable @next/next/no-img-element */
'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { MusicPreviewResponse, SpotifyTrackResult } from '@/lib/music/types'

interface MusicRequestModalProps {
  open: boolean
  track: SpotifyTrackResult | null
  preview: MusicPreviewResponse | null
  previewLoading: boolean
  submitting: boolean
  onClose: () => void
  onConfirm: () => void
}

export default function MusicRequestModal({
  open,
  track,
  preview,
  previewLoading,
  submitting,
  onClose,
  onConfirm,
}: MusicRequestModalProps) {
  return (
    <AnimatePresence>
      {open && track && (
        <motion.div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 px-4 py-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            className="w-full max-w-lg rounded-[28px] p-5 border"
            style={{
              background: 'linear-gradient(180deg, rgba(58,49,41,0.98) 0%, rgba(42,34,29,0.98) 100%)',
              borderColor: 'rgba(232,213,176,0.18)',
              boxShadow: '0 24px 80px rgba(0,0,0,0.35)',
            }}
          >
            <div className="flex items-start gap-4">
              <div className="overflow-hidden rounded-2xl flex-shrink-0" style={{ width: 72, height: 72, background: 'rgba(255,255,255,0.08)' }}>
                {track.albumImageUrl ? (
                  <img src={track.albumImageUrl} alt={track.songName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center" style={{ color: 'white' }}>♪</div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate" style={{ color: 'white', fontSize: '1.15rem' }}>{track.songName}</p>
                <p className="truncate mt-1" style={{ color: 'rgba(255,255,255,0.7)', fontFamily: "'Montserrat', sans-serif", fontSize: '0.82rem' }}>{track.artistName}</p>
                {track.albumName && (
                  <p className="truncate mt-1" style={{ color: 'rgba(255,255,255,0.42)', fontFamily: "'Montserrat', sans-serif", fontSize: '0.72rem' }}>{track.albumName}</p>
                )}
              </div>
            </div>

            <div className="mt-5 rounded-3xl p-4" style={{ background: 'rgba(255,248,240,0.08)', border: '1px solid rgba(232,213,176,0.14)' }}>
              {previewLoading ? (
                <>
                  <p style={{ color: 'white', fontSize: '1.1rem' }}>Comprobando la pista…</p>
                  <p className="mt-2" style={{ color: 'rgba(255,255,255,0.58)', fontFamily: "'Montserrat', sans-serif", fontSize: '0.82rem', lineHeight: 1.6 }}>
                    Estamos revisando si ya está en la cola o si ya ha sonado esta noche.
                  </p>
                </>
              ) : preview ? (
                <>
                  <p style={{ color: 'white', fontSize: '1.15rem' }}>{preview.title}</p>
                  <p className="mt-2" style={{ color: 'rgba(255,255,255,0.64)', fontFamily: "'Montserrat', sans-serif", fontSize: '0.84rem', lineHeight: 1.7 }}>
                    {preview.message}
                  </p>
                </>
              ) : null}
            </div>

            <div className="grid grid-cols-2 gap-3 mt-5">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full px-4 py-3 border"
                style={{
                  borderColor: 'rgba(255,255,255,0.18)',
                  color: 'white',
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: '0.82rem',
                  letterSpacing: '0.04em',
                }}
              >
                Seguir buscando
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={previewLoading || !preview || submitting}
                className="btn-gold"
              >
                {submitting
                  ? 'Enviando…'
                  : preview?.resultType === 'NEW'
                    ? '✓ Confirmar canción'
                    : '✓ Pedir igualmente'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}



