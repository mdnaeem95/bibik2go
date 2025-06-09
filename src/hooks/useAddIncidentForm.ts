/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from 'react';
import { IncidentSeverity, IncidentStatus, MediaFile } from '@/types';

export interface AddIncidentFormData {
  helperId: string;
  helperName: string;
  incidentDate: string;
  description: string;
  severity: IncidentSeverity;
  reportedBy: string;
  status: IncidentStatus;
  resolution: string;
  mediaFiles: MediaFile[];
}

interface FormErrors {
  [key: string]: string | undefined;
}

export function useAddIncidentForm(initialReportedBy: string, preselectedHelperId?: string) {
  const [formData, setFormData] = useState<AddIncidentFormData>({
    helperId: preselectedHelperId || '',
    helperName: '',
    incidentDate: new Date().toISOString().split('T')[0],
    description: '',
    severity: 'Medium',
    reportedBy: initialReportedBy,
    status: 'Open',
    resolution: '',
    mediaFiles: [],
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const updateField = useCallback((field: keyof AddIncidentFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  }, []);

  const validateStep = useCallback((step: number): boolean => {
    const errs: FormErrors = {};

    switch (step) {
      case 0: // Select Helper
        if (!formData.helperId) {
          errs.helperId = 'Helper selection is required';
        }
        break;

      case 1: // Incident Details
        if (!formData.incidentDate) {
          errs.incidentDate = 'Incident date is required';
        }
        if (!formData.description.trim()) {
          errs.description = 'Description is required';
        } else if (formData.description.trim().length < 10) {
          errs.description = 'Description must be at least 10 characters';
        }
        if (!formData.reportedBy.trim()) {
          errs.reportedBy = 'Reporter name is required';
        }
        break;

      case 3: // Review
        if (formData.status === 'Resolved' && !formData.resolution.trim()) {
          errs.resolution = 'Resolution is required when status is resolved';
        }
        break;
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [formData]);

  const validateAll = useCallback((): boolean => {
    let isValid = true;
    for (let i = 0; i <= 3; i++) {
      if (!validateStep(i)) {
        isValid = false;
      }
    }
    return isValid;
  }, [validateStep]);

  return {
    formData,
    errors,
    updateField,
    validateStep,
    validateAll,
  };
}