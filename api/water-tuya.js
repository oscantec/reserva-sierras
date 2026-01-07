import crypto from 'crypto'

/**
 * API endpoint para conectarse a sensores Tuya ultrasónicos
 * Extrae el valor de liquid_level_percent de los dispositivos configurados
 * DP ID: 22 - Porcentaje de nivel (0-100%)
 */

const TUYA_API_REGION = 'https://openapi.tuyaus.com' // Región USA

// Función para generar firma de autenticación Tuya v1.0
function generateSign(clientId, secret, t, nonce, accessToken = '', method = 'GET', url = '', body = '') {
    // StringToSign según documentación oficial Tuya
    // Para requests sin token: clientId + t + nonce
    // Para requests con token: clientId + accessToken + t + nonce + stringToSign

    let stringToSign = ''

    if (url) {
        // Extraer path de la URL (sin host ni query params para el stringToSign)
        const urlParts = url.split('?')
        const path = urlParts[0].replace(TUYA_API_REGION, '')

        // Para GET/DELETE: method\ncontent-sha256\n\npath
        // Para POST/PUT: method\ncontent-sha256\n\npath
        const contentHash = crypto.createHash('sha256').update(body, 'utf8').digest('hex')
        stringToSign = `${method}\n${contentHash}\n\n${path}`
    }

    // Construir string completo para firma
    const str = clientId + (accessToken || '') + t + nonce + stringToSign
    const hash = crypto.createHmac('sha256', secret).update(str, 'utf8').digest('hex')
    return hash.toUpperCase()
}

// Función para obtener access token
async function getAccessToken(clientId, clientSecret) {
    const t = Date.now().toString()
    const nonce = crypto.randomBytes(16).toString('hex')
    const url = `${TUYA_API_REGION}/v1.0/token?grant_type=1`
    const sign = generateSign(clientId, clientSecret, t, nonce, '', 'GET', url, '')

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'client_id': clientId,
            'sign': sign,
            't': t,
            'sign_method': 'HMAC-SHA256',
            'nonce': nonce
        }
    })

    if (!response.ok) {
        throw new Error(`Error obteniendo token: ${response.statusText}`)
    }

    const data = await response.json()
    if (!data.success) {
        throw new Error(`Tuya API error: ${data.msg}`)
    }

    return data.result.access_token
}

// Función para obtener estado del dispositivo
async function getDeviceStatus(deviceId, accessToken, clientId, clientSecret) {
    const t = Date.now().toString()
    const nonce = crypto.randomBytes(16).toString('hex')
    const url = `${TUYA_API_REGION}/v1.0/devices/${deviceId}/status`
    const sign = generateSign(clientId, clientSecret, t, nonce, accessToken, 'GET', url, '')

    const response = await fetch(url, {
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

    if (!response.ok) {
        throw new Error(`Error obteniendo estado del dispositivo: ${response.statusText}`)
    }

    const data = await response.json()
    if (!data.success) {
        throw new Error(`Tuya API error: ${data.msg}`)
    }

    // Buscar el valor de liquid_level_percent (DP ID: 22)
    // Intentar por código primero, luego por dp_id como fallback
    let liquidLevelPercent = data.result.find(item => item.code === 'liquid_level_percent')
    if (!liquidLevelPercent) {
        liquidLevelPercent = data.result.find(item => item.dp_id === 22)
    }
    return liquidLevelPercent ? liquidLevelPercent.value : null
}

export default async function handler(req, res) {
    // Solo aceptar GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
        // Obtener credenciales de la configuración (enviadas como query params o desde env)
        const { clientId, clientSecret, deviceIds } = req.query

        if (!clientId || !clientSecret || !deviceIds) {
            return res.status(400).json({
                error: 'Faltan parámetros requeridos: clientId, clientSecret, deviceIds'
            })
        }

        // Parsear deviceIds (puede ser un string separado por comas para múltiples sensores)
        const deviceIdArray = deviceIds.split(',')

        // Obtener access token
        const accessToken = await getAccessToken(clientId, clientSecret)

        // Obtener datos de cada sensor
        const sensorsData = await Promise.all(
            deviceIdArray.map(async (deviceId) => {
                try {
                    const liquidLevelPercent = await getDeviceStatus(deviceId.trim(), accessToken, clientId, clientSecret)
                    return {
                        deviceId: deviceId.trim(),
                        liquidLevelPercent,
                        timestamp: new Date().toISOString(),
                        success: true
                    }
                } catch (error) {
                    return {
                        deviceId: deviceId.trim(),
                        liquidLevelPercent: null,
                        timestamp: new Date().toISOString(),
                        success: false,
                        error: error.message
                    }
                }
            })
        )

        return res.status(200).json({
            success: true,
            timestamp: new Date().toISOString(),
            sensors: sensorsData
        })

    } catch (error) {
        console.error('Error en API Tuya:', error)
        return res.status(500).json({
            success: false,
            error: error.message
        })
    }
}
