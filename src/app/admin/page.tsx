'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from '@/providers/ThemeProvider';
import { 
  TrendingUp, Users, Ticket, Calendar, Award, 
  ArrowUpRight, Download, QrCode, FileSpreadsheet, PlusCircle,
  Clock, Activity, AlertCircle, FileText
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, Cell
} from 'recharts';

// Analytical Datasets
const REVENUE_DATA = [
  { name: '06/24', revenue: 15000 },
  { name: '06/25', revenue: 22000 },
  { name: '06/26', revenue: 18000 },
  { name: '06/27', revenue: 31000 },
  { name: '06/28', revenue: 45000 },
  { name: '06/29', revenue: 38000 },
  { name: '06/30', revenue: 52000 },
];

const DEPT_DATA = [
  { name: 'CSE', value: 420, fill: '#3b82f6' },
  { name: 'ECE', value: 180, fill: '#10b981' },
  { name: 'IT', value: 240, fill: '#f59e0b' },
  { name: 'MECH', value: 120, fill: '#ef4444' },
  { name: 'CIVIL', value: 80, fill: '#8b5cf6' },
];

// Heatmap Data (Weekday vs Time block: Morning, Afternoon, Evening)
const HEATMAP_DATA = [
  { day: 'Mon', morning: 40, afternoon: 80, evening: 20 },
  { day: 'Tue', morning: 50, afternoon: 95, evening: 30 },
  { day: 'Wed', morning: 60, afternoon: 40, evening: 75 },
  { day: 'Thu', morning: 30, afternoon: 60, evening: 90 },
  { day: 'Fri', morning: 85, afternoon: 110, evening: 50 },
  { day: 'Sat', morning: 90, afternoon: 140, evening: 120 },
  { day: 'Sun', morning: 20, afternoon: 70, evening: 40 },
];

interface AuditLog {
  id: string;
  action: string;
  user: string;
  details: string;
  time: string;
}

export default function AdminDashboard() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [logs, setLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    setMounted(true);

    // Load live activity feed logs
    const storedLogs = localStorage.getItem('cc_audit_logs');
    if (storedLogs) {
      setLogs(JSON.parse(storedLogs));
    } else {
      const initialLogs: AuditLog[] = [
        { id: 'l-1', action: 'USER_LOGIN', user: 'priya.mehta@campusconnect.edu', details: 'Logged in from IP 192.168.1.45', time: new Date(Date.now() - 5 * 60000).toISOString() },
        { id: 'l-2', action: 'CHECK_IN_SUCCESS', user: 'Rohan Das (Volunteer)', details: 'Checked in Aditya Sharma for TechnoHack 2026', time: new Date(Date.now() - 15 * 60000).toISOString() },
        { id: 'l-3', action: 'CERTIFICATE_STUDIO', user: 'Dr. Rajesh Kumar (Admin)', details: 'Modified classical gold certificate template', time: new Date(Date.now() - 45 * 60000).toISOString() },
        { id: 'l-4', action: 'PAYMENT_VERIFIED', user: 'Cashfree Gateway', details: 'Processed ₹299 order for TechnoHack 2026', time: new Date(Date.now() - 90 * 60000).toISOString() }
      ];
      setLogs(initialLogs);
      localStorage.setItem('cc_audit_logs', JSON.stringify(initialLogs));
    }
  }, []);

  const getHeatmapColor = (value: number) => {
    if (value > 100) return 'bg-blue-600/90 text-white';
    if (value > 70) return 'bg-blue-500/70 text-white';
    if (value > 45) return 'bg-blue-400/40 text-blue-200';
    return 'bg-blue-900/10 text-zinc-500 dark:text-zinc-600';
  };

  if (!mounted) {
    return (
      <div className="flex-1 flex items-center justify-center p-20">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 text-left">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Control Panel</h1>
          <p className="text-sm text-zinc-500 mt-1">Live metrics, automatic payouts settlements, and attendance activity feeds.</p>
        </div>
        
        <div className="flex gap-2">
          <Link
            href="/admin/reports"
            className="px-4 py-2 rounded-xl border border-border bg-card hover:bg-zinc-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-zinc-500" /> Generate Reports
          </Link>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="premium-card p-5 space-y-2 bg-card relative overflow-hidden">
          <div className="flex justify-between items-center text-xs font-semibold text-zinc-400">
            <span>Total Payouts Collected</span>
            <span className="p-1 rounded bg-emerald-500/10 text-emerald-500 flex items-center gap-0.5 text-[9px] font-bold">
              <TrendingUp className="w-3 h-3" /> +14.5%
            </span>
          </div>
          <div className="text-3xl font-extrabold text-foreground">{formatCurrency(120950)}</div>
          <p className="text-[10px] text-zinc-500">Cashfree Settled Payouts.</p>
        </div>

        <div className="premium-card p-5 space-y-2 bg-card">
          <div className="flex justify-between items-center text-xs font-semibold text-zinc-400">
            <span>Total Signups</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-3xl font-extrabold text-foreground">796</div>
          <p className="text-[10px] text-zinc-500">Across 5 active campus clubs.</p>
        </div>

        <div className="premium-card p-5 space-y-2 bg-card">
          <div className="flex justify-between items-center text-xs font-semibold text-zinc-400">
            <span>Check-in Ratio</span>
            <Ticket className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-3xl font-extrabold text-foreground">92.3%</div>
          <p className="text-[10px] text-zinc-500">92.3% check-in ratio of active passes.</p>
        </div>

        <div className="premium-card p-5 space-y-2 bg-card">
          <div className="flex justify-between items-center text-xs font-semibold text-zinc-400">
            <span>Certificates Issued</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-extrabold text-foreground">730</div>
          <p className="text-[10px] text-zinc-500">Secured with SHA-256 signatures.</p>
        </div>
      </div>

      {/* Main Charts & Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Revenue growth Chart */}
        <div className="premium-card p-5 bg-card space-y-4 lg:col-span-2 text-left">
          <div className="flex justify-between items-center border-b border-border/60 pb-3">
            <div>
              <h3 className="font-bold text-sm">Revenue growth (₹)</h3>
              <p className="text-[10px] text-zinc-400">Daily Cashfree payment ledger logs</p>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 font-bold">
              INR Standard
            </span>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REVENUE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: theme === 'dark' ? '#0c0c0f' : '#ffffff',
                    borderColor: theme === 'dark' ? '#1e1e24' : '#e4e4e7',
                    borderRadius: '12px',
                    fontSize: '11px',
                    color: theme === 'dark' ? '#fafafa' : '#09090b'
                  }} 
                />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="premium-card p-5 bg-card space-y-4 text-left">
          <div className="border-b border-border/60 pb-3">
            <h3 className="font-bold text-sm">Attendance Heatmap</h3>
            <p className="text-[10px] text-zinc-400">Peak door scanner check-in hours by weekday</p>
          </div>

          <div className="space-y-2.5">
            {/* Heatmap Header */}
            <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold text-zinc-400">
              <span className="text-left pl-1">Day</span>
              <span>Morning</span>
              <span>Afternoon</span>
              <span>Evening</span>
            </div>

            {/* Heatmap rows */}
            {HEATMAP_DATA.map((row) => (
              <div key={row.day} className="grid grid-cols-4 gap-2 text-center text-xs font-semibold">
                <span className="text-left text-muted self-center pl-1">{row.day}</span>
                <span className={`py-2 rounded-lg font-bold transition-colors ${getHeatmapColor(row.morning)}`}>
                  {row.morning}
                </span>
                <span className={`py-2 rounded-lg font-bold transition-colors ${getHeatmapColor(row.afternoon)}`}>
                  {row.afternoon}
                </span>
                <span className={`py-2 rounded-lg font-bold transition-colors ${getHeatmapColor(row.evening)}`}>
                  {row.evening}
                </span>
              </div>
            ))}

            <div className="flex justify-end gap-3.5 pt-2 text-[9px] text-zinc-500 font-bold uppercase tracking-wider">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-blue-900/15" /> Low
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-blue-500/50" /> Mid
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-blue-600/90" /> High Traffic
              </span>
            </div>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Department Participation & Top organizers */}
        <div className="premium-card p-5 bg-card space-y-5 text-left">
          <div className="border-b border-border pb-3">
            <h3 className="font-bold text-sm">Organizers & Branches</h3>
            <p className="text-[10px] text-zinc-400">Department distribution breakdown</p>
          </div>

          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DEPT_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="name" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis fontSize={9} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ fontSize: '10px' }} />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                  {DEPT_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top organizers */}
          <div className="space-y-2.5 pt-2">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Top Hosting Clubs</span>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold">ByteCraft Coding Club</span>
                <span className="text-zinc-500 font-mono">12 events</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold">Symphony Music & Arts</span>
                <span className="text-zinc-500 font-mono">8 events</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold">Ares Athletics Club</span>
                <span className="text-zinc-500 font-mono">6 events</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live audit logs activity feed */}
        <div className="lg:col-span-2 premium-card p-5 bg-card space-y-4 text-left flex flex-col justify-between">
          <div className="flex justify-between items-center border-b border-border pb-3">
            <h3 className="font-bold text-sm flex items-center gap-1.5">
              <Activity className="w-4.5 h-4.5 text-blue-500 animate-pulse" />
              <span>Real-Time Audit Activity Feed</span>
            </h3>
            
            <Link
              href="/admin/audit-logs"
              className="text-[10px] text-primary hover:underline font-bold"
            >
              See all audit logs
            </Link>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto flex-1 pr-1">
            {logs.slice(0, 5).map((log) => (
              <div key={log.id} className="p-3 bg-zinc-50 dark:bg-zinc-900/40 rounded-xl border border-border/40 text-xs flex justify-between gap-4 items-start">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-[9px] font-mono font-bold text-zinc-500">
                      {log.action}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-medium truncate max-w-44">{log.user}</span>
                  </div>
                  <p className="text-zinc-500 leading-normal mt-1">{log.details}</p>
                </div>

                <span className="text-[9px] text-zinc-400 font-mono whitespace-nowrap self-start">
                  {new Date(log.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>

          {/* Quick Shortcuts */}
          <div className="grid grid-cols-3 gap-2.5 pt-4 border-t border-border/60">
            <Link
              href="/admin/events"
              className="py-2.5 rounded-xl border border-border bg-background hover:bg-zinc-800 text-center font-bold text-[9px] uppercase tracking-wider flex items-center justify-center gap-1"
            >
              <PlusCircle className="w-3.5 h-3.5 text-blue-500" /> Create Event
            </Link>
            <Link
              href="/admin/scanner"
              className="py-2.5 rounded-xl border border-border bg-background hover:bg-zinc-800 text-center font-bold text-[9px] uppercase tracking-wider flex items-center justify-center gap-1"
            >
              <QrCode className="w-3.5 h-3.5 text-purple-500" /> Open Scanner
            </Link>
            <Link
              href="/admin/volunteers"
              className="py-2.5 rounded-xl border border-border bg-background hover:bg-zinc-800 text-center font-bold text-[9px] uppercase tracking-wider flex items-center justify-center gap-1"
            >
              <Users className="w-3.5 h-3.5 text-pink-500" /> Manage Vols
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
}
