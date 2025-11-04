# 🚀 Instrucciones Completas para Configurar la Base de Datos

## 📋 Problemas Identificados

1. **❌ Error "Bucket not found"**: El bucket `product-images` no existe en Supabase Storage
2. **❌ No se pueden crear productos**: Puede faltar alguna columna o hay un error en la API

## ✅ Solución Paso a Paso

### PASO 1: Ejecutar SQL Completo en Supabase

1. Ve a **Supabase Dashboard** → **SQL Editor**
2. Copia y pega el contenido del archivo `migrations/VERIFICAR_Y_CORREGIR_TODO.sql`
3. Haz clic en **"Run"** o **"Ejecutar"**
4. Verifica que todas las tablas se hayan creado correctamente

### PASO 2: Crear el Bucket de Storage

El bucket `product-images` debe crearse manualmente porque Supabase Storage no se puede crear solo con SQL.

#### Opción A: Desde el Dashboard (Recomendado)

1. Ve a **Supabase Dashboard** → **Storage**
2. Haz clic en **"New bucket"** o **"Crear bucket"**
3. Configuración:
   - **Nombre**: `product-images`
   - **Public bucket**: **NO** (o SÍ si quieres acceso público)
   - **File size limit**: `5242880` (5MB) o el que prefieras
   - **Allowed MIME types**: `image/jpeg, image/png, image/gif, image/webp`
4. Haz clic en **"Create bucket"**

#### Opción B: Usar la API REST

Si prefieres usar la API, puedes usar este código:

```bash
curl -X POST 'https://[TU-PROJECT-REF].supabase.co/storage/v1/bucket' \
  -H 'Authorization: Bearer [TU-SERVICE-ROLE-KEY]' \
  -H 'apikey: [TU-SERVICE-ROLE-KEY]' \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "product-images",
    "public": false,
    "file_size_limit": 5242880,
    "allowed_mime_types": ["image/jpeg", "image/png", "image/gif", "image/webp"]
  }'
```

### PASO 3: Configurar Políticas de Storage

1. Ve a **Supabase Dashboard** → **Storage** → **Policies**
2. Selecciona el bucket `product-images`
3. Haz clic en **"New Policy"**
4. Configura las políticas según `migrations/crear_bucket_storage.sql`

O ejecuta el SQL directamente en el SQL Editor:

```sql
-- Política para permitir inserción (upload) con autenticación
CREATE POLICY IF NOT EXISTS "Authenticated users can upload product-images"
ON storage.objects
FOR INSERT
WITH CHECK (
    bucket_id = 'product-images' 
    AND auth.role() = 'authenticated'
);

-- Política para permitir actualización
CREATE POLICY IF NOT EXISTS "Authenticated users can update product-images"
ON storage.objects
FOR UPDATE
USING (
    bucket_id = 'product-images' 
    AND auth.role() = 'authenticated'
);

-- Política para permitir eliminación
CREATE POLICY IF NOT EXISTS "Authenticated users can delete product-images"
ON storage.objects
FOR DELETE
USING (
    bucket_id = 'product-images' 
    AND auth.role() = 'authenticated'
);

-- Si quieres acceso público de lectura (opcional):
CREATE POLICY IF NOT EXISTS "Public Access for product-images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'product-images');
```

### PASO 4: Verificar Tablas y Columnas

Ejecuta este SQL para verificar que todo esté correcto:

```sql
-- Verificar todas las tablas
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
    AND table_name IN (
        'brands', 'categories', 'products', 'sales', 'sale_products', 
        'menu_items', 'admin_users', 'settings', 'popups', 'uploads'
    )
ORDER BY table_name;

-- Verificar columnas de products específicamente
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'products'
ORDER BY ordinal_position;
```

### PASO 5: Verificar que el Bucket Existe

En el Dashboard de Supabase:
1. Ve a **Storage**
2. Verifica que el bucket `product-images` aparezca en la lista
3. Si no aparece, créalo siguiendo el PASO 2

## 🔍 Verificación Final

### Tablas que deben existir:

- ✅ `brands` - Marcas de productos
- ✅ `categories` - Categorías de productos
- ✅ `products` - Productos (con columna `is_active`)
- ✅ `sales` - Ventas
- ✅ `sale_products` - Productos de venta
- ✅ `menu_items` - Elementos del menú
- ✅ `admin_users` - Usuarios administradores
- ✅ `settings` - Configuraciones globales
- ✅ `popups` - Popups de promoción
- ✅ `uploads` - Archivos subidos

### Columnas críticas en `products`:

- ✅ `id` (UUID)
- ✅ `sku` (VARCHAR, UNIQUE)
- ✅ `name` (VARCHAR)
- ✅ `brand_name` (VARCHAR)
- ✅ `price` (DECIMAL)
- ✅ `is_on_sale` (BOOLEAN)
- ✅ `sale_price` (DECIMAL)
- ✅ `discount_percentage` (INTEGER)
- ✅ `is_active` (BOOLEAN) ← **IMPORTANTE**
- ✅ `category_id` (UUID, FK)
- ✅ Todas las demás columnas según el schema

## 🐛 Solución de Problemas

### Error: "Bucket not found"
- **Solución**: Crea el bucket `product-images` manualmente (PASO 2)

### Error: "column 'is_active' does not exist"
- **Solución**: Ejecuta `migrations/add_is_active_to_products.sql`

### Error: "table 'settings' does not exist"
- **Solución**: Ejecuta `migrations/VERIFICAR_Y_CORREGIR_TODO.sql` completo

### Error: "Method not allowed" al crear producto
- **Solución**: Verifica que el endpoint `/api/products` esté funcionando correctamente
- Revisa los logs de Vercel para ver errores del servidor

### Error: "Cannot read properties of undefined"
- **Solución**: Verifica que todas las tablas y columnas existan ejecutando el SQL de verificación

## 📝 Notas Importantes

1. **El bucket de Storage debe crearse manualmente** - No se puede crear solo con SQL
2. **Las políticas de Storage** pueden crearse con SQL o desde el Dashboard
3. **Usuario admin por defecto**: `admin` / `1234` (cambiar en producción)
4. **Configuración de ofertas**: Se guarda en la tabla `settings` con key `offer_zone`

## ✅ Checklist Final

- [ ] Ejecuté `VERIFICAR_Y_CORREGIR_TODO.sql`
- [ ] Creé el bucket `product-images` en Storage
- [ ] Configuré las políticas de Storage
- [ ] Verifiqué que todas las tablas existen
- [ ] Verifiqué que la columna `is_active` existe en `products`
- [ ] Probé crear un producto nuevo
- [ ] Probé subir una imagen de producto

