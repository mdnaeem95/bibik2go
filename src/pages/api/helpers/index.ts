// src/pages/api/helpers/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getIronSession } from 'iron-session';
import {
  getAllHelpers,
  addHelper,
  NewHelper,
} from '@/lib/sheets';
import { sessionOptions, SessionUser, canCreate } from '@/lib/session';


export interface Helper {
  id: string;
  name: string;
  currentEmployer: string;
  problem: string;
  totalEmployers: number;
  eaOfficer: string;
  outstandingLoan: number;
  employmentStartDate: string;
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
        totalEmployers: Number(r.totalEmployers),
        eaOfficer: r.eaOfficer,
        outstandingLoan: Number(r.outstandingLoan),
        employmentStartDate: r.employmentStartDate
      }));
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