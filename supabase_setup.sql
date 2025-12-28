-- Create the site_config table for persistent configuration storage
CREATE TABLE IF NOT EXISTS site_config (
    id BIGINT PRIMARY KEY,
    config_data JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all actions for now (you can tighten this later if needed)
-- Since we use the service role or anon key with proper API logic, we'll allow public access
-- to this specific row for management.
CREATE POLICY "Allow public access to config" ON site_config
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Insert initial empty config if it doesn't exist
INSERT INTO site_config (id, config_data)
VALUES (1, '{}')
ON CONFLICT (id) DO NOTHING;
