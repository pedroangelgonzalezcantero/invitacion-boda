'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, X, CheckCircle, Film, AlertCircle, Camera } from 'lucide-react'

const MAX_VIDEO = 100 * 1024 * 1024  // 100 MB
const MAX_IMAGE = 20  * 1024 * 1024  // 20 MB (antes de comprimir)

interface FileItem {
  id: string
  file: File
  status: 'pending' | 'uploading' | 'done' | 'error'
  error?: string
  preview?: string
}

// ── Compresión de imagen (reduce fotos grandes a < 4MB) ──────
async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith('image/') || file.size <= 3.5 * 1024 * 1024) return file
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const canvas = document.createElement('canvas')
      let { width, height } = img
      const maxDim = 2048
      if (width > maxDim || height > maxDim) {
        const r = Math.min(maxDim / width, maxDim / height)
        width = Math.round(width * r); height = Math.round(height * r)
      }
      canvas.width = width; canvas.height = height
      canvas.getContext('2d')!.drawImage(img, 0, 0, width, height)
      canvas.toBlob(blob => {
        URL.revokeObjectURL(url)
        resolve(blob && blob.size < file.size
          ? new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' })
          : file)
      }, 'image/jpeg', 0.82)
    }
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file) }
    img.src = url
  })
}

export default function UploadForm({ onUploaded }: { onUploaded?: () => void }) {
  const [files, setFiles]         = useState<FileItem[]>([])
  const [uploading, setUploading] = useState(false)
  const [allDone, setAllDone]     = useState(false)
  const [progress, setProgress]   = useState({ current: 0, total: 0 })
  const galleryRef                = useRef<HTMLInputElement>(null)
  const cameraRef                 = useRef<HTMLInputElement>(null)

  const addFiles = (selected: File[]) => {
    const items: FileItem[] = selected.map(f => {
      const isVideo = f.type.startsWith('video/')
      const maxSize = isVideo ? MAX_VIDEO : MAX_IMAGE
      const id = Math.random().toString(36).slice(2)
      if (f.size > maxSize) {
        return { id, file: f, status: 'error', error: `Máx ${isVideo ? '100MB' : '20MB'}` }
      }
      const preview = !isVideo ? URL.createObjectURL(f) : undefined
      return { id, file: f, status: 'pending', preview }
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
    setProgress({ current: 0, total: pending.length })
    let doneCount = 0

    for (let i = 0; i < files.length; i++) {
      const item = files[i]
      if (item.status !== 'pending') continue

      setFiles(prev => prev.map(f => f.id === item.id ? { ...f, status: 'uploading' } : f))
      setProgress({ current: doneCount + 1, total: pending.length })

      try {
        // Comprimir si es imagen grande
        const fileToUpload = await compressImage(item.file)

        const fd = new FormData()
        fd.append('file', fileToUpload)

        const res = await fetch('/api/upload', { method: 'POST', body: fd })
        const json = await res.json()

        if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`)

        setFiles(prev => prev.map(f => f.id === item.id ? { ...f, status: 'done' } : f))
        doneCount++
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Error'
        setFiles(prev => prev.map(f => f.id === item.id ? { ...f, status: 'error', error: msg } : f))
      }
    }

    setUploading(false)
    if (doneCount > 0) { setAllDone(true); onUploaded?.() }
  }

  // ── Success ──────────────────────────────────────────────────
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
          Tus fotos y vídeos forman parte de este día tan especial para nosotros 💍
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

      {/* Botones selección */}
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

      {/* Lista archivos */}
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
              <div className="flex-shrink-0 rounded-xl overflow-hidden" style={{ width: 48, height: 48, background: 'rgba(201,169,110,0.1)' }}>
                {item.preview
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={item.preview} alt="" className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center"><Film size={20} color="var(--gold)" /></div>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm" style={{ color: 'var(--charcoal)', fontFamily: "'Montserrat', sans-serif", fontWeight: 300 }}>{item.file.name}</p>
                <p className="text-xs" style={{ color: isError ? '#c0392b' : isDone ? '#5c9e6a' : 'rgba(44,44,44,0.45)', fontFamily: "'Montserrat', sans-serif" }}>
                  {isUploading ? 'Guardando en Drive…' : isDone ? '✓ Guardado en Drive' : isError ? `✗ ${item.error}` : `${(item.file.size / 1024 / 1024).toFixed(1)} MB`}
                </p>
                {isUploading && (
                  <div className="mt-1 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(201,169,110,0.2)' }}>
                    <motion.div className="h-full rounded-full" style={{ background: 'var(--gold)', width: '40%' }}
                      animate={{ x: ['-150%', '250%'] }} transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }} />
                  </div>
                )}
              </div>
              {!isUploading && !isDone && <button onClick={() => removeFile(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, flexShrink: 0 }}><X size={16} color="rgba(44,44,44,0.35)" /></button>}
              {isDone  && <CheckCircle size={18} color="#5c9e6a" style={{ flexShrink: 0 }} />}
              {isError && <AlertCircle size={18} color="#c0392b" style={{ flexShrink: 0 }} />}
            </motion.div>
          )
        })}
      </AnimatePresence>

      {/* Progreso global */}
      {uploading && progress.total > 1 && (
        <div>
          <p className="text-xs mb-1.5" style={{ color: 'var(--charcoal)', opacity: 0.45, fontFamily: "'Montserrat', sans-serif" }}>
            Guardando {progress.current} de {progress.total} en Drive…
          </p>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(201,169,110,0.15)' }}>
            <motion.div className="h-full rounded-full" style={{ background: 'var(--gold)' }}
              animate={{ width: `${(progress.current / progress.total) * 100}%` }} transition={{ duration: 0.3 }} />
          </div>
        </div>
      )}

      {pendingCount > 0 && (
        <motion.button type="button" onClick={handleUpload} disabled={uploading}
          className="btn-gold w-full" style={{ opacity: uploading ? 0.7 : 1, fontSize: '0.95rem', padding: '14px 20px' }}
          whileTap={{ scale: 0.98 }}>
          {uploading ? 'Guardando en Drive…' : `📤 Subir ${pendingCount} archivo${pendingCount > 1 ? 's' : ''}`}
        </motion.button>
      )}
    </div>
  )
}

