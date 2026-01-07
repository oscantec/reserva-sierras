import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
)

const TUYA_API_REGION = 'https://openapi.tuyaus.com'

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
    if (!data.success) throw new Error(`Tuya API error: ${data.msg}`)
    return data.result.access_token
}

async function getDeviceStatus(deviceId, accessToken, clientId, clientSecret) {
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
    if (!data.success) throw new Error(`Tuya API error: ${data.msg}`)

    const liquidDepth = data.result.find(item => item.code === 'liquid_depth')
    return liquidDepth ? liquidDepth.value : null
}

// Funciones de cálculo de volumen
function calculateConicTankVolume(depth, totalHeight, topRadius, bottomRadius) {
    if (depth === 0) return 0
    const waterHeight = totalHeight - depth
    if (waterHeight <= 0) return 0

    const radiusAtWaterLevel = bottomRadius + (topRadius - bottomRadius) * (waterHeight / totalHeight)
    const volume = (Math.PI * waterHeight / 3) * (
        Math.pow(radiusAtWaterLevel, 2) +
        radiusAtWaterLevel * bottomRadius +
        Math.pow(bottomRadius, 2)
    )
    return volume / 1000000
}

function calculateCubicTankVolume(depth, totalHeight, length, width) {
    if (depth === 0) return 0
    const waterHeight = totalHeight - depth
    if (waterHeight <= 0) return 0
    return (length * width * waterHeight) / 1000000
}

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
 * Consulta sensores Tuya y guarda mediciones en Supabase
 */
export default async function handler(req, res) {
    // Verificar secret para seguridad
    if (req.query.secret !== process.env.CRON_SECRET) {
        return res.status(401).json({ error: 'Unauthorized' })
    }

    try {
        // Obtener configuración desde Supabase o variable de entorno
        const { data: configData } = await supabase
            .from('site_config')
            .select('config')
            .eq('id', 1)
            .single()

        if (!configData || !configData.config) {
            return res.status(400).json({ error: 'No water monitoring config found' })
        }

        const waterConfig = configData.config.waterMonitoringConfig || {}
        const { tuyaConfig, tankConfigs } = waterConfig

        if (!tuyaConfig || !tankConfigs) {
            return res.status(400).json({ error: 'Incomplete water monitoring config' })
        }

        const { clientId, clientSecret, zonaBaja, zonaAlta, zonaCasa } = tuyaConfig

        // Obtener access token de Tuya
        const accessToken = await getAccessToken(clientId, clientSecret)

        // Procesar cada zona
        const zones = [
            { key: 'zonaBaja', deviceId: zonaBaja.deviceId, config: tankConfigs.zonaBaja },
            { key: 'zonaAlta', deviceId: zonaAlta.deviceId, config: tankConfigs.zonaAlta },
            { key: 'zonaCasa', deviceId: zonaCasa.deviceId, config: tankConfigs.zonaCasa }
        ]

        const measurements = []

        for (const zone of zones) {
            try {
                const liquidDepth = await getDeviceStatus(zone.deviceId, accessToken, clientId, clientSecret)

                if (liquidDepth !== null) {
                    let volumePerTank, maxVolumePerTank

                    if (zone.config.type === 'conic') {
                        volumePerTank = calculateConicTankVolume(
                            liquidDepth,
                            zone.config.height,
                            zone.config.topRadius,
                            zone.config.bottomRadius
                        )
                        maxVolumePerTank = calculateMaxConicVolume(
                            zone.config.height,
                            zone.config.topRadius,
                            zone.config.bottomRadius
                        )
                    } else {
                        volumePerTank = calculateCubicTankVolume(
                            liquidDepth,
                            zone.config.height,
                            zone.config.length,
                            zone.config.width
                        )
                        maxVolumePerTank = calculateMaxCubicVolume(
                            zone.config.height,
                            zone.config.length,
                            zone.config.width
                        )
                    }

                    const totalVolume = volumePerTank * zone.config.tankCount
                    const totalMaxVolume = maxVolumePerTank * zone.config.tankCount
                    const percentage = (totalVolume / totalMaxVolume) * 100
                    const level_cm = zone.config.height - liquidDepth

                    measurements.push({
                        zone: zone.key,
                        level_cm: parseFloat(level_cm.toFixed(2)),
                        volume_m3: parseFloat(totalVolume.toFixed(3)),
                        percentage: parseFloat(percentage.toFixed(2)),
                        tank_count: zone.config.tankCount
                    })
                }
            } catch (error) {
                console.error(`Error processing zone ${zone.key}:`, error)
            }
        }

        // Guardar mediciones en Supabase
        if (measurements.length > 0) {
            const { error } = await supabase
                .from('water_measurements')
                .insert(measurements)

            if (error) throw error
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
