import { IncomingMessage, ServerResponse } from 'http';
import { getSupabaseAdmin } from '../lib/supabase';
import { Brand } from '../types';
import { INITIAL_BRANDS_DATA } from '../constants';

interface CustomRequest extends IncomingMessage {
  query: {
    id?: string;
  };
  json: () => Promise<any>;
  method?: string;
  url?: string;
}

interface CustomResponse extends ServerResponse {
  json: (data: any) => void;
  setHeader(name: string, value: string | string[]): this;
  statusCode: number;
  end(cb?: () => void): this;
}

const toClientBrand = (row: any): Brand => {
  return {
    id: row.id,
    name: row.name,
    logoUrl: row.logo_url || '',
  };
};

const allowCors = (fn: Function) => async (req: CustomRequest, res: CustomResponse) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }
  return await fn(req, res);
};

async function handler(req: CustomRequest, res: CustomResponse) {
  try {
    console.log(`[Brands API] ${req.method} request recibida`);
    const supabase = getSupabaseAdmin();

    // Seeding logic
    const { count: brandCount } = await supabase
      .from('brands')
      .select('*', { count: 'exact', head: true });

    console.log(`[Brands API] Marcas en base de datos: ${brandCount || 0}`);
    if (brandCount === 0) {
      console.log('[Brands API] Iniciando seeding de datos...');
      const brandsToInsert = INITIAL_BRANDS_DATA.map(brand => ({
        name: brand.name,
        logo_url: brand.logoUrl,
      }));

      const { error } = await supabase
        .from('brands')
        .insert(brandsToInsert);

      if (error) {
        console.error('[Brands API] Error en seeding:', error);
      } else {
        console.log(`[Brands API] ✅ ${brandsToInsert.length} marcas insertadas`);
      }
    }

    switch (req.method) {
      case 'GET': {
        const { data: brands, error } = await supabase
          .from('brands')
          .select('*')
          .order('name');

        if (error) {
          console.error('[Brands API] Error obteniendo marcas:', error);
          res.statusCode = 500;
          res.json({ message: 'Error obteniendo marcas', error: error.message });
          return;
        }

        const clientBrands = (brands || []).map(toClientBrand);
        res.statusCode = 200;
        res.json(clientBrands);
        break;
      }

      case 'POST': {
        try {
          const newBrandData: Omit<Brand, 'id'> = await req.json();
          
          // Validar datos
          if (!newBrandData.name || !newBrandData.name.trim()) {
            res.statusCode = 400;
            res.json({ message: 'El nombre de la marca es obligatorio.' });
            return;
          }

          // Verificar si ya existe una marca con el mismo nombre
          const { data: existingBrand } = await supabase
            .from('brands')
            .select('*')
            .eq('name', newBrandData.name.trim())
            .single();

          if (existingBrand) {
            res.statusCode = 409;
            res.json({ 
              message: 'Ya existe una marca con ese nombre.', 
              brand: toClientBrand(existingBrand) 
            });
            return;
          }

          const brandToInsert = {
            name: newBrandData.name.trim(),
            logo_url: newBrandData.logoUrl || '',
          };

          const { data: insertedBrand, error } = await supabase
            .from('brands')
            .insert(brandToInsert)
            .select()
            .single();

          if (error) {
            console.error('[Brands API] Error creando marca:', error);
            res.statusCode = 500;
            res.json({ 
              message: 'Error al crear la marca.', 
              error: error.message,
              hint: 'Verifica que todos los campos requeridos estén presentes y sean válidos.'
            });
            return;
          }

          if (!insertedBrand) {
            res.statusCode = 500;
            res.json({ message: 'Error al crear la marca.' });
            return;
          }

          const clientBrand = toClientBrand(insertedBrand);
          res.statusCode = 201;
          res.json(clientBrand);
        } catch (error: any) {
          console.error('[Brands API] Error en POST:', error);
          res.statusCode = 500;
          res.json({ 
            message: 'Error al crear la marca.', 
            error: error.message,
            hint: 'Verifica que todos los campos requeridos estén presentes y sean válidos.'
          });
        }
        break;
      }

      case 'PUT': {
        const id = req.query.id;
        if (!id) {
          res.statusCode = 400;
          res.json({ message: 'Brand ID is required for update' });
          return;
        }

        const updatedBrandData: Brand = await req.json();
        const { id: clientSideId, ...updateData } = updatedBrandData;

        const dataToUpdate = {
          name: updateData.name.trim(),
          logo_url: updateData.logoUrl || '',
        };

        const { data: updatedBrand, error } = await supabase
          .from('brands')
          .update(dataToUpdate)
          .eq('id', id)
          .select()
          .single();

        if (error) {
          console.error('[Brands API] Error actualizando marca:', error);
          res.statusCode = 500;
          res.json({ message: 'Error actualizando marca', error: error.message });
          return;
        }

        if (!updatedBrand) {
          res.statusCode = 404;
          res.json({ message: 'Brand not found' });
          return;
        }

        const clientBrand = toClientBrand(updatedBrand);
        res.statusCode = 200;
        res.json(clientBrand);
        break;
      }

      case 'DELETE': {
        const idToDelete = req.query.id;
        if (!idToDelete) {
          res.statusCode = 400;
          res.json({ message: 'Brand ID is required for delete' });
          return;
        }

        const { error } = await supabase
          .from('brands')
          .delete()
          .eq('id', idToDelete);

        if (error) {
          console.error('[Brands API] Error eliminando marca:', error);
          res.statusCode = 500;
          res.json({ message: 'Error eliminando marca', error: error.message });
          return;
        }

        // Verificar si se eliminó
        const { count } = await supabase
          .from('brands')
          .select('*', { count: 'exact', head: true })
          .eq('id', idToDelete);

        if (count === 0) {
          res.statusCode = 204;
          res.end();
        } else {
          res.statusCode = 404;
          res.json({ message: 'Brand not found' });
        }
        break;
      }

      default: {
        res.statusCode = 405;
        res.json({ message: 'Method Not Allowed' });
        break;
      }
    }
  } catch (error: any) {
    console.error('❌ Error in brands API:', error);
    console.error('Error stack:', error.stack);
    console.error('Error name:', error.name);

    // Verificar configuración de Supabase
    if (!process.env.VITE_SUPABASE_URL && !process.env.SUPABASE_URL) {
      res.statusCode = 503;
      res.json({ 
        message: 'Servicio no disponible: Supabase no configurado', 
        error: 'VITE_SUPABASE_URL or SUPABASE_URL environment variable is not set',
        hint: 'Por favor, configura la variable de entorno VITE_SUPABASE_URL en Vercel'
      });
      return;
    }

    res.statusCode = 500;
    res.json({ 
      message: 'Error interno del servidor',
      error: error.message || 'Error desconocido',
      type: error.name || 'UnknownError',
      hint: 'Revisa los logs del servidor para más detalles'
    });
  }
}

export default allowCors(handler);
