// src/pages/incidents/add.tsx (Enhanced version)
import { GetServerSideProps, NextPage } from 'next';
import { getIronSession } from 'iron-session';
import { Paper } from '@mui/material';

import DashboardLayout from '@/components/DashboardLayout';
import { PageHeader } from '@/components/common/PageHeader';
import { AddIncidentForm } from '@/components/incidents/AddIncidentForm';
import { sessionOptions, SessionUser } from '@/lib/session';
import { getAllHelpers } from '@/lib/sheets';

interface Helper {
  id: string;
  name: string;
  currentEmployer: string;
}

interface Props {
  user: SessionUser;
  helpers: Helper[];
}

const AddIncidentPage: NextPage<Props> = ({ user, helpers }) => {
  return (
    <DashboardLayout>
      <PageHeader
        title="Report New Incident"
        subtitle="Document and track helper-related incidents with photos and videos"
        breadcrumbs={[
          { label: 'Incidents', href: '/incidents' },
          { label: 'Add New Incident' }
        ]}
      />

      <Paper sx={{ p: 4, maxWidth: 800, mx: 'auto' }} elevation={2}>
        <AddIncidentForm user={user} helpers={helpers} />
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

  try {
    const helpersData = await getAllHelpers();
    const helpers = helpersData.map(h => ({
      id: h.id,
      name: h.name,
      currentEmployer: h.currentEmployer,
    }));

    return { 
      props: { 
        user: session.user,
        helpers,
      } 
    };
  } catch (error) {
    console.error('Error fetching helpers:', error);
    return { 
      props: { 
        user: session.user,
        helpers: [],
      } 
    };
  }
};

export default AddIncidentPage;