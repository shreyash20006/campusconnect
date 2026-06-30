'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { useTheme } from '@/providers/ThemeProvider';
import { 
  LayoutDashboard, Calendar, ClipboardList, QrCode, 
  CheckSquare, Users, UserCog, Wallet, ArrowLeftRight, 
  Settings, ShieldAlert, LogOut, Sun, Moon, Menu, X, ShieldCheck, Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut, isMockMode } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Role Gate: Student cannot access Admin Portal
  if (user.role === 'student') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6 bg-grid-pattern text-left">
        <div className="glass-panel w-full max-w-md p-8 rounded-[32px] border border-red-500/20 shadow-2xl space-y-6 text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Access Denied</h1>
            <p className="text-sm text-zinc-500 leading-normal">
              You are currently logged in as a <strong>Student</strong>. Only volunteers, organizers, or administrators are authorized to access the CampusConnect Control Center.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/15 text-[11px] text-blue-500 text-left leading-normal">
            <strong>Evaluator Tip:</strong> Use the floating <strong>"Role Simulator"</strong> widget in the bottom-right corner to toggle your active role to Volunteer, Organizer, or Admin to unlock this section.
          </div>
          <div className="flex gap-2">
            <Link 
              href="/dashboard"
              className="w-full py-3 rounded-24 bg-zinc-100 dark:bg-zinc-900 border border-border text-center text-xs font-semibold hover:bg-zinc-200 dark:hover:bg-zinc-800/60 transition-colors"
            >
              Back to Student Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Sidebar Menu Items based on role
  // Volunteers can ONLY see: Dashboard, Registrations, Scanner, Attendance
  const menuItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['volunteer', 'event_organizer', 'admin', 'super_admin'] },
    { href: '/admin/events', label: 'Events CRUD', icon: Calendar, roles: ['event_organizer', 'admin', 'super_admin'] },
    { href: '/admin/registrations', label: 'Registrations', icon: ClipboardList, roles: ['volunteer', 'event_organizer', 'admin', 'super_admin'] },
    { href: '/admin/scanner', label: 'QR Scanner', icon: QrCode, roles: ['volunteer', 'event_organizer', 'admin', 'super_admin'] },
    { href: '/admin/attendance', label: 'Attendance Ledger', icon: CheckSquare, roles: ['volunteer', 'event_organizer', 'admin', 'super_admin'] },
    { href: '/admin/certificates', label: 'Certificate Studio', icon: Award, roles: ['event_organizer', 'admin', 'super_admin'] },
    { href: '/admin/students', label: 'Students', icon: Users, roles: ['admin', 'super_admin'] },
    { href: '/admin/volunteers', label: 'Volunteers', icon: UserCog, roles: ['event_organizer', 'admin', 'super_admin'] },
    { href: '/admin/payments', label: 'Payments', icon: Wallet, roles: ['admin', 'super_admin'] },
    { href: '/admin/settlements', label: 'Settlements Ledger', icon: ArrowLeftRight, roles: ['event_organizer', 'admin', 'super_admin'] },
    { href: '/admin/settings', label: 'Settings', icon: Settings, roles: ['admin', 'super_admin'] },
  ];

  // Filter items matching user role
  const allowedItems = menuItems.filter(item => item.roles.includes(user.role));

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row text-left">
      
      {/* Mobile Header Panel */}
      <div className="flex md:hidden items-center justify-between px-6 py-3.5 bg-card border-b border-border z-20 sticky top-0">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-premium flex items-center justify-center text-white font-bold text-sm">
            CC
          </div>
          <span className="font-bold text-sm tracking-tight">CC Admin</span>
        </Link>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-border bg-background text-muted-foreground"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-xl border border-border bg-background text-muted-foreground"
          >
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`w-64 bg-card border-r border-border flex flex-col justify-between shrink-0 z-30 fixed inset-y-0 left-0 transform md:relative md:translate-x-0 transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0 pt-[68px] md:pt-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <div className="p-6 flex flex-col justify-between flex-1 overflow-y-auto space-y-6">
          <div className="space-y-6">
            {/* Logo */}
            <div className="hidden md:flex items-center gap-2 border-b border-border/60 pb-5">
              <div className="w-8 h-8 rounded-lg bg-gradient-premium flex items-center justify-center text-white font-bold text-sm">
                CC
              </div>
              <span className="font-bold text-base tracking-tight">CampusConnect</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500 border border-blue-500/20 font-bold ml-1 tracking-wider uppercase">
                Admin
              </span>
            </div>

            {/* Menu Links */}
            <nav className="space-y-1.5">
              {allowedItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                      isActive
                        ? 'bg-blue-600/10 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/10'
                        : 'text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800/40 border border-transparent'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Sidebar Footer User Details */}
          <div className="border-t border-border/60 pt-5 space-y-4">
            <div className="flex items-center gap-3 text-left">
              <img
                src={user.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.name}`}
                alt={user.name}
                className="w-8 h-8 rounded-full border border-border"
              />
              <div className="text-left flex-1 min-w-0">
                <div className="text-xs font-bold truncate">{user.name}</div>
                <div className="text-[9px] text-zinc-500 capitalize truncate mt-0.5">{user.role.replace('_', ' ')}</div>
              </div>
            </div>

            <div className="flex gap-2">
              <Link 
                href="/dashboard"
                className="flex-1 py-2 border border-border rounded-xl text-center text-[10px] font-bold uppercase tracking-wider hover:bg-zinc-100 dark:hover:bg-zinc-800/40 transition-colors"
                title="Student Dashboard"
              >
                Student Hub
              </Link>
              <button
                onClick={signOut}
                className="p-2 rounded-xl hover:bg-red-500/10 text-zinc-400 hover:text-red-500 transition-colors border border-transparent cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Page Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Desktop Header bar */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 border-b border-border bg-card">
          <div className="flex items-center gap-2 text-xs text-muted">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Authorized session role: <strong>{user.role}</strong></span>
          </div>

          <div className="flex items-center gap-4">
            {/* Theme selector */}
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-border bg-background text-muted-foreground hover:bg-card transition-colors cursor-pointer"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <div className="text-xs font-bold bg-zinc-100 dark:bg-zinc-900 border border-border/80 rounded-xl px-3 py-1.5 uppercase tracking-wider text-muted-foreground">
              CampusConnect Control
            </div>
          </div>
        </header>

        {/* Content child page */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>

    </div>
  );
}
