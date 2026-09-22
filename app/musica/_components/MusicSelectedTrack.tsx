/* eslint-disable @next/next/no-img-element */
'use client'

import { motion } from 'framer-motion'
import { SpotifyTrackResult } from '@/lib/music/types'

interface MusicSelectedTrackProps {
  track: SpotifyTrackResult
  onCheckRequest: () => void
  previewLoading: boolean
}

export default function MusicSelectedTrack({ track, onCheckRequest, previewLoading }: MusicSelectedTrackProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-elegant p-5"
      style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(247,240,229,0.96) 100%)', borderColor: 'rgba(201,169,110,0.18)', boxShadow: '0 22px 52px rgba(69,52,38,0.1)' }}
    >
      <p className="text-xs uppercase tracking-[0.35em] mb-4"
        style={{ color: 'var(--gold)', fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}>
        Has elegido
      </p>
      <div className="flex items-center gap-4">
        <div className="overflow-hidden rounded-2xl flex-shrink-0" style={{ width: 78, height: 78, background: 'rgba(255,255,255,0.08)' }}>
          {track.albumImageUrl ? (
            <img src={track.albumImageUrl} alt={track.songName} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ color: 'white' }}>♪</div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate" style={{ color: 'var(--charcoal)', fontSize: '1.35rem', fontWeight: 400 }}>
            🎵 {track.songName}
          </h3>
          <p className="truncate mt-1" style={{ color: 'rgba(44,44,44,0.72)', fontFamily: "'Montserrat', sans-serif", fontSize: '0.86rem' }}>
            👤 {track.artistName}
          </p>
          {track.albumName && (
            <p className="truncate mt-1" style={{ color: 'rgba(44,44,44,0.45)', fontFamily: "'Montserrat', sans-serif", fontSize: '0.74rem' }}>
              {track.albumName}
            </p>
          )}
        </div>
      </div>
      <button className="btn-gold mt-5 w-full" onClick={onCheckRequest} disabled={previewLoading}>
        {previewLoading ? 'Comprobando…' : 'Pedir esta canción'}
      </button>
    </motion.div>
  )
}



