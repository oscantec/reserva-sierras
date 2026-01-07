import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
)

const TUYA_API_REGION = 'https://openapi.tuyaus.com'

// Configuración de Tanques (IMPORTANTE: Mantener sincronizado con AdminWaterStats.jsx)
const TANK_CONFIGS = {
    zonaBaja: {
        name: 'Tanque Abajo',
        type: 'conic',
        tankCount: 3,
        height: 160,       // ~1.6m altura
        topRadius: 80,     // ~1.6m diámetro
        bottomRadius: 70   // ~1.4m diámetro base
    },
    zonaAlta: {
        name: 'Tanque Arriba',
        type: 'conic',
        tankCount: 2,
        height: 160,
        topRadius: 80,
        bottomRadius: 70
    },
    zonaCasa: {
        name: 'Tanque Casa',
        type: 'cubic',
        tankCount: 1,
        height: 200,    // 2m alto
        length: 220,    // 2.2m largo
        width: 215      // 2.15m ancho
    }
}

// Funciones auxiliares de Tuya
function generateSign(clientId, secret, t, nonce, signStr) {
    const str = clientId + t + nonce + signStr
    const hash = crypto.createHmac('sha256', secret).update(str, 'utf8').digest('hex')
    return hash.toUpperCase()
}

async function getAccessToken(clientId, clientSecret) {
    const t = Date.now().toString()
    const nonce = crypto.randomBytes(16).toString('hex')
    const signStr = ''
    const sign = generateSign(clientId, clientSecret, t, nonce, signStr)

    const response = await fetch(`${TUYA_API_REGION}/v1.0/token?grant_type=1`, {
        method: 'GET',
        headers: {
            'client_id': clientId,
            'sign': sign,
            't': t,
            'sign_method': 'HMAC-SHA256',
            'nonce': nonce
        }
    })

    const data = await response.json()
    if (!data.success) throw new Error(`Tuya API error (Token): ${data.msg}`)
    return data.result.access_token
}

async function getDeviceStatusPercent(deviceId, accessToken, clientId, clientSecret) {
    const t = Date.now().toString()
    const nonce = crypto.randomBytes(16).toString('hex')
    const signStr = ''
    const sign = generateSign(clientId, clientSecret, t, nonce, signStr)

    const response = await fetch(`${TUYA_API_REGION}/v1.0/devices/${deviceId}/status`, {
        method: 'GET',
        headers: {
            'client_id': clientId,
            'sign': sign,
            't': t,
            'access_token': accessToken,
            'sign_method': 'HMAC-SHA256',
            'nonce': nonce
        }
    })

    const data = await response.json()
    if (!data.success) throw new Error(`Tuya API error (Device Status): ${data.msg}`)

    // Buscar porcentaje primero, luego nivel
    const percentItem = data.result.find(item => item.code === 'liquid_level_percent')
    if (percentItem) return parseFloat(percentItem.value)

    // Si no hay porcentaje, intentar convertir depth (menos confiable pero fallback)
    const depthItem = data.result.find(item => item.code === 'liquid_depth')
    if (depthItem) {
        return null
    }

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
 * Cron Job que se ejecuta cada 30 minutos
 */
export default async function handler(req, res) {
    // Verificar secret para seguridad
    if (req.query.secret !== process.env.CRON_SECRET) {
        return res.status(401).json({ error: 'Unauthorized' })
    }

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

        // 3. Obtener access token
        const accessToken = await getAccessToken(clientId, clientSecret)

        // 4. Definir zonas a consultar
        // 4. Definir zonas a consultar
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

        // 5. Procesar cada zona
        for (const zone of zonesToProcess) {
            try {
                if (!zone.deviceId) continue;

                const percentage = await getDeviceStatusPercent(zone.deviceId, accessToken, clientId, clientSecret)

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

                    measurements.push({
                        zone: zone.key,
                        level_cm: parseFloat(level_cm.toFixed(2)),
                        volume_m3: parseFloat(currentVolume.toFixed(3)),
                        level_percent: parseFloat(percentage.toFixed(2)),
                        tuya_percent: parseFloat(percentage.toFixed(2)),
                        tank_count: zone.config.tankCount,
                        timestamp: new Date().toISOString() // Explicit timestamp
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
