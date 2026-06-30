'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardNavbar from '@/components/DashboardNavbar';
import { useAuth } from '@/providers/AuthProvider';
import { MOCK_EVENTS, Registration, Ticket, Certificate } from '@/lib/data';
import { 
  Award, Ticket as TicketIcon, Sparkles, ClipboardList, CheckCircle2, User, 
  ArrowUpRight, Zap, Star, TrendingUp, CalendarDays, ChevronRight
} from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function StudentDashboard() {
  const { user } = useAuth();
  
  // States
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);

  useEffect(() => {
    if (!user) return;

    // Load registrations
    const localRegsKey = `cc_registrations_${user.id}`;
    const storedRegs = localStorage.getItem(localRegsKey);
    let currentRegs: Registration[] = [];

    if (storedRegs) {
      currentRegs = JSON.parse(storedRegs);
    } else {
      if (user.role === 'student') {
        currentRegs = [
          {
            id: 'reg-mock-1',
            event_id: 'event-5',
            student_id: user.id,
            team_name: null,
            team_members: [],
            emergency_contact: '9876543210',
            status: 'approved',
            payment_status: 'paid',
            created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            event: MOCK_EVENTS.find(e => e.id === 'event-5')
          },
          {
            id: 'reg-mock-2',
            event_id: 'event-2',
            student_id: user.id,
            team_name: null,
            team_members: [],
            emergency_contact: '9876543210',
            status: 'approved',
            payment_status: 'paid',
            created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            event: MOCK_EVENTS.find(e => e.id === 'event-2')
          }
        ];
        localStorage.setItem(localRegsKey, JSON.stringify(currentRegs));
      }
    }
    setRegistrations(currentRegs);

    // Tickets
    const localTicketsKey = `cc_tickets_${user.id}`;
    const storedTickets = localStorage.getItem(localTicketsKey);
    let currentTickets: Ticket[] = [];

    if (storedTickets) {
      currentTickets = JSON.parse(storedTickets);
    } else {
      currentTickets = currentRegs
        .filter(r => r.status === 'approved')
        .map(r => ({
          id: `tkt-${r.id}`,
          registration_id: r.id,
          ticket_id: `CC-${r.event?.title.substring(0, 3).toUpperCase()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
          status: r.event_id === 'event-5' ? 'used' : 'active',
          created_at: r.created_at,
          registration: r
        }));
      localStorage.setItem(localTicketsKey, JSON.stringify(currentTickets));
    }
    setTickets(currentTickets);

    // Certificates
    const localCertsKey = `cc_certs_${user.id}`;
    const storedCerts = localStorage.getItem(localCertsKey);
    let currentCerts: Certificate[] = [];

    if (storedCerts) {
      currentCerts = JSON.parse(storedCerts);
    } else {
      currentCerts = currentTickets
        .filter(t => t.status === 'used')
        .map(t => ({
          id: `cert-${t.id}`,
          registration_id: t.registration_id,
          certificate_id: `CC-CERT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          hash_signature: `hash_${t.id}_${Math.random().toString(36).substring(2, 10)}`,
          created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          registration: t.registration
        }));
      localStorage.setItem(localCertsKey, JSON.stringify(currentCerts));
    }
    setCertificates(currentCerts);

  }, [user]);

  if (!user) return null;

  // Streak & XP computations
  const certificatesCount = certificates.length;
  const xpPoints = (certificatesCount * 120) + (registrations.length * 40);
  const streakCount = Math.max(1, registrations.filter(r => r.status === 'approved').length);

  // Recharts Chart Dataset
  const ATTENDANCE_LINE_DATA = [
    { month: 'Jan', attended: 0 },
    { month: 'Feb', attended: 1 },
    { month: 'Mar', attended: 1 },
    { month: 'Apr', attended: 2 },
    { month: 'May', attended: streakCount - 1 },
    { month: 'Jun', attended: streakCount }
  ];

  // Recommendations
  const registeredEventIds = registrations.map(r => r.event_id);
  const recommendedEvents = MOCK_EVENTS.filter(e => !registeredEventIds.includes(e.id)).slice(0, 3);

  // Calendar Schedule Items (Deadlines or start dates)
  const calendarSchedules = MOCK_EVENTS.slice(0, 4).map(e => ({
    title: e.title,
    date: new Date(e.date_time).toLocaleDateString([], { day: 'numeric', month: 'short' }),
    type: e.category,
    id: e.id
  }));

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <DashboardNavbar />
      
      <div className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-8">
        
        {/* Header Hero Greeting */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-primary uppercase tracking-widest bg-primary/10 px-2.5 py-0.5 rounded-md">
                Active Student Session
              </span>
              <span className="text-xs text-muted flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                SaaS Dashboard v2.0
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight mt-1">Hello, {user.name}!</h1>
            <p className="text-sm text-zinc-500 mt-1 font-medium">Track registrations, verify certificates, and coordinate staff tasks.</p>
          </div>
          
          <div className="flex gap-2">
            <Link 
              href="/volunteer" 
              className="px-4.5 py-2.5 rounded-xl border border-primary/20 text-primary bg-primary/5 hover:bg-primary/10 font-bold text-xs shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <User className="w-4 h-4" /> Go to Volunteer Portal
            </Link>
            <Link 
              href="/events" 
              className="px-4.5 py-2.5 rounded-xl bg-primary hover:bg-rose-600 text-white font-bold text-xs shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              Explore Events <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Gamified Widgets & Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          {/* XP points */}
          <div className="premium-card p-5 space-y-2 bg-gradient-to-br from-primary/10 via-card to-zinc-950/20 border border-primary/15 relative overflow-hidden">
            <div className="absolute top-2 right-2 text-primary/10">
              <Star className="w-16 h-16 fill-primary" />
            </div>
            <div className="flex justify-between items-center text-xs text-primary font-bold uppercase tracking-wider">
              <span>Experience Points</span>
              <Star className="w-4 h-4 text-primary fill-primary animate-pulse" />
            </div>
            <div className="text-3xl font-extrabold text-foreground text-left">{xpPoints} <span className="text-xs font-semibold text-muted">XP</span></div>
            <p className="text-[10px] text-zinc-400 text-left">Earned by checking in and submitting certifications.</p>
          </div>

          {/* Event Streak */}
          <div className="premium-card p-5 space-y-2 bg-gradient-to-br from-amber-500/10 via-card to-zinc-950/20 border border-amber-500/15 relative overflow-hidden">
            <div className="absolute top-2 right-2 text-amber-500/10">
              <Zap className="w-16 h-16 fill-amber-500" />
            </div>
            <div className="flex justify-between items-center text-xs text-amber-400 font-bold uppercase tracking-wider">
              <span>Event Streak</span>
              <Zap className="w-4 h-4 text-amber-500 fill-amber-500 animate-bounce" />
            </div>
            <div className="text-3xl font-extrabold text-foreground text-left">{streakCount} <span className="text-xs font-semibold text-muted">events</span></div>
            <p className="text-[10px] text-zinc-400 text-left">Keep attending college meets to maintain your streak!</p>
          </div>

          {/* Certificate Ledger */}
          <div className="premium-card p-5 space-y-2 bg-card">
            <div className="flex justify-between items-center text-xs text-zinc-400 font-bold uppercase tracking-wider">
              <span>Verified Credentials</span>
              <Award className="w-4.5 h-4.5 text-primary" />
            </div>
            <div className="text-3xl font-extrabold text-foreground text-left">{certificatesCount}</div>
            <p className="text-[10px] text-zinc-500 text-left leading-normal">Digitally verified via SHA-256 signatures.</p>
          </div>

          {/* Registered Events */}
          <div className="premium-card p-5 space-y-2 bg-card">
            <div className="flex justify-between items-center text-xs text-zinc-400 font-bold uppercase tracking-wider">
              <span>Registrations</span>
              <ClipboardList className="w-4.5 h-4.5 text-primary" />
            </div>
            <div className="text-3xl font-extrabold text-foreground text-left">{registrations.length}</div>
            <p className="text-[10px] text-zinc-500 text-left">Free & paid events enrolled.</p>
          </div>

        </div>

        {/* Main Content Dashboard Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Columns: Passes & Chart */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Active passes */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
                <TicketIcon className="w-4.5 h-4.5 text-primary" />
                <span>My Active Digital Passes</span>
              </h2>

              {tickets.filter(t => t.status === 'active').length === 0 ? (
                <div className="premium-card p-8 text-center text-sm text-zinc-400 flex flex-col items-center gap-2">
                  <TicketIcon className="w-8 h-8 text-zinc-500/50" />
                  <span>No active passes. Once you register for an event, tickets appear here instantly.</span>
                  <Link href="/events" className="text-xs text-primary font-semibold hover:underline mt-1.5 flex items-center gap-0.5">
                    Browse Events <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tickets.filter(t => t.status === 'active').map((ticket) => {
                    const event = ticket.registration?.event;
                    if (!event) return null;
                    return (
                      <div key={ticket.id} className="premium-card p-5 bg-card/60 relative overflow-hidden flex flex-col justify-between group">
                        <div className="absolute -top-12 -right-12 w-24 h-24 rounded-full bg-primary/5 blur-xl group-hover:bg-primary/10 transition-colors" />
                        
                        <div className="space-y-2.5">
                          <div className="flex justify-between items-start">
                            <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-400 font-mono">
                              {ticket.ticket_id}
                            </span>
                            <span className="text-[9px] uppercase font-bold tracking-wider text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                              Valid Pass
                            </span>
                          </div>
                          
                          <div className="space-y-1 text-left">
                            <h3 className="font-bold text-base leading-snug line-clamp-1 group-hover:text-primary transition-colors">
                              {event.title}
                            </h3>
                            <p className="text-xs text-zinc-500">{event.venue}</p>
                            <p className="text-[11px] text-zinc-400 font-medium">{formatDateTime(event.date_time)}</p>
                          </div>
                        </div>

                        <div className="border-t border-dashed border-border/85 my-4" />

                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-muted-foreground font-semibold">Standard Ticket</span>
                          <Link 
                            href={`/tickets/${ticket.id}`}
                            className="px-3.5 py-1.5 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-[10px] uppercase tracking-wider hover:opacity-90 transition-opacity"
                          >
                            Show Ticket QR
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Verified Certificates */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
                <Award className="w-4.5 h-4.5 text-primary" />
                <span>My Earned Credentials</span>
              </h2>

              {certificates.length === 0 ? (
                <div className="premium-card p-8 text-center text-sm text-zinc-400">
                  No certificates issued yet. Complete an event and verify check-in to receive yours.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {certificates.map((cert) => {
                    const event = cert.registration?.event;
                    return (
                      <div key={cert.id} className="premium-card p-5 bg-card/60 relative overflow-hidden flex flex-col justify-between group border-l-4 border-l-primary">
                        <div className="space-y-2.5">
                          <div className="flex justify-between items-start">
                            <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-400 font-mono">
                              {cert.certificate_id}
                            </span>
                            <span className="text-[9px] uppercase font-bold tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                              Verified PDF
                            </span>
                          </div>
                          
                          <div className="space-y-1 text-left">
                            <h3 className="font-bold text-base leading-snug line-clamp-1 group-hover:text-primary transition-colors">
                              {event?.title || 'Workshop Participation'}
                            </h3>
                            <p className="text-[10px] text-zinc-400 font-mono">HASH: {cert.hash_signature.substring(0, 16)}...</p>
                            <p className="text-[11px] text-zinc-400 font-medium">Issued: {new Date(cert.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>

                        <div className="border-t border-dashed border-border/85 my-4" />

                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-muted-foreground font-semibold">Dean Certified</span>
                          <Link 
                            href={`/certificates/verify/${cert.certificate_id}`}
                            className="px-3.5 py-1.5 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-[10px] uppercase tracking-wider hover:opacity-90 transition-opacity"
                          >
                            View & Download
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Recharts line chart showing attendance streak */}
            <div className="premium-card p-5 bg-card space-y-4 text-left">
              <div className="border-b border-border/60 pb-3 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-sm">Attendance Analysis</h3>
                  <p className="text-[10px] text-zinc-400">Total verified event attendances completed per month</p>
                </div>
                <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-0.5 bg-emerald-500/10 px-2 py-0.5 rounded">
                  <TrendingUp className="w-3.5 h-3.5" /> Growth positive
                </span>
              </div>

              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={ATTENDANCE_LINE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="month" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#0c0c0f',
                        borderColor: '#1e1e24',
                        borderRadius: '12px',
                        fontSize: '11px',
                        color: '#fafafa'
                      }} 
                    />
                    <Line type="monotone" dataKey="attended" stroke="#FF4D6D" strokeWidth={2.5} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* Right Column: Calendar Widget & Recommendations */}
          <div className="space-y-6">
            
            {/* Calendar list widget */}
            <div className="premium-card p-5 bg-card text-left space-y-4">
              <h3 className="font-bold text-sm flex items-center gap-1.5 border-b border-border/60 pb-2.5">
                <CalendarDays className="w-4.5 h-4.5 text-zinc-400" />
                <span>Upcoming Schedules</span>
              </h3>
              
              <div className="space-y-3.5">
                {calendarSchedules.map((item, idx) => (
                  <Link 
                    key={idx} 
                    href={`/events/${item.id}`}
                    className="flex justify-between items-center gap-2 group hover:opacity-90"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="font-bold text-xs truncate group-hover:text-primary transition-colors">{item.title}</div>
                      <span className="text-[10px] text-zinc-500">{item.type}</span>
                    </div>
                    
                    <span className="px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-900 border border-border/80 font-mono text-[9px] font-bold text-zinc-400 shrink-0">
                      {item.date}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold tracking-tight text-left flex items-center gap-1.5">
                <Sparkles className="w-4.5 h-4.5 text-primary animate-pulse" />
                <span>Recommended for You</span>
              </h2>

              <div className="space-y-3">
                {recommendedEvents.map((evt) => (
                  <Link
                    key={evt.id}
                    href={`/events/${evt.id}`}
                    className="premium-card p-4 bg-card/45 hover:bg-card/90 flex gap-3.5 items-center transition-all group"
                  >
                    <img 
                      src={evt.banner_url} 
                      alt={evt.title} 
                      className="w-12 h-12 rounded-xl object-cover shrink-0"
                    />
                    <div className="text-left flex-1 min-w-0">
                      <h4 className="font-bold text-xs truncate group-hover:text-primary transition-colors">
                        {evt.title}
                      </h4>
                      <p className="text-[10px] text-zinc-400 mt-0.5">{evt.venue}</p>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-zinc-400 group-hover:text-foreground shrink-0" />
                  </Link>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
