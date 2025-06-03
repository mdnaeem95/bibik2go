// src/pages/api/test-drive.ts
// Create this file to test your Google Drive setup
import type { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';
import { JWT } from 'google-auth-library';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const results = {
    environmentVariables: {},
    driveApiTest: {},
    folderTest: {},
    permissionsTest: {}
  };

  try {
    // Test 1: Check Environment Variables
    console.log('🔍 Testing environment variables...');
    results.environmentVariables = {
      hasServiceAccountEmail: !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      hasPrivateKey: !!process.env.GOOGLE_PRIVATE_KEY,
      hasParentFolderId: !!process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID,
      serviceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || 'NOT_SET',
      parentFolderId: process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID || 'NOT_SET'
    };

    if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
      throw new Error('Missing required environment variables');
    }

    // Test 2: Initialize Drive API
    console.log('🔧 Testing Drive API initialization...');
    const auth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      scopes: [
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/drive',
      ],
    });

    const drive = google.drive({ version: 'v3', auth });

    // Test 3: Test Drive API Connection
    console.log('🌐 Testing Drive API connection...');
    try {
      const aboutResponse = await drive.about.get({ fields: 'user, storageQuota' });
      results.driveApiTest = {
        success: true,
        userEmail: aboutResponse.data.user?.emailAddress,
        storageUsed: aboutResponse.data.storageQuota?.usage,
        storageLimit: aboutResponse.data.storageQuota?.limit
      };
    } catch (driveError) {
      results.driveApiTest = {
        success: false,
        error: driveError instanceof Error ? driveError.message : 'Unknown error'
      };
    }

    // Test 4: Test Folder Operations
    console.log('📁 Testing folder operations...');
    try {
      const testFolderName = `Test_${Date.now()}`;
      
      // Create a test folder
      const folderMetadata = {
        name: testFolderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID ? [process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID] : undefined,
      };

      const folder = await drive.files.create({
        requestBody: folderMetadata,
        fields: 'id, name, parents, webViewLink',
      });

      results.folderTest = {
        success: true,
        folderId: folder.data.id,
        folderName: folder.data.name,
        folderLink: folder.data.webViewLink,
        parents: folder.data.parents
      };

      // Clean up - delete the test folder
      try {
        await drive.files.delete({ fileId: folder.data.id! });
        console.log('🗑️ Test folder cleaned up');
      } catch (cleanupError) {
        console.warn('⚠️ Could not clean up test folder:', cleanupError);
      }

    } catch (folderError) {
      results.folderTest = {
        success: false,
        error: folderError instanceof Error ? folderError.message : 'Unknown error'
      };
    }

    // Test 5: Test Permissions
    console.log('🔐 Testing permissions...');
    try {
      // List some files to test read permissions
      const filesList = await drive.files.list({
        pageSize: 5,
        fields: 'files(id, name, mimeType)',
      });

      results.permissionsTest = {
        success: true,
        canListFiles: true,
        filesCount: filesList.data.files?.length || 0,
        sampleFiles: filesList.data.files?.map(f => ({ id: f.id, name: f.name, type: f.mimeType }))
      };
    } catch (permError) {
      results.permissionsTest = {
        success: false,
        error: permError instanceof Error ? permError.message : 'Unknown error'
      };
    }

    console.log('✅ All tests completed');
    return res.status(200).json({
      success: true,
      message: 'Google Drive setup test completed',
      results
    });

  } catch (error) {
    console.error('💥 Test failed:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      results
    });
  }
}