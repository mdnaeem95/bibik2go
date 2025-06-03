/* eslint-disable @typescript-eslint/no-explicit-any */
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

// Recursive function to search for files in folders
const searchFilesRecursively = async (drive: any, folderId: string, incidentId: string): Promise<any[]> => {
  const allFiles: any[] = [];
  
  try {
    // Get all items in the current folder
    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed=false`,
      fields: 'files(id, name, mimeType, size, webViewLink, webContentLink, thumbnailLink, createdTime, parents)',
    });

    const items = response.data.files || [];
    
    for (const item of items) {
      if (item.mimeType === 'application/vnd.google-apps.folder') {
        // If it's a folder, check if it's related to our incident
        if (item.name?.includes(`Incident_${incidentId}`) || 
            item.name?.includes('temp_') || 
            item.name?.includes(incidentId)) {
          // Recursively search this folder
          const subFiles = await searchFilesRecursively(drive, item.id!, incidentId);
          allFiles.push(...subFiles);
        } else {
          // Still search subfolders in case the incident folder is nested
          const subFiles = await searchFilesRecursively(drive, item.id!, incidentId);
          allFiles.push(...subFiles);
        }
      } else {
        // If it's a file, check if it's related to our incident
        if (item.name?.includes(`Incident${incidentId}`) || 
            item.name?.includes(`temp_${incidentId}`) ||
            item.name?.includes(incidentId)) {
          allFiles.push(item);
        }
      }
    }
  } catch (error) {
    console.error(`Error searching folder ${folderId}:`, error);
  }
  
  return allFiles;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id: incidentId } = req.query as { id: string };

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const drive = getDriveClient();
    
    console.log('Searching for incident ID:', incidentId);

    // Start searching from the main incident media folder
    const baseFolderId = process.env.INCIDENT_MEDIA_FOLDER_ID;
    
    if (!baseFolderId) {
      return res.status(500).json({ error: 'Incident media folder not configured' });
    }

    // Method 1: Search recursively through folder structure
    const filesFromFolders = await searchFilesRecursively(drive, baseFolderId, incidentId);
    
    // Method 2: Also try global search with various patterns
    const searchQueries = [
      `name contains 'Incident_${incidentId}' and trashed=false`,
      `name contains 'temp_${incidentId}' and trashed=false`,
      `name contains '${incidentId}' and trashed=false`,
      `name contains 'Incident${incidentId}' and trashed=false`
    ];

    const globalFiles: any[] = [];
    for (const query of searchQueries) {
      try {
        const response = await drive.files.list({
          q: query,
          fields: 'files(id, name, mimeType, size, webViewLink, webContentLink, thumbnailLink, createdTime, parents)',
          orderBy: 'createdTime desc',
        });
        if (response.data.files) {
          globalFiles.push(...response.data.files);
        }
      } catch (error) {
        console.error('Error with query:', query, error);
      }
    }

    // Combine results and remove duplicates
    const allFiles = [...filesFromFolders, ...globalFiles];
    const uniqueFiles = allFiles.filter((file, index, self) => 
      index === self.findIndex(f => f.id === file.id)
    );

    console.log('Found files:', uniqueFiles.map(f => ({ name: f.name, id: f.id })));
    
    // Filter and format media files
    const mediaFiles = uniqueFiles
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

    console.log('Final media files:', mediaFiles.length);

    return res.status(200).json({ mediaFiles });

  } catch (error) {
    console.error('Error fetching incident media:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch media files', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}