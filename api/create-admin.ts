import { parse } from 'url';
import allowCors from '../lib/cors.js';
import { ensureSupabase } from '../lib/supabase.js';

export default allowCors(async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      res.statusCode = 405;
      res.json({ error: 'Method not allowed' });
      return;
    }

    const supabase = ensureSupabase();
    const body = await parseBody(req);

    const email = body?.email || 'admin@webgomeria.com';
    const password = body?.password || '1234';

    // Crear usuario admin usando Supabase Auth Admin API
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Confirmar email automáticamente
      user_metadata: {
        role: 'admin',
        display_name: 'Administrador'
      }
    });

    if (error) {
      console.error('[Create Admin] Error:', error);
      res.statusCode = 400;
      res.json({ 
        error: error.message || 'Error al crear el usuario admin',
        details: error
      });
      return;
    }

    if (!data?.user) {
      res.statusCode = 500;
      res.json({ error: 'No se pudo crear el usuario admin' });
      return;
    }

    res.statusCode = 201;
    res.json({
      success: true,
      message: 'Usuario admin creado exitosamente',
      user: {
        id: data.user.id,
        email: data.user.email,
        role: data.user.user_metadata?.role || 'admin'
      }
    });
  } catch (error: any) {
    console.error('[Create Admin] Error en endpoint:', error);
    res.statusCode = 500;
    res.json({ 
      error: error?.message || 'Error interno del servidor',
      message: 'No se pudo crear el usuario admin'
    });
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

