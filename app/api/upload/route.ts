import { NextRequest, NextResponse } from 'next/server'
import { uploadFileToDrive, isDriveConfigured } from '@/lib/googleDrive'
import { supabase } from '@/lib/supabase'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(request: NextRequest) {
  // Diagnóstico detallado de qué variable falta
  const missing: string[] = []
  if (!process.env.GOOGLE_OAUTH_CLIENT_ID)     missing.push('GOOGLE_OAUTH_CLIENT_ID')
  if (!process.env.GOOGLE_OAUTH_CLIENT_SECRET)  missing.push('GOOGLE_OAUTH_CLIENT_SECRET')
  if (!process.env.GOOGLE_OAUTH_REFRESH_TOKEN)  missing.push('GOOGLE_OAUTH_REFRESH_TOKEN')
  if (!process.env.GOOGLE_DRIVE_FOLDER_ID)      missing.push('GOOGLE_DRIVE_FOLDER_ID')

  if (missing.length > 0) {
    console.error('❌ Drive vars missing:', missing)
    return NextResponse.json(
      { error: `Google Drive no configurado. Faltan: ${missing.join(', ')}` },
      { status: 503 }
    )
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file || file.size === 0) {
      return NextResponse.json({ error: 'No se recibió ningún archivo' }, { status: 400 })
    }

    const buffer  = Buffer.from(await file.arrayBuffer())
    const isVideo = file.type.startsWith('video/')

    const result = await uploadFileToDrive(
      buffer,
      file.name,
      file.type || 'application/octet-stream'
    )

    if (!result) throw new Error('uploadFileToDrive devolvió null')

    // Guardar solo metadatos en Supabase DB (los archivos van a Drive, no a Storage)
    const { error: dbErr } = await supabase.from('uploads').insert({
      file_url:     result.viewUrl,
      file_type:    isVideo ? 'video' : 'image',
      file_name:    file.name,
      storage_path: result.fileId,  // fileId de Drive
    })

    if (dbErr) console.warn('⚠️ DB insert error:', dbErr.message)

    console.log('✅ Drive upload OK:', result.fileId, file.name)

    return NextResponse.json({ success: true, ...result })
  } catch (err) {
    console.error('❌ Upload error:', err instanceof Error ? err.message : err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error desconocido' },
      { status: 500 }
    )
  }
}


