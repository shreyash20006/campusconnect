'use client';

import React, { useState, useEffect } from 'react';
import { MOCK_EVENTS } from '@/lib/data';
import { 
  UserCog, Trash2, CheckCircle2, XCircle, Clock, 
  UserCheck, Award, AlertCircle, PlusCircle, Calendar 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface VolunteerApplication {
  id: string;
  studentName: string;
  email: string;
  eventTitle: string;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  studentId: string;
}

interface VolunteerAssignment {
  id: string;
  studentName: string;
  email: string;
  eventTitle: string;
  roleDescription: string;
}

export default function AdminVolunteersPage() {
  const [volunteers, setVolunteers] = useState<VolunteerAssignment[]>([]);
  const [applications, setApplications] = useState<VolunteerApplication[]>([]);
  const [activeTab, setActiveTab] = useState<'assignments' | 'applications' | 'shifts'>('assignments');

  // Shift manager states
  const [selectedVol, setSelectedVol] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(MOCK_EVENTS[0].id);
  const [shiftRole, setShiftRole] = useState('Front Desk QR Scanner');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  // Form assign states
  const [volName, setVolName] = useState('');
  const [volEmail, setVolEmail] = useState('');
  const [volRole, setVolRole] = useState('Check-In QR Scanner');

  useEffect(() => {
    // Load active assignments
    const storedVols = localStorage.getItem('cc_admin_volunteers');
    if (storedVols) {
      setVolunteers(JSON.parse(storedVols));
    } else {
      const initial = [
        {
          id: 'asg-1',
          studentName: 'Rohan Das',
          email: 'rohan.das@campusconnect.edu',
          eventTitle: 'TechnoHack 2026 Hackathon',
          roleDescription: 'Entrance QR Code Scanner & Swag distributor'
        },
        {
          id: 'asg-2',
          studentName: 'Sneha Patil',
          email: 'sneha.patil@campusconnect.edu',
          eventTitle: 'Spandan Cultural Night & Concert',
          roleDescription: 'OAT Backstage entry auditor'
        }
      ];
      setVolunteers(initial);
      localStorage.setItem('cc_admin_volunteers', JSON.stringify(initial));
    }

    // Load applications from students
    // We try to pull from dynamic key or mock some applications
    const initialApps: VolunteerApplication[] = [
      {
        id: 'app-admin-1',
        studentName: 'Sneha Patil',
        email: 'sneha.patil@campusconnect.edu',
        eventTitle: 'Generative AI & LLM Workshop',
        message: 'I would like to volunteer as a lab coordinator since I finished the advanced Python module.',
        status: 'pending',
        studentId: 'volunteer-uuid-3333-4444'
      },
      {
        id: 'app-admin-2',
        studentName: 'Rahul Verma',
        email: 'rahul.verma@campusconnect.edu',
        eventTitle: 'National Robotics Challenge',
        message: 'Robotics enthusiast here, can coordinate arenas and match boards.',
        status: 'pending',
        studentId: 'mock-uuid-rahul'
      }
    ];
    setApplications(initialApps);
  }, []);

  const saveAssignments = (list: VolunteerAssignment[]) => {
    setVolunteers(list);
    localStorage.setItem('cc_admin_volunteers', JSON.stringify(list));
  };

  const handleAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!volName || !volEmail) return;

    const event = MOCK_EVENTS.find(evt => evt.id === selectedEvent);
    const newAssignment: VolunteerAssignment = {
      id: `asg-${Date.now()}`,
      studentName: volName,
      email: volEmail,
      eventTitle: event?.title || 'Event',
      roleDescription: volRole
    };

    saveAssignments([newAssignment, ...volunteers]);
    setVolName('');
    setVolEmail('');
    setVolRole('Check-In QR Scanner');
  };

  const handleUnassign = (id: string) => {
    saveAssignments(volunteers.filter(v => v.id !== id));
  };

  const handleApproveApp = (appId: string) => {
    const updatedApps = applications.map(app => 
      app.id === appId ? { ...app, status: 'approved' as const } : app
    );
    setApplications(updatedApps);

    // Also auto-add approved volunteer to assignments
    const app = applications.find(a => a.id === appId);
    if (app) {
      const newAsg: VolunteerAssignment = {
        id: `asg-${Date.now()}`,
        studentName: app.studentName,
        email: app.email,
        eventTitle: app.eventTitle,
        roleDescription: 'Event Logistics Assistant'
      };
      saveAssignments([newAsg, ...volunteers]);

      // Push shift to student local storage
      const studentShiftsKey = `cc_vol_shifts_${app.studentId}`;
      const existingShifts = JSON.parse(localStorage.getItem(studentShiftsKey) || '[]');
      const newShift = {
        id: `shift-${Date.now()}`,
        eventTitle: app.eventTitle,
        role: 'Event Logistics Assistant',
        start: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        end: new Date(Date.now() + 2.5 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'scheduled'
      };
      localStorage.setItem(studentShiftsKey, JSON.stringify([newShift, ...existingShifts]));
    }
  };

  const handleRejectApp = (appId: string) => {
    const updatedApps = applications.map(app => 
      app.id === appId ? { ...app, status: 'rejected' as const } : app
    );
    setApplications(updatedApps);
  };

  const handleCreateShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVol || !startTime || !endTime) return;

    const volunteer = volunteers.find(v => v.id === selectedVol);
    const event = MOCK_EVENTS.find(evt => evt.id === selectedEvent);

    if (volunteer && event) {
      // Simulate shift assignment
      alert(`Shift assigned to ${volunteer.studentName} for ${event.title}`);
      
      // Reset
      setStartTime('');
      setEndTime('');
    }
  };

  const pendingCount = applications.filter(a => a.status === 'pending').length;

  return (
    <div className="space-y-6 text-left">
      
      {/* Top Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Volunteer Administration</h1>
        <p className="text-sm text-zinc-500 mt-1">Approve applications, coordinate shifts, and delegate duties.</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-border/80 flex gap-6 text-sm font-medium">
        <button
          onClick={() => setActiveTab('assignments')}
          className={`pb-3 border-b-2 transition-all cursor-pointer ${activeTab === 'assignments' ? 'border-primary text-primary font-bold' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          Staff Assignments
        </button>
        <button
          onClick={() => setActiveTab('applications')}
          className={`pb-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${activeTab === 'applications' ? 'border-primary text-primary font-bold' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          <span>Applications</span>
          {pendingCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
              {pendingCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('shifts')}
          className={`pb-3 border-b-2 transition-all cursor-pointer ${activeTab === 'shifts' ? 'border-primary text-primary font-bold' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          Shift Planner
        </button>
      </div>

      {/* Active Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {activeTab === 'assignments' && (
          <>
            {/* Assignment form */}
            <div className="space-y-6">
              <div className="premium-card p-6 bg-card border-border/80 space-y-4">
                <h3 className="font-extrabold text-sm text-foreground flex items-center gap-1.5">
                  <UserCheck className="w-4.5 h-4.5 text-blue-500" />
                  <span>Assign Volunteer Direct</span>
                </h3>

                <form onSubmit={handleAssign} className="space-y-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-muted">Select Event *</label>
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
                    <label className="font-semibold text-muted">Volunteer Full Name *</label>
                    <input
                      type="text"
                      required
                      value={volName}
                      onChange={(e) => setVolName(e.target.value)}
                      placeholder="e.g.Sneha Patil"
                      className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-muted">College Email *</label>
                    <input
                      type="email"
                      required
                      value={volEmail}
                      onChange={(e) => setVolEmail(e.target.value)}
                      placeholder="sneha.patil@campusconnect.edu"
                      className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-muted">Role Description *</label>
                    <input
                      type="text"
                      required
                      value={volRole}
                      onChange={(e) => setVolRole(e.target.value)}
                      placeholder="e.g. Front Gate QR Check-in"
                      className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-24 bg-primary hover:bg-blue-600 text-white font-semibold shadow-sm transition-colors cursor-pointer"
                  >
                    Assign Staff Credentials
                  </button>
                </form>
              </div>
            </div>

            {/* Assignments list */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-lg font-bold tracking-tight">Active Staff</h2>
              
              {volunteers.length === 0 ? (
                <div className="premium-card p-12 text-center text-sm text-zinc-400">
                  No active assignments.
                </div>
              ) : (
                <div className="space-y-3">
                  {volunteers.map((v) => (
                    <div key={v.id} className="premium-card p-5 bg-card flex items-center justify-between gap-4 border-l-4 border-l-blue-500">
                      <div className="space-y-1 text-left">
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-sm">{v.studentName}</h4>
                          <span className="text-[10px] text-zinc-500 font-mono">({v.email})</span>
                        </div>
                        <div className="text-[11px] text-zinc-400">Event: {v.eventTitle}</div>
                        <p className="text-xs text-zinc-500 italic mt-0.5">Role: <span className="font-bold text-foreground not-italic">{v.roleDescription}</span></p>
                      </div>

                      <button
                        onClick={() => handleUnassign(v.id)}
                        className="p-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'applications' && (
          <div className="lg:col-span-3 space-y-4">
            <h2 className="text-lg font-bold tracking-tight">Pending Volunteer Requests</h2>
            
            {applications.filter(a => a.status === 'pending').length === 0 ? (
              <div className="premium-card p-12 text-center text-sm text-zinc-400">
                No pending volunteer applications. All caught up!
              </div>
            ) : (
              <div className="space-y-4">
                {applications.filter(a => a.status === 'pending').map((app) => (
                  <div key={app.id} className="premium-card p-5 bg-card flex flex-col md:flex-row justify-between gap-4 text-xs text-left">
                    <div className="space-y-1.5 max-w-xl">
                      <div className="flex items-center gap-2.5">
                        <h4 className="font-extrabold text-sm text-foreground">{app.studentName}</h4>
                        <span className="text-[10px] text-zinc-500 font-mono">{app.email}</span>
                      </div>
                      <div className="font-semibold text-blue-500">Requested Event: {app.eventTitle}</div>
                      <p className="text-zinc-500 leading-normal bg-zinc-100/30 dark:bg-zinc-900/30 p-2.5 rounded-xl border border-border/40 mt-1">
                        "{app.message}"
                      </p>
                    </div>

                    <div className="flex gap-2 items-center shrink-0 self-end md:self-center">
                      <button
                        onClick={() => handleApproveApp(app.id)}
                        className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Approve
                      </button>
                      <button
                        onClick={() => handleRejectApp(app.id)}
                        className="px-3.5 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <XCircle className="w-4 h-4" /> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'shifts' && (
          <>
            {/* Shift Planner form */}
            <div className="space-y-6">
              <div className="premium-card p-6 bg-card border-border/80 space-y-4">
                <h3 className="font-extrabold text-sm text-foreground flex items-center gap-1.5">
                  <Clock className="w-4.5 h-4.5 text-blue-500" />
                  <span>Assign Shift Timings</span>
                </h3>

                <form onSubmit={handleCreateShift} className="space-y-4 text-xs text-left">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-muted">Select Active Volunteer *</label>
                    <select
                      value={selectedVol}
                      onChange={(e) => setSelectedVol(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-2.5 py-2.5 text-muted-foreground font-semibold"
                    >
                      <option value="">-- Choose Staff --</option>
                      {volunteers.map(v => (
                        <option key={v.id} value={v.id}>{v.studentName} ({v.eventTitle.substring(0,10)}...)</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-muted">Select Event *</label>
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
                    <label className="font-semibold text-muted">Responsibility assigned *</label>
                    <input
                      type="text"
                      required
                      value={shiftRole}
                      onChange={(e) => setShiftRole(e.target.value)}
                      placeholder="e.g. Front Gate QR Check-in"
                      className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-muted">Shift Start Time *</label>
                    <input
                      type="datetime-local"
                      required
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs text-foreground focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-muted">Shift End Time *</label>
                    <input
                      type="datetime-local"
                      required
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs text-foreground focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-24 bg-primary hover:bg-blue-600 text-white font-semibold shadow-sm transition-colors cursor-pointer"
                  >
                    Create Shift Schedule
                  </button>
                </form>
              </div>
            </div>

            {/* Shift Logs list */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-lg font-bold tracking-tight">Scheduled Shifts Log</h2>
              
              <div className="premium-card p-5 bg-card space-y-3.5 text-xs text-left">
                <div className="flex justify-between items-center border-b border-border pb-2.5">
                  <span className="font-bold">Shift Schedule</span>
                  <span className="text-[10px] text-zinc-400 font-mono">Today's active shifts</span>
                </div>
                
                <div className="space-y-3">
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-border/40 flex justify-between items-center">
                    <div>
                      <div className="font-bold text-foreground">Rohan Das</div>
                      <p className="text-[10px] text-zinc-400">Front Desk Check-in | TechnoHack 2026</p>
                      <span className="text-[9px] text-zinc-500 font-mono mt-1 block">Shift: 09:00 AM - 03:00 PM</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 font-bold border border-blue-500/20 text-[9px] uppercase tracking-wider">
                      Scheduled
                    </span>
                  </div>

                  <div className="p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-border/40 flex justify-between items-center">
                    <div>
                      <div className="font-bold text-foreground">Sneha Patil</div>
                      <p className="text-[10px] text-zinc-400">Lab Assistant | TechnoHack 2026</p>
                      <span className="text-[9px] text-zinc-500 font-mono mt-1 block">Shift: 10:00 AM - 04:00 PM</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-500 font-bold border border-purple-500/20 text-[9px] uppercase tracking-wider">
                      Checked In
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

      </div>

    </div>
  );
}
