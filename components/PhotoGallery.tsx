'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { X } from 'lucide-react'

export interface GalleryPhoto {
  src: string
  alt: string
  width?: number
  height?: number
}

const PLACEHOLDER_PHOTOS: GalleryPhoto[] = [
  { src: '/images/photo1.jpg', alt: 'Pedro Ángel y Mari - foto 1' },
  { src: '/images/photo2.jpg', alt: 'Pedro Ángel y Mari - foto 2' },
  { src: '/images/photo3.jpg', alt: 'Pedro Ángel y Mari - foto 3' },
  { src: '/images/photo4.jpg', alt: 'Pedro Ángel y Mari - foto 4' },
  { src: '/images/photo5.jpg', alt: 'Pedro Ángel y Mari - foto 5' },
  { src: '/images/photo6.jpg', alt: 'Pedro Ángel y Mari - foto 6' },
]

interface PhotoGalleryProps {
  photos?: GalleryPhoto[]
}

export default function PhotoGallery({ photos = PLACEHOLDER_PHOTOS }: PhotoGalleryProps) {
  const [selected, setSelected] = useState<GalleryPhoto | null>(null)
  const [errors, setErrors] = useState<Set<string>>(new Set())
  const onError = useCallback((src: string) => setErrors(prev => new Set(prev).add(src)), [])

  return (
    <>
      <div className="gallery-grid">
        {photos.map((photo, i) => (
          <motion.div
            key={photo.src}
            className="relative overflow-hidden cursor-pointer"
            style={{ aspectRatio: '1/1', borderRadius: 12 }}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ scale: 1.03 }}
            onClick={() => setSelected(photo)}
          >
            <div
              className="w-full h-full flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, #f5e8d0 0%, #e8d5b0 50%, #d4c4a0 100%)`,
                minHeight: 150,
              }}
            >
              {errors.has(photo.src) ? (
                <span style={{ fontSize: 40, opacity: 0.4 }}>📷</span>
              ) : (
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  className="object-cover"
                  onError={() => onError(photo.src)}
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
              )}
            </div>
            {/* Hover overlay */}
            <div
              className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center"
              style={{ background: 'rgba(201, 169, 110, 0.3)' }}
            >
              <span style={{ color: 'white', fontSize: 28 }}>🔍</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.85)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
          >
            <motion.div
              className="relative"
              style={{ maxWidth: '90vw', maxHeight: '90vh' }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="relative overflow-hidden"
                style={{ borderRadius: 16, minWidth: 280, minHeight: 280 }}
              >
                <Image
                  src={selected.src}
                  alt={selected.alt}
                  width={600}
                  height={600}
                  className="object-contain"
                  style={{ maxWidth: '85vw', maxHeight: '80vh' }}
                />
              </div>
              <button
                onClick={() => setSelected(null)}
                className="absolute -top-3 -right-3 rounded-full p-2 flex items-center justify-center"
                style={{ background: 'var(--gold)', color: 'white' }}
              >
                <X size={18} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

