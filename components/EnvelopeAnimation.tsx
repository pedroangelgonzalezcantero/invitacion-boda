'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface EnvelopeAnimationProps {
  onOpen: () => void
  brideName: string
  groomName: string
}

export default function EnvelopeAnimation({ onOpen, brideName, groomName }: EnvelopeAnimationProps) {
  const [phase, setPhase] = useState<'idle' | 'opening' | 'reveal' | 'done'>('idle')

  const handleClick = () => {
    if (phase !== 'idle') return
    setPhase('opening')
    setTimeout(() => setPhase('reveal'), 1100)
    setTimeout(() => {
      setPhase('done')
      setTimeout(onOpen, 700)
    }, 2600)
  }

  const initials = `${brideName[0]}&${groomName[0]}`
  const isOpen = phase === 'opening' || phase === 'reveal'

  return (
    <AnimatePresence>
      {phase !== 'done' && (
        <motion.div
          key="envelope"
          className="fixed inset-0 z-50 overflow-hidden select-none"
          style={{ background: '#f7e4db', cursor: phase === 'idle' ? 'pointer' : 'default' }}
          exit={{ opacity: 0, transition: { duration: 0.8 } }}
          onClick={handleClick}
        >
          {/* ── Fold crease lines (SVG, stretches to fill screen) ── */}
          <svg
            className="absolute inset-0 pointer-events-none"
            style={{ width: '100%', height: '100%' }}
            viewBox="0 0 400 860"
            preserveAspectRatio="none"
          >
            <defs>
              {/* Very subtle paper texture gradient on body */}
              <linearGradient id="bodyTex" x1="0" y1="0" x2="400" y2="860" gradientUnits="userSpaceOnUse">
                <stop offset="0%"   stopColor="rgba(255,255,255,0.18)" />
                <stop offset="100%" stopColor="rgba(0,0,0,0)" />
              </linearGradient>
              <linearGradient id="leftTri" x1="0" y1="430" x2="200" y2="430" gradientUnits="userSpaceOnUse">
                <stop offset="0%"   stopColor="rgba(0,0,0,0.05)" />
                <stop offset="100%" stopColor="rgba(0,0,0,0)" />
              </linearGradient>
              <linearGradient id="rightTri" x1="400" y1="430" x2="200" y2="430" gradientUnits="userSpaceOnUse">
                <stop offset="0%"   stopColor="rgba(0,0,0,0.04)" />
                <stop offset="100%" stopColor="rgba(0,0,0,0)" />
              </linearGradient>
              <linearGradient id="botTri" x1="200" y1="860" x2="200" y2="430" gradientUnits="userSpaceOnUse">
                <stop offset="0%"   stopColor="rgba(0,0,0,0.06)" />
                <stop offset="100%" stopColor="rgba(0,0,0,0)" />
              </linearGradient>
            </defs>

            {/* Paper sheen */}
            <rect x="0" y="0" width="400" height="860" fill="url(#bodyTex)" />

            {/* Side/bottom shadow triangles */}
            <path d="M0 0 L0 860 L200 430 Z"       fill="url(#leftTri)" />
            <path d="M400 0 L400 860 L200 430 Z"   fill="url(#rightTri)" />
            <path d="M0 860 L400 860 L200 430 Z"   fill="url(#botTri)" />

            {/* Crease lines */}
            <line x1="0"   y1="0"   x2="200" y2="430" stroke="rgba(190,140,125,0.22)" strokeWidth="0.8" />
            <line x1="400" y1="0"   x2="200" y2="430" stroke="rgba(190,140,125,0.22)" strokeWidth="0.8" />
            <line x1="0"   y1="860" x2="200" y2="430" stroke="rgba(190,140,125,0.22)" strokeWidth="0.8" />
            <line x1="400" y1="860" x2="200" y2="430" stroke="rgba(190,140,125,0.22)" strokeWidth="0.8" />
          </svg>

          {/* ── TOP FLAP ─── triangle covering top half of screen ── */}
          <motion.div
            style={{
              position: 'absolute',
              top: 0, left: 0, right: 0,
              height: '50%',
              background: 'linear-gradient(178deg, #fdf3ee 0%, #edcfc4 100%)',
              clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
              transformOrigin: '50% 0%',
            }}
            animate={isOpen
              ? { scaleY: 0, transition: { duration: 0.9, ease: [0.4, 0, 0.55, 1] } }
              : {}}
          >
            {/* Inner highlight lines on flap */}
            <svg
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="pointer-events-none"
            >
              <line x1="2"  y1="0" x2="50" y2="100" stroke="rgba(255,255,255,0.45)" strokeWidth="0.4" />
              <line x1="98" y1="0" x2="50" y2="100" stroke="rgba(255,255,255,0.45)" strokeWidth="0.4" />
              <line x1="12" y1="0" x2="50" y2="100" stroke="rgba(255,255,255,0.2)"  strokeWidth="0.3" />
              <line x1="88" y1="0" x2="50" y2="100" stroke="rgba(255,255,255,0.2)"  strokeWidth="0.3" />
            </svg>
          </motion.div>

          {/* ── WAX SEAL ── */}
          <motion.div
            style={{
              position: 'absolute',
              left: '50%', top: '50%',
              transform: 'translate(-50%, -50%)',
              width:  'min(108px, 28vw)',
              height: 'min(108px, 28vw)',
              borderRadius: '50%',
              background: 'radial-gradient(circle at 36% 30%, #e0b24a 0%, #c99530 45%, #9e7020 100%)',
              boxShadow: '0 6px 28px rgba(140,85,20,0.42), 0 2px 6px rgba(140,85,20,0.25), inset 0 2px 5px rgba(255,255,255,0.22)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
            }}
            animate={isOpen
              ? { opacity: 0, scale: 0.7, transition: { duration: 0.32, delay: 0.08 } }
              : { scale: [1, 1.025, 1], transition: { duration: 3.5, repeat: Infinity, ease: 'easeInOut' } }}
          >
            {/* Concentric rings */}
            {[0.82, 0.66].map((r, i) => (
              <div key={i} style={{
                position: 'absolute',
                inset: `${(1 - r) * 50}%`,
                borderRadius: '50%',
                border: `${i === 0 ? 1 : 0.6}px solid rgba(255,255,255,${i === 0 ? 0.28 : 0.18})`,
              }} />
            ))}

            {/* Dot ring */}
            <svg
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
              viewBox="0 0 100 100"
              className="pointer-events-none"
            >
              {[...Array(20)].map((_, i) => {
                const a = (i * 18) * Math.PI / 180
                const r = 44
                return <circle key={i}
                  cx={50 + r * Math.cos(a)} cy={50 + r * Math.sin(a)}
                  r="1.3" fill="rgba(255,255,255,0.25)" />
              })}
            </svg>

            {/* Initials */}
            <span style={{
              fontFamily: "Georgia, 'Palatino Linotype', serif",
              fontStyle: 'italic',
              fontSize: 'min(26px, 6.5vw)',
              color: 'rgba(255,255,255,0.92)',
              letterSpacing: '2px',
              position: 'relative',
              zIndex: 1,
              textShadow: '0 1px 3px rgba(0,0,0,0.2)',
            }}>
              {initials}
            </span>
          </motion.div>

          {/* ── NAMES REVEAL after flap opens ── */}
          <AnimatePresence>
            {phase === 'reveal' && (
              <motion.div
                className="absolute inset-0 flex flex-col items-center justify-center gap-3 pointer-events-none"
                style={{ zIndex: 8 }}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.55 }}
              >
                {/* Ornament top */}
                <svg width="80" height="14" viewBox="0 0 80 14" fill="none">
                  <line x1="0" y1="7" x2="30" y2="7" stroke="rgba(180,120,90,0.4)" strokeWidth="0.6" />
                  <circle cx="40" cy="7" r="3.5" fill="none" stroke="rgba(180,120,90,0.5)" strokeWidth="0.7" />
                  <circle cx="40" cy="7" r="1.2" fill="rgba(180,120,90,0.6)" />
                  <line x1="50" y1="7" x2="80" y2="7" stroke="rgba(180,120,90,0.4)" strokeWidth="0.6" />
                </svg>

                <p style={{
                  fontFamily: "Georgia, 'Palatino Linotype', serif",
                  fontStyle: 'italic',
                  fontSize: 'clamp(1.5rem, 6vw, 2.2rem)',
                  color: 'rgba(100,60,40,0.82)',
                  letterSpacing: '0.04em',
                  textAlign: 'center',
                  lineHeight: 1.3,
                }}>
                  {brideName} &amp; {groomName}
                </p>

                {/* Ornament bottom */}
                <svg width="80" height="14" viewBox="0 0 80 14" fill="none">
                  <line x1="0" y1="7" x2="30" y2="7" stroke="rgba(180,120,90,0.4)" strokeWidth="0.6" />
                  <circle cx="40" cy="7" r="3.5" fill="none" stroke="rgba(180,120,90,0.5)" strokeWidth="0.7" />
                  <circle cx="40" cy="7" r="1.2" fill="rgba(180,120,90,0.6)" />
                  <line x1="50" y1="7" x2="80" y2="7" stroke="rgba(180,120,90,0.4)" strokeWidth="0.6" />
                </svg>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── TAP HINT ── */}
          <AnimatePresence>
            {phase === 'idle' && (
              <motion.div
                className="absolute left-0 right-0 flex flex-col items-center gap-2"
                style={{ bottom: 'max(44px, 7vh)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 1.3, duration: 0.8 }}
              >
                {/* Pulsing ring */}
                <motion.div
                  style={{ position: 'relative', width: 32, height: 32 }}
                >
                  <motion.div
                    style={{
                      position: 'absolute', inset: 0, borderRadius: '50%',
                      border: '1.5px solid rgba(170,110,80,0.4)',
                    }}
                    animate={{ scale: [1, 1.9], opacity: [0.7, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
                  />
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <circle cx="16" cy="16" r="14" stroke="rgba(170,110,80,0.35)" strokeWidth="1" />
                    <circle cx="16" cy="16" r="8"  stroke="rgba(170,110,80,0.5)"  strokeWidth="1" />
                    <circle cx="16" cy="16" r="2.5" fill="rgba(170,110,80,0.65)" />
                  </svg>
                </motion.div>

                <motion.p
                  style={{
                    fontSize: '0.56rem',
                    letterSpacing: '0.4em',
                    textTransform: 'uppercase',
                    color: 'rgba(160,100,75,0.5)',
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: 300,
                  }}
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                >
                  Toca para abrir
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
