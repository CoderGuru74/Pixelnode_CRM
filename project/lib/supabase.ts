import { createClient } from '@supabase/supabase-js';

// Check environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.error('MISSING: NEXT_PUBLIC_SUPABASE_URL');
  throw new Error('Supabase URL is not configured');
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.error('MISSING: NEXT_PUBLIC_SUPABASE_ANON_KEY');
  throw new Error('Supabase Anon Key is not configured');
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    flowType: 'pkce',
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});