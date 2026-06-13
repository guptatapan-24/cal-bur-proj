'use client';

import React from 'react';
import { SEVERITY_COLORS, STATUS_COLORS, STATUSES } from '@/lib/constants';
import { Incident, IncidentStatus, IncidentSeverity } from '@/lib/supabase';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { Inbox } from 'lucide-react';

interface IncidentTableProps {
  incidents: Incident[];
  onStatusChange: (id: string, status: string) => void;
  loading: boolean;
}

const SEVERITY_ROW_BORDERS: Record<IncidentSeverity, string> = {
  Low: 'border-l-4 border-l-green-500',
  Medium: 'border-l-4 border-l-yellow-500',
  High: 'border-l-4 border-l-orange-500',
  Critical: 'border-l-4 border-l-red-500',
};

export default function IncidentTable({ incidents, onStatusChange, loading }: IncidentTableProps) {
  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Incident</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Reported</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                <TableCell>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3.5 w-32" />
                  </div>
                </TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-9 w-28 ml-auto" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (incidents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white border border-slate-200 rounded-xl shadow-sm space-y-4 min-h-[300px]">
        <div className="rounded-full bg-slate-50 p-4 text-slate-400 border border-slate-100">
          <Inbox className="h-10 w-10" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-slate-900">No incidents found</h3>
          <p className="text-sm text-slate-500">Try adjusting your filters</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
      <div className="overflow-x-auto w-full">
        <Table className="min-w-[800px]">
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-12 text-center">#</TableHead>
              <TableHead>Incident</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Reported</TableHead>
              <TableHead className="text-right pr-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {incidents.map((incident, index) => {
              let timeDistance = 'just now';
              try {
                timeDistance = formatDistanceToNow(new Date(incident.created_at), { addSuffix: true });
              } catch (e) {
                console.error(e);
              }

              return (
                <TableRow 
                  key={incident.id} 
                  className={`hover:bg-slate-50/50 transition-colors ${SEVERITY_ROW_BORDERS[incident.severity]}`}
                >
                  <TableCell className="text-center font-medium text-slate-500">
                    {index + 1}
                  </TableCell>
                  <TableCell className="max-w-[280px]">
                    <div className="flex flex-col space-y-1">
                      <span className="font-semibold text-slate-900 leading-snug break-words flex items-center gap-1.5">
                        {incident.title}
                        {incident.ai_summary && (
                          <span 
                            title={incident.ai_summary} 
                            className="cursor-help text-indigo-500 hover:text-indigo-600 transition-colors inline-block select-none text-xs"
                          >
                            ✨
                          </span>
                        )}
                      </span>
                      <span className="text-xs text-slate-500 leading-normal break-words">
                        {incident.store_location}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-600 font-medium text-sm">
                    {incident.category}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`font-semibold shadow-xs ${SEVERITY_COLORS[incident.severity]}`}>
                      {incident.severity}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`font-semibold shadow-xs ${STATUS_COLORS[incident.status]}`}>
                      {incident.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-500 text-sm whitespace-nowrap">
                    {timeDistance}
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <Select
                      value={incident.status}
                      onValueChange={(val) => onStatusChange(incident.id, val)}
                    >
                      <SelectTrigger className="w-[125px] h-9 ml-auto text-xs font-medium border-slate-200">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((stat) => (
                          <SelectItem key={stat} value={stat} className="text-xs">
                            {stat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
