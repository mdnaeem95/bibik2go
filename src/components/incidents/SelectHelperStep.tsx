import React from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  TextField, 
  Autocomplete 
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';

interface Helper {
  id: string;
  name: string;
  currentEmployer: string;
}

interface Props {
  helpers: Helper[];
  selectedHelper: Helper | undefined;
  onHelperChange: (helper: Helper | null) => void;
  error?: string;
}

export const SelectHelperStep: React.FC<Props> = ({
  helpers,
  selectedHelper,
  onHelperChange,
  error,
}) => {
  return (
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
                error={!!error}
                helperText={error || 'Start typing to search by name or employer'}
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
    </Box>
  );
};