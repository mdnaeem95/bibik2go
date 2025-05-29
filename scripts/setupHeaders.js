
/* eslint-disable @typescript-eslint/no-require-imports */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

async function main() {
  // 1) Build your JWT client
  const jwt = new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  // 2) Load the sheet
  const doc = new GoogleSpreadsheet(process.env.SHEET_ID, jwt);
  await doc.loadInfo();
  const sheet = doc.sheetsByIndex[0];

  // 3) Overwrite the header row exactly once
  await sheet.setHeaderRow([
    'id',
    'name',
    'currentEmployer',
    'problem',
    'totalEmployers',        // <-- make sure this matches your code
    'eaOfficer',
    'outstandingLoan',
  ]);

  console.log('✅ Headers set on sheet:', sheet.title);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
