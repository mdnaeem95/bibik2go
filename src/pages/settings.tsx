// src/pages/settings.tsx
import { useState } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionUser } from '@/lib/session';
import DashboardLayout from '@/components/DashboardLayout';
import ProfileTab from '@/components/settings/ProfileTab';
import ApplicationTab from '@/components/settings/ApplicationTab';
import DataManagementTab from '@/components/settings/DataManagementTab';
import SystemTab from '@/components/settings/SystemTab';
import SecurityTab from '@/components/settings/SecurityTab';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Person,
  Settings as SettingsIcon,
  Storage,
  Security,
  AdminPanelSettings,
} from '@mui/icons-material';

interface Props {
  user: SessionUser;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const Settings: NextPage<Props> = ({ user }) => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const tabs = [
    { label: 'Profile', icon: <Person /> },
    { label: 'Application', icon: <SettingsIcon /> },
    { label: 'Data Management', icon: <Storage /> },
    { label: 'System', icon: <AdminPanelSettings /> },
    { label: 'Security', icon: <Security /> },
  ];

  return (
    <DashboardLayout>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom fontWeight={600}>
          Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Configure your account and application preferences
        </Typography>
      </Box>

      <Paper sx={{ width: '100%' }} elevation={2}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable">
            {tabs.map((tab, index) => (
              <Tab
                key={index}
                label={tab.label}
                icon={tab.icon}
                iconPosition="start"
                sx={{ minHeight: 64, textTransform: 'none' }}
              />
            ))}
          </Tabs>
        </Box>

        <TabPanel value={activeTab} index={0}>
          <ProfileTab user={user} />
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <ApplicationTab />
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <DataManagementTab />
        </TabPanel>

        <TabPanel value={activeTab} index={3}>
          <SystemTab />
        </TabPanel>

        <TabPanel value={activeTab} index={4}>
          <SecurityTab />
        </TabPanel>
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

export default Settings;