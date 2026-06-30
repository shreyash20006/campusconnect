'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardNavbar from '@/components/DashboardNavbar';
import { useAuth } from '@/providers/AuthProvider';
import { Ticket, MOCK_EVENTS } from '@/lib/data';
import { 
  ArrowLeft, CalendarDays, CheckCircle2, AlertTriangle,
  Info, Check, Share2, Printer
} from 'lucide-react';
import { formatCurrency, formatDateTime } from '@/lib/utils';

export default function TicketClient({ ticketId }: { ticketId: string }) {
  const { user } = useAuth();
  const router = useRouter();

  // states
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    if (!user) return;

    const localTicketsKey = `cc_tickets_${user.id}`;
    const storedTickets = localStorage.getItem(localTicketsKey);
    let allTickets: Ticket[] = [];

    if (storedTickets) {
      allTickets = JSON.parse(storedTickets);
    }

    let found = allTickets.find(t => t.id === ticketId || t.ticket_id === ticketId);

    if (!found) {
      const firstEvent = MOCK_EVENTS[0];
      found = {
        id: ticketId,
        registration_id: 'reg-fallback-id',
        ticket_id: 'CC-TEC-HD8A1',
        status: 'active',
        created_at: new Date().toISOString(),
        registration: {
          id: 'reg-fallback-id',
          event_id: firstEvent.id,
          student_id: user.id,
          team_name: null,
          team_members: [],
          emergency_contact: user.phone || '9999999999',
          status: 'approved',
          payment_status: 'paid',
          created_at: new Date().toISOString(),
          event: firstEvent
        }
      };
    }

    setTicket(found);
    setLoading(false);
  }, [user, ticketId]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <DashboardNavbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!ticket || !ticket.registration || !ticket.registration.event) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <DashboardNavbar />
        <div className="flex-1 max-w-md mx-auto px-6 py-20 text-center space-y-4">
          <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
          <h1 className="text-xl font-bold">Ticket Not Found</h1>
          <p className="text-sm text-zinc-500">
            The ticket requested does not exist or you do not have permission to view it.
          </p>
          <Link href="/dashboard" className="inline-block text-primary text-xs font-semibold hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const registration = ticket.registration!;
  const event = registration.event!;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const getGoogleCalendarUrl = () => {
    const title = encodeURIComponent(event.title);
    const details = encodeURIComponent(`Your ticket code is ${ticket.ticket_id}. Event details: ${event.short_description}`);
    const location = encodeURIComponent(event.venue);
    
    const formatCalDate = (dStr: string) => {
      const d = new Date(dStr);
      return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const start = formatCalDate(event.date_time);
    const end = formatCalDate(event.end_date_time || new Date(new Date(event.date_time).getTime() + 2 * 60 * 60 * 1000).toISOString());
    
    return `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${location}`;
  };

  const checkinUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/admin/scanner?ticket_id=${ticket.ticket_id}`
    : `http://localhost:3000/admin/scanner?ticket_id=${ticket.ticket_id}`;
    
  const qrCodeImgSrc = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(checkinUrl)}`;

  return (
    <div className="min-h-screen bg-background flex flex-col print:bg-white print:text-black">
      <div className="print:hidden">
        <DashboardNavbar />
      </div>

      <div className="flex-1 max-w-md w-full mx-auto px-6 py-8 space-y-6">
        
        <Link 
          href="/dashboard" 
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-foreground transition-colors print:hidden"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>

        {/* Premium Wallet Pass Ticket */}
        <div className="relative border border-border rounded-[20px] overflow-hidden shadow-2xl bg-card transition-all text-left">
          
          {/* Ticket Header Banner */}
          <div className="relative aspect-[21/9] bg-zinc-950 overflow-hidden">
            <img 
              src={event.banner_url} 
              alt={event.title} 
              className="w-full h-full object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
            <div className="absolute top-4 left-4">
              <span className="px-2.5 py-0.5 rounded-md bg-primary text-white text-[9px] font-bold tracking-wider uppercase">
                {event.category}
              </span>
            </div>
            <div className="absolute bottom-4 left-4 right-4">
              <h2 className="text-white font-extrabold text-lg truncate leading-tight">{event.title}</h2>
              <p className="text-zinc-300 text-[10px] truncate mt-0.5">{event.venue}</p>
            </div>
          </div>

          {/* upper details */}
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-muted">Attendee</span>
                <div className="font-bold text-foreground truncate">{user.name}</div>
              </div>
              <div className="space-y-1">
                <span className="text-muted">PRN Number</span>
                <div className="font-bold text-foreground font-mono">{user.prn || 'N/A'}</div>
              </div>
              <div className="space-y-1 col-span-2">
                <span className="text-muted">Date & Schedule</span>
                <div className="font-bold text-foreground">{formatDateTime(event.date_time)}</div>
              </div>
            </div>
          </div>

          {/* Perforated ticket look */}
          <div className="relative flex items-center justify-between">
            <div className="w-6 h-6 rounded-full bg-background border-r border-border -ml-3 z-10 print:bg-white" />
            <div className="flex-1 border-t border-dashed border-border" />
            <div className="w-6 h-6 rounded-full bg-background border-l border-border -mr-3 z-10 print:bg-white" />
          </div>

          {/* Lower Ticket Segment */}
          <div className="p-6 flex flex-col items-center space-y-5">
            {/* QR Code */}
            <div className="p-3 bg-white border border-border rounded-xl shadow-inner inline-block">
              <img 
                src={qrCodeImgSrc} 
                alt="Ticket QR Code" 
                className="w-40 h-40 object-contain"
              />
            </div>

            <div className="text-center space-y-1">
              <div className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Unique Ticket ID</div>
              <div className="text-sm font-extrabold font-mono text-foreground">{ticket.ticket_id}</div>
            </div>

            <div className="flex items-center gap-6 text-xs border-t border-border/40 w-full pt-4 justify-center">
              <div className="text-center">
                <span className="text-[10px] text-muted block mb-0.5">Registration</span>
                <span className="font-bold text-emerald-500 flex items-center gap-0.5 justify-center">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                </span>
              </div>
              <div className="w-px h-6 bg-border/60" />
              <div className="text-center">
                <span className="text-[10px] text-muted block mb-0.5">Payment</span>
                <span className="font-bold text-emerald-500">
                  {event.price === 0 ? 'Free Event' : 'Paid (₹' + event.price + ')'}
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Action Widgets */}
        <div className="space-y-2.5 print:hidden">
          
          <a
            href={getGoogleCalendarUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 rounded-24 border border-border bg-card hover:bg-zinc-100/50 dark:hover:bg-zinc-800/40 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <CalendarDays className="w-4.5 h-4.5 text-primary" /> Add to Google Calendar
          </a>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleShare}
              className={`py-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                shared ? 'text-emerald-500 border-emerald-500/30 bg-emerald-500/5' : 'border-border bg-card hover:bg-zinc-100/50 dark:hover:bg-zinc-800/40 text-muted-foreground'
              }`}
            >
              {shared ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
              {shared ? 'Link Copied!' : 'Share Pass'}
            </button>

            <button
              onClick={handlePrint}
              className="py-3 rounded-xl border border-border bg-card hover:bg-zinc-100/50 dark:hover:bg-zinc-800/40 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors text-muted-foreground cursor-pointer"
            >
              <Printer className="w-4 h-4 text-zinc-500" /> Print / PDF
            </button>
          </div>

          <div className="flex gap-2 p-3.5 rounded-xl bg-primary/10 border border-primary/20 text-left text-[11px] text-primary leading-normal">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              Show this QR code to any volunteer at the venue doors to mark your attendance and claim your verified certificates.
            </span>
          </div>

        </div>

      </div>
    </div>
  );
}
