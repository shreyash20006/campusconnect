'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth, UserRole } from '@/providers/AuthProvider';
import { ShieldCheck, ArrowLeft, Mail, Lock, User, BookOpen, Key, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const DEPARTMENTS = [
  'Computer Science & Engineering',
  'Electronics & Communication',
  'Electrical & Electronics',
  'Mechanical Engineering',
  'Information Technology',
  'Civil Engineering',
  'Business Administration'
];

const SEMESTERS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];

function AuthContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, signIn, signUp, isLoading } = useAuth();
  
  const initialTab = searchParams.get('tab') === 'register' ? 'register' : 'login';
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'recovery'>(initialTab);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [prn, setPrn] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [semester, setSemester] = useState(SEMESTERS[0]);
  const [role, setRole] = useState<UserRole>('student');

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Redirect if already logged in
  useEffect(() => {
    if (user && !isLoading) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      if (activeTab === 'login') {
        if (!email) throw new Error('Please enter your email address');
        await signIn(email, role);
        setSuccess('Success! Signing you in...');
      } else if (activeTab === 'register') {
        if (!email || !name || !prn || !phone) {
          throw new Error('Please fill in all required fields');
        }
        if (!/^[A-Za-z0-9]+$/.test(prn)) {
          throw new Error('PRN must be alphanumeric');
        }
        await signUp(email, name, prn, department, semester, role);
        setSuccess('Account created successfully! Logging you in...');
      } else {
        // Recovery
        if (!email) throw new Error('Please enter your email address');
        setSuccess('Mock recovery link sent! Check your inbox.');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    }
  };

  const handleQuickSignIn = async (selectedRole: UserRole) => {
    setError(null);
    setSuccess(null);
    try {
      let emailAddr = '';
      if (selectedRole === 'student') emailAddr = 'aditya.sharma@campusconnect.edu';
      else if (selectedRole === 'volunteer') emailAddr = 'rohan.das@campusconnect.edu';
      else if (selectedRole === 'event_organizer') emailAddr = 'priya.mehta@campusconnect.edu';
      else if (selectedRole === 'admin') emailAddr = 'admin.events@campusconnect.edu';
      else if (selectedRole === 'super_admin') emailAddr = 'superadmin@campusconnect.edu';

      await signIn(emailAddr, selectedRole);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative bg-grid-pattern">
      {/* Background decoration */}
      <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-blue-500/5 blur-[80px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 rounded-full bg-purple-500/5 blur-[80px] pointer-events-none" />

      {/* Back button */}
      <div className="absolute top-6 left-6">
        <Link 
          href="/" 
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-foreground transition-colors px-3 py-1.5 rounded-xl border border-border bg-card shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4">
        <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-premium items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/20 mb-4 animate-float">
          CC
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight">Welcome to CampusConnect</h2>
        <p className="mt-2 text-sm text-muted">
          Your portal to college hackathons, fests, and digital credentials.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg px-4">
        <div className="glass-panel premium-card p-6 sm:p-8 backdrop-blur-md">
          {/* Tab Selector */}
          {activeTab !== 'recovery' && (
            <div className="grid grid-cols-2 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-border/40 mb-6">
              <button
                onClick={() => { setActiveTab('login'); setError(null); }}
                className={`py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                  activeTab === 'login'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted hover:text-foreground'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setActiveTab('register'); setError(null); }}
                className={`py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                  activeTab === 'register'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted hover:text-foreground'
                }`}
              >
                Register
              </button>
            </div>
          )}

          {/* Feedback Alerts */}
          {error && (
            <div className="mb-4 p-3.5 rounded-xl bg-red-100/10 border border-red-500/20 text-red-500 text-xs font-medium">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3.5 rounded-xl bg-emerald-100/10 border border-emerald-500/20 text-emerald-500 text-xs font-medium">
              {success}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {activeTab === 'register' && (
              <>
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-medium text-muted mb-1.5">Full Name *</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 w-4 h-4 text-zinc-400" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Aditya Sharma"
                      className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* PRN Code */}
                  <div>
                    <label className="block text-xs font-medium text-muted mb-1.5">PRN (Student ID) *</label>
                    <input
                      type="text"
                      required
                      value={prn}
                      onChange={(e) => setPrn(e.target.value)}
                      placeholder="PRN2024102"
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-medium text-muted mb-1.5">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="9876543210"
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Department */}
                  <div>
                    <label className="block text-xs font-medium text-muted mb-1.5">Department *</label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                    >
                      {DEPARTMENTS.map((dept) => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>

                  {/* Semester */}
                  <div>
                    <label className="block text-xs font-medium text-muted mb-1.5">Semester *</label>
                    <select
                      value={semester}
                      onChange={(e) => setSemester(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                    >
                      {SEMESTERS.map((sem) => (
                        <option key={sem} value={sem}>{sem}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* Email Address */}
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">Email Address *</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@campusconnect.edu"
                  className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
              </div>
            </div>

            {/* Password */}
            {activeTab === 'login' && (
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-medium text-muted">Password *</label>
                  <button
                    type="button"
                    onClick={() => { setActiveTab('recovery'); setError(null); }}
                    className="text-[11px] text-primary hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                </div>
              </div>
            )}

            {/* Role Assignment Selector (Mock simulator helpers) */}
            {activeTab !== 'recovery' && (
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Simulator Default Role (Mock Mode Only)
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full bg-zinc-100 dark:bg-zinc-900 border border-border/80 rounded-xl px-3 py-2.5 text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-muted-foreground font-medium"
                >
                  <option value="student">Student (Standard user)</option>
                  <option value="volunteer">Volunteer (Ticket scanner)</option>
                  <option value="event_organizer">Event Organizer (Create events, view settlements)</option>
                  <option value="admin">College Administrator (Full access)</option>
                  <option value="super_admin">Super Admin Principal (All rights)</option>
                </select>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-24 bg-primary hover:bg-blue-600 text-white font-semibold text-sm transition-all shadow-md shadow-blue-500/25 hover:shadow-blue-500/35 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : activeTab === 'login' ? (
                <>Sign In <Sparkles className="w-4 h-4" /></>
              ) : activeTab === 'register' ? (
                'Create Account'
              ) : (
                'Send Recovery Instructions'
              )}
            </button>
          </form>

          {/* Recovery Back link */}
          {activeTab === 'recovery' && (
            <button
              onClick={() => { setActiveTab('login'); setError(null); }}
              className="mt-4 w-full text-center text-xs font-semibold text-muted hover:text-foreground transition-colors"
            >
              Back to Sign In
            </button>
          )}

          {/* Third-party divider */}
          <div className="my-6 flex items-center justify-between gap-3 text-xs text-zinc-400">
            <div className="h-px bg-border flex-1" />
            <span>OR EVALUATE DEMO ROLES INSTANTLY</span>
            <div className="h-px bg-border flex-1" />
          </div>

          {/* Quick Sign In Badges */}
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleQuickSignIn('student')}
                className="py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-border/80 text-[11px] font-semibold hover:border-blue-500/40 text-center transition-all cursor-pointer"
              >
                Student Demo
              </button>
              <button
                onClick={() => handleQuickSignIn('volunteer')}
                className="py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-border/80 text-[11px] font-semibold hover:border-blue-500/40 text-center transition-all cursor-pointer"
              >
                Volunteer Demo
              </button>
              <button
                onClick={() => handleQuickSignIn('event_organizer')}
                className="py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-border/80 text-[11px] font-semibold hover:border-blue-500/40 text-center transition-all cursor-pointer"
              >
                Organizer Demo
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleQuickSignIn('admin')}
                className="py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-border/80 text-[11px] font-semibold hover:border-blue-500/40 text-center transition-all cursor-pointer"
              >
                Dean (Admin)
              </button>
              <button
                onClick={() => handleQuickSignIn('super_admin')}
                className="py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-border/80 text-[11px] font-semibold hover:border-blue-500/40 text-center transition-all cursor-pointer"
              >
                Principal (Super Admin)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#09090b] text-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <AuthContent />
    </Suspense>
  );
}
