'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { MOCK_EVENTS } from '@/lib/data';
import { 
  CheckSquare, Users, UserCheck, AlertTriangle, 
  Search, Filter, Download, Info 
} from 'lucide-react';
import { formatDateTime } from '@/lib/utils';

interface AttendanceRecord {
  id: string;
  studentName: string;
  prn: string;
  department: string;
  eventTitle: string;
  checkedInAt: string;
  status: 'checked_in' | 'no_show' | 'registered';
  scannedBy: string;
}

export default function AdminAttendanceDashboard() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState('All');

  useEffect(() => {
    // Generate simulated attendance based on mock database state
    setRecords([
      {
        id: 'att-1',
        studentName: 'Aditya Sharma',
        prn: 'PRN202410293',
        department: 'Computer Science & Engineering',
        eventTitle: 'TechnoHack 2026 Hackathon',
        checkedInAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        status: 'checked_in',
        scannedBy: 'Rohan Das'
      },
      {
        id: 'att-2',
        studentName: 'Neha Deshmukh',
        prn: 'PRN202410492',
        department: 'Electronics & Communication',
        eventTitle: 'Spandan Cultural Night & Concert',
        checkedInAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        status: 'checked_in',
        scannedBy: 'System Auto'
      },
      {
        id: 'att-3',
        studentName: 'Vikram Joshi',
        prn: 'PRN202410501',
        department: 'Mechanical Engineering',
        eventTitle: 'National Robotics Challenge',
        checkedInAt: '',
        status: 'no_show',
        scannedBy: ''
      },
      {
        id: 'att-4',
        studentName: 'Pooja Hegde',
        prn: 'PRN202410888',
        department: 'Information Technology',
        eventTitle: 'Generative AI & LLM Workshop',
        checkedInAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        status: 'checked_in',
        scannedBy: 'Rohan Das'
      },
      {
        id: 'att-5',
        studentName: 'Rahul Verma',
        prn: 'PRN202410711',
        department: 'Civil Engineering',
        eventTitle: 'TechnoHack 2026 Hackathon',
        checkedInAt: '',
        status: 'registered',
        scannedBy: ''
      }
    ]);
  }, []);

  const stats = useMemo(() => {
    const total = records.length;
    const checkedIn = records.filter(r => r.status === 'checked_in').length;
    const noShow = records.filter(r => r.status === 'no_show').length;
    const pending = total - checkedIn - noShow;
    const percent = total > 0 ? Math.round((checkedIn / (total - noShow)) * 100) : 0;

    return { total, checkedIn, noShow, pending, percent };
  }, [records]);

  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const matchQuery = 
        r.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.prn.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchEvent = selectedEvent === 'All' || r.eventTitle.includes(selectedEvent.split(' ')[0]);

      return matchQuery && matchEvent;
    });
  }, [records, searchQuery, selectedEvent]);

  // Export to CSV Functionality
  const exportToCSV = () => {
    const headers = ['Student Name', 'PRN', 'Department', 'Event Title', 'Status', 'Check-In Time', 'Scanned By'];
    const rows = filteredRecords.map(r => [
      r.studentName,
      r.prn,
      r.department,
      r.eventTitle,
      r.status,
      r.checkedInAt ? new Date(r.checkedInAt).toLocaleString() : 'N/A',
      r.scannedBy || 'N/A'
    ]);

    const csvContent = 
      'data:text/csv;charset=utf-8,' + 
      [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CampusConnect_Attendance_${selectedEvent.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Attendance Ledger</h1>
          <p className="text-sm text-zinc-500 mt-1">Audit student check-ins, trace scanned history, and download logs.</p>
        </div>

        <button
          onClick={exportToCSV}
          className="px-4 py-2.5 rounded-xl bg-primary hover:bg-blue-600 text-white font-semibold text-xs shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Download className="w-4 h-4" /> Export CSV Sheet
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="premium-card p-4 space-y-1.5 bg-card">
          <span className="text-[10px] uppercase font-bold text-zinc-400">Total Registered</span>
          <div className="text-xl font-extrabold flex items-center gap-1.5">
            <Users className="w-4.5 h-4.5 text-blue-500" />
            <span>{stats.total}</span>
          </div>
        </div>
        
        <div className="premium-card p-4 space-y-1.5 bg-card">
          <span className="text-[10px] uppercase font-bold text-zinc-400">Checked In</span>
          <div className="text-xl font-extrabold text-emerald-500 flex items-center gap-1.5">
            <UserCheck className="w-4.5 h-4.5" />
            <span>{stats.checkedIn}</span>
          </div>
        </div>

        <div className="premium-card p-4 space-y-1.5 bg-card">
          <span className="text-[10px] uppercase font-bold text-zinc-400">No Shows</span>
          <div className="text-xl font-extrabold text-rose-500 flex items-center gap-1.5">
            <AlertTriangle className="w-4.5 h-4.5" />
            <span>{stats.noShow}</span>
          </div>
        </div>

        <div className="premium-card p-4 space-y-1.5 bg-card">
          <span className="text-[10px] uppercase font-bold text-zinc-400">Pending</span>
          <div className="text-xl font-bold text-zinc-400">
            {stats.pending}
          </div>
        </div>

        <div className="premium-card p-4 space-y-1.5 bg-card col-span-2 md:col-span-1">
          <span className="text-[10px] uppercase font-bold text-zinc-400">Attendance Ratio</span>
          <div className="text-xl font-extrabold text-blue-500">
            {stats.percent}%
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="premium-card p-5 bg-card border-border/80 grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student name or PRN ID..."
            className="w-full bg-background border border-border rounded-xl pl-9 pr-4 py-2 text-xs shadow-sm focus:outline-none text-foreground"
          />
        </div>

        {/* Filter Event */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-zinc-400 shrink-0" />
          <select
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
            className="w-full bg-background border border-border rounded-xl px-2 py-2 text-xs focus:outline-none text-muted-foreground font-semibold"
          >
            <option value="All">All Events</option>
            {MOCK_EVENTS.map(e => (
              <option key={e.id} value={e.title}>{e.title}</option>
            ))}
          </select>
        </div>

      </div>

      {/* Table */}
      <div className="premium-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-zinc-100/50 dark:bg-zinc-900/50 text-zinc-500 border-b border-border/60">
              <tr>
                <th className="p-4 font-bold">Student Name</th>
                <th className="p-4 font-bold">PRN ID</th>
                <th className="p-4 font-bold">Branch Department</th>
                <th className="p-4 font-bold">Event Title</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold">Checked-In Time</th>
                <th className="p-4 font-bold">Verified By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filteredRecords.map((rec) => (
                <tr key={rec.id} className="hover:bg-zinc-100/30 dark:hover:bg-zinc-800/20 transition-colors">
                  <td className="p-4 font-extrabold text-foreground">{rec.studentName}</td>
                  <td className="p-4 font-mono text-zinc-500">{rec.prn}</td>
                  <td className="p-4 text-zinc-500 truncate max-w-xs">{rec.department}</td>
                  <td className="p-4 font-semibold">{rec.eventTitle}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                      rec.status === 'checked_in'
                        ? 'bg-emerald-500/10 text-emerald-500'
                        : rec.status === 'no_show'
                        ? 'bg-red-500/10 text-red-500'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'
                    }`}>
                      {rec.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4 text-zinc-400">
                    {rec.checkedInAt ? formatDateTime(rec.checkedInAt) : '—'}
                  </td>
                  <td className="p-4 text-zinc-400 font-semibold">{rec.scannedBy || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
