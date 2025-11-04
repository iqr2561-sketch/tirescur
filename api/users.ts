import { parse } from 'url';
import allowCors from '../lib/cors.js';
import { ensureSupabase } from '../lib/supabase.js';

export default allowCors(async function handler(req, res) {
  try {
    const supabase = ensureSupabase();
    const { query, pathname } = parse(req.url ?? '', true);

    if (req.method === 'GET') {
      // Obtener todos los usuarios
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      // No devolver las contraseñas
      const safeUsers = (data || []).map((user: any) => {
        const { password, ...safeUser } = user;
        return safeUser;
      });

      res.statusCode = 200;
      res.json(safeUsers);
      return;
    }

    if (req.method === 'POST') {
      const body = await parseBody(req);
      const { username, password, display_name, role } = body;

      if (!username || !password) {
        res.statusCode = 400;
        res.json({ error: 'Username y password son requeridos' });
        return;
      }

      // Verificar si el usuario ya existe
      const { data: existingUser } = await supabase
        .from('admin_users')
        .select('id')
        .eq('username', username)
        .single();

      if (existingUser) {
        res.statusCode = 400;
        res.json({ error: 'El usuario ya existe' });
        return;
      }

      // Crear nuevo usuario (en producción, deberías hashear la contraseña)
      const { data, error } = await supabase
        .from('admin_users')
        .insert({
          username,
          password, // En producción, hashear con bcrypt
          display_name: display_name || username,
          role: role || 'admin',
          is_active: true
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      const { password: _, ...safeUser } = data;
      res.statusCode = 201;
      res.json(safeUser);
      return;
    }

    if (req.method === 'PUT') {
      const body = await parseBody(req);
      const { id, username, password, display_name, role, is_active } = body;

      if (!id) {
        res.statusCode = 400;
        res.json({ error: 'ID es requerido' });
        return;
      }

      const updateData: any = {};
      if (username !== undefined) updateData.username = username;
      if (password !== undefined) updateData.password = password; // En producción, hashear
      if (display_name !== undefined) updateData.display_name = display_name;
      if (role !== undefined) updateData.role = role;
      if (is_active !== undefined) updateData.is_active = is_active;

      const { data, error } = await supabase
        .from('admin_users')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      const { password: _, ...safeUser } = data;
      res.statusCode = 200;
      res.json(safeUser);
      return;
    }

    if (req.method === 'DELETE') {
      const { id } = query;

      if (!id || typeof id !== 'string') {
        res.statusCode = 400;
        res.json({ error: 'ID es requerido' });
        return;
      }

      const { error } = await supabase
        .from('admin_users')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(error.message);
      }

      res.statusCode = 200;
      res.json({ success: true, message: 'Usuario eliminado correctamente' });
      return;
    }

    res.statusCode = 405;
    res.json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('[Users API] Error:', error);
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

