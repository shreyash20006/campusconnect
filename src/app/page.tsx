'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardNavbar from '@/components/DashboardNavbar';
import { MOCK_EVENTS, CollegeEvent } from '@/lib/data';
import { 
  Compass, Search, Heart, Sparkles, Flame, Calendar, MapPin, 
  ChevronRight, Award, Trophy, Music, Landmark, Play, CheckCircle2 
} from 'lucide-react';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

// Hero Slider Banners
const HERO_SLIDES = [
  {
    id: 'slide-1',
    title: 'TechnoHack 2026',
    subtitle: 'The Ultimate Inter-College Hackathon',
    description: '48 hours of intense coding, prototyping, and mentorship from industry leaders. Compete for ₹50,000 cash prizes.',
    bg: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200',
    link: '/events/event-1'
  },
  {
    id: 'slide-2',
    title: 'Spandan Cultural Concert',
    subtitle: 'Live Concert & Fashion Showcase',
    description: 'Join the most anticipated cultural night of the year featuring live DJ sets, choreography competitions, and fashion events.',
    bg: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=1200',
    link: '/events/event-2'
  },
  {
    id: 'slide-3',
    title: 'National Robotics Meet',
    subtitle: 'RoboWars & Line Follower Arena',
    description: 'Design, build, and battle mechanical machines in the central OAT stadium. Connect with automation pioneers.',
    bg: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200',
    link: '/events/event-5'
  }
];

export default function LandingPage() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [events, setEvents] = useState<CollegeEvent[]>([]);

  // Load custom/mock events
  useEffect(() => {
    const custom = JSON.parse(localStorage.getItem('cc_custom_events') || '[]');
    setEvents([...custom, ...MOCK_EVENTS]);

    // Slide interval
    const interval = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % HERO_SLIDES.length);
    }, 5500);

    return () => clearInterval(interval);
  }, []);

  const toggleFavorite = (eventId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (favorites.includes(eventId)) {
      setFavorites(favorites.filter(id => id !== eventId));
    } else {
      setFavorites([...favorites, eventId]);
    }
  };

  // Categories list matching BookMyShow hubs
  const categories = [
    { name: 'All', icon: Compass },
    { name: 'Technical', icon: Trophy },
    { name: 'Cultural', icon: Music },
    { name: 'Sports', icon: Play },
    { name: 'Workshop', icon: Award },
    { name: 'Seminar', icon: Landmark }
  ];

  // Filtering logic
  const filteredEvents = events.filter(evt => {
    const matchesSearch = 
      evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.club_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || evt.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background flex flex-col text-left pb-16 md:pb-0">
      <DashboardNavbar />

      {/* Hero Carousel */}
      <div className="relative w-full aspect-[21/10] md:aspect-[21/7.5] overflow-hidden bg-zinc-950">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSlide}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 0.9, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${HERO_SLIDES[activeSlide].bg})` }}
          />
        </AnimatePresence>
        
        {/* Soft shadow gradients overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-black/45" />

        <div className="absolute inset-0 max-w-7xl mx-auto px-6 flex flex-col justify-end pb-8 md:pb-16 text-white space-y-3.5 z-10">
          <span className="text-xs font-extrabold uppercase tracking-widest text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full self-start">
            Featured Highlight
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight max-w-3xl leading-tight">
            {HERO_SLIDES[activeSlide].title}
          </h1>
          <p className="text-xs md:text-sm text-zinc-300 max-w-2xl leading-relaxed hidden sm:block">
            {HERO_SLIDES[activeSlide].description}
          </p>
          
          <div className="flex gap-3 pt-2">
            <Link 
              href={HERO_SLIDES[activeSlide].link}
              className="px-6 py-3 rounded-24 bg-primary hover:bg-rose-600 text-white font-bold text-xs shadow-md shadow-primary/20 transition-all flex items-center gap-1"
            >
              Book Passes <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Carousel indicators */}
        <div className="absolute bottom-6 right-6 flex gap-2 z-20">
          {HERO_SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveSlide(idx)}
              className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${activeSlide === idx ? 'bg-primary w-6' : 'bg-white/40 hover:bg-white'}`}
            />
          ))}
        </div>
      </div>

      {/* Main Events Discovery Hub */}
      <div className="max-w-7xl w-full mx-auto px-6 py-8 space-y-8">
        
        {/* Search & Categories Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between border-b border-border/60 pb-6">
          {/* Categories Horizontal scrolling */}
          <div className="flex gap-2 overflow-x-auto w-full md:w-auto pr-2 pb-1 scrollbar-none">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.name;
              return (
                <button
                  key={cat.name}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`px-4.5 py-2.5 rounded-24 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                    isSelected 
                      ? 'bg-primary text-white shadow-sm shadow-primary/20' 
                      : 'border border-border bg-card text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search events, clubs, meets..."
              className="w-full bg-card border border-border rounded-24 pl-9 pr-4 py-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/45 shadow-sm"
            />
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
          </div>
        </div>

        {/* Featured / Trending Section */}
        {searchQuery === '' && selectedCategory === 'All' && (
          <div className="space-y-4">
            <h2 className="text-xl font-extrabold tracking-tight flex items-center gap-1.5">
              <Flame className="w-5 h-5 text-primary animate-pulse" />
              <span>Trending Shows & Meets</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {events.slice(0, 3).map((evt) => (
                <Link
                  key={evt.id}
                  href={`/events/${evt.id}`}
                  className="premium-card overflow-hidden group relative flex flex-col justify-between"
                >
                  <div className="aspect-[16/9] w-full bg-zinc-900 relative overflow-hidden">
                    <img 
                      src={evt.banner_url} 
                      alt={evt.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    
                    {/* Seats counter */}
                    {evt.registration_limit && (
                      <span className="absolute top-3 left-3 bg-black/60 text-white font-mono text-[9px] px-2 py-0.5 rounded-full">
                        {evt.registration_limit} seats left
                      </span>
                    )}

                    {/* Price tag */}
                    <span className="absolute bottom-3 right-3 bg-primary text-white font-bold text-xs px-2.5 py-1 rounded-lg">
                      {evt.price === 0 ? 'FREE' : formatCurrency(evt.price)}
                    </span>
                  </div>

                  <div className="p-5 text-left space-y-2.5">
                    <div>
                      <span className="text-[10px] text-primary font-bold uppercase tracking-wider">{evt.category}</span>
                      <h3 className="font-extrabold text-base leading-snug truncate mt-0.5 group-hover:text-primary transition-colors">
                        {evt.title}
                      </h3>
                      <p className="text-xs text-zinc-400 truncate">{evt.club_name}</p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-zinc-500 border-t border-border/60 pt-3">
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {evt.venue}</span>
                      <span className="font-mono font-semibold">{new Date(evt.date_time).toLocaleDateString([], { day: 'numeric', month: 'short' })}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Dynamic Grid: All Events / Filtered */}
        <div className="space-y-4">
          <h2 className="text-xl font-extrabold tracking-tight flex items-center gap-1.5">
            <Sparkles className="w-5 h-5 text-primary" />
            <span>{selectedCategory} Event Catalog</span>
          </h2>

          {filteredEvents.length === 0 ? (
            <div className="premium-card p-12 text-center text-sm text-zinc-400">
              No shows found matching your filters.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredEvents.map((evt) => {
                const isFav = favorites.includes(evt.id);
                return (
                  <Link
                    key={evt.id}
                    href={`/events/${evt.id}`}
                    className="premium-card overflow-hidden group relative flex flex-col justify-between"
                  >
                    {/* Banner Image */}
                    <div className="aspect-[16/10] w-full bg-zinc-900 relative overflow-hidden">
                      <img 
                        src={evt.banner_url} 
                        alt={evt.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                      
                      {/* Category Badge overlay */}
                      <span className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                        {evt.category}
                      </span>

                      {/* Favorite Button */}
                      <button
                        onClick={(e) => toggleFavorite(evt.id, e)}
                        className={`absolute top-3 right-3 p-1.5 rounded-full backdrop-blur-sm transition-all cursor-pointer ${
                          isFav ? 'bg-primary text-white' : 'bg-black/60 text-zinc-400 hover:text-white'
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-white' : ''}`} />
                      </button>

                      {/* Price overlay */}
                      <span className="absolute bottom-3 right-3 bg-zinc-950/80 backdrop-blur-sm text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded-lg border border-white/10">
                        {evt.price === 0 ? 'FREE' : formatCurrency(evt.price)}
                      </span>
                    </div>

                    {/* Card Content details */}
                    <div className="p-4 text-left flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <h3 className="font-extrabold text-sm leading-snug line-clamp-2 mt-0.5 group-hover:text-primary transition-colors">
                          {evt.title}
                        </h3>
                        <p className="text-[11px] text-zinc-500 mt-1 truncate">{evt.club_name}</p>
                      </div>

                      <div className="space-y-2">
                        <div className="border-t border-border/80 my-2" />
                        
                        <div className="flex justify-between items-center text-[10px] text-zinc-400 font-medium">
                          <span className="flex items-center gap-0.5 truncate max-w-[120px]">
                            <MapPin className="w-3 h-3 shrink-0 text-zinc-500" /> 
                            {evt.venue}
                          </span>
                          <span className="font-mono text-zinc-500">
                            {new Date(evt.date_time).toLocaleDateString([], { day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                        
                        <div className="w-full py-2 bg-primary/5 hover:bg-primary text-primary hover:text-white rounded-xl text-center font-bold text-[10px] uppercase tracking-wide transition-all block">
                          Book Tickets
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
