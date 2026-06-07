'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

interface CountdownTimerProps {
  targetDate: string
}

function calculateTimeLeft(targetDate: string): TimeLeft {
  const difference = new Date(targetDate).getTime() - new Date().getTime()
  if (difference <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  }
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <motion.div
      className="countdown-unit"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      style={{ minWidth: 0 }}
    >
      <div
        className="card-elegant flex items-center justify-center"
        style={{
          width: 'clamp(58px, 17vw, 80px)',
          height: 'clamp(58px, 17vw, 80px)',
          borderRadius: 12,
          background: 'rgba(255,255,255,0.9)',
          flexShrink: 0,
        }}
      >
        <motion.span
          key={value}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            fontSize: 'clamp(1.4rem, 5vw, 2.2rem)',
            fontWeight: 300,
            color: 'var(--gold)',
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            lineHeight: 1,
          }}
        >
          {String(value).padStart(2, '0')}
        </motion.span>
      </div>
      <span
        className="mt-2 uppercase"
        style={{
          fontSize: 'clamp(0.5rem, 2vw, 0.7rem)',
          letterSpacing: '0.15em',
          color: 'var(--charcoal)',
          opacity: 0.6,
          fontFamily: "'Montserrat', sans-serif",
          fontWeight: 300,
        }}
      >
        {label}
      </span>
    </motion.div>
  )
}

export default function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setTimeLeft(calculateTimeLeft(targetDate))
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate))
    }, 1000)
    return () => clearInterval(timer)
  }, [targetDate])

  const isWeddingDay =
    mounted &&
    new Date(targetDate).toDateString() === new Date().toDateString()

  const isPast = mounted && new Date(targetDate) < new Date()

  if (isPast) {
    return (
      <div className="text-center py-8">
        <p
          className="text-3xl italic"
          style={{ color: 'var(--gold)', fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 300 }}
        >
          ¡Ya somos marido y mujer! 💍
        </p>
      </div>
    )
  }

  if (isWeddingDay) {
    return (
      <div className="text-center py-8">
        <motion.p
          className="text-3xl italic"
          style={{ color: 'var(--gold)', fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 300 }}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          ¡Hoy es el gran día! 🎊
        </motion.p>
      </div>
    )
  }

  const separator = (
    <span
      style={{
        fontSize: 'clamp(1.2rem, 4vw, 2rem)',
        color: 'var(--gold-light)',
        marginTop: 'clamp(10px, 3vw, 16px)',
        flexShrink: 0,
        lineHeight: 1,
      }}
    >
      :
    </span>
  )

  return (
    <div className="flex flex-col items-center gap-4" style={{ width: '100%' }}>
      <p
        className="text-sm tracking-[0.2em] uppercase mb-2"
        style={{ color: 'var(--charcoal)', opacity: 0.5, fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}
      >
        Faltan
      </p>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          gap: 'clamp(4px, 2vw, 14px)',
          width: '100%',
          maxWidth: 380,
          padding: '0 8px',
          boxSizing: 'border-box',
        }}
      >
        {mounted ? (
          <>
            <CountdownUnit value={timeLeft.days} label="Días" />
            {separator}
            <CountdownUnit value={timeLeft.hours} label="Horas" />
            {separator}
            <CountdownUnit value={timeLeft.minutes} label="Min" />
            {separator}
            <CountdownUnit value={timeLeft.seconds} label="Seg" />
          </>
        ) : (
          <>
            {['Días', 'Horas', 'Min', 'Seg'].map((label, i) => (
              <React.Fragment key={label}>
                {i > 0 && separator}
                <CountdownUnit value={0} label={label} />
              </React.Fragment>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
