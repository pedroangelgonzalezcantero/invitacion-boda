'use client'

export default function DjMusicaError({ reset }: { reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: 'linear-gradient(180deg, #0f1016 0%, #141928 55%, #0a0c12 100%)' }}>
      <div className="card-elegant p-8 text-center max-w-sm w-full" style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.1)' }}>
        <div className="text-4xl mb-3">🎧</div>
        <p style={{ color: 'white', fontSize: '1.35rem' }}>La cabina no responde</p>
        <p className="mt-2" style={{ color: 'rgba(255,255,255,0.6)', fontFamily: "'Montserrat', sans-serif", fontSize: '0.85rem', lineHeight: 1.7 }}>
          No hemos podido abrir el panel del DJ ahora mismo. Puedes volver a intentarlo.
        </p>
        <button className="btn-gold mt-5" onClick={reset}>Reintentar</button>
      </div>
    </div>
  )
}

