/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from 'react';
import { IncidentSeverity, IncidentStatus, MediaFile } from '@/types';
import { validators } from '@/utils/validation';

export interface NewHelperFormData {
  // Helper fields
  name: string;
  currentEmployer: string;
  totalEmployers: string;
  eaOfficer: string;
  outstandingLoan: string;
  employmentStartDate: string;
  
  // Incident fields
  incidentDate: string;
  incidentDescription: string;
  severity: IncidentSeverity;
  reportedBy: string;
  status: IncidentStatus;
  resolution: string;
  
  // Media fields
  mediaFiles: MediaFile[];
}

interface FormErrors {
  [key: string]: string | undefined;
}

export function useNewHelperForm(initialReportedBy: string) {
  const [formData, setFormData] = useState<NewHelperFormData>({
    // Helper fields
    name: '',
    currentEmployer: '',
    totalEmployers: '',
    eaOfficer: '',
    outstandingLoan: '',
    employmentStartDate: '',
    
    // Incident fields
    incidentDate: new Date().toISOString().split('T')[0],
    incidentDescription: '',
    severity: 'Medium',
    reportedBy: initialReportedBy,
    status: 'Open',
    resolution: '',
    
    // Media fields
    mediaFiles: [],
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const updateField = useCallback((field: keyof NewHelperFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when field is updated
    setErrors(prev => ({ ...prev, [field]: undefined }));
  }, []);

  const validateStep = useCallback((step: number): boolean => {
    const errs: FormErrors = {};

    switch (step) {
      case 0: // Helper Details
        if (!formData.name.trim()) {
          errs.name = 'Name is required';
        }
        if (!formData.currentEmployer.trim()) {
          errs.currentEmployer = 'Employer is required';
        }
        if (!validators.number(formData.totalEmployers, 'Total employers')) {
          errs.totalEmployers = validators.number(formData.totalEmployers, 'Total employers');
        }
        if (!formData.eaOfficer.trim()) {
          errs.eaOfficer = 'EA Officer is required';
        }
        if (!validators.number(formData.outstandingLoan, 'Outstanding loan')) {
          errs.outstandingLoan = validators.number(formData.outstandingLoan, 'Outstanding loan');
        }
        if (!formData.employmentStartDate) {
          errs.employmentStartDate = 'Employment start date is required';
        } else {
          const futureDateError = validators.futureDate(formData.employmentStartDate, 'Employment start date');
          if (futureDateError) {
            errs.employmentStartDate = futureDateError;
          }
        }
        break;

      case 1: // Incident Details
        if (!formData.incidentDate) {
          errs.incidentDate = 'Incident date is required';
        }
        if (!formData.incidentDescription.trim()) {
          errs.incidentDescription = 'Incident description is required';
        } else if (formData.incidentDescription.trim().length < 10) {
          errs.incidentDescription = 'Description must be at least 10 characters';
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
    // Validate all steps
    let isValid = true;
    for (let i = 0; i <= 3; i++) {
      if (!validateStep(i)) {
        isValid = false;
      }
    }
    return isValid;
  }, [validateStep]);

  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      currentEmployer: '',
      totalEmployers: '',
      eaOfficer: '',
      outstandingLoan: '',
      employmentStartDate: '',
      incidentDate: new Date().toISOString().split('T')[0],
      incidentDescription: '',
      severity: 'Medium',
      reportedBy: initialReportedBy,
      status: 'Open',
      resolution: '',
      mediaFiles: [],
    });
    setErrors({});
  }, [initialReportedBy]);

  return {
    formData,
    errors,
    updateField,
    validateStep,
    validateAll,
    resetForm,
  };
}