-- =====================================================
-- Script para verificar y corregir la tabla popups
-- =====================================================

-- Verificar si la tabla existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'popups') THEN
        RAISE EXCEPTION 'La tabla popups no existe. Ejecuta primero migrations/add_settings_and_popups.sql';
    END IF;
END $$;

-- Verificar si la columna image_url existe, si no, agregarla
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'popups' 
        AND column_name = 'image_url'
    ) THEN
        ALTER TABLE popups ADD COLUMN image_url TEXT;
        RAISE NOTICE 'Columna image_url agregada a la tabla popups';
    ELSE
        RAISE NOTICE 'La columna image_url ya existe';
    END IF;
END $$;

-- Verificar estructura completa de la tabla
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'popups'
ORDER BY ordinal_position;

-- Verificar datos existentes
SELECT 
    id,
    title,
    image_url,
    is_active,
    created_at
FROM popups
ORDER BY created_at DESC
LIMIT 5;

