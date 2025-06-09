// src/components/common/SearchResults.tsx
import React from 'react';
import { useRouter } from 'next/router';
import {
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Typography,
  Box,
  Divider,
  CircularProgress,
  Chip,
  Fade,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import SearchIcon from '@mui/icons-material/Search';
import { SearchResult } from '@/hooks/useGlobalSearch';

interface SearchResultsProps {
  results: SearchResult[];
  loading: boolean;
  query: string;
  onClose: () => void;
  onResultClick?: (result: SearchResult) => void;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  loading,
  query,
  onClose,
  onResultClick,
}) => {
  const router = useRouter();

  const handleResultClick = (result: SearchResult) => {
    onResultClick?.(result);
    router.push(result.url);
    onClose();
  };

  const getResultIcon = (type: 'helper' | 'incident') => {
    return type === 'helper' ? (
      <PersonIcon color="primary" />
    ) : (
      <ReportProblemIcon color="secondary" />
    );
  };

  const getResultTypeColor = (type: 'helper' | 'incident') => {
    return type === 'helper' ? 'primary' : 'secondary';
  };

  if (loading) {
    return (
      <Fade in={true}>
        <Paper
          elevation={8}
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            mt: 1,
            maxHeight: 400,
            overflow: 'hidden',
            zIndex: 1300,
            border: '1px solid #e5e7eb',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: 3,
              gap: 2,
            }}
          >
            <CircularProgress size={20} />
            <Typography variant="body2" color="text.secondary">
              Searching...
            </Typography>
          </Box>
        </Paper>
      </Fade>
    );
  }

  if (!query.trim() || query.length < 2) {
    return (
      <Fade in={true}>
        <Paper
          elevation={8}
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            mt: 1,
            zIndex: 1300,
            border: '1px solid #e5e7eb',
          }}
        >
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <SearchIcon sx={{ fontSize: 32, color: 'text.secondary', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              Type at least 2 characters to search helpers and incidents
            </Typography>
          </Box>
        </Paper>
      </Fade>
    );
  }

  if (results.length === 0) {
    return (
      <Fade in={true}>
        <Paper
          elevation={8}
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            mt: 1,
            zIndex: 1300,
            border: '1px solid #e5e7eb',
          }}
        >
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <SearchIcon sx={{ fontSize: 32, color: 'text.secondary', mb: 1 }} />
            <Typography variant="body2" color="text.secondary" gutterBottom>
              No results found for &quot;{query}&quot;
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Try searching by helper name, employer, problem, or incident description
            </Typography>
          </Box>
        </Paper>
      </Fade>
    );
  }

  // Group results by type
  const helperResults = results.filter(r => r.type === 'helper');
  const incidentResults = results.filter(r => r.type === 'incident');

  return (
    <Fade in={true}>
      <Paper
        elevation={8}
        sx={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          mt: 1,
          maxHeight: 400,
          overflow: 'auto',
          zIndex: 1300,
          border: '1px solid #e5e7eb',
        }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid #f3f4f6' }}>
          <Typography variant="body2" color="text.secondary">
            Found {results.length} result{results.length !== 1 ? 's' : ''} for &quot;{query}&quot;
          </Typography>
        </Box>

        <List sx={{ p: 0 }}>
          {/* Helper Results */}
          {helperResults.length > 0 && (
            <>
              <Box sx={{ px: 2, py: 1, bgcolor: '#f8fafc' }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  HELPERS ({helperResults.length})
                </Typography>
              </Box>
              {helperResults.map((result) => (
                <ListItem key={`helper-${result.id}`} disablePadding>
                  <ListItemButton
                    onClick={() => handleResultClick(result)}
                    sx={{
                      px: 2,
                      py: 1.5,
                      '&:hover': {
                        bgcolor: '#f0f9ff',
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      {getResultIcon(result.type)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body2" fontWeight={500}>
                            {result.title}
                          </Typography>
                          <Chip
                            label="Helper"
                            size="small"
                            color={getResultTypeColor(result.type)}
                            sx={{ height: 18, fontSize: '0.7rem' }}
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {result.subtitle}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {result.description}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="primary.main"
                            sx={{ display: 'block', mt: 0.5, fontStyle: 'italic' }}
                          >
                            {result.matchedField}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              ))}
              {incidentResults.length > 0 && <Divider />}
            </>
          )}

          {/* Incident Results */}
          {incidentResults.length > 0 && (
            <>
              <Box sx={{ px: 2, py: 1, bgcolor: '#f8fafc' }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  INCIDENTS ({incidentResults.length})
                </Typography>
              </Box>
              {incidentResults.map((result) => (
                <ListItem key={`incident-${result.id}`} disablePadding>
                  <ListItemButton
                    onClick={() => handleResultClick(result)}
                    sx={{
                      px: 2,
                      py: 1.5,
                      '&:hover': {
                        bgcolor: '#f0f9ff',
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      {getResultIcon(result.type)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body2" fontWeight={500}>
                            {result.title}
                          </Typography>
                          <Chip
                            label="Incident"
                            size="small"
                            color={getResultTypeColor(result.type)}
                            sx={{ height: 18, fontSize: '0.7rem' }}
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {result.subtitle}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {result.description}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="secondary.main"
                            sx={{ display: 'block', mt: 0.5, fontStyle: 'italic' }}
                          >
                            {result.matchedField}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </>
          )}
        </List>
      </Paper>
    </Fade>
  );
};