// src/hooks/useIncidents.ts
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { Incident, Helper } from '@/types';
import { incidentsApi } from '@/services/api/incidents';
import { SessionUser, canCreate, canEdit, canDelete } from '@/lib/session';
import toast from 'react-hot-toast';

interface UseIncidentsProps {
  user: SessionUser;
  helpers: Helper[];
}

export function useIncidents({ user, helpers }: UseIncidentsProps) {
  const router = useRouter();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [navigationLoading, setNavigationLoading] = useState({
    viewHelper: '',
    viewIncident: '',
    editIncident: '',
    addIncident: false,
  });

  // User permissions
  const userCanCreate = canCreate(user.role);
  const userCanEdit = canEdit(user.role);
  const userCanDelete = canDelete(user.role);

  // Fetch incidents
  const fetchIncidents = async () => {
    setLoading(true);
    try {
      const data = await incidentsApi.getAll();
      setIncidents(data);
    } catch (err) {
      console.error('Failed to fetch incidents:', err);
      toast.error('Failed to load incidents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  // Helper functions
  const getHelperName = (helperId: string) => {
    const helper = helpers.find(h => h.id === helperId);
    return helper ? helper.name : 'Unknown Helper';
  };

  const getHelperEmployer = (helperId: string) => {
    const helper = helpers.find(h => h.id === helperId);
    return helper ? helper.currentEmployer : '';
  };

  // Filter incidents
  const filteredIncidents = useMemo(() => {
    return incidents.filter((incident) => {
      const helperName = getHelperName(incident.helperId).toLowerCase();
      const matchesSearch = search === '' || 
        helperName.includes(search.toLowerCase()) ||
        incident.description.toLowerCase().includes(search.toLowerCase()) ||
        incident.reportedBy.toLowerCase().includes(search.toLowerCase());
      
      const matchesSeverity = severityFilter === '' || incident.severity === severityFilter;
      const matchesStatus = statusFilter === '' || incident.status === statusFilter;

      return matchesSearch && matchesSeverity && matchesStatus;
    });
  }, [incidents, search, severityFilter, statusFilter, helpers]);

  // Navigation handlers
  const handleAddIncident = async () => {
    if (!userCanCreate) {
      toast.error('You need Staff or Admin role to add incidents');
      return;
    }
    
    setNavigationLoading(prev => ({ ...prev, addIncident: true }));
    try {
      await router.push('/incidents/add');
    } catch (error) {
      console.error('Navigation error:', error);
      setNavigationLoading(prev => ({ ...prev, addIncident: false }));
    }
  };

  const handleEditIncident = async (incidentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!userCanEdit) {
      toast.error('You need Staff or Admin role to edit incidents');
      return;
    }
    
    setNavigationLoading(prev => ({ ...prev, editIncident: incidentId }));
    try {
      await router.push(`/incidents/${incidentId}/edit`);
    } catch (error) {
      console.error('Navigation error:', error);
      setNavigationLoading(prev => ({ ...prev, editIncident: '' }));
    }
  };

  const handleDeleteIncident = async (incidentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!userCanDelete) {
      toast.error('You need Staff or Admin role to delete incidents');
      return;
    }
    
    if (!confirm('Are you sure you want to delete this incident?')) return;
    
    setDeletingId(incidentId);
    try {
      await incidentsApi.delete(incidentId);
      toast.success('Incident deleted successfully!');
      setIncidents(prev => prev.filter(i => i.id !== incidentId));
    } catch (err) {
      console.error('Error deleting incident:', err);
      toast.error('Failed to delete incident');
    } finally {
      setDeletingId(null);
    }
  };

  const handleViewHelper = async (helperId: string, incidentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNavigationLoading(prev => ({ ...prev, viewHelper: incidentId }));
    try {
      await router.push(`/helpers/${helperId}`);
    } catch (error) {
      console.error('Navigation error:', error);
      setNavigationLoading(prev => ({ ...prev, viewHelper: '' }));
    }
  };

  const handleViewIncident = async (incidentId: string) => {
    setNavigationLoading(prev => ({ ...prev, viewIncident: incidentId }));
    try {
      await router.push(`/incidents/${incidentId}`);
    } catch (error) {
      console.error('Navigation error:', error);
      setNavigationLoading(prev => ({ ...prev, viewIncident: '' }));
    }
  };

  // Filter management
  const clearFilters = () => {
    setSearch('');
    setSeverityFilter('');
    setStatusFilter('');
  };

  const hasActiveFilters = search !== '' || severityFilter !== '' || statusFilter !== '';

  return {
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
  };
}