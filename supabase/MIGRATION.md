# MIGRACIÓN: Supabase → Prisma + MySQL (Hostinger)

> **Completada el:** 2026-06-30  
> **Versión Prisma:** 7.8.0  
> **Stack destino:** Next.js 16 · Prisma 7 · MySQL (Hostinger `srv495.hstgr.io`)

---

## 1. Resumen Ejecutivo

La aplicación de invitación de boda ha sido migrada completamente de **Supabase (PostgreSQL)** a **Prisma ORM + MySQL Hostinger**.  
Cloudinary **continúa siendo la solución oficial de almacenamiento de imágenes**, sin ninguna modificación.

| Aspecto              | Antes                      | Después                    |
|----------------------|----------------------------|----------------------------|
| Base de datos        | Supabase (PostgreSQL)       | MySQL Hostinger             |
| ORM / Query Builder  | `@supabase/supabase-js`    | Prisma ORM 7               |
| Auth                 | ❌ No usada                 | ❌ No aplica                |
| Storage              | ❌ No usada (Cloudinary)    | ❌ No aplica                |
| Realtime             | ❌ No usada                 | ❌ No aplica                |
| RLS Policies         | ✅ Usadas en PostgreSQL     | Reemplazadas por lógica server-side |
| Hosting              | Vercel                     | Vercel (sin cambios)        |
| Imágenes             | Cloudinary                 | Cloudinary (sin cambios)    |

---

## 2. Inventario de usos de Supabase (antes de la migración)

| Archivo                              | Línea | Operación                                 | Tabla             |
|--------------------------------------|-------|-------------------------------------------|-------------------|
| `lib/supabase.ts`                    | 1-8   | `createClient()` — inicialización         | —                 |
| `app/api/guests/route.ts`            | 12-17 | SELECT con `.eq()`, `.single()`           | `guests`          |
| `app/api/guests/route.ts`            | 27-31 | SELECT                                    | `rsvp_responses`  |
| `app/api/rsvp/route.ts`              | 61-65 | SELECT `.maybeSingle()`                   | `rsvp_responses`  |
| `app/api/rsvp/route.ts`              | 71-76 | UPDATE                                    | `rsvp_responses`  |
| `app/api/rsvp/route.ts`              | 92-96 | INSERT                                    | `rsvp_responses`  |
| `app/api/rsvp/route.ts`              | 106   | DELETE `.eq()`                            | `rsvp_attendees`  |
| `app/api/rsvp/route.ts`              | 119   | INSERT batch                              | `rsvp_attendees`  |
| `app/api/stats/route.ts`             | 16-18 | SELECT con join implícito (relación)      | `rsvp_responses`  |
| `app/api/upload/route.ts`            | 44-49 | INSERT                                    | `uploads`         |
| `app/api/admin/guests/route.ts`      | 36-43 | SELECT con join `rsvp_attendees(*)`       | `rsvp_responses`  |
| `components/UploadForm.tsx`          | 31-37 | INSERT **desde el cliente** ⚠️            | `uploads`         |
| `components/UploadGallery.tsx`       | 17-24 | SELECT **desde el cliente** ⚠️            | `uploads`         |

> ⚠️ **Riesgo crítico identificado:** `UploadForm.tsx` y `UploadGallery.tsx` accedían a Supabase directamente desde el navegador (client-side). Esto era posible porque Supabase expone una API HTTP pública. Con Prisma + MySQL las consultas solo pueden ejecutarse en el servidor, por lo que se creó el endpoint `/api/uploads` y ambos componentes ahora usan `fetch()`.

---

## 3. Funcionalidades de Supabase usadas

| Funcionalidad       | ¿Usada? | Complejidad | Solución adoptada               |
|---------------------|---------|-------------|----------------------------------|
| Base de datos       | ✅ Sí   | Media       | Prisma ORM + MySQL Hostinger     |
| Auth                | ❌ No   | —           | No aplica                        |
| Storage             | ❌ No   | —           | Cloudinary (sin cambios)         |
| Realtime            | ❌ No   | —           | No aplica                        |
| Edge Functions      | ❌ No   | —           | No aplica                        |
| RLS Policies        | ✅ Sí   | Baja        | Lógica en Route Handlers server-side |
| RPC                 | ❌ No   | —           | No aplica                        |

---

## 4. Incompatibilidades PostgreSQL → MySQL resueltas

| Incompatibilidad        | PostgreSQL             | MySQL (solución adoptada)              |
|-------------------------|------------------------|----------------------------------------|
| UUID                    | `uuid_generate_v4()`   | `@default(uuid())` en Prisma (UUID v4) |
| Arrays (`TEXT[]`)       | `TEXT[]` nativo        | Columna `JSON` en MySQL + Prisma `Json?` |
| TIMESTAMPTZ             | `TIMESTAMPTZ`          | `DATETIME(3)` vía Prisma `DateTime`    |
| BOOLEAN                 | `BOOLEAN` nativo       | `TINYINT(1)` → Prisma lo mapea automáticamente |
| CHECK constraint (enum) | `CHECK (type IN (...))`| `ENUM('adult','child')` MySQL nativo + Prisma `enum` |
| JSON                    | `JSONB`                | `JSON` nativo MySQL 5.7.8+             |
| Client-side SDK         | Supabase JS en browser | `fetch('/api/uploads')` → Route Handler |

---

## 5. Archivos afectados

### Modificados
| Archivo                                | Cambio                                             |
|----------------------------------------|----------------------------------------------------|
| `app/api/guests/route.ts`              | `supabase.*` → `prisma.*`                          |
| `app/api/rsvp/route.ts`                | `supabase.*` → `prisma.*` + eliminado `isDemoMode` |
| `app/api/stats/route.ts`               | `supabase.*` → `prisma.*` + eliminado `isDemoMode` |
| `app/api/upload/route.ts`              | `supabase.*` → `prisma.*`                          |
| `app/api/admin/guests/route.ts`        | `supabase.*` → `prisma.*` + eliminado `isDemoMode` |
| `components/UploadForm.tsx`            | `supabase.from('uploads').insert` → `fetch('/api/uploads', ...)` |
| `components/UploadGallery.tsx`         | `supabase.from('uploads').select` → `fetch('/api/uploads')` |
| `components/RSVPForm.tsx`              | Mensaje de error actualizado (referencia a MySQL)  |
| `lib/database.types.ts`               | Tipos Supabase → tipos TypeScript nativos (Prisma) |
| `lib/supabase.ts`                      | Vaciado → aviso de deprecación                     |
| `.env.local`                           | Reemplazadas vars Supabase por `DATABASE_URL`       |
| `package.json`                         | Eliminado `@supabase/supabase-js`; añadido `prisma`, `@prisma/client` |

### Nuevos archivos
| Archivo                         | Propósito                                          |
|---------------------------------|----------------------------------------------------|
| `prisma/schema.prisma`          | Esquema Prisma completo (4 modelos)                |
| `prisma/seed.ts`                | Seed inicial con invitados de ejemplo              |
| `lib/prisma.ts`                 | Singleton de PrismaClient para Next.js             |
| `app/api/uploads/route.ts`      | GET + POST de uploads (reemplaza acceso client-side)|
| `supabase/mysql-migration.sql`  | SQL listo para ejecutar en phpMyAdmin/Hostinger    |
| `prisma.config.ts`              | Config Prisma 7 (URL de conexión para CLI)         |

---

## 6. Variables de entorno

### `.env.local` (desarrollo local)

```env
# MySQL Hostinger — Prisma
DATABASE_URL="mysql://USUARIO:CONTRASEÑA@srv495.hstgr.io:3306/NOMBRE_BBDD"

# Cloudinary (sin cambios)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=tu_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=tu_upload_preset

# Admin
ADMIN_SECRET_TOKEN=una_cadena_aleatoria_segura
```

### Variables en Vercel

Añadir en **Vercel → Project → Settings → Environment Variables**:

| Variable           | Entornos                | Descripción                         |
|--------------------|-------------------------|-------------------------------------|
| `DATABASE_URL`     | Production, Preview, Dev| Conexión MySQL Hostinger            |
| `ADMIN_SECRET_TOKEN` | Production            | Token de acceso al panel admin      |
| Las `NEXT_PUBLIC_*` ya configuradas | (sin cambios) | Cloudinary, bodas, etc. |

---

## 7. Pasos exactos para desplegar en producción

### Paso 1 — Crear la base de datos en Hostinger

1. Accede al panel de Hostinger → **Bases de datos MySQL**
2. Crea una nueva BD (p.ej. `wedding_db`)
3. Crea un usuario con todos los permisos sobre esa BD
4. Anota: host `srv495.hstgr.io`, puerto `3306`, usuario, contraseña, nombre BD

### Paso 2 — Ejecutar las migraciones

**Opción A — SQL manual (recomendado para producción):**
1. Abre **phpMyAdmin** de Hostinger
2. Selecciona la BD creada
3. Ve a la pestaña **SQL**
4. Copia y ejecuta el contenido de `supabase/mysql-migration.sql`

**Opción B — Prisma Migrate (requiere acceso desde tu máquina):**
```bash
# 1. Actualiza DATABASE_URL en .env.local con tus credenciales reales
# 2. Ejecuta la migración:
npm run db:migrate

# O para solo aplicar el schema sin historial de migraciones:
npm run db:push
```

### Paso 3 — Variables de entorno en Vercel

```
DATABASE_URL=mysql://TU_USER:TU_PASS@srv495.hstgr.io:3306/TU_BD
```

### Paso 4 — Desplegar

```bash
git add .
git commit -m "feat: migración Supabase → Prisma + MySQL Hostinger"
git push origin main
# Vercel despliega automáticamente
```

### Paso 5 — Verificar

1. Abre la app en producción
2. Prueba el formulario RSVP (confirmar asistencia)
3. Sube una foto desde `/recuerdos`
4. Accede al panel admin con el token

---

## 8. Checklist de validación final

### Base de datos
- [ ] BD creada en Hostinger (`srv495.hstgr.io:3306`)
- [ ] Tablas creadas: `guests`, `rsvp_responses`, `rsvp_attendees`, `uploads`
- [ ] `DATABASE_URL` configurada en `.env.local` (desarrollo)
- [ ] `DATABASE_URL` configurada en Vercel (producción)

### Prisma
- [ ] `npx prisma generate` ejecutado (cliente TypeScript generado)
- [ ] `npx prisma validate` muestra "schema is valid 🚀"
- [ ] `npm run db:push` o SQL manual aplicado sin errores

### API Routes
- [ ] `GET /api/guests?code=TEST` devuelve 404 o invitado
- [ ] `POST /api/rsvp` guarda respuesta en MySQL
- [ ] `GET /api/stats` devuelve `{ declined, adults, children }`
- [ ] `GET /api/uploads` devuelve array (vacío o con items)
- [ ] `POST /api/uploads` guarda metadata de Cloudinary
- [ ] `GET /api/admin/guests?token=TU_TOKEN` devuelve el panel admin

### Frontend
- [ ] `UploadForm` sube a Cloudinary y llama `POST /api/uploads` ✓
- [ ] `UploadGallery` carga desde `GET /api/uploads` ✓
- [ ] `RSVPForm` llama `POST /api/rsvp` ✓
- [ ] No quedan referencias a `@supabase/supabase-js` en el bundle

### Cloudinary
- [ ] Subida de imágenes funciona (sin cambios)
- [ ] Thumbnails se generan correctamente
- [ ] Galería muestra imágenes subidas

### Vercel
- [ ] Build de producción sin errores (`npm run build`)
- [ ] Prisma Client incluido en el bundle de Vercel
- [ ] Variables de entorno configuradas en todos los entornos necesarios

---

## 9. Estimación de esfuerzo

| Tarea                                  | Esfuerzo  |
|----------------------------------------|-----------|
| Análisis del proyecto                  | 1 h       |
| Diseño del esquema Prisma              | 0.5 h     |
| Migración de 5 Route Handlers          | 1 h       |
| Refactorización de 2 componentes React | 0.5 h     |
| Nuevo endpoint `/api/uploads`          | 0.5 h     |
| SQL de migración manual                | 0.5 h     |
| Variables de entorno y documentación   | 0.5 h     |
| **Total estimado**                     | **4.5 h** |

---

## 10. Comandos de referencia rápida

```bash
# Generar cliente Prisma (tras cambios en schema)
npm run db:generate       # = npx prisma generate

# Aplicar schema a la BD (sin historial de migraciones)
npm run db:push           # = npx prisma db push

# Crear y aplicar migración con historial
npm run db:migrate        # = npx prisma migrate dev

# Seed de datos iniciales
npm run db:seed           # = npx prisma db seed

# Explorar la BD visualmente
npm run db:studio         # = npx prisma studio
```

