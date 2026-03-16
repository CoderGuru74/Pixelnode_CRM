import { createBrowserClient } from '@supabase/ssr'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase Environment Variables');
}

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      // This is the CRITICAL fix for the "Lock broken" / "steal" error
      // It prevents multiple tabs/refreshes from fighting over the session lock
      lockType: 'custom',
      serialize: (data) => JSON.stringify(data),
      parse: (data) => JSON.parse(data),
    }
  }
);