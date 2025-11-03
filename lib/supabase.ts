import { createClient } from '@supabase/supabase-js';

// Obtener credenciales de variables de entorno
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variables de entorno de Supabase no configuradas');
  console.error('Se requieren: VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY');
  throw new Error('Supabase credentials are not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in environment variables.');
}

// Cliente para uso en cliente (frontend) - usa anon key
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

// Cliente para uso en servidor (backend/API) - usa service role key para bypass RLS
export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceRoleKey || supabaseAnonKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

// Función helper para obtener el cliente apropiado según el contexto
export function getSupabaseClient() {
  // Si estamos en el servidor (Vercel functions), usar admin client
  // Si estamos en el cliente, usar el cliente normal
  if (typeof window === 'undefined') {
    return supabaseAdmin;
  }
  return supabase;
}

export default supabase;

