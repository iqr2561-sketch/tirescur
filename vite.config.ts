import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: 'localhost',
        hmr: {
          protocol: 'ws'
        },
        // Proxy para redirigir /api a Vercel en desarrollo local
        proxy: {
          '/api': {
            target: env.VITE_VERCEL_URL || 'https://tirescur.vercel.app',
            changeOrigin: true,
            secure: true,
            rewrite: (path) => path, // Mantener /api en la ruta
          }
        }
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.VITE_VERCEL_URL': JSON.stringify(env.VITE_VERCEL_URL || 'https://tirescur.vercel.app'),
        // Exponer variables de Supabase para el cliente
        'process.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL || ''),
        'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY || ''),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        },
        extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json']
      },
      build: {
        rollupOptions: {
          output: {
            manualChunks: {
              // Separar React y ReactDOM en su propio chunk
              'react-vendor': ['react', 'react-dom', 'react-router-dom'],
              // Separar Supabase en su propio chunk
              'supabase-vendor': ['@supabase/supabase-js'],
              // Separar xlsx en su propio chunk (solo se usa en admin)
              'xlsx-vendor': ['xlsx'],
            },
          },
        },
        // Aumentar el límite de warning de chunk size (opcional)
        chunkSizeWarningLimit: 1000,
      },
    };
});
