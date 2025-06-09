import { LOAN_THRESHOLDS, EMPLOYMENT_DURATION } from '@/types';

export const calculateEmploymentDuration = (
  startDate: string
): { months: number; displayText: string } => {
  if (!startDate) {
    return { months: 0, displayText: 'Not specified' };
  }
  
  const start = new Date(startDate);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const months = Math.floor(diffDays / 30);
  
  if (months < 1) {
    return { months, displayText: `${diffDays} days` };
  } else if (months < 12) {
    return { months, displayText: `${months} month${months === 1 ? '' : 's'}` };
  } else {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    if (remainingMonths === 0) {
      return { months, displayText: `${years} year${years === 1 ? '' : 's'}` };
    }
    return { months, displayText: `${years}y ${remainingMonths}m` };
  }
};

export const isNewEmployee = (startDate: string): boolean => {
  const { months } = calculateEmploymentDuration(startDate);
  return months < EMPLOYMENT_DURATION.NEW_EMPLOYEE_MONTHS;
};

export const getLoanCategory = (amount: number): {
  label: string;
  color: 'success' | 'default' | 'info' | 'warning' | 'error';
  icon?: string;
} => {
  if (amount < LOAN_THRESHOLDS.MINIMAL) {
    return { label: 'Minimal', color: 'success' };
  }
  if (amount >= LOAN_THRESHOLDS.URGENT_FOLLOWUP) {
    return { label: 'Urgent', color: 'error', icon: 'warning' };
  }
  if (amount >= LOAN_THRESHOLDS.MEDIUM_VALUE) {
    return { label: 'High Value', color: 'warning', icon: 'trending_up' };
  }
  if (amount >= LOAN_THRESHOLDS.LOW_VALUE) {
    return { label: 'Medium Value', color: 'info', icon: 'attach_money' };
  }
  return { label: 'Low Value', color: 'default' };
};