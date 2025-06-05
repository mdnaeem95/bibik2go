// src/pages/api/incidents/[id].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getIronSession } from 'iron-session';
import { updateIncident, deleteIncident, NewIncident } from '@/lib/sheets';
import { sessionOptions, SessionUser, canEdit, canDelete } from '@/lib/session';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query as { id: string };
  console.log('🤖 API /api/incidents/[id] – id=', id, 'method=', req.method);

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

    if (req.method === 'PUT') {
      // Check if user can edit incidents
      if (!canEdit(session.user.role)) {
        return res.status(403).json({ 
          error: 'Insufficient permissions. Staff or Admin role required to edit incidents.' 
        });
      }

      const payload = req.body as Partial<NewIncident>;
      await updateIncident(id, payload);
      return res.status(200).json({ message: 'Updated' });
    }

    if (req.method === 'DELETE') {
      // Check if user can delete incidents
      if (!canDelete(session.user.role)) {
        return res.status(403).json({ 
          error: 'Insufficient permissions. Staff or Admin role required to delete incidents.' 
        });
      }

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