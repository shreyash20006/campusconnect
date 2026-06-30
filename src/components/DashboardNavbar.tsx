'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { useTheme } from '@/providers/ThemeProvider';
import { 
  Sun, Moon, LogOut, LayoutDashboard, Calendar, 
  Shield, Menu, X, ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import GlobalSearch from '@/components/GlobalSearch';
import NotificationCenter from '@/components/NotificationCenter';

export default function DashboardNavbar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  const [menuOpen, setMenuOpen] = useState(false);

  if (!user) return null;

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/events', label: 'Explore Events', icon: Calendar },
  ];

  // Check if user has staff access
  const hasStaffAccess = ['volunteer', 'event_organizer', 'admin', 'super_admin'].includes(user.role);

  return (
    <nav className="glass-panel sticky top-0 z-30 border-b border-border/80 bg-background/80 backdrop-blur-md px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-premium flex items-center justify-center text-white font-bold text-sm">
              CC
            </div>
            <span className="font-bold text-base tracking-tight hidden sm:inline">
              Campus<span className="text-blue-500">Connect</span>
            </span>
          </Link>

          {/* Desktop Navigation links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                    isActive
                      ? 'bg-blue-600/10 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/10'
                      : 'text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800/40 border border-transparent'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-3">
          {/* Global Search Palette Indicator */}
          <GlobalSearch />

          {/* Staff Access Portal Switcher */}
          {hasStaffAccess && (
            <Link
              href="/admin/dashboard"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 font-bold text-[10px] tracking-widest uppercase hover:opacity-90 transition-opacity border border-zinc-200 dark:border-zinc-800 shadow-sm"
            >
              <Shield className="w-3 h-3" />
              <span>Admin Board</span>
            </Link>
          )}

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-border text-muted-foreground hover:bg-card transition-colors cursor-pointer"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4.5 h-4.5" />}
          </button>

          {/* Notification Center Popover */}
          <NotificationCenter />

          {/* User Profile dropdown or logout */}
          <div className="hidden sm:flex items-center gap-3 pl-2 border-l border-border/80">
            <img
              src={user.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.name}`}
              alt={user.name}
              className="w-7 h-7 rounded-full border border-border shadow-inner"
            />
            <div className="text-left">
              <div className="text-xs font-bold leading-none">{user.name}</div>
              <div className="text-[9px] text-zinc-500 mt-0.5 capitalize">{user.role.replace('_', ' ')}</div>
            </div>
            <button
              onClick={signOut}
              className="p-1.5 rounded-lg hover:bg-red-500/10 text-zinc-400 hover:text-red-500 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mobile hamburger menu */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex sm:hidden p-2 rounded-xl border border-border text-muted-foreground hover:bg-card"
          >
            {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden mt-3 p-4 bg-card border border-border rounded-2xl space-y-4"
          >
            <div className="flex items-center gap-3 border-b border-border/60 pb-3">
              <img
                src={user.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.name}`}
                alt={user.name}
                className="w-8 h-8 rounded-full border border-border"
              />
              <div className="text-left flex-1">
                <div className="text-sm font-bold">{user.name}</div>
                <div className="text-[10px] text-zinc-500 capitalize">{user.role.replace('_', ' ')}</div>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/40 text-xs font-semibold"
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                );
              })}

              {hasStaffAccess && (
                <Link
                  href="/admin/dashboard"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5 p-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 text-xs font-bold tracking-widest uppercase text-center"
                >
                  <Shield className="w-4 h-4" />
                  Admin Board
                </Link>
              )}

              <button
                onClick={signOut}
                className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-red-500/10 text-red-500 text-xs font-semibold text-left w-full cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
