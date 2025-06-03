// src/pages/api/incidents/[id]/media.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';
import { JWT } from 'google-auth-library';

const getDriveClient = () => {
  const auth = new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
    key: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    scopes: [
      'https://www.googleapis.com/auth/drive.readonly',
    ],
  });

  return google.drive({ version: 'v3', auth });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id: incidentId } = req.query as { id: string };

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const drive = getDriveClient();

    // Search for incident-specific folder or files
    const query = `name contains 'Incident_${incidentId}' and trashed=false`;
    
    const response = await drive.files.list({
      q: query,
      fields: 'files(id, name, mimeType, size, webViewLink, webContentLink, thumbnailLink, createdTime, parents)',
      orderBy: 'createdTime desc',
    });

    const files = response.data.files || [];
    console.log('Files', files)
    
    // Filter and format media files
    const mediaFiles = files
      .filter(file => 
        file.mimeType?.startsWith('image/') || 
        file.mimeType?.startsWith('video/')
      )
      .map(file => ({
        id: file.id,
        name: file.name,
        mimeType: file.mimeType,
        size: file.size,
        type: file.mimeType?.startsWith('image/') ? 'image' : 'video',
        url: file.webViewLink,
        downloadUrl: file.webContentLink,
        thumbnailUrl: file.thumbnailLink,
        createdTime: file.createdTime,
      }));

    return res.status(200).json({ mediaFiles });

  } catch (error) {
    console.error('Error fetching incident media:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch media files', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}