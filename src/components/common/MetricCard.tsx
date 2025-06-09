import { Avatar, Box, Paper, Typography } from "@mui/material";

// Reusable MetricCard component
interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactElement;
  iconColor: string;
  subtitle?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  icon, 
  iconColor,
  subtitle 
}) => (
  <Paper
    elevation={2}
    sx={{
      p: 3,
      borderRadius: 3,
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      transition: 'all 0.3s ease',
      position: 'relative',
      overflow: 'hidden',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: 4,
      },
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        background: iconColor,
        opacity: 0.8,
      }
    }}
  >
    <Avatar
      sx={{
        bgcolor: iconColor,
        width: 56,
        height: 56,
        boxShadow: `0 4px 14px 0 ${iconColor}33`,
      }}
    >
      {icon}
    </Avatar>

    <Box sx={{ flexGrow: 1 }}>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ 
          textTransform: 'uppercase', 
          fontWeight: 600,
          fontSize: '0.75rem',
          letterSpacing: '0.5px',
          mb: 0.5,
        }}
      >
        {title}
      </Typography>
      <Typography variant="h4" fontWeight={700}>
        {value}
      </Typography>
      {subtitle && (
        <Typography variant="caption" color="text.secondary">
          {subtitle}
        </Typography>
      )}
    </Box>
  </Paper>
);