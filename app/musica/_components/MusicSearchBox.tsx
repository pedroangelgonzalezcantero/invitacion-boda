'use client'

interface MusicSearchBoxProps {
  query: string
  onChange: (value: string) => void
  searching: boolean
}

export default function MusicSearchBox({ query, onChange, searching }: MusicSearchBoxProps) {
  return (
    <div className="card-elegant p-4 md:p-5" style={{ background: 'rgba(212,165,165,0.2)', borderColor: 'rgba(176,120,120,0.38)', boxShadow: '0 22px 60px rgba(69,52,38,0.14)' }}>
      <label htmlFor="music-search" className="block text-xs uppercase tracking-[0.35em] mb-3"
        style={{ color: 'var(--rose-dark)', fontFamily: "'Montserrat', sans-serif", fontWeight: 400 }}>
        Busca en Spotify
      </label>
      <div className="relative">
        <input
          id="music-search"
          value={query}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Ej. Quevedo Columbia, Dua Lipa, Houdini..."
          className="w-full rounded-2xl border px-4 py-4"
          style={{
            background: 'rgba(255,255,255,0.9)',
            borderColor: 'rgba(176,120,120,0.38)',
            color: 'var(--charcoal)',
            fontFamily: "'Montserrat', sans-serif",
            fontSize: '0.95rem',
            outline: 'none',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6)',
          }}
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs"
          style={{ color: searching ? 'var(--gold)' : 'rgba(44,44,44,0.45)', fontFamily: "'Montserrat', sans-serif" }}>
          {searching ? 'Buscando…' : 'Spotify'}
        </div>
      </div>
    </div>
  )
}

