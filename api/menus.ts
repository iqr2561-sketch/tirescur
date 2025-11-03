import { parse } from 'url';
import allowCors from '../lib/cors.js';
import { ensureSupabase } from '../lib/supabase.js';

export default allowCors(async function handler(req, res) {
  try {
    const supabase = ensureSupabase();

    const { query, pathname } = parse(req.url ?? '', true);

    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('order', { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      res.statusCode = 200;
      res.json((data || []).map(toClientMenuItem));
      return;
    }

    if (req.method === 'POST') {
      const body = await parseBody(req);
      const payload = mapMenuForInsert(body);

      const { data, error } = await supabase
        .from('menu_items')
        .insert(payload)
        .select()
        .single();

      if (error || !data) {
        throw new Error(error?.message || 'Error creando menú');
      }

      res.statusCode = 201;
      res.json(toClientMenuItem(data));
      return;
    }

    if (req.method === 'PUT') {
      const menuId = Array.isArray(query.id) ? query.id[0] : query.id;
      if (!menuId) {
        res.statusCode = 400;
        res.json({ error: 'Menu ID is required for update' });
        return;
      }

      const body = await parseBody(req);
      const payload = mapMenuForInsert(body, false);

      const { data, error } = await supabase
        .from('menu_items')
        .update(payload)
        .eq('id', menuId)
        .select()
        .single();

      if (error || !data) {
        throw new Error(error?.message || 'Error actualizando menú');
      }

      res.statusCode = 200;
      res.json(toClientMenuItem(data));
      return;
    }

    if (req.method === 'DELETE') {
      const menuId = Array.isArray(query.id) ? query.id[0] : query.id;
      if (!menuId) {
        res.statusCode = 400;
        res.json({ error: 'Menu ID is required for delete' });
        return;
      }

      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', menuId);

      if (error) {
        throw new Error(error.message);
      }

      res.statusCode = 204;
      res.end();
      return;
    }

    res.statusCode = 405;
    res.json({ error: 'Método no permitido' });
  } catch (error: any) {
    console.error('[Menus API] Error en endpoint:', error);
    res.statusCode = 500;
    res.json({ message: error?.message || 'Error interno del servidor' });
  }
});

function mapMenuForInsert(menu: any, requireName = true) {
  if (requireName && !menu?.name) {
    throw new Error('El nombre del menú es obligatorio');
  }

  return {
    name: menu.name,
    path: menu.path,
    is_external: menu.isExternal || false,
    order: menu.order || 0,
    location: menu.location,
    type: menu.type
  };
}

function toClientMenuItem(row: any) {
  return {
    id: row.id,
    name: row.name,
    path: row.path,
    location: row.location,
    order: row.order,
    isExternal: row.is_external || false,
    type: row.type
  };
}

async function parseBody(req: any) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk: string) => {
      data += chunk;
    });
    req.on('end', () => {
      if (!data) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(data));
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', (error: Error) => reject(error));
  });
}
