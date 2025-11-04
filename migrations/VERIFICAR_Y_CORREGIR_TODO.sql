-- =====================================================
-- SCRIPT COMPLETO PARA VERIFICAR Y CORREGIR TODO EL ESQUEMA
-- Incluye: Tablas, Columnas, Índices, Triggers, Storage
-- =====================================================

-- =====================================================
-- 1. EXTENSIONES NECESARIAS
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 2. TABLA: brands (Marcas)
-- =====================================================
CREATE TABLE IF NOT EXISTS brands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_brands_name ON brands(name);

-- =====================================================
-- 3. TABLA: categories (Categorías)
-- =====================================================
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    icon_type VARCHAR(50) DEFAULT 'tire',
    image_url TEXT,
    description TEXT,
    "order" INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);
CREATE INDEX IF NOT EXISTS idx_categories_order ON categories("order");
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON categories(is_active);

-- =====================================================
-- 4. TABLA: products (Productos) - VERIFICAR Y AGREGAR COLUMNAS FALTANTES
-- =====================================================
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sku VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    brand_name VARCHAR(255) NOT NULL,
    brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
    brand_logo_url TEXT,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    rating DECIMAL(3, 2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    reviews INTEGER DEFAULT 0 CHECK (reviews >= 0),
    image_url TEXT,
    description TEXT,
    tags TEXT[],
    stock INTEGER DEFAULT 0 CHECK (stock >= 0),
    width VARCHAR(50),
    profile VARCHAR(50),
    diameter VARCHAR(50),
    is_on_sale BOOLEAN DEFAULT false,
    sale_price DECIMAL(10, 2) CHECK (sale_price >= 0),
    discount_percentage INTEGER CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT check_sale_price CHECK (
        (is_on_sale = false) OR 
        (is_on_sale = true AND sale_price IS NOT NULL AND sale_price < price)
    )
);

-- Agregar columna is_active si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'is_active'
    ) THEN
        ALTER TABLE products ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
END $$;

-- Índices para products
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_brand_id ON products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_brand_name ON products(brand_name);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_on_sale ON products(is_on_sale);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);

-- =====================================================
-- 5. TABLA: sales (Ventas)
-- =====================================================
CREATE TABLE IF NOT EXISTS sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_name VARCHAR(255),
    customer_phone VARCHAR(50),
    customer_email VARCHAR(255),
    customer_address TEXT,
    total DECIMAL(10, 2) NOT NULL CHECK (total >= 0),
    status VARCHAR(50) DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sales_status ON sales(status);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at);

-- =====================================================
-- 6. TABLA: sale_products (Productos de Venta)
-- =====================================================
CREATE TABLE IF NOT EXISTS sale_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sale_id UUID REFERENCES sales(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sale_products_sale_id ON sale_products(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_products_product_id ON sale_products(product_id);

-- =====================================================
-- 7. TABLA: menu_items (Elementos del Menú)
-- =====================================================
CREATE TABLE IF NOT EXISTS menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    label VARCHAR(255) NOT NULL,
    path VARCHAR(255) NOT NULL,
    icon VARCHAR(100),
    "order" INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_menu_items_order ON menu_items("order");
CREATE INDEX IF NOT EXISTS idx_menu_items_is_active ON menu_items(is_active);

-- =====================================================
-- 8. TABLA: admin_users (Usuarios Administradores)
-- =====================================================
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    display_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'admin',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_users_username ON admin_users(username);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role);
CREATE INDEX IF NOT EXISTS idx_admin_users_is_active ON admin_users(is_active);

-- Insertar usuario admin por defecto si no existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM admin_users WHERE username = 'admin') THEN
        INSERT INTO admin_users (username, password, display_name, role, is_active)
        VALUES ('admin', '1234', 'Administrador', 'admin', true);
    END IF;
END $$;

-- =====================================================
-- 9. TABLA: settings (Configuraciones Globales)
-- =====================================================
CREATE TABLE IF NOT EXISTS settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(255) NOT NULL UNIQUE,
    value JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);
CREATE INDEX IF NOT EXISTS idx_settings_created_at ON settings(created_at);

-- Insertar configuración de offer_zone si no existe
INSERT INTO settings (key, value, description) VALUES
('offer_zone', '{
    "targetDate": "",
    "discountText": "",
    "buttonText": "Ver Todas las Ofertas Disponibles",
    "backgroundImage": "",
    "backgroundColor": "#1f2937"
}'::jsonb, 'Configuración de la zona de ofertas en la página principal')
ON CONFLICT (key) DO NOTHING;

-- Insertar configuración de footer si no existe
INSERT INTO settings (key, value, description) VALUES
('footer', '{
    "aboutUsText": "Somos especialistas en neumáticos con años de experiencia.",
    "contactAddress": "Calle Principal 123, Ciudad",
    "contactPhone": "+5491112345678",
    "contactEmail": "contacto@webgomeria.com",
    "contactHours": "Lun-Vie: 9:00 - 18:00",
    "copyrightText": "© 2024 WebGomeria. Todos los derechos reservados.",
    "socialMedia": {
        "facebook": "",
        "instagram": "",
        "twitter": "",
        "whatsapp": ""
    }
}'::jsonb, 'Configuración del pie de página')
ON CONFLICT (key) DO NOTHING;

-- Insertar configuración de heroImageUrl si no existe
INSERT INTO settings (key, value, description) VALUES
('heroImageUrl', '"https://images.unsplash.com/photo-1542282088-fe8426682b8f?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1920&h=600&fit=crop"'::jsonb, 'URL de imagen de hero en la página principal')
ON CONFLICT (key) DO NOTHING;

-- Insertar configuración de whatsappPhoneNumber si no existe
INSERT INTO settings (key, value, description) VALUES
('whatsappPhoneNumber', '"+5492245506078"'::jsonb, 'Número de teléfono de WhatsApp')
ON CONFLICT (key) DO NOTHING;

-- =====================================================
-- 10. TABLA: popups (Popups de Promoción)
-- =====================================================
CREATE TABLE IF NOT EXISTS popups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    message TEXT,
    image_url TEXT,
    button_text VARCHAR(100),
    button_link TEXT,
    is_active BOOLEAN DEFAULT true,
    auto_close_seconds INTEGER,
    show_on_page_load BOOLEAN DEFAULT true,
    show_once_per_session BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 0,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_popups_is_active ON popups(is_active);
CREATE INDEX IF NOT EXISTS idx_popups_priority ON popups(priority DESC);
CREATE INDEX IF NOT EXISTS idx_popups_dates ON popups(start_date, end_date);

-- =====================================================
-- 11. TABLA: uploads (Archivos Subidos)
-- =====================================================
CREATE TABLE IF NOT EXISTS uploads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_type VARCHAR(100),
    file_size INTEGER,
    entity_type VARCHAR(100),
    entity_id UUID,
    uploaded_by UUID REFERENCES admin_users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_uploads_file_name ON uploads(file_name);
CREATE INDEX IF NOT EXISTS idx_uploads_file_type ON uploads(file_type);
CREATE INDEX IF NOT EXISTS idx_uploads_entity_type ON uploads(entity_type);

-- =====================================================
-- 12. FUNCIONES Y TRIGGERS
-- =====================================================

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
DROP TRIGGER IF EXISTS update_brands_updated_at ON brands;
CREATE TRIGGER update_brands_updated_at 
    BEFORE UPDATE ON brands
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at 
    BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sales_updated_at ON sales;
CREATE TRIGGER update_sales_updated_at 
    BEFORE UPDATE ON sales
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_menu_items_updated_at ON menu_items;
CREATE TRIGGER update_menu_items_updated_at 
    BEFORE UPDATE ON menu_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_admin_users_updated_at ON admin_users;
CREATE TRIGGER update_admin_users_updated_at 
    BEFORE UPDATE ON admin_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_settings_updated_at ON settings;
CREATE TRIGGER update_settings_updated_at 
    BEFORE UPDATE ON settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_popups_updated_at ON popups;
CREATE TRIGGER update_popups_updated_at 
    BEFORE UPDATE ON popups
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 13. VERIFICACIÓN FINAL
-- =====================================================

-- Verificar que todas las tablas existen
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
    AND table_name IN (
        'brands', 'categories', 'products', 'sales', 'sale_products', 
        'menu_items', 'admin_users', 'settings', 'popups', 'uploads'
    )
ORDER BY table_name;

-- Verificar columnas de products
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'products'
ORDER BY ordinal_position;

-- Verificar índices de products
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'products'
ORDER BY indexname;

-- =====================================================
-- NOTA IMPORTANTE: STORAGE BUCKET
-- =====================================================
-- El bucket 'product-images' debe crearse manualmente en Supabase Dashboard:
-- 1. Ve a Storage en el panel de Supabase
-- 2. Crea un nuevo bucket llamado 'product-images'
-- 3. Configura las políticas de acceso:
--    - Política para lectura pública (si es necesario)
--    - Política para escritura con autenticación
--
-- O usa la siguiente política SQL (ejecutar en SQL Editor):
-- =====================================================

