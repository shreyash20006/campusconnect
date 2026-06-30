'use client';

import React, { useState, useEffect } from 'react';
import { MOCK_EVENTS, CollegeEvent } from '@/lib/data';
import { 
  Plus, Edit2, Copy, Trash2, Calendar, 
  MapPin, Check, X, ShieldAlert, SlidersHorizontal, 
  Info, ToggleLeft, ToggleRight, Sparkles 
} from 'lucide-react';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminEventsCRUD() {
  const [events, setEvents] = useState<CollegeEvent[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CollegeEvent | null>(null);

  // Form Fields State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Technical');
  const [bannerUrl, setBannerUrl] = useState('');
  const [venue, setVenue] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [endDateTime, setEndDateTime] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [description, setDescription] = useState('');
  const [isPaid, setIsPaid] = useState(false);
  const [price, setPrice] = useState(0);
  const [maxTeamSize, setMaxTeamSize] = useState(1);
  const [regLimit, setRegLimit] = useState(100);
  const [regDeadline, setRegDeadline] = useState('');

  // Speaker array builder
  const [speakersList, setSpeakersList] = useState<{ name: string; designation: string; company: string; avatarUrl: string }[]>([]);
  const [speakerName, setSpeakerName] = useState('');
  const [speakerDesig, setSpeakerDesig] = useState('');
  const [speakerComp, setSpeakerComp] = useState('');

  useEffect(() => {
    // Merge mock events with any custom events in local storage
    const customEvents = JSON.parse(localStorage.getItem('cc_custom_events') || '[]');
    setEvents([...customEvents, ...MOCK_EVENTS]);
  }, []);

  const saveEventsState = (newEventsList: CollegeEvent[]) => {
    setEvents(newEventsList);
    // Write only the custom ones to local storage (filter out mock events)
    const mockIds = MOCK_EVENTS.map(e => e.id);
    const customOnly = newEventsList.filter(e => !mockIds.includes(e.id));
    localStorage.setItem('cc_custom_events', JSON.stringify(customOnly));
  };

  const handleOpenCreate = () => {
    setEditingEvent(null);
    setTitle('');
    setCategory('Technical');
    setBannerUrl('https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800');
    setVenue('');
    setDateTime('');
    setEndDateTime('');
    setShortDesc('');
    setDescription('');
    setIsPaid(false);
    setPrice(0);
    setMaxTeamSize(1);
    setRegLimit(100);
    setRegDeadline('');
    setSpeakersList([]);
    setShowForm(true);
  };

  const handleOpenEdit = (evt: CollegeEvent) => {
    setEditingEvent(evt);
    setTitle(evt.title);
    setCategory(evt.category);
    setBannerUrl(evt.banner_url);
    setVenue(evt.venue);
    // Format dates to input format (YYYY-MM-DDTHH:MM)
    const formatInputDate = (dStr: string) => {
      if (!dStr) return '';
      const d = new Date(dStr);
      return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    };
    setDateTime(formatInputDate(evt.date_time));
    setEndDateTime(formatInputDate(evt.end_date_time));
    setShortDesc(evt.short_description || '');
    setDescription(evt.description);
    setIsPaid(evt.is_paid);
    setPrice(evt.price);
    setMaxTeamSize(evt.max_team_size);
    setRegLimit(evt.registration_limit || 100);
    setRegDeadline(formatInputDate(evt.registration_deadline || ''));
    setSpeakersList(evt.speakers || []);
    setShowForm(true);
  };

  const handleAddSpeaker = () => {
    if (!speakerName) return;
    setSpeakersList([
      ...speakersList, 
      { 
        name: speakerName, 
        designation: speakerDesig || 'Speaker', 
        company: speakerComp || 'Expert', 
        avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${speakerName}` 
      }
    ]);
    setSpeakerName('');
    setSpeakerDesig('');
    setSpeakerComp('');
  };

  const handleRemoveSpeaker = (idx: number) => {
    setSpeakersList(speakersList.filter((_, i) => i !== idx));
  };

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingEvent) {
      // Edit
      const updated = events.map(evt => {
        if (evt.id === editingEvent.id) {
          return {
            ...evt,
            title,
            category: category as any,
            banner_url: bannerUrl,
            venue,
            date_time: new Date(dateTime).toISOString(),
            end_date_time: new Date(endDateTime).toISOString(),
            short_description: shortDesc,
            description,
            is_paid: isPaid,
            price: isPaid ? Number(price) : 0,
            max_team_size: Number(maxTeamSize),
            registration_limit: Number(regLimit),
            registration_deadline: regDeadline ? new Date(regDeadline).toISOString() : undefined,
            speakers: speakersList,
            updated_at: new Date().toISOString()
          };
        }
        return evt;
      });
      saveEventsState(updated);
    } else {
      // Create
      const newEvt: CollegeEvent = {
        id: `custom-${Math.random().toString(36).substring(2, 9)}`,
        title,
        category: category as any,
        banner_url: bannerUrl,
        venue,
        date_time: new Date(dateTime).toISOString(),
        end_date_time: new Date(endDateTime).toISOString(),
        short_description: shortDesc,
        description,
        is_paid: isPaid,
        price: isPaid ? Number(price) : 0,
        max_team_size: Number(maxTeamSize),
        registration_limit: Number(regLimit),
        registration_deadline: regDeadline ? new Date(regDeadline).toISOString() : undefined,
        speakers: speakersList,
        sponsors: [],
        agenda: [
          { time: '10:00 AM', title: 'Session 1 Intro', description: 'Brief introduction overview.' }
        ],
        club_name: 'ByteCraft Coding Club',
        status: 'published',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      saveEventsState([newEvt, ...events]);
    }

    setShowForm(false);
  };

  const handleDuplicate = (evt: CollegeEvent) => {
    const clone: CollegeEvent = {
      ...evt,
      id: `custom-${Math.random().toString(36).substring(2, 9)}`,
      title: `${evt.title} (Copy)`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    saveEventsState([clone, ...events]);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this event? This action is irreversible.')) {
      const remaining = events.filter(evt => evt.id !== id);
      saveEventsState(remaining);
    }
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Event Management</h1>
          <p className="text-sm text-zinc-500 mt-1">Deploy, copy, archive, and manage seats boundaries.</p>
        </div>
        
        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-xl bg-primary hover:bg-blue-600 text-white font-semibold text-xs shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Create New Event
        </button>
      </div>

      {/* Main Layout (Grid lists or Form) */}
      {showForm ? (
        <div className="premium-card p-6 bg-card border-border/80">
          <div className="flex justify-between items-center border-b border-border/60 pb-3 mb-6">
            <h3 className="font-extrabold text-sm text-foreground">
              {editingEvent ? 'Modify Event Settings' : 'Initialize Event Template'}
            </h3>
            <button
              onClick={() => setShowForm(false)}
              className="p-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-foreground"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>

          <form onSubmit={handleSaveSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Title */}
              <div className="space-y-1.5 text-xs">
                <label className="font-medium text-muted">Event Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. InnovateX Ideathon"
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-blue-500/40 text-foreground"
                />
              </div>

              {/* Category */}
              <div className="space-y-1.5 text-xs">
                <label className="font-medium text-muted">Event Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-500/40 text-muted-foreground font-semibold"
                >
                  <option value="Technical">Technical</option>
                  <option value="Cultural">Cultural</option>
                  <option value="Sports">Sports</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Seminar">Seminar</option>
                </select>
              </div>

              {/* Banner URL */}
              <div className="space-y-1.5 text-xs md:col-span-2">
                <label className="font-medium text-muted">Banner Image URL *</label>
                <input
                  type="url"
                  required
                  value={bannerUrl}
                  onChange={(e) => setBannerUrl(e.target.value)}
                  placeholder="Image URL"
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-blue-500/40 text-foreground"
                />
              </div>

              {/* Venue */}
              <div className="space-y-1.5 text-xs">
                <label className="font-medium text-muted">Event Venue *</label>
                <input
                  type="text"
                  required
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="e.g. Main Auditorium"
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-blue-500/40 text-foreground"
                />
              </div>

              {/* Limit */}
              <div className="space-y-1.5 text-xs">
                <label className="font-medium text-muted">Registration Seats Limit *</label>
                <input
                  type="number"
                  required
                  value={regLimit}
                  onChange={(e) => setRegLimit(Number(e.target.value))}
                  placeholder="100"
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-blue-500/40 text-foreground"
                />
              </div>

              {/* Date Start */}
              <div className="space-y-1.5 text-xs">
                <label className="font-medium text-muted">Start Date & Time *</label>
                <input
                  type="datetime-local"
                  required
                  value={dateTime}
                  onChange={(e) => setDateTime(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-blue-500/40 text-foreground"
                />
              </div>

              {/* Date End */}
              <div className="space-y-1.5 text-xs">
                <label className="font-medium text-muted">End Date & Time *</label>
                <input
                  type="datetime-local"
                  required
                  value={endDateTime}
                  onChange={(e) => setEndDateTime(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-blue-500/40 text-foreground"
                />
              </div>

              {/* Reg Deadline */}
              <div className="space-y-1.5 text-xs">
                <label className="font-medium text-muted">Registration Deadline</label>
                <input
                  type="datetime-local"
                  value={regDeadline}
                  onChange={(e) => setRegDeadline(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-blue-500/40 text-foreground"
                />
              </div>

              {/* Max Team Size */}
              <div className="space-y-1.5 text-xs">
                <label className="font-medium text-muted">Max Team Size (1 = Solo) *</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={maxTeamSize}
                  onChange={(e) => setMaxTeamSize(Number(e.target.value))}
                  placeholder="1"
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-blue-500/40 text-foreground"
                />
              </div>
            </div>

            {/* Paid Toggle & Price */}
            <div className="p-4 rounded-24 border border-border bg-zinc-50 dark:bg-zinc-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsPaid(!isPaid)}
                  className="text-primary cursor-pointer"
                >
                  {isPaid ? <ToggleRight className="w-9 h-9 text-blue-500" /> : <ToggleLeft className="w-9 h-9 text-zinc-400" />}
                </button>
                <div className="text-left text-xs">
                  <div className="font-bold">Paid Event Ticket</div>
                  <p className="text-[10px] text-zinc-400">Paid tickets require Cashfree gateway checkouts.</p>
                </div>
              </div>

              {isPaid && (
                <div className="space-y-1 text-xs text-left w-full sm:w-40">
                  <label className="font-semibold text-muted">Ticket Fee (INR) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500/40 text-foreground"
                  />
                </div>
              )}
            </div>

            {/* Short Description */}
            <div className="space-y-1.5 text-xs text-left">
              <label className="font-medium text-muted">Short Highlight Summary *</label>
              <input
                type="text"
                required
                value={shortDesc}
                onChange={(e) => setShortDesc(e.target.value)}
                placeholder="Brief one-liner summary."
                className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-blue-500/40 text-foreground"
              />
            </div>

            {/* Full description */}
            <div className="space-y-1.5 text-xs text-left">
              <label className="font-medium text-muted">Full Event Outline & Guidelines *</label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Outline rules, schedules, and prizes."
                className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-blue-500/40 text-foreground"
              />
            </div>

            {/* Keynote Speakers Builder */}
            <div className="p-4 rounded-24 border border-border space-y-4 text-left">
              <span className="text-xs font-bold text-zinc-400">Speakers list</span>
              
              {speakersList.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {speakersList.map((sp, i) => (
                    <div key={i} className="flex justify-between items-center bg-zinc-100/50 dark:bg-zinc-900/50 p-2.5 border border-border/40 rounded-xl text-xs">
                      <div>
                        <div className="font-bold">{sp.name}</div>
                        <div className="text-[10px] text-zinc-500">{sp.designation} at {sp.company}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveSpeaker(i)}
                        className="p-1 rounded text-red-500 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
                <input
                  type="text"
                  placeholder="Speaker Name"
                  value={speakerName}
                  onChange={(e) => setSpeakerName(e.target.value)}
                  className="bg-background border border-border rounded-xl px-3 py-2"
                />
                <input
                  type="text"
                  placeholder="Designation"
                  value={speakerDesig}
                  onChange={(e) => setSpeakerDesig(e.target.value)}
                  className="bg-background border border-border rounded-xl px-3 py-2"
                />
                <input
                  type="text"
                  placeholder="Company"
                  value={speakerComp}
                  onChange={(e) => setSpeakerComp(e.target.value)}
                  className="bg-background border border-border rounded-xl px-3 py-2"
                />
              </div>

              <button
                type="button"
                onClick={handleAddSpeaker}
                className="py-2 px-4 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 font-bold text-[10px] uppercase hover:opacity-90 transition-opacity"
              >
                Add Speaker
              </button>
            </div>

            {/* Actions */}
            <div className="flex gap-2 justify-end pt-4 border-t border-border/60">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-5 py-2.5 rounded-xl border border-border bg-card text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800/40 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-primary hover:bg-blue-600 text-white font-semibold text-xs shadow-sm transition-colors cursor-pointer"
              >
                {editingEvent ? 'Save Event Settings' : 'Publish Live Event'}
              </button>
            </div>

          </form>
        </div>
      ) : (
        /* Event Table Grid list */
        <div className="premium-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-zinc-100/50 dark:bg-zinc-900/50 text-zinc-500 border-b border-border/60">
                <tr>
                  <th className="p-4 font-bold">Banner & Event Title</th>
                  <th className="p-4 font-bold">Category</th>
                  <th className="p-4 font-bold">Date & Time</th>
                  <th className="p-4 font-bold">Ticket Price</th>
                  <th className="p-4 font-bold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {events.map((evt) => (
                  <tr key={evt.id} className="hover:bg-zinc-100/30 dark:hover:bg-zinc-800/20 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3.5">
                        <img 
                          src={evt.banner_url} 
                          alt={evt.title} 
                          className="w-10 h-10 rounded-lg object-cover border border-border"
                        />
                        <div>
                          <div className="font-extrabold text-foreground leading-snug">{evt.title}</div>
                          <div className="text-[10px] text-zinc-500 mt-0.5">{evt.venue}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 border border-border/80 font-bold uppercase tracking-wider text-[9px] text-zinc-400">
                        {evt.category}
                      </span>
                    </td>
                    <td className="p-4 text-zinc-400">
                      {formatDateTime(evt.date_time)}
                    </td>
                    <td className="p-4 font-bold text-foreground">
                      {evt.price === 0 ? 'Free' : formatCurrency(evt.price)}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        {/* Duplicate */}
                        <button
                          onClick={() => handleDuplicate(evt)}
                          className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-foreground transition-colors cursor-pointer"
                          title="Duplicate Event"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        
                        {/* Edit */}
                        <button
                          onClick={() => handleOpenEdit(evt)}
                          className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-foreground transition-colors cursor-pointer"
                          title="Edit Event"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(evt.id)}
                          className="p-2 rounded-lg hover:bg-red-500/10 text-zinc-400 hover:text-red-500 transition-colors cursor-pointer"
                          title="Delete Event"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
