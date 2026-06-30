'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth, UserRole } from '@/providers/AuthProvider';
import { ShieldCheck, ArrowLeft, Mail, Lock, User, Sparkles, GraduationCap, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

  // TGPCop SSO Portal States
  const [showTgpcopSSO, setShowTgpcopSSO] = useState(false);
  const [ssoEmail, setSsoEmail] = useState('council.president@tgpcop.edu');
  const [ssoRole, setSsoRole] = useState<UserRole>('event_organizer');
  const [ssoLoading, setSsoLoading] = useState(false);

  // Google Login States
  const [showGoogleSSO, setShowGoogleSSO] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

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

  // Handler for custom TGPCop Council login
  const handleTgpcopSSOSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSsoLoading(true);
    setError(null);

    try {
      // Simulate OAuth redirect or authorization flow
      setTimeout(async () => {
        await signIn(ssoEmail, ssoRole);
        
        // Log transaction to audit trail
        const logs = JSON.parse(localStorage.getItem('cc_audit_logs') || '[]');
        logs.unshift({
          id: `audit-${Date.now()}`,
          action: 'SSO_LOGIN_SUCCESS',
          user: ssoEmail,
          details: `Authenticated via TGPCop Council Identity Provider. Role authorized: ${ssoRole.toUpperCase()}`,
          time: new Date().toISOString()
        });
        localStorage.setItem('cc_audit_logs', JSON.stringify(logs));
        
        setSsoLoading(false);
        setShowTgpcopSSO(false);
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'SSO Handshake failed.');
      setSsoLoading(false);
    }
  };

  // Handler for simulated Google login
  const handleGoogleLoginSubmit = () => {
    setGoogleLoading(true);
    setTimeout(async () => {
      await signIn('aditya.sharma@gmail.com', 'student');
      setGoogleLoading(false);
      setShowGoogleSSO(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative bg-grid-pattern text-left">
      {/* Background decoration */}
      <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-primary/5 blur-[80px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 rounded-full bg-purple-500/5 blur-[80px] pointer-events-none" />

      {/* Back button */}
      <div className="absolute top-6 left-6">
        <Link 
          href="/" 
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-foreground transition-colors px-3 py-1.5 rounded-xl border border-border bg-card shadow-sm cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Catalog
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4">
        <img 
          src="https://res.cloudinary.com/dsqxboxoc/image/upload/v1782801547/campus_logo_oj2pcn.png" 
          alt="CampusConnect Logo" 
          className="w-12 h-12 object-contain mx-auto mb-4 animate-float"
        />
        <h2 className="text-3xl font-extrabold tracking-tight">Welcome to CampusConnect</h2>
        <p className="mt-2 text-sm text-muted font-medium">
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
                className={`py-2 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                  activeTab === 'login'
                    ? 'bg-card text-foreground shadow-sm font-bold'
                    : 'text-muted hover:text-foreground'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setActiveTab('register'); setError(null); }}
                className={`py-2 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                  activeTab === 'register'
                    ? 'bg-card text-foreground shadow-sm font-bold'
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
                      className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
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
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary font-mono"
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
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
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
                      className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary font-semibold text-muted-foreground"
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
                      className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary font-semibold text-muted-foreground"
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
                  className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
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
                    className="text-[11px] text-primary hover:underline font-bold"
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
                    className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            )}

            {/* Role Assignment Selector */}
            {activeTab !== 'recovery' && (
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Simulator Default Role (Mock Mode Only)
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full bg-zinc-100 dark:bg-zinc-900 border border-border/80 rounded-xl px-3 py-2.5 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-primary text-muted-foreground font-semibold"
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
              className="w-full py-3.5 rounded-24 bg-primary hover:bg-rose-600 text-white font-bold text-sm transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
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
              className="mt-4 w-full text-center text-xs font-semibold text-muted hover:text-foreground transition-colors cursor-pointer"
            >
              Back to Sign In
            </button>
          )}

          {/* Third-party divider */}
          <div className="my-6 flex items-center justify-between gap-3 text-xs text-zinc-400">
            <div className="h-px bg-border flex-1" />
            <span>OR SIGN IN WITH SECURE SSO</span>
            <div className="h-px bg-border flex-1" />
          </div>

          {/* Single Sign-On Options */}
          <div className="space-y-2.5">
            <button
              type="button"
              onClick={() => setShowTgpcopSSO(true)}
              className="w-full py-3 rounded-xl border border-border bg-card hover:bg-zinc-50 dark:hover:bg-zinc-900/60 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm hover:border-primary/40 text-foreground"
            >
              <GraduationCap className="w-4.5 h-4.5 text-primary" />
              Sign in with TGPCop Council SSO
            </button>
            
            <button
              type="button"
              onClick={() => setShowGoogleSSO(true)}
              className="w-full py-3 rounded-xl border border-border bg-card hover:bg-zinc-50 dark:hover:bg-zinc-900/60 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm text-foreground hover:border-zinc-300 dark:hover:border-zinc-700"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.69a5.74 5.74 0 0 1-2.49 3.77v3.12h4.01c2.34-2.16 3.68-5.32 3.68-8.74Z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.97-1.08 7.96-2.91l-3.87-3c-1.08.72-2.45 1.16-4.09 1.16-3.15 0-5.81-2.13-6.76-5.01H1.28v3.2A12 12 0 0 0 12 24Z"/>
                <path fill="#FBBC05" d="M5.24 14.24a7.22 7.22 0 0 1 0-4.48V6.56H1.28a12 12 0 0 0 0 10.88l3.96-3.2Z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.43-3.43C17.96 1.19 15.24 0 12 0A12 12 0 0 0 1.28 6.56l3.96 3.2c.95-2.88 3.61-5.01 6.76-5.01Z"/>
              </svg>
              Sign in with Google
            </button>
          </div>

          <div className="my-6 flex items-center justify-between gap-3 text-xs text-zinc-400">
            <div className="h-px bg-border flex-1" />
            <span>QUICK MOCK DEMO ACCESS</span>
            <div className="h-px bg-border flex-1" />
          </div>

          {/* Quick Sign In Badges */}
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleQuickSignIn('student')}
                className="py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-border/80 text-[11px] font-semibold hover:border-primary/45 text-center transition-all cursor-pointer text-muted-foreground hover:text-foreground"
              >
                Student Demo
              </button>
              <button
                onClick={() => handleQuickSignIn('volunteer')}
                className="py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-border/80 text-[11px] font-semibold hover:border-primary/45 text-center transition-all cursor-pointer text-muted-foreground hover:text-foreground"
              >
                Volunteer Demo
              </button>
              <button
                onClick={() => handleQuickSignIn('event_organizer')}
                className="py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-border/80 text-[11px] font-semibold hover:border-primary/45 text-center transition-all cursor-pointer text-muted-foreground hover:text-foreground"
              >
                Organizer Demo
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleQuickSignIn('admin')}
                className="py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-border/80 text-[11px] font-semibold hover:border-primary/45 text-center transition-all cursor-pointer text-muted-foreground hover:text-foreground"
              >
                Dean (Admin)
              </button>
              <button
                onClick={() => handleQuickSignIn('super_admin')}
                className="py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-border/80 text-[11px] font-semibold hover:border-primary/45 text-center transition-all cursor-pointer text-muted-foreground hover:text-foreground"
              >
                Principal (Super Admin)
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* TGPCop Council Single Sign-On Drawer/Modal */}
      <AnimatePresence>
        {showTgpcopSSO && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm" />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-panel w-full max-w-md bg-card/95 backdrop-blur-md rounded-[20px] border border-border shadow-2xl relative overflow-hidden text-center p-6 space-y-5 z-10"
            >
              <div className="flex justify-between items-center border-b border-border pb-3 text-left">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-primary" />
                  <div>
                    <h3 className="font-extrabold text-sm text-foreground">TGPCop Council SSO Login</h3>
                    <p className="text-[10px] text-zinc-500">Official Campus Federation Identity</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowTgpcopSSO(false)}
                  className="text-xs font-bold text-zinc-400 hover:text-foreground cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleTgpcopSSOSubmit} className="space-y-4 text-left">
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-muted">Council Identity Email *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-zinc-400" />
                    <input
                      type="email"
                      required
                      value={ssoEmail}
                      onChange={(e) => setSsoEmail(e.target.value)}
                      placeholder="council.president@tgpcop.edu"
                      className="w-full bg-background border border-border rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-medium text-muted">Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-zinc-400" />
                    <input
                      type="password"
                      required
                      defaultValue="password123"
                      placeholder="••••••••"
                      className="w-full bg-background border border-border rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-medium text-muted">Authorized Council Role</label>
                  <select
                    value={ssoRole}
                    onChange={(e) => setSsoRole(e.target.value as UserRole)}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary font-semibold text-muted-foreground"
                  >
                    <option value="student">Student (Council Member)</option>
                    <option value="event_organizer">Event Organizer (Council Coordinator)</option>
                    <option value="admin">Admin (Council President)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={ssoLoading}
                  className="w-full py-3.5 rounded-xl bg-primary hover:bg-rose-600 text-white font-bold text-xs shadow-md shadow-primary/20 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 mt-2"
                >
                  {ssoLoading ? (
                    <div className="w-4 h-4 border-2 border-white/35 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>Authorize & Sign In <Shield className="w-4 h-4" /></>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Google Single Sign-On Simulation Modal */}
      <AnimatePresence>
        {showGoogleSSO && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm" />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-panel w-full max-w-sm bg-card/95 backdrop-blur-md rounded-[20px] border border-border shadow-2xl relative overflow-hidden text-center p-6 space-y-4 z-10"
            >
              <div className="flex justify-between items-center border-b border-border pb-3 text-left">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.69a5.74 5.74 0 0 1-2.49 3.77v3.12h4.01c2.34-2.16 3.68-5.32 3.68-8.74Z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.97-1.08 7.96-2.91l-3.87-3c-1.08.72-2.45 1.16-4.09 1.16-3.15 0-5.81-2.13-6.76-5.01H1.28v3.2A12 12 0 0 0 12 24Z"/>
                    <path fill="#FBBC05" d="M5.24 14.24a7.22 7.22 0 0 1 0-4.48V6.56H1.28a12 12 0 0 0 0 10.88l3.96-3.2Z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.43-3.43C17.96 1.19 15.24 0 12 0A12 12 0 0 0 1.28 6.56l3.96 3.2c.95-2.88 3.61-5.01 6.76-5.01Z"/>
                  </svg>
                  <div>
                    <h3 className="font-extrabold text-sm text-foreground">Sign in with Google</h3>
                    <p className="text-[10px] text-zinc-500">Choose an account to continue</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowGoogleSSO(false)}
                  className="text-xs font-bold text-zinc-400 hover:text-foreground cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  onClick={handleGoogleLoginSubmit}
                  disabled={googleLoading}
                  className="w-full p-3 rounded-xl border border-border bg-card hover:bg-zinc-50 dark:hover:bg-zinc-900/60 transition-colors flex items-center justify-between text-left text-xs font-bold cursor-pointer"
                >
                  <div>
                    <span className="block text-foreground">Aditya Sharma</span>
                    <span className="block text-[10px] text-zinc-400 font-normal">aditya.sharma@gmail.com</span>
                  </div>
                  <span className="text-[10px] text-primary">Sign In</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
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
