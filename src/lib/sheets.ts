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

// --------- HELPERS ----------------

export type Helper = RawHelperRow;

// 3) Raw sheet row shape (all strings)
export type RawHelperRow = {
  id: string;
  name: string;
  currentEmployer: string;
  problem: string; // Will now show latest incident
  totalEmployers: string;
  eaOfficer: string;
  outstandingLoan: string;
  employmentStartDate: string;
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
  employmentStartDate: string;
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
    employmentStartDate: helper.employmentStartDate,
  });
  return row as GoogleSpreadsheetRow<RawHelperRow> & RawHelperRow;
}

export async function updateHelper(id: string, helper: Partial<NewHelper>) {
  const sheet = await getSheet();
  await sheet.loadHeaderRow();
  const headers = sheet.headerValues;
  const idCol = headers.indexOf('id');

  if (idCol < 0) throw new Error('Sheet is missing "id" column');

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
  if (helper.employmentStartDate !== undefined) row.set('employmentStartDate', helper.employmentStartDate);

  await row.save();
}

export async function deleteHelper(id: string) {
  const sheet = await getSheet();
  const headers = sheet.headerValues;
  const rows = await sheet.getRows();
  const idCol = headers.indexOf('id');
  if (idCol < 0) throw new Error('Sheet is missing "id" column');

  const row = rows.find(
    (r) => (r as any)._rawData[idCol] === id
  );
  if (!row) throw new Error(`Helper with id ${id} not found`);

  await row.delete();
}

// --------- INCIDENTS ----------------

export type Incident = RawIncidentRow;

export type RawIncidentRow = {
  id: string;
  helperId: string;
  incidentDate: string;
  description: string;
  severity: string;
  reportedBy: string;
  status: string;
  resolution: string;
  createdAt: string;
};

export interface NewIncident {
  id?: string;
  helperId: string;
  incidentDate: string;
  description: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  reportedBy: string;
  status: 'Open' | 'Resolved' | 'Under Review';
  resolution?: string;
}

export async function getIncidentsSheet() {
  await doc.loadInfo();
  let sheet = doc.sheetsByTitle['Incidents'];
  
  // Create the sheet if it doesn't exist
  if (!sheet) {
    sheet = await doc.addSheet({
      title: 'Incidents',
      headerValues: [
        'id',
        'helperId', 
        'incidentDate',
        'description',
        'severity',
        'reportedBy',
        'status',
        'resolution',
        'createdAt'
      ]
    });
  }
  return sheet;
}

export async function getAllIncidents(): Promise<RawIncidentRow[]> {
  const sheet = await getIncidentsSheet();
  await sheet.loadHeaderRow();
  const rows = await sheet.getRows();
  const headers = sheet.headerValues;

  return rows.map((row) => {
    const raw: string[] = (row as any)._rawData;
    const obj: any = {};
    headers.forEach((h, idx) => {
      obj[h] = raw[idx] ?? '';
    });
    return obj as RawIncidentRow;
  });
}

export async function getIncidentsByHelperId(helperId: string): Promise<RawIncidentRow[]> {
  const allIncidents = await getAllIncidents();
  return allIncidents.filter(incident => incident.helperId === helperId);
}

export async function addIncident(incident: NewIncident & { id?: string }): Promise<RawIncidentRow> {
  const sheet = await getIncidentsSheet();

  // use provided Id or generate a new one
  const incidentId = incident.id || Date.now().toString();

  const row = await sheet.addRow({
    id: incidentId,
    helperId: incident.helperId,
    incidentDate: incident.incidentDate,
    description: incident.description,
    severity: incident.severity,
    reportedBy: incident.reportedBy,
    status: incident.status,
    resolution: incident.resolution || '',
    createdAt: new Date().toISOString(),
  });

  // Update helper's problem field with latest incident
  await updateHelperLatestIncident(incident.helperId, incident.description);

  return row as any;
}

export async function updateIncident(id: string, incident: Partial<NewIncident>) {
  const sheet = await getIncidentsSheet();
  await sheet.loadHeaderRow();
  const headers = sheet.headerValues;
  const idCol = headers.indexOf('id');
  if (idCol < 0) throw new Error('Sheet is missing "id" column');

  const rows = await sheet.getRows();
  const row = rows.find((r) => (r as any)._rawData[idCol] === id);
  if (!row) throw new Error(`Incident with id ${id} not found`);

  // Update fields
  if (incident.incidentDate !== undefined) row.set('incidentDate', incident.incidentDate);
  if (incident.description !== undefined) row.set('description', incident.description);
  if (incident.severity !== undefined) row.set('severity', incident.severity);
  if (incident.reportedBy !== undefined) row.set('reportedBy', incident.reportedBy);
  if (incident.status !== undefined) row.set('status', incident.status);
  if (incident.resolution !== undefined) row.set('resolution', incident.resolution);

  await row.save();

  // If description was updated, update helper's latest incident
  if (incident.description !== undefined && incident.helperId) {
    await updateHelperLatestIncident(incident.helperId, incident.description);
  }
}

export async function deleteIncident(id: string) {
  const sheet = await getIncidentsSheet();
  await sheet.loadHeaderRow();
  const headers = sheet.headerValues;
  const idCol = headers.indexOf('id');
  const rows = await sheet.getRows();
  const row = rows.find((r) => (r as any)._rawData[idCol] === id);
  if (!row) throw new Error(`Incident with id ${id} not found`);

  const helperId = (row as any)._rawData[headers.indexOf('helperId')];
  await row.delete();

  // Update helper's problem field with their most recent remaining incident
  const remainingIncidents = await getIncidentsByHelperId(helperId);
  if (remainingIncidents.length > 0) {
    // Sort by createdAt desc and get the latest
    const sortedIncidents = remainingIncidents.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    await updateHelperLatestIncident(helperId, sortedIncidents[0].description);
  } else {
    // No incidents left, clear the problem field
    await updateHelper(helperId, { problem: 'No recent incidents' });
  }
}

// Helper function to update helper's problem field with latest incident
async function updateHelperLatestIncident(helperId: string, latestIncidentDescription: string) {
  try {
    await updateHelper(helperId, { problem: `Latest: ${latestIncidentDescription}` });
  } catch (error) {
    console.error('Failed to update helper latest incident:', error);
    // Don't throw - incident creation should still succeed even if helper update fails
  }
}