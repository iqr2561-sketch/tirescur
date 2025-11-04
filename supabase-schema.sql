-- =====================================================
-- SCHEMA SQL PARA SUPABASE (PostgreSQL)
-- Sistema de Gestión de Neumáticos - WebGomeria
-- =====================================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLA: brands (Marcas)
-- =====================================================
CREATE TABLE IF NOT EXISTS brands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para brands
CREATE INDEX IF NOT EXISTS idx_brands_name ON brands(name);

-- =====================================================
-- TABLA: categories (Categorías)
-- =====================================================
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    icon_type VARCHAR(50) DEFAULT 'tire', -- 'tire', 'wheel', 'accessory', 'valve'
    image_url TEXT,
    description TEXT,
    "order" INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para categories
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);
CREATE INDEX IF NOT EXISTS idx_categories_order ON categories("order");
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON categories(is_active);

-- =====================================================
-- TABLA: products (Productos)
-- =====================================================
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sku VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    brand_name VARCHAR(255) NOT NULL, -- Se mantiene para compatibilidad
    brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
    brand_logo_url TEXT,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    rating DECIMAL(3, 2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    reviews INTEGER DEFAULT 0 CHECK (reviews >= 0),
    image_url TEXT,
    description TEXT,
    tags TEXT[], -- Array de tags
    stock INTEGER DEFAULT 0 CHECK (stock >= 0),
    width VARCHAR(50),
    profile VARCHAR(50),
    diameter VARCHAR(50),
    -- Campos de ofertas
    is_on_sale BOOLEAN DEFAULT false,
    sale_price DECIMAL(10, 2) CHECK (sale_price >= 0),
    discount_percentage INTEGER CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true, -- Producto activo y visible para clientes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Constraint para validar sale_price
    CONSTRAINT check_sale_price CHECK (
        (is_on_sale = false) OR 
        (is_on_sale = true AND sale_price IS NOT NULL AND sale_price < price)
    )
);

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

-- Índice compuesto para búsquedas frecuentes
CREATE INDEX IF NOT EXISTS idx_products_search ON products(name, brand_name, sku) USING GIN (to_tsvector('spanish', name || ' ' || COALESCE(brand_name, '') || ' ' || COALESCE(sku, '')));

-- =====================================================
-- TABLA: sales (Ventas)
-- =====================================================
CREATE TABLE IF NOT EXISTS sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_name VARCHAR(255) NOT NULL,
    total DECIMAL(10, 2) NOT NULL CHECK (total >= 0),
    status VARCHAR(50) NOT NULL DEFAULT 'Pendiente' CHECK (status IN ('Pendiente', 'Completado', 'Cancelado')),
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para sales
CREATE INDEX IF NOT EXISTS idx_sales_status ON sales(status);
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(date DESC);
CREATE INDEX IF NOT EXISTS idx_sales_customer_name ON sales(customer_name);

-- =====================================================
-- TABLA: sale_products (Productos de Venta - Relación Many-to-Many)
-- =====================================================
CREATE TABLE IF NOT EXISTS sale_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    product_name VARCHAR(255) NOT NULL, -- Se mantiene por si el producto se elimina
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0), -- Precio al momento de la venta
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para sale_products
CREATE INDEX IF NOT EXISTS idx_sale_products_sale_id ON sale_products(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_products_product_id ON sale_products(product_id);

-- =====================================================
-- TABLA: menu_items (Elementos de Menú)
-- =====================================================
CREATE TABLE IF NOT EXISTS menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    path VARCHAR(500) NOT NULL,
    is_external BOOLEAN DEFAULT false,
    "order" INTEGER DEFAULT 0,
    location VARCHAR(100) NOT NULL CHECK (location IN ('header-desktop', 'mobile-navbar', 'footer-info', 'footer-account', 'admin-sidebar')),
    "type" VARCHAR(50) CHECK ("type" IN ('route', 'external', 'action')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para menu_items
CREATE INDEX IF NOT EXISTS idx_menu_items_location ON menu_items(location);
CREATE INDEX IF NOT EXISTS idx_menu_items_order ON menu_items("order");

-- =====================================================
-- TABLA: app_settings (Configuración Global - Singleton)
-- =====================================================
CREATE TABLE IF NOT EXISTS app_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Hero Image
    hero_image_url TEXT,
    -- WhatsApp
    whatsapp_phone_number VARCHAR(50),
    -- Footer Content (JSON)
    footer_content JSONB DEFAULT '{
        "aboutUsText": "",
        "contactAddress": "",
        "contactPhone": "",
        "contactEmail": "",
        "contactHours": "",
        "copyrightText": ""
    }'::jsonb,
    -- Deal Zone Config (JSON)
    deal_zone_config JSONB DEFAULT '{
        "targetDate": "",
        "discountText": "",
        "buttonText": ""
    }'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar registro inicial de settings si no existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM app_settings LIMIT 1) THEN
        INSERT INTO app_settings (id) VALUES (uuid_generate_v4());
    END IF;
END $$;

-- =====================================================
-- TABLA: admin_users (Usuarios Administrativos)
-- =====================================================
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, -- En producción, debería ser un hash
    display_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'admin' CHECK (role IN ('admin', 'editor', 'viewer')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para admin_users
CREATE INDEX IF NOT EXISTS idx_admin_users_username ON admin_users(username);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role);
CREATE INDEX IF NOT EXISTS idx_admin_users_is_active ON admin_users(is_active);

-- Insertar usuario admin inicial si no existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM admin_users WHERE username = 'admin') THEN
        INSERT INTO admin_users (username, password, display_name, role, is_active)
        VALUES ('admin', '1234', 'Administrador', 'admin', true);
    END IF;
END $$;

-- =====================================================
-- FUNCIONES Y TRIGGERS
-- =====================================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at en todas las tablas
CREATE TRIGGER update_brands_updated_at BEFORE UPDATE ON brands
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sales_updated_at BEFORE UPDATE ON sales
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON menu_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_app_settings_updated_at BEFORE UPDATE ON app_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- VISTAS ÚTILES
-- =====================================================

-- Vista de productos con información completa de marca y categoría
CREATE OR REPLACE VIEW products_full AS
SELECT 
    p.id,
    p.sku,
    p.name,
    p.brand_name,
    p.brand_id,
    b.name AS brand_name_from_table,
    b.logo_url AS brand_logo_url_from_table,
    COALESCE(p.brand_logo_url, b.logo_url) AS brand_logo_url,
    p.price,
    p.rating,
    p.reviews,
    p.image_url,
    p.description,
    p.tags,
    p.stock,
    p.width,
    p.profile,
    p.diameter,
    p.is_on_sale,
    p.sale_price,
    p.discount_percentage,
    p.category_id,
    c.name AS category_name,
    c.icon_type AS category_icon_type,
    c.image_url AS category_image_url,
    p.created_at,
    p.updated_at
FROM products p
LEFT JOIN brands b ON p.brand_id = b.id
LEFT JOIN categories c ON p.category_id = c.id;

-- Vista de ventas con información completa
CREATE OR REPLACE VIEW sales_full AS
SELECT 
    s.id,
    s.customer_name,
    s.total,
    s.status,
    s.date,
    s.created_at,
    s.updated_at,
    COUNT(sp.id) AS product_count,
    SUM(sp.quantity) AS total_items
FROM sales s
LEFT JOIN sale_products sp ON s.id = sp.sale_id
GROUP BY s.id, s.customer_name, s.total, s.status, s.date, s.created_at, s.updated_at;

-- =====================================================
-- DATOS INICIALES (Seeding)
-- =====================================================

-- Insertar configuración inicial si no existe
INSERT INTO app_settings (id, hero_image_url, whatsapp_phone_number, footer_content, deal_zone_config)
VALUES (
    uuid_generate_v4(),
    'https://images.unsplash.com/photo-1542282088-fe8426682b8f?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1920&h=600&fit=crop',
    '+5491112345678',
    '{
        "aboutUsText": "Somos especialistas en neumáticos con años de experiencia.",
        "contactAddress": "Calle Principal 123, Ciudad",
        "contactPhone": "+5491112345678",
        "contactEmail": "contacto@webgomeria.com",
        "contactHours": "Lun-Vie: 9:00 - 18:00",
        "copyrightText": "© 2024 WebGomeria. Todos los derechos reservados."
    }'::jsonb,
    '{
        "targetDate": "",
        "discountText": "hasta el 70%",
        "buttonText": "Ver Todas las Ofertas Disponibles"
    }'::jsonb
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- COMENTARIOS EN TABLAS Y COLUMNAS
-- =====================================================

COMMENT ON TABLE brands IS 'Tabla de marcas de neumáticos';
COMMENT ON TABLE categories IS 'Tabla de categorías de productos';
COMMENT ON TABLE products IS 'Tabla principal de productos (neumáticos)';
COMMENT ON TABLE sales IS 'Tabla de ventas realizadas';
COMMENT ON TABLE sale_products IS 'Tabla de relación entre ventas y productos';
COMMENT ON TABLE menu_items IS 'Tabla de elementos del menú de navegación';
COMMENT ON TABLE app_settings IS 'Tabla de configuración global de la aplicación (singleton)';

COMMENT ON COLUMN products.brand_name IS 'Nombre de la marca (se mantiene para compatibilidad)';
COMMENT ON COLUMN products.brand_id IS 'ID de la marca en tabla brands';
COMMENT ON COLUMN products.is_on_sale IS 'Indica si el producto está en oferta';
COMMENT ON COLUMN products.sale_price IS 'Precio de oferta (debe ser menor que price)';
COMMENT ON COLUMN products.discount_percentage IS 'Porcentaje de descuento (0-100)';
COMMENT ON COLUMN categories.icon_type IS 'Tipo de icono: tire, wheel, accessory, valve';
COMMENT ON COLUMN sale_products.price IS 'Precio del producto al momento de la venta';

-- =====================================================
-- POLÍTICAS RLS (Row Level Security) - Opcional para Supabase
-- =====================================================

-- Nota: Estas políticas son para Supabase. Si usas PostgreSQL estándar, puedes omitirlas.
-- Descomentar si necesitas RLS en Supabase

/*
-- Habilitar RLS en todas las tablas
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Política: Permitir lectura pública (ajustar según necesidades)
CREATE POLICY "Public read access" ON brands FOR SELECT USING (true);
CREATE POLICY "Public read access" ON categories FOR SELECT USING (true);
CREATE POLICY "Public read access" ON products FOR SELECT USING (true);
CREATE POLICY "Public read access" ON menu_items FOR SELECT USING (true);

-- Política: Solo administradores pueden modificar (ajustar según tu sistema de autenticación)
CREATE POLICY "Admin write access" ON brands FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin write access" ON categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin write access" ON products FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin write access" ON sales FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin write access" ON menu_items FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin write access" ON app_settings FOR ALL USING (auth.role() = 'authenticated');
*/

-- =====================================================
-- FIN DEL SCHEMA
-- =====================================================

