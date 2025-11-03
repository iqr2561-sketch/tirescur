import { parse } from 'url';
import allowCors from '../lib/cors.js';
import { ensureSupabase } from '../lib/supabase.js';

const ICON_MAP = {
  'Neumáticos de Verano': 'tire',
  'Neumáticos de Invierno': 'tire',
  'Neumáticos Todo el Año': 'tire',
  'Neumáticos para SUV': 'wheel',
  'Neumáticos de Camioneta': 'wheel',
  'Accesorios para Neumáticos': 'accessory',
  'Válvulas y Sensores': 'valve'
};

export default allowCors(async function handler(req, res) {
  try {
    const supabase = ensureSupabase();

    const { query } = parse(req.url ?? '', true);

    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('order', { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      const formatted = (data || []).map((row: any) => toClientCategory(row));
      res.statusCode = 200;
      res.json(formatted);
      return;
    }

    if (req.method === 'POST') {
      const body = await parseBody(req);

      if (!body?.name?.trim()) {
        res.statusCode = 400;
        res.json({ error: 'El nombre de la categoría es obligatorio' });
        return;
      }

      const existing = await supabase
        .from('categories')
        .select('*')
        .eq('name', body.name.trim())
        .maybeSingle();

      if (existing.data) {
        res.statusCode = 409;
        res.json({ error: 'Ya existe una categoría con ese nombre' });
        return;
      }

      const payload = mapCategoryForInsert(body);
      const { data, error } = await supabase
        .from('categories')
        .insert(payload)
        .select()
        .single();

      if (error || !data) {
        throw new Error(error?.message || 'Error al crear la categoría');
      }

      res.statusCode = 201;
      res.json(toClientCategory(data));
      return;
    }

    if (req.method === 'PUT') {
      const categoryId = Array.isArray(query.id) ? query.id[0] : query.id;
      if (!categoryId) {
        res.statusCode = 400;
        res.json({ error: 'Category ID is required for update' });
        return;
      }

      const body = await parseBody(req);
      const payload = mapCategoryForInsert(body, false);

      const { data, error } = await supabase
        .from('categories')
        .update(payload)
        .eq('id', categoryId)
        .select()
        .single();

      if (error || !data) {
        throw new Error(error?.message || 'Error al actualizar la categoría');
      }

      res.statusCode = 200;
      res.json(toClientCategory(data));
      return;
    }

    if (req.method === 'DELETE') {
      const categoryId = Array.isArray(query.id) ? query.id[0] : query.id;
      if (!categoryId) {
        res.statusCode = 400;
        res.json({ error: 'Category ID is required for delete' });
        return;
      }

      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);

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
    console.error('[Categories API] Error en endpoint:', error);
    res.statusCode = 500;
    res.json({ message: error?.message || 'Error interno del servidor' });
  }
});

function mapCategoryForInsert(category: any, requireName = true) {
  if (requireName && !category?.name) {
    throw new Error('El nombre de la categoría es obligatorio');
  }

  return {
    name: category.name?.trim(),
    icon_type: category.iconType || ICON_MAP[category.name] || 'tire',
    image_url: category.imageUrl || '',
    description: category.description || '',
    order: category.order || 0,
    is_active: category.isActive !== false
  };
}

function toClientCategory(row: any) {
  return {
    id: row.id,
    name: row.name,
    imageUrl: row.image_url || '',
    description: row.description || '',
    order: row.order || 0,
    isActive: row.is_active !== false,
    iconType: row.icon_type || 'tire'
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
