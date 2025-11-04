-- =====================================================
-- Script para AGREGAR columna is_active si no existe
-- Ejecutar ESTE script primero si obtienes error de columna is_active
-- =====================================================

-- 1. Agregar is_active a products si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'products' 
        AND column_name = 'is_active'
    ) THEN
        ALTER TABLE products ADD COLUMN is_active BOOLEAN DEFAULT true;
        RAISE NOTICE 'Columna is_active agregada a products';
    ELSE
        RAISE NOTICE 'Columna is_active ya existe en products';
    END IF;
END $$;

-- 2. Agregar is_active a categories si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'categories' 
        AND column_name = 'is_active'
    ) THEN
        ALTER TABLE categories ADD COLUMN is_active BOOLEAN DEFAULT true;
        RAISE NOTICE 'Columna is_active agregada a categories';
    ELSE
        RAISE NOTICE 'Columna is_active ya existe en categories';
    END IF;
END $$;

-- 3. Crear índices si no existen (solo si las columnas existen)
DO $$
BEGIN
    -- Índice para products.is_active
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'products' 
        AND column_name = 'is_active'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
    END IF;
    
    -- Índice para categories.is_active
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'categories' 
        AND column_name = 'is_active'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_categories_is_active ON categories(is_active);
    END IF;
END $$;

-- 4. Verificar que las columnas existen
SELECT 
    table_name,
    column_name,
    data_type,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name IN ('products', 'categories')
    AND column_name = 'is_active'
ORDER BY table_name;

