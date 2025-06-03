// scripts/testDriveAccess.js
/* eslint-disable @typescript-eslint/no-require-imports */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });
const { google } = require('googleapis');
const { JWT } = require('google-auth-library');

async function testDriveAccess() {
  try {
    console.log('🔍 Testing Google Drive access...');
    
    // Extract folder ID from the URL
    // const folderUrl = 'https://drive.google.com/drive/folders/1IL55fe9oWLF9CWmQxFv2uI9wcrLo7mml';
    const folderId = '1IL55fe9oWLF9CWmQxFv2uI9wcrLo7mml';
    
    console.log('📂 Folder ID:', folderId);
    console.log('🔑 Service Account:', process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL);

    const jwt = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/drive'],
    });

    const drive = google.drive({ version: 'v3', auth: jwt });

    // Test 1: Get folder details
    console.log('\n📋 Test 1: Getting folder details...');
    const folder = await drive.files.get({
      fileId: folderId,
      fields: 'id, name, webViewLink, permissions',
    });

    console.log('✅ Folder accessible!');
    console.log('   Name:', folder.data.name);
    console.log('   ID:', folder.data.id);
    console.log('   Link:', folder.data.webViewLink);

    // Test 2: List files in folder
    console.log('\n📁 Test 2: Listing files in folder...');
    const files = await drive.files.list({
      q: `'${folderId}' in parents`,
      fields: 'files(id, name, mimeType, webViewLink)',
    });

    console.log(`✅ Found ${files.data.files.length} files in folder:`);
    files.data.files.forEach((file, index) => {
      console.log(`   ${index + 1}. ${file.name} (${file.mimeType})`);
    });

    // Test 3: Create a test file
    console.log('\n📝 Test 3: Creating a test file...');
    const testFile = await drive.files.create({
      resource: {
        name: `test-access-${Date.now()}.txt`,
        parents: [folderId],
      },
      media: {
        mimeType: 'text/plain',
        body: 'This is a test file created by the service account to verify write access.',
      },
      fields: 'id, name, webViewLink',
    });

    console.log('✅ Test file created successfully!');
    console.log('   Name:', testFile.data.name);
    console.log('   ID:', testFile.data.id);
    console.log('   Link:', testFile.data.webViewLink);

    // Test 4: Clean up test file
    console.log('\n🗑️  Test 4: Cleaning up test file...');
    await drive.files.delete({
      fileId: testFile.data.id,
    });
    console.log('✅ Test file deleted successfully!');

    console.log('\n🎉 All tests passed! Your service account has full access to the folder.');
    console.log('\n📝 Add this to your .env.local file:');
    console.log(`INCIDENT_MEDIA_FOLDER_ID=${folderId}`);

  } catch (error) {
    console.error('❌ Error testing drive access:', error);
    
    if (error.code === 404) {
      console.error('   The folder was not found or is not accessible to the service account.');
    } else if (error.code === 403) {
      console.error('   Permission denied. Make sure the service account has Editor access.');
    }
  }
}

testDriveAccess();