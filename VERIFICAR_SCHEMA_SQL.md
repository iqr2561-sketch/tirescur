# 🔍 Verificación y Actualización del Schema SQL

## ✅ Estado Actual del Schema (Verificado)

**Fecha de última verificación**: $(date)

El schema SQL actual (`supabase-schema.sql`) está **sincronizado** con `types.ts`:

✅ **Campos de Productos**: Todos los campos incluidos
✅ **Campos de Ofertas**: `is_on_sale`, `sale_price`, `discount_percentage`, `category_id` - **TODOS INCLUIDOS**
✅ **Tablas**: brands, categories, products, sales, sale_products, menu_items, app_settings
✅ **Relaciones**: Foreign keys configuradas correctamente
✅ **Índices**: Todos los índices necesarios incluidos

## 📋 Cuándo Verificar el Schema SQL

Debes revisar y actualizar `supabase-schema.sql` cuando:

1. ✅ **Se agreguen nuevos campos a los tipos TypeScript** (`types.ts`)
   - Ejemplo: Si agregas un nuevo campo a `Product`, `Brand`, `Category`, etc.

2. ✅ **Se modifiquen los tipos de datos existentes**
   - Ejemplo: Cambiar de `string` a `number`, o agregar campos opcionales

3. ✅ **Se agreguen nuevas tablas o relaciones**
   - Ejemplo: Nueva tabla de usuarios, pedidos, etc.

4. ✅ **Se cambien nombres de columnas o tablas**
   - Ejemplo: Renombrar `is_on_sale` a `is_active_sale`

5. ✅ **Se agreguen índices o constraints nuevos**
   - Ejemplo: Agregar índice único en un campo nuevo

## 🔄 Campos Actuales que Deben Estar en el Schema

### Tabla `products` - Campos de Ofertas

El schema SQL ya incluye estos campos:
- ✅ `is_on_sale` (BOOLEAN)
- ✅ `sale_price` (DECIMAL)
- ✅ `discount_percentage` (INTEGER)
- ✅ `category_id` (UUID, FK a categories)

### Verificación de Campos

Compara los campos en `types.ts` con las columnas en `supabase-schema.sql`:

#### Product Interface (types.ts):
```typescript
- id: string
- sku: string
- name: string
- brand: string
- brandId?: string
- brandLogoUrl?: string
- price: number
- rating: number
- reviews: number
- imageUrl: string
- description: string
- tags?: string[]
- stock: number
- width: string
- profile: string
- diameter: string
- isOnSale?: boolean        ← is_on_sale en SQL
- salePrice?: number        ← sale_price en SQL
- discountPercentage?: number ← discount_percentage en SQL
- categoryId?: string       ← category_id en SQL
```

#### Tabla products en SQL:
```sql
- id (UUID)
- sku (VARCHAR)
- name (VARCHAR)
- brand_name (VARCHAR)
- brand_id (UUID, FK)
- brand_logo_url (TEXT)
- price (DECIMAL)
- rating (DECIMAL)
- reviews (INTEGER)
- image_url (TEXT)
- description (TEXT)
- tags (TEXT[])
- stock (INTEGER)
- width (VARCHAR)
- profile (VARCHAR)
- diameter (VARCHAR)
- is_on_sale (BOOLEAN)      ✅
- sale_price (DECIMAL)      ✅
- discount_percentage (INTEGER) ✅
- category_id (UUID, FK)   ✅
```

## 📝 Pasos para Actualizar el Schema SQL

Cuando necesites hacer ajustes:

1. **Identificar cambios en `types.ts`**
   ```bash
   # Revisa types.ts para ver qué campos se agregaron/modificaron
   ```

2. **Actualizar `supabase-schema.sql`**
   - Agrega nuevas columnas en la sección `CREATE TABLE`
   - Actualiza los índices si es necesario
   - Agrega constraints si aplica

3. **Crear script de migración (opcional)**
   ```sql
   -- Ejemplo: Si agregas un campo nuevo
   ALTER TABLE products 
   ADD COLUMN nuevo_campo VARCHAR(255) DEFAULT NULL;
   ```

4. **Actualizar `supabase-seed-data.sql`** si es necesario
   - Agrega datos de ejemplo para nuevos campos

5. **Documentar los cambios** en este archivo

## ⚠️ Campos que Requieren Atención

### Campos Nuevos Agregados Recientemente

✅ **Campos de Ofertas** - Ya incluidos en el schema:
- `is_on_sale`
- `sale_price`
- `discount_percentage`
- `category_id`

## 🔔 Sistema de Notificación

Cuando se hagan cambios en `types.ts` que requieran actualizar el SQL, el sistema verificará:

1. ✅ Comparación automática de campos
2. ✅ Alertas cuando falten campos en SQL
3. ✅ Sugerencias de migración SQL

## 📚 Comandos Útiles

### Verificar estructura de una tabla en Supabase:
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'products'
ORDER BY ordinal_position;
```

### Ver todas las tablas:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

### Verificar foreign keys:
```sql
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY';
```

## 🎯 Próximos Pasos

1. Revisar periódicamente este documento cuando hagas cambios
2. Mantener sincronizado `types.ts` con `supabase-schema.sql`
3. Crear scripts de migración para cambios en producción

