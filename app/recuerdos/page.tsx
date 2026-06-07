'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Camera, Images } from 'lucide-react'
import UploadForm from '@/components/UploadForm'
import UploadGallery from '@/components/UploadGallery'

const BRIDE = process.env.NEXT_PUBLIC_BRIDE_NAME || 'Pedro Ángel'
const GROOM = process.env.NEXT_PUBLIC_GROOM_NAME || 'Mari'

export default function RecuerdosPage() {
  const [galleryKey, setGalleryKey]   = useState(0)
  const [activeTab, setActiveTab]     = useState<'upload' | 'gallery'>('upload')
  const refreshGallery = useCallback(() => {
    setGalleryKey(k => k + 1)
    setActiveTab('gallery')
  }, [])

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #faf8f5 0%, #f5ede0 100%)' }}>

      {/* ── Hero ── */}
      <div className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, var(--charcoal) 0%, #3d3228 100%)', padding: 'clamp(48px, 10vw, 88px) 24px clamp(40px, 8vw, 72px)' }}>
        {/* Decoraciones */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div style={{ position: 'absolute', top: -60, right: -60, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,169,110,0.12) 0%, transparent 70%)' }} />
          <div style={{ position: 'absolute', bottom: -40, left: -40, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,165,165,0.1) 0%, transparent 70%)' }} />
        </div>

        <motion.div className="max-w-lg mx-auto text-center relative z-10"
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <p className="text-xs tracking-[0.4em] uppercase mb-4"
            style={{ color: 'var(--gold)', fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}>
            Comparte tus momentos
          </p>
          <h1 style={{
            fontSize: 'clamp(2.4rem, 9vw, 4.5rem)',
            fontWeight: 300,
            color: 'white',
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            lineHeight: 1.1,
            letterSpacing: '0.02em',
          }}>
            {BRIDE}
            <span style={{ color: 'var(--gold)', fontStyle: 'italic', fontSize: '0.5em', display: 'inline-block', margin: '0 0.3em' }}>&</span>
            {GROOM}
          </h1>
          <p className="mt-4" style={{
            color: 'rgba(255,255,255,0.45)',
            fontFamily: "'Montserrat', sans-serif", fontWeight: 300,
            fontSize: '0.85rem', letterSpacing: '0.06em',
          }}>
            Sube tus fotos y vídeos del gran día 📸
          </p>
        </motion.div>
      </div>

      {/* ── Tabs ── */}
      <div className="max-w-lg mx-auto px-4 -mt-5 relative z-10">
        <div className="flex rounded-2xl overflow-hidden shadow-sm"
          style={{ background: 'white', border: '1px solid rgba(201,169,110,0.2)' }}>
          {[
            { id: 'upload',  label: 'Subir fotos',  icon: <Camera size={15} /> },
            { id: 'gallery', label: 'Ver galería',   icon: <Images size={15} /> },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as 'upload' | 'gallery')}
              className="flex-1 flex items-center justify-center gap-2 py-3 transition-all"
              style={{
                background: activeTab === tab.id ? 'var(--gold)' : 'transparent',
                color: activeTab === tab.id ? 'white' : 'var(--charcoal)',
                fontFamily: "'Montserrat', sans-serif", fontWeight: 300, fontSize: '0.78rem',
                letterSpacing: '0.08em', textTransform: 'uppercase', border: 'none', cursor: 'pointer',
                opacity: activeTab === tab.id ? 1 : 0.5,
              }}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-lg mx-auto px-4 py-6 pb-16">
        {activeTab === 'upload' ? (
          <motion.div key="upload" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <div className="card-elegant p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ width: 44, height: 44, background: 'rgba(201,169,110,0.1)', border: '1px solid rgba(201,169,110,0.3)' }}>
                  <Camera size={20} color="var(--gold)" />
                </div>
                <div>
                  <h2 style={{ color: 'var(--charcoal)', fontWeight: 400, fontSize: '1.25rem', fontFamily: "'Cormorant Garamond', serif" }}>
                    Sube tus fotos y vídeos
                  </h2>
                  <p style={{ color: 'var(--charcoal)', opacity: 0.4, fontFamily: "'Montserrat', sans-serif", fontWeight: 300, fontSize: '0.73rem' }}>
                    Desde el carrete o directamente con la cámara
                  </p>
                </div>
              </div>
              <UploadForm onUploaded={refreshGallery} />
            </div>
          </motion.div>
        ) : (
          <motion.div key="gallery" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <UploadGallery key={galleryKey} />
          </motion.div>
        )}
      </div>

      {/* ── Footer ── */}
      <div className="text-center pb-10 px-4">
        <p style={{ color: 'var(--charcoal)', opacity: 0.25, fontFamily: "'Montserrat', sans-serif", fontWeight: 300, fontSize: '0.72rem' }}>
          Hecho con amor ♥ · {BRIDE} & {GROOM}
        </p>
      </div>
    </div>
  )
}

