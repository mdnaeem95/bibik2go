// src/config/env.ts
interface EnvironmentVariables {
  // Google Sheets
  SHEET_ID: string;
  GOOGLE_SERVICE_ACCOUNT_EMAIL: string;
  GOOGLE_PRIVATE_KEY: string;
  
  // Google Drive
  GOOGLE_DRIVE_PARENT_FOLDER_ID?: string;
  INCIDENT_MEDIA_FOLDER_ID?: string;
  
  // Session
  SESSION_PASSWORD: string;
  
  // App
  NODE_ENV: 'development' | 'production' | 'test';
  NEXT_PUBLIC_APP_URL?: string;
}

class EnvironmentConfig {
  private env: EnvironmentVariables;
  private validated = false;

  constructor() {
    this.env = this.loadEnvironment();
  }

  private loadEnvironment(): EnvironmentVariables {
    return {
      SHEET_ID: process.env.SHEET_ID || '',
      GOOGLE_SERVICE_ACCOUNT_EMAIL: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '',
      GOOGLE_PRIVATE_KEY: process.env.GOOGLE_PRIVATE_KEY || '',
      GOOGLE_DRIVE_PARENT_FOLDER_ID: process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID,
      INCIDENT_MEDIA_FOLDER_ID: process.env.INCIDENT_MEDIA_FOLDER_ID,
      SESSION_PASSWORD: process.env.SESSION_PASSWORD || '',
      NODE_ENV: (process.env.NODE_ENV as EnvironmentVariables['NODE_ENV']) || 'development',
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    };
  }

  public validate(): void {
    if (this.validated) return;

    const errors: string[] = [];

    // Required variables
    if (!this.env.SHEET_ID) {
      errors.push('SHEET_ID is required');
    }
    if (!this.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) {
      errors.push('GOOGLE_SERVICE_ACCOUNT_EMAIL is required');
    }
    if (!this.env.GOOGLE_PRIVATE_KEY) {
      errors.push('GOOGLE_PRIVATE_KEY is required');
    }
    if (!this.env.SESSION_PASSWORD) {
      errors.push('SESSION_PASSWORD is required');
    }

    // Validate session password strength
    if (this.env.SESSION_PASSWORD && this.env.SESSION_PASSWORD.length < 32) {
      errors.push('SESSION_PASSWORD must be at least 32 characters long');
    }

    // Validate Google private key format
    if (this.env.GOOGLE_PRIVATE_KEY && !this.env.GOOGLE_PRIVATE_KEY.includes('BEGIN PRIVATE KEY')) {
      errors.push('GOOGLE_PRIVATE_KEY appears to be invalid');
    }

    if (errors.length > 0) {
      console.error('Environment validation failed:');
      errors.forEach(error => console.error(`  - ${error}`));
      
      if (this.env.NODE_ENV === 'production') {
        throw new Error('Environment validation failed. Check server logs for details.');
      }
    }

    this.validated = true;
  }

  public get(key: keyof EnvironmentVariables): string | undefined {
    this.validate();
    return this.env[key];
  }

  public getOrThrow(key: keyof EnvironmentVariables): string {
    const value = this.get(key);
    if (!value) {
      throw new Error(`Environment variable ${key} is not set`);
    }
    return value;
  }

  public isDevelopment(): boolean {
    return this.env.NODE_ENV === 'development';
  }

  public isProduction(): boolean {
    return this.env.NODE_ENV === 'production';
  }

  public getGoogleCredentials() {
    return {
      email: this.getOrThrow('GOOGLE_SERVICE_ACCOUNT_EMAIL'),
      key: this.getOrThrow('GOOGLE_PRIVATE_KEY').replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive'],
    };
  }

  public getSessionOptions() {
    return {
      password: this.getOrThrow('SESSION_PASSWORD'),
      cookieName: 'helper-tracker-session',
      cookieOptions: {
        secure: this.isProduction(),
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      },
    };
  }
}

// Create singleton instance
export const config = new EnvironmentConfig();

// Validate on startup
if (typeof window === 'undefined') {
  config.validate();
}

// src/config/constants.ts
export const APP_CONFIG = {
  name: 'Bibik2Go',
  version: '1.0.0',
  description: 'HR Management Portal for Domestic Helpers',
  company: 'bibik2go.sg',
} as const;

export const ROUTES = {
  // Public routes
  LOGIN: '/login',
  
  // Protected routes
  DASHBOARD: '/',
  HELPERS: '/helpers',
  HELPERS_NEW: '/helpers/new',
  HELPERS_EDIT: (id: string) => `/helpers/${id}/edit`,
  HELPERS_VIEW: (id: string) => `/helpers/${id}`,
  
  INCIDENTS: '/incidents',
  INCIDENTS_ADD: '/incidents/add',
  INCIDENTS_EDIT: (id: string) => `/incidents/${id}/edit`,
  INCIDENTS_VIEW: (id: string) => `/incidents/${id}`,
  
  USERS: '/users',
  SETTINGS: '/settings',
} as const;

export const API_ROUTES = {
  // Auth
  LOGIN: '/api/login',
  LOGOUT: '/api/logout',
  SESSION_CHECK: '/api/session/check',
  SESSION_SETTINGS: '/api/session/settings',
  
  // Helpers
  HELPERS: '/api/helpers',
  HELPER_BY_ID: (id: string) => `/api/helpers/${id}`,
  
  // Incidents
  INCIDENTS: '/api/incidents',
  INCIDENT_BY_ID: (id: string) => `/api/incidents/${id}`,
  INCIDENT_MEDIA: (id: string) => `/api/incidents/${id}/media`,
  
  // Users
  USERS: '/api/users',
  USER_BY_ID: (id: string) => `/api/users/${id}`,
  USER_PROFILE: '/api/users/profile',
  USER_CHANGE_PASSWORD: '/api/users/change-password',
  
  // Media
  MEDIA_UPLOAD: '/api/media/upload',
  MEDIA_BY_ID: (id: string) => `/api/media/${id}`,
  
  // Admin
  CACHE_STATS: '/api/admin/cache-stats',
} as const;

export const UI_CONFIG = {
  table: {
    defaultPageSize: 25,
    pageSizeOptions: [10, 25, 50, 100],
  },
  form: {
    maxFileSize: 50 * 1024 * 1024, // 50MB
    maxFiles: 10,
    acceptedFileTypes: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
      'video/*': ['.mp4', '.mov', '.avi', '.wmv', '.webm'],
    },
  },
  session: {
    checkInterval: 5 * 60 * 1000, // 5 minutes
    warningTime: 5 * 60 * 1000, // 5 minutes before expiry
  },
} as const;

export const ERROR_MESSAGES = {
  // Generic
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
  SESSION_EXPIRED: 'Your session has expired. Please log in again.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  
  // Auth
  INVALID_CREDENTIALS: 'Invalid username or password.',
  ACCOUNT_INACTIVE: 'Your account is inactive. Please contact an administrator.',
  
  // Validation
  REQUIRED_FIELD: (field: string) => `${field} is required.`,
  INVALID_EMAIL: 'Please enter a valid email address.',
  PASSWORD_TOO_SHORT: 'Password must be at least 8 characters.',
  PASSWORDS_DONT_MATCH: 'Passwords do not match.',
  
  // File upload
  FILE_TOO_LARGE: (maxSize: number) => `File size must not exceed ${maxSize}MB.`,
  INVALID_FILE_TYPE: 'Invalid file type. Only images and videos are allowed.',
  UPLOAD_FAILED: 'File upload failed. Please try again.',
} as const;