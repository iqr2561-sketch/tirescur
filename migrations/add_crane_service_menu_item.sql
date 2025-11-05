-- Script para agregar items de menu relacionados con servicio de grua

-- Agregar "Cotización de Grúa" al admin sidebar
INSERT INTO menu_items (name, path, is_external, "order", location, "type")
VALUES (
    'Cotización de Grúa',
    '/admin/crane-quote',
    false,
    65, -- Orden después de "Menús"
    'admin-sidebar',
    'route'
)
ON CONFLICT DO NOTHING;

-- Agregar "Servicio de Grúas" al header desktop
INSERT INTO menu_items (name, path, is_external, "order", location, "type")
VALUES (
    'Servicio de Grúas',
    '#soporte', -- Se puede cambiar por una ruta específica si se desea
    false,
    5, -- Orden después de "Contacto"
    'header-desktop',
    'route'
)
ON CONFLICT DO NOTHING;

-- Agregar "Servicio de Grúas" al mobile navbar
INSERT INTO menu_items (name, path, is_external, "order", location, "type")
VALUES (
    'Servicio de Grúas',
    '#soporte', -- Se puede cambiar por una ruta específica si se desea
    false,
    4, -- Orden después de "Ofertas"
    'mobile-navbar',
    'route'
)
ON CONFLICT DO NOTHING;

