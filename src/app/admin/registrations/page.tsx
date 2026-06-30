'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { MOCK_EVENTS, Registration } from '@/lib/data';
import { Search, Filter, ShieldAlert, Check, X, ClipboardList, Info } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';

export default function AdminRegistrationsPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  useEffect(() => {
    // Load student registrations from localStorage for active session
    const storedKeys = Object.keys(localStorage).filter(k => k.startsWith('cc_registrations_'));
    let allRegs: Registration[] = [];

    for (const key of storedKeys) {
      const regs = JSON.parse(localStorage.getItem(key) || '[]');
      allRegs = [...allRegs, ...regs];
    }

    // If empty, seed default mock registrations
    if (allRegs.length === 0) {
      allRegs = [
        {
          id: 'reg-demo-1',
          event_id: 'event-1',
          student_id: 'student-1',
          team_name: 'Alpha Coders',
          emergency_contact: '9876543210',
          status: 'approved',
          payment_status: 'paid',
          created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          event: MOCK_EVENTS.find(e => e.id === 'event-1')
        },
        {
          id: 'reg-demo-2',
          event_id: 'event-3',
          student_id: 'student-2',
          team_name: 'RoboKnights',
          emergency_contact: '9876500111',
          status: 'pending',
          payment_status: 'unpaid',
          created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          event: MOCK_EVENTS.find(e => e.id === 'event-3')
        },
        {
          id: 'reg-demo-3',
          event_id: 'event-5',
          student_id: 'student-3',
          team_name: null,
          emergency_contact: '9876500222',
          status: 'approved',
          payment_status: 'paid',
          created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          event: MOCK_EVENTS.find(e => e.id === 'event-5')
        }
      ];
    }

    setRegistrations(allRegs);
  }, []);

  const updateRegistrationStatus = (id: string, nextStatus: 'approved' | 'cancelled') => {
    const updated = registrations.map(reg => {
      if (reg.id === id) {
        return {
          ...reg,
          status: nextStatus,
          payment_status: nextStatus === 'approved' ? 'paid' : reg.payment_status
        } as Registration;
      }
      return reg;
    });

    setRegistrations(updated);

    // Sync back to local storage
    const storedKeys = Object.keys(localStorage).filter(k => k.startsWith('cc_registrations_'));
    for (const key of storedKeys) {
      const regs = JSON.parse(localStorage.getItem(key) || '[]');
      const matchIdx = regs.findIndex((r: any) => r.id === id);
      if (matchIdx !== -1) {
        regs[matchIdx].status = nextStatus;
        regs[matchIdx].payment_status = nextStatus === 'approved' ? 'paid' : regs[matchIdx].payment_status;
        localStorage.setItem(key, JSON.stringify(regs));
        break;
      }
    }
  };

  const filteredRegistrations = useMemo(() => {
    return registrations.filter(reg => {
      // Search
      const searchStr = searchQuery.toLowerCase();
      const stName = reg.event?.title?.toLowerCase() || '';
      const stId = reg.student_id.toLowerCase();
      const matchQuery = stName.includes(searchStr) || stId.includes(searchStr);

      // Event
      const matchEvent = selectedEvent === 'All' || reg.event_id === selectedEvent;

      // Status
      const matchStatus = selectedStatus === 'All' || reg.status === selectedStatus;

      return matchQuery && matchEvent && matchStatus;
    });
  }, [registrations, searchQuery, selectedEvent, selectedStatus]);

  return (
    <div className="space-y-6 text-left">
      
      {/* Top Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Event Registrations</h1>
        <p className="text-sm text-zinc-500 mt-1">Audit signups list, approve pending registrations, and verify team parameters.</p>
      </div>

      {/* Filters Toolbar */}
      <div className="premium-card p-5 bg-card border-border/80 grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by event title..."
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
              <option key={e.id} value={e.id}>{e.title}</option>
            ))}
          </select>
        </div>

        {/* Filter Status */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="w-full bg-background border border-border rounded-xl px-2 py-2 text-xs focus:outline-none text-muted-foreground font-semibold"
        >
          <option value="All">All Statuses</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
          <option value="cancelled">Cancelled</option>
        </select>

      </div>

      {/* Registrations List Table */}
      <div className="premium-card overflow-hidden">
        <div className="overflow-x-auto">
          {filteredRegistrations.length === 0 ? (
            <div className="py-12 text-center text-sm text-zinc-400 flex flex-col items-center gap-1.5 bg-card">
              <ClipboardList className="w-8 h-8 text-zinc-500/20" />
              <span>No registrations found matching the filters.</span>
            </div>
          ) : (
            <table className="w-full text-xs text-left">
              <thead className="bg-zinc-100/50 dark:bg-zinc-900/50 text-zinc-500 border-b border-border/60">
                <tr>
                  <th className="p-4 font-bold">Event & Class</th>
                  <th className="p-4 font-bold">Attendee ID</th>
                  <th className="p-4 font-bold">Team Name</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 font-bold">Payment</th>
                  <th className="p-4 font-bold">Sign Up Date</th>
                  <th className="p-4 font-bold text-center">Manage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredRegistrations.map((reg) => (
                  <tr key={reg.id} className="hover:bg-zinc-100/30 dark:hover:bg-zinc-800/20 transition-colors">
                    <td className="p-4 font-bold">
                      {reg.event?.title || 'Unknown Event'}
                    </td>
                    <td className="p-4 font-mono text-zinc-500">
                      {reg.student_id.substring(0, 12)}...
                    </td>
                    <td className="p-4 text-zinc-500">
                      {reg.team_name || 'Solo'}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                        reg.status === 'approved'
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : reg.status === 'pending'
                          ? 'bg-amber-500/10 text-amber-500'
                          : 'bg-red-500/10 text-red-500'
                      }`}>
                        {reg.status}
                      </span>
                    </td>
                    <td className="p-4 font-semibold">
                      <span className={`capitalize ${
                        reg.payment_status === 'paid' ? 'text-emerald-500' : 'text-amber-500'
                      }`}>
                        {reg.payment_status}
                      </span>
                    </td>
                    <td className="p-4 text-zinc-400">
                      {formatDateTime(reg.created_at)}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-1.5">
                        {reg.status === 'pending' && (
                          <>
                            <button
                              onClick={() => updateRegistrationStatus(reg.id, 'approved')}
                              className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all cursor-pointer"
                              title="Approve registration"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => updateRegistrationStatus(reg.id, 'cancelled')}
                              className="p-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all cursor-pointer"
                              title="Cancel registration"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                        {reg.status === 'approved' && (
                          <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5 text-emerald-500" /> Settled
                          </span>
                        )}
                        {reg.status === 'cancelled' && (
                          <span className="text-[10px] text-zinc-400">Cancelled</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  );
}
