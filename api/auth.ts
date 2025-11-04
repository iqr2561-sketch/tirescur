import { parse } from 'url';
import allowCors from '../lib/cors.js';
import { ensureSupabase } from '../lib/supabase.js';

// Configuración de credenciales admin (usar variables de entorno o valores por defecto)
const ADMIN_USERNAME = process.env.VITE_ADMIN_USERNAME || process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.VITE_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || '1234';

export default allowCors(async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      res.statusCode = 405;
      res.json({ error: 'Method not allowed' });
      return;
    }

    const body = await parseBody(req);
    const { username, password } = body;

    if (!username || !password) {
      res.statusCode = 400;
      res.json({ error: 'Username y password son requeridos' });
      return;
    }

    const sanitizedUsername = username.trim();
    const sanitizedPassword = password.trim();

    // Primero verificar credenciales estáticas (admin/1234)
    if (sanitizedUsername === ADMIN_USERNAME && sanitizedPassword === ADMIN_PASSWORD) {
      res.statusCode = 200;
      res.json({
        success: true,
        user: {
          username: ADMIN_USERNAME,
          display_name: 'Administrador',
          role: 'admin',
        },
      });
      return;
    }

    // Si no coincide, intentar con la base de datos
    const supabase = ensureSupabase();
    const { data: user, error } = await supabase
      .from('admin_users')
      .select('id, username, password, display_name, role, is_active')
      .eq('username', sanitizedUsername)
      .eq('is_active', true)
      .single();

    if (error || !user) {
      res.statusCode = 401;
      res.json({ error: 'Usuario o contraseña incorrectos' });
      return;
    }

    // Nota: En producción, deberías comparar con hash de la contraseña
    // Por ahora, comparamos directamente (solo para desarrollo)
    if (user.password !== sanitizedPassword) {
      res.statusCode = 401;
      res.json({ error: 'Usuario o contraseña incorrectos' });
      return;
    }

    const { password: _, ...safeUser } = user;
    res.statusCode = 200;
    res.json({
      success: true,
      user: {
        id: safeUser.id,
        username: safeUser.username,
        display_name: safeUser.display_name || safeUser.username,
        role: safeUser.role,
      },
    });
  } catch (error: any) {
    console.error('[Auth API] Error:', error);
    res.statusCode = 500;
    res.json({ error: error?.message || 'Error interno del servidor' });
  }
});

async function parseBody(req: any): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk: any) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

