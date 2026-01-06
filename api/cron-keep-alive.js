/**
 * Vercel CRON Job - Keeps Supabase Free Tier Active
 * 
 * This endpoint prevents the Supabase free tier project from being paused
 * due to inactivity. It runs automatically every 5 days via Vercel Cron Jobs.
 * 
 * Setup Instructions:
 * 1. This file is already configured to run automatically
 * 2. Vercel Cron is configured in vercel.json
 * 3. No additional setup needed - just deploy!
 * 
 * How it works:
 * - Executes a lightweight query to Supabase (SELECT from site_config)
 * - Runs every 5 days (120 hours) via Vercel Cron
 * - Prevents the 7-day inactivity pause
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')

export default async function handler(req, res) {
    // Verify this is being called by Vercel Cron
    const authHeader = req.headers.authorization
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return res.status(401).json({ error: 'Unauthorized' })
    }

    try {
        // Execute a simple query to keep the database active
        const { data, error } = await supabase
            .from('site_config')
            .select('id')
            .limit(1)

        if (error) {
            console.error('Keep-alive query failed:', error)
            return res.status(500).json({
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            })
        }

        console.log('✅ Supabase keep-alive ping successful')
        return res.status(200).json({
            success: true,
            message: 'Supabase project is active',
            timestamp: new Date().toISOString(),
            dataExists: !!data
        })
    } catch (error) {
        console.error('Keep-alive error:', error)
        return res.status(500).json({
            success: false,
            error: 'Failed to ping Supabase',
            timestamp: new Date().toISOString()
        })
    }
}
