/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';
import { JWT } from 'google-auth-library';
import formidable from 'formidable';
import fs from 'fs';
// import path from 'path';

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

// Create or get the incident media folder
const getOrCreateMediaFolder = async (drive: any, incidentId?: string) => {
  const folderName = incidentId ? `Incident_${incidentId}_Media` : 'IncidentMedia';
  
  // First, try to find existing folder
  const existingFolders = await drive.files.list({
    q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: 'files(id, name)',
  });

  if (existingFolders.data.files && existingFolders.data.files.length > 0) {
    return existingFolders.data.files[0].id;
  }

  // Create new folder if it doesn't exist
  const folderMetadata = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder',
    parents: process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID ? [process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID] : undefined,
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
    //const fileType = Array.isArray(fields.type) ? fields.type[0] : fields.type;
    const incidentId = Array.isArray(fields.incidentId) ? fields.incidentId[0] : fields.incidentId;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Validate file type
    const isImage = file.mimetype?.startsWith('image/');
    const isVideo = file.mimetype?.startsWith('video/');

    if (!isImage && !isVideo) {
      return res.status(400).json({ error: 'Only image and video files are allowed' });
    }

    // Get or create the media folder
    const folderId = await getOrCreateMediaFolder(drive, incidentId);

    // Prepare file metadata
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    //const fileExtension = path.extname(file.originalFilename || '');
    const sanitizedName = `${timestamp}_${(file.originalFilename || 'upload').replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    const fileMetadata = {
      name: sanitizedName,
      parents: [folderId],
      description: `Uploaded via Incident Management System${incidentId ? ` for Incident ${incidentId}` : ''}`,
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

    // Make file accessible (optional - you might want to restrict this)
    // await drive.permissions.create({
    //   fileId: driveFile.data.id,
    //   requestBody: {
    //     role: 'reader',
    //     type: 'anyone', // Be careful with this in production
    //   },
    // });

    // Generate thumbnail for videos
    let thumbnailLink = null;
    if (isVideo) {
      // Wait a bit for Google Drive to process the video
      setTimeout(async () => {
        thumbnailLink = await generateThumbnail(drive, driveFile.data.id!);
      }, 2000);
    }

    // Clean up temporary file
    fs.unlinkSync(file.filepath);

    // Construct the direct download URL
    const directDownloadUrl = `https://drive.google.com/uc?export=download&id=${driveFile.data.id}`;

    // Return file information
    const response = {
      id: `drive_${driveFile.data.id}_${Date.now()}`,
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