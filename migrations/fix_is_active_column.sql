-- =====================================================
-- Script para agregar columna is_active a todas las tablas que la necesitan
-- =====================================================

-- 1. Agregar is_active a products si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'is_active'
    ) THEN
        ALTER TABLE products ADD COLUMN is_active BOOLEAN DEFAULT true;
        COMMENT ON COLUMN products.is_active IS 'Producto activo y visible para clientes';
        CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
    END IF;
END $$;

-- 2. Agregar is_active a categories si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'categories' AND column_name = 'is_active'
    ) THEN
        ALTER TABLE categories ADD COLUMN is_active BOOLEAN DEFAULT true;
        COMMENT ON COLUMN categories.is_active IS 'Categoría activa y visible';
        CREATE INDEX IF NOT EXISTS idx_categories_is_active ON categories(is_active);
    END IF;
END $$;

-- 3. Verificar que las columnas existen
SELECT 
    table_name,
    column_name,
    data_type,
    column_default
FROM information_schema.columns
WHERE table_name IN ('products', 'categories')
    AND column_name = 'is_active'
ORDER BY table_name;

