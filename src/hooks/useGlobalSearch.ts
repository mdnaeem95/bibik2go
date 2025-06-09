// src/hooks/useGlobalSearch.ts
import { useState, useEffect, useMemo } from 'react';
import { helpersApi } from '@/services/api/helpers';
import { incidentsApi } from '@/services/api/incidents';
import { Helper, Incident } from '@/types';

export interface SearchResult {
  id: string;
  type: 'helper' | 'incident';
  title: string;
  subtitle: string;
  description: string;
  url: string;
  matchedField: string;
}

interface UseGlobalSearchReturn {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  results: SearchResult[];
  loading: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  clearSearch: () => void;
  hasResults: boolean;
}

export function useGlobalSearch(): UseGlobalSearchReturn {
  const [searchQuery, setSearchQuery] = useState('');
  const [helpers, setHelpers] = useState<Helper[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Debounced search query
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch data when component mounts or when search is opened
  useEffect(() => {
    if (isOpen && helpers.length === 0) {
      fetchData();
    }
  }, [isOpen]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [helpersData, incidentsData] = await Promise.all([
        helpersApi.getAll(),
        incidentsApi.getAll(),
      ]);
      setHelpers(helpersData);
      setIncidents(incidentsData);
    } catch (error) {
      console.error('Error fetching search data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Search results
  const results = useMemo(() => {
    if (!debouncedQuery.trim() || debouncedQuery.length < 2) {
      return [];
    }

    const query = debouncedQuery.toLowerCase();
    const searchResults: SearchResult[] = [];

    // Search helpers
    helpers.forEach((helper) => {
      const matches: { field: string; value: string }[] = [];
      
      if (helper.name.toLowerCase().includes(query)) {
        matches.push({ field: 'name', value: helper.name });
      }
      if (helper.currentEmployer.toLowerCase().includes(query)) {
        matches.push({ field: 'employer', value: helper.currentEmployer });
      }
      if (helper.problem.toLowerCase().includes(query)) {
        matches.push({ field: 'problem', value: helper.problem });
      }
      if (helper.eaOfficer.toLowerCase().includes(query)) {
        matches.push({ field: 'EA officer', value: helper.eaOfficer });
      }
      if (helper.pt && helper.pt.toLowerCase().includes(query)) {
        matches.push({ field: 'PT/Agency', value: helper.pt });
      }

      if (matches.length > 0) {
        const primaryMatch = matches[0];
        searchResults.push({
          id: helper.id,
          type: 'helper',
          title: helper.name,
          subtitle: helper.currentEmployer,
          description: `Outstanding: $${helper.outstandingLoan.toLocaleString()} • ${helper.eaOfficer}`,
          url: `/helpers/${helper.id}`,
          matchedField: `Matched ${primaryMatch.field}: ${primaryMatch.value}`,
        });
      }
    });

    // Search incidents
    incidents.forEach((incident) => {
      const helper = helpers.find(h => h.id === incident.helperId);
      const helperName = helper ? helper.name : 'Unknown Helper';
      const helperEmployer = helper ? helper.currentEmployer : '';

      const matches: { field: string; value: string }[] = [];
      
      if (incident.description.toLowerCase().includes(query)) {
        matches.push({ field: 'description', value: incident.description });
      }
      if (incident.reportedBy.toLowerCase().includes(query)) {
        matches.push({ field: 'reporter', value: incident.reportedBy });
      }
      if (helperName.toLowerCase().includes(query)) {
        matches.push({ field: 'helper name', value: helperName });
      }
      if (helperEmployer.toLowerCase().includes(query)) {
        matches.push({ field: 'helper employer', value: helperEmployer });
      }

      if (matches.length > 0) {
        const primaryMatch = matches[0];
        searchResults.push({
          id: incident.id,
          type: 'incident',
          title: `Incident: ${helperName}`,
          subtitle: `${incident.severity} • ${incident.status}`,
          description: incident.description.substring(0, 80) + (incident.description.length > 80 ? '...' : ''),
          url: `/incidents/${incident.id}`,
          matchedField: `Matched ${primaryMatch.field}: ${primaryMatch.value.substring(0, 50)}${primaryMatch.value.length > 50 ? '...' : ''}`,
        });
      }
    });

    // Sort results: helpers first, then by relevance
    return searchResults
      .sort((a, b) => {
        if (a.type !== b.type) {
          return a.type === 'helper' ? -1 : 1;
        }
        return a.title.localeCompare(b.title);
      })
      .slice(0, 10); // Limit to 10 results
  }, [debouncedQuery, helpers, incidents]);

  const clearSearch = () => {
    setSearchQuery('');
    setDebouncedQuery('');
    setIsOpen(false);
  };

  return {
    searchQuery,
    setSearchQuery: (query: string) => {
      setSearchQuery(query);
      setIsOpen(query.length > 0);
    },
    results,
    loading,
    isOpen,
    setIsOpen,
    clearSearch,
    hasResults: results.length > 0,
  };
}