'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { XCircle, User, Baby } from 'lucide-react'

interface Stats {
  declined: number
  adults: number
  children: number
}

export default function RSVPStats() {
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.json())
      .then((d: Stats) => setStats(d))
      .catch(() => {/* silencioso */})
  }, [])

  // No mostrar nada si no hay datos o todo es 0
  if (!stats || (stats.declined === 0 && stats.adults === 0 && stats.children === 0)) return null

  const items = [
    { icon: <XCircle size={18} />, value: stats.declined,  label: 'No asistirán', color: 'var(--rose-dark)' },
    { icon: <User    size={18} />, value: stats.adults,    label: 'Adultos',       color: 'var(--gold)'      },
    { icon: <Baby    size={18} />, value: stats.children,  label: 'Niños',         color: '#7b8fa1'          },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="w-full max-w-sm mx-auto mt-6"
    >
      <p className="text-center text-xs tracking-[0.2em] uppercase mb-3"
        style={{ color: 'var(--charcoal)', opacity: 0.35, fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}>
        Respuestas recibidas
      </p>
      <div className="grid grid-cols-3 gap-3">
        {items.map(item => (
          <div key={item.label}
            className="card-elegant p-3 flex flex-col items-center gap-1 text-center">
            <div style={{ color: item.color }}>{item.icon}</div>
            <span style={{ fontSize: '1.6rem', fontWeight: 300, color: 'var(--charcoal)', fontFamily: "'Cormorant Garamond', Georgia, serif", lineHeight: 1 }}>
              {item.value}
            </span>
            <span style={{ fontSize: '0.62rem', fontFamily: "'Montserrat', sans-serif", fontWeight: 300, color: 'var(--charcoal)', opacity: 0.45, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

