# Guía de Configuración para Supabase

Esta guía te ayudará a configurar Supabase para reemplazar MongoDB en el proyecto WebGomeria.

## 📋 Requisitos Previos

1. Cuenta en [Supabase](https://supabase.com)
2. Proyecto creado en Supabase
3. Acceso al SQL Editor en Supabase Dashboard

## 🚀 Pasos de Configuración

### 1. Crear el Esquema de Base de Datos

1. Ve al **SQL Editor** en tu proyecto de Supabase
2. Crea una nueva query
3. Copia y pega el contenido completo de `supabase-schema.sql`
4. Ejecuta el script
5. Verifica que todas las tablas se hayan creado correctamente

### 2. Insertar Datos Iniciales (Opcional)

1. En el **SQL Editor**, crea una nueva query
2. Copia y pega el contenido de `supabase-seed-data.sql`
3. Ejecuta el script
4. Verifica que los datos se hayan insertado correctamente

### 3. Obtener Credenciales de Supabase

1. Ve a **Settings** → **API** en tu proyecto de Supabase
2. Copia las siguientes credenciales:
   - **Project URL**: `https://your-project.supabase.co`
   - **anon/public key**: Clave pública para acceso desde el cliente
   - **service_role key**: Clave privada para acceso desde el servidor (manténla segura)

### 4. Configurar Variables de Entorno

Crea un archivo `.env.local` con las siguientes variables:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui
```

### 5. Instalar el Cliente de Supabase

```bash
npm install @supabase/supabase-js
```

## 📊 Estructura de Tablas

El esquema incluye las siguientes tablas:

1. **brands** - Marcas de neumáticos
2. **categories** - Categorías de productos
3. **products** - Productos (neumáticos)
4. **sales** - Ventas realizadas
5. **sale_products** - Relación muchos-a-muchos entre ventas y productos
6. **menu_items** - Elementos del menú de navegación
7. **app_settings** - Configuración global de la aplicación

## 🔐 Seguridad (Row Level Security - RLS)

El esquema incluye comentarios sobre políticas RLS que puedes habilitar según tus necesidades:

- **Lectura pública**: Permite leer datos sin autenticación
- **Escritura autenticada**: Requiere autenticación para modificar datos

Para habilitar RLS, descomenta las secciones al final de `supabase-schema.sql`.

## 🔄 Migración de Datos desde MongoDB

Para migrar datos existentes desde MongoDB a Supabase:

1. Exporta los datos de MongoDB en formato JSON
2. Crea un script de conversión que mapee los campos MongoDB a las columnas de PostgreSQL
3. Ajusta los tipos de datos (ObjectId → UUID, etc.)
4. Importa los datos usando el SQL Editor o un script de migración

### Ejemplo de Migración de Productos

```sql
-- Ejemplo de inserción masiva de productos
INSERT INTO products (sku, name, brand_name, price, ...)
VALUES 
    ('SKU1', 'Producto 1', 'Marca 1', 100.00, ...),
    ('SKU2', 'Producto 2', 'Marca 2', 200.00, ...);
```

## 📝 Notas Importantes

1. **UUID vs ObjectId**: Supabase usa UUID en lugar de ObjectId de MongoDB. Los IDs se generan automáticamente.
2. **Timestamps**: Las columnas `created_at` y `updated_at` se actualizan automáticamente con triggers.
3. **JSON Fields**: Los campos complejos como `footer_content` y `deal_zone_config` usan el tipo JSONB de PostgreSQL.
4. **Arrays**: Los tags de productos usan el tipo de array nativo de PostgreSQL.

## 🔍 Consultas Útiles

### Ver todos los productos con información completa:

```sql
SELECT * FROM products_full;
```

### Ver todas las ventas con detalles:

```sql
SELECT * FROM sales_full;
```

### Buscar productos por nombre o SKU:

```sql
SELECT * FROM products 
WHERE name ILIKE '%verano%' OR sku ILIKE '%205%';
```

## 🛠️ Próximos Pasos

1. Crear funciones API en Supabase para reemplazar las rutas actuales
2. Actualizar el código del cliente para usar el cliente de Supabase
3. Configurar políticas de seguridad según tus necesidades
4. Probar todas las operaciones CRUD

## 📚 Recursos

- [Documentación de Supabase](https://supabase.com/docs)
- [Guía de PostgreSQL](https://www.postgresql.org/docs/)
- [Cliente JavaScript de Supabase](https://supabase.com/docs/reference/javascript/introduction)

