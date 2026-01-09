import { createClient } from '@supabase/supabase-js'

// Vercel uses process.env without VITE_ prefix, development uses VITE_ prefix
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')

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

        // CRÍTICO: El cron job espera credenciales en formato PLANO (legacy)
        // Extraer credenciales de Tuya del formato anidado y agregarlas al nivel raíz
        const flatConfig = {
            ...configData,
            // Formato plano para compatibilidad con cron-water-monitoring.js
            tuyaAccessId: configData.tuyaConfig?.clientId || '',
            tuyaAccessSecret: configData.tuyaConfig?.clientSecret || '',
            tuyaDeviceIdAbajo: configData.tuyaConfig?.zonaBaja?.deviceId || '',
            tuyaDeviceIdArriba: configData.tuyaConfig?.zonaAlta?.deviceId || '',
            tuyaDeviceIdCasa: configData.tuyaConfig?.zonaCasa?.deviceId || ''
        }

        console.log('💾 Guardando configuración con credenciales Tuya:', {
            tuyaAccessId: flatConfig.tuyaAccessId ? '✅ Presente' : '❌ Faltante',
            tuyaAccessSecret: flatConfig.tuyaAccessSecret ? '✅ Presente' : '❌ Faltante',
            deviceIds: {
                abajo: flatConfig.tuyaDeviceIdAbajo || 'N/A',
                arriba: flatConfig.tuyaDeviceIdArriba || 'N/A',
                casa: flatConfig.tuyaDeviceIdCasa || 'N/A'
            }
        })

        // Guardar en tabla site_config con AMBOS formatos (anidado y plano)
        const { data, error } = await supabase
            .from('site_config')
            .upsert({
                id: 1,
                config_data: flatConfig,
                updated_at: new Date().toISOString()
            })
            .select()

        if (error) throw error

        console.log('✅ Configuración guardada exitosamente')
        return res.status(200).json({ success: true, data })

    } catch (error) {
        console.error('❌ Error saving config:', error)
        return res.status(500).json({ error: error.message })
    }
}
