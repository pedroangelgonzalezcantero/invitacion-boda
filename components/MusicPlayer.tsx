'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Volume2, VolumeX, Music } from 'lucide-react'

// YouTube IFrame API types
declare global {
  interface Window {
    YT: {
      Player: new (
        elementId: string,
        options: {
          videoId: string
          playerVars?: Record<string, number | string>
          events?: {
            onReady?: (e: { target: YTPlayer }) => void
            onStateChange?: (e: { data: number }) => void
            onError?: (e: { data: number }) => void
          }
        }
      ) => YTPlayer
      PlayerState: { PLAYING: number; PAUSED: number; ENDED: number }
    }
    onYouTubeIframeAPIReady: () => void
  }
}

interface YTPlayer {
  playVideo(): void
  pauseVideo(): void
  setVolume(v: number): void
  destroy(): void
  getPlayerState(): number
}

const VIDEO_ID = process.env.NEXT_PUBLIC_YOUTUBE_MUSIC_ID || 'TPjGEoO_6YI'

export default function MusicPlayer() {
  const playerRef    = useRef<YTPlayer | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying]   = useState(false)
  const [isReady, setIsReady]       = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)

  // ── Load YouTube IFrame API once ──────────────────────────
  const initPlayer = useCallback(() => {
    if (!containerRef.current) return

    playerRef.current = new window.YT.Player('yt-music-player', {
      videoId: VIDEO_ID,
      playerVars: {
        autoplay: 1,
        controls: 0,
        disablekb: 1,
        fs: 0,
        iv_load_policy: 3,
        modestbranding: 1,
        rel: 0,
        start: 0,
        // Loop
        loop: 1,
        playlist: VIDEO_ID,
      },
      events: {
        onReady: (e) => {
          e.target.setVolume(35)
          setIsReady(true)
          // Try autoplay — works because user already interacted (clicked envelope)
          try {
            e.target.playVideo()
            setIsPlaying(true)
            setHasInteracted(true)
          } catch {
            // Autoplay blocked — user will click manually
          }
        },
        onStateChange: (e) => {
          const playing = e.data === 1 // YT.PlayerState.PLAYING
          setIsPlaying(playing)
        },
        onError: () => {
          setIsReady(false)
        },
      },
    })
  }, [])

  useEffect(() => {
    // Show tooltip hint after 3s
    const t1 = setTimeout(() => setShowTooltip(true), 3000)
    const t2 = setTimeout(() => setShowTooltip(false), 8000)

    // Load YouTube API if not already loaded
    if (window.YT?.Player) {
      initPlayer()
    } else {
      window.onYouTubeIframeAPIReady = initPlayer

      if (!document.getElementById('yt-iframe-api')) {
        const tag = document.createElement('script')
        tag.id  = 'yt-iframe-api'
        tag.src = 'https://www.youtube.com/iframe_api'
        document.head.appendChild(tag)
      }
    }

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      try { playerRef.current?.destroy() } catch { /* ignore */ }
    }
  }, [initPlayer])

  // ── Toggle play / pause ────────────────────────────────────
  const toggleMusic = () => {
    if (!playerRef.current) return
    setShowTooltip(false)
    setHasInteracted(true)

    try {
      if (isPlaying) {
        playerRef.current.pauseVideo()
        setIsPlaying(false)
      } else {
        playerRef.current.playVideo()
        setIsPlaying(true)
      }
    } catch {
      // Player not ready yet
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2">

      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && !hasInteracted && (
          <motion.div
            className="card-elegant px-3 py-2"
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 300,
              color: 'var(--charcoal)',
              whiteSpace: 'nowrap',
              fontSize: '0.7rem',
            }}
            initial={{ opacity: 0, x: 10, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 10, scale: 0.9 }}
          >
            🎵 Música activada
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main button */}
      <motion.button
        onClick={toggleMusic}
        className="rounded-full flex items-center justify-center"
        style={{
          width: 48,
          height: 48,
          background: isPlaying
            ? 'linear-gradient(135deg, var(--gold), #b8935c)'
            : 'rgba(255,255,255,0.9)',
          border: '1px solid var(--gold-light)',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
          color: isPlaying ? 'white' : 'var(--gold)',
          cursor: 'pointer',
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label={isPlaying ? 'Pausar música' : 'Reproducir música'}
        title={isPlaying ? 'Pausar música' : 'Reproducir música'}
      >
        <AnimatePresence mode="wait">
          {isPlaying ? (
            <motion.div key="vol"
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 90 }}>
              <Volume2 size={20} />
            </motion.div>
          ) : (
            <motion.div key="mute"
              initial={{ scale: 0, rotate: 90 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: -90 }}>
              {hasInteracted ? <VolumeX size={20} /> : <Music size={20} />}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Visualizer bars when playing */}
      <AnimatePresence>
        {isPlaying && (
          <motion.div
            className="flex items-end gap-0.5 h-4 px-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                className="w-1 rounded-full"
                style={{ background: 'var(--gold)', minHeight: 3 }}
                animate={{ height: [3, 10 + Math.random() * 6, 3] }}
                transition={{ duration: 0.45 + i * 0.1, repeat: Infinity, delay: i * 0.1 }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden YouTube player */}
      <div
        ref={containerRef}
        style={{ position: 'absolute', width: 1, height: 1, opacity: 0, pointerEvents: 'none', overflow: 'hidden', bottom: 0, right: 0 }}
        aria-hidden="true"
      >
        <div id="yt-music-player" />
      </div>
    </div>
  )
}
