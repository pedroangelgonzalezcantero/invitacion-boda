/* eslint-disable @next/next/no-img-element */
'use client'

import { DjHistoryItemDto } from '@/lib/music/types'

function formatDateTime(value: string | null) {
  if (!value) return '—'

  return new Date(value).toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function DjHistoryList({ items }: { items: DjHistoryItemDto[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-[28px] border p-8 text-center" style={{ background: 'rgba(255,255,255,0.9)', borderColor: 'rgba(201,169,110,0.14)', boxShadow: '0 14px 32px rgba(69,52,38,0.06)' }}>
        <p style={{ color: 'var(--charcoal)', fontSize: '1.2rem' }}>Histórico vacío</p>
        <p className="mt-2" style={{ color: 'rgba(44,44,44,0.56)', fontFamily: "'Montserrat', sans-serif", fontSize: '0.82rem', lineHeight: 1.7 }}>
          Aquí verás todas las canciones que ya hayan sonado durante la fiesta.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map((item) => (
        <div key={item.id} className="rounded-[28px] border p-4 md:p-5" style={{ background: 'rgba(255,255,255,0.9)', borderColor: 'rgba(201,169,110,0.14)', boxShadow: '0 14px 32px rgba(69,52,38,0.06)' }}>
          <div className="flex gap-4">
            <div className="overflow-hidden rounded-2xl flex-shrink-0" style={{ width: 72, height: 72, background: 'rgba(255,255,255,0.06)' }}>
              {item.albumImageUrl ? (
                <img src={item.albumImageUrl} alt={item.songName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ color: 'white' }}>♪</div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate" style={{ color: 'var(--charcoal)', fontSize: '1.15rem' }}>{item.songName}</p>
              <p className="truncate mt-1" style={{ color: 'rgba(44,44,44,0.72)', fontFamily: "'Montserrat', sans-serif", fontSize: '0.84rem' }}>{item.artistName}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="rounded-full px-3 py-1" style={{ background: 'rgba(201,169,110,0.16)', color: '#9a7741', fontFamily: "'Montserrat', sans-serif", fontSize: '0.72rem' }}>
                  {item.requestCount} solicitudes
                </span>
                {item.requestedAgainAfterPlayedCount > 0 && (
                  <span className="rounded-full px-3 py-1" style={{ background: 'rgba(196,164,255,0.14)', color: '#8a67b6', fontFamily: "'Montserrat', sans-serif", fontSize: '0.72rem' }}>
                    🔁 Pedida de nuevo {item.requestedAgainAfterPlayedCount} veces
                  </span>
                )}
              </div>
              <p className="mt-3" style={{ color: 'rgba(44,44,44,0.45)', fontFamily: "'Montserrat', sans-serif", fontSize: '0.76rem' }}>
                ✓ Sonó el {formatDateTime(item.playedAt)}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}



