import type { NextApiRequest, NextApiResponse } from 'next';
import {
  getAllHelpers,
  addHelper,
  NewHelper,
} from '@/lib/sheets';

export interface Helper {
  id: string;
  name: string;
  currentEmployer: string;
  problem: string;
  totalEmployers: number;
  eaOfficer: string;
  outstandingLoan: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Helper[] | { id: string } | { error: string }>
) {
  try {
    if (req.method === 'GET') {
      const rawRows = await getAllHelpers(); 
      const helpers: Helper[] = rawRows.map((r) => ({
        id: r.id,
        name: r.name,
        currentEmployer: r.currentEmployer,
        problem: r.problem,
        totalEmployers: Number(r.totalEmployers),
        eaOfficer: r.eaOfficer,
        outstandingLoan: Number(r.outstandingLoan),
      }));
      return res.status(200).json(helpers);
    }

    if (req.method === 'POST') {
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
