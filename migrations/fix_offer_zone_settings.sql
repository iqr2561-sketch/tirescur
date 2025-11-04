-- =====================================================
-- Script para verificar y corregir configuración de ofertas (offer_zone)
-- =====================================================

-- 1. Verificar que la tabla settings existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'settings') THEN
        RAISE EXCEPTION 'La tabla settings no existe. Ejecuta primero migrations/add_settings_and_popups.sql';
    END IF;
END $$;

-- 2. Verificar estructura de la tabla settings
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'settings'
ORDER BY ordinal_position;

-- 3. Verificar si existe la configuración offer_zone
SELECT 
    key,
    description,
    created_at,
    updated_at
FROM settings
WHERE key = 'offer_zone';

-- 4. Crear o actualizar la configuración offer_zone con la estructura correcta
INSERT INTO settings (key, value, description) VALUES
('offer_zone', '{
    "targetDate": "",
    "discountText": "",
    "buttonText": "Ver Todas las Ofertas Disponibles",
    "backgroundImage": "",
    "backgroundColor": "#1f2937"
}'::jsonb, 'Configuración de la zona de ofertas en la página principal')
ON CONFLICT (key) 
DO UPDATE SET 
    value = EXCLUDED.value,
    updated_at = NOW();

-- 5. Verificar la configuración actualizada
SELECT 
    key,
    value->>'targetDate' as target_date,
    value->>'discountText' as discount_text,
    value->>'buttonText' as button_text,
    value->>'backgroundImage' as background_image,
    value->>'backgroundColor' as background_color,
    updated_at
FROM settings
WHERE key = 'offer_zone';

-- 6. Si necesitas actualizar un registro existente con estructura diferente:
-- Primero verifica qué campos tiene actualmente:
-- SELECT key, jsonb_object_keys(value) as campos FROM settings WHERE key = 'offer_zone';

-- Si necesitas migrar de una estructura antigua a la nueva:
-- UPDATE settings
-- SET value = jsonb_build_object(
--     'targetDate', COALESCE(value->>'targetDate', value->>'limitDate', ''),
--     'discountText', COALESCE(value->>'discountText', value->>'discount_text', ''),
--     'buttonText', COALESCE(value->>'buttonText', value->>'button_text', 'Ver Todas las Ofertas Disponibles'),
--     'backgroundImage', COALESCE(value->>'backgroundImage', value->>'background_image', ''),
--     'backgroundColor', COALESCE(value->>'backgroundColor', value->>'background_color', '#1f2937')
-- ),
-- updated_at = NOW()
-- WHERE key = 'offer_zone';

