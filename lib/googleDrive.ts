import { google } from 'googleapis'
import { Readable } from 'stream'

export function isDriveConfigured(): boolean {
  return !!(
    process.env.GOOGLE_OAUTH_CLIENT_ID &&
    process.env.GOOGLE_OAUTH_CLIENT_SECRET &&
    process.env.GOOGLE_OAUTH_REFRESH_TOKEN &&
    process.env.GOOGLE_DRIVE_FOLDER_ID
  )
}

function getDriveClient() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_OAUTH_CLIENT_ID,
    process.env.GOOGLE_OAUTH_CLIENT_SECRET,
  )
  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_OAUTH_REFRESH_TOKEN,
  })
  return google.drive({ version: 'v3', auth: oauth2Client })
}

export async function uploadFileToDrive(
  buffer: Buffer,
  fileName: string,
  mimeType: string,
): Promise<{ fileId: string; webViewLink: string } | null> {
  if (!isDriveConfigured()) return null

  const drive = getDriveClient()
  const stream = Readable.from(buffer)

  const res = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: [process.env.GOOGLE_DRIVE_FOLDER_ID!],
    },
    media: { mimeType, body: stream },
    fields: 'id,webViewLink',
  })

  return {
    fileId: res.data.id ?? '',
    webViewLink: res.data.webViewLink ?? '',
  }
}
