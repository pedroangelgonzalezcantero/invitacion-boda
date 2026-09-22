export default function DjMusicaLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: 'linear-gradient(180deg, #0f1016 0%, #141928 55%, #0a0c12 100%)' }}>
      <div className="card-elegant p-8 text-center max-w-sm w-full" style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.1)' }}>
        <div className="animate-pulse-gold mx-auto mb-4 rounded-full" style={{ width: 56, height: 56, background: 'rgba(201,169,110,0.18)' }} />
        <p style={{ color: 'white', fontSize: '1.3rem' }}>Abriendo cabina…</p>
        <p className="mt-2" style={{ color: 'rgba(255,255,255,0.55)', fontFamily: "'Montserrat', sans-serif", fontSize: '0.85rem' }}>
          Cargando la cola musical del evento.
        </p>
      </div>
    </div>
  )
}

