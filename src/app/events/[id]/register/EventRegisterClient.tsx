'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardNavbar from '@/components/DashboardNavbar';
import { useAuth } from '@/providers/AuthProvider';
import { CollegeEvent, Registration, Ticket } from '@/lib/data';
import { 
  ArrowLeft, User, Phone, Mail, CreditCard, Sparkles, 
  Trash2, Plus, Info, CheckCircle2, XCircle, Users, Clock, ShieldCheck
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

// Mock Database of Registered College PRNs
const VALID_PRN_LIST = [
  'PRN202410293',
  'PRN202410294',
  'PRN202410295',
  'PRN202410296',
  'PRN202400112',
  'PRN202400113',
  'PRN202400114',
  'PRN202611223'
];

export default function EventRegisterClient({ event }: { event: CollegeEvent }) {
  const { user } = useAuth();
  const router = useRouter();

  // Form states
  const [prnInput, setPrnInput] = useState('');
  const [isVerifyingPrn, setIsVerifyingPrn] = useState(false);
  const [prnVerified, setPrnVerified] = useState(false);
  const [prnCheckFailed, setPrnCheckFailed] = useState(false);

  const [emergencyContact, setEmergencyContact] = useState('');
  const [teamName, setTeamName] = useState('');
  const [teamMembers, setTeamMembers] = useState<{ name: string; prn: string; email: string; phone: string }[]>([]);

  // Page controller states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Waitlist status detection
  const [isWaitlisted, setIsWaitlisted] = useState(false);

  // Cashfree Simulator Modal State
  const [showSimulator, setShowSimulator] = useState(false);
  const [simulatingPayment, setSimulatingPayment] = useState(false);
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setEmergencyContact(user.phone || '');
      if (user.prn) {
        setPrnInput(user.prn);
        // Pre-verify if user has a standard preset PRN
        if (VALID_PRN_LIST.includes(user.prn)) {
          setPrnVerified(true);
        }
      }
    }

    // Determine if event is full to put on waitlist
    if (event.registration_limit) {
      let approvedCount = 0;
      const storedKeys = Object.keys(localStorage).filter(k => k.startsWith('cc_registrations_'));
      storedKeys.forEach((key) => {
        const regs = JSON.parse(localStorage.getItem(key) || '[]');
        const eventRegs = regs.filter((r: any) => r.event_id === event.id && r.status === 'approved');
        approvedCount += eventRegs.length;
      });

      if (approvedCount >= event.registration_limit) {
        setIsWaitlisted(true);
      }
    }
  }, [user, event]);

  if (!user) return null;

  const handleVerifyPRN = () => {
    setIsVerifyingPrn(true);
    setPrnCheckFailed(false);
    
    setTimeout(() => {
      if (VALID_PRN_LIST.includes(prnInput.trim())) {
        setPrnVerified(true);
        setPrnCheckFailed(false);
      } else {
        setPrnVerified(false);
        setPrnCheckFailed(true);
      }
      setIsVerifyingPrn(false);
    }, 900);
  };

  const handleAddMember = () => {
    if (teamMembers.length + 1 >= event.max_team_size) return;
    setTeamMembers([...teamMembers, { name: '', prn: '', email: '', phone: '' }]);
  };

  const handleRemoveMember = (idx: number) => {
    setTeamMembers(teamMembers.filter((_, i) => i !== idx));
  };

  const handleMemberChange = (idx: number, field: string, value: string) => {
    const updated = [...teamMembers];
    updated[idx] = { ...updated[idx], [field]: value };
    setTeamMembers(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prnVerified) {
      setError('Please verify your PRN ID against the college database before registering.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      if (isWaitlisted) {
        const localRegsKey = `cc_registrations_${user.id}`;
        const existingRegs = JSON.parse(localStorage.getItem(localRegsKey) || '[]');
        
        const newReg: Registration = {
          id: `reg-waitlist-${Date.now()}`,
          event_id: event.id,
          student_id: user.id,
          team_name: teamName || null,
          team_members: teamMembers,
          emergency_contact: emergencyContact,
          status: 'waitlisted',
          payment_status: 'unpaid',
          created_at: new Date().toISOString(),
          event
        };
        
        localStorage.setItem(localRegsKey, JSON.stringify([newReg, ...existingRegs]));
        
        const localNotifsKey = `cc_notifications_${user.id}`;
        const existingNotifs = JSON.parse(localStorage.getItem(localNotifsKey) || '[]');
        const newNotif = {
          id: `n-${Date.now()}`,
          user_id: user.id,
          title: 'Added to Waitlist',
          message: `The event ${event.title} is full. You have been added to the waitlist.`,
          type: 'registration',
          is_read: false,
          created_at: new Date().toISOString()
        };
        localStorage.setItem(localNotifsKey, JSON.stringify([newNotif, ...existingNotifs]));

        router.push('/dashboard?status=waitlisted');
        return;
      }

      const approvalRequired = event.approval_required || false;

      const res = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: event.id,
          studentId: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone || '9999999999',
          prn: prnInput,
          department: user.department || 'Computer Science',
          semester: user.semester || '4',
          emergencyContact,
          teamName: event.max_team_size > 1 ? teamName : null,
          teamMembers: event.max_team_size > 1 ? teamMembers : []
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to initialize registration.');
      }

      // CASE A: FREE REGISTRATION
      if (!event.is_paid || event.price === 0) {
        const localRegsKey = `cc_registrations_${user.id}`;
        const existingRegs = JSON.parse(localStorage.getItem(localRegsKey) || '[]');
        
        const newReg: Registration = {
          id: data.registrationId,
          event_id: event.id,
          student_id: user.id,
          team_name: teamName || null,
          team_members: teamMembers,
          emergency_contact: emergencyContact,
          status: approvalRequired ? 'pending' : 'approved',
          payment_status: 'paid',
          created_at: new Date().toISOString(),
          event
        };
        
        localStorage.setItem(localRegsKey, JSON.stringify([newReg, ...existingRegs]));

        if (!approvalRequired) {
          const localTicketsKey = `cc_tickets_${user.id}`;
          const existingTickets = JSON.parse(localStorage.getItem(localTicketsKey) || '[]');
          
          const newTicket: Ticket = {
            id: data.ticketId,
            registration_id: data.registrationId,
            ticket_id: data.ticketCode,
            status: 'active',
            created_at: new Date().toISOString(),
            registration: newReg
          };
          localStorage.setItem(localTicketsKey, JSON.stringify([newTicket, ...existingTickets]));
          router.push(`/tickets/${data.ticketId}?status=success`);
        } else {
          const localNotifsKey = `cc_notifications_${user.id}`;
          const existingNotifs = JSON.parse(localStorage.getItem(localNotifsKey) || '[]');
          const newNotif = {
            id: `n-${Date.now()}`,
            user_id: user.id,
            title: 'Registration Pending Approval',
            message: `Your registration for ${event.title} is pending approval from event organizers.`,
            type: 'registration',
            is_read: false,
            created_at: new Date().toISOString()
          };
          localStorage.setItem(localNotifsKey, JSON.stringify([newNotif, ...existingNotifs]));
          router.push('/dashboard?status=pending_approval');
        }
        return;
      }

      // CASE B: PAID REGISTRATION
      if (data.isMock) {
        setPendingOrderId(data.orderId);
        setShowSimulator(true);
        setIsSubmitting(false);
      } else {
        router.push(`/api/payments/verify?order_id=${data.orderId}`);
      }

    } catch (err: any) {
      setError(err.message || 'An error occurred during registration.');
      setIsSubmitting(false);
    }
  };

  const handleSimulatePayment = async (success: boolean) => {
    if (!pendingOrderId) return;
    setSimulatingPayment(true);

    try {
      const webhookPayload = {
        type: success ? 'PAYMENT_SUCCESS_WEBHOOK' : 'PAYMENT_FAILED_WEBHOOK',
        event_time: new Date().toISOString(),
        data: {
          order: {
            order_id: pendingOrderId,
            order_amount: event.price,
            order_currency: 'INR'
          },
          payment: {
            cf_payment_id: `mock_tx_${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
            payment_status: success ? 'SUCCESS' : 'FAILED',
            payment_amount: event.price,
            payment_method: { upi: { upi_id: `${prnInput || 'student'}@okaxis` } }
          }
        }
      };

      const webhookRes = await fetch('/api/payments/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-webhook-signature': 'mock_valid_signature',
          'x-webhook-timestamp': Date.now().toString()
        },
        body: JSON.stringify(webhookPayload)
      });

      if (!webhookRes.ok) {
        throw new Error('Simulation webhook dispatch failed.');
      }

      router.push(`/api/payments/verify?order_id=${pendingOrderId}`);

    } catch (err: any) {
      setError(err.message || 'Simulation payment error.');
      setSimulatingPayment(false);
      setShowSimulator(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col text-left">
      <DashboardNavbar />

      <div className="flex-1 max-w-2xl w-full mx-auto px-6 py-6 space-y-6">
        
        {/* Back Link */}
        <button 
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-foreground transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Details
        </button>

        {/* Header Summary */}
        <div className="flex items-center gap-4 border-b border-border pb-5">
          <img 
            src={event.banner_url} 
            alt={event.title} 
            className="w-16 h-16 rounded-2xl object-cover border border-border"
          />
          <div>
            <span className="text-[10px] px-2.5 py-0.5 rounded bg-primary/10 text-primary font-bold uppercase tracking-wider">
              {event.category}
            </span>
            <h1 className="text-xl font-extrabold tracking-tight mt-1">Register for {event.title}</h1>
            <p className="text-xs text-zinc-500 mt-0.5">{event.venue}</p>
          </div>
        </div>

        {/* Feedback Alerts */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-100/10 border border-red-500/20 text-red-500 text-xs font-medium">
            {error}
          </div>
        )}

        {isWaitlisted && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex gap-3 text-amber-500 text-xs leading-normal">
            <Clock className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <span className="font-extrabold block">Seats Limit Reached (Waitlist Active)</span>
              This event is fully booked. Submitting registration places you on the waitlist. You will be notified immediately if seats open.
            </div>
          </div>
        )}

        {/* PRN Database Check */}
        <div className="premium-card p-6 bg-card space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold tracking-wider uppercase text-zinc-500 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span>College Database Verification</span>
            </h3>
            {prnVerified && (
              <span className="text-[9px] uppercase font-bold tracking-widest text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Verified Student
              </span>
            )}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={prnInput}
              onChange={(e) => {
                setPrnInput(e.target.value);
                setPrnVerified(false);
                setPrnCheckFailed(false);
              }}
              placeholder="Enter your PRN (e.g. PRN202410293)"
              className="flex-1 bg-background border border-border rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary text-foreground font-mono"
            />
            <button
              type="button"
              onClick={handleVerifyPRN}
              disabled={isVerifyingPrn || prnInput.trim() === ''}
              className="px-5 rounded-xl bg-primary hover:bg-rose-600 text-white text-xs font-bold transition-colors disabled:opacity-50"
            >
              {isVerifyingPrn ? 'Checking...' : 'Verify PRN'}
            </button>
          </div>

          {/* Friendly fail message with Contact Admin button */}
          {prnCheckFailed && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-left text-xs text-red-500 space-y-2.5">
              <p className="font-semibold">PRN Verification Failed</p>
              <p className="text-[11px] leading-normal text-zinc-400">
                We couldn't locate your PRN ID in the central college database catalog. If this is a mistake, please reach out to the campus administration board.
              </p>
              <a
                href="mailto:admin@college.edu?subject=PRN Registry Issue"
                className="inline-block px-4 py-2 rounded-lg bg-red-500 text-white font-bold text-[10px] uppercase hover:bg-red-600 transition-colors"
              >
                Contact Admin
              </a>
            </div>
          )}
        </div>

        {/* Registration Form (Only shows details when PRN is verified) */}
        <AnimatePresence>
          {prnVerified && (
            <motion.form 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              onSubmit={handleSubmit} 
              className="space-y-6"
            >
              
              {/* Pre-filled fields like Google Forms */}
              <div className="premium-card p-6 bg-card space-y-4">
                <h3 className="text-sm font-bold tracking-wider uppercase text-zinc-500 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-primary" />
                  <span>Student Profile (Auto-filled)</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <span className="text-muted">Student Name</span>
                    <input
                      type="text"
                      disabled
                      value={user.name}
                      className="w-full bg-zinc-100/50 dark:bg-zinc-900/50 border border-border/40 rounded-xl px-3 py-2.5 text-zinc-500 cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-muted">College Email</span>
                    <input
                      type="email"
                      disabled
                      value={user.email}
                      className="w-full bg-zinc-100/50 dark:bg-zinc-900/50 border border-border/40 rounded-xl px-3 py-2.5 text-zinc-500 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {/* Emergency Contact field */}
              <div className="premium-card p-6 bg-card space-y-4">
                <h3 className="text-sm font-bold tracking-wider uppercase text-zinc-500 flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-primary" />
                  <span>Required Information</span>
                </h3>

                <div className="space-y-1.5 text-xs text-left">
                  <label className="font-medium text-muted">Emergency Contact Number *</label>
                  <input
                    type="tel"
                    required
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                    placeholder="Parent/Guardian Contact number"
                    className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                  />
                </div>
              </div>

              {/* Team Registration */}
              {event.max_team_size > 1 && (
                <div className="premium-card p-6 bg-card space-y-5">
                  <div className="flex justify-between items-center border-b border-border/60 pb-3">
                    <h3 className="text-sm font-bold tracking-wider uppercase text-zinc-500 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-primary" />
                      <span>Team Composition</span>
                    </h3>
                    <span className="text-[10px] text-zinc-400">
                      Max: {event.max_team_size} members
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-left">
                    <label className="font-medium text-muted">Team Name *</label>
                    <input
                      type="text"
                      required
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      placeholder="e.g. Pixel Pioneers"
                      className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                    />
                  </div>

                  {teamMembers.map((member, i) => (
                    <div key={i} className="p-4 rounded-xl border border-border/80 bg-zinc-50 dark:bg-zinc-900/50 space-y-3 relative text-left">
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(i)}
                        className="absolute top-3.5 right-3.5 p-1 rounded hover:bg-red-500/10 text-zinc-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <span className="text-[10px] font-bold text-zinc-400 uppercase">
                        Member #{i + 2} Details
                      </span>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
                        <input
                          type="text"
                          required
                          value={member.name}
                          onChange={(e) => handleMemberChange(i, 'name', e.target.value)}
                          placeholder="Member Full Name"
                          className="bg-background border border-border rounded-lg px-3 py-2 focus:outline-none"
                        />
                        <input
                          type="text"
                          required
                          value={member.prn}
                          onChange={(e) => handleMemberChange(i, 'prn', e.target.value)}
                          placeholder="PRN ID"
                          className="bg-background border border-border rounded-lg px-3 py-2 focus:outline-none"
                        />
                        <input
                          type="email"
                          required
                          value={member.email}
                          onChange={(e) => handleMemberChange(i, 'email', e.target.value)}
                          placeholder="College Email"
                          className="bg-background border border-border rounded-lg px-3 py-2 focus:outline-none"
                        />
                        <input
                          type="tel"
                          required
                          value={member.phone}
                          onChange={(e) => handleMemberChange(i, 'phone', e.target.value)}
                          placeholder="Mobile Number"
                          className="bg-background border border-border rounded-lg px-3 py-2 focus:outline-none"
                        />
                      </div>
                    </div>
                  ))}

                  {teamMembers.length + 1 < event.max_team_size && (
                    <button
                      type="button"
                      onClick={handleAddMember}
                      className="w-full py-2.5 rounded-xl border border-dashed border-border hover:bg-zinc-100 dark:hover:bg-zinc-800/40 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4" /> Add Team Member
                    </button>
                  )}
                </div>
              )}

              {/* Checkout / Registration submission */}
              <div className="premium-card p-6 bg-card space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted">Total Registration Price</span>
                  <span className="text-2xl font-extrabold text-primary">
                    {event.price === 0 ? 'FREE' : formatCurrency(event.price)}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-24 bg-primary hover:bg-rose-600 text-white font-bold text-sm shadow-md shadow-primary/20 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/35 border-t-white rounded-full animate-spin" />
                  ) : isWaitlisted ? (
                    <>Submit Registration (Waitlist) <Clock className="w-4.5 h-4.5" /></>
                  ) : event.price === 0 ? (
                    <>Complete Free Registration <Sparkles className="w-4.5 h-4.5" /></>
                  ) : (
                    <>Proceed to Cashfree Checkout <CreditCard className="w-4.5 h-4.5" /></>
                  )}
                </button>
              </div>

            </motion.form>
          )}
        </AnimatePresence>
      </div>

      {/* Cashfree Sandbox Payment Simulator Modal */}
      <AnimatePresence>
        {showSimulator && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm" />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-panel w-full max-w-md bg-card/95 backdrop-blur-md rounded-[28px] border border-border shadow-2xl relative overflow-hidden text-center p-6 space-y-6 z-10"
            >
              <div className="flex justify-between items-center border-b border-border pb-3 text-left">
                <div>
                  <h3 className="font-extrabold text-sm text-foreground">Cashfree Sandbox Simulator</h3>
                  <p className="text-[10px] text-zinc-500">Secure Order Verification Payout flow</p>
                </div>
                <span className="px-2 py-0.5 rounded bg-primary/20 text-primary text-[9px] font-bold uppercase">
                  Sandbox
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase font-semibold text-zinc-400">Merchant Account billing</span>
                <div className="text-xl font-bold">{event.title}</div>
                <div className="text-2xl font-extrabold text-primary mt-1">
                  {formatCurrency(event.price)}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/20 flex gap-2.5 text-left text-xs text-primary leading-normal">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  No cashfree credentials are configured in `.env.local`. Simulated transactions trigger local webhook callbacks to auto-generate tickets.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <button
                  type="button"
                  onClick={() => handleSimulatePayment(true)}
                  disabled={simulatingPayment}
                  className="py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex flex-col items-center justify-center gap-1 shadow-md shadow-emerald-500/10 cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Success Payment</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSimulatePayment(false)}
                  disabled={simulatingPayment}
                  className="py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-xs flex flex-col items-center justify-center gap-1 shadow-md shadow-red-500/10 cursor-pointer disabled:opacity-50"
                >
                  <XCircle className="w-5 h-5" />
                  <span>Fail Payment</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
