'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  employee: any | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  employee: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [employee, setEmployee] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (currentUser: User) => {
    try {
      // 1. Hardcoded check for your admin account
      if (currentUser.email === 'pixelnodeofficial@gmail.com') {
        setEmployee({
          name: 'Shubham Raj',
          is_admin: true,
          role: 'Admin', // Added role for your sidebar check
          department: 'Administration',
          email: currentUser.email
        });
        return;
      }

      // 2. Fetch from Database for others
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('user_id', currentUser.id)
        .single();

      if (!error && data) {
        setEmployee(data);
      } else {
        // Fallback for missing profile
        setEmployee({ name: 'User', role: 'Employee', email: currentUser.email });
      }
    } catch (e) {
      console.error("Profile Fetch Error", e);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          // AWAIT the profile fetch so loading stays true until we have data
          await fetchProfile(session.user);
        }
      } catch (err) {
        console.error("Auth Init Error:", err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user);
        setLoading(false);
      } else {
        setUser(null);
        setEmployee(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    // Clear cookies manually to support the middleware fix
    document.cookie = "sb-access-token=; Path=/; Max-Age=0;";
    window.location.href = '/signin';
  };

  return (
    <AuthContext.Provider value={{ user, employee, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);