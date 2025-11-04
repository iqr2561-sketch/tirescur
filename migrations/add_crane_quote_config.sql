-- Script para crear tabla de configuracion de cotizacion de grua

-- Crear tabla para configuracion de cotizacion de grua
CREATE TABLE IF NOT EXISTS crane_quote_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  price_per_kilometer DECIMAL(10, 2) NOT NULL DEFAULT 2000,
  price_per_passenger DECIMAL(10, 2) NOT NULL DEFAULT 3000,
  price_per_trailer DECIMAL(10, 2) NOT NULL DEFAULT 600,
  whatsapp_number VARCHAR(20) NOT NULL DEFAULT '+5492245506078',
  vehicle_types JSONB NOT NULL DEFAULT '[]'::jsonb,
  additional_options JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Crear indice unico para asegurar una sola configuracion
CREATE UNIQUE INDEX IF NOT EXISTS idx_crane_quote_config_single ON crane_quote_config((1));

-- Insertar configuracion inicial si no existe
INSERT INTO crane_quote_config (
  price_per_kilometer,
  price_per_passenger,
  price_per_trailer,
  whatsapp_number,
  vehicle_types,
  additional_options
) VALUES (
  2000,
  3000,
  600,
  '+5492245506078',
  '[
    {"id": "1", "name": "Utilitario", "basePrice": 5000},
    {"id": "2", "name": "Auto", "basePrice": 200}
  ]'::jsonb,
  '[]'::jsonb
)
ON CONFLICT DO NOTHING;

-- Crear trigger para actualizar updated_at automaticamente
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

-- Verificar que la tabla existe
SELECT 
    id,
    price_per_kilometer,
    price_per_passenger,
    price_per_trailer,
    whatsapp_number,
    vehicle_types,
    additional_options,
    created_at,
    updated_at
FROM crane_quote_config
LIMIT 1;
