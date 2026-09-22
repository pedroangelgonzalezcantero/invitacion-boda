import type { Metadata } from 'next'
import DjMusicPage from '@/app/djMusica/_components/DjMusicPage'

export const metadata: Metadata = {
  title: 'Panel DJ · Música boda',
  description: 'Gestiona las peticiones musicales de la boda.',
  robots: 'noindex, nofollow',
}

export default function DjMusicaPage() {
  return <DjMusicPage />
}

