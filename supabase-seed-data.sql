-- =====================================================
-- DATOS INICIALES (SEEDING) PARA SUPABASE
-- Sistema de Gestión de Neumáticos - WebGomeria
-- =====================================================

-- IMPORTANTE: Ejecutar este script DESPUÉS de ejecutar supabase-schema.sql
-- Este script inserta datos iniciales para desarrollo y pruebas

-- =====================================================
-- INSERTAR MARCAS (BRANDS)
-- =====================================================
INSERT INTO brands (name, logo_url) VALUES
    ('Treadsure', 'https://via.placeholder.com/100x50.png?text=Treadsure'),
    ('Michelin', 'https://via.placeholder.com/100x50.png?text=Michelin'),
    ('Pirelli', 'https://via.placeholder.com/100x50.png?text=Pirelli'),
    ('Goodyear', 'https://via.placeholder.com/100x50.png?text=Goodyear'),
    ('Bridgestone', 'https://via.placeholder.com/100x50.png?text=Bridgestone'),
    ('Continental', 'https://via.placeholder.com/100x50.png?text=Continental'),
    ('BFGoodrich', 'https://via.placeholder.com/100x50.png?text=BFGoodrich'),
    ('Hankook', 'https://via.placeholder.com/100x50.png?text=Hankook'),
    ('Dunlop', 'https://via.placeholder.com/100x50.png?text=Dunlop'),
    ('Maxxis', 'https://via.placeholder.com/100x50.png?text=Maxxis')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- INSERTAR CATEGORÍAS
-- =====================================================
INSERT INTO categories (name, icon_type, image_url, description, "order", is_active) VALUES
    ('Neumáticos de Verano', 'tire', 'https://images.unsplash.com/photo-1579308640702-86ee62f92415?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=200&h=150&fit=crop', 'Neumáticos diseñados para uso en condiciones de verano', 1, true),
    ('Neumáticos de Invierno', 'tire', 'https://images.unsplash.com/photo-1616896264878-1a5e174e9e4f?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=200&h=150&fit=crop', 'Neumáticos especializados para condiciones de invierno', 2, true),
    ('Neumáticos Todo el Año', 'tire', 'https://images.unsplash.com/photo-1596773223019-335606d396d3?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=200&h=150&fit=crop', 'Neumáticos versátiles para todas las estaciones', 3, true),
    ('Neumáticos para SUV', 'wheel', 'https://images.unsplash.com/photo-1590499092410-fc4d6a4c28f6?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=200&h=150&fit=crop', 'Neumáticos específicos para vehículos SUV', 4, true),
    ('Neumáticos de Camioneta', 'wheel', 'https://images.unsplash.com/photo-1577742188448-6c845417431e?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=200&h=150&fit=crop', 'Neumáticos para camionetas y vehículos comerciales', 5, true),
    ('Accesorios para Neumáticos', 'accessory', 'https://via.placeholder.com/400x300.png?text=Neumático+RedParts', 'Accesorios relacionados con neumáticos', 6, true),
    ('Válvulas y Sensores', 'valve', 'https://via.placeholder.com/400x300.png?text=Neumático+RedParts', 'Válvulas y sensores de presión', 7, true)
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- INSERTAR MENÚ ITEMS (MENU_ITEMS)
-- =====================================================
INSERT INTO menu_items (name, path, is_external, "order", location, "type") VALUES
    -- Header Desktop
    ('Inicio', '/', false, 1, 'header-desktop', 'route'),
    ('Tienda', '/shop', false, 2, 'header-desktop', 'route'),
    ('Ofertas', '/shop?offer=true', false, 3, 'header-desktop', 'route'),
    ('Contacto', 'https://wa.me/5491112345678', true, 4, 'header-desktop', 'external'),
    
    -- Mobile Navbar
    ('Inicio', '/', false, 1, 'mobile-navbar', 'route'),
    ('Tienda', '/shop', false, 2, 'mobile-navbar', 'route'),
    ('Ofertas', '/shop?offer=true', false, 3, 'mobile-navbar', 'route'),
    
    -- Footer Info
    ('Acerca de Nosotros', '/about', false, 10, 'footer-info', 'route'),
    ('Preguntas Frecuentes', '/faq', false, 20, 'footer-info', 'route'),
    ('Política de Privacidad', '/privacy', false, 30, 'footer-info', 'route'),
    ('Términos y Condiciones', '/terms', false, 40, 'footer-info', 'route'),
    
    -- Footer Account
    ('Mi Cuenta', '/account', false, 10, 'footer-account', 'route'),
    ('Mis Pedidos', '/orders', false, 20, 'footer-account', 'route'),
    ('Favoritos', '/favorites', false, 30, 'footer-account', 'route'),
    
    -- Admin Sidebar
    ('Dashboard', '/admin', false, 1, 'admin-sidebar', 'route'),
    ('Productos', '/admin/products', false, 10, 'admin-sidebar', 'route'),
    ('Marcas', '/admin/brands', false, 20, 'admin-sidebar', 'route'),
    ('Categorías', '/admin/categories', false, 75, 'admin-sidebar', 'route'),
    ('Precios', '/admin/prices', false, 30, 'admin-sidebar', 'route'),
    ('Ventas', '/admin/sales', false, 40, 'admin-sidebar', 'route'),
    ('Configuración', '/admin/settings', false, 50, 'admin-sidebar', 'route'),
    ('Menús', '/admin/menus', false, 60, 'admin-sidebar', 'route')
ON CONFLICT DO NOTHING;

-- =====================================================
-- INSERTAR PRODUCTOS DE EJEMPLO
-- =====================================================
-- Nota: Los productos se insertan con referencia a las marcas y categorías creadas
-- Ajusta los UUIDs según los IDs generados en tu base de datos

-- Ejemplo de inserción de productos (ajusta brand_id y category_id según tus IDs)
INSERT INTO products (
    sku, name, brand_name, brand_id, brand_logo_url, price, rating, reviews,
    image_url, description, tags, stock, width, profile, diameter,
    is_on_sale, sale_price, discount_percentage, category_id
)
SELECT 
    'TNR-205-55-R16',
    'Neumático de Verano Ultraligero',
    b.name,
    b.id,
    b.logo_url,
    120.00,
    4.5,
    25,
    'https://via.placeholder.com/400x300.png?text=Neumático+RedParts',
    'Neumático de alto rendimiento para condiciones de verano',
    ARRAY['verano', 'deportivo', 'alto rendimiento'],
    50,
    '205',
    '55',
    'R16',
    false,
    NULL,
    NULL,
    c.id
FROM brands b, categories c
WHERE b.name = 'Treadsure' AND c.name = 'Neumáticos de Verano'
LIMIT 1
ON CONFLICT (sku) DO NOTHING;

-- Puedes agregar más productos siguiendo el mismo patrón o usando un script de migración

-- =====================================================
-- ACTUALIZAR CONFIGURACIÓN INICIAL
-- =====================================================
-- Actualizar app_settings si existe registro inicial
UPDATE app_settings
SET 
    hero_image_url = 'https://images.unsplash.com/photo-1542282088-fe8426682b8f?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1920&h=600&fit=crop',
    whatsapp_phone_number = '+5491112345678',
    footer_content = '{
        "aboutUsText": "Somos especialistas en neumáticos con años de experiencia en el mercado.",
        "contactAddress": "Calle Principal 123, Ciudad, País",
        "contactPhone": "+5491112345678",
        "contactEmail": "contacto@webgomeria.com",
        "contactHours": "Lunes a Viernes: 9:00 - 18:00 | Sábados: 9:00 - 13:00",
        "copyrightText": "© 2024 WebGomeria. Todos los derechos reservados."
    }'::jsonb,
    deal_zone_config = '{
        "targetDate": "",
        "discountText": "hasta el 70%",
        "buttonText": "Ver Todas las Ofertas Disponibles"
    }'::jsonb
WHERE id = (SELECT id FROM app_settings LIMIT 1);

-- =====================================================
-- FIN DEL SCRIPT DE SEEDING
-- =====================================================

