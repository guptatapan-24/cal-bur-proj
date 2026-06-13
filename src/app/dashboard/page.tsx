'use client';

import React, { useEffect, useState } from 'react';
import StatsBar from '@/components/StatsBar';
import FilterBar from '@/components/FilterBar';
import IncidentTable from '@/components/IncidentTable';
import { Incident } from '@/lib/supabase';
import { toast } from 'sonner';

interface Filters {
  search: string;
  category: string;
  severity: string;
  status: string;
}

export default function DashboardPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({
    search: '',
    category: '',
    severity: '',
    status: '',
  });

  const fetchIncidents = async (currentFilters: Filters) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (currentFilters.search) queryParams.set('search', currentFilters.search);
      if (currentFilters.category) queryParams.set('category', currentFilters.category);
      if (currentFilters.severity) queryParams.set('severity', currentFilters.severity);
      if (currentFilters.status) queryParams.set('status', currentFilters.status);

      const url = `/api/incidents?${queryParams.toString()}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch incidents');
      const data = await res.json();
      setIncidents(data);
    } catch (err) {
      toast.error('Failed to load incidents. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents(filters);
  }, [filters]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      category: '',
      severity: '',
      status: '',
    });
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/incidents/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error('Failed to update status');

      toast.success(`Status updated to ${newStatus}`);
      
      // Dispatch custom event to notify Header and StatsBar to update
      window.dispatchEvent(new Event('incidentStatusChanged'));
      
      // Refetch incidents to display updated list
      fetchIncidents(filters);
    } catch (err) {
      toast.error('Failed to update incident status. Please try again.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 max-w-7xl space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Incident Dashboard
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Monitor, filter, and manage operational incidents in real-time.
          </p>
        </div>
      </div>

      {/* Statistics Bar */}
      <StatsBar />

      {/* Filter and Table Container */}
      <div className="space-y-4">
        <FilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
        />

        {/* Count Indicator */}
        <div className="text-sm text-slate-500 font-medium px-1">
          {loading ? (
            'Loading incidents...'
          ) : (
            `Showing ${incidents.length} ${incidents.length === 1 ? 'incident' : 'incidents'}`
          )}
        </div>

        {/* Incident Table */}
        <IncidentTable
          incidents={incidents}
          onStatusChange={handleStatusChange}
          loading={loading}
        />
      </div>
    </div>
  );
}
