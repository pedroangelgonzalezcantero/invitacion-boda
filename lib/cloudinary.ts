/**
 * lib/cloudinary.ts
 * ─────────────────────────────────────────────────────────────────
 * Utilidades para subida y generación de URLs de Cloudinary.
 *
 * OPTIMIZACIÓN DE CRÉDITOS:
 *  1. Las imágenes se comprimen en el cliente ANTES de subir.
 *  2. El thumb se genera UNA SOLA VEZ en el momento del upload
 *     y se almacena en Supabase → la galería usa URLs estáticas.
 *  3. La lightbox muestra el original de Cloudinary sin transformación.
 *
 * VARIABLES DE ENTORNO necesarias (prefijo NEXT_PUBLIC_ → seguras para el cliente):
 *   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME    → tu cloud name
 *   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET → preset unsigned
 * ─────────────────────────────────────────────────────────────────
 */

import imageCompression from 'browser-image-compression'

export const CLOUD_NAME    = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME    ?? ''
export const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? ''

// ── Límites de archivo ────────────────────────────────────────────

/** Tamaño máximo permitido ANTES de comprimir */
export const MAX_IMAGE_BYTES = 30 * 1024 * 1024   // 30 MB (el original puede ser grande)
export const MAX_VIDEO_BYTES = 100 * 1024 * 1024  // 100 MB

// ── Configuración de thumbnail ────────────────────────────────────

/**
 * Tamaño del thumbnail guardado en Supabase.
 * ⚠️ No cambies este valor después del primer uso en producción:
 *    cambiar el tamaño genera transformaciones nuevas (créditos).
 */
export const THUMB_SIZE = 600  // px — 600×600 es suficiente para grid 2-3 col

// ── Opciones de compresión client-side ───────────────────────────

/**
 * Opciones de compresión para `browser-image-compression`.
 * Se aplica ANTES de subir a Cloudinary:
 *  ✅ Reduce tamaño almacenado → menos créditos de storage/bandwidth
 *  ✅ Cloudinary recibe un archivo más pequeño → procesamiento más rápido
 */
const COMPRESS_OPTIONS = {
  maxSizeMB: 1.5,           // máximo 1.5 MB tras compresión
  maxWidthOrHeight: 1920,   // máximo 1920px en el lado más largo
  useWebWorker: true,       // no bloquea el hilo principal
  fileType: 'image/jpeg',   // siempre JPEG para uniformidad
  initialQuality: 0.82,     // calidad inicial (0.82 = muy buena relación calidad/peso)
}

// ── Tipos ────────────────────────────────────────────────────────

export type ResourceType = 'image' | 'video'

export interface CloudinaryResult {
  secure_url:    string
  public_id:     string
  resource_type: ResourceType
  width?:        number
  height?:       number
  duration?:     number  // solo vídeos
  format?:       string
}

/**
 * Registro de media guardado en Supabase.
 * `thumb_url` se guarda en el momento del upload → la galería
 * nunca genera nuevas transformaciones al mostrar miniaturas.
 */
export interface MediaRecord {
  id:           string
  file_url:     string        // secure_url original de Cloudinary (sin transformar)
  storage_path: string        // public_id de Cloudinary
  file_type:    ResourceType
  file_name:    string | null
  user_name:    string | null
  created_at:   string
  thumb_url?:   string | null // URL pre-generada del thumbnail (600×600, guardada en DB)
}

// ── Compresión ────────────────────────────────────────────────────

/**
 * Comprime una imagen en el navegador antes de subirla.
 * - JPEG < 1.5 MB, max 1920px
 * - Los vídeos NO se comprimen (se devuelven tal cual)
 */
export async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) return file  // vídeos: sin tocar
  try {
    const compressed = await imageCompression(file, COMPRESS_OPTIONS)
    // imageCompression devuelve un Blob; lo convertimos a File para mantener el nombre
    return new File([compressed], file.name.replace(/\.[^.]+$/, '.jpg'), {
      type: 'image/jpeg',
      lastModified: Date.now(),
    })
  } catch {
    console.warn('[cloudinary] Compresión falló, se sube el original:', file.name)
    return file
  }
}

// ── Subida directa cliente → Cloudinary ──────────────────────────

/**
 * Sube un archivo a Cloudinary directamente desde el navegador.
 *  - Las imágenes se comprimen AUTOMÁTICAMENTE antes de subir.
 *  - Los vídeos se envían tal cual.
 *
 * @param file       - Archivo original del usuario
 * @param onProgress - Callback con progreso 0-100
 * @param folder     - Carpeta destino en Cloudinary (default: "boda")
 */
export async function uploadToCloudinary(
  file:       File,
  onProgress: (pct: number) => void,
  folder      = 'boda',
): Promise<CloudinaryResult> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error('Cloudinary no configurado. Revisa NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME y NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET')
  }

  const isImage       = file.type.startsWith('image/')
  const resourceType  = isImage ? 'image' : 'video'

  // 1️⃣ Comprimir imagen antes de subir
  let fileToUpload = file
  if (isImage) {
    onProgress(5)  // señal de que estamos comprimiendo
    fileToUpload = await compressImage(file)
  }

  // 2️⃣ Subir a Cloudinary con progreso real via XHR
  return new Promise((resolve, reject) => {
    const fd = new FormData()
    fd.append('file',          fileToUpload)
    fd.append('upload_preset', UPLOAD_PRESET)
    fd.append('folder',        folder)

    const xhr = new XMLHttpRequest()

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        // El primer 10% es para la compresión; del 10% al 95% es la subida
        onProgress(10 + Math.round((e.loaded / e.total) * 85))
      }
    }

    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText)
        if (xhr.status === 200) {
          onProgress(100)
          resolve(data as CloudinaryResult)
        } else {
          reject(new Error(data?.error?.message ?? `Error Cloudinary ${xhr.status}`))
        }
      } catch {
        reject(new Error('Respuesta de Cloudinary no válida'))
      }
    }

    xhr.onerror   = () => reject(new Error('Error de red al subir a Cloudinary'))
    xhr.ontimeout = () => reject(new Error('Tiempo de espera agotado al subir a Cloudinary'))

    xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`)
    xhr.send(fd)
  })
}

// ── Generadores de URLs optimizadas ──────────────────────────────

/**
 * Genera la URL del thumbnail UNA SOLA VEZ en el momento del upload.
 * Esta URL se guarda en Supabase y la galería la usa directamente.
 *
 * ✅ La primera vez que alguien visite la galería, Cloudinary genera
 *    el thumbnail (1 crédito de transformación) y lo cachea en CDN.
 *    Todas las visitas posteriores sirven desde CDN: 0 créditos.
 *
 * ❌ NO llames a esta función desde el render de la galería.
 *    Úsala SOLO al hacer upload y guarda el resultado en Supabase.
 *
 * @param publicId - Cloudinary public_id del recurso
 * @param type     - 'image' | 'video'
 * @param size     - Tamaño del thumbnail (usa siempre THUMB_SIZE)
 */
export function getThumbUrl(publicId: string, type: ResourceType, size = THUMB_SIZE): string {
  if (!CLOUD_NAME || !publicId) return ''

  if (type === 'video') {
    // Frame a los 0 segundos como JPEG — se genera solo 1 vez y queda cacheado
    return `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/w_${size},h_${size},c_fill,q_auto,so_0/${publicId}.jpg`
  }

  // f_auto: Cloudinary elige AVIF/WebP/JPEG según el navegador.
  // Cuenta como 1 transformación (Cloudinary cachea internamente cada variante de formato).
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/w_${size},h_${size},c_fill,q_auto,f_auto/${publicId}`
}

/**
 * URL del archivo ORIGINAL de Cloudinary (sin transformaciones adicionales).
 *
 * Para imágenes: devuelve la secure_url original → 0 créditos extra.
 *   Las imágenes ya se subieron comprimidas (≤ 1.5 MB) así que el original
 *   es suficientemente ligero para la lightbox.
 *
 * Para vídeos: devuelve la secure_url directa (streaming nativo).
 *
 * ✅ Usar esta URL en el lightbox evita generar una segunda transformación
 *    por imagen (antes había q_auto,f_auto adicional → 1 crédito extra por imagen).
 */
export function getFullUrl(fileUrl: string, _publicId: string, _type: ResourceType): string {
  // Devolvemos siempre la URL original almacenada en Supabase.
  // Las imágenes ya están comprimidas desde el cliente → son ligeras.
  return fileUrl
}

// ── Validación ────────────────────────────────────────────────────

/**
 * Valida el tamaño del archivo ANTES de comprimir.
 * @returns null si es válido, o string con el mensaje de error
 */
export function validateFileSize(file: File): string | null {
  const isVideo = file.type.startsWith('video/')
  const max     = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES
  if (file.size > max) {
    return `El archivo supera el límite (${isVideo ? '100 MB' : '30 MB'})`
  }
  return null
}
