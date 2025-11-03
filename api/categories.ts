import { IncomingMessage, ServerResponse } from 'http';
import React from 'react';
import { ObjectId } from 'mongodb';
import { getCollection } from '../lib/mongodb';
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

// Icon mapping: we'll store iconType in DB and map it back to React element on client
const ICON_TYPE_MAP: { [key: string]: string } = {
  'tire': 'tire',
  'wheel': 'wheel',
  'accessory': 'accessory',
  'valve': 'valve',
};

const toClientCategory = (doc: any): Category => {
  // Map iconType back to a placeholder - actual icon will be set on client side
  // For now, we'll return the category with a minimal icon structure
  // The client will need to map iconType to actual React element
  return {
    id: doc._id.toString(),
    name: doc.name,
    icon: React.createElement('div'), // Placeholder - will be set on client based on iconType
    imageUrl: doc.imageUrl || doc.image_url || '',
    description: doc.description || '',
    order: doc.order || 0,
    isActive: doc.isActive !== false,
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
    const categoriesCollection = await getCollection('categories');

    // Seeding logic
    const categoryCount = await categoriesCollection.countDocuments();
    console.log(`[Categories API] Categorías en base de datos: ${categoryCount}`);
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
        iconType: iconNameMap[cat.name] || 'tire',
        imageUrl: cat.imageUrl,
        description: cat.description || '',
        order: cat.order || 0,
        isActive: cat.isActive !== false,
      }));
      
      const result = await categoriesCollection.insertMany(categoriesToInsert);
      console.log(`[Categories API] ✅ ${result.insertedCount} categorías insertadas`);
    }

    switch (req.method) {
      case 'GET': {
        const categories = await categoriesCollection.find({}).sort({ order: 1 }).toArray();
        // Include iconType in response so client can map it
        const clientCategories = categories.map((doc: any) => ({
          ...toClientCategory(doc),
          iconType: doc.iconType || 'tire', // Include iconType for client mapping
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
          const existingCategory = await categoriesCollection.findOne({ 
            name: newCategoryData.name.trim() 
          });
          
          if (existingCategory) {
            res.statusCode = 409;
            res.json({ message: 'Ya existe una categoría con ese nombre.' });
            return;
          }

          // Prepare data for insertion (exclude icon, include iconType)
          const { icon, ...insertData } = newCategoryData as any;
          const categoryToInsert = {
            name: newCategoryData.name.trim(),
            iconType: newCategoryData.iconType || 'tire',
            imageUrl: newCategoryData.imageUrl || '',
            description: newCategoryData.description || '',
            order: newCategoryData.order || 0,
            isActive: newCategoryData.isActive !== false,
          };

          const result = await categoriesCollection.insertOne(categoryToInsert as any);
          const insertedCategory = await categoriesCollection.findOne({ _id: result.insertedId });
          
          if (!insertedCategory) {
            res.statusCode = 500;
            res.json({ message: 'Error al crear la categoría.' });
            return;
          }

          const clientCategory = {
            ...toClientCategory(insertedCategory),
            iconType: insertedCategory.iconType || 'tire',
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
          const { id: clientSideId, icon, ...updateData } = updatedCategoryData as any;

          // Prepare update data
          const categoryToUpdate: any = {
            name: updatedCategoryData.name.trim(),
            imageUrl: updatedCategoryData.imageUrl || '',
            description: updatedCategoryData.description || '',
            order: updatedCategoryData.order || 0,
            isActive: updatedCategoryData.isActive !== false,
          };

          // Include iconType if provided, otherwise keep existing
          if (updatedCategoryData.iconType) {
            categoryToUpdate.iconType = updatedCategoryData.iconType;
          }

          const result = await categoriesCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: categoryToUpdate }
          );

          if (result.matchedCount === 0) {
            res.statusCode = 404;
            res.json({ message: 'Categoría no encontrada' });
            return;
          }

          const updatedCategory = await categoriesCollection.findOne({ _id: new ObjectId(id) });
          if (!updatedCategory) {
            res.statusCode = 500;
            res.json({ message: 'Error al obtener la categoría actualizada.' });
            return;
          }

          const clientCategory = {
            ...toClientCategory(updatedCategory),
            iconType: updatedCategory.iconType || 'tire',
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

          const result = await categoriesCollection.deleteOne({ _id: new ObjectId(idToDelete) });
          if (result.deletedCount === 0) {
            res.statusCode = 404;
            res.json({ message: 'Categoría no encontrada' });
            return;
          }

          res.statusCode = 204;
          res.end();
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
    
    if (!process.env.MONGODB_URI) {
      res.statusCode = 503;
      res.json({ 
        message: 'MongoDB no configurado', 
        hint: 'La variable de entorno MONGODB_URI no está configurada. Por favor, configura las credenciales de MongoDB en Vercel.'
      });
      return;
    }

    if (error.name === 'MongoServerError' || error.message?.includes('MongoDB')) {
      res.statusCode = 503;
      res.json({ 
        message: 'Error de conexión con MongoDB', 
        error: error.message,
        hint: 'Verifica que las credenciales de MongoDB sean correctas y que la IP esté permitida en MongoDB Atlas.'
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

