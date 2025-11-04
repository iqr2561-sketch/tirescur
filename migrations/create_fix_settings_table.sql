-- =====================================================
-- Script completo para crear/corregir tabla settings
-- y configuración de ofertas (offer_zone)
-- =====================================================

-- 1. Crear tabla settings si no existe
CREATE TABLE IF NOT EXISTS settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(255) NOT NULL UNIQUE,
    value JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Crear índices si no existen
CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);
CREATE INDEX IF NOT EXISTS idx_settings_created_at ON settings(created_at);

-- 3. Crear función para actualizar updated_at si no existe
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Crear trigger para updated_at si no existe
DROP TRIGGER IF EXISTS update_settings_updated_at ON settings;
CREATE TRIGGER update_settings_updated_at 
    BEFORE UPDATE ON settings
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 5. Verificar estructura de la tabla
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'settings'
ORDER BY ordinal_position;

-- 6. Crear o actualizar configuración de offer_zone con estructura correcta
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
    value = jsonb_build_object(
        'targetDate', COALESCE(
            (settings.value->>'targetDate'),
            (settings.value->>'limitDate'),
            (settings.value->>'target_date'),
            ''
        ),
        'discountText', COALESCE(
            (settings.value->>'discountText'),
            (settings.value->>'discount_text'),
            ''
        ),
        'buttonText', COALESCE(
            (settings.value->>'buttonText'),
            (settings.value->>'button_text'),
            'Ver Todas las Ofertas Disponibles'
        ),
        'backgroundImage', COALESCE(
            (settings.value->>'backgroundImage'),
            (settings.value->>'background_image'),
            ''
        ),
        'backgroundColor', COALESCE(
            (settings.value->>'backgroundColor'),
            (settings.value->>'background_color'),
            '#1f2937'
        )
    ),
    updated_at = NOW()
WHERE settings.key = 'offer_zone';

-- 7. Verificar la configuración actualizada
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

-- 8. Verificar todas las configuraciones existentes
SELECT 
    key,
    description,
    created_at,
    updated_at,
    jsonb_object_keys(value) as campos
FROM settings
ORDER BY key;

-- 9. Si necesitas limpiar y empezar de nuevo (OPCIONAL - solo si hay problemas):
-- DELETE FROM settings WHERE key = 'offer_zone';
-- INSERT INTO settings (key, value, description) VALUES
-- ('offer_zone', '{"targetDate": "", "discountText": "", "buttonText": "Ver Todas las Ofertas Disponibles", "backgroundImage": "", "backgroundColor": "#1f2937"}'::jsonb, 'Configuración de la zona de ofertas en la página principal');

