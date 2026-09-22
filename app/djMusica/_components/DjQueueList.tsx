'use client'

import DjQueueCard from '@/app/djMusica/_components/DjQueueCard'
import { DjQueueItemDto } from '@/lib/music/types'

interface DjQueueListProps {
  items: DjQueueItemDto[]
  busyId: string | null
  onMarkPlayed: (queueItemId: string) => void
}

export default function DjQueueList({ items, busyId, onMarkPlayed }: DjQueueListProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-[28px] border p-8 text-center" style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.1)' }}>
        <p style={{ color: 'white', fontSize: '1.2rem' }}>Sin canciones pendientes</p>
        <p className="mt-2" style={{ color: 'rgba(255,255,255,0.56)', fontFamily: "'Montserrat', sans-serif", fontSize: '0.82rem', lineHeight: 1.7 }}>
          Cuando los invitados envíen canciones, aparecerán aquí listas para sonar.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map((item) => (
        <DjQueueCard
          key={item.id}
          item={item}
          onMarkPlayed={onMarkPlayed}
          busy={busyId === item.id}
        />
      ))}
    </div>
  )
}

