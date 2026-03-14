'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  employee: any | null;
  loading: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  employee: null,
  loading: true,
  isAdmin: false,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [employee, setEmployee] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (currentUser: User) => {
    try {
      const userEmail = currentUser.email?.toLowerCase() || '';
      console.log("Current Logged In Email:", userEmail); // DEBUG: Check your console!

      // 1. MASTER ADMIN BYPASS (Hardcoded Fix)
      if (userEmail === 'pixelnodeofficial@gmail.com') {
        console.log("Admin Bypass Triggered for:", userEmail);
        setEmployee({
          name: 'Shubham Raj',
          is_admin: true,
          role: 'Admin',
          email: userEmail,
          user_id: currentUser.id
        });
        return; 
      }

      // 2. REGULAR DB FETCH
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('user_id', currentUser.id)
        .single();

      if (!error && data) {
        setEmployee(data);
      } else {
        setEmployee({ 
          name: userEmail.split('@')[0], 
          role: 'Employee', 
          is_admin: false,
          email: userEmail 
        });
      }
    } catch (e) {
      console.error("Auth Error:", e);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user);
      }
      setLoading(false);
    };
    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user);
      } else {
        setUser(null);
        setEmployee(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    // Force clear all local state
    setUser(null);
    setEmployee(null);
    window.location.href = '/signin';
  };

  // FORCE ADMIN IF EMAIL MATCHES
  const finalIsAdmin = employee?.is_admin === true || user?.email?.toLowerCase() === 'pixelnodeofficial@gmail.com';

  return (
    <AuthContext.Provider value={{ 
      user, 
      employee, 
      loading, 
      isAdmin: finalIsAdmin,
      signOut 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);