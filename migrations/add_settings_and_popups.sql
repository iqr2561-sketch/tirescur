-- Migración: Agregar tablas para settings, popups y configuración

-- =====================================================
-- TABLA: settings (Configuraciones generales)
-- =====================================================
CREATE TABLE IF NOT EXISTS settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(255) NOT NULL UNIQUE,
    value JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para settings
CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);

-- =====================================================
-- TABLA: popups (Popups de promociones)
-- =====================================================
CREATE TABLE IF NOT EXISTS popups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    message TEXT,
    image_url TEXT,
    button_text VARCHAR(100),
    button_link TEXT,
    is_active BOOLEAN DEFAULT true,
    auto_close_seconds INTEGER, -- Si es NULL, no se cierra automáticamente
    show_on_page_load BOOLEAN DEFAULT true,
    show_once_per_session BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 0, -- Mayor prioridad se muestra primero
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para popups
CREATE INDEX IF NOT EXISTS idx_popups_is_active ON popups(is_active);
CREATE INDEX IF NOT EXISTS idx_popups_priority ON popups(priority DESC);
CREATE INDEX IF NOT EXISTS idx_popups_dates ON popups(start_date, end_date);

-- =====================================================
-- TABLA: uploads (Archivos subidos)
-- =====================================================
CREATE TABLE IF NOT EXISTS uploads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_type VARCHAR(100),
    file_size INTEGER,
    entity_type VARCHAR(50), -- 'product', 'popup', 'offer_banner', etc.
    entity_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para uploads
CREATE INDEX IF NOT EXISTS idx_uploads_entity ON uploads(entity_type, entity_id);

-- =====================================================
-- Trigger para actualizar updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_popups_updated_at BEFORE UPDATE ON popups
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- INSERTAR CONFIGURACIONES POR DEFECTO
-- =====================================================

-- Configuración de contacto
INSERT INTO settings (key, value, description) VALUES
('contact', '{
    "address": "",
    "city": "",
    "state": "",
    "zipCode": "",
    "country": "",
    "phone": "",
    "email": "",
    "latitude": null,
    "longitude": null,
    "mapZoom": 15
}'::jsonb, 'Configuración de contacto y ubicación de la tienda')
ON CONFLICT (key) DO NOTHING;

-- Configuración de zona de ofertas
INSERT INTO settings (key, value, description) VALUES
('offer_zone', '{
    "backgroundImage": "",
    "backgroundColor": "#1f2937",
    "title": "¡Atención! Zona de Ofertas",
    "subtitle": "¡Date prisa! Descuentos hasta el 70%",
    "buttonText": "Ver Todas las Ofertas Disponibles",
    "buttonLink": "/shop?offer=true"
}'::jsonb, 'Configuración de la zona de ofertas en la página principal')
ON CONFLICT (key) DO NOTHING;

-- Configuración del footer
INSERT INTO settings (key, value, description) VALUES
('footer', '{
    "aboutText": "Somos especialistas en neumáticos con años de experiencia.",
    "socialMedia": {
        "facebook": "",
        "instagram": "",
        "twitter": "",
        "whatsapp": ""
    },
    "copyrightText": "© 2024 REDPARTS. Todos los derechos reservados.",
    "links": {
        "about": "Acerca de Nosotros",
        "faq": "Preguntas Frecuentes",
        "privacy": "Política de Privacidad",
        "terms": "Términos y Condiciones"
    }
}'::jsonb, 'Configuración del pie de página')
ON CONFLICT (key) DO NOTHING;

