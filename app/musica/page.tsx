import type { Metadata } from 'next'
import MusicGuestPage from '@/app/musica/_components/MusicGuestPage'

export const metadata: Metadata = {
  title: 'Música para la boda',
  description: 'Busca tu canción favorita y envíasela al DJ.',
  robots: 'noindex, nofollow',
}

export default function MusicaPage() {
  return <MusicGuestPage />
}

