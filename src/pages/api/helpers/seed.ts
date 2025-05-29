// src/pages/api/helpers/seed.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { addHelper, NewHelper } from '@/lib/sheets';

// Only run in development
if (process.env.NODE_ENV !== 'development') {
  throw new Error('Seeding only allowed in development');
}

const dummyHelpers: NewHelper[] = [
  { name: 'Amina Binte Ali',    currentEmployer: 'John Tan',     problem: 'Late submissions',   totalEmployers: 2, eaOfficer: 'Officer Rahim',  outstandingLoan: 500 },
  { name: 'Nurul Huda',          currentEmployer: 'Sarah Lim',    problem: 'Contract expiration', totalEmployers: 1, eaOfficer: 'Officer Siti',   outstandingLoan: 0   },
  { name: 'Fatimah Omar',        currentEmployer: 'Mark Lee',     problem: 'Medical leave',      totalEmployers: 3, eaOfficer: 'Officer Rahim',  outstandingLoan: 1200},
  { name: 'Siti Mariam',         currentEmployer: 'David Ong',    problem: 'Language barrier',   totalEmployers: 4, eaOfficer: 'Officer Siti',   outstandingLoan: 250 },
  { name: 'Maria Gomez',         currentEmployer: 'Michael Tan',  problem: 'Overtime claims',    totalEmployers: 2, eaOfficer: 'Officer Alex',   outstandingLoan: 0   },
  { name: 'Jasmine Lee',         currentEmployer: 'Kevin Chua',   problem: 'Disciplinary issue', totalEmployers: 5, eaOfficer: 'Officer Rahim',  outstandingLoan: 300 },
  { name: 'Lina Zhang',          currentEmployer: 'Anne Wong',    problem: 'Absenteeism',        totalEmployers: 1, eaOfficer: 'Officer Tan',    outstandingLoan: 0   },
  { name: 'Farah Abdullah',      currentEmployer: 'Steven Lim',   problem: 'Contract renewal',   totalEmployers: 2, eaOfficer: 'Officer Siti',   outstandingLoan: 100 },
  { name: 'Nadia Hussain',       currentEmployer: 'Emily Neo',    problem: 'Health checkup',     totalEmployers: 3, eaOfficer: 'Officer Alex',   outstandingLoan: 450 },
  { name: 'Sasha Ivanov',        currentEmployer: 'Rachel Goh',   problem: 'Visa paperwork',     totalEmployers: 1, eaOfficer: 'Officer Tan',    outstandingLoan: 0   },
];

export default async function seedHandler(
  req: NextApiRequest,
  res: NextApiResponse<{ seeded: number } | { error: string }>
) {
  try {
    for (const h of dummyHelpers) {
      await addHelper(h);
    }
    return res.status(201).json({ seeded: dummyHelpers.length });
  } catch (err: unknown) {
    console.error('Seeding error:', err);
    const message = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: message });
  }
}
