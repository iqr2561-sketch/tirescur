import { IncomingMessage, ServerResponse } from 'http';
import { ObjectId } from 'mongodb';
import { getCollection } from '../lib/mongodb';
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

const toClientBrand = (doc: any): Brand => {
  return {
    id: doc._id.toString(),
    name: doc.name,
    logoUrl: doc.logoUrl || doc.logo_url,
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
    const brandsCollection = await getCollection('brands');

    // Seeding logic
    const brandCount = await brandsCollection.countDocuments();
    console.log(`[Brands API] Marcas en base de datos: ${brandCount}`);
    if (brandCount === 0) {
      console.log('[Brands API] Iniciando seeding de datos...');
      const brandsToInsert = INITIAL_BRANDS_DATA.map(brand => ({
        name: brand.name,
        logoUrl: brand.logoUrl,
      }));
      const result = await brandsCollection.insertMany(brandsToInsert);
      console.log(`[Brands API] ✅ ${result.insertedCount} marcas insertadas`);
    }

    switch (req.method) {
      case 'GET': {
        const brands = await brandsCollection.find({}).toArray();
        const clientBrands = brands.map(toClientBrand);
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
            res.json({ message: 'Brand name is required' });
            return;
          }
          
          // Verificar si la marca ya existe
          const existingBrand = await brandsCollection.findOne({ name: newBrandData.name.trim() });
          if (existingBrand) {
            res.statusCode = 409;
            res.json({ message: 'Brand already exists', brand: toClientBrand(existingBrand) });
            return;
          }
          
          const result = await brandsCollection.insertOne({
            name: newBrandData.name.trim(),
            logoUrl: newBrandData.logoUrl || '',
          } as any);
          
          const insertedBrand = await brandsCollection.findOne({ _id: result.insertedId });
          if (!insertedBrand) {
            res.statusCode = 500;
            res.json({ message: 'Error creating brand: Brand was not created' });
            return;
          }
          
          const clientBrand = toClientBrand(insertedBrand);
          console.log(`[Brands API] ✅ Marca creada: ${clientBrand.name}`);
          res.statusCode = 201;
          res.json(clientBrand);
        } catch (postError: any) {
          console.error('[Brands API] Error en POST:', postError);
          res.statusCode = 500;
          res.json({ 
            message: 'Error creating brand', 
            error: postError.message || 'Unknown error' 
          });
          return;
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

        const result = await brandsCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updateData }
        );

        if (result.matchedCount === 0) {
          res.statusCode = 404;
          res.json({ message: 'Brand not found' });
          return;
        }

        const updatedBrand = await brandsCollection.findOne({ _id: new ObjectId(id) });
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

        const result = await brandsCollection.deleteOne({ _id: new ObjectId(idToDelete) });
        if (result.deletedCount === 0) {
          res.statusCode = 404;
          res.json({ message: 'Brand not found' });
          return;
        }

        res.statusCode = 204;
        res.end();
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
    
    // Verificar si es un error de conexión a MongoDB
    if (!process.env.MONGODB_URI) {
      console.error('⚠️ MONGODB_URI no está configurada');
      res.statusCode = 503;
      res.json({ 
        message: 'Servicio no disponible: MongoDB no configurado', 
        error: 'MONGODB_URI environment variable is not set',
        hint: 'Por favor, configura la variable de entorno MONGODB_URI en Vercel'
      });
      return;
    }
    
    // Verificar si es un error de conexión
    if (error.message && (
      error.message.includes('connect') || 
      error.message.includes('connection') ||
      error.message.includes('timeout') ||
      error.name === 'MongoServerError' ||
      error.name === 'MongoNetworkError'
    )) {
      console.error('⚠️ Error de conexión a MongoDB');
      res.statusCode = 503;
      res.json({ 
        message: 'Servicio no disponible: Error de conexión a la base de datos', 
        error: error.message,
        hint: 'Verifica la conexión a MongoDB Atlas y la configuración de red'
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
