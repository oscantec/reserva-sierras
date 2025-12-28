-- Tighten security for site_config
-- Only authenticated users should be able to update the configuration

-- 1. Remove the public access policy
DROP POLICY IF EXISTS "Allow public access to config" ON site_config;

-- 2. Create policy to allow public READ access (so the website can load the colors/info)
CREATE POLICY "Allow public read access to config" ON site_config
    FOR SELECT
    USING (true);

-- 3. Create policy to allow ONLY authenticated users to UPDATE/INSERT/DELETE
CREATE POLICY "Allow authenticated full access to config" ON site_config
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
