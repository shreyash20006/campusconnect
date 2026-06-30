'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth, UserRole } from '@/providers/AuthProvider';
import { 
  Users, Search, Filter, Ban, Shield, 
  Check, CheckCircle2, UserX, UserCheck, ShieldAlert 
} from 'lucide-react';

interface StudentProfile {
  id: string;
  name: string;
  prn: string;
  email: string;
  department: string;
  semester: string;
  role: UserRole;
  status: 'active' | 'banned';
}

const DEPARTMENTS = [
  'Computer Science & Engineering',
  'Electronics & Communication',
  'Information Technology',
  'Mechanical Engineering',
  'Civil Engineering'
];

export default function AdminStudentsPage() {
  const { user: currentUser } = useAuth();
  
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');

  useEffect(() => {
    // Simulated Student directory
    setStudents([
      {
        id: 'student-uuid-1111-2222',
        name: 'Aditya Sharma',
        prn: 'PRN202410293',
        email: 'aditya.sharma@campusconnect.edu',
        department: 'Computer Science & Engineering',
        semester: 'V',
        role: 'student',
        status: 'active'
      },
      {
        id: 'volunteer-uuid-3333-4444',
        name: 'Rohan Das',
        prn: 'PRN202410492',
        email: 'rohan.das@campusconnect.edu',
        department: 'Electronics & Communication',
        semester: 'V',
        role: 'volunteer',
        status: 'active'
      },
      {
        id: 'organizer-uuid-5555-6666',
        name: 'Priya Mehta',
        prn: 'PRN202410712',
        email: 'priya.mehta@campusconnect.edu',
        department: 'Information Technology',
        semester: 'VII',
        role: 'event_organizer',
        status: 'active'
      },
      {
        id: 'student-4',
        name: 'Vikram Joshi',
        prn: 'PRN202410501',
        email: 'vikram.joshi@campusconnect.edu',
        department: 'Mechanical Engineering',
        semester: 'III',
        role: 'student',
        status: 'active'
      },
      {
        id: 'student-5',
        name: 'Karan Malhotra',
        prn: 'PRN202410651',
        email: 'karan.m@campusconnect.edu',
        department: 'Computer Science & Engineering',
        semester: 'V',
        role: 'student',
        status: 'banned'
      }
    ]);
  }, []);

  const handleRoleChange = (id: string, newRole: UserRole) => {
    // Prevent changing own role
    if (id === currentUser?.id) {
      alert('You cannot change your own security role.');
      return;
    }
    
    setStudents(prev => prev.map(st => {
      if (st.id === id) {
        return { ...st, role: newRole };
      }
      return st;
    }));
  };

  const handleToggleBan = (id: string) => {
    if (id === currentUser?.id) {
      alert('You cannot ban your own administrator account.');
      return;
    }

    setStudents(prev => prev.map(st => {
      if (st.id === id) {
        const nextStatus = st.status === 'active' ? 'banned' : 'active';
        return { ...st, status: nextStatus };
      }
      return st;
    }));
  };

  const filteredStudents = useMemo(() => {
    return students.filter(st => {
      const matchQuery = 
        st.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        st.prn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        st.email.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchDept = selectedDept === 'All' || st.department === selectedDept;

      return matchQuery && matchDept;
    });
  }, [students, searchQuery, selectedDept]);

  return (
    <div className="space-y-6 text-left">
      
      {/* Top Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Student Directory</h1>
        <p className="text-sm text-zinc-500 mt-1">Audit security roles, delegate volunteer scanner permissions, and ban profiles.</p>
      </div>

      {/* Filters */}
      <div className="premium-card p-5 bg-card border-border/80 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, or PRN ID..."
            className="w-full bg-background border border-border rounded-xl pl-9 pr-4 py-2 text-xs shadow-sm focus:outline-none text-foreground"
          />
        </div>

        {/* Filter Department */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-zinc-400 shrink-0" />
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full bg-background border border-border rounded-xl px-2 py-2 text-xs focus:outline-none text-muted-foreground font-semibold"
          >
            <option value="All">All Departments</option>
            {DEPARTMENTS.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Directory Table */}
      <div className="premium-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-zinc-100/50 dark:bg-zinc-900/50 text-zinc-500 border-b border-border/60">
              <tr>
                <th className="p-4 font-bold">Student Name</th>
                <th className="p-4 font-bold">PRN ID</th>
                <th className="p-4 font-bold">Branch / Department</th>
                <th className="p-4 font-bold">Security Role</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filteredStudents.map((st) => (
                <tr key={st.id} className="hover:bg-zinc-100/30 dark:hover:bg-zinc-800/20 transition-colors">
                  <td className="p-4">
                    <div>
                      <div className="font-extrabold text-foreground leading-snug">{st.name}</div>
                      <div className="text-[10px] text-zinc-500 mt-0.5">{st.email}</div>
                    </div>
                  </td>
                  <td className="p-4 font-mono text-zinc-500">{st.prn}</td>
                  <td className="p-4 text-zinc-500">{st.department} - Sem {st.semester}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <select
                        value={st.role}
                        disabled={st.id === currentUser?.id}
                        onChange={(e) => handleRoleChange(st.id, e.target.value as UserRole)}
                        className="bg-zinc-100 dark:bg-zinc-900 border border-border rounded-lg px-2 py-1 text-[10px] font-semibold text-muted-foreground outline-none cursor-pointer"
                      >
                        <option value="student">Student</option>
                        <option value="volunteer">Volunteer</option>
                        <option value="event_organizer">Organizer</option>
                        <option value="admin">Admin</option>
                        <option value="super_admin">Super Admin</option>
                      </select>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                      st.status === 'active'
                        ? 'bg-emerald-500/10 text-emerald-500'
                        : 'bg-red-500/10 text-red-500'
                    }`}>
                      {st.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleToggleBan(st.id)}
                        disabled={st.id === currentUser?.id}
                        className={`p-2 rounded-lg transition-colors cursor-pointer ${
                          st.status === 'active'
                            ? 'hover:bg-red-500/10 text-zinc-400 hover:text-red-500'
                            : 'hover:bg-emerald-500/10 text-zinc-400 hover:text-emerald-500'
                        }`}
                        title={st.status === 'active' ? 'Ban Student' : 'Unban Student'}
                      >
                        {st.status === 'active' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
