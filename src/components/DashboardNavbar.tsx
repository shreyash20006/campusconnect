'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { useTheme } from '@/providers/ThemeProvider';
import { 
  Sun, Moon, LogOut, LayoutDashboard, Compass, 
  Shield, Menu, X, ArrowUpRight, LogIn
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import GlobalSearch from '@/components/GlobalSearch';
import NotificationCenter from '@/components/NotificationCenter';

export default function DashboardNavbar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = user ? [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/events', label: 'Explore Events', icon: Compass },
  ] : [
    { href: '/events', label: 'Explore Events', icon: Compass },
  ];

  // Check if user has staff access
  const hasStaffAccess = user && ['volunteer', 'event_organizer', 'admin', 'super_admin'].includes(user.role);

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
              Campus<span className="text-primary font-extrabold">Connect</span>
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
                      ? 'bg-primary/10 text-primary border border-primary/10'
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
          
          {/* Global Search (only if logged in or viewing catalog) */}
          <GlobalSearch />

          {/* Staff Access Portal Switcher */}
          {user && hasStaffAccess && (
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
          {user && <NotificationCenter />}

          {/* User Profile dropdown or guest actions */}
          {user ? (
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
          ) : (
            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-border/80">
              <Link 
                href="/auth" 
                className="text-xs font-bold text-muted-foreground hover:text-foreground px-3 py-2 flex items-center gap-1"
              >
                <LogIn className="w-3.5 h-3.5" /> Sign In
              </Link>
              <Link 
                href="/auth?tab=register" 
                className="bg-primary hover:bg-rose-600 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1 shadow-md shadow-primary/10"
              >
                Get Started <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          {/* Mobile hamburger menu */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex sm:hidden p-2 rounded-xl border border-border text-muted-foreground hover:bg-card cursor-pointer"
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
            className="md:hidden mt-3 p-4 bg-card border border-border rounded-2xl space-y-4 text-left"
          >
            {user ? (
              <>
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
              </>
            ) : (
              <div className="flex flex-col gap-2.5">
                <Link
                  href="/events"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/40 text-xs font-semibold"
                >
                  <Compass className="w-4 h-4" />
                  Explore Events
                </Link>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Link 
                    href="/auth" 
                    onClick={() => setMenuOpen(false)}
                    className="w-full py-2.5 rounded-xl border border-border text-center text-xs font-bold bg-card"
                  >
                    Sign In
                  </Link>
                  <Link 
                    href="/auth?tab=register" 
                    onClick={() => setMenuOpen(false)}
                    className="w-full py-2.5 rounded-xl bg-primary text-white text-center text-xs font-bold shadow-md shadow-primary/10"
                  >
                    Get Started
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
