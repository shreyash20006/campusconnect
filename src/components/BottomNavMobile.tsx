'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, Calendar, Heart, User } from 'lucide-react';

export default function BottomNavMobile() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Events', href: '/events', icon: Compass },
    { label: 'Tickets', href: '/dashboard', icon: Calendar },
    { label: 'Saved', href: '/dashboard?tab=saved', icon: Heart },
    { label: 'Profile', href: '/dashboard?tab=profile', icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/90 backdrop-blur-md border-t border-border/80 px-4 py-2.5 flex justify-around items-center shadow-lg safe-bottom">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        
        return (
          <Link 
            key={item.label}
            href={item.href}
            className={`flex flex-col items-center gap-1.5 transition-colors cursor-pointer ${
              isActive ? 'text-primary font-bold animate-pulse' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[9px] tracking-wide">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
