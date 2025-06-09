// src/constants/incidents.ts
import { IncidentSeverity, IncidentStatus } from '@/types';

interface SeverityOption {
  value: IncidentSeverity;
  color: 'success' | 'warning' | 'error';
  description: string;
}

interface StatusOption {
  value: IncidentStatus;
  color: 'success' | 'warning' | 'error';
  description: string;
}

export const SEVERITY_OPTIONS: SeverityOption[] = [
  { 
    value: 'Low', 
    color: 'success', 
    description: 'Minor issue, no immediate action required' 
  },
  { 
    value: 'Medium', 
    color: 'warning', 
    description: 'Moderate issue, requires attention' 
  },
  { 
    value: 'High', 
    color: 'error', 
    description: 'Serious issue, urgent action needed' 
  },
  { 
    value: 'Critical', 
    color: 'error', 
    description: 'Critical issue, immediate intervention required' 
  },
];

export const STATUS_OPTIONS: StatusOption[] = [
  { 
    value: 'Open', 
    color: 'error', 
    description: 'Issue is open and unresolved' 
  },
  { 
    value: 'Under Review', 
    color: 'warning', 
    description: 'Issue is being investigated' 
  },
  { 
    value: 'Resolved', 
    color: 'success', 
    description: 'Issue has been resolved' 
  },
];

export const FORM_STEPS = [
  'Helper Details', 
  'Initial Incident', 
  'Add Media', 
  'Review & Submit'
];