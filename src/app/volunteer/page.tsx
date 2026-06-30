'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardNavbar from '@/components/DashboardNavbar';
import { useAuth } from '@/providers/AuthProvider';
import { MOCK_EVENTS } from '@/lib/data';
import { 
  UserCog, Calendar, ShieldCheck, Trophy, 
  Clock, QrCode, AlertCircle, FileCheck, Send, CheckCircle2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface VolunteerApplication {
  id: string;
  eventId: string;
  eventTitle: string;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

interface VolunteerShift {
  id: string;
  eventTitle: string;
  role: string;
  start: string;
  end: string;
  status: 'scheduled' | 'checked_in' | 'completed' | 'missed';
}

interface LeaderboardUser {
  rank: number;
  name: string;
  department: string;
  points: number;
  scans: number;
  avatar: string;
}

export default function VolunteerPortal() {
  const { user } = useAuth();
  const router = useRouter();

  // Tab views: ID & Shifts, Leaderboard, Apply
  const [activeTab, setActiveTab] = useState<'shifts' | 'leaderboard' | 'apply'>('shifts');

  // Applications, Shifts state
  const [applications, setApplications] = useState<VolunteerApplication[]>([]);
  const [shifts, setShifts] = useState<VolunteerShift[]>([]);
  const [selectedEvent, setSelectedEvent] = useState(MOCK_EVENTS[0].id);
  const [applyMessage, setApplyMessage] = useState('');
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  // Volunteer metrics
  const [xp, setXp] = useState(0);
  const [totalScans, setTotalScans] = useState(0);

  const localAppsKey = user ? `cc_vol_apps_${user.id}` : '';
  const localShiftsKey = user ? `cc_vol_shifts_${user.id}` : '';

  useEffect(() => {
    if (!user) return;

    // Load applications
    const storedApps = localStorage.getItem(localAppsKey);
    if (storedApps) {
      setApplications(JSON.parse(storedApps));
    } else {
      const initialApps: VolunteerApplication[] = [
        {
          id: 'app-mock-1',
          eventId: 'event-1',
          eventTitle: 'TechnoHack 2026 Hackathon',
          message: 'I am proficient with hardware networks and want to coordinate labs.',
          status: 'approved',
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      setApplications(initialApps);
      localStorage.setItem(localAppsKey, JSON.stringify(initialApps));
    }

    // Load shifts
    const storedShifts = localStorage.getItem(localShiftsKey);
    if (storedShifts) {
      setShifts(JSON.parse(storedShifts));
    } else {
      const initialShifts: VolunteerShift[] = [
        {
          id: 'shift-mock-1',
          eventTitle: 'TechnoHack 2026 Hackathon',
          role: 'Lab Coordinator & Check-in Desk',
          start: '2026-08-14T09:00:00Z',
          end: '2026-08-14T15:00:00Z',
          status: 'scheduled'
        },
        {
          id: 'shift-mock-2',
          eventTitle: 'Generative AI & LLM Workshop',
          role: 'Registrations QR Auditor',
          start: '2026-07-20T09:30:00Z',
          end: '2026-07-20T16:30:00Z',
          status: 'completed'
        }
      ];
      setShifts(initialShifts);
      localStorage.setItem(localShiftsKey, JSON.stringify(initialShifts));
    }

    // Dynamic XP / scan stats based on completed shifts
    setXp(120);
    setTotalScans(54);

  }, [user, localAppsKey, localShiftsKey]);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !applyMessage) return;

    const event = MOCK_EVENTS.find(evt => evt.id === selectedEvent);
    const newApp: VolunteerApplication = {
      id: `app-${Date.now()}`,
      eventId: selectedEvent,
      eventTitle: event?.title || 'Event',
      message: applyMessage,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    const updated = [newApp, ...applications];
    setApplications(updated);
    localStorage.setItem(localAppsKey, JSON.stringify(updated));
    setApplyMessage('');
    setAppliedSuccess(true);
    setTimeout(() => setAppliedSuccess(false), 3000);
  };

  if (!user) return null;

  // Mock Leaderboard Data
  const LEADERBOARD: LeaderboardUser[] = [
    { rank: 1, name: 'Ananya Nair', department: 'Computer Science', points: 450, scans: 210, avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Ananya' },
    { rank: 2, name: 'Rohan Das', department: 'Electronics', points: 380, scans: 180, avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Rohan' },
    { rank: 3, name: 'Aditya Sen', department: 'Information Tech', points: 300, scans: 140, avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Aditya' },
    { rank: 4, name: 'Sneha Patil', department: 'Computer Science', points: 280, scans: 124, avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Sneha' },
    { rank: 5, name: user.name, department: user.department || 'Student', points: xp, scans: totalScans, avatar: user.avatar_url || 'https://api.dicebear.com/7.x/adventurer/svg?seed=' + user.name },
  ].sort((a, b) => b.points - a.points).map((item, index) => ({ ...item, rank: index + 1 }));

  const userRank = LEADERBOARD.find(item => item.name === user.name)?.rank || 5;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <DashboardNavbar />

      <div className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-8">
        
        {/* Header Hero */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-pink-500 uppercase tracking-widest bg-pink-500/10 px-2.5 py-0.5 rounded-md">
                Volunteer Center
              </span>
              <span className="text-xs text-muted">Coordinate and Assist Event Operations</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight mt-1">Volunteer Portal</h1>
            <p className="text-sm text-zinc-500 mt-1">Claim shifts, view your official barcode ID, and review leaderboard XP.</p>
          </div>

          <div className="flex gap-4.5 bg-card/65 border border-border/80 px-4 py-2.5 rounded-2xl shadow-sm items-center">
            <div className="text-center">
              <div className="text-xs text-zinc-400">Hours Completed</div>
              <div className="text-lg font-extrabold text-foreground mt-0.5">14.5 hrs</div>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="text-center">
              <div className="text-xs text-zinc-400">Total Scans</div>
              <div className="text-lg font-extrabold text-foreground mt-0.5">{totalScans} scans</div>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="text-center">
              <div className="text-xs text-zinc-400">Rank</div>
              <div className="text-lg font-extrabold text-pink-500 mt-0.5">#{userRank}</div>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="border-b border-border/80 flex gap-6 text-sm font-medium">
          <button
            onClick={() => setActiveTab('shifts')}
            className={`pb-3 border-b-2 transition-all cursor-pointer ${activeTab === 'shifts' ? 'border-pink-500 text-pink-500 font-bold' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          >
            My Badge & Shifts
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`pb-3 border-b-2 transition-all cursor-pointer ${activeTab === 'leaderboard' ? 'border-pink-500 text-pink-500 font-bold' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          >
            Volunteer Leaderboard
          </button>
          <button
            onClick={() => setActiveTab('apply')}
            className={`pb-3 border-b-2 transition-all cursor-pointer ${activeTab === 'apply' ? 'border-pink-500 text-pink-500 font-bold' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          >
            Apply for Events
          </button>
        </div>

        {/* Dynamic Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Panel Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {activeTab === 'shifts' && (
              <div className="space-y-6">
                {/* Active Shifts */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold tracking-tight flex items-center gap-2">
                    <Clock className="w-4.5 h-4.5 text-pink-500" />
                    <span>Designated Duty Shifts</span>
                  </h3>

                  {shifts.length === 0 ? (
                    <div className="premium-card p-8 text-center text-sm text-zinc-400">
                      No scheduled shifts assigned yet.
                    </div>
                  ) : (
                    <div className="space-y-3.5">
                      {shifts.map((shift) => (
                        <div 
                          key={shift.id}
                          className="premium-card p-5 bg-card/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-pink-500/20 transition-all border-l-4 border-l-pink-500"
                        >
                          <div className="space-y-1.5 text-left min-w-0">
                            <h4 className="font-extrabold text-sm text-foreground">{shift.eventTitle}</h4>
                            <p className="text-xs text-muted-foreground">Responsibility: <strong>{shift.role}</strong></p>
                            <span className="text-[10px] text-zinc-400 block font-mono">
                              {new Date(shift.start).toLocaleString()} - {new Date(shift.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                            shift.status === 'scheduled'
                              ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                              : shift.status === 'checked_in'
                              ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20'
                              : shift.status === 'completed'
                              ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                              : 'bg-red-500/10 text-red-500 border border-red-500/20'
                          }`}>
                            {shift.status.replace('_', ' ')}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'leaderboard' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold tracking-tight flex items-center gap-2">
                  <Trophy className="w-4.5 h-4.5 text-yellow-500" />
                  <span>Top Volunteers Standing</span>
                </h3>

                <div className="premium-card overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-zinc-100/50 dark:bg-zinc-900/50 text-zinc-500 border-b border-border/60">
                        <tr>
                          <th className="p-4 font-bold text-center w-16">Rank</th>
                          <th className="p-4 font-bold">Volunteer</th>
                          <th className="p-4 font-bold">Department</th>
                          <th className="p-4 font-bold text-center">Tickets Scanned</th>
                          <th className="p-4 font-bold text-center">XP Earned</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/40">
                        {LEADERBOARD.map((item) => (
                          <tr 
                            key={item.name} 
                            className={`hover:bg-zinc-100/30 dark:hover:bg-zinc-800/20 transition-colors ${
                              item.name === user.name ? 'bg-pink-500/5 dark:bg-pink-500/10 font-bold' : ''
                            }`}
                          >
                            <td className="p-4 text-center">
                              <span className={`w-6 h-6 rounded-full flex items-center justify-center mx-auto text-[10px] font-extrabold ${
                                item.rank === 1 
                                  ? 'bg-yellow-500 text-zinc-955'
                                  : item.rank === 2
                                  ? 'bg-zinc-300 text-zinc-955'
                                  : item.rank === 3
                                  ? 'bg-amber-600 text-white'
                                  : 'text-muted-foreground'
                              }`}>
                                #{item.rank}
                              </span>
                            </td>
                            <td className="p-4 flex items-center gap-2.5">
                              <img src={item.avatar} alt={item.name} className="w-6 h-6 rounded-full border border-border" />
                              <span>{item.name} {item.name === user.name && '(You)'}</span>
                            </td>
                            <td className="p-4 text-zinc-400">{item.department}</td>
                            <td className="p-4 text-center font-semibold">{item.scans}</td>
                            <td className="p-4 text-center font-extrabold text-pink-500">{item.points} XP</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'apply' && (
              <div className="space-y-6">
                <div className="premium-card p-6 bg-card border-border/80 space-y-4">
                  <h3 className="font-extrabold text-sm text-foreground flex items-center gap-1.5">
                    <Send className="w-4 h-4 text-pink-500" />
                    <span>Apply for Upcoming Events Coordinator</span>
                  </h3>

                  <form onSubmit={handleApply} className="space-y-4 text-xs text-left">
                    <div className="space-y-1.5">
                      <label className="font-semibold text-muted">Select Event Scope *</label>
                      <select
                        value={selectedEvent}
                        onChange={(e) => setSelectedEvent(e.target.value)}
                        className="w-full bg-background border border-border rounded-xl px-2.5 py-2.5 text-muted-foreground font-semibold"
                      >
                        {MOCK_EVENTS.map(e => (
                          <option key={e.id} value={e.id}>{e.title}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-semibold text-muted">Briefly state why you want to volunteer *</label>
                      <textarea
                        required
                        rows={4}
                        value={applyMessage}
                        onChange={(e) => setApplyMessage(e.target.value)}
                        placeholder="Detail any past check-in desk experiences or support skills..."
                        className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-pink-500/40"
                      />
                    </div>

                    <AnimatePresence>
                      {appliedSuccess && (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 5 }}
                          className="p-3 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-xs rounded-xl flex items-center gap-2"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Volunteer application submitted successfully! Pending admin approval.</span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <button
                      type="submit"
                      className="w-full py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-24 font-semibold shadow-sm transition-colors cursor-pointer"
                    >
                      Submit Application
                    </button>
                  </form>
                </div>

                {/* Applications status list */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-zinc-400">Application History</h3>
                  
                  {applications.length === 0 ? (
                    <p className="text-xs text-zinc-500">No applications filed yet.</p>
                  ) : (
                    applications.map((app) => (
                      <div key={app.id} className="p-4 bg-card rounded-2xl border border-border/60 flex justify-between items-center text-xs text-left">
                        <div>
                          <div className="font-bold text-foreground">{app.eventTitle}</div>
                          <p className="text-[10px] text-zinc-400 mt-1">{app.message}</p>
                          <span className="text-[9px] text-zinc-500 font-mono mt-1 block">Filed: {new Date(app.createdAt).toLocaleDateString()}</span>
                        </div>
                        
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                          app.status === 'approved'
                            ? 'bg-emerald-500/10 text-emerald-500'
                            : app.status === 'pending'
                            ? 'bg-amber-500/10 text-amber-500'
                            : 'bg-red-500/10 text-red-500'
                        }`}>
                          {app.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

          </div>

          {/* Right Column: Visual Volunteer badge */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold tracking-tight text-left">My Volunteer ID</h3>

            <div className="premium-card p-6 bg-gradient-to-br from-pink-500/20 via-card to-zinc-950/80 border border-pink-500/35 rounded-3xl relative overflow-hidden shadow-xl text-center flex flex-col items-center space-y-6">
              {/* Gloss element */}
              <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-pink-500/20 blur-xl" />

              <div className="flex items-center gap-2 justify-center border-b border-border/80 pb-4 w-full">
                <div className="w-8 h-8 rounded-lg bg-pink-500 flex items-center justify-center text-white font-bold text-sm">
                  CC
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-foreground tracking-wide">CampusConnect Staff</h4>
                  <p className="text-[9px] text-zinc-500 uppercase tracking-widest mt-0.5">Delegate credential</p>
                </div>
              </div>

              {/* Photo */}
              <div className="relative">
                <img 
                  src={user.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.name}`} 
                  alt={user.name} 
                  className="w-20 h-20 rounded-full border-2 border-pink-500 shadow-md"
                />
                <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-card" />
              </div>

              <div className="space-y-1">
                <h4 className="font-extrabold text-base text-foreground leading-snug">{user.name}</h4>
                <p className="text-xs text-zinc-400 font-mono">PRN: {user.prn || 'N/A'}</p>
                <span className="inline-block text-[10px] px-2 py-0.5 rounded bg-pink-500/10 text-pink-500 font-bold border border-pink-500/20 mt-1 uppercase">
                  {user.role}
                </span>
              </div>

              {/* QR Barcode */}
              <div className="p-3 bg-white rounded-xl shadow-inner border border-zinc-200">
                <QrCode className="w-24 h-24 text-zinc-950" />
              </div>

              <p className="text-[9px] text-zinc-500 leading-normal">
                Present this QR code to the main organizer at the door to check in for your scheduled shifts.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
