// src/hooks/useHelpers.ts
import { useState, useEffect, useMemo } from 'react';
import { Helper, LOAN_THRESHOLDS } from '@/types';
import { helpersApi } from '@/services/api/helpers';
import { isNewEmployee } from '@/utils/helpers';
import toast from 'react-hot-toast';

export function useHelpers() {
  const [helpers, setHelpers] = useState<Helper[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [loanFilter, setLoanFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<keyof Helper>('outstandingLoan');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Fetch helpers
  const fetchHelpers = async () => {
    setLoading(true);
    try {
      const data = await helpersApi.getAll();
      setHelpers(data);
    } catch (err) {
      console.error('Failed to fetch helpers:', err);
      toast.error('Failed to load helpers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHelpers();
  }, []);

  // Filter helpers
  const filteredHelpers = useMemo(() => {
    return helpers.filter((h) => {
      // Search filter
      const matchesSearch = search === '' || 
        h.name.toLowerCase().includes(search.toLowerCase()) ||
        h.currentEmployer.toLowerCase().includes(search.toLowerCase()) ||
        h.eaOfficer.toLowerCase().includes(search.toLowerCase()) ||
        h.problem.toLowerCase().includes(search.toLowerCase());

      // Loan filter
      const matchesLoanFilter = (() => {
        switch (loanFilter) {
          case 'urgent': 
            return h.outstandingLoan >= LOAN_THRESHOLDS.URGENT_FOLLOWUP;
          case 'high': 
            return h.outstandingLoan >= LOAN_THRESHOLDS.MEDIUM_VALUE && 
                   h.outstandingLoan < LOAN_THRESHOLDS.HIGH_VALUE;
          case 'medium': 
            return h.outstandingLoan >= LOAN_THRESHOLDS.LOW_VALUE && 
                   h.outstandingLoan < LOAN_THRESHOLDS.MEDIUM_VALUE;
          case 'low': 
            return h.outstandingLoan >= LOAN_THRESHOLDS.MINIMAL && 
                   h.outstandingLoan < LOAN_THRESHOLDS.LOW_VALUE;
          case 'minimal': 
            return h.outstandingLoan < LOAN_THRESHOLDS.MINIMAL;
          case 'new': 
            return isNewEmployee(h.employmentStartDate);
          default: 
            return true;
        }
      })();

      return matchesSearch && matchesLoanFilter;
    });
  }, [helpers, search, loanFilter]);

  // Sort helpers
  const sortedHelpers = useMemo(() => {
    return [...filteredHelpers].sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      
      // Numeric fields
      if (sortBy === 'outstandingLoan' || sortBy === 'totalEmployers') {
        const aNum = Number(aValue) || 0;
        const bNum = Number(bValue) || 0;
        return sortOrder === 'asc' ? aNum - bNum : bNum - aNum;
      }
      
      // Date fields
      if (sortBy === 'employmentStartDate') {
        const aDate = new Date(aValue as string).getTime();
        const bDate = new Date(bValue as string).getTime();
        return sortOrder === 'asc' ? aDate - bDate : bDate - aDate;
      }
      
      // String fields
      return sortOrder === 'asc'
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
    });
  }, [filteredHelpers, sortBy, sortOrder]);

  // Handle sorting
  const handleSort = (column: keyof Helper) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder(column === 'outstandingLoan' ? 'desc' : 'asc');
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    try {
      await helpersApi.delete(id);
      setHelpers(prev => prev.filter(h => h.id !== id));
      toast.success('Helper record has been deleted!');
    } catch (err) {
      console.error('Delete failed', err);
      toast.error('Failed to delete helper');
    }
  };

  return {
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
    refetch: fetchHelpers,
  };
}