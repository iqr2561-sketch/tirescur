import { IncomingMessage, ServerResponse } from 'http';
import { getSupabaseAdmin } from '../lib/supabase';

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
      supabaseUrl: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL ? '✅ Configurada' : '❌ NO configurada',
      supabaseKey: process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY ? '✅ Configurada' : '❌ NO configurada',
      tests: []
    };

    // Test 1: Verificar variables de entorno (en servidor, priorizar SUPABASE_ sin prefijo)
    results.tests.push({
      test: 'SUPABASE_URL variable (servidor)',
      status: process.env.SUPABASE_URL ? '✅ OK' : (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL ? '⚠️ Usando alternativa' : '❌ FALTA'),
      details: process.env.SUPABASE_URL ? 'Variable configurada (recomendado)' : (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL ? 'Variable alternativa configurada' : 'Variable no encontrada')
    });

    results.tests.push({
      test: 'SUPABASE_ANON_KEY variable (servidor)',
      status: process.env.SUPABASE_ANON_KEY ? '✅ OK' : (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY ? '⚠️ Usando alternativa' : '❌ FALTA'),
      details: process.env.SUPABASE_ANON_KEY ? 'Variable configurada (recomendado)' : (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY ? 'Variable alternativa configurada' : 'Variable no encontrada')
    });

    // Test 2: Conectar a Supabase
    try {
      const supabase = getSupabaseAdmin();
      
      // Test 3: Listar tablas (products como ejemplo)
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      if (productsError) {
        results.tests.push({
          test: 'Conexión a Supabase',
          status: '❌ ERROR',
          details: productsError.message || 'Error desconocido al conectar'
        });
      } else {
        results.tests.push({
          test: 'Conexión a Supabase',
          status: '✅ OK',
          details: 'Conexión exitosa a Supabase'
        });
      }

      // Test 4: Contar productos
      const { count: productCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      results.tests.push({
        test: 'Productos en base de datos',
        status: productCount && productCount > 0 ? '✅ OK' : '⚠️ VACÍA',
        details: `${productCount || 0} productos encontrados`
      });

      // Test 5: Contar marcas
      const { count: brandCount } = await supabase
        .from('brands')
        .select('*', { count: 'exact', head: true });

      results.tests.push({
        test: 'Marcas en base de datos',
        status: brandCount && brandCount > 0 ? '✅ OK' : '⚠️ VACÍA',
        details: `${brandCount || 0} marcas encontradas`
      });

      // Test 6: Contar categorías
      const { count: categoryCount } = await supabase
        .from('categories')
        .select('*', { count: 'exact', head: true });

      results.tests.push({
        test: 'Categorías en base de datos',
        status: categoryCount && categoryCount > 0 ? '✅ OK' : '⚠️ VACÍA',
        details: `${categoryCount || 0} categorías encontradas`
      });

    } catch (error: any) {
      results.tests.push({
        test: 'Conexión a Supabase',
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
