'use client';

import { createBrowserClient } from '@supabase/ssr';
import { toast } from 'sonner';

// Initialize Supabase Client
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * Handles the Clock In logic
 */
export const handleClockIn = async (userId: string) => {
  try {
    const { error } = await supabase.from('attendance').insert([
      { 
        employee_id: userId, 
        check_in: new Date().toISOString(),
        status: 'Present'
      }
    ]);

    if (error) throw error;
    
    toast.success("Clocked in successfully!");
    return { success: true };
  } catch (error: any) {
    console.error("Clock In Error:", error);
    toast.error(error.message || "Failed to Clock In");
    return { success: false };
  }
};

/**
 * Handles the Clock Out logic
 */
export const handleClockOut = async (userId: string) => {
  try {
    // 1. Find the active record for today (where check_out is null)
    const { data: activeSession, error: findError } = await supabase
      .from('attendance')
      .select('id')
      .eq('employee_id', userId)
      .is('check_out', null)
      .order('check_in', { ascending: false })
      .limit(1)
      .single();

    if (findError || !activeSession) {
      toast.error("No active session found to clock out from.");
      return { success: false };
    }

    // 2. Update that record with a check_out timestamp
    const { error: updateError } = await supabase
      .from('attendance')
      .update({ check_out: new Date().toISOString() })
      .eq('id', activeSession.id);

    if (updateError) throw updateError;

    toast.success("Clocked out successfully. Great work today!");
    return { success: true };
  } catch (error: any) {
    console.error("Clock Out Error:", error);
    toast.error(error.message || "Failed to Clock Out");
    return { success: false };
  }
};