import { IncomingMessage, ServerResponse } from 'http';
import { getDatabase, getCollection } from '../lib/mongodb';

interface CustomRequest extends IncomingMessage {
  query: { [key: string]: string | string[] | undefined };
  body?: any;
  json?: () => Promise<any>;
  method?: string;
  url?: string;
}

interface CustomResponse extends ServerResponse {
  statusCode: number;
  json: (data: any) => void;
}

const allowCors = async (fn: (req: CustomRequest, res: CustomResponse) => Promise<void>) => {
  return async (req: CustomRequest, res: CustomResponse) => {
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
};

async function handler(req: CustomRequest, res: CustomResponse) {
  try {
    const results: any = {
      timestamp: new Date().toISOString(),
      mongodbUri: process.env.MONGODB_URI ? '✅ Configurada' : '❌ NO configurada',
      tests: []
    };

    // Test 1: Verificar variable de entorno
    results.tests.push({
      test: 'MONGODB_URI variable',
      status: process.env.MONGODB_URI ? '✅ OK' : '❌ FALTA',
      details: process.env.MONGODB_URI ? 'Variable configurada (oculta por seguridad)' : 'Variable no encontrada'
    });

    // Test 2: Conectar a MongoDB
    try {
      const db = await getDatabase();
      results.tests.push({
        test: 'Conexión a base de datos',
        status: '✅ OK',
        details: `Base de datos "tires" accesible`
      });

      // Test 3: Listar colecciones
      const collections = await db.listCollections().toArray();
      results.tests.push({
        test: 'Colecciones existentes',
        status: '✅ OK',
        details: `Encontradas ${collections.length} colecciones: ${collections.map((c: any) => c.name).join(', ') || 'ninguna'}`
      });

      // Test 4: Contar documentos
      const productsCollection = await getCollection('products');
      const productCount = await productsCollection.countDocuments();
      results.tests.push({
        test: 'Productos en base de datos',
        status: productCount > 0 ? '✅ OK' : '⚠️ VACÍA',
        details: `${productCount} productos encontrados`
      });

      const brandsCollection = await getCollection('brands');
      const brandCount = await brandsCollection.countDocuments();
      results.tests.push({
        test: 'Marcas en base de datos',
        status: brandCount > 0 ? '✅ OK' : '⚠️ VACÍA',
        details: `${brandCount} marcas encontradas`
      });

    } catch (error: any) {
      results.tests.push({
        test: 'Conexión a MongoDB',
        status: '❌ ERROR',
        details: error.message || 'Error desconocido'
      });
    }

    // Resumen
    const passedTests = results.tests.filter((t: any) => t.status.includes('✅')).length;
    const totalTests = results.tests.length;
    results.summary = `${passedTests}/${totalTests} tests pasados`;

    res.statusCode = 200;
    res.json(results);
  } catch (error: any) {
    console.error('Error in test-connection API:', error);
    res.statusCode = 500;
    res.json({
      error: 'Internal server error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

export default allowCors(handler);

