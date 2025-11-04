import { parse } from 'url';
import allowCors from '../lib/cors.js';
import { ensureSupabase } from '../lib/supabase.js';

export default allowCors(async function handler(req, res) {
  try {
    const supabase = ensureSupabase();
    const { query, pathname } = parse(req.url ?? '', true);
    const settingKey = query.key as string;

    if (req.method === 'GET') {
      if (settingKey) {
        // Get single setting
        const { data, error } = await supabase
          .from('settings')
          .select('*')
          .eq('key', settingKey)
          .single();

        if (error || !data) {
          res.statusCode = 404;
          res.json({ error: 'Configuración no encontrada' });
          return;
        }

        res.statusCode = 200;
        res.json(data);
        return;
      } else {
        // Get all settings
        const { data, error } = await supabase
          .from('settings')
          .select('*')
          .order('key', { ascending: true });

        if (error) {
          throw new Error(error.message);
        }

        res.statusCode = 200;
        res.json(data || []);
        return;
      }
    }

    if (req.method === 'POST' || req.method === 'PUT') {
      const body = await parseBody(req);
      const { key, value, description } = body;

      if (!key || !value) {
        res.statusCode = 400;
        res.json({ error: 'key y value son requeridos' });
        return;
      }

      // Upsert setting
      // Manejar el value: si es string, intentar parsearlo como JSON, si falla, usar como string
      let parsedValue = value;
      if (typeof value === 'string') {
        try {
          // Intentar parsear como JSON
          parsedValue = JSON.parse(value);
        } catch (e) {
          // Si no es JSON válido, es un string simple (como una URL)
          // Guardarlo como string JSON
          parsedValue = value;
        }
      }
      
      const { data, error } = await supabase
        .from('settings')
        .upsert({
          key,
          value: parsedValue,
          description: description || null,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'key'
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      res.statusCode = 200;
      res.json(data);
      return;
    }

    if (req.method === 'DELETE') {
      if (!settingKey) {
        res.statusCode = 400;
        res.json({ error: 'key es requerido para eliminar' });
        return;
      }

      const { error } = await supabase
        .from('settings')
        .delete()
        .eq('key', settingKey);

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
    console.error('[Settings API] Error:', error);
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
