/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { useRouter } from 'next/router';
import { GetServerSideProps, NextPage } from 'next';
import { getIronSession } from 'iron-session';
import {
  Box,
  Paper,
  Button,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Fade,
} from '@mui/material';
import toast from 'react-hot-toast';

import DashboardLayout from '@/components/DashboardLayout';
import { PageHeader } from '@/components/common/PageHeader';
import { sessionOptions, SessionUser } from '@/lib/session';
import { useMultiStepForm } from '@/hooks/useMultiStepForm';
import { useNewHelperForm } from '@/hooks/useNewHelperForm';
import { FORM_STEPS } from '@/constants';
import { helpersApi } from '@/services/api/helpers';
import { incidentsApi } from '@/services/api/incidents';
import { HelperDetailsStep } from '@/components/helpers/HelperDetailsStep';
import { IncidentDetailsStep } from '@/components/helpers/IncidentDetailsStep';
import { MediaUploadStep } from '@/components/helpers/MediaUploadStep';
import { ReviewStep } from '@/components/helpers/ReviewStep';
import { TransferStatus } from '@/types';

interface Props {
  user: SessionUser;
}

const NewHelperPage: NextPage<Props> = ({ user }) => {
  const router = useRouter();
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);

  // Form management hooks
  const {
    formData,
    errors,
    updateField,
    validateStep,
    validateAll,
  } = useNewHelperForm(user.username);

  // Multi-step form management
  const {
    activeStep,
    isFirstStep,
    isLastStep,
    goToNext,
    goToPrevious,
  } = useMultiStepForm({
    totalSteps: FORM_STEPS.length,
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
    router.push('/helpers');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    
    if (!validateAll()) {
      toast.error('Please fix all errors before submitting');
      return;
    }

    setLoading(true);

    try {
      // Step 1: Create the helper
      const helperData = {
        name: formData.name,
        currentEmployer: formData.currentEmployer,
        problem: `Initial incident: ${formData.incidentDescription}`,
        totalEmployers: Number(formData.totalEmployers),
        eaOfficer: formData.eaOfficer,
        outstandingLoan: Number(formData.outstandingLoan),
        employmentStartDate: formData.employmentStartDate,
        pt: formData.pt,
        transferStatus: formData.transferStatus as TransferStatus
      };

      await helpersApi.create(helperData);

      // Step 2: Fetch all helpers to find the one we just created
      const allHelpers = await helpersApi.getAll();
      
      const createdHelper = allHelpers.find((h: any) => 
        h.name === formData.name && 
        h.currentEmployer === formData.currentEmployer &&
        h.eaOfficer === formData.eaOfficer
      );
      
      if (!createdHelper) {
        throw new Error('Helper was created but could not be found');
      }

      // Step 3: Create the incident with media
      const consistentIncidentId = formData.mediaFiles.length > 0 && formData.mediaFiles[0].incidentId
        ? formData.mediaFiles[0].incidentId
        : Date.now().toString();

      const incidentData = {
        id: consistentIncidentId,
        helperId: createdHelper.id,
        incidentDate: formData.incidentDate,
        description: formData.incidentDescription,
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

      const successMessage = formData.mediaFiles.length > 0 
        ? `Helper and initial incident added successfully with ${formData.mediaFiles.length} media file(s)!`
        : 'Helper and initial incident added successfully!';
      
      toast.success(successMessage);
      router.push('/helpers');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast.error(`Error: ${message}`);
      setSubmitError(message);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <HelperDetailsStep
            formData={formData}
            errors={errors}
            onChange={updateField}
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
            helperName={formData.name}
            helperCurrentEmployer={formData.currentEmployer}
            onChange={updateField}
          />
        );
      case 3:
        return <ReviewStep formData={formData} />;
      default:
        return null;
    }
  };

const getStepActionButtons = () => {
  if (isLastStep) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button onClick={handleBack} size="large">
          Back
        </Button>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button onClick={handleCancel} disabled={loading} size="large">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
            size="large"
          >
            {loading ? 'Creating...' : 'Create Helper & Incident'}
          </Button>
        </Box>
      </Box>
    );
  }

  if (isFirstStep) {
    // Check if basic required fields are filled for step 0
    const hasRequiredFields = formData.name.trim() && 
                             formData.currentEmployer.trim() && 
                             formData.eaOfficer.trim() &&
                             formData.totalEmployers.trim() &&
                             formData.outstandingLoan.trim() &&
                             formData.employmentStartDate;

    return (
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
        <Button
          onClick={handleNext}
          variant="contained"
          disabled={!hasRequiredFields}
          size="large"
        >
          Continue to Incident Details
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
      <Button onClick={handleBack} size="large">
        Back
      </Button>
      <Button
        onClick={handleNext}
        variant="contained"
        size="large"
        disabled={
          activeStep === 1 && (!formData.incidentDescription || !formData.incidentDate)
        }
      >
        {activeStep === 2 ? 'Continue to Review' : 'Continue'}
      </Button>
    </Box>
  );
};

  return (
    <DashboardLayout>
      <PageHeader
        title="Add New Helper & Initial Incident"
        subtitle="Register a new helper and document their initial incident with photos and videos"
        breadcrumbs={[
          { label: 'Helpers', href: '/helpers' },
          { label: 'Add New Helper' }
        ]}
      />

      <Paper sx={{ p: 4, maxWidth: 900, mx: 'auto' }} elevation={2}>
        {/* Stepper */}
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {FORM_STEPS.map((label) => (
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

        <Box component="form" onSubmit={handleSubmit}>
          <Fade in={true} key={activeStep}>
            <Box>
              {renderStepContent()}
              {getStepActionButtons()}
            </Box>
          </Fade>
        </Box>
      </Paper>
    </DashboardLayout>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const session = await getIronSession<{ user?: SessionUser }>(
    req,
    res,
    sessionOptions
  );
  
  if (!session.user) {
    return { redirect: { destination: '/login', permanent: false } };
  }
  
  return { props: { user: session.user } };
};

export default NewHelperPage;