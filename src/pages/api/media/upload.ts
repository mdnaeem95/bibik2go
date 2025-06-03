/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';
import { JWT } from 'google-auth-library';
import formidable from 'formidable';
import fs from 'fs';

// Disable Next.js body parsing for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

// Initialize Google Drive API
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

// Create or get the incident media folder with better structure
const getOrCreateMediaFolder = async (drive: any, incidentId: string, helperName?: string, helperCurrentEmployer?: string) => {
  // If we have a shared incident media folder, use it as the base
  if (process.env.INCIDENT_MEDIA_FOLDER_ID) {
    let currentFolderId = process.env.INCIDENT_MEDIA_FOLDER_ID;
    
    // Create helper-specific folder if we have helper info
    if (helperName) {
      const sanitizedHelperName = helperName.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '_');
      const helperFolderName = helperCurrentEmployer 
        ? `${sanitizedHelperName}_${helperCurrentEmployer.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '_')}`
        : sanitizedHelperName;
      
      // Check if helper folder exists
      const existingHelperFolders = await drive.files.list({
        q: `name='${helperFolderName}' and mimeType='application/vnd.google-apps.folder' and '${currentFolderId}' in parents and trashed=false`,
        fields: 'files(id, name)',
      });

      if (existingHelperFolders.data.files && existingHelperFolders.data.files.length > 0) {
        currentFolderId = existingHelperFolders.data.files[0].id;
      } else {
        // Create helper folder
        const helperFolderMetadata = {
          name: helperFolderName,
          mimeType: 'application/vnd.google-apps.folder',
          parents: [currentFolderId],
        };

        const helperFolder = await drive.files.create({
          requestBody: helperFolderMetadata,
          fields: 'id',
        });

        currentFolderId = helperFolder.data.id;
      }
    }
    
    // Create incident-specific subfolder using the consistent incident ID
    if (incidentId) {
      const incidentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const incidentFolderName = `Incident_${incidentId}_${incidentDate}`;
      
      // Check if incident subfolder exists
      const existingIncidentFolders = await drive.files.list({
        q: `name='${incidentFolderName}' and mimeType='application/vnd.google-apps.folder' and '${currentFolderId}' in parents and trashed=false`,
        fields: 'files(id, name)',
      });

      if (existingIncidentFolders.data.files && existingIncidentFolders.data.files.length > 0) {
        return existingIncidentFolders.data.files[0].id;
      }

      // Create incident-specific subfolder
      const incidentFolderMetadata = {
        name: incidentFolderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [currentFolderId],
      };

      const incidentFolder = await drive.files.create({
        requestBody: incidentFolderMetadata,
        fields: 'id',
      });

      return incidentFolder.data.id;
    }
    
    // Return current folder ID (helper folder or base folder)
    return currentFolderId;
  }

  // Fallback: create folder in root (shouldn't happen with proper setup)
  const folderName = incidentId ? `Incident_${incidentId}_Media` : 'IncidentMedia';
  
  const existingFolders = await drive.files.list({
    q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: 'files(id, name)',
  });

  if (existingFolders.data.files && existingFolders.data.files.length > 0) {
    return existingFolders.data.files[0].id;
  }

  const folderMetadata = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder',
  };

  const folder = await drive.files.create({
    requestBody: folderMetadata,
    fields: 'id',
  });

  return folder.data.id;
};

// Generate thumbnail for video files
const generateThumbnail = async (drive: any, fileId: string) => {
  try {
    const response = await drive.files.get({
      fileId: fileId,
      fields: 'thumbnailLink',
    });
    return response.data.thumbnailLink;
  } catch (error) {
    console.error('Error generating thumbnail:', error);
    return null;
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const drive = getDriveClient();

    // Parse the multipart form data
    const form = formidable({
      maxFileSize: 50 * 1024 * 1024, // 50MB
      keepExtensions: true,
    });

    const [fields, files] = await form.parse(req);
    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    
    // Extract form fields - use provided incidentId or generate a new one
    let incidentId = Array.isArray(fields.incidentId) ? fields.incidentId[0] : fields.incidentId;
    const helperName = Array.isArray(fields.helperName) ? fields.helperName[0] : fields.helperName;
    const helperCurrentEmployer = Array.isArray(fields.helperCurrentEmployer) ? fields.helperCurrentEmployer[0] : fields.helperCurrentEmployer;
    const description = Array.isArray(fields.description) ? fields.description[0] : fields.description;
    
    // Generate a single consistent incident ID if not provided or if it's a temp ID
    if (!incidentId || incidentId.startsWith('temp_')) {
      incidentId = Date.now().toString();
      console.log('Generated new incident ID:', incidentId);
    }

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Validate file type
    const isImage = file.mimetype?.startsWith('image/');
    const isVideo = file.mimetype?.startsWith('video/');

    if (!isImage && !isVideo) {
      return res.status(400).json({ error: 'Only image and video files are allowed' });
    }

    // Validate file size (additional check)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return res.status(400).json({ error: 'File size exceeds 50MB limit' });
    }

    // Get or create the media folder using the consistent incident ID
    const folderId = await getOrCreateMediaFolder(drive, incidentId, helperName, helperCurrentEmployer);

    // Create a more intuitive filename using the consistent incident ID
    const currentDate = new Date();
    const dateString = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD
    const timeString = currentDate.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS
    
    // Get file extension
    const originalName = file.originalFilename || 'upload';
    const fileExtension = originalName.split('.').pop() || '';
    const baseName = originalName.split('.').slice(0, -1).join('.') || 'upload';
    
    // Create descriptive filename using consistent incident ID
    let fileName = '';
    if (helperName && incidentId) {
      const sanitizedHelperName = helperName.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '_');
      const shortDescription = description 
        ? `_${description.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '_').substring(0, 30)}`
        : '';
      fileName = `${dateString}_${timeString}_${sanitizedHelperName}_Incident${incidentId}${shortDescription}.${fileExtension}`;
    } else if (incidentId) {
      fileName = `${dateString}_${timeString}_Incident${incidentId}_${baseName}.${fileExtension}`;
    } else {
      fileName = `${dateString}_${timeString}_${baseName}.${fileExtension}`;
    }

    const fileMetadata = {
      name: fileName,
      parents: [folderId],
      description: `Incident media upload${helperName ? ` for ${helperName}` : ''}${incidentId ? ` (Incident ${incidentId})` : ''}${description ? `: ${description}` : ''}`,
    };

    // Upload file to Google Drive
    const media = {
      mimeType: file.mimetype || 'application/octet-stream',
      body: fs.createReadStream(file.filepath),
    };

    const driveFile = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, name, webViewLink, webContentLink, mimeType, size, createdTime',
    });

    // Make file accessible to anyone with the link (adjust permissions as needed)
    // if (driveFile.data.id) {
    //   await drive.permissions.create({
    //     fileId: driveFile.data.id,
    //     resource: {
    //       role: 'reader',
    //       type: 'anyone',
    //     },
    //   });
    // }

    // Generate thumbnail for videos (async)
    let thumbnailLink = null;
    if (isVideo) {
      // Wait a bit for Google Drive to process the video
      setTimeout(async () => {
        thumbnailLink = await generateThumbnail(drive, driveFile.data.id!);
      }, 2000);
    }

    // Clean up temporary file
    try {
      fs.unlinkSync(file.filepath);
    } catch (error) {
      console.error('Error cleaning up temp file:', error);
    }

    // Construct the direct download URL
    const directDownloadUrl = `https://drive.google.com/uc?export=download&id=${driveFile.data.id}`;

    // Return file information with the consistent incident ID
    const response = {
      id: `drive_${driveFile.data.id}_${Date.now()}`,
      incidentId: incidentId, // Return the consistent incident ID
      driveFileId: driveFile.data.id,
      name: driveFile.data.name,
      mimeType: driveFile.data.mimeType,
      size: driveFile.data.size,
      webViewLink: driveFile.data.webViewLink,
      webContentLink: driveFile.data.webContentLink,
      directDownloadUrl: directDownloadUrl,
      thumbnailLink: thumbnailLink,
      createdTime: driveFile.data.createdTime,
      folderId: folderId,
    };

    return res.status(200).json(response);

  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ 
      error: 'Upload failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}