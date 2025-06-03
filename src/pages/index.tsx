// src/pages/index.tsx
import { GetServerSideProps, NextPage } from 'next';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionUser } from '@/lib/session';
import { getAllHelpers, getAllStaff } from '@/lib/sheets';
import DashboardLayout from '@/components/DashboardLayout';

import {
  Grid,
  Paper,
  Avatar,
  Box,
  Typography,
} from '@mui/material';

import PeopleIcon from '@mui/icons-material/People';
import BadgeIcon from '@mui/icons-material/Badge';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

interface DashboardMetrics {
  totalHelpers: number;
  totalStaff: number;
  totalOutstandingLoans: number;
}

interface DashboardProps {
  user: SessionUser;
  metrics: DashboardMetrics;
}

const Dashboard: NextPage<DashboardProps> = ({ metrics }) => {
  const dashboardMetrics = [
    {
      title: 'Total Helpers',
      value: metrics.totalHelpers || 0,
      icon: <PeopleIcon />,
      iconColor: '#3b82f6',
    },
    {
      title: 'Staff Members',
      value: metrics.totalStaff || 0,
      icon: <BadgeIcon />,
      iconColor: '#10b981',
    },
    {
      title: 'Outstanding Loans',
      value: `$${(metrics.totalOutstandingLoans || 0).toLocaleString()}`,
      icon: <AttachMoneyIcon />,
      iconColor: '#f97316',
    },
  ];

  return (
    <DashboardLayout>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Dashboard Overview
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome to your Bibik2go management portal
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {dashboardMetrics.map((item) => (
          <Grid key={item.title}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                borderRadius: 3,
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 3,
                },
              }}
            >
              <Avatar
                sx={{
                  bgcolor: item.iconColor,
                  width: 56,
                  height: 56,
                }}
              >
                {item.icon}
              </Avatar>

              <Box sx={{ flexGrow: 1 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ 
                    textTransform: 'uppercase', 
                    fontWeight: 500,
                    fontSize: '0.75rem',
                    letterSpacing: '0.5px'
                  }}
                >
                  {item.title}
                </Typography>
                <Typography variant="h4" fontWeight={700} sx={{ mt: 0.5 }}>
                  {item.value}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </DashboardLayout>
  );
};

export const getServerSideProps: GetServerSideProps<DashboardProps> = async ({ req, res }) => {
  // Check authentication
  const session = await getIronSession<{ user?: SessionUser }>(
    req,
    res,
    sessionOptions
  );

  if (!session.user) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  try {
    // Fetch data from Google Sheets
    const [helpersData, staffData] = await Promise.all([
      getAllHelpers(),
      getAllStaff(),
    ]);

    // Calculate metrics
    const totalHelpers = helpersData.length;
    const totalStaff = staffData.length;
    
    // Calculate total outstanding loans
    const totalOutstandingLoans = helpersData.reduce((sum, helper) => {
      const loan = Number(helper.outstandingLoan) || 0;
      return sum + loan;
    }, 0);

    const metrics: DashboardMetrics = {
      totalHelpers,
      totalStaff,
      totalOutstandingLoans,
    };

    return {
      props: {
        user: session.user,
        metrics,
      },
    };
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    
    // Return default metrics if there's an error
    return {
      props: {
        user: session.user,
        metrics: {
          totalHelpers: 0,
          totalStaff: 0,
          totalOutstandingLoans: 0,
        },
      },
    };
  }
};

export default Dashboard;