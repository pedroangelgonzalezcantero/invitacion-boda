import { NextResponse } from 'next/server'
import { isDriveConfigured, uploadFileToDrive } from '@/lib/googleDrive'

export const runtime = 'nodejs'

export async function GET() {
  const checks: Record<string, string> = {}

  // 1. Variables de entorno
  checks['GOOGLE_SERVICE_ACCOUNT_EMAIL']     = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL     ? '✅ OK' : '❌ Falta'
  checks['GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY'] = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY ? '✅ OK' : '❌ Falta'
  checks['GOOGLE_DRIVE_FOLDER_ID']           = process.env.GOOGLE_DRIVE_FOLDER_ID           ? '✅ OK' : '❌ Falta'
  checks['isDriveConfigured']                = isDriveConfigured() ? '✅ true' : '❌ false'

  if (!isDriveConfigured()) {
    return NextResponse.json({ ok: false, checks, error: 'Variables de entorno incompletas' })
  }

  // 2. Test de subida con un archivo mínimo (1x1 pixel PNG)
  try {
    const testPixel = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    )
    const result = await uploadFileToDrive(testPixel, `test-conexion-${Date.now()}.png`, 'image/png')
    return NextResponse.json({
      ok: true,
      checks,
      driveResult: result,
      message: '✅ Conexión con Drive correcta. Busca el archivo test-conexion-*.png en tu carpeta.'
    })
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ ok: false, checks, error })
  }
}

