import { createClient } from '@supabase/supabase-js'

// Vercel uses process.env without VITE_ prefix, development uses VITE_ prefix
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')

export default async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Credentials', true)
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

    if (req.method === 'OPTIONS') {
        return res.status(200).end()
    }

    if (req.method === 'POST') {
        // Guardar nueva medición
        try {
            const { zone, volume_m3, percentage, tuya_percent, level_cm, timestamp: requestTimestamp } = req.body

            if (!zone || volume_m3 === undefined) {
                return res.status(400).json({
                    success: false,
                    error: 'Faltan parámetros requeridos'
                })
            }

            // Redondear timestamp al intervalo de 5 minutos cerrado más cercano (hacia abajo)
            // Ejemplo: 2:07:32 -> 2:05:00, 2:13:45 -> 2:10:00
            const now = requestTimestamp ? new Date(requestTimestamp) : new Date()
            const minutes = now.getMinutes()
            const roundedMinutes = Math.floor(minutes / 5) * 5
            now.setMinutes(roundedMinutes)
            now.setSeconds(0)
            now.setMilliseconds(0)
            const roundedTimestamp = now.toISOString()

            const { data, error } = await supabase
                .from('water_measurements')
                .insert([{
                    zone,
                    volume_m3,
                    percentage, // Porcentaje de Tuya directo
                    level_cm,
                    timestamp: roundedTimestamp
                }])

            if (error) throw error

            return res.status(200).json({
                success: true,
                data
            })

        } catch (error) {
            console.error('Error saving measurement:', error)
            return res.status(500).json({
                success: false,
                error: error.message
            })
        }
    }

    if (req.method === 'GET') {
        // Obtener mediciones históricas
        try {
            const { days = 7 } = req.query
            const since = new Date()
            since.setDate(since.getDate() - parseInt(days))

            const { data, error } = await supabase
                .from('water_measurements')
                .select('*')
                .gte('timestamp', since.toISOString())
                .order('timestamp', { ascending: true })

            if (error) throw error

            return res.status(200).json({
                success: true,
                measurements: data || []
            })

        } catch (error) {
            console.error('Error fetching measurements:', error)
            return res.status(500).json({
                success: false,
                error: error.message
            })
        }
    }

    return res.status(405).json({ success: false, error: 'Método no permitido' })
}
