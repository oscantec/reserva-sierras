import { createClient } from '@supabase/supabase-js'

// Vercel uses process.env without VITE_ prefix, development uses VITE_ prefix
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')

export default async function handler(req, res) {
    // Basic CORS
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

    if (req.method === 'OPTIONS') {
        return res.status(200).end()
    }

    if (req.method === 'GET') {
        try {
            // Get the first row from site_config table
            const { data, error } = await supabase
                .from('site_config')
                .select('config_data')
                .eq('id', 1)
                .single()

            if (error) {
                if (error.code === 'PGRST116') {
                    // Item not found, return empty object
                    return res.status(200).json({})
                }
                throw error
            }

            return res.status(200).json(data.config_data || {})
        } catch (error) {
            console.error('Error fetching config:', error)
            return res.status(500).json({ error: 'Failed to fetch config' })
        }
    }

    if (req.method === 'POST') {
        try {
            const config = req.body

            // Upsert the config in site_config table with id 1
            const { error } = await supabase
                .from('site_config')
                .upsert({ id: 1, config_data: config, updated_at: new Date() })

            if (error) throw error

            return res.status(200).json({ success: true })
        } catch (error) {
            console.error('Error saving config:', error)
            return res.status(500).json({ error: 'Failed to save config' })
        }
    }

    res.status(405).json({ error: 'Method not allowed' })
}
