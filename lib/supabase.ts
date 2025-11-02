import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL) {
  throw new Error('Please define the SUPABASE_URL environment variable inside .env.local');
}
if (!SUPABASE_ANON_KEY) {
  throw new Error('Please define the SUPABASE_ANON_KEY environment variable inside .env.local');
}

let supabase: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!supabase) {
    supabase = createClient(SUPABASE_URL as string, SUPABASE_ANON_KEY as string);
  }
  return supabase;
}