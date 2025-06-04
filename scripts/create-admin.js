/* eslint-disable @typescript-eslint/no-require-imports */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });
const bcrypt = require('bcrypt');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

async function createAdminUser() {
  try {
    // 1) Build JWT client
    const jwt = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    // 2) Load the spreadsheet
    const doc = new GoogleSpreadsheet(process.env.SHEET_ID, jwt);
    await doc.loadInfo();

    // 3) Get or create Users sheet
    let sheet = doc.sheetsByTitle['Users'];
    if (!sheet) {
      sheet = await doc.addSheet({
        title: 'Users',
        headerValues: [
          'id', 'username', 'email', 'hashedPassword', 
          'role', 'status', 'createdAt', 'createdBy'
        ]
      });
      console.log('✅ Created Users sheet');
    }

    // 4) Check if admin already exists
    await sheet.loadHeaderRow();
    const rows = await sheet.getRows();
    const adminExists = rows.some(row => row.get('username') === 'admin');
    
    if (adminExists) {
      console.log('❌ Admin user already exists');
      return;
    }

    // 5) Get user input (or use defaults)
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const question = (query) => new Promise(resolve => rl.question(query, resolve));

    console.log('\n🔧 Creating admin user...\n');
    
    const username = await question('Username (default: admin): ') || 'admin';
    const email = await question('Email (default: admin@company.com): ') || 'admin@company.com';
    const password = await question('Password (default: admin123): ') || 'admin123';

    rl.close();

    // 6) Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 10);
    
    await sheet.addRow({
      id: `admin-${Date.now()}`,
      username,
      email,
      hashedPassword,
      role: 'admin',
      status: 'active',
      createdAt: new Date().toISOString(),
      createdBy: 'setup-script'
    });

    console.log('\n✅ Admin user created successfully!');
    console.log(`Username: ${username}`);
    console.log(`Password: ${password}`);
    console.log(`Email: ${email}`);
    console.log('\n🔒 Please change your password after first login');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
}

createAdminUser();