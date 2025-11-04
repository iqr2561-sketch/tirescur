-- =====================================================
-- Script para agregar campos de nombre y logo del sitio
-- =====================================================

-- Insertar configuración de siteName si no existe
INSERT INTO settings (key, value, description) VALUES
('siteName', '"Tienda RedParts"'::jsonb, 'Nombre del sitio web')
ON CONFLICT (key) DO NOTHING;

-- Insertar configuración de siteLogo si no existe
INSERT INTO settings (key, value, description) VALUES
('siteLogo', '""'::jsonb, 'URL del logo del sitio')
ON CONFLICT (key) DO NOTHING;

-- Verificar que las configuraciones existen
SELECT 
    key,
    value,
    description,
    updated_at
FROM settings
WHERE key IN ('siteName', 'siteLogo')
ORDER BY key;

