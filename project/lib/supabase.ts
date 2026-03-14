import { createBrowserClient } from '@supabase/ssr'

// Check environment variables to prevent silent failures
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('MISSING: NEXT_PUBLIC_SUPABASE_URL');
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('MISSING: NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * We use createBrowserClient from @supabase/ssr to ensure 
 * that Auth sessions are stored in COOKIES. 
 * This allows our Middleware to see the user and handle redirects correctly.
 */
export const supabase = createBrowserClient(
  supabaseUrl,
  supabaseAnonKey
);