# 🪣 Guía Completa: Cómo Crear el Bucket de Storage en Supabase

## ⚠️ IMPORTANTE

El bucket debe crearse en **Supabase Dashboard**, NO en Vercel. Vercel es solo para el hosting de la aplicación.

## 📍 Paso 1: Acceder a Supabase Dashboard

1. Ve a [https://app.supabase.com](https://app.supabase.com)
2. Inicia sesión con tu cuenta
3. Selecciona tu proyecto (el que estás usando para esta aplicación)

## 📍 Paso 2: Navegar a Storage

1. En el menú lateral izquierdo, busca la sección **"Storage"**
2. Haz clic en **"Storage"** o **"Almacenamiento"**

## 📍 Paso 3: Crear el Bucket

1. Verás una lista de buckets existentes (si hay alguno)
2. Haz clic en el botón **"New bucket"** o **"Crear bucket"** o **"Create bucket"**
   - Este botón puede estar en la parte superior derecha o en el centro de la pantalla

## 📍 Paso 4: Configurar el Bucket

Completa el formulario con estos valores:

### Nombre del Bucket
```
product-images
```
⚠️ **IMPORTANTE**: El nombre debe ser exactamente `product-images` (con guión, sin espacios)

### Configuración del Bucket

1. **Public bucket** (Bucket público):
   - Opción A: **NO** (más seguro, requiere autenticación para ver imágenes)
   - Opción B: **SÍ** (acceso público, cualquiera puede ver las imágenes)
   - **Recomendación**: Si tus imágenes de productos deben ser públicas, marca **SÍ**

2. **File size limit** (Límite de tamaño de archivo):
   - Valor: `5242880` (esto es 5MB en bytes)
   - O puedes usar: `10485760` (10MB) si prefieres archivos más grandes

3. **Allowed MIME types** (Tipos MIME permitidos):
   - Agrega estos tipos (uno por línea o separados por comas):
     - `image/jpeg`
     - `image/png`
     - `image/gif`
     - `image/webp`
   - O simplemente: `image/*` (permite todos los tipos de imagen)

## 📍 Paso 5: Crear el Bucket

1. Haz clic en el botón **"Create bucket"** o **"Crear bucket"**
2. Espera a que se cree (puede tardar unos segundos)
3. Verás el bucket `product-images` en la lista

## 📍 Paso 6: Configurar Políticas (Opcional pero Recomendado)

Después de crear el bucket, puedes configurar las políticas de acceso:

1. Haz clic en el bucket `product-images` que acabas de crear
2. Ve a la pestaña **"Policies"** o **"Políticas"**
3. Ejecuta el SQL de `migrations/crear_bucket_storage.sql` en el **SQL Editor** de Supabase

O crea las políticas manualmente desde el Dashboard:
- Haz clic en **"New Policy"** o **"Nueva Política"**
- Configura según tus necesidades de acceso

## ✅ Verificación

Para verificar que el bucket se creó correctamente:

1. Ve a **Storage** → Deberías ver `product-images` en la lista
2. Haz clic en el bucket → Deberías poder ver su contenido (vacío por ahora)
3. Prueba subir una imagen desde tu aplicación

## 🐛 Problemas Comunes

### "Bucket already exists"
- El bucket ya existe, no necesitas crearlo de nuevo
- Verifica que esté en la lista de buckets

### "Permission denied"
- Asegúrate de tener permisos de administrador en el proyecto de Supabase
- Verifica que estés usando la cuenta correcta

### "Invalid bucket name"
- El nombre debe ser en minúsculas
- No puede tener espacios
- Puede tener guiones (`-`) pero no guiones bajos (`_`) al inicio

## 📝 Nota sobre Vercel

Si estás viendo la interfaz de Vercel Storage, eso es diferente. **Necesitas crear el bucket en Supabase**, no en Vercel.

Vercel Storage es un servicio separado. Para esta aplicación, usamos Supabase Storage.

## 🔗 Enlaces Útiles

- [Documentación de Supabase Storage](https://supabase.com/docs/guides/storage)
- [Políticas de Storage en Supabase](https://supabase.com/docs/guides/storage/security/access-policies)

