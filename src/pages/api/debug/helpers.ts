/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🔍 Starting debug check...');

    // Initialize Google Sheets
    const jwt = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
      key: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(process.env.SHEET_ID!, jwt);
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];

    // Get sheet info
    const sheetInfo = {
      title: sheet.title,
      rowCount: sheet.rowCount,
      columnCount: sheet.columnCount,
    };

    // Get headers
    await sheet.loadHeaderRow();
    const headers = sheet.headerValues;

    // Get raw data for first few rows
    const rows = await sheet.getRows();
    const sampleData = rows.slice(0, 3).map((row: any) => {
      const rawData = row._rawData;
      const mappedData: any = {};
      
      headers.forEach((header, index) => {
        mappedData[header] = rawData[index] || '';
      });
      
      return {
        rawData,
        mappedData,
        totalEmployersValue: row.get('totalEmployers'),
        totalEmployersType: typeof row.get('totalEmployers'),
      };
    });

    // Check for totalEmployers specifically
    const totalEmployersIndex = headers.indexOf('totalEmployers');
    const hasTotalEmployersColumn = totalEmployersIndex !== -1;

    // Get all totalEmployers values
    const allTotalEmployers = rows.map((row: any) => ({
      id: row.get('id'),
      name: row.get('name'),
      totalEmployers: row.get('totalEmployers'),
      totalEmployersRaw: row._rawData[totalEmployersIndex],
    }));

    const response = {
      success: true,
      debug: {
        sheetInfo,
        headers,
        hasTotalEmployersColumn,
        totalEmployersIndex,
        sampleData,
        allTotalEmployers,
        emptyTotalEmployers: allTotalEmployers.filter(h => !h.totalEmployers || h.totalEmployers === ''),
        totalRows: rows.length,
      }
    };

    return res.status(200).json(response);

  } catch (error) {
    console.error('❌ Debug error:', error);
    return res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      debug: {
        errorType: error instanceof Error ? error.constructor.name : 'Unknown',
        errorMessage: error instanceof Error ? error.message : String(error),
      }
    });
  }
}