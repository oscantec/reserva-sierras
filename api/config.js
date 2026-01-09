import { createClient } from '@supabase/supabase-js'

// Vercel uses process.env without VITE_ prefix, development uses VITE_ prefix
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')

/**
 * Hace merge profundo de dos objetos.
 * Solo actualiza los campos que se envían, sin borrar los existentes.
 * Los valores null/undefined NO sobrescriben valores existentes.
 */
function deepMerge(target, source) {
    if (!target) return source
    if (!source) return target

    const result = { ...target }

    for (const key in source) {
        const sourceValue = source[key]
        const targetValue = result[key]

        // Ignorar valores null/undefined para no borrar datos existentes
        if (sourceValue === null || sourceValue === undefined) {
            continue
        }

        // Si es un objeto (no array), hacer merge recursivo
        if (typeof sourceValue === 'object' && !Array.isArray(sourceValue) && sourceValue !== null) {
            if (typeof targetValue === 'object' && !Array.isArray(targetValue) && targetValue !== null) {
                result[key] = deepMerge(targetValue, sourceValue)
            } else {
                result[key] = sourceValue
            }
        } else {
            // Para valores primitivos y arrays, reemplazar directamente
            result[key] = sourceValue
        }
    }

    return result
}

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
            const newConfig = req.body

            // 1. PRIMERO: Obtener la configuración actual de Supabase
            const { data: currentData, error: fetchError } = await supabase
                .from('site_config')
                .select('config_data')
                .eq('id', 1)
                .single()

            if (fetchError && fetchError.code !== 'PGRST116') {
                console.error('Error fetching current config:', fetchError)
                throw fetchError
            }

            const currentConfig = currentData?.config_data || {}

            console.log('📥 Config actual:', Object.keys(currentConfig).length, 'campos')
            console.log('📤 Config nueva:', Object.keys(newConfig).length, 'campos')

            // 2. MERGE: Combinar config actual con nuevos valores
            // Esto preserva campos existentes que no se están actualizando
            const mergedConfig = deepMerge(currentConfig, newConfig)

            console.log('🔀 Config merged:', Object.keys(mergedConfig).length, 'campos')

            // 3. Guardar el resultado del merge
            const { error: saveError } = await supabase
                .from('site_config')
                .upsert({ id: 1, config_data: mergedConfig, updated_at: new Date() })

            if (saveError) throw saveError

            console.log('✅ Config guardada exitosamente con merge')
            return res.status(200).json({ success: true })
        } catch (error) {
            console.error('Error saving config:', error)
            return res.status(500).json({ error: 'Failed to save config' })
        }
    }

    res.status(405).json({ error: 'Method not allowed' })
}

