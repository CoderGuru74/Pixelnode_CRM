'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export async function createEmployeeAction(formData: {
  full_name: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  role: string;
  department: string;
  emp_id: string;
}) {
  try {
    // Create user with admin client (bypasses rate limits)
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email: formData.email,
      password: formData.password,
      email_confirm: true,
      user_metadata: {
        name: formData.full_name,
      }
    });

    if (authError) {
      console.error('Error creating auth user:', authError);
      if (authError.message.includes('duplicate')) {
        return { success: false, error: 'Email already exists' };
      } else {
        return { success: false, error: `Failed to create user account: ${authError.message}` };
      }
    }

    // Create profile record using regular client (for RLS)
    const { supabase } = await import('@/lib/supabase');
    
    const { error: profileError } = await supabase.from('profiles').insert([
      {
        id: authData.user?.id, // Use auth user UUID as profile ID
        full_name: formData.full_name,
        email: formData.email,
        emp_id: formData.emp_id || `EMP${Date.now().toString().slice(-6)}`,
        role: formData.role || 'Employee',
        department: formData.department,
        phone: formData.phone,
        address: formData.address,
        updated_at: new Date().toISOString(),
      },
    ]);

    if (profileError) {
      console.error('Error creating profile record:', profileError);
      // Clean up auth user if profile creation fails
      if (authData.user?.id) {
        await adminClient.auth.admin.deleteUser(authData.user.id);
      }
      return { success: false, error: `Failed to create profile record: ${profileError.message}` };
    }

    // Revalidate the account page to show new data
    revalidatePath('/account');
    
    return { success: true, message: 'Employee created successfully' };
  } catch (error) {
    console.error('Unexpected error in employee creation:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}
