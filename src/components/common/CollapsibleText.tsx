// src/components/common/CollapsibleText.tsx
import React, { useState } from 'react';
import { Box, Typography, Link } from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';

interface CollapsibleTextProps {
  text: string;
  maxLength?: number;
  variant?: 'body1' | 'body2' | 'caption';
  showIcon?: boolean;
}

export const CollapsibleText: React.FC<CollapsibleTextProps> = ({
  text,
  maxLength = 100,
  variant = 'body2',
  showIcon = false,
}) => {
  const [expanded, setExpanded] = useState(false);

  // If text is shorter than maxLength, just show it normally
  if (text.length <= maxLength) {
    return (
      <Typography variant={variant} sx={{ wordBreak: 'break-word' }}>
        {text}
      </Typography>
    );
  }

  const truncatedText = text.substring(0, maxLength).trim();
  
  return (
    <Box>
      <Typography variant={variant} sx={{ wordBreak: 'break-word' }}>
        {expanded ? text : `${truncatedText}...`}
        {' '}
        <Link
          component="button"
          variant={variant}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setExpanded(!expanded);
          }}
          sx={{
            ml: 0.5,
            fontSize: 'inherit',
            textDecoration: 'underline',
            cursor: 'pointer',
            color: 'primary.main',
            '&:hover': {
              color: 'primary.dark',
            },
            display: 'inline-flex',
            alignItems: 'center',
            gap: showIcon ? 0.25 : 0,
          }}
        >
          {expanded ? 'see less' : 'see more'}
          {showIcon && (
            expanded ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />
          )}
        </Link>
      </Typography>
    </Box>
  );
};