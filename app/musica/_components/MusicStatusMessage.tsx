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
        className="rounded-[24px] border p-4"
        style={{
          background: tone === 'success' ? '#f4effa' : '#fff3f5',
          borderColor: tone === 'success' ? '#e4d6ee' : '#f0d5dc',
          boxShadow: '0 14px 34px rgba(49,36,68,0.07)',
        }}
      >
        <p style={{ color: tone === 'success' ? '#49355e' : '#7a2e43', fontSize: '1.05rem' }}>{title}</p>
        <p className="mt-1" style={{ color: '#716777', fontFamily: "'Montserrat', sans-serif", fontSize: '0.82rem', lineHeight: 1.65 }}>
          {message}
        </p>
      </motion.div>
    </AnimatePresence>
  )
}

