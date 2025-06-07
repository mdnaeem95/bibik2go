// Create src/pages/api/admin/cache-stats.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getCacheStats, cache, cacheHelpers } from '@/lib/cache';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const stats = getCacheStats();
    return res.status(200).json({
      cache: stats,
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),  
    });
  }

  if (req.method === 'DELETE') {
    const { pattern } = req.query;
    
    if (pattern === 'all') {
      cacheHelpers.invalidateAll();
      return res.status(200).json({ message: 'All cache cleared' });
    }
    
    if (pattern === 'helpers') {
      cacheHelpers.invalidateHelpers();
      return res.status(200).json({ message: 'Helper cache cleared' });
    }
    
    if (pattern === 'users') {
      cacheHelpers.invalidateUsers();
      return res.status(200).json({ message: 'User cache cleared' });
    }
    
    if (pattern === 'incidents') {
      cacheHelpers.invalidateIncidents();
      return res.status(200).json({ message: 'Incident cache cleared' });
    }

    return res.status(400).json({ error: 'Invalid pattern' });
  }

  res.setHeader('Allow', ['GET', 'DELETE']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}