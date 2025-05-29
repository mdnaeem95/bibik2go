/* eslint-disable @typescript-eslint/no-explicit-any */
import { JWT } from 'google-auth-library';
import { GoogleSpreadsheet, GoogleSpreadsheetRow } from 'google-spreadsheet';

// 1) JWT auth client
const jwtClient = new JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
  key: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

// 2) Spreadsheet instance
const doc = new GoogleSpreadsheet(process.env.SHEET_ID!, jwtClient);

async function getSheet() {
  await doc.loadInfo();
  const sheet = doc.sheetsByIndex[0];

  return sheet;
}

// 3) Raw sheet row shape (all strings)
export type RawHelperRow = {
  id: string;
  name: string;
  currentEmployer: string;
  problem: string;
  totalEmployers: string;
  eaOfficer: string;
  outstandingLoan: string;
};

export type HelperRow =
  GoogleSpreadsheetRow<RawHelperRow> & // has save(), delete(), _rawData, etc.
  RawHelperRow;  

export interface NewHelper {
  name: string;
  currentEmployer: string;
  problem: string;
  totalEmployers: number;
  eaOfficer: string;
  outstandingLoan: number;
}

// 4) Fetch & type rows as intersection so TS knows about column props
export async function getAllHelpers(): Promise<RawHelperRow[]> {
  const sheet = await getSheet();
  const rows = await sheet.getRows();
  const headers = sheet.headerValues;

  return rows.map((row) => {
    const rawData = (row as any)._rawData; // Actual backing array
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => {
      obj[h] = rawData[i] ?? '';
    });
    return obj as RawHelperRow;
  });
}

export async function addHelper(helper: NewHelper): Promise<GoogleSpreadsheetRow<RawHelperRow> & RawHelperRow> {
  const sheet = await getSheet();
  const row = await sheet.addRow({
    id: Date.now().toString(),
    name: helper.name,
    currentEmployer: helper.currentEmployer,
    problem: helper.problem,
    totalEmployers: helper.totalEmployers.toString(),
    eaOfficer: helper.eaOfficer,
    outstandingLoan: helper.outstandingLoan.toString(),
  });
  return row as GoogleSpreadsheetRow<RawHelperRow> & RawHelperRow;
}

export async function updateHelper(id: string, helper: Partial<NewHelper>) {
  const sheet = await getSheet();
  await sheet.loadHeaderRow();
  const headers = sheet.headerValues;
  const idCol = headers.indexOf('id');

  if (idCol < 0) throw new Error('Sheet is missing “id” column');

  const rows = await sheet.getRows();

  const row = rows.find((r) => {
    const rawId = (r as any)._rawData?.[idCol];
    return rawId === id;
  });

  if (!row) throw new Error(`Helper with id ${id} not found`);

  if (helper.name !== undefined) row.set('name', helper.name);
  if (helper.currentEmployer !== undefined) row.set('currentEmployer', helper.currentEmployer);
  if (helper.problem !== undefined) row.set('problem', helper.problem);
  if (helper.totalEmployers !== undefined) row.set('totalEmployers', String(helper.totalEmployers));
  if (helper.eaOfficer !== undefined) row.set('eaOfficer', helper.eaOfficer);
  if (helper.outstandingLoan !== undefined) row.set('outstandingLoan', String(helper.outstandingLoan));

  await row.save();
}

export async function deleteHelper(id: string) {
  const sheet = await getSheet();
  const headers = sheet.headerValues;
  const rows = await sheet.getRows();
  const idCol = headers.indexOf('id');
  if (idCol < 0) throw new Error('Sheet is missing “id” column');

  const row = rows.find(
    (r) => (r as any)._rawData[idCol] === id
  );
  if (!row) throw new Error(`Helper with id ${id} not found`);

  await row.delete();
}

// --------- STAFF ----------------
export type RawStaffRow = {
  id: string;
  name: string;
  role: string;
  email: string;
  contact: string;
};

export interface NewStaff {
  name: string;
  role: string;
  email: string;
  contact: string;
}

export async function getStaffSheet() {
  await doc.loadInfo();
  const sheet = doc.sheetsByTitle['Staff'];
  if (!sheet) throw new Error('Staff sheet not found');
  return sheet;
}

export async function getAllStaff(): Promise<RawStaffRow[]> {
  const sheet = await getStaffSheet();
  await sheet.loadHeaderRow(); // this was crucial for helpers
  const rows = await sheet.getRows();
  const headers = sheet.headerValues;

  return rows.map((row) => {
    const raw: string[] = (row as any)._rawData;
    const obj: any = {};
    headers.forEach((h, idx) => {
      obj[h] = raw[idx] ?? '';
    });
    return obj as RawStaffRow;
  });
}

export async function addStaff(staff: NewStaff): Promise<RawStaffRow> {
  const sheet = await getStaffSheet();
  const row = await sheet.addRow({
    id: Date.now().toString(),
    ...staff,
  });
  return row as any;
}

export async function updateStaff(id: string, staff: Partial<NewStaff>) {
  const sheet = await getStaffSheet();
  await sheet.loadHeaderRow();
  const headers = sheet.headerValues;
  const idCol = headers.indexOf('id');
  if (idCol < 0) throw new Error('Sheet is missing “id” column');

  const rows = await sheet.getRows();
  const row = rows.find((r) => (r as any)._rawData[idCol] === id);
  if (!row) throw new Error(`Staff with id ${id} not found`);

  headers.forEach((key) => {
    if (key !== 'id' && staff[key as keyof NewStaff] !== undefined) {
      (row as any)[key] = staff[key as keyof NewStaff];
    }
  });

  await row.save();
}

export async function deleteStaff(id: string) {
  const sheet = await getStaffSheet();
  await sheet.loadHeaderRow();
  const headers = sheet.headerValues;
  const idCol = headers.indexOf('id');
  const rows = await sheet.getRows();
  const row = rows.find((r) => (r as any)._rawData[idCol] === id);
  if (!row) throw new Error(`Staff with id ${id} not found`);
  await row.delete();
}