'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

interface Employee {
  id: string;
  user_id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  is_admin: boolean;
  employee_id: string;
  phone: string;
  address: string;
  reporting_manager: string;
  joining_date: string;
}

interface AuthContextType {
  user: User | null;
  employee: Employee | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshEmployee: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchEmployee = async (userId: string) => {
    try {
      // First check if this is the hardcoded admin email
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user?.email === 'pixelnodeofficial@gmail.com') {
        // Hardcoded admin identity
        const adminEmployee: Employee = {
          id: 'admin-id',
          user_id: userId,
          name: 'Shubham Raj',
          email: 'pixelnodeofficial@gmail.com',
          role: 'Head of Development',
          department: 'Product',
          is_admin: true,
          employee_id: 'EMP001',
          phone: '',
          address: '',
          reporting_manager: '',
          joining_date: new Date().toISOString().split('T')[0],
        };
        setEmployee(adminEmployee);
        return;
      }

      // Try to fetch existing employee
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        // Employee doesn't exist, create one automatically
        console.log('Employee not found, creating profile for:', user?.email);
        
        const newEmployee = {
          user_id: userId,
          name: user?.user_metadata?.name || user?.email?.split('@')[0] || 'New User',
          email: user?.email || '',
          role: 'Employee',
          department: 'General',
          is_admin: false,
          employee_id: `EMP${Date.now().toString().slice(-6)}`,
          phone: '',
          address: '',
          reporting_manager: '',
          joining_date: new Date().toISOString().split('T')[0],
        };

        const { data: createdEmployee, error: createError } = await supabase
          .from('employees')
          .insert([newEmployee])
          .select()
          .single();

        if (createError) {
          console.error('Error creating employee profile:', createError);
          setEmployee(null);
        } else {
          console.log('Employee profile created successfully:', createdEmployee);
          setEmployee(createdEmployee);
        }
      } else if (error) {
        console.error('Error fetching employee:', error);
        setEmployee(null);
      } else {
        setEmployee(data);
      }
    } catch (error) {
      console.error('Unexpected error fetching employee:', error);
      setEmployee(null);
    }
  };

  const refreshEmployee = async () => {
    if (user) {
      await fetchEmployee(user.id);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setEmployee(null);
  };

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      
      if (session?.user) {
        await fetchEmployee(session.user.id);
      }
      
      setLoading(false);
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null);
        
        if (session?.user) {
          await fetchEmployee(session.user.id);
        } else {
          setEmployee(null);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, employee, loading, signOut, refreshEmployee }}>
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
