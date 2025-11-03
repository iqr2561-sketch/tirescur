import { createClient } from '@supabase/supabase-js';

function resolveEnvVariable(names) {
  for (const name of names) {
    const value = process.env[name];
    if (value) {
      return value;
    }
  }
  return undefined;
}

const SUPABASE_URL = resolveEnvVariable([
  'SUPABASE_URL',
  'VITE_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_URL'
]);

const SUPABASE_ANON_KEY = resolveEnvVariable([
  'SUPABASE_ANON_KEY',
  'VITE_SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY'
]);

const SUPABASE_SERVICE_ROLE_KEY = resolveEnvVariable([
  'SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_SERVICE_KEY'
]);

let supabaseClient = undefined;

if (SUPABASE_URL && (SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY)) {
  supabaseClient = createClient(
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    }
  );
} else {
  console.warn('[supabase] Variables de entorno faltantes para inicializar Supabase', {
    SUPABASE_URL: !!SUPABASE_URL,
    SUPABASE_ANON_KEY: !!SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: !!SUPABASE_SERVICE_ROLE_KEY
  });
}

export const supabase = supabaseClient;

export function ensureSupabase() {
  if (!supabaseClient) {
    throw new Error('Supabase credentials are not configured.');
  }
  return supabaseClient;
}

export function getSupabaseClient() {
  return ensureSupabase();
}

export function getSupabaseServiceRole() {
  return ensureSupabase();
}

