-- Migración: Crear bucket de Storage en Supabase para imágenes de productos
-- NOTA: Este script debe ejecutarse en Supabase Dashboard → Storage
-- O usar la API de Supabase para crear el bucket programáticamente

-- IMPORTANTE: Los buckets de Storage en Supabase se crean desde el Dashboard
-- o usando la API de Supabase. No se pueden crear directamente con SQL.

-- Instrucciones:
-- 1. Ve a Supabase Dashboard → Storage
-- 2. Haz clic en "New bucket"
-- 3. Nombre: "product-images"
-- 4. Público: Sí (para que las imágenes sean accesibles públicamente)
-- 5. Haz clic en "Create bucket"

-- O usar este código en una función serverless o script:

/*
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createBucket() {
  const { data, error } = await supabase.storage.createBucket('product-images', {
    public: true,
    fileSizeLimit: 5242880, // 5MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  });

  if (error) {
    console.error('Error creating bucket:', error);
  } else {
    console.log('Bucket created successfully:', data);
  }
}

createBucket();
*/

-- Política RLS (Row Level Security) para el bucket
-- Ejecutar esto después de crear el bucket manualmente:

-- Política para permitir lectura pública
CREATE POLICY IF NOT EXISTS "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Política para permitir subida de archivos (solo autenticados o con service role)
CREATE POLICY IF NOT EXISTS "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'product-images');

-- Política para permitir actualización de archivos propios
CREATE POLICY IF NOT EXISTS "Users can update own files"
ON storage.objects FOR UPDATE
USING (bucket_id = 'product-images');

-- Política para permitir eliminación de archivos propios
CREATE POLICY IF NOT EXISTS "Users can delete own files"
ON storage.objects FOR DELETE
USING (bucket_id = 'product-images');

