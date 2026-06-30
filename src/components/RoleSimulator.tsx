'use client';

import React, { useState } from 'react';
import { useAuth, UserRole } from '@/providers/AuthProvider';
import { Shield, ChevronUp, ChevronDown, User, Award, Calendar, CheckSquare } from 'lucide-react';

export default function RoleSimulator() {
  const { user, setMockRole, isMockMode } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (!isMockMode || !user) return null;

  const rolesList: { role: UserRole; label: string; desc: string; icon: any }[] = [
    {
      role: 'student',
      label: 'Student',
      desc: 'Discover events, register, buy tickets, download certificates.',
      icon: User
    },
    {
      role: 'volunteer',
      label: 'Volunteer',
      desc: 'Access scanner, mark attendance, view check-in dashboard.',
      icon: CheckSquare
    },
    {
      role: 'event_organizer',
      label: 'Event Organizer',
      desc: 'Create and edit events, manage registrations, issue certificates.',
      icon: Calendar
    },
    {
      role: 'admin',
      label: 'Admin',
      desc: 'Access full dashboard, view payments, manage roles, view settings.',
      icon: Shield
    },
    {
      role: 'super_admin',
      label: 'Super Admin',
      desc: 'All admin functions + system-wide configurations.',
      icon: Award
    }
  ];

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="glass-panel rounded-2xl shadow-xl overflow-hidden border border-zinc-200/50 dark:border-zinc-800/80 transition-all duration-300 w-72">
        {/* Header Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-3.5 bg-zinc-100/50 dark:bg-zinc-900/50 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 text-left font-medium text-xs tracking-wider uppercase text-zinc-500 dark:text-zinc-400 transition-colors"
        >
          <div className="flex items-center gap-2 text-primary">
            <Shield className="w-4 h-4 animate-pulse" />
            <span>Role Simulator</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-500 text-[10px] lowercase font-semibold">
              {user.role}
            </span>
            {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </div>
        </button>

        {/* Roles List */}
        {isOpen && (
          <div className="p-2.5 max-h-80 overflow-y-auto space-y-1 bg-white/80 dark:bg-[#0c0c0f]/90 backdrop-blur-md">
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 px-2 py-1 leading-snug">
              Switch roles to explore CampusConnect event flows.
            </p>
            
            {rolesList.map((item) => {
              const Icon = item.icon;
              const isActive = user.role === item.role;
              return (
                <button
                  key={item.role}
                  onClick={() => {
                    setMockRole(item.role);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-start gap-2.5 p-2 rounded-xl text-left transition-all ${
                    isActive
                      ? 'bg-blue-600/10 dark:bg-blue-500/15 border border-blue-500/30 text-blue-600 dark:text-blue-400'
                      : 'hover:bg-zinc-100 dark:hover:bg-zinc-800/40 border border-transparent text-zinc-600 dark:text-zinc-300'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg shrink-0 ${isActive ? 'bg-blue-500 text-white' : 'bg-zinc-200/50 dark:bg-zinc-800 text-zinc-500'}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold">{item.label}</div>
                    <div className="text-[10px] text-zinc-400 dark:text-zinc-500 line-clamp-2 leading-tight mt-0.5">
                      {item.desc}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
