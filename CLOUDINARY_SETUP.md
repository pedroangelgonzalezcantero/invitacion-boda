# 🌩️ Guía de configuración: Cloudinary + Supabase

## Arquitectura del sistema

```
Invitado → sube foto/vídeo → Cloudinary (almacenamiento)
                           ↓
                      secure_url + public_id
                           ↓
                    Supabase DB (tabla uploads)
                           ↓
               Galería lee URLs desde Supabase
                    y genera thumbs con Cloudinary
```

**Cloudinary** → guarda los archivos (imágenes y vídeos)  
**Supabase** → solo guarda URLs y metadata (base de datos, no storage)

---

## Paso 1: Crear cuenta en Cloudinary

1. Ve a **https://cloudinary.com** y regístrate (plan gratuito: **25 GB** de almacenamiento + CDN)
2. En el **Dashboard**, copia tu `Cloud Name` (esquina superior izquierda)

---

## Paso 2: Crear un Upload Preset (unsigned)

> Los presets "unsigned" permiten subir archivos directamente desde el navegador **sin exponer secrets**.

1. Ve a **Settings → Upload → Upload presets**
2. Clic en **"Add upload preset"**
3. Configura:
   - **Preset name**: `boda_unsigned` (o el nombre que quieras)
   - **Signing mode**: `Unsigned` ← importante
   - **Folder**: `boda` (opcional, para organizar los archivos)
   - **Allowed formats**: `jpg, jpeg, png, gif, webp, heic, mp4, mov, webm`
   - **Max file size**: `100MB`
4. Guarda el preset

---

## Paso 3: Configurar variables de entorno

Edita el archivo `.env.local`:

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=tu_cloud_name_aqui
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=boda_unsigned
```

> ✅ Estas variables llevan el prefijo `NEXT_PUBLIC_` → son seguras de exponer al cliente.  
> Son configuraciones públicas, no secrets. El preset unsigned no necesita firma.

---

## Paso 4: Preparar Supabase DB

Ejecuta el SQL en **Supabase → SQL Editor**:

```
supabase/cloudinary-schema.sql
```

Esto crea (o actualiza) la tabla `uploads` con la columna `user_name`.

### Estructura de la tabla `uploads`:

| Columna       | Tipo        | Descripción                                |
|---------------|-------------|--------------------------------------------|
| `id`          | UUID        | ID único (auto-generado)                   |
| `created_at`  | TIMESTAMPTZ | Fecha/hora de subida                       |
| `file_url`    | TEXT        | `secure_url` de Cloudinary (URL completa)  |
| `file_type`   | TEXT        | `image` o `video`                          |
| `file_name`   | TEXT        | Nombre original del archivo                |
| `storage_path`| TEXT        | `public_id` de Cloudinary (para thumbnails)|
| `user_name`   | TEXT        | Nombre del invitado (opcional)             |

---

## Paso 5: Verificar la integración

1. Inicia el servidor: `npm run dev`
2. Ve a `/recuerdos`
3. Sube una foto de prueba
4. Comprueba en:
   - **Cloudinary → Media Library**: debe aparecer en la carpeta `boda/`
   - **Supabase → Table Editor → uploads**: debe aparecer la URL

---

## Cómo funcionan las URLs de Cloudinary

### Thumbnail en la galería (400×400, comprimido automáticamente)
```
https://res.cloudinary.com/{CLOUD}/image/upload/w_400,h_400,c_fill,q_auto,f_auto/{public_id}
```
- `q_auto` → compresión automática
- `f_auto` → formato automático (WebP/AVIF según el navegador)
- `c_fill` → recorte inteligente centrado

### Thumbnail de vídeo (frame a los 0 segundos)
```
https://res.cloudinary.com/{CLOUD}/video/upload/w_400,h_400,c_fill,q_auto,so_0/{public_id}.jpg
```

### Imagen a resolución completa
```
https://res.cloudinary.com/{CLOUD}/image/upload/q_auto,f_auto/{public_id}
```

---

## Límites del plan gratuito de Cloudinary

| Recurso          | Límite gratuito   |
|------------------|-------------------|
| Almacenamiento   | 25 GB             |
| Ancho de banda   | 25 GB/mes         |
| Transformaciones | 25 créditos/mes   |
| Archivos         | Sin límite        |

Más que suficiente para una boda (200-300 invitados subiendo fotos).

---

## Archivos del proyecto

| Archivo                               | Descripción                                      |
|---------------------------------------|--------------------------------------------------|
| `lib/cloudinary.ts`                   | Utilidades: upload, getThumbUrl, getFullUrl      |
| `components/UploadForm.tsx`           | Formulario de subida con progreso                |
| `components/UploadGallery.tsx`        | Galería con lightbox                             |
| `app/recuerdos/page.tsx`              | Página de recuerdos (tabs subida/galería)        |
| `supabase/cloudinary-schema.sql`      | Schema SQL para Supabase                         |

---

## Troubleshooting

### "Cloudinary no configurado"
→ Revisa que `.env.local` tiene `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` y `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`

### Error 400 "Upload preset not found"
→ El nombre del preset en `.env.local` no coincide con el creado en Cloudinary

### Error 400 "Upload preset must be whitelisted for unsigned uploads"
→ El preset no está en modo "Unsigned" → cámbialo en Settings → Upload Presets

### Las imágenes no aparecen en la galería
→ Ejecuta el SQL en Supabase y comprueba que la tabla `uploads` existe y tiene RLS habilitado con las políticas correctas

