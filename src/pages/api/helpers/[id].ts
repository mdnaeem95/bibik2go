// src/pages/api/helpers/[id].ts - Improved version
import type { NextApiRequest, NextApiResponse } from 'next';
import { getIronSession } from 'iron-session';
import { updateHelper, deleteHelper, NewHelper } from '@/lib/sheets';
import { sessionOptions, SessionUser, canEdit, canDelete } from '@/lib/session';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query as { id: string };
  console.log('🤖 PUT /api/helpers/[id] – id=', id, 'body=', req.body);

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
      // Check if user can edit helpers
      if (!canEdit(session.user.role)) {
        return res.status(403).json({ 
          error: 'Insufficient permissions. Staff or Admin role required to edit helpers.' 
        });
      }

      const payload = req.body as Partial<NewHelper>;
      
      // IMPROVED: Validate totalEmployers if provided
      if (payload.totalEmployers !== undefined && payload.totalEmployers < 1) {
        payload.totalEmployers = 1; // Ensure minimum of 1
      }
      
      // IMPROVED: Validate outstandingLoan if provided
      if (payload.outstandingLoan !== undefined && payload.outstandingLoan < 0) {
        payload.outstandingLoan = 0; // Ensure non-negative
      }

      // IMPROVED: Set default transferStatus if empty
      if (payload.transferStatus !== undefined && !payload.transferStatus) {
        payload.transferStatus = 'New';
      }

      // IMPROVED: Set default pt if empty
      if (payload.pt !== undefined && !payload.pt.trim()) {
        payload.pt = 'Not specified';
      }

      console.log('🔧 Validated payload:', payload);

      await updateHelper(id, payload);
      return res.status(200).json({ message: 'Updated' });
    }

    if (req.method === 'DELETE') {
      // Check if user can delete helpers
      if (!canDelete(session.user.role)) {
        return res.status(403).json({ 
          error: 'Insufficient permissions. Staff or Admin role required to delete helpers.' 
        });
      }

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