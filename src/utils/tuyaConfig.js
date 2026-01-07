// Función auxiliar para obtener credenciales Tuya desde config global
export async function getTuyaCredentials() {
    try {
        const response = await fetch('/api/config')
        const config = await response.json()

        // Detectar si viene en estructura nueva (anidada) o antigua (plana)
        const tuyaData = config.tuyaConfig || {}

        return {
            clientId: tuyaData.clientId || config.tuyaAccessId || '',
            clientSecret: tuyaData.clientSecret || config.tuyaAccessSecret || '',
            deviceIdAbajo: tuyaData.zonaBaja?.deviceId || config.tuyaDeviceIdAbajo || '',
            deviceIdArriba: tuyaData.zonaAlta?.deviceId || config.tuyaDeviceIdArriba || '',
            deviceIdCasa: tuyaData.zonaCasa?.deviceId || config.tuyaDeviceIdCasa || ''
        }
    } catch (error) {
        console.error('Error loading Tuya credentials:', error)
        return null
    }
}
