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
        host: '0.0.0.0',
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
        'process.env.VITE_VERCEL_URL': JSON.stringify(env.VITE_VERCEL_URL || 'https://tirescur.vercel.app')
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
