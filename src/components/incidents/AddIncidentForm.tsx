import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Box, Stepper, Step, StepLabel, Alert, Fade } from '@mui/material';
import toast from 'react-hot-toast';

import { useAddIncidentForm } from '@/hooks/useAddIncidentForm';
import { useMultiStepForm } from '@/hooks/useMultiStepForm';
import { INCIDENT_FORM_STEPS } from '@/constants';
import { incidentsApi } from '@/services/api/incidents';
import { SessionUser } from '@/lib/session';

import { MediaUploadStep } from './MediaUploadStep';
import { ReviewAndSubmitStep } from './ReviewAndSubmitStep';
import { SelectHelperStep } from './SelectHelperStep';
import { IncidentDetailsStep } from './IncidentDetailsPage';
import { FormNavigationButtons } from './FormNavigationButtons';

interface Helper {
  id: string;
  name: string;
  currentEmployer: string;
}

interface Props {
  user: SessionUser;
  helpers: Helper[];
}

export const AddIncidentForm: React.FC<Props> = ({ user, helpers }) => {
  const router = useRouter();
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    formData,
    errors,
    updateField,
    validateStep,
    validateAll,
  } = useAddIncidentForm(user.username, router.query.helperId as string);

  const {
    activeStep,
    isFirstStep,
    isLastStep,
    goToNext,
    goToPrevious,
  } = useMultiStepForm({
    totalSteps: INCIDENT_FORM_STEPS.length,
  });

  const handleNext = () => {
    if (validateStep(activeStep)) {
      goToNext();
    }
  };

  const handleBack = () => {
    goToPrevious();
  };

  const handleCancel = () => {
    router.back();
  };

  const handleSubmit = async () => {
    setSubmitError('');
    
    if (!validateAll()) {
      toast.error('Please fix all errors before submitting');
      return;
    }

    setLoading(true);

    try {
      const consistentIncidentId = formData.mediaFiles.length > 0 && formData.mediaFiles[0].incidentId
        ? formData.mediaFiles[0].incidentId
        : Date.now().toString();

      const incidentData = {
        id: consistentIncidentId,
        helperId: formData.helperId,
        incidentDate: formData.incidentDate,
        description: formData.description,
        severity: formData.severity,
        reportedBy: formData.reportedBy,
        status: formData.status,
        resolution: formData.resolution || undefined,
        mediaUrls: formData.mediaFiles.map(file => file.url),
        mediaFileIds: formData.mediaFiles
          .map(file => file.driveFileId)
          .filter((id): id is string => id !== undefined),
      };

      await incidentsApi.create(incidentData);
      
      toast.success('Incident added successfully with media files!');
      router.push(`/helpers/${formData.helperId}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast.error(`Error: ${message}`);
      setSubmitError(message);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    const selectedHelper = helpers.find(h => h.id === formData.helperId);

    switch (activeStep) {
      case 0:
        return (
          <SelectHelperStep
            helpers={helpers}
            selectedHelper={selectedHelper}
            onHelperChange={(helper) => {
              updateField('helperId', helper?.id || '');
              updateField('helperName', helper?.name || '');
            }}
            error={errors.helperId}
          />
        );
      case 1:
        return (
          <IncidentDetailsStep
            formData={formData}
            errors={errors}
            onChange={updateField}
          />
        );
      case 2:
        return (
          <MediaUploadStep
            formData={formData}
            helperName={selectedHelper?.name}
            helperCurrentEmployer={selectedHelper?.currentEmployer}
            onChange={updateField}
          />
        );
      case 3:
        return (
          <ReviewAndSubmitStep
            formData={formData}
            selectedHelper={selectedHelper}
            errors={errors}
            onChange={updateField}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Box>
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {INCIDENT_FORM_STEPS.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {submitError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {submitError}
        </Alert>
      )}

      <Fade in={true} key={activeStep}>
        <Box>
          {renderStepContent()}
          
          <FormNavigationButtons
            activeStep={activeStep}
            isFirstStep={isFirstStep}
            isLastStep={isLastStep}
            loading={loading}
            canContinue={getCanContinue()}
            onBack={handleBack}
            onNext={handleNext}
            onCancel={handleCancel}
            onSubmit={handleSubmit}
          />
        </Box>
      </Fade>
    </Box>
  );

  function getCanContinue(): boolean {
    switch (activeStep) {
      case 0:
        return !!formData.helperId;
      case 1:
        return !!(formData.description && formData.incidentDate);
      default:
        return true;
    }
  }
};