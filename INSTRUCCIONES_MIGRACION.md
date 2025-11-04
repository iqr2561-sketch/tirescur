# 🔧 Instrucciones para Ejecutar la Migración

## ⚠️ IMPORTANTE: Agregar columna `is_active` a la tabla `products`

La aplicación requiere que la tabla `products` tenga la columna `is_active`. Si no la tienes, sigue estos pasos:

### 📝 Pasos para Ejecutar la Migración en Supabase

1. **Abre Supabase Dashboard**
   - Ve a https://app.supabase.com
   - Selecciona tu proyecto

2. **Abre el SQL Editor**
   - En el menú lateral, haz clic en "SQL Editor"
   - Haz clic en "New query"

3. **Ejecuta el Script de Migración**
   - Copia y pega el siguiente código:

```sql
-- Agregar columna is_active si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'products' 
        AND column_name = 'is_active'
    ) THEN
        ALTER TABLE products ADD COLUMN is_active BOOLEAN DEFAULT true;
        CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
        COMMENT ON COLUMN products.is_active IS 'Producto activo y visible para clientes';
    END IF;
END $$;
```

4. **Ejecuta el Query**
   - Haz clic en "Run" o presiona `Ctrl+Enter` (o `Cmd+Enter` en Mac)
   - Deberías ver un mensaje de éxito

5. **Verifica que la Columna se Creó**
   - Ejecuta este query para verificar:
   ```sql
   SELECT column_name, data_type, column_default 
   FROM information_schema.columns 
   WHERE table_name = 'products' 
   AND column_name = 'is_active';
   ```
   - Deberías ver una fila con `is_active`, `boolean`, `true`

### ✅ Después de Ejecutar la Migración

1. Recarga la aplicación
2. Intenta crear o editar un producto nuevamente
3. Los errores sobre la columna `is_active` deberían desaparecer

---

## 🔍 Si Ya Tienes la Columna

Si ya ejecutaste el schema completo (`supabase-schema.sql`), la columna debería existir. Si aún así ves errores:

1. Verifica que la columna existe:
   ```sql
   SELECT * FROM information_schema.columns 
   WHERE table_name = 'products' 
   AND column_name = 'is_active';
   ```

2. Si no existe, ejecuta la migración arriba

3. Si existe pero sigue dando error, verifica que el cache de Supabase esté actualizado (puede tomar unos minutos)

---

## 📞 Soporte

Si después de ejecutar la migración sigues teniendo problemas, verifica:
- Que estés usando la base de datos correcta
- Que las variables de entorno estén configuradas correctamente
- Los logs en Vercel para ver errores específicos

