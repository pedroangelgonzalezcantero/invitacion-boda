import { google } from 'googleapis'
import { Readable } from 'stream'

export function isDriveConfigured(): boolean {
  return !!(
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
    process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY &&
    process.env.GOOGLE_DRIVE_FOLDER_ID
  )
}

function getDriveClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/drive.file'],
  })
  return google.drive({ version: 'v3', auth })
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

