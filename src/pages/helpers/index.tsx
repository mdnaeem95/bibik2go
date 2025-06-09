// src/pages/helpers/index.tsx (REFACTORED with Add Button Loading)
import React, { useState } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { getIronSession } from 'iron-session';
import { Button, CircularProgress } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

import DashboardLayout from '@/components/DashboardLayout';
import { HelpersSummaryCards } from '@/components/helpers/HelpersSummaryCards';
import { HelpersFilters } from '@/components/helpers/HelpersFilters';
import { HelpersTable } from '@/components/helpers/HelpersTable';
import { EmptyState } from '@/components/common/EmptyState';
import { LoadingState } from '@/components/common/LoadingState';
import { PageHeader } from '@/components/common/PageHeader';
import { sessionOptions, SessionUser } from '@/lib/session';
import { useHelpers } from '@/hooks/useHelpers';

interface Props {
  user: SessionUser;
}

const HelpersPage: NextPage<Props> = () => {
  const router = useRouter();
  const [addingHelper, setAddingHelper] = useState(false);
  
  const {
    helpers,
    sortedHelpers,
    loading,
    search,
    setSearch,
    loanFilter,
    setLoanFilter,
    sortBy,
    sortOrder,
    handleSort,
    handleDelete,
  } = useHelpers();

  const handleAdd = async () => {
    setAddingHelper(true);
    try {
      await router.push('/helpers/new');
    } catch (error) {
      console.error('Navigation error:', error);
      setAddingHelper(false); // Reset loading if navigation fails
    }
    // Note: setAddingHelper(false) is not needed on success since we're navigating away
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Helpers"
        subtitle="Manage domestic helper loan accounts and employment records"
        action={
          <Button 
            variant="contained" 
            onClick={handleAdd} 
            startIcon={addingHelper ? <CircularProgress size={20} color="inherit" /> : <AddIcon />}
            disabled={addingHelper}
          >
            {addingHelper ? 'Loading...' : 'Add Helper'}
          </Button>
        }
      />

      {/* Summary Cards - Only show when data is loaded */}
      {!loading && helpers.length > 0 && (
        <HelpersSummaryCards helpers={helpers} />
      )}

      {/* Filters */}
      {!loading && helpers.length > 0 && (
        <HelpersFilters
          search={search}
          onSearchChange={setSearch}
          loanFilter={loanFilter}
          onLoanFilterChange={setLoanFilter}
        />
      )}

      {/* Content */}
      {loading ? (
        <LoadingState message="Loading helpers..." />
      ) : sortedHelpers.length === 0 ? (
        <EmptyState
          title={helpers.length === 0 ? 'No helpers found' : 'No helpers match your filters'}
          description={
            helpers.length === 0
              ? 'Add your first helper to get started.'
              : 'Try adjusting your search or filter criteria.'
          }
          action={
            helpers.length === 0
              ? { 
                  label: 'Add Helper', 
                  onClick: handleAdd,
                  disabled: addingHelper,
                  loading: addingHelper
                }
              : undefined
          }
        />
      ) : (
        <HelpersTable
          helpers={sortedHelpers}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          onDelete={handleDelete}
        />
      )}
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
    return {
      redirect: { destination: '/login', permanent: false },
    };
  }

  return { props: { user: session.user } };
};

export default HelpersPage;