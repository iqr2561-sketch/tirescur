-- Script para crear tablas de configuracion de cotizacion de grua

-- Crear tabla para configuracion principal de cotizacion de grua
CREATE TABLE IF NOT EXISTS crane_quote_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  price_per_kilometer DECIMAL(10, 2) NOT NULL DEFAULT 2000,
  price_per_passenger DECIMAL(10, 2) NOT NULL DEFAULT 3000,
  price_per_trailer DECIMAL(10, 2) NOT NULL DEFAULT 600,
  whatsapp_number VARCHAR(20) NOT NULL DEFAULT '+5492245506078',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Crear indice unico para asegurar una sola configuracion
CREATE UNIQUE INDEX IF NOT EXISTS idx_crane_quote_config_single ON crane_quote_config((1));

-- Crear tabla para tipos de vehiculos
CREATE TABLE IF NOT EXISTS crane_vehicle_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  base_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Crear tabla para opciones adicionales
CREATE TABLE IF NOT EXISTS crane_additional_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insertar configuracion inicial si no existe
INSERT INTO crane_quote_config (
  price_per_kilometer,
  price_per_passenger,
  price_per_trailer,
  whatsapp_number
) VALUES (
  2000,
  3000,
  600,
  '+5492245506078'
)
ON CONFLICT DO NOTHING;

-- Insertar tipos de vehiculos por defecto si no existen
INSERT INTO crane_vehicle_types (name, base_price)
SELECT 'Utilitario', 5000.00
WHERE NOT EXISTS (SELECT 1 FROM crane_vehicle_types WHERE name = 'Utilitario');

INSERT INTO crane_vehicle_types (name, base_price)
SELECT 'Auto', 200.00
WHERE NOT EXISTS (SELECT 1 FROM crane_vehicle_types WHERE name = 'Auto');

-- Crear triggers para actualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_crane_quote_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_crane_quote_config_updated_at ON crane_quote_config;
CREATE TRIGGER trigger_update_crane_quote_config_updated_at
  BEFORE UPDATE ON crane_quote_config
  FOR EACH ROW
  EXECUTE FUNCTION update_crane_quote_config_updated_at();

DROP TRIGGER IF EXISTS trigger_update_crane_vehicle_types_updated_at ON crane_vehicle_types;
CREATE TRIGGER trigger_update_crane_vehicle_types_updated_at
  BEFORE UPDATE ON crane_vehicle_types
  FOR EACH ROW
  EXECUTE FUNCTION update_crane_quote_config_updated_at();

DROP TRIGGER IF EXISTS trigger_update_crane_additional_options_updated_at ON crane_additional_options;
CREATE TRIGGER trigger_update_crane_additional_options_updated_at
  BEFORE UPDATE ON crane_additional_options
  FOR EACH ROW
  EXECUTE FUNCTION update_crane_quote_config_updated_at();

-- Verificar que las tablas existen
SELECT 
    id,
    price_per_kilometer,
    price_per_passenger,
    price_per_trailer,
    whatsapp_number,
    created_at,
    updated_at
FROM crane_quote_config
LIMIT 1;
