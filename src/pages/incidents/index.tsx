// src/pages/incidents/index.tsx (REFACTORED VERSION)
import React from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { getIronSession } from 'iron-session';
import { Box, Typography, Chip } from '@mui/material';

import DashboardLayout from '@/components/DashboardLayout';
import { EmptyState } from '@/components/common/EmptyState';
import { IncidentsHeader } from '@/components/incidents/IncidentsHeader';
import { IncidentsFilters } from '@/components/incidents/IncidentsFilters';
import { IncidentsGrid } from '@/components/incidents/IncidentsGrid';

import { sessionOptions, SessionUser } from '@/lib/session';
import { getAllHelpers } from '@/lib/sheets';
import { useIncidents } from '@/hooks/useIncidents';
import { Helper } from '@/types';

interface Props {
  user: SessionUser;
  helpers: Helper[];
}

const IncidentsPage: NextPage<Props> = ({ user, helpers }) => {
  const {
    // Data
    incidents,
    filteredIncidents,
    loading,
    
    // Filters
    search,
    setSearch,
    severityFilter,
    setSeverityFilter,
    statusFilter,
    setStatusFilter,
    hasActiveFilters,
    clearFilters,
    
    // Helper functions
    getHelperName,
    getHelperEmployer,
    
    // Actions
    handleAddIncident,
    handleEditIncident,
    handleDeleteIncident,
    handleViewHelper,
    handleViewIncident,
    
    // State
    deletingId,
    navigationLoading,
    
    // Permissions
    userCanCreate,
    userCanEdit,
    userCanDelete,
  } = useIncidents({ user, helpers });

  return (
    <DashboardLayout>
      <IncidentsHeader
        user={user}
        userCanCreate={userCanCreate}
        onAddIncident={handleAddIncident}
        addingIncident={navigationLoading.addIncident}
      />

      <IncidentsFilters
        search={search}
        onSearchChange={setSearch}
        severityFilter={severityFilter}
        onSeverityFilterChange={setSeverityFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearFilters}
        loading={loading}
      />

      {/* Results Summary */}
      {!loading && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Showing <strong>{filteredIncidents.length}</strong> of <strong>{incidents.length}</strong> incidents
            {hasActiveFilters && (
              <Chip 
                label="Filtered" 
                size="small" 
                color="primary" 
                sx={{ ml: 1 }}
                onDelete={clearFilters}
              />
            )}
          </Typography>
        </Box>
      )}

      {/* Content */}
      {!loading && filteredIncidents.length === 0 ? (
        <EmptyState
          title={incidents.length === 0 ? 'No incidents found' : 'No incidents match your filters'}
          description={
            incidents.length === 0 
              ? (userCanCreate 
                  ? 'Start by adding your first incident report to track helper issues.'
                  : 'No incident reports have been created yet.'
                )
              : 'Try adjusting your search criteria or clearing the filters.'
          }
          action={
            incidents.length === 0 && userCanCreate
              ? { 
                  label: 'Add First Incident', 
                  onClick: handleAddIncident,
                  disabled: navigationLoading.addIncident,
                  loading: navigationLoading.addIncident
                }
              : incidents.length > 0
              ? {
                  label: 'Clear Filters',
                  onClick: clearFilters
                }
              : undefined
          }
        />
      ) : (
        <IncidentsGrid
          incidents={filteredIncidents}
          loading={loading}
          getHelperName={getHelperName}
          getHelperEmployer={getHelperEmployer}
          onViewHelper={handleViewHelper}
          onEdit={handleEditIncident}
          onDelete={handleDeleteIncident}
          onView={handleViewIncident}
          userCanEdit={userCanEdit}
          userCanDelete={userCanDelete}
          deletingId={deletingId}
          navigationLoading={navigationLoading}
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

  try {
    const helpersData = await getAllHelpers();
    const helpers = helpersData.map(h => ({
      id: h.id,
      name: h.name,
      currentEmployer: h.currentEmployer,
      problem: h.problem,
      totalEmployers: Number(h.totalEmployers),
      eaOfficer: h.eaOfficer,
      outstandingLoan: Number(h.outstandingLoan),
      employmentStartDate: h.employmentStartDate,
    }));

    return { 
      props: { 
        user: session.user,
        helpers,
      } 
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    return { 
      props: { 
        user: session.user,
        helpers: [],
      } 
    };
  }
};

export default IncidentsPage;