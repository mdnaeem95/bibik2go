import React from 'react';
import { Box, Button, CircularProgress } from '@mui/material';

interface Props {
  activeStep: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  loading: boolean;
  canContinue: boolean;
  onBack: () => void;
  onNext: () => void;
  onCancel: () => void;
  onSubmit: () => void;
}

export const FormNavigationButtons: React.FC<Props> = ({
  activeStep,
  isFirstStep,
  isLastStep,
  loading,
  canContinue,
  onBack,
  onNext,
  onCancel,
  onSubmit,
}) => {
  if (isLastStep) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button onClick={onBack} size="large">
          Back
        </Button>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button onClick={onCancel} disabled={loading} size="large">
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
            size="large"
          >
            {loading ? 'Submitting...' : 'Submit Incident'}
          </Button>
        </Box>
      </Box>
    );
  }

  if (isFirstStep) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
        <Button
          onClick={onNext}
          variant="contained"
          disabled={!canContinue}
          size="large"
        >
          Continue to Incident Details
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
      <Button onClick={onBack} size="large">
        Back
      </Button>
      <Button
        onClick={onNext}
        variant="contained"
        size="large"
        disabled={!canContinue}
      >
        {activeStep === 2 ? 'Continue to Review' : 'Continue'}
      </Button>
    </Box>
  );
};