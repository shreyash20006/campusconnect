'use client';

import React, { useState, useEffect } from 'react';
import { Mail, Search, Send, RefreshCw, Eye, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface EmailLog {
  id: string;
  recipient: string;
  subject: string;
  type: 'ticket' | 'volunteer' | 'certificate' | 'reminder';
  status: 'sent' | 'pending' | 'failed';
  time: string;
  bodyPreview: string;
}

export default function AdminEmailsPage() {
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'ticket' | 'volunteer' | 'certificate' | 'reminder'>('all');
  
  // Selected email for visual preview draft modal
  const [previewEmail, setPreviewEmail] = useState<EmailLog | null>(null);
  
  // Resend status
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('cc_email_logs');
    const initialEmails: EmailLog[] = [
      {
        id: 'email-1',
        recipient: 'aditya.sharma@campusconnect.edu',
        subject: 'Your Ticket Pass: TechnoHack 2026 Hackathon',
        type: 'ticket',
        status: 'sent',
        time: new Date(Date.now() - 10 * 60000).toISOString(),
        bodyPreview: 'Dear Aditya Sharma,\n\nYour registration for TechnoHack 2026 is confirmed. Find your QR checkout pass code: CC-TEC-A891A.\n\nPresent this at the door check-in.'
      },
      {
        id: 'email-2',
        recipient: 'sneha.patil@campusconnect.edu',
        subject: 'Volunteer Duty Shift Assignment: TechnoHack 2026',
        type: 'volunteer',
        status: 'sent',
        time: new Date(Date.now() - 40 * 60000).toISOString(),
        bodyPreview: 'Dear Sneha Patil,\n\nYou have been approved as a volunteer for TechnoHack 2026. Your duty shift is set: 10:00 AM - 04:00 PM. Present your coordinate badge at the front check-in desk.'
      },
      {
        id: 'email-3',
        recipient: 'aditya.sharma@campusconnect.edu',
        subject: 'CampusConnect Certificate Issued: Generative AI Workshop',
        type: 'certificate',
        status: 'sent',
        time: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        bodyPreview: 'Dear Aditya Sharma,\n\nDean Rajesh Kumar has approved your completion certificate for the Generative AI & LLM Workshop. Find verification checksum code: CC-CERT-9A1A2. You can add it directly to LinkedIn.'
      },
      {
        id: 'email-4',
        recipient: 'rohan.das@campusconnect.edu',
        subject: 'Event Reminder: TechnoHack starts in 24 hours!',
        type: 'reminder',
        status: 'pending',
        time: new Date(Date.now() + 120 * 60000).toISOString(),
        bodyPreview: 'Dear Rohan Das,\n\nTechnoHack starts tomorrow at 09:00 AM. Please arrive 15 minutes early at OAT Lab 3.'
      }
    ];

    if (stored) {
      const parsed = JSON.parse(stored);
      const combined = [...parsed];
      initialEmails.forEach(init => {
        if (!combined.some(c => c.subject === init.subject && c.recipient === init.recipient)) {
          combined.push(init);
        }
      });
      setLogs(combined);
    } else {
      setLogs(initialEmails);
      localStorage.setItem('cc_email_logs', JSON.stringify(initialEmails));
    }
  }, []);

  const handleResend = (id: string) => {
    setResendingId(id);
    
    // Simulate SMTP delivery
    setTimeout(() => {
      setResendingId(null);
      setResendSuccess(id);
      
      // Update local logs timestamp
      setLogs(prev => prev.map(log => 
        log.id === id ? { ...log, status: 'sent', time: new Date().toISOString() } : log
      ));

      setTimeout(() => setResendSuccess(null), 2500);
    }, 1500);
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.recipient.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.subject.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = filterType === 'all' || log.type === filterType;

    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 text-left">
      
      {/* Header */}
      <div>
        <Link 
          href="/admin" 
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-foreground transition-colors mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>
        <h1 className="text-3xl font-extrabold tracking-tight">Email Automation Logs</h1>
        <p className="text-sm text-zinc-500 mt-1">Review SMTP logs, simulated email drafts, and trigger manual resends.</p>
      </div>

      {/* Filter and Search Panel */}
      <div className="premium-card p-4 bg-card border-border/80 flex flex-col md:flex-row items-center gap-4 text-xs">
        
        {/* Search */}
        <div className="flex-1 w-full relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by recipient email or subject..."
            className="w-full bg-background border border-border rounded-xl pl-9 pr-4 py-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          />
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
        </div>

        {/* Email type filter */}
        <div className="flex items-center gap-2.5 shrink-0 self-start md:self-center">
          <span className="text-zinc-400 font-semibold flex items-center gap-1">
            <Mail className="w-3.5 h-3.5" /> Type:
          </span>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="bg-background border border-border rounded-lg px-2.5 py-1.5 focus:outline-none text-muted-foreground font-semibold"
          >
            <option value="all">All Types</option>
            <option value="ticket">Ticket Issuance</option>
            <option value="volunteer">Volunteer Duty Sheets</option>
            <option value="certificate">Completion Certs</option>
            <option value="reminder">Reminders & Alerts</option>
          </select>
        </div>

      </div>

      {/* Email logs table */}
      <div className="premium-card overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-sm text-zinc-400">
            No email logs matched the current filter constraints.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-zinc-100/50 dark:bg-zinc-900/50 text-zinc-500 border-b border-border/60">
                <tr>
                  <th className="p-4 font-bold">SMTP Timestamp</th>
                  <th className="p-4 font-bold">Recipient Student</th>
                  <th className="p-4 font-bold">Subject Line</th>
                  <th className="p-4 font-bold">Mail Scope</th>
                  <th className="p-4 font-bold text-center">Status</th>
                  <th className="p-4 font-bold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-zinc-100/30 dark:hover:bg-zinc-800/20 transition-colors">
                    <td className="p-4 text-zinc-400 font-mono text-[10px]">
                      {new Date(log.time).toLocaleString()}
                    </td>
                    <td className="p-4 font-bold">{log.recipient}</td>
                    <td className="p-4 text-zinc-500 leading-normal">{log.subject}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 border border-border/60 text-[9px] uppercase tracking-wider font-bold text-zinc-400 font-mono">
                        {log.type}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                          log.status === 'sent'
                            ? 'bg-emerald-500/10 text-emerald-500'
                            : log.status === 'pending'
                            ? 'bg-amber-500/10 text-amber-500'
                            : 'bg-red-500/10 text-red-500'
                        }`}>
                          {log.status}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => setPreviewEmail(log)}
                          className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-border text-zinc-500 hover:text-foreground transition-colors cursor-pointer"
                          title="Preview HTML email draft"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => handleResend(log.id)}
                          disabled={resendingId === log.id}
                          className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                            resendSuccess === log.id 
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                              : 'bg-zinc-100 dark:bg-zinc-900 border-border text-zinc-500 hover:text-foreground'
                          }`}
                          title="Trigger SMTP resend"
                        >
                          {resendingId === log.id ? (
                            <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
                          ) : resendSuccess === log.id ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : (
                            <Send className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Visual Email HTML Draft Preview Modal */}
      <AnimatePresence>
        {previewEmail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm" onClick={() => setPreviewEmail(null)} />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-panel w-full max-w-xl bg-card/95 backdrop-blur-md rounded-[28px] border border-border shadow-2xl relative overflow-hidden text-left p-6 space-y-6 z-10"
            >
              <div className="flex justify-between items-center border-b border-border pb-3">
                <div>
                  <h3 className="font-extrabold text-sm text-foreground">SMTP Outgoing Draft</h3>
                  <p className="text-[10px] text-zinc-500">MIME-Formatted visual preview</p>
                </div>
                <button
                  onClick={() => setPreviewEmail(null)}
                  className="text-xs font-bold text-zinc-400 hover:text-foreground px-3 py-1 rounded bg-zinc-800"
                >
                  Close
                </button>
              </div>

              {/* Envelope headers */}
              <div className="space-y-1 bg-zinc-950 p-4 rounded-2xl border border-border/60 text-xs font-mono">
                <div><span className="text-zinc-500">FROM:</span> noreply@campusconnect.edu (CampusConnect Core Gateway)</div>
                <div><span className="text-zinc-500">TO:</span> {previewEmail.recipient}</div>
                <div><span className="text-zinc-500">SUBJECT:</span> {previewEmail.subject}</div>
              </div>

              {/* Simulated HTML email body */}
              <div className="bg-white text-zinc-900 p-6 rounded-2xl border border-zinc-200 text-xs min-h-60 leading-relaxed font-sans shadow-inner">
                {/* Header branding */}
                <div className="border-b border-zinc-200 pb-3 mb-4 flex items-center gap-1.5 justify-center">
                  <div className="w-6 h-6 rounded bg-zinc-950 text-white font-bold flex items-center justify-center text-[10px]">
                    CC
                  </div>
                  <span className="font-bold text-[11px] uppercase tracking-wider text-zinc-900">CampusConnect Portal</span>
                </div>

                <div className="whitespace-pre-line text-zinc-800 font-medium">
                  {previewEmail.bodyPreview}
                </div>

                <div className="border-t border-zinc-200 mt-6 pt-4 text-center text-[9px] text-zinc-400">
                  This email is automated. Please do not reply directly.
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
