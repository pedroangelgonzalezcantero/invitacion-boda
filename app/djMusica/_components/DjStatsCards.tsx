'use client'

import { DjStatsDto } from '@/lib/music/types'

const LABEL_STYLE: React.CSSProperties = {
  color: 'rgba(44,44,44,0.5)',
  fontFamily: "'Montserrat', sans-serif",
  fontSize: '0.6rem',
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
}

/**
 * Estadísticas compactas para móvil: 3 contadores en una fila
 * y la canción más pedida en una línea debajo.
 */
export default function DjStatsCards({ stats }: { stats: DjStatsDto | null }) {
  if (!stats) return null

  const counters = [
    { label: 'Solicitadas', value: stats.totalRequests,    tone: '#a8823a' },
    { label: 'Sonadas',     value: stats.totalPlayedSongs, tone: '#3f8f6a' },
    { label: 'Repetidas',   value: stats.repeatedSongs,    tone: '#7a5fc9' },
  ]

  const cardStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.9)',
    borderColor: 'rgba(201,169,110,0.16)',
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-3 gap-2">
        {counters.map((item) => (
          <div key={item.label} className="rounded-2xl border px-3 py-2 text-center" style={cardStyle}>
            <p style={{ color: item.tone, fontSize: '1.25rem', lineHeight: 1.1, fontWeight: 500 }}>{item.value}</p>
            <p className="mt-0.5" style={LABEL_STYLE}>{item.label}</p>
          </div>
        ))}
      </div>

      {stats.topSong && (
        <div className="rounded-2xl border px-3 py-2 flex items-center gap-2 min-w-0" style={cardStyle}>
          <span className="shrink-0" style={LABEL_STYLE}>Más pedida</span>
          <p className="truncate min-w-0" style={{ color: 'rgba(44,44,44,0.85)', fontFamily: "'Montserrat', sans-serif", fontSize: '0.78rem' }}>
            {stats.topSong.songName}
            <span style={{ color: 'rgba(44,44,44,0.45)' }}> · {stats.topSong.artistName}</span>
          </p>
          <span className="ml-auto shrink-0 rounded-full px-2" style={{ background: 'rgba(201,169,110,0.15)', color: '#a8823a', fontFamily: "'Montserrat', sans-serif", fontSize: '0.7rem' }}>
            ×{stats.topSong.requestCount}
          </span>
        </div>
      )}
    </div>
  )
}
