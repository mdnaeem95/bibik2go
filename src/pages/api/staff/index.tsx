import type { NextApiRequest, NextApiResponse } from 'next';
import {
  getAllStaff,
  NewStaff,
  addStaff,
} from '@/lib/sheets';

export interface Staff {
  id: string;
  name: string;
  role: string;
  email: string;
  contact: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Staff[] | { id: string } | { error: string }>
) {
  try {
    if (req.method === 'GET') {
      const rawRows = await getAllStaff(); 
      const staff: Staff[] = rawRows.map((r) => ({
        id: r.id,
        name: r.name,
        role: r.role,
        email: r.email,
        contact: r.contact,
      }));
      return res.status(200).json(staff);
    }

    if (req.method === 'POST') {
      const payload = req.body as NewStaff;
      const newRow = await addStaff(payload);
      return res.status(201).json({ id: newRow.id });
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
    } catch (err: unknown) {
        console.error('Staff API error:', err);
        const message = err instanceof Error ? err.message : String(err);
        return res.status(500).json({ error: message });
    }
}
