/* eslint-disable @typescript-eslint/no-explicit-any */
import { JWT } from 'google-auth-library';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import bcrypt from 'bcrypt';

const jwtClient = new JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
  key: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const doc = new GoogleSpreadsheet(process.env.SHEET_ID!, jwtClient);

export type UserRole = 'admin' | 'staff' | 'viewer';
export type UserStatus = 'active' | 'inactive' | 'pending';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  createdBy: string;
}

export interface NewUser {
  username: string;
  email: string;
  password: string;
  role: UserRole;
  createdBy: string;
}

export interface UserUpdate {
  username?: string;
  email?: string;
  hashedPassword?: string;
  role?: UserRole;
  status?: UserStatus;
  createdBy?: string;
}

async function getUsersSheet() {
  await doc.loadInfo();
  let sheet = doc.sheetsByTitle['Users'];
  
  if (!sheet) {
    sheet = await doc.addSheet({
      title: 'Users',
      headerValues: [
        'id', 'username', 'email', 'hashedPassword', 
        'role', 'status', 'createdAt', 'createdBy'
      ]
    });
  }
  
  // Check if sheet is empty and create default admin
  await sheet.loadHeaderRow();
  const rows = await sheet.getRows();
  
  if (rows.length === 0) {
    console.log('Creating default admin user...');
    // Default admin: username=admin, password=admin123
    const defaultPasswordHash = '$2b$10$1Z3MThBzrcPUfxfTaANFEeEUH0/9Z8eIwhbGGHDSyCk1pGhgEMnDe';
    
    await sheet.addRow({
      id: 'admin-1',
      username: 'admin',
      email: 'admin@company.com',
      hashedPassword: defaultPasswordHash,
      role: 'admin',
      status: 'active',
      createdAt: new Date().toISOString(),
      createdBy: 'system'
    });
    
    console.log('✅ Default admin created: username=admin, password=admin123');
  }
  
  return sheet;
}

export async function getAllUsers(): Promise<User[]> {
  const sheet = await getUsersSheet();
  await sheet.loadHeaderRow();
  const rows = await sheet.getRows();
  
  return rows.map(row => ({
    id: row.get('id'),
    username: row.get('username'),
    email: row.get('email'),
    role: row.get('role') as UserRole,
    status: row.get('status') as UserStatus,
    createdAt: row.get('createdAt'),
    createdBy: row.get('createdBy'),
  }));
}

export async function getUserByUsername(username: string) {
  const sheet = await getUsersSheet();
  await sheet.loadHeaderRow();
  const rows = await sheet.getRows();
  
  const row = rows.find(r => r.get('username') === username);
  if (!row) return null;
  
  return {
    id: row.get('id'),
    username: row.get('username'),
    email: row.get('email'),
    hashedPassword: row.get('hashedPassword'),
    role: row.get('role') as UserRole,
    status: row.get('status') as UserStatus,
    createdAt: row.get('createdAt'),
    createdBy: row.get('createdBy'),
  };
}

export async function createUser(userData: NewUser): Promise<User> {
  const sheet = await getUsersSheet();
  
  // Check if username/email already exists
  const existingUsers = await getAllUsers();
  if (existingUsers.some(u => u.username === userData.username)) {
    throw new Error('Username already exists');
  }
  if (existingUsers.some(u => u.email === userData.email)) {
    throw new Error('Email already exists');
  }
  
  const hashedPassword = await bcrypt.hash(userData.password, 10);
  const id = `user-${Date.now()}`;
  
  await sheet.addRow({
    id,
    username: userData.username,
    email: userData.email,
    hashedPassword,
    role: userData.role,
    status: 'active',
    createdAt: new Date().toISOString(),
    createdBy: userData.createdBy,
  });
  
  return {
    id,
    username: userData.username,
    email: userData.email,
    role: userData.role,
    status: 'active',
    createdAt: new Date().toISOString(),
    createdBy: userData.createdBy,
  };
}

export async function updateUserStatus(userId: string, status: UserStatus) {
  const sheet = await getUsersSheet();
  await sheet.loadHeaderRow();
  const rows = await sheet.getRows();
  
  const row = rows.find(r => r.get('id') === userId);
  if (!row) throw new Error('User not found');
  
  row.set('status', status);
  await row.save();
}

export async function updateUserRole(userId: string, role: UserRole) {
  const sheet = await getUsersSheet();
  await sheet.loadHeaderRow();
  const rows = await sheet.getRows();
  
  const row = rows.find(r => r.get('id') === userId);
  if (!row) throw new Error('User not found');
  
  row.set('role', role);
  await row.save();
}

export async function deleteUser(userId: string) {
  const sheet = await getUsersSheet();
  await sheet.loadHeaderRow();
  const rows = await sheet.getRows();
  
  const row = rows.find(r => r.get('id') === userId);
  if (!row) throw new Error('User not found');
  
  await row.delete();
}

export async function updateUser(username: string, updates: Partial<NewUser>) {
  const sheet = await getUsersSheet();
  await sheet.loadHeaderRow();
  const headers = sheet.headerValues;
  const usernameCol = headers.indexOf('username');
  
  if (usernameCol < 0) throw new Error('Sheet is missing "username" column');

  const rows = await sheet.getRows();
  const row = rows.find((r) => (r as any)._rawData[usernameCol] === username);
  
  if (!row) throw new Error(`User with username ${username} not found`);

  // Update fields
  Object.keys(updates).forEach(key => {
    if (updates[key as keyof NewUser] !== undefined) {
      row.set(key, updates[key as keyof NewUser]);
    }
  });

  await row.save();
}