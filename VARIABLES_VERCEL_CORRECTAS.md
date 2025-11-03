# 🔧 Variables de Entorno Correctas para Vercel

## ✅ Variables que Debes Configurar en Vercel

Basándome en las credenciales de Supabase que proporcionaste, aquí están las variables exactas que necesitas configurar en Vercel:

### 📋 Para Serverless Functions (Backend):

Estas variables **NO** deben tener prefijo `VITE_` ni `NEXT_PUBLIC_`:

1. **SUPABASE_URL**
   ```
   https://hsidgfdcolglghowjwro.supabase.co
   ```

2. **SUPABASE_ANON_KEY** (o puedes usar NEXT_PUBLIC_SUPABASE_ANON_KEY, el código lo detectará)
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzaWRnZmRjb2xnbGdob3dqd3JvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxMjc2MzMsImV4cCI6MjA3NzcwMzYzM30.ahd6PIrZqgxWhbY8qzGhg75IZj4drQfoshMoi1IJJgQ
   ```

3. **SUPABASE_SERVICE_ROLE_KEY**
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzaWRnZmRjb2xnbGdob3dqd3JvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjEyNzYzMywiZXhwIjoyMDc3NzAzNjMzfQ.IFhffGPd2aq-wgU4ezXGJc_x9GRPpDCVxIdk0elGwvs
   ```

### 📋 Para Frontend (Opcional - si quieres usar en el cliente):

Puedes usar estas variables con prefijo para el frontend (el código también las detectará):

4. **NEXT_PUBLIC_SUPABASE_URL** (o VITE_SUPABASE_URL)
   ```
   https://hsidgfdcolglghowjwro.supabase.co
   ```

5. **NEXT_PUBLIC_SUPABASE_ANON_KEY** (o VITE_SUPABASE_ANON_KEY)
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzaWRnZmRjb2xnbGdob3dqd3JvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxMjc2MzMsImV4cCI6MjA3NzcwMzYzM30.ahd6PIrZqgxWhbY8qzGhg75IZj4drQfoshMoi1IJJgQ
   ```

## 🚀 Pasos para Configurar en Vercel:

1. Ve a: https://vercel.com/dashboard
2. Selecciona tu proyecto: **tirescur**
3. Ve a: **Settings** → **Environment Variables**
4. Haz clic en **Add New** y agrega cada variable:

### Variable 1:
- **Name:** `SUPABASE_URL`
- **Value:** `https://hsidgfdcolglghowjwro.supabase.co`
- **Environments:** ✅ Production, ✅ Preview, ✅ Development

### Variable 2:
- **Name:** `SUPABASE_ANON_KEY`
- **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzaWRnZmRjb2xnbGdob3dqd3JvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxMjc2MzMsImV4cCI6MjA3NzcwMzYzM30.ahd6PIrZqgxWhbY8qzGhg75IZj4drQfoshMoi1IJJgQ`
- **Environments:** ✅ Production, ✅ Preview, ✅ Development

### Variable 3:
- **Name:** `SUPABASE_SERVICE_ROLE_KEY`
- **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzaWRnZmRjb2xnbGdob3dqd3JvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjEyNzYzMywiZXhwIjoyMDc3NzAzNjMzfQ.IFhffGPd2aq-wgU4ezXGJc_x9GRPpDCVxIdk0elGwvs`
- **Environments:** ✅ Production, ✅ Preview, ✅ Development

5. **Importante:** Haz un **Redeploy** después de agregar las variables:
   - Ve a **Deployments**
   - Haz clic en el menú de 3 puntos del último deployment
   - Selecciona **Redeploy**
   - O simplemente espera a que Vercel detecte los cambios

## ✅ Verificar que Funcione:

1. Después del redeploy, visita: https://tirescur.vercel.app/api/test-connection
2. Debe mostrar:
   - ✅ Variables configuradas
   - ✅ Conexión exitosa a Supabase
   - ✅ Conteo de productos, marcas y categorías

## 📝 Notas:

- El código ahora acepta tanto `SUPABASE_*` como `NEXT_PUBLIC_SUPABASE_*` como `VITE_SUPABASE_*`
- En el servidor, prioriza variables sin prefijo
- En el cliente, prioriza variables con prefijo `VITE_` o `NEXT_PUBLIC_`

## ⚠️ Variables que NO Necesitas (para este proyecto):

Estas variables de Supabase NO son necesarias para que funcione el código:
- `POSTGRES_URL`
- `POSTGRES_USER`
- `POSTGRES_HOST`
- `POSTGRES_PASSWORD`
- `POSTGRES_DATABASE`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`
- `SUPABASE_JWT_SECRET`

Solo necesitas las 3 variables mencionadas arriba.

