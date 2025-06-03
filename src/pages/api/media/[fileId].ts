// src/pages/api/media/[fileId].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';
import { JWT } from 'google-auth-library';

const getDriveClient = () => {
  const auth = new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
    key: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    scopes: [
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/drive',
    ],
  });

  return google.drive({ version: 'v3', auth });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { fileId } = req.query as { fileId: string };

  try {
    const drive = getDriveClient();

    if (req.method === 'GET') {
      // Get file metadata
      const file = await drive.files.get({
        fileId: fileId,
        fields: 'id, name, mimeType, size, webViewLink, webContentLink, thumbnailLink, createdTime',
      });

      return res.status(200).json(file.data);
    }

    if (req.method === 'DELETE') {
      // Delete file from Google Drive
      await drive.files.delete({
        fileId: fileId,
      });

      return res.status(200).json({ message: 'File deleted successfully' });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('File operation error:', error);
    return res.status(500).json({ 
      error: 'Operation failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}