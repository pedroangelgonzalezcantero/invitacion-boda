import { NextRequest, NextResponse } from 'next/server'
import { uploadFileToDrive, isDriveConfigured } from '@/lib/googleDrive'

export const runtime = 'nodejs'
// Aumentar timeout para archivos grandes
export const maxDuration = 60

export async function POST(request: NextRequest) {
  if (!isDriveConfigured()) {
    return NextResponse.json({ skip: true, reason: 'Google Drive no configurado' })
  }

  try {
    const { fileUrl, fileName, mimeType } = await request.json()

    if (!fileUrl || !fileName) {
      return NextResponse.json({ error: 'Faltan campos' }, { status: 400 })
    }

    // Descargar el archivo desde Supabase Storage
    const fileRes = await fetch(fileUrl)
    if (!fileRes.ok) {
      return NextResponse.json({ error: 'No se pudo descargar el archivo de Supabase' }, { status: 500 })
    }

    const buffer = Buffer.from(await fileRes.arrayBuffer())
    const result = await uploadFileToDrive(buffer, fileName, mimeType ?? 'application/octet-stream')

    return NextResponse.json({ success: true, driveLink: result?.webViewLink, fileId: result?.fileId })
  } catch (err) {
    console.error('Drive upload error:', err)
    // No fallamos la experiencia del usuario — el archivo ya está en Supabase
    return NextResponse.json({ error: 'Error al subir a Drive (el archivo está guardado en la galería)', skip: true }, { status: 200 })
  }
}

