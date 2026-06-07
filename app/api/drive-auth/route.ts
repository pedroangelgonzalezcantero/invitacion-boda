import { NextResponse } from 'next/server'
import { google } from 'googleapis'

export const runtime = 'nodejs'

function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_OAUTH_CLIENT_ID,
    process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/api/drive-auth/callback`
  )
}

// GET /api/drive-auth → redirige a Google para autorizar
export async function GET() {
  const oauth2Client = getOAuth2Client()
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent', // fuerza devolver refresh_token
    scope: ['https://www.googleapis.com/auth/drive.file'],
  })
  return NextResponse.redirect(url)
}

