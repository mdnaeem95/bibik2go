// src/pages/index.tsx
import { GetServerSideProps, NextPage } from 'next';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionUser } from '@/lib/session';
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
import ReportProblemIcon from '@mui/icons-material/ReportProblem';

interface DashboardProps {
  user: SessionUser;
}

const metrics = [
  {
    title: 'Total Helpers',
    value: 128,
    icon: <PeopleIcon />,
    iconColor: '#3b82f6',
  },
  {
    title: 'Staff Members',
    value: 16,
    icon: <BadgeIcon />,
    iconColor: '#10b981',
  },
  {
    title: 'Open Issues',
    value: 7,
    icon: <ReportProblemIcon />,
    iconColor: '#f97316',
  },
];

const Dashboard: NextPage<DashboardProps> = () => {
  return (
    <DashboardLayout>
      <Grid container spacing={3}>
        {metrics.map((item) => (
          <Grid key={item.title}>
            <Paper
              elevation={3}
              sx={{
                p: 3,
                borderRadius: 4,
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <Avatar
                sx={{
                  bgcolor: item.iconColor,
                  width: 48,
                  height: 48,
                }}
              >
                {item.icon}
              </Avatar>

              <Box sx={{ flexGrow: 1 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ textTransform: 'uppercase', fontWeight: 500 }}
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
  // Tell getIronSession the shape of your session data
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

  return {
    props: {
      user: session.user,
    },
  };
};

export default Dashboard;
