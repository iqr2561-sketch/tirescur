import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Función helper para obtener las variables de entorno
// En Vercel serverless functions, las variables VITE_ no están disponibles
// Necesitamos usar las variables sin prefijo VITE_ o NEXT_PUBLIC_ en el servidor
function getEnvVars() {
  const isServer = typeof window === 'undefined';
  
  // En Vite, las variables están disponibles como import.meta.env en el cliente
  // En Node.js (servidor), están en process.env
  
  let supabaseUrl = '';
  let supabaseAnonKey = '';
  
  if (isServer) {
    // En el servidor (serverless functions), usar variables sin prefijo o NEXT_PUBLIC_
    // También buscar nombres alternativos que pueden estar en Vercel (español, diferentes formatos)
    supabaseUrl = process.env.SUPABASE_URL || 
                  process.env.URL_SUPABASE || // Nombre alternativo en español
                  process.env.NEXT_PUBLIC_SUPABASE_URL || 
                  process.env.URL_SUPABASE_PUBLICA_SIGUIENTE || // Nombre alternativo traducido
                  process.env.VITE_SUPABASE_URL ||
                  process.env.URL_SUPABASE_VITE || // Nombre alternativo
                  '';
    supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 
                      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
                      process.env.SIGUIENTE_CLAVE_ANONIMA_SUPABASE_P || // Nombre alternativo traducido
                      process.env.VITE_SUPABASE_ANON_KEY ||
                      '';
  } else {
    // En el cliente (frontend), Vite expone variables con prefijo VITE_ a través de import.meta.env
    // También intentamos leer de process.env por si está definido en vite.config.ts
    const viteEnv = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : {};
    supabaseUrl = (viteEnv.VITE_SUPABASE_URL as string) || 
                  process.env.VITE_SUPABASE_URL || 
                  process.env.URL_SUPABASE_VITE || // Nombre alternativo
                  process.env.VITE_SUPABASE_UR || // Variante truncada
                  (viteEnv.NEXT_PUBLIC_SUPABASE_URL as string) ||
                  process.env.NEXT_PUBLIC_SUPABASE_URL || 
                  process.env.URL_SUPABASE_PUBLICA_SIGUIENTE ||
                  process.env.SUPABASE_URL ||
                  process.env.URL_SUPABASE || // Nombre alternativo
                  '';
                  
    supabaseAnonKey = (viteEnv.VITE_SUPABASE_ANON_KEY as string) || 
                      process.env.VITE_SUPABASE_ANON_KEY || 
                      (viteEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY as string) ||
                      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
                      process.env.SIGUIENTE_CLAVE_ANONIMA_SUPABASE_P ||
                      process.env.SUPABASE_ANON_KEY || 
                      '';
  }
    
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  if (!supabaseUrl || !supabaseAnonKey) {
    const missing = [];
    if (!supabaseUrl) {
      if (isServer) {
        missing.push('SUPABASE_URL o NEXT_PUBLIC_SUPABASE_URL');
      } else {
        missing.push('VITE_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_URL');
      }
    }
    if (!supabaseAnonKey) {
      if (isServer) {
        missing.push('SUPABASE_ANON_KEY o NEXT_PUBLIC_SUPABASE_ANON_KEY');
      } else {
        missing.push('VITE_SUPABASE_ANON_KEY o NEXT_PUBLIC_SUPABASE_ANON_KEY');
      }
    }
    
    console.error('❌ Variables de entorno de Supabase no configuradas');
    console.error(`Se requieren en ${isServer ? 'servidor' : 'cliente'}:`, missing.join(', '));
    console.error('Variables disponibles:', {
      SUPABASE_URL: !!process.env.SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      VITE_SUPABASE_URL: !!process.env.VITE_SUPABASE_URL,
      SUPABASE_ANON_KEY: !!process.env.SUPABASE_ANON_KEY,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      VITE_SUPABASE_ANON_KEY: !!process.env.VITE_SUPABASE_ANON_KEY,
    });
    
    // En el servidor, no lanzar error inmediatamente, sino retornar null para manejar después
    if (isServer) {
      console.error('⚠️ El cliente de Supabase no se inicializará hasta que las variables estén configuradas');
      return { supabaseUrl: '', supabaseAnonKey: '', supabaseServiceRoleKey: '' };
    }
    
    throw new Error(`Supabase credentials are not configured. Please set ${missing.join(' and ')} in environment variables.`);
  }

  return { supabaseUrl, supabaseAnonKey, supabaseServiceRoleKey };
}

// Inicializar clientes de forma lazy
let supabaseClient: SupabaseClient | null = null;
let supabaseAdminClient: SupabaseClient | null = null;

// Función para obtener el cliente de Supabase (frontend)
export function getSupabase(): SupabaseClient {
  if (!supabaseClient) {
    const { supabaseUrl, supabaseAnonKey } = getEnvVars();
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase credentials are not configured for client');
    }
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return supabaseClient;
}

// Función para obtener el cliente admin de Supabase (backend/serverless)
export function getSupabaseAdmin(): SupabaseClient {
  if (!supabaseAdminClient) {
    const { supabaseUrl, supabaseAnonKey, supabaseServiceRoleKey } = getEnvVars();
    
    // Validar que tengamos las credenciales mínimas
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('❌ No se pueden inicializar las credenciales de Supabase en el servidor');
      console.error('Variables disponibles:', {
        SUPABASE_URL: !!process.env.SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        VITE_SUPABASE_URL: !!process.env.VITE_SUPABASE_URL,
        SUPABASE_ANON_KEY: !!process.env.SUPABASE_ANON_KEY,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        VITE_SUPABASE_ANON_KEY: !!process.env.VITE_SUPABASE_ANON_KEY,
      });
      throw new Error('Supabase credentials are not configured. Please set SUPABASE_URL and SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY) in Vercel environment variables.');
    }
    
    supabaseAdminClient = createClient(
      supabaseUrl,
      supabaseServiceRoleKey || supabaseAnonKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );
  }
  return supabaseAdminClient;
}

// Exportar clientes para compatibilidad hacia atrás (solo cuando sea seguro)
// No inicializar supabaseAdmin al importar para evitar errores si las vars no están configuradas
export const supabase = typeof window !== 'undefined' ? getSupabase() : null as any;
// export const supabaseAdmin = getSupabaseAdmin(); // No exportar directamente, usar getSupabaseAdmin()

// Función helper para obtener el cliente apropiado según el contexto
export function getSupabaseClient() {
  // Si estamos en el servidor (Vercel functions), usar admin client
  // Si estamos en el cliente, usar el cliente normal
  if (typeof window === 'undefined') {
    return getSupabaseAdmin();
  }
  return getSupabase();
}

export default supabase;

