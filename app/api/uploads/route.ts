/**
 * app/api/uploads/route.ts
 * ──────────────────────────────────────────────────────────────
 * GET  /api/uploads  → lista los últimos 100 uploads (galería)
 * POST /api/uploads  → guarda metadata de un nuevo upload de Cloudinary
 *
 * NOTA: Antes estos accesos se hacían directamente desde el cliente
 * usando el SDK de Supabase. Con Prisma+MySQL deben ir siempre
 * por una API route (Prisma solo funciona server-side).
 * ──────────────────────────────────────────────────────────────
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// ── GET: listar uploads para la galería ───────────────────────
export async function GET() {
  try {
    const uploads = await prisma.upload.findMany({
      select: {
        id:          true,
        fileUrl:     true,
        storagePath: true,
        fileType:    true,
        fileName:    true,
        userName:    true,
        createdAt:   true,
        thumbUrl:    true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    // Mapear camelCase de Prisma → snake_case que espera el frontend (MediaRecord)
    const data = uploads.map((u) => ({
      id:           u.id,
      file_url:     u.fileUrl,
      storage_path: u.storagePath,
      file_type:    u.fileType,
      file_name:    u.fileName,
      user_name:    u.userName,
      created_at:   u.createdAt.toISOString(),
      thumb_url:    u.thumbUrl,
    }))

    return NextResponse.json(data)
  } catch (err) {
    console.error('[GET /api/uploads] Error:', err)
    return NextResponse.json([], { status: 500 })
  }
}

// ── POST: guardar metadata tras upload a Cloudinary ──────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { file_url, file_type, file_name, storage_path, thumb_url, user_name } = body

    if (!file_url || !file_type || !storage_path) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios: file_url, file_type, storage_path' },
        { status: 400 }
      )
    }

    const upload = await prisma.upload.create({
      data: {
        fileUrl:     file_url,
        fileType:    file_type === 'video' ? 'video' : 'image',
        fileName:    file_name ?? null,
        storagePath: storage_path,
        thumbUrl:    thumb_url ?? null,
        userName:    user_name ?? null,
      },
    })

    return NextResponse.json({ success: true, id: upload.id }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/uploads] Error:', err)
    return NextResponse.json({ error: 'Error al guardar el upload' }, { status: 500 })
  }
}

