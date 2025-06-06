import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return res.status(200).json({
    hasSessionPassword: !!process.env.SESSION_PASSWORD,
    sessionPasswordLength: process.env.SESSION_PASSWORD?.length || 0,
    hasGoogleEmail: !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    hasGoogleKey: !!process.env.GOOGLE_PRIVATE_KEY,
    hasSheetId: !!process.env.SHEET_ID,
    nodeEnv: process.env.NODE_ENV,
    // Show first few characters to verify it's the right value
    sessionPasswordPreview: process.env.SESSION_PASSWORD?.substring(0, 10) + '...',
  });
}