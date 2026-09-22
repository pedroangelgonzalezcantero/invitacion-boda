'use client'

export default function MusicaError({ reset }: { reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: 'linear-gradient(180deg, #15131f 0%, #211a2f 55%, #120f18 100%)' }}>
      <div className="card-elegant p-8 text-center max-w-sm w-full" style={{ background: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.12)' }}>
        <div className="text-4xl mb-3">🎵</div>
        <p style={{ color: 'white', fontSize: '1.35rem' }}>Algo no ha sonado bien</p>
        <p className="mt-2" style={{ color: 'rgba(255,255,255,0.6)', fontFamily: "'Montserrat', sans-serif", fontSize: '0.85rem', lineHeight: 1.7 }}>
          No hemos podido abrir esta sección ahora mismo. Puedes volver a intentarlo en unos segundos.
        </p>
        <button className="btn-gold mt-5" onClick={reset}>Reintentar</button>
      </div>
    </div>
  )
}

