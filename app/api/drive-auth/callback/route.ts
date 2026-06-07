import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')
  const error = request.nextUrl.searchParams.get('error')

  if (error) {
    return new NextResponse(`<html><body style="font-family:monospace;padding:40px;background:#1a1a1a;color:#e8e8e8">
      <h2 style="color:#e74c3c">❌ Error de autorización</h2>
      <p>${error}</p>
    </body></html>`, { headers: { 'Content-Type': 'text/html' } })
  }

  if (!code) {
    return new NextResponse('Código no encontrado', { status: 400 })
  }

  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_OAUTH_CLIENT_ID,
      process.env.GOOGLE_OAUTH_CLIENT_SECRET,
      `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/api/drive-auth/callback`
    )

    const { tokens } = await oauth2Client.getToken(code)
    const refreshToken = tokens.refresh_token

    if (!refreshToken) {
      return new NextResponse(`<html><body style="font-family:monospace;padding:40px;background:#1a1a1a;color:#e8e8e8">
        <h2 style="color:#e67e22">⚠️ No se devolvió refresh_token</h2>
        <p>Revoca el acceso en <a href="https://myaccount.google.com/permissions" style="color:#c9a96e">myaccount.google.com/permissions</a> y vuelve a intentarlo.</p>
      </body></html>`, { headers: { 'Content-Type': 'text/html' } })
    }

    return new NextResponse(`<html><body style="font-family:monospace;padding:40px;background:#1a1a1a;color:#e8e8e8;max-width:800px">
      <h2 style="color:#2ecc71">✅ ¡Autorización completada!</h2>
      <p style="color:#aaa">Copia este valor y añádelo en <code style="color:#c9a96e">.env.local</code> y en Vercel:</p>
      <pre style="background:#2d2d2d;padding:20px;border-radius:8px;border:1px solid #444;word-break:break-all;white-space:pre-wrap;color:#c9a96e">GOOGLE_OAUTH_REFRESH_TOKEN=${refreshToken}</pre>
      <p style="color:#aaa;margin-top:20px">Después reinicia el servidor (<code>npm run dev</code>) y prueba de nuevo.</p>
    </body></html>`, { headers: { 'Content-Type': 'text/html' } })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return new NextResponse(`<html><body style="font-family:monospace;padding:40px;background:#1a1a1a;color:#e8e8e8">
      <h2 style="color:#e74c3c">❌ Error al obtener tokens</h2>
      <pre style="color:#e74c3c">${msg}</pre>
    </body></html>`, { headers: { 'Content-Type': 'text/html' } })
  }
}

