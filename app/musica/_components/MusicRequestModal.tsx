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
            className="max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-[28px] border p-5"
            style={{
              background: 'linear-gradient(145deg, #21182f 0%, #352143 58%, #482744 100%)',
              borderColor: 'rgba(247,205,236,0.18)',
              boxShadow: '0 24px 80px rgba(18,12,28,0.48)',
            }}
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 overflow-hidden rounded-2xl" style={{ width: 72, height: 72, background: 'rgba(255,255,255,0.08)' }}>
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

            <div className="mt-5 rounded-3xl border p-4" style={{ background: 'rgba(255,255,255,0.07)', borderColor: 'rgba(247,205,236,0.14)' }}>
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
                  borderColor: 'rgba(255,255,255,0.22)',
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
                className="rounded-full px-4 py-3 font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  background: 'linear-gradient(135deg, #df69b7 0%, #8758de 100%)',
                  boxShadow: '0 8px 22px rgba(153,83,185,0.26)',
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: '0.78rem',
                }}
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

