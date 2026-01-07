import { TuyaContext } from '@tuya/tuya-connector-nodejs'

/**
 * Test usando el SDK OFICIAL de Tuya
 */

const CLIENT_ID = 'aw59ugmntjfevwdkx8py'
const CLIENT_SECRET = '43fd349daf50449d8c2b061e25118c8e'
const GATEWAY_ID = 'ebd09863004e52db0ehcrq' // Tanque Abajo (gateway principal)
const SUB_DEVICE_1 = 'eb04c0fcf71d11da80m8rm' // Tanque Casa
const SUB_DEVICE_2 = 'ebc4697fd7293917feksfa' // Tanque Arriba

async function testWithSDK() {
    console.log('🧪 Test con SDK Oficial de Tuya\n')

    try {
        // Configurar contexto Tuya
        const api = new TuyaContext({
            baseUrl: 'https://openapi.tuyaus.com',
            accessKey: CLIENT_ID,
            secretKey: CLIENT_SECRET
        })

        console.log('✅ SDK inicializado')
        console.log('🔐 Intentando obtener token...\n')

        // Test 1: Obtener información del gateway
        console.log('📡 Test 1: Información del Gateway Principal')
        const gatewayInfo = await api.request({
            method: 'GET',
            path: `/v1.0/devices/${GATEWAY_ID}`
        })

        console.log('Gateway Info:', JSON.stringify(gatewayInfo, null, 2))

        // Test 2: Obtener estado del gateway
        console.log('\n📊 Test 2: Estado del Gateway')
        const gatewayStatus = await api.request({
            method: 'GET',
            path: `/v1.0/devices/${GATEWAY_ID}/status`
        })

        console.log('Gateway Status:', JSON.stringify(gatewayStatus, null, 2))

        // Test 3: Obtener sub-dispositivos
        console.log('\n🔗 Test 3: Sub-Dispositivos del Gateway')
        const subDevices = await api.request({
            method: 'GET',
            path: `/v1.0/devices/${GATEWAY_ID}/sub-devices`
        })

        console.log('Sub-Devices:', JSON.stringify(subDevices, null, 2))

        // Test 4: Estado de sub-dispositivo específico
        console.log('\n💧 Test 4: Estado del Tanque Casa (sub-device)')
        const tankCasaStatus = await api.request({
            method: 'GET',
            path: `/v1.0/devices/${SUB_DEVICE_1}/status`
        })

        console.log('Tanque Casa Status:', JSON.stringify(tankCasaStatus, null, 2))

    } catch (error) {
        console.error('\n❌ ERROR:', error.message)
        console.error('Detalles:', error)
    }
}

testWithSDK()
