// src/pages/incidents/add.tsx (Enhanced version)
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { GetServerSideProps, NextPage } from 'next';
import { getIronSession } from 'iron-session';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Autocomplete,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormHelperText,
  Card,
  CardContent,
  Breadcrumbs,
  Link,
  Stepper,
  Step,
  StepLabel,
  Fade,
  Chip,
  Divider,
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import PersonIcon from '@mui/icons-material/Person';
import DescriptionIcon from '@mui/icons-material/Description';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import toast from 'react-hot-toast';

import DashboardLayout from '@/components/DashboardLayout';
import MediaUpload, { MediaFile } from '@/components/MediaUpload';
import { sessionOptions, SessionUser } from '@/lib/session';
import { getAllHelpers } from '@/lib/sheets';

interface Helper {
  id: string;
  name: string;
  currentEmployer: string;
}

interface FormData {
  helperId: string;
  helperName: string;
  incidentDate: string;
  description: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  reportedBy: string;
  status: 'Open' | 'Resolved' | 'Under Review';
  resolution: string;
  mediaFiles: MediaFile[];
}

interface Props {
  user: SessionUser;
  helpers: Helper[];
}

const steps = ['Select Helper', 'Incident Details', 'Add Media', 'Review & Submit'];

const severityOptions = [
  { value: 'Low', color: 'success', description: 'Minor issue, no immediate action required' },
  { value: 'Medium', color: 'warning', description: 'Moderate issue, requires attention' },
  { value: 'High', color: 'error', description: 'Serious issue, urgent action needed' },
  { value: 'Critical', color: 'error', description: 'Critical issue, immediate intervention required' },
];

const statusOptions = [
  { value: 'Open', color: 'error', description: 'Issue is open and unresolved' },
  { value: 'Under Review', color: 'warning', description: 'Issue is being investigated' },
  { value: 'Resolved', color: 'success', description: 'Issue has been resolved' },
];

const AddIncidentPage: NextPage<Props> = ({ user, helpers }) => {
  const router = useRouter();
  const { helperId: preselectedHelperId } = router.query;
  const [activeStep, setActiveStep] = useState(0);

  const [form, setForm] = useState<FormData>({
    helperId: preselectedHelperId as string || '',
    helperName: '',
    incidentDate: new Date().toISOString().split('T')[0],
    description: '',
    severity: 'Medium',
    reportedBy: user.username,
    status: 'Open',
    resolution: '',
    mediaFiles: [],
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (form.helperId) {
      const helper = helpers.find(h => h.id === form.helperId);
      setForm(prev => ({ ...prev, helperName: helper?.name || '' }));
      if (activeStep === 0 && helper) {
        setActiveStep(1);
      }
    }
  }, [form.helperId, helpers, activeStep]);

  const validate = (step?: number): boolean => {
    const errs: Partial<FormData> = {};
    const currentStep = step ?? activeStep;

    if (currentStep >= 0) {
      if (!form.helperId) errs.helperId = 'Helper selection is required';
    }
    
    if (currentStep >= 1) {
      if (!form.incidentDate) errs.incidentDate = 'Incident date is required';
      if (!form.description.trim()) errs.description = 'Description is required';
      if (form.description.trim().length < 10) errs.description = 'Description must be at least 10 characters';
      if (!form.reportedBy.trim()) errs.reportedBy = 'Reporter name is required';
    }

    if (currentStep >= 3) {
      if (form.status === 'Resolved' && !form.resolution.trim()) {
        errs.resolution = 'Resolution is required when status is resolved';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const onChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((errs) => ({ ...errs, [field]: undefined }));
  };

  const onHelperChange = (helper: Helper | null) => {
    setForm(prev => ({ 
      ...prev, 
      helperId: helper?.id || '',
      helperName: helper?.name || ''
    }));
    setErrors((errs) => ({ ...errs, helperId: undefined }));
  };

  const onMediaFilesChange = (files: MediaFile[]) => {
    setForm(prev => ({ ...prev, mediaFiles: files }));
  };

  const handleNext = () => {
    if (validate(activeStep)) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const onCancel = () => {
    router.back();
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    if (!validate()) return;
    setLoading(true);

    try {
      // Use the incident ID from the first uploaded media file if available
      // Otherwise generate a new one
      let consistentIncidentId: string;

      if (form.mediaFiles.length > 0 && form.mediaFiles[0].incidentId) {
        // Use the ID from the uploaded media files
        consistentIncidentId = form.mediaFiles[0].incidentId;
        console.log('Using incident ID from media files:', consistentIncidentId);
      } else {
        // Generate a new ID if no media files were uploaded
        consistentIncidentId = Date.now().toString();
        console.log('Generated new incident ID:', consistentIncidentId);
      }

      // Prepare the incident data
      const incidentData = {
        id: consistentIncidentId, // Use the same ID we'll use for media
        helperId: form.helperId,
        incidentDate: form.incidentDate,
        description: form.description,
        severity: form.severity,
        reportedBy: form.reportedBy,
        status: form.status,
        resolution: form.resolution || undefined,
        mediaUrls: form.mediaFiles.map(file => file.url), // Save URLs to incident
        mediaFileIds: form.mediaFiles.map(file => file.driveFileId).filter(Boolean), // Save Drive file IDs
        createdAt: new Date().toISOString(),
      };

      const res = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(incidentData),
      });

      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || 'Failed to create incident');
      }

      const { id: createdIncidentId } = await res.json();
      
      toast.success('Incident added successfully with media files!');
      router.push(`/helpers/${form.helperId}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast.error(`Error: ${message}`);
      setSubmitError(message);
    } finally {
      setLoading(false);
    }
  };

  const selectedHelper = helpers.find(h => h.id === form.helperId);
  const selectedSeverity = severityOptions.find(s => s.value === form.severity);
  const selectedStatus = statusOptions.find(s => s.value === form.status);

  return (
    <DashboardLayout>
      <Breadcrumbs 
        separator={<NavigateNextIcon fontSize="small" />}
        sx={{ mb: 3 }}
      >
        <Link 
          color="inherit" 
          href="/incidents" 
          onClick={(e) => { e.preventDefault(); router.push('/incidents'); }}
          sx={{ cursor: 'pointer' }}
        >
          Incidents
        </Link>
        <Typography color="text.primary">Add New Incident</Typography>
      </Breadcrumbs>

      <Paper sx={{ p: 4, maxWidth: 800, mx: 'auto' }} elevation={2}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom fontWeight={600}>
            Report New Incident
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Document and track helper-related incidents with photos and videos
          </Typography>
        </Box>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
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

        <Box component="form" onSubmit={onSubmit}>
          {/* Step 1: Select Helper */}
          {activeStep === 0 && (
            <Fade in={true}>
              <Box>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon /> Select Helper
                </Typography>
                
                <Card variant="outlined" sx={{ mb: 3 }}>
                  <CardContent>
                    <Autocomplete
                      options={helpers}
                      getOptionLabel={(option) => `${option.name} (${option.currentEmployer})`}
                      value={selectedHelper || null}
                      onChange={(_, newValue) => onHelperChange(newValue)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Search and select a helper"
                          error={!!errors.helperId}
                          helperText={errors.helperId || 'Start typing to search by name or employer'}
                          required
                          fullWidth
                        />
                      )}
                      renderOption={(props, option) => (
                        <Box component="li" {...props}>
                          <Box>
                            <Typography variant="body1" fontWeight={500}>
                              {option.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Employer: {option.currentEmployer}
                            </Typography>
                          </Box>
                        </Box>
                      )}
                    />
                    
                    {selectedHelper && (
                      <Box sx={{ mt: 2, p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
                        <Typography variant="subtitle2" color="success.main">
                          ✓ Selected Helper
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {selectedHelper.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Current Employer: {selectedHelper.currentEmployer}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button 
                    onClick={handleNext} 
                    variant="contained" 
                    disabled={!form.helperId}
                  >
                    Continue
                  </Button>
                </Box>
              </Box>
            </Fade>
          )}

          {/* Step 2: Incident Details */}
          {activeStep === 1 && (
            <Fade in={true}>
              <Box>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <DescriptionIcon /> Incident Details
                </Typography>

                <Card variant="outlined" sx={{ mb: 3 }}>
                  <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <TextField
                      label="Incident Date"
                      type="date"
                      value={form.incidentDate}
                      onChange={onChange('incidentDate')}
                      error={!!errors.incidentDate}
                      helperText={errors.incidentDate}
                      required
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />

                    <TextField
                      label="Incident Description"
                      value={form.description}
                      onChange={onChange('description')}
                      error={!!errors.description}
                      helperText={errors.description || `${form.description.length}/500 characters`}
                      required
                      fullWidth
                      multiline
                      rows={4}
                      placeholder="Provide a detailed description of what happened..."
                      inputProps={{ maxLength: 500 }}
                    />

                    <FormControl required fullWidth>
                      <InputLabel>Severity Level</InputLabel>
                      <Select
                        value={form.severity}
                        label="Severity Level"
                        onChange={(e) => setForm(prev => ({ ...prev, severity: e.target.value as FormData['severity'] }))}
                      >
                        {severityOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            <Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Chip 
                                  label={option.value} 
                                  color={option.color as any} 
                                  size="small" 
                                />
                              </Box>
                              <Typography variant="caption" color="text.secondary">
                                {option.description}
                              </Typography>
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                      <FormHelperText>
                        {selectedSeverity?.description}
                      </FormHelperText>
                    </FormControl>

                    <TextField
                      label="Reported By"
                      value={form.reportedBy}
                      onChange={onChange('reportedBy')}
                      error={!!errors.reportedBy}
                      helperText={errors.reportedBy}
                      required
                      fullWidth
                    />
                  </CardContent>
                </Card>

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Button onClick={handleBack}>
                    Back
                  </Button>
                  <Button 
                    onClick={handleNext} 
                    variant="contained"
                    disabled={!form.description || !form.incidentDate}
                  >
                    Continue
                  </Button>
                </Box>
              </Box>
            </Fade>
          )}

          {/* Step 3: Add Media */}
          {activeStep === 2 && (
            <Fade in={true}>
              <Box>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CameraAltIcon /> Add Photos & Videos
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Upload photos and videos related to this incident. Files will be stored securely in Google Drive.
                </Typography>

                <Card variant="outlined" sx={{ mb: 3 }}>
                  <CardContent>
                    <MediaUpload
                      value={form.mediaFiles}
                      onChange={onMediaFilesChange}
                      maxFiles={10}
                      maxSizePerFile={50 * 1024 * 1024} // 50MB
                      helperName={selectedHelper?.name}
                      helperCurrentEmployer={selectedHelper?.currentEmployer}
                      incidentId={`temp_${Date.now()}`} 
                    />
                  </CardContent>
                </Card>

                {form.mediaFiles.length > 0 && (
                  <Alert severity="info" sx={{ mb: 3 }}>
                    <Typography variant="body2">
                      <strong>{form.mediaFiles.length} file(s) uploaded.</strong> These will be linked to the incident for future reference.
                    </Typography>
                  </Alert>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Button onClick={handleBack}>
                    Back
                  </Button>
                  <Button 
                    onClick={handleNext} 
                    variant="contained"
                  >
                    Continue
                  </Button>
                </Box>
              </Box>
            </Fade>
          )}

          {/* Step 4: Review & Submit */}
          {activeStep === 3 && (
            <Fade in={true}>
              <Box>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PriorityHighIcon /> Review & Submit
                </Typography>

                {/* Status Selection */}
                <Card variant="outlined" sx={{ mb: 3 }}>
                  <CardContent>
                    <FormControl required fullWidth sx={{ mb: 2 }}>
                      <InputLabel>Initial Status</InputLabel>
                      <Select
                        value={form.status}
                        label="Initial Status"
                        onChange={(e) => setForm(prev => ({ ...prev, status: e.target.value as FormData['status'] }))}
                      >
                        {statusOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            <Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Chip 
                                  label={option.value} 
                                  color={option.color as any} 
                                  size="small" 
                                />
                              </Box>
                              <Typography variant="caption" color="text.secondary">
                                {option.description}
                              </Typography>
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                      <FormHelperText>
                        {selectedStatus?.description}
                      </FormHelperText>
                    </FormControl>

                    {form.status === 'Resolved' && (
                      <TextField
                        label="Resolution Details"
                        value={form.resolution}
                        onChange={onChange('resolution')}
                        error={!!errors.resolution}
                        helperText={errors.resolution}
                        fullWidth
                        multiline
                        rows={3}
                        placeholder="Describe how this incident was resolved..."
                      />
                    )}
                  </CardContent>
                </Card>

                {/* Summary */}
                <Card variant="outlined" sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                      Incident Summary
                    </Typography>
                    <Box sx={{ display: 'grid', gap: 1, mb: 2 }}>
                      <Typography variant="body2">
                        <strong>Helper:</strong> {selectedHelper?.name} ({selectedHelper?.currentEmployer})
                      </Typography>
                      <Typography variant="body2">
                        <strong>Date:</strong> {new Date(form.incidentDate).toLocaleDateString()}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Severity:</strong> {form.severity}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Status:</strong> {form.status}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Reported by:</strong> {form.reportedBy}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Description:</strong> {form.description}
                      </Typography>
                    </Box>
                    
                    {form.mediaFiles.length > 0 && (
                      <>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="body2">
                          <strong>Media Files:</strong> {form.mediaFiles.length} file(s) uploaded
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                          {form.mediaFiles.map((file) => (
                            <Chip
                              key={file.id}
                              label={`${file.type === 'image' ? '📸' : '🎥'} ${file.name.substring(0, 20)}${file.name.length > 20 ? '...' : ''}`}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      </>
                    )}
                  </CardContent>
                </Card>

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Button onClick={handleBack}>
                    Back
                  </Button>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button onClick={onCancel} disabled={loading}>
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={loading}
                      startIcon={loading ? <CircularProgress size={20} /> : null}
                    >
                      {loading ? 'Submitting...' : 'Submit Incident'}
                    </Button>
                  </Box>
                </Box>
              </Box>
            </Fade>
          )}
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

  try {
    const helpersData = await getAllHelpers();
    const helpers = helpersData.map(h => ({
      id: h.id,
      name: h.name,
      currentEmployer: h.currentEmployer,
    }));

    return { 
      props: { 
        user: session.user,
        helpers,
      } 
    };
  } catch (error) {
    console.error('Error fetching helpers:', error);
    return { 
      props: { 
        user: session.user,
        helpers: [],
      } 
    };
  }
};

export default AddIncidentPage;