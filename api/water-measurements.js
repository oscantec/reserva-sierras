import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
)

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
            const { zone, volume_m3, level_percent, tuya_percent, level_cm } = req.body

            if (!zone || volume_m3 === undefined) {
                return res.status(400).json({
                    success: false,
                    error: 'Faltan parámetros requeridos'
                })
            }

            const { data, error } = await supabase
                .from('water_measurements')
                .insert([{
                    zone,
                    volume_m3,
                    level_percent,
                    tuya_percent,
                    level_cm,
                    timestamp: new Date().toISOString()
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
