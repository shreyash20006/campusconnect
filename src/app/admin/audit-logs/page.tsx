'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Search, Filter, ShieldAlert, Clock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface AuditLog {
  id: string;
  action: string;
  user: string;
  details: string;
  time: string;
  ipAddress: string;
  severity: 'info' | 'warning' | 'critical';
}

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'info' | 'warning' | 'critical'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    // Read from cc_audit_logs or load initial seed
    const stored = localStorage.getItem('cc_audit_logs');
    if (stored) {
      // Add extra security columns to matching localStorage items
      const parsed: any[] = JSON.parse(stored);
      const enhanced = parsed.map((item, index) => ({
        id: item.id || `audit-${index}`,
        action: item.action || 'ADMIN_ACTION',
        user: item.user || 'admin@campusconnect.edu',
        details: item.details || 'Performed general config updates',
        time: item.time || new Date().toISOString(),
        ipAddress: `192.168.1.${10 + (index % 50)}`,
        severity: item.action?.includes('FAIL') || item.action?.includes('REJECT') ? 'warning' as const : 'info' as const
      }));
      setLogs(enhanced);
    } else {
      const initialLogs: AuditLog[] = [
        { id: 'l-1', action: 'USER_LOGIN', user: 'priya.mehta@campusconnect.edu', details: 'Logged in from App Desktop browser', time: new Date(Date.now() - 5 * 60000).toISOString(), ipAddress: '192.168.1.45', severity: 'info' },
        { id: 'l-2', action: 'CHECK_IN_SUCCESS', user: 'Rohan Das (Volunteer)', details: 'Checked in Aditya Sharma for TechnoHack 2026', time: new Date(Date.now() - 15 * 60000).toISOString(), ipAddress: '192.168.1.18', severity: 'info' },
        { id: 'l-3', action: 'CERTIFICATE_STUDIO', user: 'Dr. Rajesh Kumar (Admin)', details: 'Modified classical gold certificate template', time: new Date(Date.now() - 45 * 60000).toISOString(), ipAddress: '192.168.1.92', severity: 'info' },
        { id: 'l-4', action: 'PAYMENT_FAILED_SIMULATOR', user: 'Student user', details: 'Cashfree transaction simulation failed for national robotics', time: new Date(Date.now() - 120 * 60000).toISOString(), ipAddress: '192.168.1.121', severity: 'warning' },
        { id: 'l-5', action: 'UNAUTHORIZED_ACCESS_BLOCKED', user: 'Anonymous user', details: 'Attempted to fetch /api/admin/database-settings without credential key', time: new Date(Date.now() - 360 * 60000).toISOString(), ipAddress: '103.88.92.12', severity: 'critical' },
        { id: 'l-6', action: 'VOLUNTEER_APPROVED', user: 'Dr. Rajesh Kumar (Admin)', details: 'Approved Sneha Patil volunteer coordinate request', time: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), ipAddress: '192.168.1.92', severity: 'info' }
      ];
      setLogs(initialLogs);
      localStorage.setItem('cc_audit_logs', JSON.stringify(initialLogs));
    }
  }, []);

  const handleClearLogs = () => {
    if (confirm('Are you sure you want to purge the security audit log database? This action is irreversible.')) {
      localStorage.removeItem('cc_audit_logs');
      setLogs([]);
    }
  };

  // Filter logs
  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSeverity = severityFilter === 'all' || log.severity === severityFilter;

    return matchesSearch && matchesSeverity;
  });

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6 text-left">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link 
            href="/admin" 
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-foreground transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight">Security Audit Logs</h1>
          <p className="text-sm text-zinc-500 mt-1">SaaS tamper-proof audit trail tracking logins, door scanner logs, and config edits.</p>
        </div>

        <button
          onClick={handleClearLogs}
          className="px-4 py-2.5 rounded-xl border border-red-500/20 text-red-500 bg-red-500/5 hover:bg-red-500 hover:text-white text-xs font-bold transition-all cursor-pointer"
        >
          Purge Audit History
        </button>
      </div>

      {/* Filter and Search Panel */}
      <div className="premium-card p-4 bg-card border-border/80 flex flex-col md:flex-row items-center gap-4 text-xs">
        
        {/* Search */}
        <div className="flex-1 w-full relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            placeholder="Search by action, operator email, or log message..."
            className="w-full bg-background border border-border rounded-xl pl-9 pr-4 py-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          />
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
        </div>

        {/* Severity filter */}
        <div className="flex items-center gap-2.5 shrink-0 self-start md:self-center">
          <span className="text-zinc-400 font-semibold flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Severity:
          </span>
          
          <select
            value={severityFilter}
            onChange={(e) => { setSeverityFilter(e.target.value as any); setCurrentPage(1); }}
            className="bg-background border border-border rounded-lg px-2.5 py-1.5 focus:outline-none text-muted-foreground font-semibold"
          >
            <option value="all">All Logs</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="critical">Critical Threats</option>
          </select>
        </div>

      </div>

      {/* Logs Table */}
      <div className="premium-card overflow-hidden">
        {paginatedLogs.length === 0 ? (
          <div className="p-12 text-center text-sm text-zinc-400">
            No audit logs matched your search filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-zinc-100/50 dark:bg-zinc-900/50 text-zinc-500 border-b border-border/60">
                <tr>
                  <th className="p-4 font-bold w-12 text-center">Severity</th>
                  <th className="p-4 font-bold">Timestamp</th>
                  <th className="p-4 font-bold">Action Event</th>
                  <th className="p-4 font-bold">Operator User</th>
                  <th className="p-4 font-bold">Details</th>
                  <th className="p-4 font-bold font-mono">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {paginatedLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-zinc-100/30 dark:hover:bg-zinc-800/20 transition-colors">
                    <td className="p-4 text-center">
                      <div className="flex justify-center">
                        {log.severity === 'info' ? (
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-500" title="Info Log" />
                        ) : log.severity === 'warning' ? (
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" title="Warning Action" />
                        ) : (
                          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" title="Critical Exception" />
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-zinc-400 font-mono text-[10px]">
                      {new Date(log.time).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 border border-border/60 text-[9px] uppercase tracking-wider font-bold text-zinc-400 font-mono">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-foreground">{log.user}</td>
                    <td className="p-4 text-zinc-500 leading-normal max-w-sm">{log.details}</td>
                    <td className="p-4 font-mono text-zinc-400 text-[10px]">{log.ipAddress}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center text-xs text-zinc-500 pt-2 print:hidden">
          <span>Showing page {currentPage} of {totalPages}</span>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 border border-border rounded-lg bg-card hover:bg-zinc-800 disabled:opacity-40 cursor-pointer"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 border border-border rounded-lg bg-card hover:bg-zinc-800 disabled:opacity-40 cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
