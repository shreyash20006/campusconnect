'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Check, Settings, ShieldAlert, Award, Calendar, Wallet, CheckSquare, X } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { motion, AnimatePresence } from 'framer-motion';

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'registration' | 'payment' | 'attendance' | 'certificate' | 'announcement' | 'volunteer';
  is_read: boolean;
  created_at: string;
}

export default function NotificationCenter() {
  const { user, isMockMode } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'settings'>('all');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  
  // Notification preferences
  const [preferences, setPreferences] = useState({
    emailRegistrations: true,
    emailPayments: true,
    emailReminders: true,
    emailCertificates: true,
    inAppVolunteerTasks: true,
  });

  const localNotifsKey = user ? `cc_notifications_${user.id}` : '';
  const localPrefsKey = user ? `cc_pref_${user.id}` : '';

  useEffect(() => {
    if (!user) return;

    // Load notification preferences
    const storedPrefs = localStorage.getItem(localPrefsKey);
    if (storedPrefs) {
      setPreferences(JSON.parse(storedPrefs));
    }

    // Load notifications from local storage or seed default ones
    const storedNotifs = localStorage.getItem(localNotifsKey);
    if (storedNotifs) {
      setNotifications(JSON.parse(storedNotifs));
    } else {
      const defaultNotifs: NotificationItem[] = [
        {
          id: 'n-mock-1',
          user_id: user.id,
          title: 'Welcome to CampusConnect!',
          message: 'Explore active events, enroll in workshops, and collect verified certificates.',
          type: 'announcement',
          is_read: false,
          created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'n-mock-2',
          user_id: user.id,
          title: 'GenAI Workshop Certification',
          message: 'Your cryptographic signature hash for the Generative AI & LLM Workshop is ready.',
          type: 'certificate',
          is_read: false,
          created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'n-mock-3',
          user_id: user.id,
          title: 'Registration Confirmation',
          message: 'Successfully registered for Spandan Cultural Night. Ticket pass is active.',
          type: 'registration',
          is_read: true,
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      setNotifications(defaultNotifs);
      localStorage.setItem(localNotifsKey, JSON.stringify(defaultNotifs));
    }
  }, [user, localNotifsKey, localPrefsKey]);

  const saveNotifications = (updated: NotificationItem[]) => {
    setNotifications(updated);
    if (localNotifsKey) {
      localStorage.setItem(localNotifsKey, JSON.stringify(updated));
    }
  };

  const markAllRead = () => {
    const updated = notifications.map(n => ({ ...n, is_read: true }));
    saveNotifications(updated);
  };

  const toggleRead = (id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, is_read: !n.is_read } : n);
    saveNotifications(updated);
  };

  const handlePreferenceChange = (key: keyof typeof preferences) => {
    const updated = { ...preferences, [key]: !preferences[key] };
    setPreferences(updated);
    if (localPrefsKey) {
      localStorage.setItem(localPrefsKey, JSON.stringify(updated));
    }
  };

  if (!user) return null;

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const filteredNotifs = activeTab === 'all' 
    ? notifications 
    : notifications.filter(n => !n.is_read);

  const getIcon = (type: string) => {
    switch (type) {
      case 'registration':
        return <Calendar className="w-4 h-4 text-blue-500" />;
      case 'payment':
        return <Wallet className="w-4 h-4 text-emerald-500" />;
      case 'attendance':
        return <CheckSquare className="w-4 h-4 text-purple-500" />;
      case 'certificate':
        return <Award className="w-4 h-4 text-amber-500" />;
      case 'volunteer':
        return <CheckSquare className="w-4 h-4 text-pink-500" />;
      default:
        return <Bell className="w-4 h-4 text-zinc-400" />;
    }
  };

  return (
    <div className="relative">
      {/* Navbar trigger Bell button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-xl border border-border text-muted-foreground hover:bg-card transition-colors cursor-pointer relative"
        aria-label="Toggle Notification center"
      >
        <Bell className="w-4.5 h-4.5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[8px] font-bold min-w-4 h-4 flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Floating Center Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Click backdrop to close */}
            <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />

            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              className="absolute right-0 mt-3 w-80 sm:w-96 glass-panel rounded-2xl shadow-2xl border border-border bg-card/95 backdrop-blur-md overflow-hidden z-40"
            >
              {/* Header */}
              <div className="px-5 py-4 border-b border-border/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-foreground">Notification Hub</span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-md bg-blue-500/10 text-blue-500 text-[10px] font-bold">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setActiveTab(activeTab === 'settings' ? 'all' : 'settings')}
                    className="p-1 rounded-lg text-zinc-400 hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    title="Notification preferences"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="p-1 rounded-lg text-zinc-400 hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Tabs */}
              {activeTab !== 'settings' && (
                <div className="px-5 py-2 border-b border-border/40 flex items-center justify-between text-xs bg-zinc-50/50 dark:bg-zinc-900/30">
                  <div className="flex gap-4">
                    <button
                      onClick={() => setActiveTab('all')}
                      className={`font-semibold transition-colors ${activeTab === 'all' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      All Logs
                    </button>
                    <button
                      onClick={() => setActiveTab('unread')}
                      className={`font-semibold transition-colors ${activeTab === 'unread' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      Unread
                    </button>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-[10px] text-blue-500 hover:underline font-bold"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
              )}

              {/* Body */}
              <div className="max-h-80 overflow-y-auto">
                {activeTab === 'settings' ? (
                  /* Settings UI */
                  <div className="p-5 space-y-4 text-xs text-left">
                    <h4 className="font-bold text-foreground">Delivery Preferences</h4>
                    <p className="text-[10px] text-zinc-400 leading-normal">
                      Customize how CampusConnect delivers automated alerts to your inbox and client.
                    </p>

                    <div className="space-y-3.5 pt-2">
                      <label className="flex items-center justify-between cursor-pointer">
                        <span className="font-medium text-muted">Email on Registration Confirmation</span>
                        <input
                          type="checkbox"
                          checked={preferences.emailRegistrations}
                          onChange={() => handlePreferenceChange('emailRegistrations')}
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500/35 border-border"
                        />
                      </label>
                      <label className="flex items-center justify-between cursor-pointer">
                        <span className="font-medium text-muted">Email on Payout/Payment Success</span>
                        <input
                          type="checkbox"
                          checked={preferences.emailPayments}
                          onChange={() => handlePreferenceChange('emailPayments')}
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500/35 border-border"
                        />
                      </label>
                      <label className="flex items-center justify-between cursor-pointer">
                        <span className="font-medium text-muted">Email Event Reminders</span>
                        <input
                          type="checkbox"
                          checked={preferences.emailReminders}
                          onChange={() => handlePreferenceChange('emailReminders')}
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500/35 border-border"
                        />
                      </label>
                      <label className="flex items-center justify-between cursor-pointer">
                        <span className="font-medium text-muted">Email Issued Certificates</span>
                        <input
                          type="checkbox"
                          checked={preferences.emailCertificates}
                          onChange={() => handlePreferenceChange('emailCertificates')}
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500/35 border-border"
                        />
                      </label>
                      <label className="flex items-center justify-between cursor-pointer">
                        <span className="font-medium text-muted">In-App Volunteer Tasks</span>
                        <input
                          type="checkbox"
                          checked={preferences.inAppVolunteerTasks}
                          onChange={() => handlePreferenceChange('inAppVolunteerTasks')}
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500/35 border-border"
                        />
                      </label>
                    </div>

                    <button
                      onClick={() => setActiveTab('all')}
                      className="w-full py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 rounded-xl font-bold uppercase text-[9px] tracking-wider hover:opacity-90 transition-opacity"
                    >
                      Save and Back
                    </button>
                  </div>
                ) : (
                  /* Notifications list */
                  <div className="p-2 space-y-1 text-left">
                    {filteredNotifs.length === 0 ? (
                      <div className="py-12 text-center text-xs text-zinc-500">
                        No notifications found.
                      </div>
                    ) : (
                      filteredNotifs.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => toggleRead(notif.id)}
                          className={`p-3 rounded-xl border border-transparent transition-all flex gap-3 items-start cursor-pointer hover:bg-zinc-100/40 dark:hover:bg-zinc-900/40 ${
                            notif.is_read ? 'opacity-60' : 'bg-blue-500/5 dark:bg-blue-500/10 border-blue-500/10'
                          }`}
                        >
                          <div className={`p-2 rounded-lg ${notif.is_read ? 'bg-zinc-200/50 dark:bg-zinc-800 text-zinc-400' : 'bg-blue-500/10 text-blue-500'}`}>
                            {getIcon(notif.type)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <span className="font-bold text-xs text-foreground leading-snug">{notif.title}</span>
                              <span className="text-[8px] text-zinc-400 whitespace-nowrap">
                                {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-1 leading-normal">
                              {notif.message}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
