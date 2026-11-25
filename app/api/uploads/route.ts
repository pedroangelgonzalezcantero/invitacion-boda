/**
 * app/api/uploads/route.ts
 * ──────────────────────────────────────────────────────────────
 * GET  /api/uploads  → lista uploads paginados (galería, ?cursor=&limit=)
 * POST /api/uploads  → guarda metadata de un nuevo upload de Cloudinary
 *
 * NOTA: Antes estos accesos se hacían directamente desde el cliente
 * usando el SDK de Supabase. Con Prisma+MySQL deben ir siempre
 * por una API route (Prisma solo funciona server-side).
 * ──────────────────────────────────────────────────────────────
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// ── GET: listar uploads para la galería (paginado) ────────────
//   ?limit=60          → tamaño de página (máx. 100)
//   ?cursor=<id>       → devuelve los uploads más antiguos que ese id
//   Header X-Total-Count → total de uploads en la BD
const DEFAULT_LIMIT = 60
const MAX_LIMIT     = 100

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const cursor = searchParams.get('cursor')
    const limit  = Math.min(
      Math.max(parseInt(searchParams.get('limit') ?? '', 10) || DEFAULT_LIMIT, 1),
      MAX_LIMIT,
    )

    const [uploads, total] = await Promise.all([prisma.upload.findMany({
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
      // id como desempate → orden estable aunque dos fotos compartan createdAt
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: limit,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    }), prisma.upload.count()])

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

    return NextResponse.json(data, {
      headers: { 'X-Total-Count': String(total) },
    })
  } catch (err) {
    console.error('[GET /api/uploads] Error:', err)
    return NextResponse.json(
      { error: 'Error interno', detail: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    )
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


