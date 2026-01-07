import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
)

/**
 * 🔒 API Endpoint seguro para guardar la configuración de agua
 * Guarda tanto en la tabla site_config (para el cron) como valida los datos
 */
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
        const configData = req.body

        // Simple validación
        if (!configData || !configData.tankConfigs) {
            return res.status(400).json({ error: 'Invalid config data' })
        }

        // 1. Extraer datos clave para la estructura plana de site_config (legacy support)
        // Aunque guardaremos todo el objeto JSON en una columna JSONB si es posible,
        // mantenemos compatibilidad con campos específicos si existen.

        // 2. Guardar en tabla site_config
        // Asumimos que existe y tiene una columna 'config_data' tipo JSONB
        const { data, error } = await supabase
            .from('site_config')
            .upsert({
                id: 1,
                config_data: configData,
                updated_at: new Date().toISOString()
            })
            .select()

        if (error) throw error

        return res.status(200).json({ success: true, data })

    } catch (error) {
        console.error('Error saving config:', error)
        return res.status(500).json({ error: error.message })
    }
}
