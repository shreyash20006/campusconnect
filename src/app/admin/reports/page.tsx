'use client';

import React, { useState } from 'react';
import { 
  FileText, Download, Filter, FileSpreadsheet, 
  TrendingUp, Users, Ticket, Award, Calendar, CheckCircle2 
} from 'lucide-react';
import { MOCK_EVENTS } from '@/lib/data';
import { formatCurrency } from '@/lib/utils';

interface ReportRow {
  date: string;
  name: string;
  category: string;
  ref: string;
  metric: string;
  status: string;
}

export default function AdminReportsPage() {
  const [reportType, setReportType] = useState<'revenue' | 'attendance' | 'volunteers' | 'certificates'>('revenue');
  const [filterScope, setFilterScope] = useState('all');

  // Analytical summary based on type
  const getSummary = () => {
    switch (reportType) {
      case 'revenue':
        return [
          { label: 'Gross Collected', value: formatCurrency(120950), icon: TrendingUp, color: 'text-blue-500' },
          { label: 'Settled to Bank', value: formatCurrency(105000), icon: CheckCircle2, color: 'text-emerald-500' },
          { label: 'Refunds Processed', value: formatCurrency(3500), icon: XCirclePlaceholder, color: 'text-red-500' },
        ];
      case 'attendance':
        return [
          { label: 'Total Enrolled', value: '796 students', icon: Users, color: 'text-blue-500' },
          { label: 'Checked In', value: '730 checked-in', icon: Ticket, color: 'text-purple-500' },
          { label: 'No-Shows', value: '66 absentees', icon: Calendar, color: 'text-zinc-500' },
        ];
      case 'volunteers':
        return [
          { label: 'Registered Volunteers', value: '24 active', icon: Users, color: 'text-pink-500' },
          { label: 'Assigned Shifts', value: '45 shifts completed', icon: ClockPlaceholder, color: 'text-blue-500' },
          { label: 'Average XP', value: '210 XP / vol', icon: Award, color: 'text-yellow-500' },
        ];
      case 'certificates':
        return [
          { label: 'Issued Certificates', value: '730 generated', icon: Award, color: 'text-amber-500' },
          { label: 'Public Verifications', value: '412 lookups', icon: TrendingUp, color: 'text-blue-500' },
          { label: 'Integrations Synced', value: 'LinkedIn 95%', icon: CheckCircle2, color: 'text-emerald-500' },
        ];
    }
  };

  // Curated reporting rows
  const getRows = (): ReportRow[] => {
    switch (reportType) {
      case 'revenue':
        return [
          { date: '2026-06-30', name: 'TechnoHack 2026', category: 'Technical', ref: 'order_th_1102', metric: '₹299.00', status: 'Settled' },
          { date: '2026-06-29', name: 'GenAI & LLM Workshop', category: 'Workshop', ref: 'order_ai_2241', metric: '₹99.00', status: 'Settled' },
          { date: '2026-06-28', name: 'National Robotics Challenge', category: 'Technical', ref: 'order_rc_9901', metric: '₹499.00', status: 'Pending' },
          { date: '2026-06-27', name: 'TechnoHack 2026', category: 'Technical', ref: 'order_th_1082', metric: '₹299.00', status: 'Settled' }
        ];
      case 'attendance':
        return [
          { date: '2026-06-30', name: 'Aditya Sharma', category: 'CSE', ref: 'PRN202410293', metric: 'TechnoHack 2026', status: 'Checked In' },
          { date: '2026-06-30', name: 'Rohan Das', category: 'ECE', ref: 'PRN202410492', metric: 'TechnoHack 2026', status: 'Checked In' },
          { date: '2026-06-30', name: 'Sneha Patil', category: 'CSE', ref: 'PRN202410319', metric: 'TechnoHack 2026', status: 'Absent' },
          { date: '2026-06-29', name: 'Amit Roy', category: 'IT', ref: 'PRN202410882', metric: 'GenAI Workshop', status: 'Checked In' }
        ];
      case 'volunteers':
        return [
          { date: '2026-06-30', name: 'Rohan Das', category: 'ECE', ref: 'PRN202410492', metric: 'Front Desk check-in', status: 'Completed' },
          { date: '2026-06-30', name: 'Sneha Patil', category: 'CSE', ref: 'PRN202410319', metric: 'Lab assistant', status: 'Checked In' },
          { date: '2026-06-29', name: 'Rohan Das', category: 'ECE', ref: 'PRN202410492', metric: 'Registrations QR check', status: 'Completed' }
        ];
      case 'certificates':
        return [
          { date: '2026-06-30', name: 'Aditya Sharma', category: 'CSE', ref: 'CC-CERT-9A1A2', metric: 'TechnoHack 2026', status: 'Verified' },
          { date: '2026-06-29', name: 'Amit Roy', category: 'IT', ref: 'CC-CERT-8C2B3', metric: 'GenAI Workshop', status: 'Verified' },
          { date: '2026-06-28', name: 'Priya Mehta', category: 'IT', ref: 'CC-CERT-4X9Y2', metric: 'Cultural Spandan', status: 'Verified' }
        ];
    }
  };

  const handleExportCSV = () => {
    const rows = getRows();
    const headers = reportType === 'revenue' 
      ? 'Date,Event Title,Category,Order ID,Amount,Status'
      : reportType === 'attendance'
      ? 'Date,Student Name,Department,PRN ID,Event,Check-In Status'
      : reportType === 'volunteers'
      ? 'Date,Volunteer Name,Department,PRN,Shift Assignment,Status'
      : 'Date,Recipient Name,Department,Certificate ID,Event Scope,Status';

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers].concat(rows.map(r => `"${r.date}","${r.name}","${r.category}","${r.ref}","${r.metric}","${r.status}"`)).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `cc_report_${reportType}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Placeholders for icons
  const XCirclePlaceholder = FileText;
  const ClockPlaceholder = FileText;

  return (
    <div className="space-y-6 text-left print:bg-white print:text-black">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Analytical Reports</h1>
          <p className="text-sm text-zinc-500 mt-1">Audit registration limits, generate payouts settlement summaries, and export data.</p>
        </div>

        <div className="flex gap-2.5">
          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" /> Download PDF Report
          </button>
          
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-xl border border-border bg-card hover:bg-zinc-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-zinc-400" /> Export CSV / Excel
          </button>
        </div>
      </div>

      {/* Print-only header */}
      <div className="hidden print:block border-b-2 border-zinc-900 pb-5 mb-8">
        <h1 className="text-3xl font-bold">CampusConnect SaaS Central Registry</h1>
        <p className="text-sm text-zinc-500 mt-1">Official reporting logs generated on {new Date().toLocaleDateString()}</p>
      </div>

      {/* Reports selector tabs - Hide on print */}
      <div className="border-b border-border/80 flex gap-6 text-sm font-medium print:hidden">
        {(['revenue', 'attendance', 'volunteers', 'certificates'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setReportType(type)}
            className={`pb-3 border-b-2 capitalize transition-all cursor-pointer ${reportType === type ? 'border-primary text-primary font-bold' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          >
            {type} Reports
          </button>
        ))}
      </div>

      {/* Summary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {getSummary().map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="premium-card p-5 space-y-2 bg-card">
              <div className="flex justify-between items-center text-xs font-semibold text-zinc-400">
                <span>{item.label}</span>
                <Icon className={`w-4 h-4 ${item.color}`} />
              </div>
              <div className="text-2xl font-extrabold">{item.value}</div>
            </div>
          );
        })}
      </div>

      {/* Filters Scope Panel - Hide on print */}
      <div className="premium-card p-4 bg-card border-border/60 flex flex-wrap items-center gap-4 text-xs print:hidden">
        <div className="flex items-center gap-1.5 text-zinc-400">
          <Filter className="w-4 h-4" /> Filters:
        </div>

        <select
          value={filterScope}
          onChange={(e) => setFilterScope(e.target.value)}
          className="bg-background border border-border rounded-lg px-2.5 py-1.5 focus:outline-none text-muted-foreground font-semibold"
        >
          <option value="all">All Events Scope</option>
          {MOCK_EVENTS.map(e => (
            <option key={e.id} value={e.id}>{e.title.substring(0, 20)}...</option>
          ))}
        </select>

        <span className="text-[10px] text-zinc-500 font-mono">Filters apply to CSV exports and printable logs.</span>
      </div>

      {/* Primary Data Grid */}
      <div className="premium-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-zinc-100/50 dark:bg-zinc-900/50 text-zinc-500 border-b border-border/60">
              <tr>
                <th className="p-4 font-bold">Timestamp</th>
                <th className="p-4 font-bold">
                  {reportType === 'revenue' ? 'Event Title' : reportType === 'attendance' ? 'Student Name' : reportType === 'volunteers' ? 'Volunteer Name' : 'Recipient Student'}
                </th>
                <th className="p-4 font-bold">
                  {reportType === 'revenue' ? 'Category' : reportType === 'attendance' ? 'Dept' : reportType === 'volunteers' ? 'Dept' : 'Dept'}
                </th>
                <th className="p-4 font-bold">
                  {reportType === 'revenue' ? 'Order Reference' : reportType === 'attendance' ? 'Student PRN' : reportType === 'volunteers' ? 'Student PRN' : 'Certificate ID'}
                </th>
                <th className="p-4 font-bold">
                  {reportType === 'revenue' ? 'Revenue amount' : reportType === 'attendance' ? 'Event Scope' : reportType === 'volunteers' ? 'Shift Assignment' : 'Event Scope'}
                </th>
                <th className="p-4 font-bold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {getRows().map((row, idx) => (
                <tr key={idx} className="hover:bg-zinc-100/30 dark:hover:bg-zinc-800/20 transition-colors">
                  <td className="p-4 text-zinc-400">{row.date}</td>
                  <td className="p-4 font-bold">{row.name}</td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 border border-border/60 text-[9px] uppercase tracking-wider font-bold text-zinc-400">
                      {row.category}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-zinc-400">{row.ref}</td>
                  <td className="p-4 font-semibold text-foreground">{row.metric}</td>
                  <td className="p-4">
                    <div className="flex justify-center">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                        row.status === 'Settled' || row.status === 'Checked In' || row.status === 'Completed' || row.status === 'Verified'
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : row.status === 'Pending'
                          ? 'bg-amber-500/10 text-amber-500'
                          : 'bg-red-500/10 text-red-500'
                      }`}>
                        {row.status}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
