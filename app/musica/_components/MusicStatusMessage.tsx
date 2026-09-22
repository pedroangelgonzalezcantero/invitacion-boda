'use client'

import { AnimatePresence, motion } from 'framer-motion'

interface MusicStatusMessageProps {
  tone: 'success' | 'error'
  title: string
  message: string
}

export default function MusicStatusMessage({ tone, title, message }: MusicStatusMessageProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="rounded-[24px] p-4 border"
        style={{
          background: tone === 'success' ? 'rgba(255,255,255,0.88)' : 'rgba(255,249,249,0.95)',
          borderColor: tone === 'success' ? 'rgba(201,169,110,0.24)' : 'rgba(214,125,125,0.24)',
          boxShadow: '0 14px 34px rgba(69,52,38,0.08)',
        }}
      >
        <p style={{ color: tone === 'success' ? 'var(--charcoal)' : '#7a2e33', fontSize: '1.05rem' }}>{title}</p>
        <p className="mt-1" style={{ color: 'rgba(44,44,44,0.68)', fontFamily: "'Montserrat', sans-serif", fontSize: '0.82rem', lineHeight: 1.65 }}>
          {message}
        </p>
      </motion.div>
    </AnimatePresence>
  )
}


