// src/pages/api/debug-google-auth.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return res.status(200).json({
    // Check if environment variables exist
    hasGoogleEmail: !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    hasGoogleKey: !!process.env.GOOGLE_PRIVATE_KEY,
    hasSheetId: !!process.env.SHEET_ID,
    
    // Check lengths
    googleEmailLength: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.length || 0,
    googleKeyLength: process.env.GOOGLE_PRIVATE_KEY?.length || 0,
    sheetIdLength: process.env.SHEET_ID?.length || 0,
    
    // Check format
    emailFormat: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.includes('@') ? 'valid' : 'invalid',
    keyFormat: process.env.GOOGLE_PRIVATE_KEY?.includes('BEGIN PRIVATE KEY') ? 'valid' : 'invalid',
    
    // First few characters (to verify without exposing secrets)
    emailPreview: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.substring(0, 20) + '...',
    keyPreview: process.env.GOOGLE_PRIVATE_KEY?.substring(0, 50) + '...',
    sheetIdPreview: process.env.SHEET_ID?.substring(0, 10) + '...',
  });
}