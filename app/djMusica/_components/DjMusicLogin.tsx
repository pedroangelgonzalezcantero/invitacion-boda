'use client'

interface DjMusicLoginProps {
  token: string
  error: string
  loading: boolean
  onTokenChange: (value: string) => void
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
}

export default function DjMusicLogin({ token, error, loading, onTokenChange, onSubmit }: DjMusicLoginProps) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(180deg, #342f2c 0%, #43382f 42%, #1a1820 100%)' }}>
      <form onSubmit={onSubmit} className="card-elegant p-8 w-full max-w-sm" style={{ background: 'rgba(255,250,245,0.95)', borderColor: 'rgba(201,169,110,0.16)', boxShadow: '0 28px 70px rgba(0,0,0,0.24)' }}>
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">🎧</div>
          <h1 style={{ color: 'var(--charcoal)', fontSize: '2rem', fontWeight: 300 }}>Cabina DJ</h1>
          <p className="mt-2" style={{ color: 'rgba(44,44,44,0.58)', fontFamily: "'Montserrat', sans-serif", fontSize: '0.82rem', lineHeight: 1.65 }}>
            Introduce el token privado para gestionar la cola musical.
          </p>
        </div>

        <input
          type="password"
          value={token}
          onChange={(event) => onTokenChange(event.target.value)}
          placeholder="Token DJ"
          autoFocus
          className="w-full rounded-2xl border px-4 py-4"
          style={{
            background: 'rgba(255,255,255,0.95)',
            borderColor: 'rgba(255,255,255,0.16)',
            color: 'var(--charcoal)',
            fontFamily: "'Montserrat', sans-serif",
            outline: 'none',
          }}
        />

        {error && (
          <p className="mt-3 text-center" style={{ color: '#ffb2b2', fontFamily: "'Montserrat', sans-serif", fontSize: '0.8rem' }}>
            {error}
          </p>
        )}

        <button className="btn-gold mt-5 w-full" disabled={loading}>
          {loading ? 'Accediendo…' : 'Acceder al panel'}
        </button>
      </form>
    </div>
  )
}


