import { createClient } from '@supabase/supabase-js';
import { customFetch } from './fetch';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

// We need a server-side client with the service role key to bypass RLS
// if needed, and to cleanly insert authenticated/unauthenticated data.
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// This is for browser/client-side fetching (like the dropdown forms).
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase Environment Variables');
} else {
  console.log('Supabase URL:', supabaseUrl);
}

// Client specifically for browser usage
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey || '', {
  global: { fetch: customFetch }
});

// Client specifically for Next.js API Routes (Server Side)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey || '', {
  global: { fetch: customFetch }
});
