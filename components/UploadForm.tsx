'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { uploadToCloudinary, validateFileSize } from '@/lib/cloudinary'
import { Upload, X, CheckCircle, Film, AlertCircle, Camera, User } from 'lucide-react'

interface FileItem {
  id:       string
  file:     File
  status:   'pending' | 'uploading' | 'done' | 'error'
  progress: number
  error?:   string
  preview?: string
}

export default function UploadForm({ onUploaded }: { onUploaded?: () => void }) {
  const [files, setFiles]         = useState<FileItem[]>([])
  const [userName, setUserName]   = useState('')
  const [uploading, setUploading] = useState(false)
  const [allDone, setAllDone]     = useState(false)
  const galleryRef                = useRef<HTMLInputElement>(null)
  const cameraRef                 = useRef<HTMLInputElement>(null)

  const addFiles = (selected: File[]) => {
    const items: FileItem[] = selected.map(f => {
      const id      = Math.random().toString(36).slice(2)
      const sizeErr = validateFileSize(f)
      if (sizeErr) return { id, file: f, status: 'error' as const, progress: 0, error: sizeErr }
      const preview = f.type.startsWith('image/') ? URL.createObjectURL(f) : undefined
      return { id, file: f, status: 'pending' as const, progress: 0, preview }
    })
    setFiles(prev => [...prev, ...items])
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    addFiles(Array.from(e.target.files ?? []))
    e.target.value = ''
  }

  const removeFile = (id: string) => {
    setFiles(prev => {
      const item = prev.find(f => f.id === id)
      if (item?.preview) URL.revokeObjectURL(item.preview)
      return prev.filter(f => f.id !== id)
    })
  }

  const handleUpload = async () => {
    const pending = files.filter(f => f.status === 'pending')
    if (pending.length === 0) return

    setUploading(true)
    let doneCount = 0

    for (const item of files) {
      if (item.status !== 'pending') continue

      setFiles(prev => prev.map(f => f.id === item.id ? { ...f, status: 'uploading', progress: 0 } : f))

      try {
        // 1️⃣ Subida directa cliente → Cloudinary (sin pasar por el servidor)
        const result = await uploadToCloudinary(item.file, (pct) => {
          setFiles(prev => prev.map(f => f.id === item.id ? { ...f, progress: pct } : f))
        })

        // 2️⃣ Guardar solo URL + metadata en Supabase (sin archivos en Supabase Storage)
        const { error: dbErr } = await supabase.from('uploads').insert({
          file_url:     result.secure_url,
          file_type:    result.resource_type === 'video' ? 'video' : 'image',
          file_name:    item.file.name,
          storage_path: result.public_id,   // public_id de Cloudinary → para thumbnails
          user_name:    userName.trim() || null,
        })
        if (dbErr) console.warn('Supabase insert:', dbErr.message)

        setFiles(prev => prev.map(f => f.id === item.id ? { ...f, status: 'done', progress: 100 } : f))
        doneCount++
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Error desconocido'
        setFiles(prev => prev.map(f => f.id === item.id ? { ...f, status: 'error', error: msg } : f))
      }
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
      {/* Inputs ocultos */}
      <input ref={galleryRef} type="file" multiple accept="image/*,video/*"
        onChange={handleFileChange} style={{ display: 'none' }} />
      <input ref={cameraRef} type="file" accept="image/*,video/*" capture="environment"
        onChange={handleFileChange} style={{ display: 'none' }} />

      {/* Campo de nombre */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <User size={15} color="rgba(201,169,110,0.6)" />
        </div>
        <input
          type="text"
          value={userName}
          onChange={e => setUserName(e.target.value)}
          placeholder="Tu nombre (opcional)"
          maxLength={60}
          disabled={uploading}
          className="w-full pl-9 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
          style={{
            background: 'rgba(201,169,110,0.05)',
            border: '1px solid rgba(201,169,110,0.25)',
            color: 'var(--charcoal)',
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 300,
            fontSize: '0.82rem',
          }}
          onFocus={e => (e.target.style.borderColor = 'rgba(201,169,110,0.6)')}
          onBlur={e  => (e.target.style.borderColor = 'rgba(201,169,110,0.25)')}
        />
      </div>

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
          <Camera size={22} /><span>Cámara</span>
          <span style={{ fontSize: '0.65rem', opacity: 0.5 }}>Foto o vídeo</span>
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
