# 🔧 Solución de Error 500 en Serverless Functions

## ❌ Error Encontrado
```
500: INTERNAL_SERVER_ERROR
Code: FUNCTION_INVOCATION_FAILED
```

## 🔍 Causa del Problema

El error 500 se debe a que **las variables de entorno con prefijo `VITE_` no están disponibles en las funciones serverless de Vercel**. Las variables `VITE_*` solo están disponibles en el cliente (frontend) durante el build, pero no en tiempo de ejecución de las funciones serverless.

## ✅ Solución Implementada

He actualizado el código para que:

1. **En el servidor (serverless functions)**, use variables **sin prefijo `VITE_`**:
   - `SUPABASE_URL` (en lugar de `VITE_SUPABASE_URL`)
   - `SUPABASE_ANON_KEY` (en lugar de `VITE_SUPABASE_ANON_KEY`)
   - `SUPABASE_SERVICE_ROLE_KEY` (ya estaba sin prefijo)

2. **En el cliente (frontend)**, siga usando `VITE_*`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

## 🔧 Configuración en Vercel

### Variables de Entorno Requeridas

Debes configurar **AMBAS** versiones de las variables en Vercel:

#### Para Serverless Functions (Backend):
- ✅ `SUPABASE_URL` = `https://hsidgfdcolglghowjwro.supabase.co`
- ✅ `SUPABASE_ANON_KEY` = (tu anon key)
- ✅ `SUPABASE_SERVICE_ROLE_KEY` = (tu service role key)

#### Para Frontend (Cliente):
- ✅ `VITE_SUPABASE_URL` = `https://hsidgfdcolglghowjwro.supabase.co`
- ✅ `VITE_SUPABASE_ANON_KEY` = (tu anon key)

### Pasos para Configurar:

1. Ve a tu proyecto en Vercel: https://vercel.com/dashboard
2. Selecciona tu proyecto (`tirescur`)
3. Ve a **Settings** → **Environment Variables**
4. Agrega las siguientes variables **SIN el prefijo `VITE_`** para las funciones serverless:
   - **Name:** `SUPABASE_URL`
   - **Value:** `https://hsidgfdcolglghowjwro.supabase.co`
   - **Environments:** Marca Production, Preview y Development
   
   - **Name:** `SUPABASE_ANON_KEY`
   - **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzaWRnZmRjb2xnbGdob3dqd3JvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxMjc2MzMsImV4cCI6MjA3NzcwMzYzM30.ahd6PIrZqgxWhbY8qzGhg75IZj4drQfoshMoi1IJJgQ`
   - **Environments:** Marca Production, Preview y Development
   
   - **Name:** `SUPABASE_SERVICE_ROLE_KEY`
   - **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzaWRnZmRjb2xnbGdob3dqd3JvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjEyNzYzMywiZXhwIjoyMDc3NzAzNjMzfQ.IFhffGPd2aq-wgU4ezXGJc_x9GRPpDCVxIdk0elGwvs`
   - **Environments:** Marca Production, Preview y Development

5. **Importante:** También mantén las variables `VITE_*` para el frontend:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

6. **Después de agregar/actualizar variables:**
   - Haz un nuevo deployment (redeploy) desde Vercel Dashboard
   - O espera a que Vercel detecte automáticamente los cambios

## 🔍 Verificar la Configuración

1. Ve a: https://tirescur.vercel.app/api/test-connection
2. Debe mostrar:
   - ✅ Variables configuradas
   - ✅ Conexión exitosa a Supabase
   - ✅ Conteo de productos, marcas y categorías

## 📝 Notas Importantes

- **Las variables `VITE_*` NO están disponibles en serverless functions** en tiempo de ejecución
- **Necesitas configurar AMBAS versiones** de las variables en Vercel
- **Después de agregar variables, haz un redeploy** para que tomen efecto

## ✅ Cambios Realizados en el Código

1. ✅ Actualizado `lib/supabase.ts` para detectar automáticamente si está en servidor o cliente
2. ✅ Actualizado todas las APIs para usar `getSupabaseAdmin()` en lugar de importar directamente
3. ✅ Las APIs ahora leen las variables correctas según el contexto (servidor/cliente)

