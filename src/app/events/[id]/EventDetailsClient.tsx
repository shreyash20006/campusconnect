'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import DashboardNavbar from '@/components/DashboardNavbar';
import { CollegeEvent } from '@/lib/data';
import { useAuth } from '@/providers/AuthProvider';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { motion } from 'framer-motion';
import { 
  Copy as CopyIcon, Image as ImageIcon2, Globe as GlobeIcon, ShieldAlert as ShieldAlertIcon,
  Calendar as CalendarIcon, MapPin as MapPinIcon, Users as UsersIcon, Heart as HeartIcon, Share2 as Share2Icon, 
  ArrowLeft as ArrowLeftIcon, Clock as ClockIcon, Award as AwardIcon, Shield as ShieldIcon, Check as CheckIcon, 
  ChevronRight as ChevronRightIcon, ArrowUpRight as ArrowUpRightIcon, HelpCircle as HelpCircleIcon, CheckCircle2 as CheckCircle2Icon
} from 'lucide-react';

export default function EventDetailsClient({ event }: { event: CollegeEvent }) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [shared, setShared] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'agenda' | 'speakers'>('details');
  const [duplicated, setDuplicated] = useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  const handleDuplicate = () => {
    const customEvents = JSON.parse(localStorage.getItem('cc_custom_events') || '[]');
    const clone: CollegeEvent = {
      ...event,
      id: `custom-clone-${Math.random().toString(36).substring(2, 9)}`,
      title: `${event.title} (Copy)`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    localStorage.setItem('cc_custom_events', JSON.stringify([clone, ...customEvents]));
    setDuplicated(true);
    setTimeout(() => setDuplicated(false), 2500);
  };

  const deadlinePassed = event.registration_deadline 
    ? new Date(event.registration_deadline) < new Date() 
    : false;

  // Add to Calendar Generator
  const getGoogleCalendarUrl = () => {
    const startDate = new Date(event.date_time).toISOString().replace(/-|:|\.\d\d\d/g, '');
    const endDate = new Date(event.end_date_time).toISOString().replace(/-|:|\.\d\d\d/g, '');
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${startDate}/${endDate}&details=${encodeURIComponent(event.short_description)}&location=${encodeURIComponent(event.venue)}`;
  };

  const getICalUrl = () => {
    const icsText = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nSUMMARY:${event.title}\nDESCRIPTION:${event.short_description}\nLOCATION:${event.venue}\nDTSTART:${new Date(event.date_time).toISOString().replace(/-|:/g, '').split('.')[0]}Z\nDTEND:${new Date(event.end_date_time).toISOString().replace(/-|:/g, '').split('.')[0]}Z\nEND:VEVENT\nEND:VCALENDAR`;
    return `data:text/calendar;charset=utf-8,${encodeURIComponent(icsText)}`;
  };

  // Curated gallery images based on category
  const galleryImages = [
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500',
    'https://images.unsplash.com/photo-1511578314322-379afb476865?w=500',
    'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=500'
  ];

  const hasStaffAccess = user && ['event_organizer', 'admin', 'super_admin'].includes(user.role);

  return (
    <div className="min-h-screen bg-background flex flex-col text-left">
      <DashboardNavbar />

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-6 py-6 space-y-6">
        
        {/* Back Link */}
        <div className="flex justify-between items-center">
          <Link 
            href="/events" 
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-foreground transition-colors"
          >
            <ArrowLeftIcon className="w-3.5 h-3.5" /> Back to Events
          </Link>

          {hasStaffAccess && (
            <button
              onClick={handleDuplicate}
              className={`px-3.5 py-1.5 border text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
                duplicated ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'border-border bg-card hover:bg-zinc-800'
              }`}
            >
              <CopyIcon className="w-3.5 h-3.5" /> 
              {duplicated ? 'Cloned successfully!' : 'Duplicate Event Template'}
            </button>
          )}
        </div>

        {/* Dynamic Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Columns (Details / Content) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Banner Card */}
            <div className="relative aspect-[21/9] rounded-[28px] overflow-hidden border border-border shadow-md">
              <img 
                src={event.banner_url} 
                alt={event.title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 flex justify-between items-end">
                <div className="space-y-1.5">
                  <div className="flex gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-blue-500 text-white text-[10px] font-bold tracking-wider uppercase border border-blue-400/20">
                      {event.category}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-pink-500/20 text-pink-500 border border-pink-500/30 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                      <GlobeIcon className="w-3.5 h-3.5" /> Public Visibility
                    </span>
                  </div>
                  <h1 className="text-xl md:text-3xl font-extrabold text-white mt-2 leading-tight">
                    {event.title}
                  </h1>
                </div>
              </div>
            </div>

            {/* Mobile Tab Selector */}
            <div className="flex p-0.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-border/40 md:hidden">
              {(['details', 'agenda', 'speakers'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                    activeTab === tab ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab: Details */}
            {(activeTab === 'details' || typeof window !== 'undefined' && window.innerWidth >= 768) && (
              <div className={`${activeTab !== 'details' ? 'hidden md:block' : ''} space-y-6`}>
                <div className="premium-card p-6 md:p-8 space-y-4 bg-card">
                  <h2 className="text-lg font-bold tracking-tight border-b border-border/60 pb-2">
                    Event Overview
                  </h2>
                  <p className="text-sm md:text-base text-muted leading-relaxed whitespace-pre-line">
                    {event.description}
                  </p>
                </div>

                {/* Keynote Speakers */}
                {event.speakers && event.speakers.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold tracking-tight">Keynote Speakers</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {event.speakers.map((speaker, i) => (
                        <div key={i} className="premium-card p-4 flex gap-4 items-center bg-card/60 hover:border-blue-500/20 transition-all">
                          <img
                            src={speaker.avatarUrl}
                            alt={speaker.name}
                            className="w-12 h-12 rounded-2xl object-cover border border-border"
                          />
                          <div className="text-left">
                            <h4 className="font-bold text-sm">{speaker.name}</h4>
                            <p className="text-[10px] text-zinc-500">{speaker.designation}</p>
                            <p className="text-[10px] text-blue-500 font-semibold mt-0.5">{speaker.company}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Agenda Timeline */}
                {event.agenda && event.agenda.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold tracking-tight">Schedule & Agenda</h3>
                    <div className="premium-card p-6 bg-card space-y-6 relative">
                      {/* Vertical line connector */}
                      <div className="absolute left-[38px] top-8 bottom-8 w-[2px] bg-border/60" />

                      {event.agenda.map((item, i) => (
                        <div key={i} className="flex gap-6 items-start relative z-10">
                          <div className="px-2.5 py-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-[10px] font-bold text-center w-16 shrink-0 border border-border/40">
                            {item.time}
                          </div>
                          <div className="space-y-1 text-left">
                            <h4 className="font-bold text-sm">{item.title}</h4>
                            <p className="text-xs text-muted leading-normal">{item.description}</p>
                            {item.speaker && (
                              <span className="inline-block text-[9px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500 font-semibold mt-1">
                                Speaker: {item.speaker}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sponsors & Partners */}
                {event.sponsors && event.sponsors.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold tracking-tight">Sponsors & Partners</h3>
                    <div className="flex flex-wrap gap-4 items-center">
                      {event.sponsors.map((s, idx) => (
                        <div key={idx} className="premium-card px-5 py-3.5 bg-card/45 flex items-center justify-center gap-2 border border-border/60 hover:border-blue-500/15 transition-all">
                          <div className="w-4 h-4 rounded-full bg-blue-500/10 flex items-center justify-center text-[9px] font-extrabold text-blue-500">★</div>
                          <span className="text-xs font-bold uppercase text-zinc-500">{s.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Event Gallery */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold tracking-tight flex items-center gap-1.5">
                    <ImageIcon2 className="w-4.5 h-4.5 text-zinc-400" />
                    <span>Event Gallery</span>
                  </h3>
                  <div className="grid grid-cols-3 gap-3.5">
                    {galleryImages.map((src, i) => (
                      <div key={i} className="aspect-video rounded-2xl overflow-hidden border border-border bg-zinc-900 shadow-sm relative group">
                        <img 
                          src={src} 
                          alt="Gallery item" 
                          className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" 
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Venue Map */}
                <div className="premium-card p-6 bg-card space-y-4">
                  <h3 className="text-sm font-bold tracking-wider uppercase text-zinc-500">Venue Map Location</h3>
                  <div className="aspect-[21/9] rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-border flex items-center justify-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-grid-pattern opacity-40" />
                    <div className="absolute w-8 h-8 rounded-full bg-blue-500/20 animate-ping" />
                    <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-md relative z-10" />
                    
                    <div className="absolute bottom-3 left-3 bg-black/80 text-white text-[10px] px-2.5 py-1 rounded-lg border border-white/10 font-medium">
                      GPS: {event.location_coordinates?.lat || '19.07'}, {event.location_coordinates?.lng || '72.87'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Mobile View Tab: Agenda */}
            {activeTab === 'agenda' && (
              <div className="md:hidden space-y-4">
                <div className="premium-card p-5 bg-card space-y-6 relative">
                  <div className="absolute left-[38px] top-8 bottom-8 w-[2px] bg-border/60" />
                  {event.agenda.map((item, i) => (
                    <div key={i} className="flex gap-4 items-start relative z-10">
                      <div className="px-2.5 py-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-[10px] font-bold text-center w-16 shrink-0">
                        {item.time}
                      </div>
                      <div className="space-y-1 text-left">
                        <h4 className="font-bold text-xs">{item.title}</h4>
                        <p className="text-[11px] text-muted">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Mobile View Tab: Speakers */}
            {activeTab === 'speakers' && (
              <div className="md:hidden space-y-4">
                {event.speakers.map((speaker, i) => (
                  <div key={i} className="premium-card p-4 flex gap-4 items-center bg-card">
                    <img
                      src={speaker.avatarUrl}
                      alt={speaker.name}
                      className="w-12 h-12 rounded-xl object-cover"
                    />
                    <div className="text-left">
                      <h4 className="font-bold text-xs">{speaker.name}</h4>
                      <p className="text-[10px] text-zinc-500">{speaker.designation}</p>
                      <p className="text-[10px] text-blue-500 font-semibold mt-0.5">{speaker.company}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>

          {/* Right Sticky Sidebar (Pricing, limits, actions) */}
          <div className="space-y-6">
            <div className="premium-card p-6 bg-card sticky top-24 space-y-6 shadow-md border-border/90">
              
              {/* Event Price details */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Ticket Price</span>
                <div className="text-3xl font-extrabold text-blue-500">
                  {event.price === 0 ? 'FREE' : formatCurrency(event.price)}
                </div>
                {event.is_paid && (
                  <p className="text-[10px] text-zinc-500">Settle directly to college merchant account. Zero service fees.</p>
                )}
              </div>

              <div className="border-t border-border/80" />

              {/* Event Metadata list */}
              <div className="space-y-4 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-muted">Max Team Size</span>
                  <span className="font-bold text-foreground">
                    {event.max_team_size === 1 ? 'Solo Registration' : `Up to ${event.max_team_size} members`}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-muted">Seats Limit</span>
                  <span className="font-bold text-foreground">
                    {event.registration_limit ? `${event.registration_limit} seats` : 'Unlimited'}
                  </span>
                </div>

                <div className="flex justify-between items-start">
                  <span className="text-muted">Registration Closes</span>
                  <span className="font-bold text-foreground text-right">
                    {event.registration_deadline ? formatDateTime(event.registration_deadline) : 'N/A'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                {deadlinePassed ? (
                  <button
                    disabled
                    className="w-full py-3.5 rounded-24 bg-zinc-100 dark:bg-zinc-900 border border-border text-zinc-400 font-semibold text-sm cursor-not-allowed text-center"
                  >
                    Registrations Closed
                  </button>
                ) : (
                  <Link
                    href={`/events/${event.id}/register`}
                    className="w-full py-3.5 rounded-24 bg-primary hover:bg-blue-600 text-white font-semibold text-sm transition-all shadow-md shadow-blue-500/25 flex items-center justify-center gap-1.5"
                  >
                    Register Now <ChevronRightIcon className="w-4 h-4" />
                  </Link>
                )}

                <div className="grid grid-cols-2 gap-2 pt-2">
                  {/* Like Button */}
                  <button
                    onClick={() => setLiked(!liked)}
                    className={`py-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      liked 
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-500' 
                        : 'border-border hover:bg-zinc-100 dark:hover:bg-zinc-800/40 text-muted-foreground'
                    }`}
                  >
                    <HeartIcon className={`w-4.5 h-4.5 ${liked ? 'fill-rose-500' : ''}`} />
                    {liked ? 'Liked' : 'Like'}
                  </button>

                  {/* Share Button */}
                  <button
                    onClick={handleShare}
                    className={`py-2 rounded-xl border border-border text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800/40 transition-colors cursor-pointer ${
                      shared ? 'text-emerald-500 border-emerald-500/30 bg-emerald-500/5' : 'text-muted-foreground'
                    }`}
                  >
                    {shared ? <CheckIcon className="w-4.5 h-4.5" /> : <Share2Icon className="w-4.5 h-4.5" />}
                    {shared ? 'Copied!' : 'Share'}
                  </button>
                </div>

                {/* Calendar Integrations */}
                <div className="border-t border-border/60 pt-4 space-y-2">
                  <span className="text-[10px] text-zinc-400 font-bold block text-left">Add Event Schedule</span>
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <a
                      href={getGoogleCalendarUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 border border-border rounded-xl font-semibold flex items-center justify-center gap-1 bg-card hover:bg-zinc-800 transition-colors text-center"
                    >
                      Google Calendar
                    </a>
                    <a
                      href={getICalUrl()}
                      download={`${event.title}.ics`}
                      className="py-2 border border-border rounded-xl font-semibold flex items-center justify-center gap-1 bg-card hover:bg-zinc-800 transition-colors text-center"
                    >
                      iCal Download
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
