// Google Sheets API using Server-side Middleware (Vite Plugin)
// This avoids browser CORS and Authenticaiton issues by running the fetch in Node.js

const API_ENDPOINT = '/api/backend-sheets'

export async function fetchSheetData(sheetName) {
    const config = JSON.parse(localStorage.getItem('casacampestre_config') || '{}')

    if (!config.googleSheetsId) {
        console.warn('Google Sheets ID not configured')
        return null
    }

    try {
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                sheetId: config.googleSheetsId,
                sheetName: sheetName,
                email: config.googleServiceAccountEmail,
                privateKey: config.googlePrivateKey
            })
        })

        if (!response.ok) {
            throw new Error(`Server Error: ${response.status} ${response.statusText}`)
        }

        const result = await response.json()

        if (!result.success) {
            throw new Error(result.error || 'Unknown server error')
        }

        return result.data
    } catch (error) {
        console.error('Error fetching sheet data via server:', error)
        throw error // Re-throw to show error in UI
    }
}

export async function fetchReservasData() {
    const config = JSON.parse(localStorage.getItem('casacampestre_config') || '{}')
    const sheetName = config.sheetNameReservas || '1. BD'
    return await fetchSheetData(sheetName)
}

export async function fetchHuespedesData() {
    const config = JSON.parse(localStorage.getItem('casacampestre_config') || '{}')
    const sheetName = config.sheetNameHuespedes || '2. BH'
    return await fetchSheetData(sheetName)
}

// Append a new row to the Huespedes sheet (2. BH)
export async function appendHuespedData(data) {
    const config = JSON.parse(localStorage.getItem('casacampestre_config') || '{}')

    if (!config.googleSheetsId) {
        console.warn('Google Sheets ID not configured')
        return null
    }

    const sheetName = config.sheetNameHuespedes || '2. BH'

    try {
        const response = await fetch('/api/backend-sheets-append', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                sheetId: config.googleSheetsId,
                sheetName: sheetName,
                email: config.googleServiceAccountEmail,
                privateKey: config.googlePrivateKey,
                rowData: [
                    data.noReserva || '',
                    data.plataforma || '',
                    data.nombre || '',
                    data.tipoHuesped || '',
                    data.telefono || '',
                    data.checkIn || '',
                    data.checkOut || '',
                    data.nacionalidad || '',
                    data.edad || '',
                    data.documento || '',
                    data.fechaRegistro || ''
                ]
            })
        })

        if (!response.ok) {
            throw new Error(`Server Error: ${response.status} ${response.statusText}`)
        }

        const result = await response.json()

        if (!result.success) {
            throw new Error(result.error || 'Unknown server error')
        }

        return result.data
    } catch (error) {
        console.error('Error appending huesped data:', error)
        throw error
    }
}
