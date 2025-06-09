import { TransferStatus } from "@/types";
import { NewReleases, SwapHoriz } from "@mui/icons-material";
import { Box, Chip, Typography } from "@mui/material";

export const TransferStatusDisplay: React.FC<{ status: TransferStatus }> = ({ status }) => {
  const config = {
    New: { 
      color: 'success' as const, 
      icon: <NewReleases fontSize="small" />,
      label: 'New Helper',
      description: 'First-time helper starting fresh employment'
    },
    Transfer: { 
      color: 'info' as const, 
      icon: <SwapHoriz fontSize="small" />,
      label: 'Transfer',
      description: 'Helper transferring from another employer'
    }
  };

  const { color, icon, label, description } = config[status];

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Chip
        icon={icon}
        label={label}
        color={color}
        size="small"
        variant="filled"
      />
      <Typography variant="caption" color="text.secondary">
        ({description})
      </Typography>
    </Box>
  );
};