// src/pages/api/incidents/[id].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { updateIncident, deleteIncident, NewIncident } from '@/lib/sheets';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query as { id: string };
  console.log('🤖 PUT /api/incidents/[id] – id=', id, 'body=', req.body);

  try {
    if (req.method === 'PUT') {
      const payload = req.body as Partial<NewIncident>;
      await updateIncident(id, payload);
      return res.status(200).json({ message: 'Updated' });
    }

    if (req.method === 'DELETE') {
      await deleteIncident(id);
      return res.status(204).end();
    }

    res.setHeader('Allow', ['PUT', 'DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (err: unknown) {
    console.error('Incidents/[id] API error:', err);
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: message });
  }
}