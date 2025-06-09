import { useState, useCallback } from 'react';

interface UseMultiStepFormProps {
  totalSteps: number;
  onStepChange?: (step: number) => void;
}

export function useMultiStepForm({ totalSteps, onStepChange }: UseMultiStepFormProps) {
  const [activeStep, setActiveStep] = useState(0);

  const goToNext = useCallback(() => {
    setActiveStep((prev) => {
      const next = Math.min(prev + 1, totalSteps - 1);
      onStepChange?.(next);
      return next;
    });
  }, [totalSteps, onStepChange]);

  const goToPrevious = useCallback(() => {
    setActiveStep((prev) => {
      const next = Math.max(prev - 1, 0);
      onStepChange?.(next);
      return next;
    });
  }, [onStepChange]);

  const goToStep = useCallback((step: number) => {
    if (step >= 0 && step < totalSteps) {
      setActiveStep(step);
      onStepChange?.(step);
    }
  }, [totalSteps, onStepChange]);

  const reset = useCallback(() => {
    setActiveStep(0);
    onStepChange?.(0);
  }, [onStepChange]);

  return {
    activeStep,
    isFirstStep: activeStep === 0,
    isLastStep: activeStep === totalSteps - 1,
    goToNext,
    goToPrevious,
    goToStep,
    reset,
  };
}