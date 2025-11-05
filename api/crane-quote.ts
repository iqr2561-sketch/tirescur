import allowCors from '../lib/cors.js';
import { ensureSupabase } from '../lib/supabase.js';

export default allowCors(async function handler(req, res) {
  try {
    const supabase = ensureSupabase();

    if (req.method === 'GET') {
      // Obtener configuración principal
      const { data: configData, error: configError } = await supabase
        .from('crane_quote_config')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (configError && configError.code !== 'PGRST116') {
        console.error('[Crane Quote API] Error fetching config:', configError);
        throw new Error(configError.message);
      }

      // Obtener tipos de vehículos
      const { data: vehicleTypesData, error: vehicleTypesError } = await supabase
        .from('crane_vehicle_types')
        .select('*')
        .order('created_at', { ascending: true });

      if (vehicleTypesError) {
        console.error('[Crane Quote API] Error fetching vehicle types:', vehicleTypesError);
        // Continuar con array vacío si hay error
      }

      // Obtener opciones adicionales
      const { data: additionalOptionsData, error: additionalOptionsError } = await supabase
        .from('crane_additional_options')
        .select('*')
        .order('created_at', { ascending: true });

      if (additionalOptionsError) {
        console.error('[Crane Quote API] Error fetching additional options:', additionalOptionsError);
        // Continuar con array vacío si hay error
      }

      // Si no hay configuración, retornar valores por defecto
      if (!configData) {
        res.statusCode = 200;
        res.json({
          pricePerKilometer: 2000,
          pricePerPassenger: 3000,
          pricePerTrailer: 600,
          whatsappNumber: '+5492245506078',
          vehicleTypes: vehicleTypesData || [],
          additionalOptions: additionalOptionsData || [],
        });
        return;
      }

      // Mapear datos de Supabase a formato cliente
      res.statusCode = 200;
      res.json({
        pricePerKilometer: parseFloat(configData.price_per_kilometer || 2000),
        pricePerPassenger: parseFloat(configData.price_per_passenger || 3000),
        pricePerTrailer: parseFloat(configData.price_per_trailer || 600),
        whatsappNumber: configData.whatsapp_number || '+5492245506078',
        vehicleTypes: vehicleTypesData || [],
        additionalOptions: additionalOptionsData || [],
      });
      return;
    }

    if (req.method === 'PUT') {
      // Actualizar configuración
      const body = await parseBody(req);

      // 1. Actualizar o crear configuración principal
      const { data: existingConfig, error: fetchError } = await supabase
        .from('crane_quote_config')
        .select('id')
        .limit(1)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw new Error(fetchError.message);
      }

      const configData = {
        price_per_kilometer: body.pricePerKilometer || 2000,
        price_per_passenger: body.pricePerPassenger || 3000,
        price_per_trailer: body.pricePerTrailer || 600,
        whatsapp_number: body.whatsappNumber || '+5492245506078',
        updated_at: new Date().toISOString(),
      };

      let configResult;
      if (existingConfig) {
        // Actualizar configuración existente
        const { data, error } = await supabase
          .from('crane_quote_config')
          .update(configData)
          .eq('id', existingConfig.id)
          .select()
          .single();

        if (error) throw new Error(error.message);
        configResult = data;
      } else {
        // Crear nueva configuración
        const { data, error } = await supabase
          .from('crane_quote_config')
          .insert(configData)
          .select()
          .single();

        if (error) throw new Error(error.message);
        configResult = data;
      }

      // 2. Manejar tipos de vehículos
      if (body.vehicleTypes && Array.isArray(body.vehicleTypes)) {
        // Obtener IDs existentes en la BD
        const { data: existingVehicles } = await supabase
          .from('crane_vehicle_types')
          .select('id');

        const existingIds = (existingVehicles || []).map(v => v.id);
        const newVehicleIds = body.vehicleTypes
          .filter(v => v.id && existingIds.includes(v.id))
          .map(v => v.id);

        // Eliminar vehículos que ya no están en la lista
        const idsToDelete = existingIds.filter(id => !newVehicleIds.includes(id));
        if (idsToDelete.length > 0) {
          await supabase
            .from('crane_vehicle_types')
            .delete()
            .in('id', idsToDelete);
        }

        // Actualizar o crear vehículos
        for (const vehicle of body.vehicleTypes) {
          // Ignorar IDs temporales (empiezan con 'temp-')
          if (vehicle.id && !vehicle.id.toString().startsWith('temp-') && existingIds.includes(vehicle.id)) {
            // Actualizar existente
            const { error: updateError } = await supabase
              .from('crane_vehicle_types')
              .update({
                name: vehicle.name,
                base_price: vehicle.basePrice,
                updated_at: new Date().toISOString(),
              })
              .eq('id', vehicle.id);
            
            if (updateError) {
              console.error('[Crane Quote API] Error updating vehicle:', updateError);
            }
          } else {
            // Crear nuevo (o si tiene ID temporal)
            const { error: insertError } = await supabase
              .from('crane_vehicle_types')
              .insert({
                name: vehicle.name,
                base_price: vehicle.basePrice,
              });
            
            if (insertError) {
              console.error('[Crane Quote API] Error inserting vehicle:', insertError);
            }
          }
        }
      }

      // 3. Manejar opciones adicionales
      if (body.additionalOptions && Array.isArray(body.additionalOptions)) {
        // Obtener IDs existentes en la BD
        const { data: existingOptions } = await supabase
          .from('crane_additional_options')
          .select('id');

        const existingOptionIds = (existingOptions || []).map(o => o.id);
        const newOptionIds = body.additionalOptions
          .filter(o => o.id && existingOptionIds.includes(o.id))
          .map(o => o.id);

        // Eliminar opciones que ya no están en la lista
        const optionIdsToDelete = existingOptionIds.filter(id => !newOptionIds.includes(id));
        if (optionIdsToDelete.length > 0) {
          await supabase
            .from('crane_additional_options')
            .delete()
            .in('id', optionIdsToDelete);
        }

        // Actualizar o crear opciones
        for (const option of body.additionalOptions) {
          // Ignorar IDs temporales (empiezan con 'temp-')
          if (option.id && !option.id.toString().startsWith('temp-') && existingOptionIds.includes(option.id)) {
            // Actualizar existente
            const { error: updateError } = await supabase
              .from('crane_additional_options')
              .update({
                name: option.name,
                price: option.price,
                updated_at: new Date().toISOString(),
              })
              .eq('id', option.id);
            
            if (updateError) {
              console.error('[Crane Quote API] Error updating option:', updateError);
            }
          } else {
            // Crear nuevo (o si tiene ID temporal)
            const { error: insertError } = await supabase
              .from('crane_additional_options')
              .insert({
                name: option.name,
                price: option.price,
              });
            
            if (insertError) {
              console.error('[Crane Quote API] Error inserting option:', insertError);
            }
          }
        }
      }

      // 4. Retornar configuración actualizada
      const { data: updatedVehicleTypes } = await supabase
        .from('crane_vehicle_types')
        .select('*')
        .order('created_at', { ascending: true });

      const { data: updatedAdditionalOptions } = await supabase
        .from('crane_additional_options')
        .select('*')
        .order('created_at', { ascending: true });

      res.statusCode = 200;
      res.json({
        pricePerKilometer: parseFloat(configResult.price_per_kilometer),
        pricePerPassenger: parseFloat(configResult.price_per_passenger),
        pricePerTrailer: parseFloat(configResult.price_per_trailer),
        whatsappNumber: configResult.whatsapp_number,
        vehicleTypes: updatedVehicleTypes || [],
        additionalOptions: updatedAdditionalOptions || [],
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
