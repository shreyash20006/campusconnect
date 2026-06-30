'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/providers/AuthProvider';
import { useTheme } from '@/providers/ThemeProvider';
import { 
  Calendar, Ticket, QrCode, Award, ShieldCheck, 
  TrendingUp, Wallet, Users, ArrowRight, Check, 
  HelpCircle, Menu, X, Sun, Moon, ArrowUpRight, GraduationCap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LandingPage() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // FAQ open state
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const stats = [
    { value: '50k+', label: 'Student Users', icon: Users },
    { value: '2.5k+', label: 'Events Hosted', icon: Calendar },
    { value: '120+', label: 'Active Clubs', icon: GraduationCap },
    { value: '99.9%', label: 'Scan Accuracy', icon: QrCode }
  ];

  const features = [
    {
      title: 'Seamless One-Click Registrations',
      desc: 'Fill profile once and register for events in less than 30 seconds. Support for team registrations, auto-fill credentials, and quick updates.',
      icon: Ticket,
      color: 'from-blue-500 to-indigo-600'
    },
    {
      title: 'Live Attendance QR Scanner',
      desc: 'Fast organizer-only camera checking. Built-in flashlight support, real-time duplicate checks, no-show filters, and instant attendance metrics.',
      icon: QrCode,
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Automated Payouts & Settlements',
      desc: 'Integrated Cashfree gateway automatically routes student registration fees directly into your linked bank account. Zero manual withdrawal delays.',
      icon: Wallet,
      color: 'from-emerald-500 to-teal-500'
    },
    {
      title: 'Smart Verified Certificates',
      desc: 'Verify event participation with unique QR-enabled credentials. Secure SHA-256 signatures make sharing on LinkedIn or resume simple.',
      icon: Award,
      color: 'from-orange-500 to-amber-500'
    }
  ];

  const faqData = [
    {
      q: 'How does the Cashfree payment flow work?',
      a: 'When students register for a paid event, a transaction request is generated on the server-side. The student checks out via the Cashfree SDK. Cashfree verifies the funds, fires a cryptographically signed webhook to CampusConnect, and the ticket is generated automatically.'
    },
    {
      q: 'Can volunteers scan tickets without admin rights?',
      a: 'Yes, volunteers can check in students. Admins can assign students to "Volunteer" status for specific events, giving them access to the scanner module without letting them view financials or edit event configurations.'
    },
    {
      q: 'How are certificates generated and verified?',
      a: 'Certificates are generated once attendance is verified via the QR scan. Each certificate has a unique ID and a SHA-256 signature hash. Anyone (e.g. employers or recruiters) can scan the QR code to verify the certificate on the public verification page.'
    },
    {
      q: 'Is there a limit to how many events we can host?',
      a: 'The free Student Club plan allows unlimited events, with up to 100 registrations per event. For higher registration caps, custom forms, and bulk reports, you can upgrade to the Department or Campus-wide plan.'
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 bg-grid-pattern">
      {/* Floating Header */}
      <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled ? 'py-3.5 bg-background/70 backdrop-blur-md border-b border-border shadow-sm' : 'py-5 bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-premium flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
              CC
            </div>
            <span className="font-bold text-lg tracking-tight">
              Campus<span className="text-blue-500">Connect</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted hover:text-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How it Works</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
            <a href="#faqs" className="hover:text-foreground transition-colors">FAQs</a>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-border hover:bg-card transition-colors text-muted-foreground"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>

            {user ? (
              <Link 
                href="/dashboard"
                className="flex items-center gap-1.5 px-4.5 py-2 rounded-xl bg-primary hover:bg-blue-600 text-white font-medium text-sm transition-all shadow-sm shadow-blue-500/10 hover:shadow-blue-500/20"
              >
                Go to Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link href="/auth" className="text-sm font-medium hover:text-primary transition-colors">
                  Sign In
                </Link>
                <Link 
                  href="/auth?tab=register"
                  className="flex items-center gap-1 px-4.5 py-2 rounded-xl bg-primary hover:bg-blue-600 text-white font-medium text-sm transition-all shadow-sm shadow-blue-500/10 hover:shadow-blue-500/20"
                >
                  Get Started <ArrowUpRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="flex md:hidden items-center gap-2">
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-border bg-card text-muted-foreground"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl border border-border bg-card text-muted-foreground"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Panel */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed inset-x-0 top-[72px] z-30 p-6 glass-panel border-b border-border shadow-xl md:hidden mx-4 rounded-2xl mt-2"
          >
            <nav className="flex flex-col gap-4 text-base font-medium">
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="hover:text-primary py-1 border-b border-border/40">Features</a>
              <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="hover:text-primary py-1 border-b border-border/40">How it Works</a>
              <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="hover:text-primary py-1 border-b border-border/40">Pricing</a>
              <a href="#faqs" onClick={() => setMobileMenuOpen(false)} className="hover:text-primary py-1 border-b border-border/40">FAQs</a>
              
              {user ? (
                <Link 
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="mt-2 w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-primary text-white font-medium text-sm transition-colors"
                >
                  Dashboard <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <Link 
                    href="/auth" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center py-2.5 rounded-xl border border-border bg-card font-medium text-sm text-center"
                  >
                    Sign In
                  </Link>
                  <Link 
                    href="/auth?tab=register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center py-2.5 rounded-xl bg-primary text-white font-medium text-sm text-center"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
        {/* Glow Spheres */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] rounded-full bg-purple-500/5 blur-[80px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full border border-border bg-card text-xs font-semibold text-muted-foreground mb-6 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>CampusConnect v1.0 Production Payouts Active</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-none max-w-5xl mx-auto">
            The Complete Event Infrastructure for <span className="text-gradient-premium">Smart Colleges</span>
          </h1>

          <p className="mt-6 text-base md:text-xl text-muted max-w-3xl mx-auto leading-relaxed">
            SaaS-grade platform tailored for student clubs. Deploy free and paid registrations, generate verified certificate PDFs, run automated ticket checking, and settle money directly via Cashfree.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/auth?tab=register"
              className="w-full sm:w-auto px-8 py-3.5 rounded-24 bg-primary hover:bg-blue-600 text-white font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/35 transition-all text-sm sm:text-base flex items-center justify-center gap-1.5"
            >
              Start Hosting Free <ArrowUpRight className="w-4.5 h-4.5" />
            </Link>
            <Link 
              href="/events"
              className="w-full sm:w-auto px-8 py-3.5 rounded-24 border border-border bg-card hover:bg-zinc-100/50 dark:hover:bg-zinc-800/40 font-semibold transition-colors text-sm sm:text-base flex items-center justify-center gap-1"
            >
              Discover College Events
            </Link>
          </div>

          {/* Premium UI Mockup */}
          <div className="mt-16 md:mt-24 max-w-5xl mx-auto rounded-[32px] border border-border/80 bg-zinc-950/20 p-2 md:p-3 shadow-2xl glass-panel relative overflow-hidden group">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
            <div className="rounded-[22px] overflow-hidden border border-border shadow-inner aspect-[16/10] bg-zinc-900 relative">
              <img 
                src="https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=1200&q=80" 
                alt="CampusConnect SaaS Dashboard Mockup" 
                className="w-full h-full object-cover opacity-90 group-hover:scale-[1.01] transition-transform duration-700" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
              
              <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between text-left">
                <div>
                  <h3 className="text-white font-bold text-lg md:text-xl">CampusConnect Organizer Dashboard</h3>
                  <p className="text-zinc-400 text-xs md:text-sm mt-1">Live attendee check-in counts and Cashfree revenue graphs.</p>
                </div>
                <div className="flex gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="w-3 h-3 rounded-full bg-yellow-500" />
                  <span className="w-3 h-3 rounded-full bg-green-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Counter Section */}
      <section className="border-y border-border bg-card/30 py-12 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="flex flex-col items-center">
                  <div className="p-2.5 rounded-2xl bg-primary/10 text-primary mb-3.5">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-3xl md:text-4xl font-extrabold tracking-tight">{stat.value}</span>
                  <span className="text-xs md:text-sm text-muted mt-1">{stat.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="features" className="py-20 md:py-28 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold tracking-widest text-primary uppercase mb-3">Enterprise Capabilities</h2>
            <h3 className="text-3xl md:text-5xl font-extrabold tracking-tight">Everything you need to host events at scale</h3>
            <p className="text-muted mt-4 text-base md:text-lg">
              CampusConnect replaces spreadsheets, emails, paper passes, and manually tracking bank deposits with a single unified SaaS dashboard.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feat, i) => {
              const Icon = feat.icon;
              return (
                <div key={i} className="premium-card p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start">
                  <div className={`p-4 rounded-24 bg-gradient-to-br ${feat.color} text-white shadow-md shrink-0`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-lg md:text-xl font-bold tracking-tight">{feat.title}</h4>
                    <p className="text-sm md:text-base text-muted leading-relaxed">{feat.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 border-t border-border bg-card/20 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold tracking-widest text-primary uppercase mb-3">Workflow</h2>
            <h3 className="text-3xl md:text-4xl font-extrabold tracking-tight">Simple as 1-2-3-4</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Steps line */}
            <div className="hidden md:block absolute top-[52px] left-[15%] right-[15%] h-[2px] bg-border z-0" />

            {[
              { step: '01', title: 'Discover & Choose', desc: 'Browse the college events board. Review schedules, speakers, and sponsors.' },
              { step: '02', title: 'Quick Checkout', desc: 'Auto-fill profile details, team lists, and check out securely via Cashfree in 30 seconds.' },
              { step: '03', title: 'Scan at Door', desc: 'Show your digital ticket QR code to volunteers. Check-in takes under 2 seconds.' },
              { step: '04', title: 'Claim Certificate', desc: 'Download your cryptographically signed PDF certificate from your profile dashboard.' }
            ].map((s, idx) => (
              <div key={idx} className="relative z-10 flex flex-col items-center text-center px-4">
                <div className="w-11 h-11 rounded-full bg-card border border-border flex items-center justify-center text-sm font-bold text-primary shadow-sm mb-6">
                  {s.step}
                </div>
                <h4 className="text-base font-bold tracking-tight">{s.title}</h4>
                <p className="text-xs md:text-sm text-muted mt-2 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Matrix */}
      <section id="pricing" className="py-20 md:py-28 border-t border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold tracking-widest text-primary uppercase mb-3">Transparent Pricing</h2>
            <h3 className="text-3xl md:text-5xl font-extrabold tracking-tight">Ready for clubs of all shapes and sizes</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Tier */}
            <div className="premium-card p-8 flex flex-col justify-between relative overflow-hidden bg-card/60">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Club Organizer</span>
                <div className="flex items-baseline gap-1 mt-4">
                  <span className="text-4xl font-extrabold">₹0</span>
                  <span className="text-sm text-zinc-500">/ forever</span>
                </div>
                <p className="text-xs text-zinc-400 mt-2">Perfect for individual student-led technical and cultural clubs.</p>
                <div className="border-t border-border/80 my-6" />
                <ul className="space-y-3.5 text-xs text-muted">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> Free event registrations</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> Camera scanner for check-in</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> basic certificate designs</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> Max 100 registrations / event</li>
                </ul>
              </div>
              <Link 
                href="/auth?tab=register"
                className="mt-8 w-full py-2.5 rounded-xl border border-border text-center text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800/40 transition-colors"
              >
                Sign Up Free
              </Link>
            </div>

            {/* Popular Tier */}
            <div className="premium-card p-8 flex flex-col justify-between relative overflow-hidden bg-zinc-950 dark:bg-zinc-900 border-2 border-blue-500/70 shadow-xl shadow-blue-500/5">
              <div className="absolute top-3.5 right-3.5 px-2.5 py-0.5 rounded-full bg-blue-500 text-white text-[10px] font-bold tracking-wider uppercase">
                Most Popular
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Department Plan</span>
                <div className="flex items-baseline gap-1 mt-4">
                  <span className="text-4xl font-extrabold text-white">₹1,499</span>
                  <span className="text-sm text-zinc-400">/ sem</span>
                </div>
                <p className="text-xs text-zinc-400 mt-2">Ideal for department heads hosting symposiums, tech-fests, and workshops.</p>
                <div className="border-t border-border/80 my-6" />
                <ul className="space-y-3.5 text-xs text-zinc-300">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-400 shrink-0" /> Everything in Club plan</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-400 shrink-0" /> Paid ticket sales (Cashfree Integration)</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-400 shrink-0" /> Live Settlement & Payout panel</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-400 shrink-0" /> CSV & Excel attendance exports</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-400 shrink-0" /> Custom certificate templates</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-400 shrink-0" /> Max 500 registrations / event</li>
                </ul>
              </div>
              <Link 
                href="/auth?tab=register"
                className="mt-8 w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-center text-xs font-semibold transition-colors"
              >
                Get Started
              </Link>
            </div>

            {/* Enterprise Tier */}
            <div className="premium-card p-8 flex flex-col justify-between relative overflow-hidden bg-card/60">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Campus Wide</span>
                <div className="flex items-baseline gap-1 mt-4">
                  <span className="text-4xl font-extrabold">Custom</span>
                </div>
                <p className="text-xs text-zinc-400 mt-2">Full deployment with custom integrations, sub-domains, and central administration.</p>
                <div className="border-t border-border/80 my-6" />
                <ul className="space-y-3.5 text-xs text-muted">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> Unlimited events & registrations</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> Custom sub-domain deployment</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> SMS ticket notification fallback</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> Role-based access logs & audits</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> 24/7 dedicated support representative</li>
                </ul>
              </div>
              <a 
                href="mailto:support@campusconnect.edu?subject=CampusConnect Inquiry"
                className="mt-8 w-full py-2.5 rounded-xl border border-border text-center text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800/40 transition-colors"
              >
                Contact Sales
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section id="faqs" className="py-20 md:py-28 border-t border-border bg-card/10">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-xs font-bold tracking-widest text-primary uppercase mb-3">Support</h2>
            <h3 className="text-3xl md:text-4xl font-extrabold tracking-tight">Frequently Asked Questions</h3>
          </div>

          <div className="space-y-3.5">
            {faqData.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div 
                  key={idx} 
                  className="rounded-24 border border-border bg-card/60 overflow-hidden transition-all duration-300"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between p-5 text-left font-semibold text-sm md:text-base hover:text-primary transition-colors focus:outline-none"
                  >
                    <span>{faq.q}</span>
                    <HelpCircle className={`w-4.5 h-4.5 text-zinc-400 shrink-0 transition-transform ${isOpen ? 'rotate-180 text-primary' : ''}`} />
                  </button>
                  
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        className="overflow-hidden"
                      >
                        <p className="px-5 pb-5 text-xs md:text-sm text-muted leading-relaxed border-t border-border/50 pt-3">
                          {faq.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/40 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-premium flex items-center justify-center text-white font-bold">
                CC
              </div>
              <span className="font-bold text-base tracking-tight">CampusConnect</span>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              Production-ready, SaaS-grade college event management platform built with Next.js 15, Supabase, and Cashfree payments.
            </p>
          </div>

          <div>
            <h5 className="font-semibold text-xs text-zinc-500 uppercase tracking-widest mb-4">Platform</h5>
            <ul className="space-y-2 text-xs text-muted">
              <li><Link href="/events" className="hover:text-foreground">Explore Events</Link></li>
              <li><a href="#features" className="hover:text-foreground">Product Features</a></li>
              <li><a href="#pricing" className="hover:text-foreground">Pricing Plan</a></li>
            </ul>
          </div>

          <div>
            <h5 className="font-semibold text-xs text-zinc-500 uppercase tracking-widest mb-4">Security & Legal</h5>
            <ul className="space-y-2 text-xs text-muted">
              <li><span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-500 font-semibold border border-blue-500/20 mr-1.5">RLS Active</span>Row Level Security</li>
              <li><span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-500 font-semibold border border-emerald-500/20 mr-1.5">Cashfree</span>Payment Verified</li>
            </ul>
          </div>

          <div>
            <h5 className="font-semibold text-xs text-zinc-500 uppercase tracking-widest mb-4">Campus Info</h5>
            <p className="text-xs text-muted">
              CampusConnect University<br />
              Administration Block, Sector 4<br />
              support@campusconnect.edu
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 border-t border-border/50 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-muted">
          <span>&copy; 2026 CampusConnect. All rights reserved.</span>
          <span className="mt-2 md:mt-0 flex gap-4">
            <a href="#" className="hover:underline">Privacy Policy</a>
            <a href="#" className="hover:underline">Terms of Service</a>
          </span>
        </div>
      </footer>
    </div>
  );
}
