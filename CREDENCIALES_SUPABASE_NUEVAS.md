# 🔐 Nuevas Credenciales de Supabase - Actualizadas

## 📋 Variables de Entorno para Configurar en Vercel

### Variables para Serverless Functions (Backend)
Estas variables se usan en las API serverless:

1. **SUPABASE_URL**
   ```
   https://mpmqnmtlfocgxhyufgas.supabase.co
   ```

2. **SUPABASE_ANON_KEY**
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wbXFubXRsZm9jZ3hoeXVmZ2FzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxNzgzNjEsImV4cCI6MjA3Nzc1NDM2MX0.HcInyo3uYVU6vDmtIfRJ_r5C-3NRBPDueighMphQtns
   ```

3. **SUPABASE_SERVICE_ROLE_KEY**
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wbXFubXRsZm9jZ3hoeXVmZ2FzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjE3ODM2MSwiZXhwIjoyMDc3NzU0MzYxfQ.R0L8vKAbMFiGIfXWZb5mPc8TRx9aKSMVOUTVhk9y-rc
   ```

### Variables para Frontend (Cliente)
Estas variables se usan en el frontend y pueden tener el prefijo `VITE_` o `NEXT_PUBLIC_`:

1. **VITE_SUPABASE_URL** o **NEXT_PUBLIC_SUPABASE_URL**
   ```
   https://mpmqnmtlfocgxhyufgas.supabase.co
   ```

2. **VITE_SUPABASE_ANON_KEY** o **NEXT_PUBLIC_SUPABASE_ANON_KEY**
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wbXFubXRsZm9jZ3hoeXVmZ2FzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxNzgzNjEsImV4cCI6MjA3Nzc1NDM2MX0.HcInyo3uYVU6vDmtIfRJ_r5C-3NRBPDueighMphQtns
   ```

## 🔧 Cómo Configurar en Vercel

### Paso 1: Ir a Variables de Entorno
1. Ve a tu proyecto en Vercel: https://vercel.com/dashboard
2. Selecciona el proyecto `tirescur`
3. Ve a **Settings** → **Environment Variables**

### Paso 2: Agregar/Actualizar Variables

#### Para Production, Preview y Development:

**Variables sin prefijo (para serverless functions):**
- `SUPABASE_URL` = `https://mpmqnmtlfocgxhyufgas.supabase.co`
- `SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wbXFubXRsZm9jZ3hoeXVmZ2FzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxNzgzNjEsImV4cCI6MjA3Nzc1NDM2MX0.HcInyo3uYVU6vDmtIfRJ_r5C-3NRBPDueighMphQtns`
- `SUPABASE_SERVICE_ROLE_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wbXFubXRsZm9jZ3hoeXVmZ2FzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjE3ODM2MSwiZXhwIjoyMDc3NzU0MzYxfQ.R0L8vKAbMFiGIfXWZb5mPc8TRx9aKSMVOUTVhk9y-rc`

**Variables con prefijo (para frontend):**
- `VITE_SUPABASE_URL` = `https://mpmqnmtlfocgxhyufgas.supabase.co`
- `VITE_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wbXFubXRsZm9jZ3hoeXVmZ2FzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxNzgzNjEsImV4cCI6MjA3Nzc1NDM2MX0.HcInyo3uYVU6vDmtIfRJ_r5C-3NRBPDueighMphQtns`

**O también puedes usar (el código detecta ambas):**
- `NEXT_PUBLIC_SUPABASE_URL` = `https://mpmqnmtlfocgxhyufgas.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wbXFubXRsZm9jZ3hoeXVmZ2FzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxNzgzNjEsImV4cCI6MjA3Nzc1NDM2MX0.HcInyo3uYVU6vDmtIfRJ_r5C-3NRBPDueighMphQtns`

### Paso 3: Redeploy
Después de agregar/actualizar las variables, haz un **Redeploy** de tu proyecto en Vercel.

## 📊 Información Adicional de PostgreSQL (Opcional)

Estas variables son opcionales y solo se usan para conexiones directas a PostgreSQL:

- `POSTGRES_URL` = `postgres://postgres.mpmqnmtlfocgxhyufgas:85dhp2nWOBOVH4vx@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler.x`
- `POSTGRES_USER` = `postgres`
- `POSTGRES_PASSWORD` = `85dhp2nWOBOVH4vx`
- `POSTGRES_HOST` = `db.mpmqnmtlfocgxhyufgas.supabase.co`
- `POSTGRES_DATABASE` = `postgres`
- `POSTGRES_PRISMA_URL` = `postgres://postgres.mpmqnmtlfocgxhyufgas:85dhp2nWOBOVH4vx@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true`
- `POSTGRES_URL_NON_POOLING` = `postgres://postgres.mpmqnmtlfocgxhyufgas:85dhp2nWOBOVH4vx@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require`
- `SUPABASE_JWT_SECRET` = `ANz5nKFlCF47UkxaCisb4vvSAdyF+c7qh1ftNzIZmncELcnL3CQgxA0v3Z4dC9D3xPJr5D5vKd8ouZmxcvjlQg==`

## ✅ Verificación

Después de configurar las variables, puedes verificar la conexión visitando:
- `https://tirescur.vercel.app/api/test-connection`

Deberías ver una respuesta con el estado de las variables de entorno.

