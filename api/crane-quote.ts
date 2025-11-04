import allowCors from '../lib/cors.js';
import { ensureSupabase } from '../lib/supabase.js';

export default allowCors(async function handler(req, res) {
  try {
    const supabase = ensureSupabase();

    if (req.method === 'GET') {
      // Obtener configuración
      const { data, error } = await supabase
        .from('crane_quote_config')
        .select('*')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows returned, pero no es un error si no hay config
        console.error('[Crane Quote API] Error fetching config:', error);
        throw new Error(error.message);
      }

      if (!data) {
        // Retornar configuración por defecto
        res.statusCode = 200;
        res.json({
          pricePerKilometer: 2000,
          pricePerPassenger: 3000,
          pricePerTrailer: 600,
          whatsappNumber: '+5492245506078',
          vehicleTypes: [
            { id: '1', name: 'Utilitario', basePrice: 5000 },
            { id: '2', name: 'Auto', basePrice: 200 },
          ],
          additionalOptions: [],
        });
        return;
      }

      // Mapear datos de Supabase a formato cliente
      res.statusCode = 200;
      res.json({
        pricePerKilometer: parseFloat(data.price_per_kilometer || 2000),
        pricePerPassenger: parseFloat(data.price_per_passenger || 3000),
        pricePerTrailer: parseFloat(data.price_per_trailer || 600),
        whatsappNumber: data.whatsapp_number || '+5492245506078',
        vehicleTypes: data.vehicle_types || [],
        additionalOptions: data.additional_options || [],
      });
      return;
    }

    if (req.method === 'PUT') {
      // Actualizar configuración
      const body = await parseBody(req);
      
      const { data: existingData } = await supabase
        .from('crane_quote_config')
        .select('id')
        .limit(1)
        .single();

      const configData = {
        price_per_kilometer: body.pricePerKilometer || 2000,
        price_per_passenger: body.pricePerPassenger || 3000,
        price_per_trailer: body.pricePerTrailer || 600,
        whatsapp_number: body.whatsappNumber || '+5492245506078',
        vehicle_types: body.vehicleTypes || [],
        additional_options: body.additionalOptions || [],
        updated_at: new Date().toISOString(),
      };

      let result;
      if (existingData) {
        // Actualizar
        const { data, error } = await supabase
          .from('crane_quote_config')
          .update(configData)
          .eq('id', existingData.id)
          .select()
          .single();

        if (error) {
          throw new Error(error.message);
        }
        result = data;
      } else {
        // Crear nuevo
        const { data, error } = await supabase
          .from('crane_quote_config')
          .insert(configData)
          .select()
          .single();

        if (error) {
          throw new Error(error.message);
        }
        result = data;
      }

      res.statusCode = 200;
      res.json({
        pricePerKilometer: parseFloat(result.price_per_kilometer),
        pricePerPassenger: parseFloat(result.price_per_passenger),
        pricePerTrailer: parseFloat(result.price_per_trailer),
        whatsappNumber: result.whatsapp_number,
        vehicleTypes: result.vehicle_types || [],
        additionalOptions: result.additional_options || [],
      });
      return;
    }

    res.statusCode = 405;
    res.json({ error: 'Método no permitido' });
  } catch (error: any) {
    console.error('[Crane Quote API] Error:', error);
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

