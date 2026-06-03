'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface EnvelopeAnimationProps {
  onOpen: () => void
  brideName: string
  groomName: string
}

interface Particle {
  id: number
  x: number
  duration: number
  delay: number
  size: number
  opacity: number
  drift: number
}

export default function EnvelopeAnimation({ onOpen, brideName, groomName }: EnvelopeAnimationProps) {
  const [phase, setPhase] = useState<'idle' | 'opening' | 'done'>('idle')
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    const seed = [
      { x: 8,  duration: 7.2, delay: 0,   size: 3,   opacity: 0.5, drift: 18  },
      { x: 18, duration: 9.1, delay: 1.2, size: 2,   opacity: 0.35, drift: -25 },
      { x: 28, duration: 6.8, delay: 2.5, size: 4,   opacity: 0.45, drift: 15  },
      { x: 37, duration: 8.3, delay: 0.7, size: 2.5, opacity: 0.4, drift: -20  },
      { x: 48, duration: 7.5, delay: 3.1, size: 3.5, opacity: 0.55, drift: 22  },
      { x: 55, duration: 9.8, delay: 1.8, size: 2,   opacity: 0.3, drift: -15  },
      { x: 63, duration: 6.4, delay: 4.2, size: 3,   opacity: 0.45, drift: 18  },
      { x: 72, duration: 8.7, delay: 0.4, size: 4.5, opacity: 0.5, drift: -28  },
      { x: 80, duration: 7.1, delay: 2.9, size: 2.5, opacity: 0.4, drift: 20  },
      { x: 88, duration: 9.3, delay: 1.5, size: 3,   opacity: 0.35, drift: -12 },
      { x: 12, duration: 8.0, delay: 5.0, size: 2,   opacity: 0.3, drift: 14  },
      { x: 42, duration: 7.6, delay: 3.7, size: 3.5, opacity: 0.45, drift: -22 },
      { x: 58, duration: 6.9, delay: 6.0, size: 2.5, opacity: 0.4, drift: 16  },
      { x: 75, duration: 8.4, delay: 4.5, size: 4,   opacity: 0.5, drift: -19  },
      { x: 92, duration: 7.8, delay: 2.2, size: 2,   opacity: 0.35, drift: 24  },
    ]
    setParticles(seed.map((p, i) => ({ ...p, id: i })))
  }, [])

  const handleClick = () => {
    if (phase !== 'idle') return
    setPhase('opening')
    setTimeout(() => setPhase('letter'), 1300)
    setTimeout(() => {
      setPhase('done')
      setTimeout(onOpen, 750)
    }, 2900)
  }

  const initials = `${brideName[0]}${groomName[0]}`
  const isOpening = phase === 'opening' || phase === 'letter'

  return (
    <AnimatePresence>
      {phase !== 'done' && (
        <motion.div
          key="envelope-screen"
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
          style={{
            background: 'linear-gradient(155deg, #0d1b2a 0%, #1a2744 45%, #0f2350 100%)',
          }}
          exit={{ opacity: 0, scale: 1.04, transition: { duration: 0.85, ease: 'easeInOut' } }}
        >
          {/* ── Subtle noise texture overlay ── */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              opacity: 0.04,
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
              backgroundSize: '200px',
            }}
          />

          {/* ── Floating gold particles ── */}
          {particles.map(p => (
            <motion.div
              key={p.id}
              className="absolute pointer-events-none rounded-full"
              style={{
                left: `${p.x}%`,
                width: p.size,
                height: p.size,
                background: `rgba(201,169,110,${p.opacity})`,
                boxShadow: `0 0 ${p.size * 2}px rgba(201,169,110,${p.opacity * 0.6})`,
              }}
              animate={{
                y: ['105vh', '-8vh'],
                x: [0, p.drift, 0],
                opacity: [0, p.opacity, p.opacity, 0],
              }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          ))}

          {/* ── Central soft glow ── */}
          <div
            className="absolute pointer-events-none"
            style={{
              width: 'min(480px, 90vw)',
              height: 'min(480px, 90vw)',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(201,169,110,0.07) 0%, transparent 70%)',
            }}
          />

          {/* ── Vignette ── */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse 85% 85% at 50% 50%, transparent 38%, rgba(0,0,0,0.45) 100%)',
            }}
          />

          {/* ── Top heading ── */}
          <motion.div
            className="absolute flex flex-col items-center gap-2"
            style={{ top: 'max(40px, 6vh)' }}
            initial={{ opacity: 0, y: -24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.9, ease: 'easeOut' }}
          >
            <p style={{
              fontSize: '0.52rem',
              letterSpacing: '0.45em',
              textTransform: 'uppercase',
              color: 'rgba(201,169,110,0.55)',
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 300,
            }}>
              Invitación de boda
            </p>
            <p style={{
              fontSize: 'clamp(1.1rem, 4vw, 1.5rem)',
              fontFamily: "Georgia, 'Palatino Linotype', serif",
              fontStyle: 'italic',
              color: 'rgba(255,255,255,0.65)',
              letterSpacing: '0.06em',
            }}>
              {brideName} &amp; {groomName}
            </p>
            <motion.div
              style={{ width: 48, height: 1, background: 'linear-gradient(90deg, transparent, rgba(201,169,110,0.5), transparent)' }}
            />
          </motion.div>

          {/* ── Envelope + Letter container ── */}
          <motion.div
            className="relative"
            style={{
              width: 'min(300px, 82vw)',
              perspective: '1400px',
            }}
            initial={{ opacity: 0, y: 70, scale: 0.86 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1.35, ease: [0.22, 0.9, 0.36, 1] }}
          >
            {/* ── Letter peeking out ── */}
            <AnimatePresence>
              {isOpening && (
                <motion.div
                  style={{
                    position: 'absolute',
                    left: 12, right: 12, bottom: 0,
                    background: 'linear-gradient(175deg, #fffef8 0%, #fdf5e6 100%)',
                    borderRadius: '4px 4px 0 0',
                    border: '0.5px solid rgba(201,169,110,0.25)',
                    borderBottom: 'none',
                    zIndex: 5,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    paddingBottom: 28,
                    gap: 8,
                    overflow: 'hidden',
                  }}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{
                    height: phase === 'letter' ? 230 : 65,
                    opacity: 1,
                    transition: { duration: 0.78, ease: [0.4, 0, 0.2, 1] },
                  }}
                >
                  {/* Inner frame on letter */}
                  <div style={{
                    position: 'absolute', inset: 10,
                    border: '0.5px solid rgba(201,169,110,0.18)',
                    borderBottom: 'none',
                    borderRadius: '2px 2px 0 0',
                    pointerEvents: 'none',
                  }} />

                  <motion.div
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7 }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: phase === 'letter' ? 1 : 0, y: phase === 'letter' ? 0 : 10 }}
                    transition={{ delay: 0.5, duration: 0.65 }}
                  >
                    {/* Top ornament */}
                    <svg width="70" height="14" viewBox="0 0 70 14" fill="none">
                      <line x1="0" y1="7" x2="25" y2="7" stroke="rgba(201,169,110,0.45)" strokeWidth="0.6" />
                      <circle cx="35" cy="7" r="3" fill="none" stroke="rgba(201,169,110,0.5)" strokeWidth="0.7" />
                      <circle cx="35" cy="7" r="1" fill="rgba(201,169,110,0.6)" />
                      <line x1="45" y1="7" x2="70" y2="7" stroke="rgba(201,169,110,0.45)" strokeWidth="0.6" />
                    </svg>

                    <p style={{
                      fontSize: '0.55rem',
                      letterSpacing: '0.3em',
                      textTransform: 'uppercase',
                      color: 'rgba(140,110,65,0.55)',
                      fontFamily: "'Montserrat', sans-serif",
                      fontWeight: 300,
                    }}>
                      os invitan a celebrar
                    </p>

                    <p style={{
                      fontFamily: "Georgia, 'Palatino Linotype', serif",
                      fontStyle: 'italic',
                      fontSize: 'clamp(1.25rem, 4vw, 1.55rem)',
                      color: 'rgba(75,55,30,0.88)',
                      textAlign: 'center',
                      letterSpacing: '0.03em',
                      lineHeight: 1.35,
                    }}>
                      {brideName} &amp; {groomName}
                    </p>

                    {/* Bottom ornament */}
                    <svg width="70" height="14" viewBox="0 0 70 14" fill="none">
                      <line x1="0" y1="7" x2="25" y2="7" stroke="rgba(201,169,110,0.45)" strokeWidth="0.6" />
                      <circle cx="35" cy="7" r="3" fill="none" stroke="rgba(201,169,110,0.5)" strokeWidth="0.7" />
                      <circle cx="35" cy="7" r="1" fill="rgba(201,169,110,0.6)" />
                      <line x1="45" y1="7" x2="70" y2="7" stroke="rgba(201,169,110,0.45)" strokeWidth="0.6" />
                    </svg>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Envelope SVG ── */}
            <motion.div
              style={{ position: 'relative', zIndex: 10 }}
              animate={phase === 'letter'
                ? { y: 55, transition: { duration: 0.65, delay: 0.2, ease: [0.4, 0, 0.2, 1] } }
                : {}}
              onClick={handleClick}
              className={phase === 'idle' ? 'cursor-pointer' : 'cursor-default'}
              whileHover={phase === 'idle' ? { scale: 1.025, y: -6 } : {}}
              transition={{ type: 'spring', stiffness: 280, damping: 22 }}
            >
              <svg
                viewBox="0 0 300 420"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-auto"
                style={{
                  filter: `
                    drop-shadow(0 32px 64px rgba(0,0,0,0.55))
                    drop-shadow(0 10px 24px rgba(0,0,0,0.35))
                    drop-shadow(0 2px 6px rgba(201,169,110,0.12))
                  `,
                }}
              >
                <defs>
                  {/* Envelope body */}
                  <linearGradient id="envBody2" x1="0" y1="0" x2="0" y2="420" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#fefcf4" />
                    <stop offset="60%" stopColor="#f9f1e0" />
                    <stop offset="100%" stopColor="#f3e7d0" />
                  </linearGradient>

                  {/* Flap */}
                  <linearGradient id="flapGrad2" x1="150" y1="0" x2="150" y2="195" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#faf6ed" />
                    <stop offset="100%" stopColor="#ebe0cc" />
                  </linearGradient>

                  {/* Side shadows */}
                  <linearGradient id="leftSide2" x1="0" y1="210" x2="150" y2="210" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="rgba(0,0,0,0.055)" />
                    <stop offset="100%" stopColor="rgba(0,0,0,0)" />
                  </linearGradient>
                  <linearGradient id="rightSide2" x1="300" y1="210" x2="150" y2="210" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="rgba(0,0,0,0.04)" />
                    <stop offset="100%" stopColor="rgba(0,0,0,0)" />
                  </linearGradient>
                  <linearGradient id="botSide2" x1="150" y1="420" x2="150" y2="255" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="rgba(0,0,0,0.055)" />
                    <stop offset="100%" stopColor="rgba(0,0,0,0)" />
                  </linearGradient>

                  {/* Wax seal — deep navy */}
                  <radialGradient id="sealGrad" cx="38%" cy="32%" r="72%">
                    <stop offset="0%" stopColor="#2e4878" />
                    <stop offset="55%" stopColor="#1e3260" />
                    <stop offset="100%" stopColor="#111d3c" />
                  </radialGradient>
                  <radialGradient id="sealHighlight2" cx="28%" cy="24%" r="52%">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.22)" />
                    <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                  </radialGradient>
                  <radialGradient id="sealDepth2" cx="68%" cy="72%" r="55%">
                    <stop offset="0%" stopColor="rgba(0,0,0,0)" />
                    <stop offset="100%" stopColor="rgba(0,0,0,0.38)" />
                  </radialGradient>

                  <filter id="sealShadow2" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="2" dy="4" stdDeviation="6" floodColor="rgba(0,0,0,0.45)" />
                  </filter>

                  {/* Gold shimmer for seal ring */}
                  <linearGradient id="goldRing" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#e8c97a" />
                    <stop offset="40%" stopColor="#c9a96e" />
                    <stop offset="70%" stopColor="#f0d898" />
                    <stop offset="100%" stopColor="#c9a96e" />
                  </linearGradient>
                </defs>

                {/* ── Body ── */}
                <rect x="0" y="0" width="300" height="420" rx="6" fill="url(#envBody2)" />

                {/* Linen texture lines */}
                {[...Array(21)].map((_, i) => (
                  <line
                    key={i}
                    x1="0" y1={20 * i + 5}
                    x2="300" y2={20 * i + 5}
                    stroke="rgba(160,135,95,0.05)"
                    strokeWidth="0.5"
                  />
                ))}

                {/* ── Fold triangles ── */}
                <path d="M0 0 L0 420 L150 252 Z" fill="url(#leftSide2)" />
                <path d="M300 0 L300 420 L150 252 Z" fill="url(#rightSide2)" />
                <path d="M0 420 L300 420 L150 252 Z" fill="url(#botSide2)" />

                {/* ── Crease lines ── */}
                <line x1="0" y1="420" x2="150" y2="252" stroke="rgba(170,145,105,0.32)" strokeWidth="0.8" />
                <line x1="300" y1="420" x2="150" y2="252" stroke="rgba(170,145,105,0.32)" strokeWidth="0.8" />
                <line x1="0" y1="0" x2="150" y2="195" stroke="rgba(170,145,105,0.2)" strokeWidth="0.6" />
                <line x1="300" y1="0" x2="150" y2="195" stroke="rgba(170,145,105,0.2)" strokeWidth="0.6" />

                {/* ── TOP FLAP ── */}
                <motion.g
                  style={{ transformOrigin: '150px 0px' }}
                  animate={isOpening
                    ? { rotateX: -176, transition: { duration: 1.15, ease: [0.22, 0.9, 0.36, 1] } }
                    : {}}
                >
                  <path d="M0 0 L300 0 L150 195 Z" fill="url(#flapGrad2)" />
                  <path d="M0 0 L300 0 L150 195 Z" fill="none"
                    stroke="rgba(160,135,105,0.15)" strokeWidth="1" strokeLinejoin="round" />
                  {/* Inner flap highlight */}
                  <path d="M14 0 L286 0 L150 177 Z" fill="none"
                    stroke="rgba(255,255,255,0.32)" strokeWidth="0.7" />
                  {/* Second inner highlight */}
                  <path d="M28 0 L272 0 L150 157 Z" fill="none"
                    stroke="rgba(255,255,255,0.12)" strokeWidth="0.5" />
                </motion.g>

                {/* ── WAX SEAL ── */}
                <motion.g
                  style={{ transformOrigin: '150px 244px' }}
                  animate={isOpening
                    ? { opacity: 0, scale: 0.68, y: -8, transition: { duration: 0.38, delay: 0.14 } }
                    : {}}
                >
                  {/* Soft ambient shadow */}
                  <ellipse cx="153" cy="249" rx="46" ry="44" fill="rgba(0,0,0,0.18)" />

                  {/* Main seal disc */}
                  <circle cx="150" cy="244" r="44" fill="url(#sealGrad)" filter="url(#sealShadow2)" />
                  <circle cx="150" cy="244" r="44" fill="url(#sealDepth2)" />
                  <circle cx="150" cy="244" r="44" fill="url(#sealHighlight2)" />

                  {/* Gold outer ring */}
                  <circle cx="150" cy="244" r="40" fill="none" stroke="url(#goldRing)" strokeWidth="1.3" />

                  {/* Inner ring */}
                  <circle cx="150" cy="244" r="33" fill="none" stroke="rgba(201,169,110,0.35)" strokeWidth="0.8" />

                  {/* Gold dots */}
                  {[...Array(18)].map((_, i) => {
                    const a = (i * 20) * Math.PI / 180
                    return (
                      <circle key={i}
                        cx={150 + 37 * Math.cos(a)}
                        cy={244 + 37 * Math.sin(a)}
                        r="1.2"
                        fill="rgba(201,169,110,0.55)"
                      />
                    )
                  })}

                  {/* Radial tick marks */}
                  {[...Array(9)].map((_, i) => {
                    const a = (i * 40 + 20) * Math.PI / 180
                    return (
                      <line key={i}
                        x1={150 + 34 * Math.cos(a)} y1={244 + 34 * Math.sin(a)}
                        x2={150 + 40 * Math.cos(a)} y2={244 + 40 * Math.sin(a)}
                        stroke="rgba(201,169,110,0.38)"
                        strokeWidth="0.7"
                      />
                    )
                  })}

                  {/* Monogram */}
                  <text
                    x="150" y="254"
                    textAnchor="middle"
                    fill="rgba(220,185,110,0.92)"
                    fontSize="30"
                    fontFamily="Georgia, 'Palatino Linotype', serif"
                    fontStyle="italic"
                    letterSpacing="4"
                  >
                    {initials}
                  </text>

                  {/* Fine line under monogram */}
                  <line x1="135" y1="262" x2="165" y2="262" stroke="rgba(201,169,110,0.38)" strokeWidth="0.7" />
                </motion.g>

                {/* ── Names & date below seal ── */}
                <motion.g
                  animate={isOpening
                    ? { opacity: 0, transition: { duration: 0.28, delay: 0.08 } }
                    : {}}
                >
                  {/* Decorative lines */}
                  <line x1="55" y1="333" x2="115" y2="333" stroke="rgba(180,155,110,0.25)" strokeWidth="0.6" />
                  <line x1="185" y1="333" x2="245" y2="333" stroke="rgba(180,155,110,0.25)" strokeWidth="0.6" />
                  <circle cx="150" cy="333" r="2" fill="none" stroke="rgba(180,155,110,0.3)" strokeWidth="0.6" />

                  <text x="150" y="354"
                    textAnchor="middle"
                    fill="rgba(100,80,50,0.5)"
                    fontSize="13"
                    fontFamily="Georgia, 'Palatino Linotype', serif"
                    fontStyle="italic"
                    letterSpacing="0.5"
                  >
                    {brideName} &amp; {groomName}
                  </text>
                  <text x="150" y="374"
                    textAnchor="middle"
                    fill="rgba(100,80,50,0.3)"
                    fontSize="8.5"
                    fontFamily="'Montserrat', sans-serif"
                    letterSpacing="3.5"
                  >
                    28 · NOV · 2026
                  </text>
                </motion.g>

                {/* ── Outer border ── */}
                <rect x="0" y="0" width="300" height="420" rx="6" fill="none"
                  stroke="rgba(201,169,110,0.14)" strokeWidth="1" />
              </svg>
            </motion.div>
          </motion.div>

          {/* ── Tap hint ── */}
          <AnimatePresence>
            {phase === 'idle' && (
              <motion.div
                className="absolute flex flex-col items-center gap-3"
                style={{ bottom: 'max(40px, 6vh)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 1.6, duration: 0.8 }}
              >
                {/* Pulsing ring */}
                <motion.div
                  style={{ position: 'relative', width: 36, height: 36 }}
                  animate={{ scale: [1, 1.12, 1] }}
                  transition={{ duration: 2.2, repeat: Infinity }}
                >
                  {/* Outer pulse ring */}
                  <motion.div
                    style={{
                      position: 'absolute', inset: 0, borderRadius: '50%',
                      border: '1px solid rgba(201,169,110,0.4)',
                    }}
                    animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
                  />
                  <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                    <circle cx="18" cy="18" r="16" stroke="rgba(201,169,110,0.35)" strokeWidth="1" />
                    <circle cx="18" cy="18" r="9" stroke="rgba(201,169,110,0.5)" strokeWidth="1" />
                    <circle cx="18" cy="18" r="2.5" fill="rgba(201,169,110,0.7)" />
                  </svg>
                </motion.div>

                <motion.p
                  style={{
                    fontSize: '0.57rem',
                    letterSpacing: '0.38em',
                    textTransform: 'uppercase',
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
