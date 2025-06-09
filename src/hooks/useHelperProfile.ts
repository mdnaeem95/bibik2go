import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { Helper } from '@/lib/sheets';
import { SessionUser, canEdit, canDelete, canCreate } from '@/lib/session';

interface Incident {
  id: string;
  helperId: string;
  incidentDate: string;
  description: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  reportedBy: string;
  status: 'Open' | 'Resolved' | 'Under Review';
  resolution?: string;
  createdAt: string;
}

export function useHelperProfile(helper: Helper | null, user: SessionUser) {
  const router = useRouter();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [navigationLoading, setNavigationLoading] = useState({
    editProfile: false,
    addIncident: false,
  });
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    incidentId: string | null;
  }>({
    open: false,
    incidentId: null,
  });

  // User permissions
  const userCanEdit = canEdit(user.role);
  const userCanDelete = canDelete(user.role);
  const userCanCreate = canCreate(user.role);

  const fetchIncidents = async () => {
    if (!helper) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/incidents?helperId=${helper.id}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setIncidents(data);
      }
    } catch (err) {
      console.error('Failed to fetch incidents:', err);
      toast.error('Failed to load incidents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, [helper]);

  const handleAddIncident = async () => {
    if (!userCanCreate) {
      toast.error('You need Staff or Admin role to add incidents');
      return;
    }
    
    setNavigationLoading(prev => ({ ...prev, addIncident: true }));
    try {
      await router.push(`/incidents/add?helperId=${helper?.id}`);
    } catch (error) {
      console.error('Navigation error:', error);
      setNavigationLoading(prev => ({ ...prev, addIncident: false }));
    }
  };

  const handleEditProfile = async () => {
    if (!userCanEdit) {
      toast.error('You need Staff or Admin role to edit profiles');
      return;
    }
    
    setNavigationLoading(prev => ({ ...prev, editProfile: true }));
    try {
      await router.push(`/helpers/${helper?.id}/edit?returnTo=/helpers/${helper?.id}`);
    } catch (error) {
      console.error('Navigation error:', error);
      setNavigationLoading(prev => ({ ...prev, editProfile: false }));
    }
  };

  const handleDeleteIncident = async (incidentId: string) => {
    if (!userCanDelete) {
      toast.error('You need Staff or Admin role to delete incidents');
      return;
    }
    
    try {
      await fetch(`/api/incidents/${incidentId}`, { method: 'DELETE' });
      toast.success('Incident deleted successfully!');
      setIncidents(prev => prev.filter(i => i.id !== incidentId));
    } catch (err) {
      console.error('Error deleting incident:', err);
      toast.error('Failed to delete incident');
    }
    setDeleteDialog({ open: false, incidentId: null });
  };

  // Calculate incident statistics
  const incidentStats = {
    open: incidents.filter(i => i.status === 'Open').length,
    underReview: incidents.filter(i => i.status === 'Under Review').length,
    resolved: incidents.filter(i => i.status === 'Resolved').length,
  };

  return {
    incidents,
    loading,
    deleteDialog,
    setDeleteDialog,
    handleAddIncident,
    handleEditProfile,
    handleDeleteIncident,
    incidentStats,
    navigationLoading,
    userCanEdit,
    userCanDelete,
    userCanCreate,
  };
}