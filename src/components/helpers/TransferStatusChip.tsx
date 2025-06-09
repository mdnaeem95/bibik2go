import { TransferStatus } from "@/types";

import NewReleasesIcon from '@mui/icons-material/NewReleases';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import { Chip, Tooltip } from "@mui/material";

export const TransferStatusChip: React.FC<{ status: TransferStatus }> = ({ status }) => {
  const config = {
    New: { 
      color: 'success' as const, 
      icon: <NewReleasesIcon fontSize="small" />,
      tooltip: 'New helper starting fresh employment'
    },
    Transfer: { 
      color: 'info' as const, 
      icon: <SwapHorizIcon fontSize="small" />,
      tooltip: 'Helper transferring from another employer'
    }
  };

  const { color, icon, tooltip } = config[status];

  return (
    <Tooltip title={tooltip}>
      <Chip
        icon={icon}
        label={status}
        color={color}
        size="small"
        variant="outlined"
      />
    </Tooltip>
  );
};