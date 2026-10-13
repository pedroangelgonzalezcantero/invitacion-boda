/* eslint-disable @next/next/no-img-element */
'use client'

import { motion } from 'framer-motion'
import { Check, LoaderCircle } from 'lucide-react'
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
      className="w-full cursor-pointer rounded-[22px] border p-3 text-left transition-colors sm:rounded-[26px] sm:p-4"
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onSelect(track)
        }
      }}
      style={{
        background: isSelected ? 'linear-gradient(135deg, #fbf3ff 0%, #fff 100%)' : '#fff',
        borderColor: isSelected ? '#c69bd6' : '#e9e3f0',
        boxShadow: isSelected ? '0 14px 36px rgba(147,91,171,0.14)' : '0 8px 24px rgba(49,36,68,0.055)',
      }}
      whileHover={{ y: -2, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 overflow-hidden rounded-2xl" style={{ width: 66, height: 66, background: '#eee9f4' }}>
          {track.albumImageUrl ? (
            <img src={track.albumImageUrl} alt={track.songName} className="w-full h-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center" style={{ color: '#8765a7', fontSize: '1.7rem' }}>♪</div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate" style={{ color: '#30263b', fontSize: '1.02rem', fontWeight: 600 }}>
            {track.songName}
          </p>
          <p className="mt-0.5 truncate" style={{ color: '#665c70', fontFamily: "'Montserrat', sans-serif", fontSize: '0.8rem' }}>
            {track.artistName}
          </p>
          {track.albumName && (
            <p className="mt-1 truncate" style={{ color: '#928a99', fontFamily: "'Montserrat', sans-serif", fontSize: '0.72rem' }}>
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
            background: isBusy ? '#eee9f4' : 'linear-gradient(135deg, #df69b7 0%, #8758de 100%)',
            color: 'white',
            boxShadow: isBusy ? 'none' : '0 8px 18px rgba(155,83,185,0.26)',
          }}
        >
          {isBusy ? <LoaderCircle className="animate-spin" size={18} color="#76518c" /> : <Check size={18} />}
        </button>
      </div>
    </motion.div>
  )
}




