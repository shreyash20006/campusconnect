'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import DashboardNavbar from '@/components/DashboardNavbar';
import { MOCK_EVENTS, CollegeEvent } from '@/lib/data';
import { 
  Search, SlidersHorizontal, Calendar, MapPin, 
  Tag, IndianRupee, ArrowUpDown, ChevronLeft, 
  ChevronRight, Sparkles, HelpCircle 
} from 'lucide-react';
import { formatCurrency, formatDateTime } from '@/lib/utils';

const CATEGORIES = ['All', 'Technical', 'Cultural', 'Sports', 'Workshop', 'Seminar'];

export default function EventsDiscovery() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid'>('all');
  const [sortBy, setSortBy] = useState<'date-asc' | 'date-desc' | 'price-asc' | 'price-desc'>('date-asc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Filter and Sort Events
  const filteredEvents = useMemo(() => {
    let result = [...MOCK_EVENTS];

    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(e => 
        e.title.toLowerCase().includes(q) || 
        e.description.toLowerCase().includes(q) || 
        e.short_description.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (selectedCategory !== 'All') {
      result = result.filter(e => e.category === selectedCategory);
    }

    // Price filter
    if (priceFilter === 'free') {
      result = result.filter(e => !e.is_paid || e.price === 0);
    } else if (priceFilter === 'paid') {
      result = result.filter(e => e.is_paid && e.price > 0);
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'date-asc') {
        return new Date(a.date_time).getTime() - new Date(b.date_time).getTime();
      }
      if (sortBy === 'date-desc') {
        return new Date(b.date_time).getTime() - new Date(a.date_time).getTime();
      }
      if (sortBy === 'price-asc') {
        return a.price - b.price;
      }
      if (sortBy === 'price-desc') {
        return b.price - a.price;
      }
      return 0;
    });

    return result;
  }, [searchQuery, selectedCategory, priceFilter, sortBy]);

  // Paginated Events
  const paginatedEvents = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredEvents.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredEvents, currentPage]);

  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      // Scroll to top of filters
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <DashboardNavbar />

      <div className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-8">
        
        {/* Banner Section */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-premium py-10 px-8 text-white shadow-xl shadow-blue-500/5">
          <div className="absolute inset-0 bg-black/25 backdrop-blur-[1px]" />
          <div className="relative z-10 max-w-2xl text-left space-y-2">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Campus Events Board</h1>
            <p className="text-xs md:text-sm text-white/80 leading-normal">
              Browse technical hackathons, cultural fests, workshops, and sports meets. Secure your ticket instantly with simple click-to-registers and secure Cashfree checkouts.
            </p>
          </div>
        </div>

        {/* Filter Controls Panel */}
        <div className="premium-card p-5 space-y-4 bg-card/75 backdrop-blur-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search events by title or keywords..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2.5 text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-foreground"
              />
            </div>

            {/* Sorting Select */}
            <div className="flex items-center gap-3 shrink-0">
              <SlidersHorizontal className="w-4 h-4 text-zinc-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-background border border-border rounded-xl px-3 py-2.5 text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-muted-foreground font-semibold"
              >
                <option value="date-asc">Date: Soonest First</option>
                <option value="date-desc">Date: Latest First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          <div className="border-t border-border/60 pt-4 flex flex-wrap items-center justify-between gap-3">
            {/* Categories Selector */}
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => { setSelectedCategory(cat); setCurrentPage(1); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-blue-600/10 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/15'
                      : 'hover:bg-zinc-100 dark:hover:bg-zinc-800/40 text-muted-foreground border border-transparent'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Price Filter Segmented Toggle */}
            <div className="p-0.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-border/40 flex">
              {(['all', 'free', 'paid'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => { setPriceFilter(filter); setCurrentPage(1); }}
                  className={`px-3.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    priceFilter === filter
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Events Grid */}
        {paginatedEvents.length === 0 ? (
          <div className="premium-card p-12 text-center text-sm text-zinc-400 flex flex-col items-center gap-2">
            <HelpCircle className="w-10 h-10 text-zinc-500/30" />
            <span className="font-semibold">No events matched your search criteria</span>
            <p className="text-xs text-zinc-500 leading-normal">
              Try adjusting your category filter, sorting preferences, or typing different keywords.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedEvents.map((event) => {
              const deadlinePassed = event.registration_deadline 
                ? new Date(event.registration_deadline) < new Date() 
                : false;
              
              return (
                <div key={event.id} className="premium-card bg-card overflow-hidden flex flex-col justify-between group">
                  {/* Banner Image */}
                  <div className="relative aspect-[16/9] bg-zinc-900 overflow-hidden border-b border-border">
                    <img
                      src={event.banner_url}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    
                    {/* Category pill */}
                    <span className="absolute top-3.5 left-3.5 px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider text-white border border-white/10">
                      {event.category}
                    </span>

                    {/* Price pill */}
                    <span className="absolute bottom-3.5 right-3.5 px-2.5 py-0.5 rounded-lg bg-blue-500 text-white text-[11px] font-bold shadow-md">
                      {event.price === 0 ? 'FREE' : formatCurrency(event.price)}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between text-left space-y-4">
                    <div className="space-y-2.5">
                      <h3 className="font-extrabold text-base leading-snug group-hover:text-primary transition-colors line-clamp-1">
                        {event.title}
                      </h3>
                      <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">
                        {event.short_description}
                      </p>
                    </div>

                    <div className="border-t border-border/40 pt-4 space-y-2 text-[11px] text-zinc-400">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                        <span>{formatDateTime(event.date_time)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                        <span className="truncate">{event.venue}</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer Action */}
                  <div className="px-5 pb-5 pt-0.5 flex gap-2">
                    <Link
                      href={`/events/${event.id}`}
                      className="w-full py-2.5 rounded-xl border border-border text-center text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      View Schedule
                    </Link>
                    
                    {deadlinePassed ? (
                      <span className="w-full py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-border/80 text-zinc-400 text-center text-xs font-semibold cursor-not-allowed">
                        Closed
                      </span>
                    ) : (
                      <Link
                        href={`/events/${event.id}/register`}
                        className="w-full py-2.5 rounded-xl bg-primary hover:bg-blue-600 text-white text-center text-xs font-semibold transition-colors flex items-center justify-center gap-0.5"
                      >
                        Register Now
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 pt-6">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2.5 rounded-xl border border-border bg-card text-muted-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800/40 disabled:opacity-40 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-semibold">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2.5 rounded-xl border border-border bg-card text-muted-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800/40 disabled:opacity-40 transition-all cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
