import { parse } from 'url';
import allowCors from '../lib/cors.js';
import { ensureSupabase } from '../lib/supabase.js';

export default allowCors(async function handler(req, res) {
  try {
    const supabase = ensureSupabase();
    const { query, pathname } = parse(req.url ?? '', true);
    const popupId = query.id as string;

    if (req.method === 'GET') {
      const activeOnly = query.active === 'true';
      
      if (popupId) {
        // Get single popup
        const { data, error } = await supabase
          .from('popups')
          .select('*')
          .eq('id', popupId)
          .single();

        if (error || !data) {
          res.statusCode = 404;
          res.json({ error: 'Popup no encontrado' });
          return;
        }

        res.statusCode = 200;
        res.json(data);
        return;
      } else if (activeOnly) {
        // Get active popups only
        const now = new Date().toISOString();
        let queryBuilder = supabase
          .from('popups')
          .select('*')
          .eq('is_active', true);
        
        // Filter by date range
        queryBuilder = queryBuilder
          .or(`start_date.is.null,start_date.lte.${now}`)
          .or(`end_date.is.null,end_date.gte.${now}`);
        
        const { data, error } = await queryBuilder
          .order('priority', { ascending: false })
          .order('created_at', { ascending: false });

        if (error) {
          console.error('[Popups API] Error fetching active popups:', error);
          res.statusCode = 500;
          res.json({ error: error.message || 'Error al obtener popups activos' });
          return;
        }

        res.statusCode = 200;
        res.json(data || []);
        return;
      } else {
        // Get all popups
        const { data, error } = await supabase
          .from('popups')
          .select('*')
          .order('priority', { ascending: false })
          .order('created_at', { ascending: false });

        if (error) {
          console.error('[Popups API] Error fetching popups:', error);
          res.statusCode = 500;
          res.json({ error: error.message || 'Error al obtener popups' });
          return;
        }

        res.statusCode = 200;
        res.json(data || []);
        return;
      }
    }

    if (req.method === 'POST') {
      const body = await parseBody(req);
      const { data: inserted, error } = await supabase
        .from('popups')
        .insert(body)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      res.statusCode = 201;
      res.json(inserted);
      return;
    }

    if (req.method === 'PUT') {
      if (!popupId) {
        res.statusCode = 400;
        res.json({ error: 'id es requerido para actualizar' });
        return;
      }

      const body = await parseBody(req);
      const { data: updated, error } = await supabase
        .from('popups')
        .update(body)
        .eq('id', popupId)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      res.statusCode = 200;
      res.json(updated);
      return;
    }

    if (req.method === 'DELETE') {
      if (!popupId) {
        res.statusCode = 400;
        res.json({ error: 'id es requerido para eliminar' });
        return;
      }

      const { error } = await supabase
        .from('popups')
        .delete()
        .eq('id', popupId);

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
    console.error('[Popups API] Error:', error);
    res.statusCode = 500;
    res.json({ error: error?.message || 'Error interno del servidor' });
  }
});

async function parseBody(req: any): Promise<any> {
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

