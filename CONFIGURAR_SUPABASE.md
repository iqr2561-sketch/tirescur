# 🔧 Configuración de Supabase para WebGomeria

## 📋 Credenciales de Conexión

Tus credenciales de Supabase ya están disponibles. Sigue estos pasos para configurar el proyecto:

## 🚀 Paso 1: Configurar Variables de Entorno

### Opción A: Archivo `.env.local` (Recomendado para desarrollo)

1. Crea un archivo `.env.local` en la raíz del proyecto:

```bash
# Supabase - URL y Claves Públicas (accesibles en frontend)
VITE_SUPABASE_URL=https://hsidgfdcolglghowjwro.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzaWRnZmRjb2xnbGdob3dqd3JvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxMjc2MzMsImV4cCI6MjA3NzcwMzYzM30.ahd6PIrZqgxWhbY8qzGhg75IZj4drQfoshMoi1IJJgQ

# Supabase - Clave de Servicio (SOLO para backend, nunca en frontend)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzaWRnZmRjb2xnbGdob3dqd3JvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjEyNzYzMywiZXhwIjoyMDc3NzAzNjMzfQ.IFhffGPd2aq-wgU4ezXGJc_x9GRPpDCVxIdk0elGwvs

# PostgreSQL - Conexión directa (opcional, solo para migraciones)
POSTGRES_URL=postgres://postgres.hsidgfdcolglghowjwro:6Tb5Oczx5f93Mo7u@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler.x
POSTGRES_USER=postgres
POSTGRES_PASSWORD=6Tb5Oczx5f93Mo7u
POSTGRES_HOST=db.hsidgfdcolglghowjwro.supabase.co
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

1. Ve a tu proyecto en Supabase: https://hsidgfdcolglghowjwro.supabase.co
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

Crea un archivo `lib/supabase.ts` (o similar):

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Cliente con service role (solo para uso en servidor)
export const supabaseAdmin = createClient(
  supabaseUrl,
  import.meta.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey
);
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

- **Dashboard de Supabase**: https://hsidgfdcolglghowjwro.supabase.co
- **SQL Editor**: https://hsidgfdcolglghowjwro.supabase.co/project/hsidgfdcolglghowjwro/sql
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

