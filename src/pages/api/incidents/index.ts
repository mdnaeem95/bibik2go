// src/pages/api/incidents/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getIronSession } from 'iron-session';
import {
  getAllIncidents,
  addIncident,
  NewIncident,
} from '@/lib/sheets';
import { sessionOptions, SessionUser, canCreate } from '@/lib/session';

export interface Incident {
  id: string;
  helperId: string;
  incidentDate: string;
  description: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  reportedBy: string;
  status: 'Open' | 'Resolved' | 'Under Review';
  resolution?: string;
  createdAt: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Incident[] | { id: string } | { error: string }>
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
      // All authenticated users can view incidents
      const { helperId } = req.query;
      
      const rawRows = await getAllIncidents();
      let incidents: Incident[] = rawRows.map((r) => ({
        id: r.id,
        helperId: r.helperId,
        incidentDate: r.incidentDate,
        description: r.description,
        severity: r.severity as Incident['severity'],
        reportedBy: r.reportedBy,
        status: r.status as Incident['status'],
        resolution: r.resolution,
        createdAt: r.createdAt,
      }));

      // Filter by helperId if provided
      if (helperId && typeof helperId === 'string') {
        incidents = incidents.filter(incident => incident.helperId === helperId);
      }

      // Sort by creation date (newest first)
      incidents.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      return res.status(200).json(incidents);
    }

    if (req.method === 'POST') {
      // Check if user can create incidents
      if (!canCreate(session.user.role)) {
        return res.status(403).json({ 
          error: 'Insufficient permissions. Staff or Admin role required to create incidents.' 
        });
      }

      const payload = req.body as NewIncident;
      const newRow = await addIncident(payload);
      return res.status(201).json({ id: newRow.id });
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (err: unknown) {
    console.error('Incidents API error:', err);
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: message });
  }
}