import { parse } from 'url';
import allowCors from '../lib/cors.js';
import { ensureSupabase } from '../lib/supabase.js';
import { Brand } from '../types';

export default allowCors(async function handler(req, res) {
  try {
    const supabase = ensureSupabase();

    const { query } = parse(req.url ?? '', true);

    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .order('name');

      if (error) {
        throw new Error(error.message);
      }

      const formatted = (data || []).map(toClientBrand);
      res.statusCode = 200;
      res.json(formatted);
      return;
    }

    if (req.method === 'POST') {
      const body = (await parseBody(req)) as Omit<Brand, 'id'>;

      if (!body?.name?.trim()) {
        res.statusCode = 400;
        res.json({ error: 'El nombre de la marca es obligatorio' });
        return;
      }

      const existing = await supabase
        .from('brands')
        .select('*')
        .eq('name', body.name.trim())
        .maybeSingle();

      if (existing.data) {
        res.statusCode = 409;
        res.json({
          error: 'Ya existe una marca con ese nombre',
          brand: toClientBrand(existing.data)
        });
        return;
      }

      const { data, error } = await supabase
        .from('brands')
        .insert({
          name: body.name.trim(),
          logo_url: body.logoUrl || ''
        })
        .select()
        .single();

      if (error || !data) {
        throw new Error(error?.message || 'Error al crear la marca');
      }

      res.statusCode = 201;
      res.json(toClientBrand(data));
      return;
    }

    if (req.method === 'PUT') {
      const brandId = Array.isArray(query.id) ? query.id[0] : query.id;
      if (!brandId) {
        res.statusCode = 400;
        res.json({ error: 'Brand ID is required for update' });
        return;
      }

      const body = (await parseBody(req)) as Brand;
      if (!body?.name?.trim()) {
        res.statusCode = 400;
        res.json({ error: 'El nombre de la marca es obligatorio' });
        return;
      }

      const { data, error } = await supabase
        .from('brands')
        .update({
          name: body.name.trim(),
          logo_url: body.logoUrl || ''
        })
        .eq('id', brandId)
        .select()
        .single();

      if (error || !data) {
        throw new Error(error?.message || 'Error actualizando la marca');
      }

      res.statusCode = 200;
      res.json(toClientBrand(data));
      return;
    }

    if (req.method === 'DELETE') {
      const brandId = Array.isArray(query.id) ? query.id[0] : query.id;
      if (!brandId) {
        res.statusCode = 400;
        res.json({ error: 'Brand ID is required for delete' });
        return;
      }

      const { error } = await supabase
        .from('brands')
        .delete()
        .eq('id', brandId);

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
    console.error('[Brands API] Error en endpoint:', error);
    res.statusCode = 500;
    res.json({ message: error?.message || 'Error interno del servidor' });
  }
});

function toClientBrand(row: any): Brand {
  return {
    id: row.id,
    name: row.name,
    logoUrl: row.logo_url || ''
  };
}

async function parseBody<T>(req: any): Promise<T> {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk: string) => {
      data += chunk;
    });
    req.on('end', () => {
      if (!data) {
        resolve({} as T);
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
