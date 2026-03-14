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

      // 1. Try to get Employee from DB first
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('user_id', currentUser.id)
        .single();

      if (!error && data) {
        // SUCCESS: Data found in database
        setEmployee(data);
        return;
      }

      // 2. Fallback for Master Admin (PixelNode Official)
      if (userEmail === 'pixelnodeofficial@gmail.com') {
        setEmployee({
          name: 'Shubham Raj',
          is_admin: true,
          role: 'Head of Agency',
          department: 'Administration',
          email: userEmail,
          user_id: currentUser.id
        });
        return;
      }

      // 3. Fallback: Data not found in DB yet
      // We use "Syncing..." instead of "General" so you know the DB is missing this user
      setEmployee({ 
        name: userEmail.split('@')[0], 
        role: 'Verifying Role...', 
        department: 'Syncing Dept...', 
        is_admin: false,
        email: userEmail 
      });
      
    } catch (e) {
      console.error("Critical Auth Sync Error:", e);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user);
        }
      } catch (err) {
        console.error("Auth Initialization Error:", err);
      } finally {
        // Ensure the loading screen disappears
        setLoading(false);
      }
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
    try {
      await supabase.auth.signOut();
      
      // Clean manual cookies
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });

      setUser(null);
      setEmployee(null);
      window.location.replace('/signin');
    } catch (error) {
      console.error("Signout Error:", error);
      window.location.replace('/signin');
    }
  };

  // Ultimate source of truth for Admin status
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