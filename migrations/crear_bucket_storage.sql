-- =====================================================
-- SCRIPT PARA CREAR BUCKET DE STORAGE Y POLÍTICAS
-- Ejecutar en Supabase SQL Editor
-- =====================================================

-- NOTA: En Supabase, los buckets se crean mediante la API o Dashboard
-- Este script contiene las políticas SQL necesarias

-- =====================================================
-- POLÍTICAS DE STORAGE PARA 'product-images'
-- =====================================================

-- 1. Política para permitir lectura pública (opcional)
-- Si quieres que las imágenes sean públicas, descomenta esto:
/*
DROP POLICY IF EXISTS "Public Access for product-images" ON storage.objects;
CREATE POLICY "Public Access for product-images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'product-images');
*/

-- 2. Política para permitir inserción (upload) con autenticación
-- Asegúrate de que solo usuarios autenticados puedan subir
DROP POLICY IF EXISTS "Authenticated users can upload product-images" ON storage.objects;
CREATE POLICY "Authenticated users can upload product-images"
ON storage.objects
FOR INSERT
WITH CHECK (
    bucket_id = 'product-images' 
    AND auth.role() = 'authenticated'
);

-- 3. Política para permitir actualización
DROP POLICY IF EXISTS "Authenticated users can update product-images" ON storage.objects;
CREATE POLICY "Authenticated users can update product-images"
ON storage.objects
FOR UPDATE
USING (
    bucket_id = 'product-images' 
    AND auth.role() = 'authenticated'
);

-- 4. Política para permitir eliminación
DROP POLICY IF EXISTS "Authenticated users can delete product-images" ON storage.objects;
CREATE POLICY "Authenticated users can delete product-images"
ON storage.objects
FOR DELETE
USING (
    bucket_id = 'product-images' 
    AND auth.role() = 'authenticated'
);

-- =====================================================
-- INSTRUCCIONES PARA CREAR EL BUCKET MANUALMENTE
-- =====================================================

/*
1. Ve al Dashboard de Supabase: https://app.supabase.com
2. Selecciona tu proyecto
3. Ve a "Storage" en el menú lateral
4. Haz clic en "New bucket"
5. Nombre: "product-images"
6. Configuración:
   - Public bucket: NO (o SÍ si quieres acceso público)
   - File size limit: 5242880 (5MB) o el que prefieras
   - Allowed MIME types: image/jpeg, image/png, image/gif, image/webp
7. Haz clic en "Create bucket"

ALTERNATIVA: Usar la API REST de Supabase
POST https://[project-ref].supabase.co/storage/v1/bucket
Headers:
  Authorization: Bearer [service-role-key]
  apikey: [service-role-key]
Body:
{
  "name": "product-images",
  "public": false,
  "file_size_limit": 5242880,
  "allowed_mime_types": ["image/jpeg", "image/png", "image/gif", "image/webp"]
}
*/

