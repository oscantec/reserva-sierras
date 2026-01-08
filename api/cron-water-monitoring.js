import { TuyaContext } from '@tuya/tuya-connector-nodejs'
import { createClient } from '@supabase/supabase-js'

// Vercel uses process.env without VITE_ prefix, development uses VITE_ prefix
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')

const TUYA_API_REGION = 'https://openapi.tuyaus.com'

// Configuración de Tanques (IMPORTANTE: Mantener sincronizado con AdminWaterStats.jsx)
// Configuración de Tanques (IMPORTANTE: Mantener sincronizado con AdminWaterStats.jsx)
const TANK_CONFIGS = {
    zonaBaja: {
        name: 'Tanque Abajo',
        type: 'conic',
        tankCount: 3,
        height: 155,       // REAL: 155 cm
        topRadius: 70.25,  // REAL: 70.25 cm
        bottomRadius: 57.25 // REAL: 57.25 cm
    },
    zonaAlta: {
        name: 'Tanque Arriba',
        type: 'conic',
        tankCount: 2,
        height: 155,       // REAL: 155 cm
        topRadius: 70.25,  // REAL: 70.25 cm
        bottomRadius: 57.25 // REAL: 57.25 cm
    },
    zonaCasa: {
        name: 'Tanque Casa',
        type: 'cubic',
        tankCount: 1,
        height: 140,    // REAL: 140 cm
        length: 280,    // REAL: 280 cm
        width: 240      // REAL: 240 cm
    }
}

// Función para obtener datos de sensores usando SDK oficial de Tuya
async function getSensorDataWithSDK(clientId, clientSecret, deviceId) {
    const api = new TuyaContext({
        baseUrl: TUYA_API_REGION,
        accessKey: clientId,
        secretKey: clientSecret
    })

    const statusResponse = await api.request({
        method: 'GET',
        path: `/v1.0/devices/${deviceId}/status`
    })

    if (!statusResponse.success) {
        throw new Error(`Tuya API error: ${statusResponse.msg || 'Unknown error'}`)
    }

    // Buscar porcentaje
    const percentItem = statusResponse.result.find(item => item.code === 'liquid_level_percent')
    if (percentItem) return parseFloat(percentItem.value)

    return 0
}

// Funciones de cálculo
function calculateMaxConicVolume(height, topRadius, bottomRadius) {
    const volume = (Math.PI * height / 3) * (
        Math.pow(topRadius, 2) + topRadius * bottomRadius + Math.pow(bottomRadius, 2)
    )
    return volume / 1000000
}

function calculateMaxCubicVolume(height, length, width) {
    return (height * length * width) / 1000000
}

/**
 * Cron Job que se ejecuta automáticamente
 */
export default async function handler(req, res) {
    // TEMPORALMENTE DESACTIVADO para diagnosticar
    // TODO: Reactivar verificación de secret después
    /*
    const providedSecret = req.query.secret
    const expectedSecret = process.env.CRON_SECRET

    console.log('🔐 Verificando autorización:', {
        provided: providedSecret ? `${providedSecret.substring(0, 10)}...` : 'MISSING',
        expected: expectedSecret ? `${expectedSecret.substring(0, 10)}...` : 'NOT_SET',
        match: providedSecret === expectedSecret
    })

    if (!expectedSecret) {
        return res.status(500).json({
            error: 'CRON_SECRET not configured in Vercel environment variables',
            hint: 'Go to Vercel → Settings → Environment Variables and add CRON_SECRET'
        })
    }

    if (providedSecret !== expectedSecret) {
        return res.status(401).json({
            error: 'Unauthorized',
            hint: 'Secret does not match. Check CRON_SECRET value in Vercel.'
        })
    }
    */

    try {
        // 1. Obtener configuración desde Supabase
        const { data: siteConfig } = await supabase
            .from('site_config')
            .select('config_data')  // <-- Corrected column name
            .eq('id', 1)
            .single()

        if (!siteConfig || !siteConfig.config_data) {
            return res.status(400).json({ error: 'No configuration found in DB' })
        }

        const config = siteConfig.config_data

        // 2. Extraer credenciales Tuya usando la estructura plana
        const clientId = config.tuyaAccessId
        const clientSecret = config.tuyaAccessSecret

        if (!clientId || !clientSecret) {
            return res.status(400).json({ error: 'Tuya credentials missing in config' })
        }

        // 3. Definir zonas a consultar
        // Priorizar configuración guardada en DB (siteConfig.tankConfigs) sobre la hardcoded
        const savedTanks = config.tankConfigs || {}

        const zonesToProcess = [
            {
                key: 'zonaBaja',
                deviceId: config.tuyaDeviceIdAbajo,
                config: savedTanks.zonaBaja || TANK_CONFIGS.zonaBaja
            },
            {
                key: 'zonaAlta',
                deviceId: config.tuyaDeviceIdArriba,
                config: savedTanks.zonaAlta || TANK_CONFIGS.zonaAlta
            },
            {
                key: 'zonaCasa',
                deviceId: config.tuyaDeviceIdCasa,
                config: savedTanks.zonaCasa || TANK_CONFIGS.zonaCasa
            }
        ]

        const measurements = []

        // 4. Procesar cada zona usando SDK oficial
        for (const zone of zonesToProcess) {
            try {
                if (!zone.deviceId) continue;

                // Usar SDK oficial de Tuya (maneja firma correctamente)
                const percentage = await getSensorDataWithSDK(clientId, clientSecret, zone.deviceId)

                if (percentage !== null) {
                    // Calcular volúmenes
                    let maxVolumePerTank
                    if (zone.config.type === 'conic') {
                        maxVolumePerTank = calculateMaxConicVolume(
                            zone.config.height,
                            zone.config.topRadius,
                            zone.config.bottomRadius
                        )
                    } else {
                        maxVolumePerTank = calculateMaxCubicVolume(
                            zone.config.height,
                            zone.config.length,
                            zone.config.width
                        )
                    }

                    const totalMaxVolume = maxVolumePerTank * zone.config.tankCount
                    const currentVolume = (totalMaxVolume * percentage) / 100
                    const level_cm = (zone.config.height * percentage) / 100 // Aproximado

                    // Redondear timestamp al intervalo de 5 minutos cerrado
                    const now = new Date()
                    const roundedMinutes = Math.floor(now.getMinutes() / 5) * 5
                    now.setMinutes(roundedMinutes)
                    now.setSeconds(0)
                    now.setMilliseconds(0)
                    const roundedTimestamp = now.toISOString()

                    measurements.push({
                        zone: zone.key,
                        level_cm: parseFloat(level_cm.toFixed(2)),
                        volume_m3: parseFloat(currentVolume.toFixed(3)),
                        percentage: parseFloat(percentage.toFixed(2)), // CORREGIDO: era level_percent
                        tank_count: zone.config.tankCount,
                        timestamp: roundedTimestamp
                    })
                }
            } catch (error) {
                console.error(`Error processing zone ${zone.key}:`, error)
            }
        }

        // 6. Guardar mediciones en Supabase
        if (measurements.length > 0) {
            // Eliminar tuya_percent si no existe en la tabla (opcional, pero level_percent es el estandar)
            const { error } = await supabase
                .from('water_measurements')
                .insert(measurements)

            if (error) throw error

            console.log(`✅ Saved ${measurements.length} measurements automatically`)
        }

        return res.status(200).json({
            success: true,
            timestamp: new Date().toISOString(),
            measurementsSaved: measurements.length,
            measurements
        })

    } catch (error) {
        console.error('Error in water monitoring cron:', error)
        return res.status(500).json({
            success: false,
            error: error.message
        })
    }
}
