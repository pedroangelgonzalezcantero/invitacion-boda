'use client'

import { useState, useEffect } from 'react'
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
    >
      <div
        className="card-elegant flex items-center justify-center"
        style={{
          width: 72,
          height: 72,
          borderRadius: 12,
          background: 'rgba(255,255,255,0.9)',
        }}
      >
        <motion.span
          key={value}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            fontSize: '2rem',
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
        className="mt-2 text-xs tracking-[0.2em] uppercase"
        style={{ color: 'var(--charcoal)', opacity: 0.6, fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}
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

  return (
    <div className="flex flex-col items-center gap-4">
      <p
        className="text-sm tracking-[0.2em] uppercase mb-2"
        style={{ color: 'var(--charcoal)', opacity: 0.5, fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}
      >
        Faltan
      </p>
      <div className="flex items-start gap-4">
        {mounted ? (
          <>
            <CountdownUnit value={timeLeft.days} label="Días" />
            <span className="text-3xl mt-3" style={{ color: 'var(--gold-light)' }}>:</span>
            <CountdownUnit value={timeLeft.hours} label="Horas" />
            <span className="text-3xl mt-3" style={{ color: 'var(--gold-light)' }}>:</span>
            <CountdownUnit value={timeLeft.minutes} label="Min" />
            <span className="text-3xl mt-3" style={{ color: 'var(--gold-light)' }}>:</span>
            <CountdownUnit value={timeLeft.seconds} label="Seg" />
          </>
        ) : (
          <div className="flex gap-4">
            {['Días', 'Horas', 'Min', 'Seg'].map((label) => (
              <CountdownUnit key={label} value={0} label={label} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

