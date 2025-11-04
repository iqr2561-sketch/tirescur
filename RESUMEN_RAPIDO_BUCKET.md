# 🪣 RESUMEN RÁPIDO: Crear Bucket en Supabase

## ✅ SÍ, se crea en SUPABASE (NO en Vercel)

## 📍 Pasos Rápidos:

### 1. Ir a Supabase
- Abre: **https://app.supabase.com**
- Inicia sesión
- Selecciona tu proyecto

### 2. Ir a Storage
- Menú lateral izquierdo → **"Storage"**
- Haz clic en **"Storage"**

### 3. Crear Bucket
- Haz clic en **"New bucket"** o **"Crear bucket"**
- **Nombre**: `product-images` (exactamente así)
- **Public bucket**: ✅ SÍ (si quieres imágenes públicas) o ❌ NO
- **File size limit**: `5242880` (5MB)
- **Allowed MIME types**: `image/jpeg, image/png, image/gif, image/webp`
- Haz clic en **"Create bucket"**

### 4. ¡Listo!
- Verás el bucket `product-images` en la lista
- Ya puedes subir imágenes desde tu aplicación

## ⚠️ IMPORTANTE:
- ✅ **SÍ**: Crear en **Supabase Dashboard** (https://app.supabase.com)
- ❌ **NO**: Crear en Vercel Dashboard

## 📝 Después de Crear el Bucket:
1. Ejecuta las políticas de Storage: `migrations/crear_bucket_storage.sql`
2. Verifica las tablas: `migrations/VERIFICAR_Y_CORREGIR_TODO.sql`

