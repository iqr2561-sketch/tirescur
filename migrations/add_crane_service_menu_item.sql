-- Script para agregar item de menu "Servicio de Grúas" al header desktop y mobile navbar

-- Agregar al header desktop
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

-- Agregar al mobile navbar
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

