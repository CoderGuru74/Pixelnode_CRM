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
          role: 'Admin',
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
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
    try {
      // 1. Sign out of the Supabase Client
      await supabase.auth.signOut();

      // 2. Clear ALL Supabase cookies manually to prevent Middleware from re-logging in
      const cookies = document.cookie.split(";");
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        
        // Target any cookie that starts with 'sb-' (Supabase standard)
        if (name.startsWith('sb-')) {
          document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
        }
      }

      // 3. Reset state
      setUser(null);
      setEmployee(null);

      // 4. Force a clean redirect and clear browser history of the dashboard
      window.location.replace('/signin');
    } catch (error) {
      console.error("Logout Error:", error);
      window.location.replace('/signin');
    }
  };

  return (
    <AuthContext.Provider value={{ user, employee, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);