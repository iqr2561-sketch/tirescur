# 🔧 Agregar Variables VITE_ en Vercel

## ❌ Problema Identificado

Tienes variables `NEXT_PUBLIC_*` pero **NO tienes las variables `VITE_*`**.

En **Vite**, las variables de entorno que se exponen al cliente (frontend) **DEBEN** tener el prefijo `VITE_`. Las variables `NEXT_PUBLIC_*` son específicas de Next.js y no funcionan automáticamente en Vite.

## ✅ Solución: Agregar Variables VITE_

### Paso 1: Ir a Vercel Environment Variables

1. Ve a: https://vercel.com/dashboard
2. Selecciona tu proyecto `tirescur`
3. Ve a **Settings** → **Environment Variables**

### Paso 2: Agregar las Variables VITE_

Agrega estas **2 nuevas variables** (además de las que ya tienes):

#### Variable 1: `VITE_SUPABASE_URL`
- **Name:** `VITE_SUPABASE_URL`
- **Value:** `https://mpmqnmtlfocgxhyufgas.supabase.co`
- **Environments:** Marca ✅ Production, ✅ Preview, ✅ Development

#### Variable 2: `VITE_SUPABASE_ANON_KEY`
- **Name:** `VITE_SUPABASE_ANON_KEY`
- **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wbXFubXRsZm9jZ3hoeXVmZ2FzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxNzgzNjEsImV4cCI6MjA3Nzc1NDM2MX0.HcInyo3uYVU6vDmtIfRJ_r5C-3NRBPDueighMphQtns`
- **Environments:** Marca ✅ Production, ✅ Preview, ✅ Development

### Paso 3: Verificar Variables Completas

Después de agregar las variables `VITE_*`, deberías tener:

#### Para Serverless Functions (Backend):
- ✅ `SUPABASE_URL`
- ✅ `SUPABASE_ANON_KEY`
- ✅ `SUPABASE_SERVICE_ROLE_KEY` ← **IMPORTANTE: Verifica que esté completa** (parece que está truncada en tu lista)

#### Para Frontend (Cliente):
- ✅ `VITE_SUPABASE_URL` ← **NUEVA**
- ✅ `VITE_SUPABASE_ANON_KEY` ← **NUEVA**

#### Opcionales (ya las tienes):
- `NEXT_PUBLIC_SUPABASE_URL` (no necesaria pero no hace daño)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (no necesaria pero no hace daño)
- Variables de PostgreSQL (opcionales)

### Paso 4: Verificar `SUPABASE_SERVICE_ROLE_KEY`

**IMPORTANTE:** Vi que tienes `SUPABASE_SERVICE_ROLE_` (parece truncada). Asegúrate de que esté completa:

- **Name:** `SUPABASE_SERVICE_ROLE_KEY` (completo) ✅ CONFIRMADA
- **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wbXFubXRsZm9jZ3hoeXVmZ2FzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjE3ODM2MSwiZXhwIjoyMDc3NzU0MzYxfQ.R0L8vKAbMFiGIfXWZb5mPc8TRx9aKSMVOUTVhk9y-rc`

### Paso 5: Redeploy

Después de agregar las variables:

1. Ve a **Deployments** en Vercel
2. Haz clic en **Redeploy** del último deployment
3. Espera a que termine el deploy

## 🔍 Verificación

Después del redeploy:

1. **Probar conexión:** Visita `https://tirescur.vercel.app/api/test-connection`
2. **Intentar agregar datos:** Intenta agregar una marca desde la aplicación
3. **Revisar logs:** Si hay errores, revisa los logs en Vercel Functions → Logs

## 📋 Resumen de Variables Necesarias

### Mínimas Requeridas:

```
✅ SUPABASE_URL = https://mpmqnmtlfocgxhyufgas.supabase.co
✅ SUPABASE_ANON_KEY = [tu anon key]
✅ SUPABASE_SERVICE_ROLE_KEY = [tu service role key]
✅ VITE_SUPABASE_URL = https://mpmqnmtlfocgxhyufgas.supabase.co
✅ VITE_SUPABASE_ANON_KEY = [tu anon key]
```

### Ya las Tienes (Opcionales):

```
⚠️ NEXT_PUBLIC_SUPABASE_URL = [mismo valor que SUPABASE_URL]
⚠️ NEXT_PUBLIC_SUPABASE_ANON_KEY = [mismo valor que SUPABASE_ANON_KEY]
```

Las variables `NEXT_PUBLIC_*` no son necesarias para Vite, pero no hacen daño tenerlas.

