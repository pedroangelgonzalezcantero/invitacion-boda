/* eslint-disable @next/next/no-img-element */
'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { SpotifyTrackResult } from '@/lib/music/types'

interface MusicTrackCardProps {
  track: SpotifyTrackResult
  onSelect: (track: SpotifyTrackResult) => void
  onQuickConfirm: (track: SpotifyTrackResult) => void
  isSelected: boolean
  isBusy: boolean
}

export default function MusicTrackCard({ track, onSelect, onQuickConfirm, isSelected, isBusy }: MusicTrackCardProps) {
  return (
    <motion.div
      onClick={() => onSelect(track)}
      className="w-full text-left rounded-3xl p-3 md:p-4 border"
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onSelect(track)
        }
      }}
      style={{
        background: isSelected ? 'linear-gradient(135deg, rgba(232,213,176,0.58) 0%, rgba(255,255,255,0.98) 100%)' : 'rgba(255,255,255,0.88)',
        borderColor: isSelected ? 'rgba(201,169,110,0.46)' : 'rgba(201,169,110,0.14)',
        boxShadow: isSelected ? '0 18px 42px rgba(201,169,110,0.2)' : '0 10px 26px rgba(69,52,38,0.06)',
      }}
      whileHover={{ y: -2, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <div className="flex items-center gap-3">
        <div className="overflow-hidden rounded-2xl flex-shrink-0" style={{ width: 66, height: 66, background: 'rgba(255,255,255,0.08)' }}>
          {track.albumImageUrl ? (
            <img src={track.albumImageUrl} alt={track.songName} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ color: 'white', opacity: 0.7 }}>♪</div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate" style={{ color: 'var(--charcoal)', fontSize: '1.05rem', fontWeight: 500 }}>
            {track.songName}
          </p>
          <p className="truncate mt-0.5" style={{ color: 'rgba(44,44,44,0.72)', fontFamily: "'Montserrat', sans-serif", fontSize: '0.82rem' }}>
            {track.artistName}
          </p>
          {track.albumName && (
            <p className="truncate mt-1" style={{ color: 'rgba(44,44,44,0.42)', fontFamily: "'Montserrat', sans-serif", fontSize: '0.74rem' }}>
              {track.albumName}
            </p>
          )}
        </div>
        <button
          type="button"
          aria-label={`Pedir ${track.songName}`}
          onClick={(event) => {
            event.stopPropagation()
            onQuickConfirm(track)
          }}
          disabled={isBusy}
          className="flex-shrink-0 rounded-full flex items-center justify-center"
          style={{
            width: 40,
            height: 40,
            background: isBusy ? 'rgba(201,169,110,0.18)' : 'linear-gradient(135deg, var(--gold) 0%, #b8935c 100%)',
            color: 'white',
            boxShadow: '0 8px 20px rgba(201,169,110,0.24)',
          }}
        >
          <Check size={18} />
        </button>
      </div>
    </motion.div>
  )
}





