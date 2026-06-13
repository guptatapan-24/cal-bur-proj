'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { List, AlertCircle, Zap, CheckCircle2 } from 'lucide-react';

interface Stats {
  total: number;
  open: number;
  critical: number;
  resolved: number;
}

export default function StatsBar() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/stats');
        if (!res.ok) throw new Error('Failed to fetch stats');
        const data = await res.json();
        setStats(data);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();

    window.addEventListener('incidentStatusChanged', fetchStats);
    return () => {
      window.removeEventListener('incidentStatusChanged', fetchStats);
    };
  }, []);

  const cardConfig = [
    {
      label: 'Total Incidents',
      value: stats?.total ?? 0,
      icon: List,
      iconColor: 'text-slate-600',
      bgColor: 'bg-slate-100/50',
    },
    {
      label: 'Open',
      value: stats?.open ?? 0,
      icon: AlertCircle,
      iconColor: 'text-amber-600',
      bgColor: 'bg-amber-100/50',
    },
    {
      label: 'Critical',
      value: stats?.critical ?? 0,
      icon: Zap,
      iconColor: 'text-red-600',
      bgColor: 'bg-red-100/50',
    },
    {
      label: 'Resolved',
      value: stats?.resolved ?? 0,
      icon: CheckCircle2,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-100/50',
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="border-slate-200 shadow-sm bg-white">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="space-y-2 w-2/3">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-12" />
              </div>
              <Skeleton className="h-10 w-10 rounded-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cardConfig.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index} className="border-slate-200 shadow-sm bg-white">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-500">{card.label}</p>
                <p className="text-3xl font-bold text-slate-900 tracking-tight">
                  {error ? '—' : card.value}
                </p>
              </div>
              <div className={`p-3 rounded-full ${card.bgColor} ${card.iconColor}`}>
                <Icon className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
