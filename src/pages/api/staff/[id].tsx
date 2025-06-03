// src/pages/api/staff/[id].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { updateStaff, deleteStaff, NewStaff } from '@/lib/sheets';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query as { id: string };
  console.log('🤖 PUT /api/staff/[id] – id=', id, 'body=', req.body);

  try {
    if (req.method === 'PUT') {
      const payload = req.body as NewStaff;
      await updateStaff(id, payload);
      return res.status(200).json({ message: 'Updated' });
    }

    if (req.method === 'DELETE') {
      await deleteStaff(id);
      return res.status(204).end();
    }

    res.setHeader('Allow', ['PUT', 'DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (err: unknown) {
    console.error('Staff/[id] API error:', err);
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: message });
  }
}