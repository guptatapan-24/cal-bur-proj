'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PlusCircle } from 'lucide-react';

export default function Header() {
  const pathname = usePathname();
  const [openCount, setOpenCount] = useState<number | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/stats');
        if (res.ok) {
          const data = await res.json();
          setOpenCount(data.open ?? 0);
        }
      } catch (err) {
        // Silent error
      }
    }
    fetchStats();

    window.addEventListener('incidentStatusChanged', fetchStats);
    return () => {
      window.removeEventListener('incidentStatusChanged', fetchStats);
    };
  }, [pathname]);

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center space-x-2 text-xl font-bold tracking-tight text-slate-900">
          <span>🍽️ IncidentIQ</span>
        </Link>
        <nav className="flex items-center space-x-6 text-sm font-medium">
          <Link
            href="/report"
            className={`transition-colors flex items-center gap-1.5 ${
              isActive('/report')
                ? 'text-slate-900 font-semibold underline underline-offset-4 decoration-2 decoration-blue-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PlusCircle className="h-4 w-4 text-blue-600" />
            Report Incident
          </Link>
          <Link
            href="/dashboard"
            className={`transition-colors flex items-center gap-1.5 ${
              isActive('/dashboard')
                ? 'text-slate-900 font-semibold underline underline-offset-4 decoration-2 decoration-blue-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Dashboard</span>
            {openCount !== null && openCount > 0 && (
              <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-extrabold leading-none text-white bg-rose-500 rounded-full min-w-[1.25rem] h-5">
                {openCount}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}
