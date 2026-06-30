'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Settings, Landmark, Paintbrush, Mail, 
  QrCode, Award, ShieldAlert, Key, Check, Info 
} from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';

export default function AdminSettingsPage() {
  const { user } = useAuth();

  // Settings states
  const [collegeName, setCollegeName] = useState('CampusConnect University');
  const [subdomain, setSubdomain] = useState('campusconnect.edu');
  const [primaryColor, setPrimaryColor] = useState('#2563eb');
  const [sandboxEnabled, setSandboxEnabled] = useState(true);
  const [cashfreeAppId, setCashfreeAppId] = useState('');
  const [cashfreeSecret, setCashfreeSecret] = useState('');

  // Email states
  const [emailSubject, setEmailSubject] = useState('Registration Confirmed - {event_name}');
  
  // Certificate templates
  const [certTitle, setCertTitle] = useState('Certificate of Completion');
  const [certSign1, setCertSign1] = useState('Dr. Rajesh Kumar');
  const [certSign2, setCertSign2] = useState('Principal Superintendent');

  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Top Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">System Settings</h1>
        <p className="text-sm text-zinc-500 mt-1">Configure college branding, cashfree credentials, and certificate templates.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* College Branding Settings */}
        <div className="premium-card p-6 bg-card border-border/80 space-y-4">
          <h3 className="font-extrabold text-sm text-foreground flex items-center gap-1.5 border-b border-border/60 pb-2">
            <Landmark className="w-4.5 h-4.5 text-blue-500" />
            <span>College Identity & Branding</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-muted">College Name *</label>
              <input
                type="text"
                required
                value={collegeName}
                onChange={(e) => setCollegeName(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-foreground"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="font-semibold text-muted">Verification Subdomain *</label>
              <input
                type="text"
                required
                value={subdomain}
                onChange={(e) => setSubdomain(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-muted">Primary Brand Color Accent</label>
              <div className="flex gap-2.5">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-10 h-10 rounded-lg border border-border bg-transparent p-0.5 cursor-pointer"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-foreground font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Cashfree Credentials Settings */}
        <div className="premium-card p-6 bg-card border-border/80 space-y-4">
          <h3 className="font-extrabold text-sm text-foreground flex items-center gap-1.5 border-b border-border/60 pb-2">
            <Key className="w-4.5 h-4.5 text-blue-500" />
            <span>Cashfree Payouts API Credentials</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-muted">Cashfree App ID (Client ID)</label>
              <input
                type="text"
                value={cashfreeAppId}
                onChange={(e) => setCashfreeAppId(e.target.value)}
                placeholder="e.g. CF89218A190"
                className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-foreground font-mono"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="font-semibold text-muted">Cashfree Secret Key (Client Secret)</label>
              <input
                type="password"
                value={cashfreeSecret}
                onChange={(e) => setCashfreeSecret(e.target.value)}
                placeholder="••••••••••••••••••••••••"
                className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-foreground"
              />
            </div>

            <div className="space-y-1.5 col-span-2">
              <label className="flex items-center gap-2 font-semibold text-muted">
                <input
                  type="checkbox"
                  checked={sandboxEnabled}
                  onChange={(e) => setSandboxEnabled(e.target.checked)}
                  className="rounded text-primary focus:ring-primary w-4 h-4 border-border"
                />
                <span>Enable Sandbox Testing Mode</span>
              </label>
              <p className="text-[10px] text-zinc-500 mt-1 pl-6 leading-normal">
                When sandbox mode is active, API requests point to `https://sandbox.cashfree.com/pg` rather than live production networks.
              </p>
            </div>
          </div>
        </div>

        {/* Email Templates Config */}
        <div className="premium-card p-6 bg-card border-border/80 space-y-4">
          <h3 className="font-extrabold text-sm text-foreground flex items-center gap-1.5 border-b border-border/60 pb-2">
            <Mail className="w-4.5 h-4.5 text-blue-500" />
            <span>Email & Ticket Dispatch Templates</span>
          </h3>

          <div className="space-y-3.5 text-xs text-left">
            <div className="space-y-1.5">
              <label className="font-semibold text-muted">Default Confirmation Subject *</label>
              <input
                type="text"
                required
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-foreground"
              />
            </div>
            <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-border/40 text-[10px] text-zinc-400 leading-normal">
              <strong>Template Variables Supported:</strong> `{'{event_name}'}`, `{'{student_name}'}`, `{'{ticket_id}'}`. These are populated dynamically when triggers fire.
            </div>
          </div>
        </div>

        {/* Certificate templates */}
        <div className="premium-card p-6 bg-card border-border/80 space-y-4">
          <h3 className="font-extrabold text-sm text-foreground flex items-center gap-1.5 border-b border-border/60 pb-2">
            <Award className="w-4.5 h-4.5 text-blue-500" />
            <span>Certificate Layout Template</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1.5 col-span-3">
              <label className="font-semibold text-muted">Main Header Title *</label>
              <input
                type="text"
                required
                value={certTitle}
                onChange={(e) => setCertTitle(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-foreground"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="font-semibold text-muted">Left Signatory Name *</label>
              <input
                type="text"
                required
                value={certSign1}
                onChange={(e) => setCertSign1(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-muted">Right Signatory Name *</label>
              <input
                type="text"
                required
                value={certSign2}
                onChange={(e) => setCertSign2(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-foreground"
              />
            </div>
          </div>
        </div>

        {/* System Logs & Audits panel */}
        <div className="premium-card p-6 bg-card border-border/80 space-y-4">
          <h3 className="font-extrabold text-sm text-foreground flex items-center gap-1.5 border-b border-border/60 pb-2">
            <Settings className="w-4.5 h-4.5 text-blue-500" />
            <span>System Utilities & Logs</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-zinc-50 dark:bg-zinc-900/40 rounded-xl border border-border/60 flex justify-between items-center">
              <div>
                <h4 className="font-bold text-foreground">Email Outbox logs</h4>
                <p className="text-[10px] text-zinc-500 mt-0.5">SMTP relay receipts and templates preview.</p>
              </div>
              <Link
                href="/admin/emails"
                className="px-3.5 py-1.5 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold"
              >
                View Emails
              </Link>
            </div>

            <div className="p-4 bg-zinc-50 dark:bg-zinc-900/40 rounded-xl border border-border/60 flex justify-between items-center">
              <div>
                <h4 className="font-bold text-foreground">Security Audit Trail</h4>
                <p className="text-[10px] text-zinc-500 mt-0.5">Tamper-proof system logins and scanner audits.</p>
              </div>
              <Link
                href="/admin/audit-logs"
                className="px-3.5 py-1.5 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold"
              >
                View Audit Logs
              </Link>
            </div>
          </div>
        </div>

        {/* Save button floating header style */}
        <div className="flex justify-between items-center bg-card border border-border rounded-3xl p-5 sticky bottom-4 shadow-xl z-20">
          <div className="flex items-center gap-2 text-xs text-muted">
            <Settings className="w-4.5 h-4.5 animate-spin text-zinc-400" />
            <span>CampusConnect System Level Configurations</span>
          </div>

          <button
            type="submit"
            className="px-6 py-3 rounded-24 bg-primary hover:bg-blue-600 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm shadow-blue-500/10"
          >
            {saved ? (
              <><Check className="w-4.5 h-4.5" /> Settings Saved!</>
            ) : (
              'Save System Settings'
            )}
          </button>
        </div>

      </form>

    </div>
  );
}
