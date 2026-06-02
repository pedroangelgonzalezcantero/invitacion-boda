# 💍 Invitación Digital de Boda

Una aplicación web elegante para gestionar invitaciones de boda. Next.js 14, TailwindCSS, Framer Motion y Supabase.

## ✨ Características

- 📩 Animación de sobre en la pantalla inicial
- ⏱️ Cuenta atrás en tiempo real
- ✅ RSVP con código único por invitado
- 🖼️ Galería de fotos con lightbox
- 🎵 Música de fondo opcional
- 📊 Panel de administración protegido
- 📱 Mobile-first responsive

---

## 🚀 Instalación en local

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar Supabase

1. Ve a [supabase.com](https://supabase.com) → **New Project**
2. En **SQL Editor**, ejecuta el contenido de `supabase/schema.sql`
3. En **Settings → API**, copia tu `Project URL` y `anon key`

### 3. Configurar `.env.local`

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anonima
ADMIN_SECRET_TOKEN=elige-un-token-secreto-seguro
NEXT_PUBLIC_WEDDING_DATE=2026-09-15T18:00:00
NEXT_PUBLIC_BRIDE_NAME=Sofía
NEXT_PUBLIC_GROOM_NAME=Alejandro
```

### 4. Añadir contenido multimedia (opcional)

```
public/images/photo1.jpg ... photo6.jpg   ← Fotos de la galería
public/music/background.mp3               ← Música de fondo
```

### 5. Arrancar

```bash
npm run dev
# → http://localhost:3000
```

---

## 📋 Añadir invitados

**Panel admin:** ve a `/admin` e introduce tu `ADMIN_SECRET_TOKEN`

**SQL directo:**
```sql
INSERT INTO guests (name, code, max_companions, email)
VALUES ('Nombre Apellido', 'NOMBRE-001', 2, 'email@ejemplo.com');
```

Comparte el código con cada invitado por WhatsApp o en la invitación física.

---

## 🌐 Despliegue en Vercel

1. Sube el código a GitHub
2. En [vercel.com](https://vercel.com) → **New Project** → importa el repo
3. Añade las mismas variables de `.env.local` en **Environment Variables**
4. Haz clic en **Deploy** ✅

---

## 📁 Estructura

```
app/
  page.tsx              ← Página principal (Hero, Fecha, Cuenta atrás, Historia, Galería, RSVP)
  layout.tsx            ← Layout raíz + fuentes
  admin/page.tsx        ← Panel de administración
  api/guests/route.ts   ← GET: Verificar código de invitado
  api/rsvp/route.ts     ← POST: Guardar confirmación
  api/admin/guests/route.ts ← GET/POST: Gestión admin

components/
  EnvelopeAnimation.tsx ← Animación del sobre
  CountdownTimer.tsx    ← Cuenta atrás en tiempo real
  PhotoGallery.tsx      ← Galería + lightbox
  MusicPlayer.tsx       ← Reproductor flotante
  RSVPForm.tsx          ← Formulario de confirmación
  SectionWrapper.tsx    ← Animación de scroll

lib/
  supabase.ts           ← Cliente Supabase
  database.types.ts     ← Tipos TypeScript

supabase/
  schema.sql            ← Script SQL para crear tablas
```

---

## 🎨 Personalizar

- **Nombres y fecha**: variables en `.env.local`
- **Colores**: variables CSS en `app/globals.css` (--gold, --rose, --cream...)
- **Historia**: array en `app/page.tsx` sección "NUESTRA HISTORIA"
- **Ubicación**: modifica el nombre del lugar y el iframe del mapa en `app/page.tsx`

---

Hecho con ❤️
