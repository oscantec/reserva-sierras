/**
 * Script de prueba para ver TODOS los datos que devuelven tus sensores Tuya
 * Ejecuta esto para ver exactamente qué valores reportan
 */

import crypto from 'crypto'

// TUS CREDENCIALES
const ACCESS_ID = 'aw59ugmntjfevwdkx8py'
const ACCESS_SECRET = '43fd349daf50449d8c2b061e25118c8e'
const TUYA_API_REGION = 'https://openapi.tuyaus.com'

// TUS 3 DEVICE IDs
const DEVICES = {
    zonaCasa: 'eb04c0fcf71d11da80m8rm',
    zonaBaja: 'ebd09863004e52db0ehcrq',
    zonaAlta: 'ebc4697fd7293917feksfa'
}

// Funciones auxiliares
function generateSign(clientId, secret, t, nonce, signStr) {
    const str = clientId + t + nonce + signStr
    const hash = crypto.createHmac('sha256', secret).update(str, 'utf8').digest('hex')
    return hash.toUpperCase()
}

async function getAccessToken() {
    const t = Date.now().toString()
    const nonce = crypto.randomBytes(16).toString('hex')
    const signStr = ''
    const sign = generateSign(ACCESS_ID, ACCESS_SECRET, t, nonce, signStr)

    const response = await fetch(`${TUYA_API_REGION}/v1.0/token?grant_type=1`, {
        method: 'GET',
        headers: {
            'client_id': ACCESS_ID,
            'sign': sign,
            't': t,
            'sign_method': 'HMAC-SHA256',
            'nonce': nonce
        }
    })

    const data = await response.json()
    if (!data.success) {
        throw new Error(`Error obteniendo token: ${data.msg}`)
    }
    return data.result.access_token
}

async function getDeviceInfo(deviceId, accessToken) {
    const t = Date.now().toString()
    const nonce = crypto.randomBytes(16).toString('hex')
    const signStr = ''
    const sign = generateSign(ACCESS_ID, ACCESS_SECRET, t, nonce, signStr)

    const response = await fetch(`${TUYA_API_REGION}/v1.0/devices/${deviceId}/status`, {
        method: 'GET',
        headers: {
            'client_id': ACCESS_ID,
            'sign': sign,
            't': t,
            'access_token': accessToken,
            'sign_method': 'HMAC-SHA256',
            'nonce': nonce
        }
    })

    const data = await response.json()
    return data
}

// Ejecutar test
async function testSensors() {
    console.log('🧪 Testing Tuya Sensors...\n')
    console.log('═══════════════════════════════════════════════════\n')

    try {
        // Obtener token
        console.log('🔐 Obteniendo access token...')
        const accessToken = await getAccessToken()
        console.log('✅ Token obtenido\n')

        // Probar cada sensor
        for (const [zoneName, deviceId] of Object.entries(DEVICES)) {
            console.log(`\n📍 SENSOR: ${zoneName.toUpperCase()}`)
            console.log(`   Device ID: ${deviceId}`)
            console.log('─────────────────────────────────────────────────')

            const data = await getDeviceInfo(deviceId, accessToken)

            if (data.success) {
                console.log('\n✅ Respuesta exitosa del sensor\n')
                console.log('📊 TODOS LOS DATOS DISPONIBLES:\n')

                // Mostrar cada datapoint
                data.result.forEach((item, index) => {
                    console.log(`   ${index + 1}. ${item.code || item.dp_id}`)
                    console.log(`      ├─ code: ${item.code || 'N/A'}`)
                    console.log(`      ├─ dp_id: ${item.dp_id || 'N/A'}`)
                    console.log(`      ├─ value: ${item.value}`)
                    console.log(`      └─ type: ${typeof item.value}`)
                    console.log('')
                })

                // Identificar los datos clave
                console.log('🔍 DATOS IDENTIFICADOS:\n')

                const liquidLevelPercent = data.result.find(item =>
                    item.code === 'liquid_level_percent' || item.dp_id === 22
                )
                if (liquidLevelPercent) {
                    console.log(`   ✓ liquid_level_percent: ${liquidLevelPercent.value}%`)
                }

                const liquidDepth = data.result.find(item =>
                    item.code === 'liquid_depth' || item.code === 'distance'
                )
                if (liquidDepth) {
                    console.log(`   ✓ liquid_depth/distance: ${liquidDepth.value} cm`)
                }

                const batteryPercentage = data.result.find(item =>
                    item.code === 'battery_percentage'
                )
                if (batteryPercentage) {
                    console.log(`   ✓ battery: ${batteryPercentage.value}%`)
                }

            } else {
                console.log(`\n❌ Error: ${data.msg}`)
            }

            console.log('\n═══════════════════════════════════════════════════\n')
        }

        console.log('\n✅ Test completado!\n')
        console.log('💡 TIP: Usa los valores "code" o "dp_id" para leer los datos en tu backend\n')

    } catch (error) {
        console.error('\n❌ ERROR:', error.message)
        console.error(error)
    }
}

// Ejecutar
testSensors()
