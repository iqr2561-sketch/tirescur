# 🔧 Configuración de Supabase para WebGomeria

## 📋 Credenciales de Conexión

Tus credenciales de Supabase ya están disponibles. Sigue estos pasos para configurar el proyecto:

## 🚀 Paso 1: Configurar Variables de Entorno

### Opción A: Archivo `.env.local` (Recomendado para desarrollo)

1. Crea un archivo `.env.local` en la raíz del proyecto:

```bash
# Supabase - URL y Claves Públicas (accesibles en frontend)
VITE_SUPABASE_URL=https://mpmqnmtlfocgxhyufgas.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wbXFubXRsZm9jZ3hoeXVmZ2FzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxNzgzNjEsImV4cCI6MjA3Nzc1NDM2MX0.HcInyo3uYVU6vDmtIfRJ_r5C-3NRBPDueighMphQtns

# Supabase - Clave de Servicio (SOLO para backend, nunca en frontend)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wbXFubXRsZm9jZ3hoeXVmZ2FzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjE3ODM2MSwiZXhwIjoyMDc3NzU0MzYxfQ.R0L8vKAbMFiGIfXWZb5mPc8TRx9aKSMVOUTVhk9y-rc

# PostgreSQL - Conexión directa (opcional, solo para migraciones)
POSTGRES_URL=postgres://postgres.mpmqnmtlfocgxhyufgas:85dhp2nWOBOVH4vx@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler.x
POSTGRES_USER=postgres
POSTGRES_PASSWORD=85dhp2nWOBOVH4vx
POSTGRES_HOST=db.mpmqnmtlfocgxhyufgas.supabase.co
POSTGRES_DATABASE=postgres
```

### Opción B: Variables en Vercel (Producción)

1. Ve a tu proyecto en Vercel
2. Ve a **Settings** → **Environment Variables**
3. Agrega las siguientes variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (solo para funciones del servidor)

## 📊 Paso 2: Crear el Esquema en Supabase

1. Ve a tu proyecto en Supabase: https://mpmqnmtlfocgxhyufgas.supabase.co
2. Navega a **SQL Editor**
3. Crea una nueva query
4. Copia y pega el contenido completo de `supabase-schema.sql`
5. Ejecuta el script (botón "Run")
6. Verifica que todas las tablas se hayan creado correctamente

## 🌱 Paso 3: Insertar Datos Iniciales (Opcional)

1. En el **SQL Editor**, crea una nueva query
2. Copia y pega el contenido de `supabase-seed-data.sql`
3. Ejecuta el script
4. Verifica que los datos se hayan insertado

## 📦 Paso 4: Instalar Cliente de Supabase

```bash
npm install @supabase/supabase-js
```

## 🔧 Paso 5: Crear Cliente de Supabase

Crea un archivo `lib/supabase.js` con la configuración compatible con Vercel Functions:

```javascript
import { createClient } from '@supabase/supabase-js';

function resolveEnv(names) {
  for (const name of names) {
    const value = process.env[name];
    if (value) return value;
  }
  return undefined;
}

const SUPABASE_URL = resolveEnv([
  'SUPABASE_URL',
  'VITE_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_URL'
]);

const SUPABASE_ANON_KEY = resolveEnv([
  'SUPABASE_ANON_KEY',
  'VITE_SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY'
]);

const SUPABASE_SERVICE_ROLE_KEY = resolveEnv([
  'SUPABASE_SERVICE_ROLE_KEY'
]);

let supabaseClient;

if (SUPABASE_URL && (SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY)) {
  supabaseClient = createClient(
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY,
    {
      auth: { persistSession: false, autoRefreshToken: false }
    }
  );
} else {
  console.warn('[supabase] Variables de entorno faltantes', {
    SUPABASE_URL: !!SUPABASE_URL,
    SUPABASE_ANON_KEY: !!SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: !!SUPABASE_SERVICE_ROLE_KEY
  });
}

export const supabase = supabaseClient;

export function ensureSupabase() {
  if (!supabaseClient) {
    throw new Error('Supabase credentials are not configured.');
  }
  return supabaseClient;
}
```

## 🔐 Seguridad

### ⚠️ IMPORTANTE

- **VITE_SUPABASE_ANON_KEY**: Segura para usar en el frontend (cliente)
- **SUPABASE_SERVICE_ROLE_KEY**: **NUNCA** debe exponerse en el frontend. Solo úsala en:
  - Funciones de servidor (API routes)
  - Scripts de migración
  - Operaciones administrativas

## 📝 Verificación

Para verificar que todo funciona:

1. **Tablas creadas**: Ve a **Table Editor** en Supabase y verifica que existan todas las tablas
2. **Conexión**: Ejecuta una query simple:
   ```sql
   SELECT COUNT(*) FROM brands;
   ```
3. **Cliente**: En tu código, prueba una consulta básica:
   ```typescript
   const { data, error } = await supabase.from('brands').select('*');
   console.log('Brands:', data, error);
   ```

## 🔄 Próximos Pasos

1. Reemplazar las funciones de MongoDB con Supabase
2. Actualizar las rutas API para usar Supabase
3. Probar todas las operaciones CRUD
4. Migrar datos existentes si es necesario

## 📚 Recursos

- **Dashboard de Supabase**: https://mpmqnmtlfocgxhyufgas.supabase.co
- **SQL Editor**: https://mpmqnmtlfocgxhyufgas.supabase.co/project/mpmqnmtlfocgxhyufgas/sql
- [Documentación de Supabase](https://supabase.com/docs)

## 🆘 Troubleshooting

### Error: "Missing Supabase environment variables"
- Verifica que el archivo `.env.local` exista y tenga las variables correctas
- Reinicia el servidor de desarrollo después de crear `.env.local`

### Error de conexión a PostgreSQL
- Verifica que el password sea correcto
- Asegúrate de que la IP esté permitida en Supabase (Settings → Database)

### Las tablas no se crean
- Verifica que tengas permisos de administrador
- Revisa los logs en Supabase Dashboard

