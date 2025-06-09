// src/utils/validation.ts
export const validators = {
  required: (value: string, fieldName: string): string | undefined => {
    return value.trim() ? undefined : `${fieldName} is required`;
  },

  email: (value: string): string | undefined => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) ? undefined : 'Please enter a valid email address';
  },

  password: (value: string): string | undefined => {
    if (value.length < 8) return 'Password must be at least 8 characters';
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
      return 'Password must contain uppercase, lowercase, and number';
    }
    return undefined;
  },

  username: (value: string): string | undefined => {
    if (value.length < 3) return 'Username must be at least 3 characters';
    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      return 'Username can only contain letters, numbers, and underscores';
    }
    return undefined;
  },

  number: (value: string, fieldName: string): string | undefined => {
    return /^\d+$/.test(value) ? undefined : `${fieldName} must be a number`;
  },

  futureDate: (date: string, fieldName: string): string | undefined => {
    const inputDate = new Date(date);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return inputDate > today ? `${fieldName} cannot be in the future` : undefined;
  },

  minLength: (value: string, minLength: number, fieldName: string): string | undefined => {
    return value.trim().length >= minLength
      ? undefined
      : `${fieldName} must be at least ${minLength} characters`;
  },
};