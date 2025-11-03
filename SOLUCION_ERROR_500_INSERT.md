# 🔧 Solución para Error 500 al Insertar Datos en Supabase

## 📋 Diagnóstico del Problema

El error 500 al intentar agregar datos (marcas, productos, etc.) puede deberse a varias causas:

### Posibles Causas:

1. **Variables de entorno no configuradas correctamente en Vercel**
2. **La tabla no existe en la base de datos**
3. **RLS (Row Level Security) está habilitado y bloqueando las inserciones**
4. **Las credenciales de Supabase son incorrectas**
5. **Falta el `SUPABASE_SERVICE_ROLE_KEY` para bypass RLS**

## ✅ Pasos para Solucionar

### Paso 1: Verificar Variables de Entorno en Vercel

1. Ve a tu proyecto en Vercel: https://vercel.com/dashboard
2. Selecciona el proyecto `tirescur`
3. Ve a **Settings** → **Environment Variables**

#### Variables Requeridas:

**Para Serverless Functions (Backend):**
- ✅ `SUPABASE_URL` = `https://mpmqnmtlfocgxhyufgas.supabase.co`
- ✅ `SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wbXFubXRsZm9jZ3hoeXVmZ2FzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxNzgzNjEsImV4cCI6MjA3Nzc1NDM2MX0.HcInyo3uYVU6vDmtIfRJ_r5C-3NRBPDueighMphQtns`
- ✅ `SUPABASE_SERVICE_ROLE_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wbXFubXRsZm9jZ3hoeXVmZ2FzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjE3ODM2MSwiZXhwIjoyMDc3NzU0MzYxfQ.R0L8vKAbMFiGIfXWZb5mPc8TRx9aKSMVOUTVhk9y-rc` ✅ CONFIRMADA

**Para Frontend (Cliente):**
- ✅ `VITE_SUPABASE_URL` = `https://mpmqnmtlfocgxhyufgas.supabase.co`
- ✅ `VITE_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wbXFubXRsZm9jZ3hoeXVmZ2FzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxNzgzNjEsImV4cCI6MjA3Nzc1NDM2MX0.HcInyo3uYVU6vDmtIfRJ_r5C-3NRBPDueighMphQtns`

#### Importante:
- Marca todas las variables para **Production**, **Preview** y **Development**
- **Asegúrate de que `SUPABASE_SERVICE_ROLE_KEY` esté configurada** - Esta es la clave que permite bypass RLS

### Paso 2: Verificar que las Tablas Existen en Supabase

1. Ve a tu proyecto en Supabase: https://mpmqnmtlfocgxhyufgas.supabase.co
2. Navega a **Table Editor**
3. Verifica que existan las siguientes tablas:
   - ✅ `brands`
   - ✅ `categories`
   - ✅ `products`
   - ✅ `sales`
   - ✅ `sale_products`
   - ✅ `menu_items`
   - ✅ `app_settings`

**Si las tablas no existen:**
1. Ve a **SQL Editor** en Supabase
2. Copia y pega el contenido completo de `supabase-schema.sql`
3. Ejecuta el script (botón "Run")
4. Verifica que todas las tablas se hayan creado

### Paso 3: Verificar RLS (Row Level Security)

1. Ve a **Authentication** → **Policies** en Supabase
2. Verifica que **RLS esté DESHABILITADO** para las tablas

**Si RLS está habilitado:**
- Opción 1: Deshabilitar RLS (recomendado para desarrollo)
  ```sql
  ALTER TABLE brands DISABLE ROW LEVEL SECURITY;
  ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
  ALTER TABLE products DISABLE ROW LEVEL SECURITY;
  ALTER TABLE sales DISABLE ROW LEVEL SECURITY;
  ALTER TABLE sale_products DISABLE ROW LEVEL SECURITY;
  ALTER TABLE menu_items DISABLE ROW LEVEL SECURITY;
  ALTER TABLE app_settings DISABLE ROW LEVEL SECURITY;
  ```

- Opción 2: Crear políticas que permitan inserción con service_role
  ```sql
  CREATE POLICY "Service role can insert" ON brands FOR INSERT 
    USING (auth.role() = 'service_role');
  ```

### Paso 4: Verificar Conexión

1. Ve a: `https://tirescur.vercel.app/api/test-connection`
2. Deberías ver un JSON con el estado de las variables y conexión

**Si hay errores:**
- Revisa los logs en Vercel Dashboard → **Deployments** → **Functions** → **Logs**
- Busca errores relacionados con Supabase o variables de entorno

### Paso 5: Verificar Logs en Vercel

1. Ve a **Deployments** en Vercel
2. Selecciona el último deployment
3. Ve a **Functions** → **Logs**
4. Intenta agregar una marca nuevamente
5. Revisa los logs para ver:
   - ¿Se están cargando las variables de entorno?
   - ¿Cuál es el error específico de Supabase?
   - ¿Hay algún problema con la conexión?

**Logs esperados (con el código actualizado):**
```
[Brands API] POST request iniciada
[Brands API] Datos recibidos: {...}
[Brands API] Verificando configuración de Supabase...
[Brands API] Supabase URL configurada: true
[Brands API] Supabase Key configurada: true
[Brands API] Variables de entorno: {...}
[Brands API] Verificando marca existente...
[Brands API] Insertando marca: {...}
```

**Si hay errores:**
- Busca `[Brands API] Error creando marca:` en los logs
- El error incluirá `errorCode`, `errorDetails` y `errorHint` de Supabase

## 🔍 Verificación Adicional

### Probar la Conexión Manualmente

Puedes probar insertar una marca directamente desde Supabase SQL Editor:

```sql
INSERT INTO brands (name, logo_url) 
VALUES ('Test Brand', 'https://example.com/logo.png')
RETURNING *;
```

Si esto funciona pero la API no, el problema está en:
- Variables de entorno
- RLS policies
- La clave utilizada (debe ser `SUPABASE_SERVICE_ROLE_KEY`)

## 🚀 Después de Corregir

1. **Redeploy en Vercel:**
   - Ve a **Deployments**
   - Haz clic en **Redeploy** del último deployment
   - Espera a que termine el deploy

2. **Probar nuevamente:**
   - Intenta agregar una marca desde la aplicación
   - Revisa la consola del navegador para ver si hay errores
   - Revisa los logs en Vercel para ver detalles

## 📞 Si el Problema Persiste

Comparte:
1. Los logs de Vercel (Functions → Logs)
2. El resultado de `/api/test-connection`
3. Un screenshot del error en la consola del navegador

Esto ayudará a identificar exactamente qué está fallando.

