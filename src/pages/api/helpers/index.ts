// src/pages/api/helpers/index.ts - Improved version
import type { NextApiRequest, NextApiResponse } from 'next';
import { getIronSession } from 'iron-session';
import {
  getAllHelpers,
  addHelper,
  NewHelper,
} from '@/lib/sheets';
import { sessionOptions, SessionUser, canCreate } from '@/lib/session';
import { TransferStatus } from '@/types';

export interface Helper {
  id: string;
  name: string;
  currentEmployer: string;
  problem: string;
  totalEmployers: number;
  eaOfficer: string;
  outstandingLoan: number;
  employmentStartDate: string;
  pt: string;
  transferStatus: TransferStatus;
}

// Helper function to safely convert to number with minimum value
function safeNumberConvert(value: string | undefined, minValue: number = 0): number {
  if (!value || value === '') return minValue;
  const num = Number(value);
  return isNaN(num) ? minValue : Math.max(num, minValue);
}

// Helper function to ensure string has default value
function safeStringConvert(value: string | undefined, defaultValue: string = ''): string {
  return value && value.trim() !== '' ? value.trim() : defaultValue;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Helper[] | { id: string } | { error: string }>
) {
  try {
    // Get session for all requests
    const session = await getIronSession<{ user?: SessionUser }>(
      req,
      res,
      sessionOptions
    );

    // Check if user is authenticated
    if (!session.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (req.method === 'GET') {
      // All authenticated users can view helpers
      const rawRows = await getAllHelpers(); 
      const helpers: Helper[] = rawRows.map((r) => ({
        id: r.id,
        name: r.name,
        currentEmployer: r.currentEmployer,
        problem: r.problem,
        // IMPROVED: Ensure totalEmployers is at least 1
        totalEmployers: safeNumberConvert(r.totalEmployers, 1), // Minimum 1 employer
        eaOfficer: r.eaOfficer,
        // IMPROVED: Handle outstanding loan conversion
        outstandingLoan: safeNumberConvert(r.outstandingLoan, 0),
        employmentStartDate: r.employmentStartDate,
        // IMPROVED: Handle PT with default
        pt: safeStringConvert(r.pt, 'Not specified'),
        // IMPROVED: Handle transferStatus with default
        transferStatus: (r.transferStatus as TransferStatus) || 'New',
      }));

      // Add debug logging (remove in production)
      console.log('🔍 API Debug - Sample helper data:');
      if (helpers.length > 0) {
        const sample = helpers[0];
        console.log('   Raw totalEmployers:', rawRows[0]?.totalEmployers);
        console.log('   Converted totalEmployers:', sample.totalEmployers);
        console.log('   Raw pt:', rawRows[0]?.pt);
        console.log('   Converted pt:', sample.pt);
      }

      return res.status(200).json(helpers);
    }

    if (req.method === 'POST') {
      // Check if user can create helpers
      if (!canCreate(session.user.role)) {
        return res.status(403).json({ 
          error: 'Insufficient permissions. Staff or Admin role required to create helpers.' 
        });
      }

      const payload = req.body as NewHelper;
      
      // IMPROVED: Validate totalEmployers on creation
      if (payload.totalEmployers < 1) {
        payload.totalEmployers = 1; // Ensure minimum of 1
      }
      
      const newRow = await addHelper(payload);
      return res.status(201).json({ id: newRow.id });
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (err: unknown) {
    console.error('Helpers API error:', err);
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: message });
  }
}