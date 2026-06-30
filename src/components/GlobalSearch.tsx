'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Calendar, Users, Award, Ticket, Wallet, GraduationCap, FileText, X } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { MOCK_EVENTS, MOCK_CLUBS } from '@/lib/data';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchResultItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'events' | 'registrations' | 'payments' | 'certificates' | 'clubs' | 'notices';
  url: string;
}

export default function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'events' | 'registrations' | 'payments' | 'certificates' | 'clubs' | 'notices'>('all');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const { user } = useAuth();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // Toggle search palette on Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Autofocus input when open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Handle Search Queries (reads Mock/Local Storage data)
  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    const q = query.toLowerCase();
    const list: SearchResultItem[] = [];

    // 1. Events
    const customEvents = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('cc_custom_events') || '[]') : [];
    const allEvents = [...customEvents, ...MOCK_EVENTS];
    allEvents.forEach((evt) => {
      if (evt.title.toLowerCase().includes(q) || evt.venue.toLowerCase().includes(q)) {
        list.push({
          id: evt.id,
          title: evt.title,
          subtitle: `Event in ${evt.venue} | ${evt.category}`,
          category: 'events',
          url: `/events/${evt.id}`
        });
      }
    });

    // 2. Clubs
    MOCK_CLUBS.forEach((club) => {
      if (club.name.toLowerCase().includes(q) || club.description.toLowerCase().includes(q)) {
        list.push({
          id: club.id,
          title: club.name,
          subtitle: 'Active Student Club',
          category: 'clubs',
          url: '/events' // Route to explorer
        });
      }
    });

    // 3. Registrations, Payments, Certificates (User specific in mock mode)
    if (user) {
      // Registrations
      const localRegsKey = `cc_registrations_${user.id}`;
      const regs = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem(localRegsKey) || '[]') : [];
      regs.forEach((r: any) => {
        if (r.event?.title.toLowerCase().includes(q) || r.team_name?.toLowerCase().includes(q)) {
          list.push({
            id: r.id,
            title: `Registration: ${r.event?.title}`,
            subtitle: `Status: ${r.status} | Team: ${r.team_name || 'Solo'}`,
            category: 'registrations',
            url: '/dashboard'
          });
        }
      });

      // Certificates
      const localCertsKey = `cc_certs_${user.id}`;
      const certs = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem(localCertsKey) || '[]') : [];
      certs.forEach((c: any) => {
        if (c.certificate_id.toLowerCase().includes(q) || c.registration?.event?.title.toLowerCase().includes(q)) {
          list.push({
            id: c.id,
            title: `Certificate: ${c.registration?.event?.title || 'Event'}`,
            subtitle: `ID: ${c.certificate_id} (Verified)`,
            category: 'certificates',
            url: `/certificates/verify/${c.certificate_id}`
          });
        }
      });

      // Notices
      const notices = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('cc_notices') || '[]') : [];
      notices.forEach((n: any) => {
        if (n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)) {
          list.push({
            id: n.id,
            title: n.title,
            subtitle: `Notice Announcement | ${n.department || 'Campus Wide'}`,
            category: 'notices',
            url: '/dashboard'
          });
        }
      });
    }

    // Filter results by type
    const filteredResults = filter === 'all' ? list : list.filter((item) => item.category === filter);
    setResults(filteredResults);
    setSelectedIndex(0);
  }, [query, filter, user]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        router.push(results[selectedIndex].url);
        setIsOpen(false);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'events':
        return <Calendar className="w-4 h-4 text-blue-500" />;
      case 'registrations':
        return <Ticket className="w-4 h-4 text-purple-500" />;
      case 'payments':
        return <Wallet className="w-4 h-4 text-emerald-500" />;
      case 'certificates':
        return <Award className="w-4 h-4 text-amber-500" />;
      case 'clubs':
        return <GraduationCap className="w-4 h-4 text-pink-500" />;
      case 'notices':
        return <FileText className="w-4 h-4 text-indigo-500" />;
      default:
        return <Search className="w-4 h-4 text-zinc-400" />;
    }
  };

  return (
    <>
      {/* Keyboard Shortcut Indicator Button in Navbar / Floating */}
      <button
        onClick={() => setIsOpen(true)}
        className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border bg-card/60 hover:bg-card text-muted-foreground text-xs font-medium cursor-pointer transition-colors"
      >
        <Search className="w-3.5 h-3.5" />
        <span>Search...</span>
        <span className="bg-zinc-200 dark:bg-zinc-800 text-[10px] px-1.5 py-0.5 rounded font-mono">Ctrl+K</span>
      </button>

      {/* Floating Command Palette Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-zinc-950/65 backdrop-blur-sm" onClick={() => setIsOpen(false)} />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="w-full max-w-xl bg-card/95 backdrop-blur-md border border-border rounded-[24px] shadow-2xl overflow-hidden relative z-10 flex flex-col max-h-[500px]"
            >
              {/* Search Bar Input */}
              <div className="flex items-center gap-3 px-4 border-b border-border/80">
                <Search className="w-5 h-5 text-zinc-400" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search events, registrations, certificates..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full py-4 bg-transparent border-0 text-sm focus:outline-none focus:ring-0 text-foreground"
                />
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-foreground cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Quick Filters */}
              <div className="px-4 py-2 border-b border-border/40 flex items-center gap-1.5 overflow-x-auto text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-zinc-100/30 dark:bg-zinc-900/30">
                {(['all', 'events', 'registrations', 'certificates', 'clubs', 'notices'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setFilter(t)}
                    className={`px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                      filter === t
                        ? 'bg-blue-600/10 dark:bg-blue-500/15 border-blue-500/30 text-blue-600 dark:text-blue-400'
                        : 'border-transparent hover:bg-zinc-200 dark:hover:bg-zinc-800'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Results List */}
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {query === '' ? (
                  <div className="py-8 text-center text-xs text-zinc-500">
                    Type something to search. Try <span className="font-mono">TechnoHack</span> or <span className="font-mono">Certificate</span>.
                  </div>
                ) : results.length === 0 ? (
                  <div className="py-8 text-center text-xs text-zinc-500">No results found matching "{query}"</div>
                ) : (
                  results.map((item, idx) => {
                    const isSelected = idx === selectedIndex;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          router.push(item.url);
                          setIsOpen(false);
                        }}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`w-full flex items-center gap-3.5 p-3 rounded-xl text-left border transition-all ${
                          isSelected
                            ? 'bg-blue-600/10 dark:bg-blue-500/15 border-blue-500/25 text-blue-600 dark:text-blue-400'
                            : 'border-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800/40 text-foreground'
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${isSelected ? 'bg-blue-500 text-white' : 'bg-zinc-200/50 dark:bg-zinc-800/80 text-zinc-500'}`}>
                          {getCategoryIcon(item.category)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold truncate">{item.title}</div>
                          <div className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate mt-0.5">{item.subtitle}</div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
