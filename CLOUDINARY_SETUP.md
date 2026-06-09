# 🌩️ Guía de configuración: Cloudinary + Supabase

## Arquitectura del sistema (optimizada para créditos)

```
Invitado → selecciona foto
           ↓
  browser-image-compression    ← comprime a ≤1.5 MB / 1920px ANTES de subir
           ↓
  Cloudinary (subida original comprimida)
           ↓
  secure_url + public_id
           ↓
  getThumbUrl() → genera URL del thumb (600×600)   ← 1 crédito de transformación
           ↓
  Supabase DB (file_url + thumb_url + storage_path)
           ↓
  Galería: muestra thumb_url (URL estática, CDN)   ← 0 créditos extra
  Lightbox: muestra file_url (original, sin transformar) ← 0 créditos extra
```

**Cloudinary** → almacena los archivos y cachea thumbnails en CDN  
**Supabase** → solo guarda URLs y metadata (no usa Storage de Supabase)

---

## ¿Cuántos créditos consume mi boda?

El plan gratuito tiene **25 créditos/mes** donde:
| Unidad | Equivale a |
|---|---|
| 1 crédito | 1 GB de almacenamiento |
| 1 crédito | 1 GB de ancho de banda |
| 1 crédito | 1.000 transformaciones de imagen |
| 1 crédito | 1 minuto de vídeo procesado |

### Estimación para 150 invitados subiendo ~200 fotos y 10 vídeos

| Concepto | Cálculo | Créditos |
|---|---|---|
| Almacenamiento fotos (≤1.5 MB c/u) | 200 × 1.5 MB = 300 MB | 0.3 |
| Almacenamiento vídeos (50 MB c/u) | 10 × 50 MB = 500 MB | 0.5 |
| Transformaciones thumb imágenes | 200 / 1000 | 0.2 |
| Transformaciones thumb vídeos | 10 transformaciones | 0.01 |
| Ancho de banda (100 visitantes × 200 thumbs × 50 KB) | ~1 GB | 1.0 |
| **Total estimado** | | **~2 créditos** |

✅ Muy por debajo de los 25 créditos gratuitos.

---

## Paso 1: Crear cuenta en Cloudinary

1. Ve a **https://cloudinary.com** y regístrate (plan gratuito: **25 créditos**)
2. En el **Dashboard**, copia tu `Cloud Name` (esquina superior izquierda)

---

## Paso 2: Crear un Upload Preset (unsigned)

> Los presets "unsigned" permiten subir desde el navegador **sin exponer secrets**.

1. Ve a **Settings → Upload → Upload presets**
2. Clic en **"Add upload preset"**
3. Configura:
   - **Preset name**: `boda_unsigned`
   - **Signing mode**: `Unsigned` ← importante
   - **Folder**: `boda`
   - **Allowed formats**: `jpg, jpeg, png, gif, webp, heic, mp4, mov, webm`
   - **Max file size**: `10MB` ← el preset limita adicionalmente (las imágenes ya vienen comprimidas a ≤1.5 MB)
4. Guarda el preset

---

## Paso 3: Configurar variables de entorno

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=tu_cloud_name_aqui
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=boda_unsigned
```

---

## Paso 4: Preparar Supabase DB

Ejecuta el SQL en **Supabase → SQL Editor**:

```
supabase/cloudinary-schema.sql
```

Esto crea (o actualiza) la tabla `uploads` con la columna `thumb_url`.

### Estructura de la tabla `uploads`:

| Columna        | Tipo        | Descripción                                         |
|----------------|-------------|-----------------------------------------------------|
| `id`           | UUID        | ID único (auto-generado)                            |
| `created_at`   | TIMESTAMPTZ | Fecha/hora de subida                                |
| `file_url`     | TEXT        | `secure_url` de Cloudinary (original comprimido)    |
| `file_type`    | TEXT        | `image` o `video`                                   |
| `file_name`    | TEXT        | Nombre original del archivo                         |
| `storage_path` | TEXT        | `public_id` de Cloudinary                           |
| `thumb_url`    | TEXT        | URL del thumbnail pre-generada (guardada al subir)  |
| `user_name`    | TEXT        | Nombre del invitado (opcional)                      |

---

## Reglas para reducir consumo de créditos

### ✅ Qué hacer

- **Comprimir en el cliente antes de subir** — `browser-image-compression` reduce las fotos a ≤1.5 MB / 1920px. Menos almacenamiento, menos ancho de banda.
- **Generar `thumb_url` una sola vez al subir** — La URL se calcula en `uploadOne()` y se persiste en Supabase. La galería la usa directamente sin generar nuevas transformaciones.
- **Usar siempre el mismo `THUMB_SIZE`** — Cambiar el tamaño crea una variante nueva (1 crédito de transformación por imagen).
- **`loading="lazy"` en thumbnails** — El navegador solo descarga las imágenes visibles en pantalla.
- **`f_auto`** — Deja que Cloudinary elija el formato óptimo (AVIF/WebP/JPEG). Cuenta como 1 transformación aunque sirva múltiples formatos desde CDN.
- **Lightbox con `file_url` (original)** — El original ya está comprimido (≤1.5 MB), no necesita transformación adicional.

### ❌ Qué evitar

- **No cambiar `THUMB_SIZE` después de la primera subida en producción** — Genera 1 nueva transformación por cada imagen existente.
- **No usar `w_`, `h_`, `c_fill` etc. en el render de la galería** — Si la URL es distinta cada vez que se renderiza, Cloudinary genera una nueva transformación. Usa siempre `thumb_url` de la DB.
- **No construir URLs de Cloudinary dinámicamente en JSX** — Si el componente se re-renderiza con un parámetro diferente (ej. `size` dinámico), genera nuevas transformaciones.
- **No usar el intervalo de refresco < 5 minutos** — El refresco actual es de 5 min. No bajarlo salvo necesidad real.
- **No subir vídeos largos sin avisar al usuario** — 1 minuto de vídeo = 1 crédito (1/25 del plan gratuito). 10 vídeos de 3 min = 30 créditos → superarías el límite.

---

## Plan seguro para el día del evento

### Antes del evento

1. **Prueba la subida con 2-3 fotos** → verifica que `thumb_url` se guarda en Supabase.
2. **Revisa los créditos en uso** en el Dashboard de Cloudinary.
3. **Configura alertas de créditos** en Cloudinary → Settings → Notifications → Usage alerts.
4. **Configura el Upload Preset** con `max_file_size: 10MB` como límite extra de seguridad.

### Durante el evento

- Comparte el enlace `/recuerdos` con los invitados.
- Los thumbnails se generan la primera vez que alguien abre la galería y quedan cacheados. No se facturan de nuevo.
- Puedes refrescar manualmente la galería con el botón 🔄 si quieres ver las fotos nuevas antes de los 5 minutos.

### Límites de vídeo

Para proteger los créditos de video processing, comunica a los invitados:
> "Sube clips cortos de máximo 1-2 minutos"

Opcionalmente, puedes añadir validación en `validateFileSize` o en el preset de Cloudinary.

### Si te acercas al límite de créditos

**Fallback gratuito:** Desactiva la subida a Cloudinary y activa Google Drive:
- La app ya tiene `app/api/upload/route.ts` con integración de Google Drive.
- Configura las variables `GOOGLE_OAUTH_*` y los invitados subirán a tu Drive.
- Las fotos de Google Drive no tendrán thumbnails automáticos, pero se guardarán todas.

---

## Cómo funcionan las URLs de Cloudinary

### Thumbnail en la galería (guardado en Supabase como `thumb_url`)
```
https://res.cloudinary.com/{CLOUD}/image/upload/w_600,h_600,c_fill,q_auto,f_auto/{public_id}
```
- `w_600,h_600` → tamaño fijo (constante `THUMB_SIZE = 600`)
- `q_auto` → compresión automática (Cloudinary elige el nivel)
- `f_auto` → formato automático (AVIF/WebP según navegador)
- `c_fill` → recorte inteligente centrado

### Thumbnail de vídeo (frame a los 0 segundos)
```
https://res.cloudinary.com/{CLOUD}/video/upload/w_600,h_600,c_fill,q_auto,so_0/{public_id}.jpg
```

### Imagen a resolución completa (lightbox, sin transformar)
```
https://res.cloudinary.com/{CLOUD}/image/upload/{public_id}     ← secure_url original
```
La imagen ya viene comprimida (≤1.5 MB) desde el cliente → no se necesita `q_auto` adicional.

---

## Límites del plan gratuito de Cloudinary

| Recurso                       | Límite gratuito     |
|-------------------------------|---------------------|
| Almacenamiento                | 25 GB               |
| Ancho de banda                | 25 GB/mes           |
| Transformaciones de imagen    | 25.000/mes          |
| Procesamiento de vídeo        | 25 min/mes          |

Con la arquitectura optimizada, una boda de 200 invitados consume **~2 créditos** del total de 25.

---

## Archivos del proyecto

| Archivo                               | Descripción                                      |
|---------------------------------------|--------------------------------------------------|
| `lib/cloudinary.ts`                   | Upload + compresión + generación de URLs         |
| `components/UploadForm.tsx`           | Formulario: comprime, sube, guarda thumb_url     |
| `components/UploadGallery.tsx`        | Galería: usa thumb_url estática de Supabase      |
| `app/recuerdos/page.tsx`              | Página de recuerdos (tabs subida/galería)        |
| `supabase/cloudinary-schema.sql`      | Schema SQL para Supabase (incluye thumb_url)     |

---

## Troubleshooting

### "Cloudinary no configurado"
→ Revisa que `.env.local` tiene `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` y `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`

### Error 400 "Upload preset not found"
→ El nombre del preset en `.env.local` no coincide con el creado en Cloudinary

### Error 400 "Upload preset must be whitelisted for unsigned uploads"
→ El preset no está en modo "Unsigned" → cámbialo en Settings → Upload Presets

### Las imágenes no aparecen en la galería
→ Ejecuta el SQL en Supabase y comprueba que la tabla `uploads` existe y tiene RLS habilitado

### Los thumbnails no se muestran (aparece roto)
→ Comprueba en Supabase que la columna `thumb_url` existe (ejecuta de nuevo el schema SQL)
→ Los registros subidos antes de la actualización tendrán `thumb_url = null` y usarán `getThumbUrl()` como fallback automáticamente
