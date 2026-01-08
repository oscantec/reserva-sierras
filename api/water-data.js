import { createClient } from '@supabase/supabase-js'

// Vercel uses process.env without VITE_ prefix, development uses VITE_ prefix
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')

/**
 * API endpoint para guardar y obtener datos históricos de agua
 * GET: Obtiene histórico de mediciones
 * POST: Guarda nueva medición
 */

export default async function handler(req, res) {
    if (req.method === 'GET') {
        // Obtener histórico de mediciones
        try {
            const { zone, days = 7 } = req.query

            const startDate = new Date()
            startDate.setDate(startDate.getDate() - parseInt(days))

            let query = supabase
                .from('water_measurements')
                .select('*')
                .gte('timestamp', startDate.toISOString())
                .order('timestamp', { ascending: true })

            if (zone) {
                query = query.eq('zone', zone)
            }

            const { data, error } = await query

            if (error) throw error

            return res.status(200).json({
                success: true,
                data,
                count: data.length
            })

        } catch (error) {
            console.error('Error obteniendo datos:', error)
            return res.status(500).json({
                success: false,
                error: error.message
            })
        }

    } else if (req.method === 'POST') {
        // Guardar nueva medición
        try {
            const { zone, level_cm, volume_m3, percentage, tank_count } = req.body

            if (!zone || level_cm === undefined || volume_m3 === undefined || percentage === undefined) {
                return res.status(400).json({
                    error: 'Faltan parámetros requeridos: zone, level_cm, volume_m3, percentage'
                })
            }

            const { data, error } = await supabase
                .from('water_measurements')
                .insert([{
                    timestamp: new Date().toISOString(),
                    zone,
                    level_cm,
                    volume_m3,
                    percentage,
                    tank_count: tank_count || 1
                }])
                .select()

            if (error) throw error

            return res.status(200).json({
                success: true,
                data: data[0]
            })

        } catch (error) {
            console.error('Error guardando datos:', error)
            return res.status(500).json({
                success: false,
                error: error.message
            })
        }

    } else {
        return res.status(405).json({ error: 'Method not allowed' })
    }
}
