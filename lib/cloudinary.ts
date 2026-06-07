/**
 * lib/cloudinary.ts
 * ─────────────────────────────────────────────────────────────────
 * Utilidades para subida y generación de URLs de Cloudinary.
 * - uploadToCloudinary()  → subida directa cliente→Cloudinary (XHR)
 * - getThumbUrl()         → URL de thumbnail optimizado
 * - getFullUrl()          → URL de imagen/video a resolución completa
 *
 * VARIABLES DE ENTORNO necesarias (public, se exponen al cliente):
 *   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME    → tu cloud name en Cloudinary
 *   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET → preset unsigned creado en Cloudinary
 * ─────────────────────────────────────────────────────────────────
 */

export const CLOUD_NAME    = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME    ?? ''
export const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? ''

/** Tamaños máximos permitidos */
export const MAX_IMAGE_BYTES = 10  * 1024 * 1024  // 10 MB
export const MAX_VIDEO_BYTES = 100 * 1024 * 1024  // 100 MB

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

export interface MediaRecord {
  id:          string
  file_url:    string       // secure_url de Cloudinary
  storage_path: string      // public_id de Cloudinary
  file_type:   ResourceType
  file_name:   string | null
  user_name:   string | null
  created_at:  string
}

// ── Subida directa cliente → Cloudinary (con progreso real via XHR) ───────────

/**
 * Sube un archivo directamente a Cloudinary desde el navegador.
 * No pasa por tu servidor → sin límites de tamaño de Next.js.
 *
 * @param file       - Archivo a subir
 * @param onProgress - Callback con el porcentaje de progreso (0-100)
 * @param folder     - Carpeta destino en Cloudinary (default: "boda")
 */
export function uploadToCloudinary(
  file:       File,
  onProgress: (pct: number) => void,
  folder      = 'boda',
): Promise<CloudinaryResult> {
  return new Promise((resolve, reject) => {
    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      reject(new Error('Cloudinary no configurado. Revisa NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME y NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET'))
      return
    }

    const resourceType = file.type.startsWith('video/') ? 'video' : 'image'

    const fd = new FormData()
    fd.append('file',          file)
    fd.append('upload_preset', UPLOAD_PRESET)
    fd.append('folder',        folder)

    const xhr = new XMLHttpRequest()

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 95))  // 95% → reservamos 5% para la respuesta
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
 * Thumbnail cuadrado optimizado para la galería.
 * - Imagen: WebP/AVIF automático, 400×400, recorte inteligente
 * - Vídeo:  frame a los 0s como .jpg, 400×400, recorte inteligente
 *
 * @param publicId  - Cloudinary public_id del recurso
 * @param type      - 'image' | 'video'
 * @param size      - Tamaño del thumbnail (default: 400)
 */
export function getThumbUrl(publicId: string, type: ResourceType, size = 400): string {
  if (!CLOUD_NAME || !publicId) return ''

  if (type === 'video') {
    // Extrae un frame del vídeo como imagen JPEG
    return `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/w_${size},h_${size},c_fill,q_auto,so_0/${publicId}.jpg`
  }

  // Imagen → formato automático (AVIF/WebP según navegador), compresión automática
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/w_${size},h_${size},c_fill,q_auto,f_auto/${publicId}`
}

/**
 * URL de imagen/vídeo a resolución completa optimizada.
 * - Imagen: calidad auto, formato auto (sin redimensionar)
 * - Vídeo:  URL directa de Cloudinary (codec nativo)
 */
export function getFullUrl(fileUrl: string, publicId: string, type: ResourceType): string {
  if (!CLOUD_NAME || !publicId) return fileUrl

  if (type === 'image') {
    return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/q_auto,f_auto/${publicId}`
  }

  // Para vídeo devolvemos la secure_url directa (mejor compatibilidad con <video>)
  return fileUrl
}

/**
 * Valida el tamaño del archivo antes de subirlo.
 * @returns null si es válido, o string con el mensaje de error
 */
export function validateFileSize(file: File): string | null {
  const isVideo = file.type.startsWith('video/')
  const max     = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES
  if (file.size > max) {
    return `El archivo supera el límite (${isVideo ? '100 MB' : '10 MB'})`
  }
  return null
}

