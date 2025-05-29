// src/pages/api/helpers/seed.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { addStaff, NewStaff } from '@/lib/sheets';

// Only run in development
if (process.env.NODE_ENV !== 'development') {
  throw new Error('Seeding only allowed in development');
}

const sampleStaff: NewStaff[] = [
  {
    name: 'Adam Rahman',
    role: 'Supervisor',
    email: 'adam@company.com',
    contact: '91234567',
  },
  {
    name: 'Bella Tan',
    role: 'Admin',
    email: 'bella@company.com',
    contact: '98765432',
  },
  {
    name: 'Chan Wei Ling',
    role: 'HR Executive',
    email: 'chan@company.com',
    contact: '92345678',
  },
  {
    name: 'Daniel Ong',
    role: 'Deployment Lead',
    email: 'daniel@company.com',
    contact: '93456789',
  },
  {
    name: 'Esther Lim',
    role: 'Finance Manager',
    email: 'esther@company.com',
    contact: '94567890',
  },
  {
    name: 'Farah Abdullah',
    role: 'Operations',
    email: 'farah@company.com',
    contact: '95678901',
  },
  {
    name: 'George Tan',
    role: 'Case Manager',
    email: 'george@company.com',
    contact: '96789012',
  },
  {
    name: 'Hannah Lee',
    role: 'Training Lead',
    email: 'hannah@company.com',
    contact: '97890123',
  },
  {
    name: 'Idris Yusof',
    role: 'IT Support',
    email: 'idris@company.com',
    contact: '98901234',
  },
  {
    name: 'Jasmine Chong',
    role: 'Field Officer',
    email: 'jasmine@company.com',
    contact: '90012345',
  },
];

export default async function seedHandler(
  req: NextApiRequest,
  res: NextApiResponse<{ seeded: number } | { error: string }>
) {
  try {
    for (const s of sampleStaff) {
      await addStaff(s);
    }
    return res.status(201).json({ seeded: sampleStaff.length });
  } catch (err: unknown) {
    console.error('Seeding error:', err);
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: message });
  }
}
