import React from 'react';
import { GetServerSideProps } from 'next';
import { getIronSession } from 'iron-session';

import DashboardLayout from '@/components/DashboardLayout';
import { PageHeader } from '@/components/common/PageHeader';
import { LoadingState } from '@/components/common/LoadingState';
import { HelperProfileHeader } from '@/components/helpers/HelperProfileHeader';
import { HelperProfileDetails } from '@/components/helpers/HelperProfileDetails';
import { IncidentStatistics } from '@/components/helpers/IncidentStatistics';
import { IncidentHistory } from '@/components/helpers/IncidentHistory';
import { DeleteIncidentDialog } from '@/components/helpers/DeleteIncidentDialog';

import { getAllHelpers, Helper } from '@/lib/sheets';
import { sessionOptions, SessionUser } from '@/lib/session';
import { useHelperProfile } from '@/hooks/useHelperProfile';

interface Props {
  helper: Helper | null;
  user: SessionUser;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { req, res } = context;
  const id = context.params?.id as string;
  
  const session = await getIronSession<{ user?: SessionUser }>(
    req,
    res,
    sessionOptions
  );
  
  if (!session.user) {
    return { redirect: { destination: '/login', permanent: false } };
  }
  
  const allHelpers = await getAllHelpers();
  const helper = allHelpers.find((h) => h.id === id) || null;

  if (!helper) {
    return { notFound: true };
  }

  return {
    props: { helper, user: session.user },
  };
};

export default function HelperProfile({ helper, user }: Props) {
  const {
    incidents,
    loading,
    deleteDialog,
    handleAddIncident,
    handleEditProfile,
    handleDeleteIncident,
    setDeleteDialog,
    incidentStats,
    navigationLoading,
  } = useHelperProfile(helper, user);

  if (!helper) {
    return (
      <DashboardLayout>
        <LoadingState message="Loading helper profile..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader
        title={helper.name}
        breadcrumbs={[
          { label: 'Helpers', href: '/helpers' },
          { label: helper.name },
        ]}
      />

      <HelperProfileHeader
        helper={helper}
        user={user}
        incidents={incidents}
        onEditProfile={handleEditProfile}
        onAddIncident={handleAddIncident}
        navigationLoading={navigationLoading}
      />

      <HelperProfileDetails helper={helper} />

      {incidents.length > 0 && (
        <IncidentStatistics stats={incidentStats} />
      )}

      <IncidentHistory
        incidents={incidents}
        loading={loading}
        user={user}
        onAddIncident={handleAddIncident}
        onDeleteIncident={(id) => setDeleteDialog({ open: true, incidentId: id })}
        navigationLoading={navigationLoading}
      />

      <DeleteIncidentDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, incidentId: null })}
        onConfirm={() => deleteDialog.incidentId && handleDeleteIncident(deleteDialog.incidentId)}
      />
    </DashboardLayout>
  );
}