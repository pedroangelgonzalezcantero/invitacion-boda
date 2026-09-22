'use client'

import { DjStatsDto } from '@/lib/music/types'

export default function DjStatsCards({ stats }: { stats: DjStatsDto | null }) {
  if (!stats) return null

  const items = [
    {
      label: 'Canciones solicitadas',
      value: stats.totalRequests,
      tone: '#f3d58f',
    },
    {
      label: 'Canciones reproducidas',
      value: stats.totalPlayedSongs,
      tone: '#95dfbc',
    },
    {
      label: 'Canciones repetidas',
      value: stats.repeatedSongs,
      tone: '#c7b2ff',
    },
    {
      label: 'Más pedida',
      value: stats.topSong ? `${stats.topSong.songName} · ${stats.topSong.requestCount}` : '—',
      tone: '#f7f7f7',
      small: true,
    },
  ]

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
      {items.map((item) => (
        <div key={item.label} className="rounded-[24px] border p-4" style={{ background: 'rgba(255,255,255,0.88)', borderColor: 'rgba(201,169,110,0.14)', boxShadow: '0 14px 32px rgba(69,52,38,0.06)' }}>
          <p style={{ color: item.tone, fontSize: item.small ? '0.95rem' : '1.8rem', lineHeight: 1.2 }}>{item.value}</p>
          <p className="mt-2" style={{ color: 'rgba(44,44,44,0.5)', fontFamily: "'Montserrat', sans-serif", fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            {item.label}
          </p>
          {item.label === 'Más pedida' && stats.topSong && (
            <p className="mt-1" style={{ color: 'rgba(44,44,44,0.42)', fontFamily: "'Montserrat', sans-serif", fontSize: '0.72rem' }}>
              {stats.topSong.artistName}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}


