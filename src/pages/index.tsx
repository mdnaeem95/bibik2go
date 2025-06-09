// src/pages/index.tsx - SIMPLE REFACTORED VERSION
// This version works with your existing infrastructure
import { GetServerSideProps, NextPage } from 'next';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionUser } from '@/lib/session';
import { getAllHelpers } from '@/lib/sheets';
import { getAllUsers } from '@/lib/users';
import DashboardLayout from '@/components/DashboardLayout';
import { PageHeader } from '@/components/common/PageHeader';

import {
  Grid,
  Paper,
  Box,
  Typography,
  Alert,
} from '@mui/material';

import PeopleIcon from '@mui/icons-material/People';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import WarningIcon from '@mui/icons-material/Warning';

// Import types from centralized location
import { DashboardMetrics, LOAN_THRESHOLDS } from '@/types';
import { MetricCard } from '@/components/common/MetricCard';

interface DashboardProps {
  user: SessionUser;
  metrics: DashboardMetrics;
}

const Dashboard: NextPage<DashboardProps> = ({ user, metrics }) => {
  const dashboardMetrics = [
    {
      title: 'Total Helpers',
      value: metrics.totalHelpers || 0,
      icon: <PeopleIcon />,
      iconColor: '#3b82f6',
      subtitle: metrics.newEmployees 
        ? `${metrics.newEmployees} new this month` 
        : undefined,
    },
    {
      title: 'System Users',
      value: metrics.totalUsers || 0,
      icon: <AdminPanelSettingsIcon />,
      iconColor: '#10b981',
    },
    {
      title: 'Active Users',
      value: metrics.activeUsers || 0,
      icon: <AdminPanelSettingsIcon />,
      iconColor: '#22c55e',
      subtitle: `${((metrics.activeUsers / metrics.totalUsers) * 100).toFixed(0)}% active`,
    },
    {
      title: 'Outstanding Loans',
      value: `$${(metrics.totalOutstandingLoans || 0).toLocaleString()}`,
      icon: <AttachMoneyIcon />,
      iconColor: '#f97316',
      subtitle: metrics.urgentFollowUps 
        ? `${metrics.urgentFollowUps} urgent` 
        : 'All managed',
    },
  ];

  return (
    <DashboardLayout>
      <PageHeader
        title="Dashboard Overview"
        subtitle={`Welcome to your ${user.username === 'admin' ? 'admin' : ''} management portal`}
      />

      {/* Alert for urgent follow-ups */}
      {metrics.urgentFollowUps! > 0 && (
        <Alert 
          severity="warning" 
          icon={<WarningIcon />}
          sx={{ mb: 3 }}
        >
          <Typography variant="body2">
            <strong>{metrics.urgentFollowUps} helper(s)</strong> have loans ≥ ${LOAN_THRESHOLDS.URGENT_FOLLOWUP.toLocaleString()} and require urgent follow-up.
          </Typography>
        </Alert>
      )}

      {/* Metrics Grid */}
      <Grid container spacing={3}>
        {dashboardMetrics.map((item) => (
          <Grid size={{ xs:12, sm: 6, md: 3 }} key={item.title}>
            <MetricCard {...item} />
          </Grid>
        ))}
      </Grid>

      {/* Summary Statistics */}
      <Paper sx={{ p: 3, mt: 3 }} elevation={1}>
        <Typography variant="h6" gutterBottom>
          System Overview
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs:12, md: 6 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Helper Management
            </Typography>
            <Box sx={{ pl: 2 }}>
              <Typography variant="body2">
                • Average loan per helper: ${metrics.totalHelpers > 0 
                  ? Math.round(metrics.totalOutstandingLoans / metrics.totalHelpers).toLocaleString()
                  : 0}
              </Typography>
              <Typography variant="body2">
                • New employees (last 3 months): {metrics.newEmployees || 0}
              </Typography>
              <Typography variant="body2">
                • Helpers requiring attention: {metrics.urgentFollowUps || 0}
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs:12, md: 6 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              User Activity
            </Typography>
            <Box sx={{ pl: 2 }}>
              <Typography variant="body2">
                • Total system users: {metrics.totalUsers}
              </Typography>
              <Typography variant="body2">
                • Currently active: {metrics.activeUsers}
              </Typography>
              <Typography variant="body2">
                • User role: {user.role}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
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
    // Fetch data from Google Sheets and Users
    const [helpersData, usersData] = await Promise.all([
      getAllHelpers(),
      getAllUsers(),
    ]);

    // Calculate metrics
    const totalHelpers = helpersData.length;
    const totalUsers = usersData.length;
    const activeUsers = usersData.filter(user => user.status === 'active').length;
    
    // Calculate total outstanding loans
    const totalOutstandingLoans = helpersData.reduce((sum, helper) => {
      const loan = Number(helper.outstandingLoan) || 0;
      return sum + loan;
    }, 0);

    // Calculate urgent follow-ups (loans >= $3,300)
    const urgentFollowUps = helpersData.filter(helper => 
      Number(helper.outstandingLoan) >= LOAN_THRESHOLDS.URGENT_FOLLOWUP
    ).length;

    // Calculate new employees (< 3 months)
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    const newEmployees = helpersData.filter(helper => {
      if (!helper.employmentStartDate) return false;
      const startDate = new Date(helper.employmentStartDate);
      return startDate > threeMonthsAgo;
    }).length;

    const metrics: DashboardMetrics = {
      totalHelpers,
      totalUsers,
      activeUsers,
      totalOutstandingLoans,
      urgentFollowUps,
      newEmployees,
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
          totalUsers: 0,
          activeUsers: 0,
          totalOutstandingLoans: 0,
          urgentFollowUps: 0,
          newEmployees: 0,
        },
      },
    };
  }
};

export default Dashboard;