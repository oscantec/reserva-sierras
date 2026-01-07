-- Tabla para almacenar mediciones de agua de los tanques
-- Ejecuta este script en el Editor SQL de Supabase

CREATE TABLE IF NOT EXISTS water_measurements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    zone TEXT NOT NULL, -- 'zonaBaja', 'zonaAlta', 'zonaCasa'
    level_cm DECIMAL(10,2) NOT NULL, -- Nivel de agua en centímetros
    volume_m3 DECIMAL(10,3) NOT NULL, -- Volumen total en metros cúbicos
    percentage DECIMAL(5,2) NOT NULL, -- Porcentaje de llenado
    tank_count INTEGER NOT NULL DEFAULT 1, -- Número de tanques en la zona
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para mejorar rendimiento de consultas
CREATE INDEX IF NOT EXISTS idx_water_measurements_timestamp ON water_measurements(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_water_measurements_zone ON water_measurements(zone);
CREATE INDEX IF NOT EXISTS idx_water_measurements_zone_timestamp ON water_measurements(zone, timestamp DESC);

-- Habilitar Row Level Security (RLS)
ALTER TABLE water_measurements ENABLE ROW LEVEL SECURITY;

-- Política para permitir lectura pública (solo admin puede escribir)
CREATE POLICY "Permitir lectura pública de mediciones"
    ON water_measurements
    FOR SELECT
    USING (true);

-- Política para permitir inserción sin autenticación (temporal, cámbialo si implementas auth)
CREATE POLICY "Permitir inserción de mediciones"
    ON water_measurements
    FOR INSERT
    WITH CHECK (true);

-- Comentarios para documentación
COMMENT ON TABLE water_measurements IS 'Almacena las mediciones históricas de los sensores de agua Tuya';
COMMENT ON COLUMN water_measurements.zone IS 'Identificador de la zona: zonaBaja, zonaAlta, zonaCasa';
COMMENT ON COLUMN water_measurements.level_cm IS 'Altura del agua medida desde el fondo del tanque en centímetros';
COMMENT ON COLUMN water_measurements.volume_m3 IS 'Volumen total de agua en metros cúbicos';
COMMENT ON COLUMN water_measurements.percentage IS 'Porcentaje de llenado del tanque (0-100)';
COMMENT ON COLUMN water_measurements.tank_count IS 'Número de tanques idénticos en la zona';
