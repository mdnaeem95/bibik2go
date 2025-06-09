/* eslint-disable @typescript-eslint/no-explicit-any */

// User & Auth Types
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

export interface UserWithPassword extends User {
  hashedPassword: string;
}

export interface NewUser {
  username: string;
  email: string;
  password: string;
  role: UserRole;
  createdBy: string;
}

// Helper Types
export type TransferStatus = 'New' | 'Transfer';

export interface Helper {
  id: string;
  name: string;
  currentEmployer: string;
  problem: string;
  totalEmployers: number;
  eaOfficer: string;
  outstandingLoan: number;
  employmentStartDate: string;
  pt: string;
  transferStatus: TransferStatus
}

export interface NewHelper {
  name: string;
  currentEmployer: string;
  problem: string;
  totalEmployers: number;
  eaOfficer: string;
  outstandingLoan: number;
  employmentStartDate: string;
  pt: string;
  transferStatus: TransferStatus
}

// Incident Types
export type IncidentSeverity = 'Low' | 'Medium' | 'High' | 'Critical';
export type IncidentStatus = 'Open' | 'Resolved' | 'Under Review';

export interface Incident {
  id: string;
  helperId: string;
  incidentDate: string;
  description: string;
  severity: IncidentSeverity;
  reportedBy: string;
  status: IncidentStatus;
  resolution?: string;
  createdAt: string;
  mediaUrls?: string[];
  mediaFileIds?: string[];
}

export interface NewIncident {
  id?: string;
  helperId: string;
  incidentDate: string;
  description: string;
  severity: IncidentSeverity;
  reportedBy: string;
  status: IncidentStatus;
  resolution?: string;
  mediaUrls?: string[];
  mediaFileIds?: string[];
}

// Media Types
export interface MediaFile {
  id: string;
  name: string;
  size: number;
  type: 'image' | 'video';
  mimeType: string;
  url: string;
  thumbnailUrl?: string;
  uploadProgress?: number;
  isUploading?: boolean;
  driveFileId?: string;
  incidentId?: string;
  downloadUrl?: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Form Types
export interface FormErrors {
  [key: string]: string | undefined;
}

// Dashboard Types
export interface DashboardMetrics {
  totalHelpers: number;
  totalUsers: number;
  activeUsers: number;
  totalOutstandingLoans: number;
  urgentFollowUps?: number;
  newEmployees?: number;
}

// Constants
export const LOAN_THRESHOLDS = {
  MINIMAL: 550,
  LOW_VALUE: 1100,
  MEDIUM_VALUE: 2200,
  HIGH_VALUE: 3300,
  URGENT_FOLLOWUP: 3300,
} as const;

export const EMPLOYMENT_DURATION = {
  NEW_EMPLOYEE_MONTHS: 3,
} as const;

export const SESSION_TIMEOUT = {
  MIN_HOURS: 1,
  MAX_HOURS: 168,
  DEFAULT_HOURS: 24,
} as const;

// Transfer Status Options - NEW
export const TRANSFER_STATUS_OPTIONS: { value: TransferStatus; label: string; description: string }[] = [
  { 
    value: 'New', 
    label: 'New Helper', 
    description: 'First-time helper starting fresh employment' 
  },
  { 
    value: 'Transfer', 
    label: 'Transfer', 
    description: 'Helper transferring from another employer' 
  },
];

// Common PT/Agency Options - NEW (you can customize these based on actual agencies)
export const COMMON_PT_AGENCIES = [
  'Hoki',
  'Qurrny',
  'JWS',
  'DMSI',
  'Crystal',
  'Enda',
  'Alfira',
  'Prigel',
  'Jatim',
  'IBU FAE',
] as const;