-- Migración: Agregar columna is_active a tabla products
-- Ejecutar este script en Supabase SQL Editor si la columna no existe

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

