// src/pages/api/helpers/[id].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { updateHelper, deleteHelper, NewHelper } from '@/lib/sheets';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query as { id: string };
  console.log('🤖 PUT /api/helpers/[id] – id=', id, 'body=', req.body);

  try {
    if (req.method === 'PUT') {
      const payload = req.body as NewHelper;
      await updateHelper(id, payload);
      return res.status(200).json({ message: 'Updated' });
    }

    if (req.method === 'DELETE') {
      await deleteHelper(id);
      return res.status(204).end();
    }

    res.setHeader('Allow', ['PUT', 'DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (err: unknown) {
    console.error('Helpers/[id] API error:', err);
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: message });
  }
}
