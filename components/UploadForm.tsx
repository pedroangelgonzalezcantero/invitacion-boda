'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { uploadToCloudinary, validateFileSize } from '@/lib/cloudinary'
import { Upload, X, CheckCircle, Film, AlertCircle, Camera } from 'lucide-react'

interface FileItem {
  id:       string
  file:     File
  status:   'pending' | 'uploading' | 'done' | 'error'
  progress: number
  error?:   string
  preview?: string
}

// ── Sube UN archivo a Cloudinary y lo guarda en Supabase ─────────────────────
async function uploadOne(
  item: FileItem,
  onProgress: (id: string, pct: number) => void,
  onStatus:   (id: string, status: FileItem['status'], error?: string) => void,
) {
  onStatus(item.id, 'uploading')
  try {
    const result = await uploadToCloudinary(item.file, (pct) => onProgress(item.id, pct))
    const { error: dbErr } = await supabase.from('uploads').insert({
      file_url:     result.secure_url,
      file_type:    result.resource_type === 'video' ? 'video' : 'image',
      file_name:    item.file.name,
      storage_path: result.public_id,
    })
    if (dbErr) console.warn('Supabase insert:', dbErr.message)
    onStatus(item.id, 'done')
    return true
  } catch (err) {
    onStatus(item.id, 'error', err instanceof Error ? err.message : 'Error desconocido')
    return false
  }
}

export default function UploadForm({ onUploaded }: { onUploaded?: () => void }) {
  const [files, setFiles]         = useState<FileItem[]>([])
  const [uploading, setUploading] = useState(false)
  const [allDone, setAllDone]     = useState(false)
  const galleryRef                = useRef<HTMLInputElement>(null)
  const cameraRef                 = useRef<HTMLInputElement>(null)

  const setProgress = (id: string, pct: number) =>
    setFiles(prev => prev.map(f => f.id === id ? { ...f, progress: pct } : f))

  const setStatus = (id: string, status: FileItem['status'], error?: string) =>
    setFiles(prev => prev.map(f => f.id === id ? { ...f, status, ...(error ? { error } : {}) } : f))

  const buildItem = (f: File): FileItem => {
    const id      = Math.random().toString(36).slice(2)
    const sizeErr = validateFileSize(f)
    if (sizeErr) return { id, file: f, status: 'error', progress: 0, error: sizeErr }
    const preview = f.type.startsWith('image/') ? URL.createObjectURL(f) : undefined
    return { id, file: f, status: 'pending', progress: 0, preview }
  }

  // Galería: añade archivos a la lista, el usuario pulsa "Subir"
  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const items = Array.from(e.target.files ?? []).map(buildItem)
    setFiles(prev => [...prev, ...items])
    e.target.value = ''
  }

  // Cámara: añade el archivo a la lista (igual que el carrete), el usuario decide cuándo subir
  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const items = Array.from(e.target.files ?? []).map(buildItem)
    setFiles(prev => [...prev, ...items])
    e.target.value = ''
  }

  const removeFile = (id: string) => {
    setFiles(prev => {
      const item = prev.find(f => f.id === id)
      if (item?.preview) URL.revokeObjectURL(item.preview)
      return prev.filter(f => f.id !== id)
    })
  }

  // Subida manual del carrete
  const handleUpload = async () => {
    const pending = files.filter(f => f.status === 'pending')
    if (pending.length === 0) return

    setUploading(true)
    let doneCount = 0
    for (const item of pending) {
      const ok = await uploadOne(item, setProgress, setStatus)
      if (ok) doneCount++
    }
    setUploading(false)
    if (doneCount > 0) { setAllDone(true); onUploaded?.() }
  }

  // ── Pantalla de éxito ─────────────────────────────────────────
  if (allDone) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="text-center py-10 flex flex-col items-center gap-4">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.1 }} style={{ fontSize: 64 }}>🎊</motion.div>
        <h3 style={{ fontSize: '1.8rem', color: 'var(--gold)', fontWeight: 300, fontStyle: 'italic', fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
          ¡Gracias por compartir!
        </h3>
        <p style={{ color: 'var(--charcoal)', opacity: 0.65, fontFamily: "'Montserrat', sans-serif", fontWeight: 300, fontSize: '0.88rem', maxWidth: 280, lineHeight: 1.7 }}>
          Tus fotos y vídeos forman parte de este día tan especial 💍
        </p>
        <button onClick={() => { setAllDone(false); setFiles([]) }}
          className="btn-gold mt-2" style={{ fontSize: '0.85rem' }}>
          Subir más fotos
        </button>
      </motion.div>
    )
  }

  const pendingCount = files.filter(f => f.status === 'pending').length

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Input galería (múltiple, manual) */}
      <input ref={galleryRef} type="file" multiple accept="image/*,video/*"
        onChange={handleGalleryChange} style={{ display: 'none' }} />

      {/* Input cámara: accept="image/*" + capture → abre cámara directamente en móvil */}
      <input ref={cameraRef} type="file" accept="image/*" capture="environment"
        onChange={handleCameraCapture} style={{ display: 'none' }} />

      {/* Botones de selección */}
      <div className="grid grid-cols-2 gap-3">
        <motion.button type="button" onClick={() => galleryRef.current?.click()} disabled={uploading}
          className="py-5 rounded-2xl flex flex-col items-center justify-center gap-2"
          style={{ border: '2px dashed rgba(201,169,110,0.4)', background: 'rgba(201,169,110,0.04)', color: 'var(--gold)', fontFamily: "'Montserrat', sans-serif", fontWeight: 300, fontSize: '0.78rem', cursor: 'pointer' }}
          whileHover={{ borderColor: 'var(--gold)', background: 'rgba(201,169,110,0.09)' }} whileTap={{ scale: 0.97 }}>
          <Upload size={22} /><span>Carrete</span>
          <span style={{ fontSize: '0.65rem', opacity: 0.5 }}>Fotos y vídeos</span>
        </motion.button>

        <motion.button type="button" onClick={() => cameraRef.current?.click()} disabled={uploading}
          className="py-5 rounded-2xl flex flex-col items-center justify-center gap-2"
          style={{ border: '2px solid rgba(201,169,110,0.35)', background: 'rgba(201,169,110,0.08)', color: 'var(--gold)', fontFamily: "'Montserrat', sans-serif", fontWeight: 300, fontSize: '0.78rem', cursor: 'pointer' }}
          whileHover={{ borderColor: 'var(--gold)', background: 'rgba(201,169,110,0.14)' }} whileTap={{ scale: 0.97 }}>
          <Camera size={22} />
          <span>Cámara</span>
          <span style={{ fontSize: '0.65rem', opacity: 0.5 }}>Foto al instante</span>
        </motion.button>
      </div>

      {/* Lista de archivos */}
      <AnimatePresence>
        {files.map(item => {
          const isUploading = item.status === 'uploading'
          const isDone      = item.status === 'done'
          const isError     = item.status === 'error'
          return (
            <motion.div key={item.id}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              className="flex items-center gap-3 p-3 rounded-xl"
              style={{ background: isDone ? 'rgba(92,158,106,0.06)' : isError ? 'rgba(192,57,43,0.05)' : 'rgba(201,169,110,0.05)', border: `1px solid ${isDone ? 'rgba(92,158,106,0.2)' : isError ? 'rgba(192,57,43,0.2)' : 'rgba(201,169,110,0.15)'}` }}>

              {/* Thumbnail / icono */}
              <div className="flex-shrink-0 rounded-xl overflow-hidden" style={{ width: 48, height: 48, background: 'rgba(201,169,110,0.1)' }}>
                {item.preview
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={item.preview} alt="" className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center"><Film size={20} color="var(--gold)" /></div>}
              </div>

              {/* Info + progreso */}
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm" style={{ color: 'var(--charcoal)', fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}>
                  {item.file.name}
                </p>
                <p className="text-xs" style={{ color: isError ? '#c0392b' : isDone ? '#5c9e6a' : 'rgba(44,44,44,0.45)', fontFamily: "'Montserrat', sans-serif" }}>
                  {isUploading ? `Subiendo… ${item.progress}%`
                    : isDone   ? '✓ Guardado'
                    : isError  ? `✗ ${item.error}`
                    : `${(item.file.size / 1024 / 1024).toFixed(1)} MB`}
                </p>
                {isUploading && (
                  <div className="mt-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(201,169,110,0.2)' }}>
                    <motion.div className="h-full rounded-full" style={{ background: 'var(--gold)' }}
                      animate={{ width: `${item.progress}%` }} transition={{ duration: 0.15 }} />
                  </div>
                )}
              </div>

              {!isUploading && !isDone && (
                <button onClick={() => removeFile(item.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, flexShrink: 0 }}>
                  <X size={16} color="rgba(44,44,44,0.35)" />
                </button>
              )}
              {isDone  && <CheckCircle size={18} color="#5c9e6a" style={{ flexShrink: 0 }} />}
              {isError && <AlertCircle size={18} color="#c0392b" style={{ flexShrink: 0 }} />}
            </motion.div>
          )
        })}
      </AnimatePresence>

      {/* Botón subir — solo para archivos del carrete */}
      {pendingCount > 0 && (
        <motion.button type="button" onClick={handleUpload} disabled={uploading}
          className="btn-gold w-full" style={{ opacity: uploading ? 0.7 : 1, fontSize: '0.95rem', padding: '14px 20px' }}
          whileTap={{ scale: 0.98 }}>
          {uploading ? 'Subiendo…' : `📤 Subir ${pendingCount} archivo${pendingCount > 1 ? 's' : ''}`}
        </motion.button>
      )}
    </div>
  )
}
