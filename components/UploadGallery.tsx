'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { X, Play, RefreshCw } from 'lucide-react'

interface Upload {
  id: string
  file_url: string      // Drive view URL
  storage_path: string  // Drive fileId
  file_type: 'image' | 'video'
  file_name: string | null
  created_at: string
}

export default function UploadGallery() {
  const [uploads, setUploads]   = useState<Upload[]>([])
  const [loading, setLoading]   = useState(true)
  const [selected, setSelected] = useState<Upload | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchUploads = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true)
    const { data } = await supabase
      .from('uploads')
      .select('id,file_url,storage_path,file_type,file_name,created_at')
      .order('created_at', { ascending: false })
      .limit(200)
    if (data) setUploads(data as Upload[])
    setLoading(false)
    setRefreshing(false)
  }, [])

  useEffect(() => {
    fetchUploads()
    const interval = setInterval(() => fetchUploads(), 30_000)
    return () => clearInterval(interval)
  }, [fetchUploads])

  // URL del thumbnail de Drive
  const thumbUrl = (u: Upload) =>
    `https://drive.google.com/thumbnail?id=${u.storage_path}&sz=w400`

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="aspect-square rounded-2xl"
            style={{ background: 'rgba(201,169,110,0.08)', animation: 'pulse 1.5s ease-in-out infinite' }} />
        ))}
      </div>
    )
  }

  if (uploads.length === 0) {
    return (
      <div className="text-center py-12 rounded-2xl"
        style={{ border: '1px dashed rgba(201,169,110,0.2)', background: 'rgba(201,169,110,0.03)' }}>
        <p style={{ fontSize: 40, marginBottom: 12 }}>📷</p>
        <p style={{ color: 'var(--charcoal)', opacity: 0.35, fontFamily: "'Montserrat', sans-serif", fontWeight: 300, fontSize: '0.85rem' }}>
          Sé el primero en compartir un recuerdo
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <p style={{ color: 'var(--charcoal)', opacity: 0.4, fontFamily: "'Montserrat', sans-serif", fontWeight: 300, fontSize: '0.75rem' }}>
          {uploads.length} {uploads.length === 1 ? 'recuerdo' : 'recuerdos'}
        </p>
        <button onClick={() => fetchUploads(true)} disabled={refreshing}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gold)', padding: 4 }}>
          <RefreshCw size={14} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {uploads.map((upload, i) => (
          <motion.div key={upload.id}
            initial={{ opacity: 0, scale: 0.93 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: Math.min(i * 0.05, 0.4) }}
            className="relative overflow-hidden cursor-pointer group"
            style={{ aspectRatio: '1/1', borderRadius: 16, background: 'rgba(201,169,110,0.08)' }}
            onClick={() => setSelected(upload)}
          >
            {/* Thumbnail — Drive genera thumbnails para imágenes y vídeos */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={thumbUrl(upload)}
              alt={upload.file_name ?? ''}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
            />

            {/* Icono play para vídeos */}
            {upload.file_type === 'video' && (
              <div className="absolute inset-0 flex items-center justify-center"
                style={{ background: 'rgba(0,0,0,0.3)' }}>
                <div className="rounded-full flex items-center justify-center"
                  style={{ width: 44, height: 44, background: 'rgba(255,255,255,0.9)' }}>
                  <Play size={20} color="var(--charcoal)" fill="var(--charcoal)" style={{ marginLeft: 2 }} />
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.93)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
          >
            <motion.div
              className="relative w-full max-w-lg"
              initial={{ scale: 0.88, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.88, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 26 }}
              onClick={e => e.stopPropagation()}
            >
              {selected.file_type === 'image' ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={selected.file_url} alt=""
                  className="w-full rounded-2xl" style={{ maxHeight: '80vh', objectFit: 'contain' }} />
              ) : (
                <iframe
                  src={selected.file_url}
                  className="w-full rounded-2xl"
                  style={{ height: '60vw', maxHeight: '70vh', border: 'none' }}
                  allow="autoplay"
                />
              )}

              <p className="mt-3 text-center" style={{ color: 'rgba(255,255,255,0.25)', fontFamily: "'Montserrat', sans-serif", fontWeight: 300, fontSize: '0.7rem' }}>
                {new Date(selected.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
              </p>

              <button onClick={() => setSelected(null)}
                className="absolute -top-3 -right-3 rounded-full p-2 flex items-center justify-center"
                style={{ background: 'var(--gold)', color: 'white' }}>
                <X size={18} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
