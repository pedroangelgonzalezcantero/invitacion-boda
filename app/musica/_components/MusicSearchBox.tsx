'use client'

import { Search } from 'lucide-react'

interface MusicSearchBoxProps {
  query: string
  onChange: (value: string) => void
  searching: boolean
}

export default function MusicSearchBox({ query, onChange, searching }: MusicSearchBoxProps) {
  return (
    <div className="rounded-[24px] border p-4 sm:rounded-[28px] sm:p-5" style={{ background: '#fff', borderColor: '#e9e3f0', boxShadow: '0 20px 48px rgba(39,26,54,0.14)' }}>
      <label htmlFor="music-search" className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em]"
        style={{ color: '#59436f', fontFamily: "'Montserrat', sans-serif" }}>
        <Search size={15} strokeWidth={2.4} />
        Busca tu canción
      </label>
      <div className="relative rounded-2xl focus-within:ring-4 focus-within:ring-fuchsia-100">
        <input
          id="music-search"
          type="search"
          value={query}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Ej. Quevedo Columbia, Dua Lipa, Houdini..."
          className="w-full rounded-2xl border border-[#e9e3f0] bg-[#faf9fc] py-4 pl-4 pr-24 text-sm transition-colors placeholder:text-[#aaa2b2] focus:border-[#a65bc4] focus:outline-none sm:pr-28"
          style={{
            color: '#30263b',
            fontFamily: "'Montserrat', sans-serif",
          }}
        />
        <div
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full px-2.5 py-1 text-[0.62rem] font-semibold sm:right-3"
          style={{ background: searching ? '#f2e8f7' : '#eee9f4', color: '#684481', fontFamily: "'Montserrat', sans-serif" }}
          aria-live="polite"
        >
          {searching ? 'Buscando…' : 'Spotify'}
        </div>
      </div>
    </div>
  )
}
