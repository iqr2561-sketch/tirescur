import allowCors from '../lib/cors.js';
import { ensureSupabase } from '../lib/supabase.js';

export default allowCors(async function handler(req, res) {
  try {
    if (req.method !== 'GET') {
      res.statusCode = 405;
      res.json({ error: 'Método no permitido' });
      return;
    }

    const diagnostics = collectEnvDiagnostics();

    try {
      const supabase = ensureSupabase();
      const connectionResults = await runConnectionDiagnostics(supabase);
      diagnostics.tests.push(...connectionResults.tests);
      diagnostics.summary = connectionResults.summary;
    } catch (error: any) {
      diagnostics.tests.push({
        test: 'Inicialización de Supabase',
        status: '❌ ERROR',
        details: error?.message || 'Error al inicializar Supabase. Verifica las variables de entorno.'
      });
      diagnostics.summary = '0 tests pasados';
    }

    res.statusCode = 200;
    res.json(diagnostics);
  } catch (error: any) {
    console.error('[test-connection] Error en endpoint:', error);
    res.statusCode = 500;
    res.json({ message: error?.message || 'Error interno del servidor' });
  }
});

function collectEnvDiagnostics() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  return {
    timestamp: new Date().toISOString(),
    supabaseUrl: supabaseUrl ? '✅ Configurada' : '❌ NO configurada',
    supabaseKey: supabaseAnonKey ? '✅ Configurada' : '❌ NO configurada',
    supabaseServiceRoleKey: serviceRoleKey ? '✅ Configurada' : '❌ NO configurada',
    tests: [
      {
        test: 'SUPABASE_URL variable (servidor)',
        status: supabaseUrl ? '✅ OK' : '❌ FALTA',
        details: supabaseUrl ? 'Variable configurada' : 'Configura SUPABASE_URL en Vercel'
      },
      {
        test: 'SUPABASE_ANON_KEY variable (servidor)',
        status: supabaseAnonKey ? '✅ OK' : '❌ FALTA',
        details: supabaseAnonKey ? 'Variable configurada' : 'Configura SUPABASE_ANON_KEY en Vercel'
      }
    ],
    summary: '0 tests pasados'
  };
}

async function runConnectionDiagnostics(supabase: any) {
  const tests: any[] = [];

  const tablesToCheck = [
    { name: 'products', label: 'Productos en base de datos' },
    { name: 'brands', label: 'Marcas en base de datos' },
    { name: 'categories', label: 'Categorías en base de datos' }
  ];

  for (const table of tablesToCheck) {
    const { count, error } = await supabase
      .from(table.name)
      .select('*', { count: 'exact', head: true });

    if (error) {
      tests.push({
        test: table.label,
        status: '❌ ERROR',
        details: error.message
      });
    } else {
      tests.push({
        test: table.label,
        status: count && count > 0 ? '✅ OK' : '⚠️ VACÍA',
        details: `${count || 0} registros encontrados`
      });
    }
  }

  const passed = tests.filter((test) => test.status.includes('✅')).length;
  return { tests, summary: `${passed}/${tests.length} tests pasados` };
}
