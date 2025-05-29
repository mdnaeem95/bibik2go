import { GetServerSideProps, NextPage } from 'next';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionUser } from '@/lib/session';
import DashboardLayout from '@/components/DashboardLayout';
import { Typography, Box } from '@mui/material';

interface Props {
  user: SessionUser;
}

const Settings: NextPage<Props> = () => (
  <DashboardLayout>
    <Box>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>
      <Typography color="text.secondary">
        Configure your account and application preferences here.
      </Typography>
    </Box>
  </DashboardLayout>
);

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const session = await getIronSession<{ user?: SessionUser }>(
    req,
    res,
    sessionOptions
  );
  if (!session.user) {
    return { redirect: { destination: '/login', permanent: false } };
  }
  return { props: { user: session.user! } };
};

export default Settings;
