import { IncomingMessage, ServerResponse } from 'http';
import React from 'react';
import { supabaseAdmin } from '../lib/supabase';
import { Category } from '../types';
import { CATEGORIES_DATA } from '../constants';

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

const toClientCategory = (row: any): Category => {
  return {
    id: row.id,
    name: row.name,
    icon: React.createElement('div'), // Placeholder - icon se mapea en el cliente usando iconType
    imageUrl: row.image_url || '',
    description: row.description || '',
    order: row.order || 0,
    isActive: row.is_active !== false,
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
    console.log(`[Categories API] ${req.method} request recibida`);

    // Seeding logic
    const { count: categoryCount } = await supabaseAdmin
      .from('categories')
      .select('*', { count: 'exact', head: true });

    console.log(`[Categories API] Categorías en base de datos: ${categoryCount || 0}`);
    if (categoryCount === 0) {
      console.log('[Categories API] Iniciando seeding de datos...');
      
      // Map CATEGORIES_DATA to database format (without icon React element, store iconType instead)
      const iconNameMap: { [key: string]: string } = {
        'Neumáticos de Verano': 'tire',
        'Neumáticos de Invierno': 'tire',
        'Neumáticos Todo el Año': 'tire',
        'Neumáticos para SUV': 'wheel',
        'Neumáticos de Camioneta': 'wheel',
        'Accesorios para Neumáticos': 'accessory',
        'Válvulas y Sensores': 'valve',
      };
      
      const categoriesToInsert = CATEGORIES_DATA.map(cat => ({
        name: cat.name,
        icon_type: iconNameMap[cat.name] || 'tire',
        image_url: cat.imageUrl,
        description: cat.description || '',
        order: cat.order || 0,
        is_active: cat.isActive !== false,
      }));
      
      const { error } = await supabaseAdmin
        .from('categories')
        .insert(categoriesToInsert);

      if (error) {
        console.error('[Categories API] Error en seeding:', error);
      } else {
        console.log(`[Categories API] ✅ ${categoriesToInsert.length} categorías insertadas`);
      }
    }

    switch (req.method) {
      case 'GET': {
        const { data: categories, error } = await supabaseAdmin
          .from('categories')
          .select('*')
          .order('order', { ascending: true });

        if (error) {
          console.error('[Categories API] Error obteniendo categorías:', error);
          res.statusCode = 500;
          res.json({ message: 'Error obteniendo categorías', error: error.message });
          return;
        }

        // Incluir iconType en la respuesta para que el cliente pueda mapear el icono
        const clientCategories = (categories || []).map((cat: any) => ({
          ...toClientCategory(cat),
          iconType: cat.icon_type || 'tire',
        }));

        res.statusCode = 200;
        res.json(clientCategories);
        break;
      }

      case 'POST': {
        try {
          const newCategoryData: Omit<Category, 'id' | 'icon'> & { iconType?: string } = await req.json();
          
          // Validar datos
          if (!newCategoryData.name || !newCategoryData.name.trim()) {
            res.statusCode = 400;
            res.json({ message: 'El nombre de la categoría es obligatorio.' });
            return;
          }

          // Verificar si ya existe una categoría con el mismo nombre
          const { data: existingCategory } = await supabaseAdmin
            .from('categories')
            .select('*')
            .eq('name', newCategoryData.name.trim())
            .single();

          if (existingCategory) {
            res.statusCode = 409;
            res.json({ message: 'Ya existe una categoría con ese nombre.' });
            return;
          }

          // Prepare data for insertion
          const categoryToInsert = {
            name: newCategoryData.name.trim(),
            icon_type: newCategoryData.iconType || 'tire',
            image_url: newCategoryData.imageUrl || '',
            description: newCategoryData.description || '',
            order: newCategoryData.order || 0,
            is_active: newCategoryData.isActive !== false,
          };

          const { data: insertedCategory, error } = await supabaseAdmin
            .from('categories')
            .insert(categoryToInsert)
            .select()
            .single();

          if (error) {
            console.error('[Categories API] Error creando categoría:', error);
            res.statusCode = 500;
            res.json({ 
              message: 'Error al crear la categoría.', 
              error: error.message,
              hint: 'Verifica que todos los campos requeridos estén presentes y sean válidos.'
            });
            return;
          }

          if (!insertedCategory) {
            res.statusCode = 500;
            res.json({ message: 'Error al crear la categoría.' });
            return;
          }

          const clientCategory = {
            ...toClientCategory(insertedCategory),
            iconType: insertedCategory.icon_type || 'tire',
          };
          
          res.statusCode = 201;
          res.json(clientCategory);
        } catch (error: any) {
          console.error('[Categories API] Error en POST:', error);
          res.statusCode = 500;
          res.json({ 
            message: 'Error al crear la categoría.', 
            error: error.message,
            hint: 'Verifica que todos los campos requeridos estén presentes y sean válidos.'
          });
        }
        break;
      }

      case 'PUT': {
        try {
          const id = req.query.id;
          if (!id) {
            res.statusCode = 400;
            res.json({ message: 'El ID de la categoría es requerido para actualizar' });
            return;
          }

          const updatedCategoryData: Category & { iconType?: string } = await req.json();
          const { id: clientSideId, icon, ...updateData } = updatedCategoryData;

          // Prepare update data
          const categoryToUpdate: any = {
            name: updatedCategoryData.name.trim(),
            image_url: updatedCategoryData.imageUrl || '',
            description: updatedCategoryData.description || '',
            order: updatedCategoryData.order || 0,
            is_active: updatedCategoryData.isActive !== false,
          };

          // Include iconType if provided, otherwise keep existing
          if (updatedCategoryData.iconType) {
            categoryToUpdate.icon_type = updatedCategoryData.iconType;
          }

          const { data: updatedCategory, error } = await supabaseAdmin
            .from('categories')
            .update(categoryToUpdate)
            .eq('id', id)
            .select()
            .single();

          if (error) {
            console.error('[Categories API] Error actualizando categoría:', error);
            res.statusCode = 500;
            res.json({ message: 'Error al actualizar la categoría.', error: error.message });
            return;
          }

          if (!updatedCategory) {
            res.statusCode = 404;
            res.json({ message: 'Categoría no encontrada' });
            return;
          }

          const clientCategory = {
            ...toClientCategory(updatedCategory),
            iconType: updatedCategory.icon_type || 'tire',
          };
          
          res.statusCode = 200;
          res.json(clientCategory);
        } catch (error: any) {
          console.error('[Categories API] Error en PUT:', error);
          res.statusCode = 500;
          res.json({ 
            message: 'Error al actualizar la categoría.', 
            error: error.message 
          });
        }
        break;
      }

      case 'DELETE': {
        try {
          const idToDelete = req.query.id;
          if (!idToDelete) {
            res.statusCode = 400;
            res.json({ message: 'El ID de la categoría es requerido para eliminar' });
            return;
          }

          const { error } = await supabaseAdmin
            .from('categories')
            .delete()
            .eq('id', idToDelete);

          if (error) {
            console.error('[Categories API] Error eliminando categoría:', error);
            res.statusCode = 500;
            res.json({ 
              message: 'Error al eliminar la categoría.', 
              error: error.message 
            });
            return;
          }

          // Verificar si se eliminó
          const { count } = await supabaseAdmin
            .from('categories')
            .select('*', { count: 'exact', head: true })
            .eq('id', idToDelete);

          if (count === 0) {
            res.statusCode = 204;
            res.end();
          } else {
            res.statusCode = 404;
            res.json({ message: 'Categoría no encontrada' });
          }
        } catch (error: any) {
          console.error('[Categories API] Error en DELETE:', error);
          res.statusCode = 500;
          res.json({ 
            message: 'Error al eliminar la categoría.', 
            error: error.message 
          });
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
    console.error('[Categories API] Error general:', error);
    console.error('[Categories API] Stack:', error.stack);
    console.error('[Categories API] Name:', error.name);
    
    if (!process.env.VITE_SUPABASE_URL && !process.env.SUPABASE_URL) {
      res.statusCode = 503;
      res.json({ 
        message: 'Supabase no configurado', 
        hint: 'La variable de entorno VITE_SUPABASE_URL o SUPABASE_URL no está configurada. Por favor, configura las credenciales de Supabase en Vercel.'
      });
      return;
    }

    res.statusCode = 500;
    res.json({ 
      message: 'Error interno del servidor', 
      error: error.message,
      hint: 'Revisa los logs del servidor para más detalles.'
    });
  }
}

export default allowCors(handler);
