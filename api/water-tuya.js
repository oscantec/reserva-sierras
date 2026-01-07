import { TuyaContext } from '@tuya/tuya-connector-nodejs'

/**
 * API endpoint para conectarse a sensores Tuya ultrasónicos
 * Usa el SDK OFICIAL de Tuya para autenticación
 * Extrae el valor de liquid_level_percent de los dispositivos configurados
 */

export default async function handler(req, res) {
    // Configuración CORS
    res.setHeader('Access-Control-Allow-Credentials', true)
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version')

    if (req.method === 'OPTIONS') {
        res.status(200).end()
        return
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, error: 'Método no permitido' })
    }

    try {
        const { clientId, clientSecret, deviceIds } = req.query

        if (!clientId || !clientSecret || !deviceIds) {
            return res.status(400).json({
                success: false,
                error: 'Faltan parámetros: clientId, clientSecret, deviceIds'
            })
        }

        // Inicializar SDK de Tuya
        const api = new TuyaContext({
            baseUrl: 'https://openapi.tuyaus.com',
            accessKey: clientId,
            secretKey: clientSecret
        })

        // Procesar múltiples dispositivos
        const deviceIdArray = deviceIds.split(',').map(id => id.trim()).filter(Boolean)
        const sensors = []

        console.log(`🔍 Consultando ${deviceIdArray.length} sensores Tuya...`)

        for (const deviceId of deviceIdArray) {
            try {
                // Obtener estado del dispositivo usando SDK oficial
                const statusResponse = await api.request({
                    method: 'GET',
                    path: `/v1.0/devices/${deviceId}/status`
                })

                if (statusResponse.success && statusResponse.result) {
                    // Buscar liquid_level_percent en el resultado
                    const percentData = statusResponse.result.find(item => item.code === 'liquid_level_percent')
                    const depthData = statusResponse.result.find(item => item.code === 'liquid_depth')
                    const depthMaxData = statusResponse.result.find(item => item.code === 'liquid_depth_max')

                    sensors.push({
                        success: true,
                        deviceId,
                        liquidLevelPercent: percentData ? percentData.value : null,
                        liquidDepth: depthData ? depthData.value : null,
                        liquidDepthMax: depthMaxData ? depthMaxData.value : null,
                        rawData: statusResponse.result
                    })

                    console.log(`✅ Sensor ${deviceId}: ${percentData?.value}%`)
                } else {
                    sensors.push({
                        success: false,
                        deviceId,
                        error: 'No se pudo obtener el estado',
                        liquidLevelPercent: null
                    })
                    console.log(`❌ Sensor ${deviceId}: Error obteniendo estado`)
                }
            } catch (deviceError) {
                sensors.push({
                    success: false,
                    deviceId,
                    error: deviceError.message,
                    liquidLevelPercent: null
                })
                console.error(`❌ Error con sensor ${deviceId}:`, deviceError.message)
            }
        }

        return res.status(200).json({
            success: true,
            timestamp: new Date().toISOString(),
            sensors
        })

    } catch (error) {
        console.error('❌ Error en water-tuya API:', error)
        return res.status(500).json({
            success: false,
            error: `Tuya API error: ${error.message}`
        })
    }
}
