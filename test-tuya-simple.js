import crypto from 'crypto'

/**
 * Test simplificado con algoritmo exacto de documentación Tuya
 */

const CLIENT_ID = 'aw59ugmntjfevwdkx8py'
const CLIENT_SECRET = '43fd349daf50449d8c2b061e25118c8e'
const API_REGION = 'https://openapi.tuyaus.com'

// Algoritmo según ejemplo oficial de Tuya
function getSign(clientId, secret, t, nonce, signStr = '') {
    const str = clientId + t + nonce + signStr
    return crypto.createHmac('sha256', secret).update(str, 'utf8').digest('hex').toUpperCase()
}

async function testToken() {
    console.log('🧪 Test de autenticación Tuya...\n')

    const t = Date.now().toString()
    const nonce = crypto.randomBytes(16).toString('hex')

    console.log('📊 Datos de firma:')
    console.log('  clientId:', CLIENT_ID)
    console.log('  t:', t)
    console.log('  nonce:', nonce)
    console.log('  signStr:', '(vacío)')

    const sign = getSign(CLIENT_ID, CLIENT_SECRET, t, nonce, '')
    console.log('  sign generada:', sign)

    console.log('\n🌐 Haciendo request...\n')

    const response = await fetch(`${API_REGION}/v1.0/token?grant_type=1`, {
        method: 'GET',
        headers: {
            'client_id': CLIENT_ID,
            'sign': sign,
            't': t,
            'sign_method': 'HMAC-SHA256',
            'nonce': nonce
        }
    })

    const data = await response.json()

    console.log('📥 Respuesta:', JSON.stringify(data, null, 2))

    if (data.success) {
        console.log('\n✅ ¡TOKEN OBTENIDO!')
        console.log('Token:', data.result.access_token.substring(0, 20) + '...')
    } else {
        console.log('\n❌ ERROR:', data.msg || 'sin mensaje')
    }
}

testToken().catch(console.error)
