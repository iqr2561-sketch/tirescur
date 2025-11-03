# ⚠️ Corrección de Nombres de Variables en Vercel

## 🔍 Problema Identificado

Veo que tienes algunas variables con nombres incorrectos o no estándar en Vercel. El código busca nombres específicos y estas variables no coinciden.

## ❌ Variables con Nombres Incorrectos

### Problema 1: `URL_SUPABASE_VITE`
- **Nombre actual:** `URL_SUPABASE_VITE` ❌
- **Nombre correcto:** `VITE_SUPABASE_URL` ✅
- **Acción:** Renombrar o crear nueva variable con el nombre correcto

### Problema 2: `VITE_SUPABASE_UR`
- **Nombre actual:** `VITE_SUPABASE_UR` ❌ (parece truncado)
- **Nombre correcto:** `VITE_SUPABASE_URL` ✅
- **Acción:** Renombrar o eliminar esta y crear la correcta

### Problema 3: `URL_SUPABASE`
- **Nombre actual:** `URL_SUPABASE` ❌
- **Nombre correcto:** `SUPABASE_URL` ✅
- **Acción:** Renombrar a `SUPABASE_URL`

### Problema 4: `URL_SUPABASE_PÚBLICA_SIGUIENTE`
- **Nombre actual:** `URL_SUPABASE_PÚBLICA_SIGUIENTE` ❌ (parece ser traducción)
- **Nombre correcto:** `NEXT_PUBLIC_SUPABASE_URL` ✅ (en inglés)
- **Acción:** Puedes mantenerla o eliminar (no es estrictamente necesaria si tienes las otras)

## ✅ Variables Correctas (No Cambiar)

Estas están bien y NO necesitas cambiarlas:
- ✅ `VITE_SUPABASE_ANON_KEY`
- ✅ `SUPABASE_ANON_KEY`
- ✅ `SUPABASE_SERVICE_ROLE_KEY` (o "Clave de rol de servicio de SUPABA...")
- ✅ Variables de PostgreSQL (`POSTGRES_*`)

## 🔧 Pasos para Corregir en Vercel

### Opción 1: Renombrar Variables Existentes

1. Ve a **Settings** → **Environment Variables** en Vercel
2. Para cada variable con nombre incorrecto:
   - Haz clic en la variable
   - Haz clic en "Edit" o edita el nombre
   - Cambia el nombre al correcto
   - Guarda

### Opción 2: Crear Nuevas Variables Correctas (Recomendado)

1. **Crear `VITE_SUPABASE_URL`:**
   - Name: `VITE_SUPABASE_URL`
   - Value: `https://mpmqnmtlfocgxhyufgas.supabase.co`
   - Environments: ✅ Production, ✅ Preview, ✅ Development

2. **Crear `SUPABASE_URL`:**
   - Name: `SUPABASE_URL`
   - Value: `https://mpmqnmtlfocgxhyufgas.supabase.co`
   - Environments: ✅ Production, ✅ Preview, ✅ Development

3. **Eliminar variables incorrectas:**
   - `URL_SUPABASE_VITE` (eliminar después de crear `VITE_SUPABASE_URL`)
   - `VITE_SUPABASE_UR` (eliminar, está truncado)
   - `URL_SUPABASE` (eliminar después de crear `SUPABASE_URL`)
   - `URL_SUPABASE_PÚBLICA_SIGUIENTE` (opcional, si quieres mantener `NEXT_PUBLIC_SUPABASE_URL`, renómbrala)

## ✅ Lista Final de Variables Necesarias

Después de corregir, deberías tener estas variables con estos nombres exactos:

### Para Serverless Functions (Backend):
- ✅ `SUPABASE_URL` (NO `URL_SUPABASE`)
- ✅ `SUPABASE_ANON_KEY`
- ✅ `SUPABASE_SERVICE_ROLE_KEY`

### Para Frontend (Cliente):
- ✅ `VITE_SUPABASE_URL` (NO `URL_SUPABASE_VITE` ni `VITE_SUPABASE_UR`)
- ✅ `VITE_SUPABASE_ANON_KEY`

### Opcionales (No Necesarias pero no hacen daño):
- `NEXT_PUBLIC_SUPABASE_URL` (si la quieres mantener)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (si la quieres mantener)
- Variables `POSTGRES_*` (opcionales)

## 🚨 Importante

**Los nombres de las variables DEBEN coincidir exactamente** con lo que el código espera:
- `VITE_SUPABASE_URL` (no `URL_SUPABASE_VITE`)
- `SUPABASE_URL` (no `URL_SUPABASE`)
- Etc.

Si los nombres no coinciden, el código no encontrará las variables y seguirás teniendo errores 500.

## 🔄 Después de Corregir

1. **Redeploy en Vercel:**
   - Ve a **Deployments**
   - Haz clic en **Redeploy**
   - Espera a que termine

2. **Probar:**
   - Visita: `https://tirescur.vercel.app/api/test-connection`
   - Intenta agregar una marca desde la aplicación

