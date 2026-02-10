const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase URL or Key in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function syncConfig() {
    try {
        // Read the correct config file (which we reverted to the good version)
        const configPath = path.join(__dirname, '../src/utils/config_data.json');
        const configData = JSON.parse(fs.readFileSync(configPath, 'utf8'));

        console.log('📖 Read config_data.json successfully.');

        // Update Supabase
        const { error } = await supabase
            .from('site_config')
            .upsert({
                id: 1,
                config_data: configData,
                updated_at: new Date()
            });

        if (error) {
            throw error;
        }

        console.log('✅ Supabase site_config updated successfully with local data!');
    } catch (err) {
        console.error('❌ Error syncing config:', err);
        process.exit(1);
    }
}

syncConfig();
