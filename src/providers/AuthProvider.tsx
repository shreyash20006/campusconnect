'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';

export type UserRole = 'student' | 'volunteer' | 'event_organizer' | 'admin' | 'super_admin';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  prn?: string;
  phone?: string;
  department?: string;
  semester?: string;
  role: UserRole;
  avatar_url?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  signIn: (email: string, role?: UserRole) => Promise<void>;
  signUp: (email: string, name: string, prn: string, dept: string, sem: string, role?: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  setMockRole: (role: UserRole) => void;
  isMockMode: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Static mock users for testing different parts of CampusConnect
const MOCK_PROFILES: Record<UserRole, UserProfile> = {
  student: {
    id: 'student-uuid-1111-2222',
    email: 'aditya.sharma@campusconnect.edu',
    name: 'Aditya Sharma',
    prn: 'PRN202410293',
    phone: '9876543210',
    department: 'Computer Science & Engineering',
    semester: 'V',
    role: 'student',
    avatar_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150'
  },
  volunteer: {
    id: 'volunteer-uuid-3333-4444',
    email: 'rohan.das@campusconnect.edu',
    name: 'Rohan Das',
    prn: 'PRN202410492',
    phone: '9876500123',
    department: 'Electronics & Communication',
    semester: 'V',
    role: 'volunteer',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
  },
  event_organizer: {
    id: 'organizer-uuid-5555-6666',
    email: 'priya.mehta@campusconnect.edu',
    name: 'Priya Mehta',
    phone: '9876500456',
    department: 'Information Technology',
    role: 'event_organizer',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
  },
  admin: {
    id: 'admin-uuid-7777-8888',
    email: 'admin.events@campusconnect.edu',
    name: 'Dr. Rajesh Kumar',
    phone: '9876500999',
    department: 'Dean Office',
    role: 'admin',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
  },
  super_admin: {
    id: 'super-admin-uuid-9999-0000',
    email: 'superadmin@campusconnect.edu',
    name: 'Super Admin Principal',
    role: 'super_admin',
    avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150'
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMockMode, setIsMockMode] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if real Supabase configs are available and not equal to placeholder
    const isRealSupabase = 
      process.env.NEXT_PUBLIC_SUPABASE_URL && 
      process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder-project.supabase.co';

    if (isRealSupabase) {
      setIsMockMode(false);
      const supabase = createBrowserSupabaseClient();
      
      const checkSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profile) {
            setUser(profile as UserProfile);
          } else {
            // Fallback user if profile trigger delayed
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              name: session.user.user_metadata?.name || 'User',
              role: (session.user.user_metadata?.role as UserRole) || 'student'
            });
          }
        } else {
          // If no session, read local storage for any mock session
          const storedUser = localStorage.getItem('cc_user_session');
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }
        }
        setIsLoading(false);
      };

      checkSession();

      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profile) {
            const up = profile as UserProfile;
            setUser(up);
            localStorage.setItem('cc_user_session', JSON.stringify(up));
          }
        } else {
          setUser(null);
          localStorage.removeItem('cc_user_session');
        }
        setIsLoading(false);
      });

      return () => {
        subscription.unsubscribe();
      };
    } else {
      // In Mock-Only Mode, read mock session from local storage or set default Student
      setIsMockMode(true);
      const storedUser = localStorage.getItem('cc_user_session');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        // Set default user
        setUser(MOCK_PROFILES.student);
        localStorage.setItem('cc_user_session', JSON.stringify(MOCK_PROFILES.student));
      }
      setIsLoading(false);
    }
  }, []);

  const signIn = async (email: string, role: UserRole = 'student') => {
    setIsLoading(true);
    if (isMockMode) {
      // Simulator sign in
      const mockProfile = MOCK_PROFILES[role] || MOCK_PROFILES.student;
      // Use email entered
      const updatedProfile = { ...mockProfile, email };
      setUser(updatedProfile);
      localStorage.setItem('cc_user_session', JSON.stringify(updatedProfile));
      setIsLoading(false);
      router.push('/dashboard');
    } else {
      const supabase = createBrowserSupabaseClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });
      setIsLoading(false);
      if (error) throw error;
    }
  };

  const signUp = async (
    email: string,
    name: string,
    prn: string,
    dept: string,
    sem: string,
    role: UserRole = 'student'
  ) => {
    setIsLoading(true);
    if (isMockMode) {
      const mockProfile: UserProfile = {
        id: `mock-uuid-${Math.random().toString(36).substring(2, 10)}`,
        email,
        name,
        prn,
        department: dept,
        semester: sem,
        role,
        avatar_url: `https://api.dicebear.com/7.x/adventurer/svg?seed=${name}`
      };
      setUser(mockProfile);
      localStorage.setItem('cc_user_session', JSON.stringify(mockProfile));
      setIsLoading(false);
      router.push('/dashboard');
    } else {
      const supabase = createBrowserSupabaseClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password: 'TemporaryPassword123!', // Using password or OTP
        options: {
          data: {
            name,
            prn,
            department: dept,
            semester: sem,
            role
          }
        }
      });
      setIsLoading(false);
      if (error) throw error;
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    if (isMockMode) {
      setUser(null);
      localStorage.removeItem('cc_user_session');
      setIsLoading(false);
      router.push('/auth');
    } else {
      const supabase = createBrowserSupabaseClient();
      await supabase.auth.signOut();
      setUser(null);
      localStorage.removeItem('cc_user_session');
      setIsLoading(false);
      router.push('/auth');
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('cc_user_session', JSON.stringify(updatedUser));

    if (!isMockMode) {
      const supabase = createBrowserSupabaseClient();
      await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);
    }
  };

  const setMockRole = (role: UserRole) => {
    const mockProfile = MOCK_PROFILES[role];
    if (mockProfile) {
      const newUser = { ...mockProfile };
      setUser(newUser);
      localStorage.setItem('cc_user_session', JSON.stringify(newUser));
      // Reload page to refresh layouts with new role permissions
      window.location.reload();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signIn,
        signUp,
        signOut,
        updateProfile,
        setMockRole,
        isMockMode
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
