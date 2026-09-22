'use client'

interface DjSearchFiltersProps {
  tab: 'queue' | 'history'
  historySearch: string
  historyFilter: 'all' | 'today' | 'hours' | 'top' | 'repeated'
  onTabChange: (tab: 'queue' | 'history') => void
  onSearchChange: (value: string) => void
  onFilterChange: (value: 'all' | 'today' | 'hours' | 'top' | 'repeated') => void
}

const filterOptions: Array<{ value: 'all' | 'today' | 'hours' | 'top' | 'repeated'; label: string }> = [
  { value: 'all', label: 'Todo' },
  { value: 'today', label: 'Hoy' },
  { value: 'hours', label: 'Últimas horas' },
  { value: 'top', label: 'Más pedidas' },
  { value: 'repeated', label: 'Repetidas' },
]

export default function DjSearchFilters({
  tab,
  historySearch,
  historyFilter,
  onTabChange,
  onSearchChange,
  onFilterChange,
}: DjSearchFiltersProps) {
  return (
    <div className="rounded-[26px] border p-4 flex flex-col gap-4" style={{ background: 'rgba(255,255,255,0.9)', borderColor: 'rgba(201,169,110,0.14)', boxShadow: '0 14px 32px rgba(69,52,38,0.06)' }}>
      <div className="flex gap-2">
        {(['queue', 'history'] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onTabChange(item)}
            className="rounded-full px-4 py-2"
            style={{
              background: tab === item ? 'var(--gold)' : 'rgba(255,255,255,0.04)',
              color: tab === item ? 'white' : 'rgba(44,44,44,0.72)',
              border: '1px solid rgba(201,169,110,0.12)',
              fontFamily: "'Montserrat', sans-serif",
              fontSize: '0.76rem',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            {item === 'queue' ? 'Cola' : 'Histórico'}
          </button>
        ))}
      </div>

      {tab === 'history' && (
        <>
          <input
            value={historySearch}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Buscar artista o canción…"
            className="w-full rounded-2xl border px-4 py-3"
            style={{
              background: 'rgba(255,255,255,0.95)',
              borderColor: 'rgba(255,255,255,0.16)',
              color: 'var(--charcoal)',
              fontFamily: "'Montserrat', sans-serif",
              outline: 'none',
            }}
          />
          <div className="flex flex-wrap gap-2">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => onFilterChange(option.value)}
                className="rounded-full px-3 py-2"
                style={{
                  background: historyFilter === option.value ? 'rgba(201,169,110,0.22)' : 'rgba(255,255,255,0.04)',
                  color: historyFilter === option.value ? '#9a7741' : 'rgba(44,44,44,0.64)',
                  border: '1px solid rgba(201,169,110,0.12)',
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: '0.74rem',
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}


