'use client'

import { AnimatePresence, motion } from 'framer-motion'
import MusicTrackCard from '@/app/musica/_components/MusicTrackCard'
import { SpotifyTrackResult } from '@/lib/music/types'

interface MusicSearchResultsProps {
  items: SpotifyTrackResult[]
  selectedTrackId: string | null
  onSelect: (track: SpotifyTrackResult) => void
  onQuickConfirm: (track: SpotifyTrackResult) => void
  actionTrackId: string | null
}

export default function MusicSearchResults({ items, selectedTrackId, onSelect, onQuickConfirm, actionTrackId }: MusicSearchResultsProps) {
  return (
    <div className="flex flex-col gap-3">
      <AnimatePresence>
        {items.map((track, index) => (
          <motion.div
            key={track.spotifyTrackId}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ delay: index * 0.03 }}
          >
            <MusicTrackCard
              track={track}
              onSelect={onSelect}
              onQuickConfirm={onQuickConfirm}
              isSelected={selectedTrackId === track.spotifyTrackId}
              isBusy={actionTrackId === track.spotifyTrackId}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}


