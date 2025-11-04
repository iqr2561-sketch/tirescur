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
      
      // Mapear campos del frontend a la base de datos
      const popupData: any = {
        title: body.title,
        message: body.message || null,
        image_url: body.image_url || body.imageUrl || null, // Aceptar ambos formatos
        button_text: body.button_text || body.buttonText || null,
        button_link: body.button_link || body.buttonLink || null,
        is_active: body.is_active !== undefined ? body.is_active : (body.isActive !== undefined ? body.isActive : true),
        auto_close_seconds: body.auto_close_seconds !== undefined ? body.auto_close_seconds : (body.autoCloseSeconds !== undefined ? body.autoCloseSeconds : null),
        show_on_page_load: body.show_on_page_load !== undefined ? body.show_on_page_load : (body.showOnPageLoad !== undefined ? body.showOnPageLoad : true),
        show_once_per_session: body.show_once_per_session !== undefined ? body.show_once_per_session : (body.showOncePerSession !== undefined ? body.showOncePerSession : true),
        priority: body.priority !== undefined ? body.priority : 0,
        start_date: body.start_date || body.startDate || null,
        end_date: body.end_date || body.endDate || null,
      };

      console.log('[Popups API] Creating popup with data:', {
        title: popupData.title,
        hasImageUrl: !!popupData.image_url,
        imageUrl: popupData.image_url?.substring(0, 50) || 'null',
      });

      const { data: inserted, error } = await supabase
        .from('popups')
        .insert(popupData)
        .select()
        .single();

      if (error) {
        console.error('[Popups API] Error creating popup:', error);
        throw new Error(error.message);
      }

      console.log('[Popups API] Popup created successfully:', {
        id: inserted.id,
        title: inserted.title,
        hasImageUrl: !!inserted.image_url,
      });

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
      
      // Mapear campos del frontend a la base de datos
      const popupData: any = {
        title: body.title,
        message: body.message !== undefined ? body.message : null,
        image_url: body.image_url !== undefined ? body.image_url : (body.imageUrl !== undefined ? body.imageUrl : null),
        button_text: body.button_text !== undefined ? body.button_text : (body.buttonText !== undefined ? body.buttonText : null),
        button_link: body.button_link !== undefined ? body.button_link : (body.buttonLink !== undefined ? body.buttonLink : null),
        is_active: body.is_active !== undefined ? body.is_active : (body.isActive !== undefined ? body.isActive : true),
        auto_close_seconds: body.auto_close_seconds !== undefined ? body.auto_close_seconds : (body.autoCloseSeconds !== undefined ? body.autoCloseSeconds : null),
        show_on_page_load: body.show_on_page_load !== undefined ? body.show_on_page_load : (body.showOnPageLoad !== undefined ? body.showOnPageLoad : true),
        show_once_per_session: body.show_once_per_session !== undefined ? body.show_once_per_session : (body.showOncePerSession !== undefined ? body.showOncePerSession : true),
        priority: body.priority !== undefined ? body.priority : 0,
        start_date: body.start_date !== undefined ? body.start_date : (body.startDate !== undefined ? body.startDate : null),
        end_date: body.end_date !== undefined ? body.end_date : (body.endDate !== undefined ? body.endDate : null),
      };

      console.log('[Popups API] Updating popup:', {
        id: popupId,
        title: popupData.title,
        hasImageUrl: !!popupData.image_url,
        imageUrl: popupData.image_url?.substring(0, 50) || 'null',
      });

      const { data: updated, error } = await supabase
        .from('popups')
        .update(popupData)
        .eq('id', popupId)
        .select()
        .single();

      if (error) {
        console.error('[Popups API] Error updating popup:', error);
        throw new Error(error.message);
      }

      console.log('[Popups API] Popup updated successfully:', {
        id: updated.id,
        title: updated.title,
        hasImageUrl: !!updated.image_url,
      });

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

