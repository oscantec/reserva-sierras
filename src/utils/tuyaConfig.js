// Función auxiliar para obtener credenciales Tuya desde config global
export async function getTuyaCredentials() {
    try {
        const response = await fetch('/api/config')
        const config = await response.json()

        return {
            clientId: config.tuyaAccessId || '',
            clientSecret: config.tuyaAccessSecret || '',
            deviceIdAbajo: config.tuyaDeviceIdAbajo || '',
            deviceIdArriba: config.tuyaDeviceIdArriba || '',
            deviceIdCasa: config.tuyaDeviceIdCasa || ''
        }
    } catch (error) {
        console.error('Error loading Tuya credentials:', error)
        return null
    }
}
