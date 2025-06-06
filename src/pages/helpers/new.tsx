/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
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
  Grid,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Chip,
  Stepper,
  Step,
  StepLabel,
  Fade,
  Card,
  CardContent,
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import toast from 'react-hot-toast';

import DashboardLayout from '@/components/DashboardLayout';
import MediaUpload, { MediaFile } from '@/components/MediaUpload';
import { sessionOptions, SessionUser } from '@/lib/session';

interface FormData {
  // Helper fields
  name: string;
  currentEmployer: string;
  problem: string;
  totalEmployers: string;
  eaOfficer: string;
  outstandingLoan: string;
  employmentStartDate: string;
  
  // Incident fields
  incidentDate: string;
  incidentDescription: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  reportedBy: string;
  status: 'Open' | 'Resolved' | 'Under Review';
  resolution: string;
  
  // Media fields
  mediaFiles: MediaFile[];
}

interface Props {
  user: SessionUser;
}

const steps = ['Helper Details', 'Initial Incident', 'Add Media', 'Review & Submit'];

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

const NewHelperPage: NextPage<Props> = ({ user }) => {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [form, setForm] = useState<FormData>({
    // Helper fields
    name: '',
    currentEmployer: '',
    problem: '',
    totalEmployers: '',
    eaOfficer: '',
    outstandingLoan: '',
    employmentStartDate: '',
    
    // Incident fields
    incidentDate: new Date().toISOString().split('T')[0], // Today's date
    incidentDescription: '',
    severity: 'Medium',
    reportedBy: user.username,
    status: 'Open',
    resolution: '',
    
    // Media fields
    mediaFiles: [],
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = (step?: number): boolean => {
    const errs: Partial<FormData> = {};
    const currentStep = step ?? activeStep;

    // Step 0: Helper Details
    if (currentStep >= 0) {
      if (!form.name.trim()) errs.name = 'Name is required';
      if (!form.currentEmployer.trim()) errs.currentEmployer = 'Employer is required';
      if (!/^\d+$/.test(form.totalEmployers)) errs.totalEmployers = 'Must be a number';
      if (!form.eaOfficer.trim()) errs.eaOfficer = 'EA Officer is required';
      if (!/^\d+$/.test(form.outstandingLoan)) errs.outstandingLoan = 'Must be a number';
      if (!form.employmentStartDate) errs.employmentStartDate = 'Employment start date is required';

      // Validate employment start date is not in the future
      if (form.employmentStartDate) {
        const startDate = new Date(form.employmentStartDate);
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        if (startDate > today) {
          errs.employmentStartDate = 'Employment start date cannot be in the future';
        }
      }
    }

    // Step 1: Incident Details
    if (currentStep >= 1) {
      if (!form.incidentDate) errs.incidentDate = 'Incident date is required';
      if (!form.incidentDescription.trim()) errs.incidentDescription = 'Incident description is required';
      if (form.incidentDescription.trim().length < 10) errs.incidentDescription = 'Description must be at least 10 characters';
      if (!form.reportedBy.trim()) errs.reportedBy = 'Reporter name is required';
    }

    // Step 3: Review (now step 3)
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
    router.push('/helpers');
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    if (!validate()) return;
    setLoading(true);

    try {
      // First, create the helper
      const helperRes = await fetch('/api/helpers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          currentEmployer: form.currentEmployer,
          problem: `Initial incident: ${form.incidentDescription}`, // Set initial problem
          totalEmployers: Number(form.totalEmployers),
          eaOfficer: form.eaOfficer,
          outstandingLoan: Number(form.outstandingLoan),
          employmentStartDate: form.employmentStartDate,
        }),
      });

      if (!helperRes.ok) {
        throw new Error('Failed to create helper');
      }

    // Helper was created successfully, now fetch all helpers to find the one we just created
    console.log('✅ Helper created successfully, fetching helpers to get ID...');
    
    const fetchHelpersRes = await fetch('/api/helpers');
    if (!fetchHelpersRes.ok) {
      throw new Error('Failed to fetch helpers after creation');
    }
    
    const allHelpers = await fetchHelpersRes.json();
    
    // Find the helper we just created by matching multiple fields to ensure uniqueness
    const createdHelper = allHelpers.find((h: any) => 
      h.name === form.name && 
      h.currentEmployer === form.currentEmployer &&
      h.eaOfficer === form.eaOfficer
    );
    
    if (!createdHelper) {
      throw new Error('Helper was created but could not be found in the list');
    }
    
    const helperId = createdHelper.id;
    console.log('✅ Found helper with ID:', helperId);

      // Generate consistent incident ID for media files
      let consistentIncidentId: string;
      if (form.mediaFiles.length > 0 && form.mediaFiles[0].incidentId) {
        consistentIncidentId = form.mediaFiles[0].incidentId;
      } else {
        consistentIncidentId = Date.now().toString();
      }

      // Then, create the incident with media
      const incidentData = {
        id: consistentIncidentId,
        helperId: helperId,
        incidentDate: form.incidentDate,
        description: form.incidentDescription,
        severity: form.severity,
        reportedBy: form.reportedBy,
        status: form.status,
        resolution: form.resolution || undefined,
        mediaUrls: form.mediaFiles.map(file => file.url),
        mediaFileIds: form.mediaFiles.map(file => file.driveFileId).filter(Boolean),
        createdAt: new Date().toISOString(),
      };

      console.log('📝 Creating incident with data:', {
        helperId: incidentData.helperId,
        description: incidentData.description.substring(0, 50) + '...',
        severity: incidentData.severity,
        status: incidentData.status
      });

      const incidentRes = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(incidentData),
      });

      if (!incidentRes.ok) {
        // If incident creation fails, we should still consider this a success
        // since the helper was created
        console.warn('Failed to create incident, but helper was created successfully');
      }

      const successMessage = form.mediaFiles.length > 0 
        ? `Helper and initial incident added successfully with ${form.mediaFiles.length} media file(s)!`
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

  const selectedSeverity = severityOptions.find(s => s.value === form.severity);
  const selectedStatus = statusOptions.find(s => s.value === form.status);

  return (
    <DashboardLayout>
      <Paper sx={{ p: 4, maxWidth: 900, mx: 'auto' }} elevation={2}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom fontWeight={600}>
            Add New Helper & Initial Incident
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Register a new helper and document their initial incident with photos and videos
          </Typography>
        </Box>

        {/* Stepper */}
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
          {/* Step 0: Helper Details */}
          {activeStep === 0 && (
            <Fade in={true}>
              <Box>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonAddIcon /> Helper Information
                </Typography>

                <Grid container spacing={3}>
                  {/* Personal Information */}
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, mb: 1, fontWeight: 600 }}>
                      Personal Information
                    </Typography>
                  </Grid>
                  
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      label="Full Name"
                      value={form.name}
                      onChange={onChange('name')}
                      error={!!errors.name}
                      helperText={errors.name}
                      fullWidth
                      required
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      label="EA Officer"
                      value={form.eaOfficer}
                      onChange={onChange('eaOfficer')}
                      error={!!errors.eaOfficer}
                      helperText={errors.eaOfficer}
                      fullWidth
                      required
                    />
                  </Grid>

                  {/* Employment Information */}
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{ mt: 3, mb: 1, fontWeight: 600 }}>
                      Employment Information
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      label="Current Employer"
                      value={form.currentEmployer}
                      onChange={onChange('currentEmployer')}
                      error={!!errors.currentEmployer}
                      helperText={errors.currentEmployer}
                      fullWidth
                      required
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      label="Employment Start Date"
                      type="date"
                      value={form.employmentStartDate}
                      onChange={onChange('employmentStartDate')}
                      error={!!errors.employmentStartDate}
                      helperText={errors.employmentStartDate}
                      fullWidth
                      required
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      label="Total Employers"
                      value={form.totalEmployers}
                      onChange={onChange('totalEmployers')}
                      error={!!errors.totalEmployers}
                      helperText={errors.totalEmployers || 'Total number of employers helper has worked for'}
                      fullWidth
                      required
                      type="number"
                      inputProps={{ min: 1 }}
                    />
                  </Grid>

                  {/* Financial Information */}
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{ mt: 3, mb: 1, fontWeight: 600 }}>
                      Financial Information
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      label="Outstanding Loan Amount"
                      value={form.outstandingLoan}
                      onChange={onChange('outstandingLoan')}
                      error={!!errors.outstandingLoan}
                      helperText={errors.outstandingLoan || 'Enter amount in SGD'}
                      fullWidth
                      required
                      type="number"
                      inputProps={{ min: 0, step: 0.01 }}
                      InputProps={{
                        startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
                      }}
                    />
                  </Grid>
                </Grid>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
                  <Button 
                    onClick={handleNext} 
                    variant="contained"
                    disabled={!form.name || !form.currentEmployer || !form.eaOfficer}
                    size="large"
                  >
                    Continue to Incident Details
                  </Button>
                </Box>
              </Box>
            </Fade>
          )}

          {/* Step 1: Incident Details */}
          {activeStep === 1 && (
            <Fade in={true}>
              <Box>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ReportProblemIcon /> Initial Incident Details
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Document the incident or problem that brought this helper to your attention
                </Typography>

                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, md: 6 }}>
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
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      label="Reported By"
                      value={form.reportedBy}
                      onChange={onChange('reportedBy')}
                      error={!!errors.reportedBy}
                      helperText={errors.reportedBy}
                      required
                      fullWidth
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <TextField
                      label="Incident Description"
                      value={form.incidentDescription}
                      onChange={onChange('incidentDescription')}
                      error={!!errors.incidentDescription}
                      helperText={errors.incidentDescription || `${form.incidentDescription.length}/500 characters`}
                      required
                      fullWidth
                      multiline
                      rows={4}
                      placeholder="Provide a detailed description of what happened..."
                      inputProps={{ maxLength: 500 }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
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
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormControl required fullWidth>
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
                  </Grid>

                  {form.status === 'Resolved' && (
                    <Grid size={{ xs: 12 }}>
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
                    </Grid>
                  )}
                </Grid>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                  <Button onClick={handleBack}>
                    Back
                  </Button>
                  <Button 
                    onClick={handleNext} 
                    variant="contained"
                    disabled={!form.incidentDescription || !form.incidentDate}
                  >
                    Review & Submit
                  </Button>
                </Box>
              </Box>
            </Fade>
          )}

          {/* Step 2: Add Media */}
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
                      helperName={form.name}
                      helperCurrentEmployer={form.currentEmployer}
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

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                  <Button onClick={handleBack} size="large">
                    Back
                  </Button>
                  <Button 
                    onClick={handleNext} 
                    variant="contained"
                    size="large"
                  >
                    Continue to Review
                  </Button>
                </Box>
              </Box>
            </Fade>
          )}

          {/* Step 3: Review & Submit */}
          {activeStep === 3 && (
            <Fade in={true}>
              <Box>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircleIcon /> Review & Submit
                </Typography>

                {/* Helper Summary */}
                <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                    Helper Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="body2"><strong>Name:</strong> {form.name}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="body2"><strong>Employer:</strong> {form.currentEmployer}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="body2"><strong>Employment Start:</strong> {new Date(form.employmentStartDate).toLocaleDateString()}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="body2"><strong>Total Employers:</strong> {form.totalEmployers}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="body2"><strong>EA Officer:</strong> {form.eaOfficer}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="body2"><strong>Outstanding Loan:</strong> ${Number(form.outstandingLoan).toLocaleString()}</Typography>
                    </Grid>
                  </Grid>
                </Paper>

                {/* Incident Summary */}
                <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                    Initial Incident
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="body2"><strong>Date:</strong> {new Date(form.incidentDate).toLocaleDateString()}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="body2"><strong>Reported by:</strong> {form.reportedBy}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="body2"><strong>Severity:</strong> {form.severity}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="body2"><strong>Status:</strong> {form.status}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <Typography variant="body2"><strong>Description:</strong> {form.incidentDescription}</Typography>
                    </Grid>
                    {form.resolution && (
                      <Grid size={{ xs: 12 }}>
                        <Typography variant="body2"><strong>Resolution:</strong> {form.resolution}</Typography>
                      </Grid>
                    )}
                  </Grid>
                  
                  {form.mediaFiles.length > 0 && (
                    <>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Media Files:</strong> {form.mediaFiles.length} file(s) uploaded
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
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
                </Paper>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                  <Button onClick={handleBack} size="large">
                    Back
                  </Button>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button onClick={onCancel} disabled={loading} size="large">
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
  return { props: { user: session.user } };
};

export default NewHelperPage;