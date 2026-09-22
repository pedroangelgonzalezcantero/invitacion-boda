/* eslint-disable @next/next/no-img-element */
'use client'

import { motion } from 'framer-motion'
import { DjQueueItemDto } from '@/lib/music/types'

interface DjQueueCardProps {
  item: DjQueueItemDto
  onMarkPlayed: (queueItemId: string) => void
  busy: boolean
}

function formatHour(value: string) {
  return new Date(value).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function DjQueueCard({ item, onMarkPlayed, busy }: DjQueueCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[28px] border p-4 md:p-5"
      style={{
        background: item.wasPlayedBefore ? 'linear-gradient(135deg, rgba(243,235,255,0.95) 0%, rgba(255,255,255,0.92) 100%)' : 'rgba(255,255,255,0.9)',
        borderColor: item.wasPlayedBefore ? 'rgba(196,164,255,0.25)' : 'rgba(201,169,110,0.14)',
        boxShadow: '0 16px 34px rgba(69,52,38,0.06)',
      }}
    >
      <div className="flex gap-4">
        <div className="overflow-hidden rounded-2xl flex-shrink-0" style={{ width: 76, height: 76, background: 'rgba(255,255,255,0.06)' }}>
          {item.albumImageUrl ? (
            <img src={item.albumImageUrl} alt={item.songName} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ color: 'white' }}>♪</div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap gap-2 mb-2">
            {item.wasPlayedBefore && (
              <span className="rounded-full px-3 py-1" style={{ background: 'rgba(196,164,255,0.15)', color: '#8a67b6', fontFamily: "'Montserrat', sans-serif", fontSize: '0.7rem' }}>
                🔁 YA SONÓ — LA PIDEN DE NUEVO
              </span>
            )}
            {item.isRepeatedInQueue && (
              <span className="rounded-full px-3 py-1" style={{ background: 'rgba(201,169,110,0.16)', color: '#9a7741', fontFamily: "'Montserrat', sans-serif", fontSize: '0.7rem' }}>
                🔥 YA ESTÁ EN COLA — SOLICITADA DE NUEVO
              </span>
            )}
          </div>
          <p className="truncate" style={{ color: 'var(--charcoal)', fontSize: '1.2rem' }}>{item.songName}</p>
          <p className="truncate mt-1" style={{ color: 'rgba(44,44,44,0.72)', fontFamily: "'Montserrat', sans-serif", fontSize: '0.84rem' }}>{item.artistName}</p>
          <p className="mt-3" style={{ color: '#9a7741', fontFamily: "'Montserrat', sans-serif", fontSize: '0.8rem' }}>
            🔥 Solicitada {item.requestCount} {item.requestCount === 1 ? 'vez' : 'veces'}
          </p>
          <p className="mt-1" style={{ color: 'rgba(44,44,44,0.45)', fontFamily: "'Montserrat', sans-serif", fontSize: '0.76rem' }}>
            ⏱ Última petición: {formatHour(item.lastRequestedAt)}
          </p>
        </div>
      </div>

      <button className="btn-gold mt-4 w-full" onClick={() => onMarkPlayed(item.id)} disabled={busy}>
        {busy ? 'Marcando…' : '✓ REPRODUCIDA'}
      </button>
    </motion.div>
  )
}



