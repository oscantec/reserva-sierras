// Default configuration for the entire application
// This ensures the correct content is ALWAYS available for new visitors

export const DEFAULT_CONFIG = {
    // Hero Video Settings
    heroVideoUrl: 'https://www.youtube.com/watch?v=yzjFNEuWwFI',
    heroFilterColor: '#22c55e',
    heroFilterOpacity: 4,
    heroBlurAmount: 2,
    heroRotatingPhrases: [
        'Somos Reserva de las Sierras',
        'Somos Tranquilidad',
        'Somos Aire Puro',
        'Somos Espacio Verde'
    ],
    // Check-in/out times
    checkInTime: '3:00 PM',
    checkOutTime: '1:00 PM',
    // iCal URLs
    airbnbUrl: 'https://www.airbnb.com.co/calendar/ical/1164759440955486077.ics?s=556ea5347565316f2bf679394086236b',
    bookingUrl: 'https://ical.booking.com/v1/export?t=1f8d5ee8-e773-4d57-a0a7-cb23c241ea8c',
    googleCalendarUrl: 'https://calendar.google.com/calendar/ical/b529ad8b58ec0ce1bd3c82399f798123c7e8d383bd73754ae640df211d9b16e7%40group.calendar.google.com/public/basic.ics',
    // Google Sheets Credentials
    sessionSecret: 'n+uFNISXYwdqITVZBkJa1lqzpw1w1LA84JpuP40ZHjV6q62fEX82+GTOQh111RzgMQEFN6WCj0wOuTHAp1YPQw==',
    googleSheetsId: '1zUe1X-4OofPnDw8i74Llc3f6t1VlZrfmOppYT1-ntB8',
    googlePrivateKey: `-----BEGIN PRIVATE KEY-----
MIIEuwIBADANBgkqhkiG9w0BAQEFAASCBKUwggShAgEAAoIBAQCf0a5oijHm9f+t
tHyLQtdMLJ+r+Zx4Xn8WZbRSwbSKWUsF2/j2Wm1Dq62IazSD5WmqT0QkRO0uBqP8
ii+JBKPZnhBZ4V+kQ9iUIqrwGx9CznW+xzZnoQk87eD9PeM8hHD4v4oM76TK5Iyc
NrmM0ObqSWXCplx+jdm0CQVQHeC8qCkO2FDdZfkxgrwl8LtOO4/XLNk0FprE3cwe
nk+99oP4XeULGJF3zHqmc3gV3lErOUsd2RzQaUhQ76iNBpijfVoDODZCXd4ZrbPR
otPGrS/e1s88nwaT5p9/mUHC1sC+rkUt5PvIXgGWcxk24YwLIqVpvFfli/NWTDHK
XtWV8nB3AgMBAAECgf99SzKKKQDDKrJhldFBXHJtxcFoXsiZlXvZxnvlMiqlGMJr
iLwmAIt1m6Ijneh0S+bX6xmaiNVpJmU2fewszCmoi8LfgOqT9wMhH6ZJ/V/RgD41
n8Ug358RpWykUC1WKuUzUcNo+neEMqmjaBCpbrbNKb23KU8nG3SrMGdGtPKVWgGv
7avJfPYp60B3MHbE/3l+vcAr7zm8x+8TDdj24wU4t9Z45+U0A6YXNLyKbrkBQc1v
0aZNjS1jMXbVe6FLcbydXRf1aRfUjr7y2qKDsf1Qs2DbKP5RaYu5WSOY9L4dh3nr
F9MTWGdV+U2KAphaOqVntXjRMogSCBrslgMeDxUCgYEA35lxkLJVGYa0wylWu7ae
asg8i6l5Qi9WF0ZJAswguQtsTZHg3XgO1t+aGC3EkePxQJg+FQcK6W2zeYzBeNEG
ylhDssIbjp/ttOgYa1KYWw4cXXo1w0bjHFSz2fwmy5QDYSLIFun/ntfxSztF3ucy
CM5fkMlJa/CHurRwRL/jekMCgYEAtvpEffK9Q5pgAGeRCDDasmWHA0n2w8PS3z/s
Cnc2Xr/eQWMYXcLisQk8EQTW9Kz3rESGo6EPcLIJepsPV7gXnwbLDFZqjSjQ/aD2
d4uDSaQY15oux7qz1mnqTK0u0oI0iCTq90a++GN2Zyh9h6/2eyTsLWAHqiIVXYD1
6uJ3z70CgYA/R1qXW5Cv16qCbMmJ+CWfDKnt0HlrnJ/dmFuDOieslqoAzd74bkis
0Lz4SMOPkhWtdShkpQiWhSA8rvP18Bne29nU1hAcbfBEuUZn4QkTA8xNPA/JAt+1
HdeEQlLsXCgUrlY3/eMEnhJAezbL3VwQl+79t6larciLsxLuset7pwKBgQC2lX0L
ANGDR+RMAwxh0/4mzdCvo3qtVhZx12M9/j8uxN6O+MczqGh0p/ZcNSwZ8w8hwy9m
0CyME9wJj/j7WyOW+DxdD047lWMV8yx9laVoMmrnmV7cxpz1c7Ls2FNEk9C/mbct
EFc3nGhl/61jXF7j+rABhzWeu2v+ZdT+kQVlMQKBgGAfTHKhFAkQuYbEldRjm+Kk
htiZWQSYziMhYgmJDCy1tNeFZ27sth/CDjM4vzqfOMJH7BoJ2mYxAIlsRnDew8U/
n9qtNfQkpDzzWsL38zX9XjYTdxaxb3QPwKp1F1henB39iDPt92R5ynsPUkiGzcnq
YfU9ug2VqA7hLh83iLYP
-----END PRIVATE KEY-----`,
    googleServiceAccountEmail: 'datosreserva@reserva-rs-api.iam.gserviceaccount.com',
    // Sheet Names
    sheetNameReservas: '1. BD',
    sheetNameHuespedes: '2. BH',
    // Host info
    hostName: 'Nuestra Administradora',
    // WhatsApp
    whatsappNumber: '573115565483',
    // Payment Configuration
    paymentAdvancePercent: 25,
    paymentBalancePercent: 75,
    paymentSectionSubtitle: 'Si tu reserva fue realizada a través de Airbnb, no es necesario efectuar pagos adicionales, ya que todo el proceso se gestiona directamente por la plataforma. Para reservas directas o realizadas por Booking, se solicita un ABONO OBLIGATORIO del 25 % al momento de confirmar la reserva para asegurar la fecha, y el saldo restante se paga al llegar a la casa.',
    paymentSubtitlePart1: 'Si tu reserva fue realizada a través de Airbnb, no es necesario efectuar pagos adicionales, ya que todo el proceso se gestiona directamente por la plataforma. Para reservas directas o realizadas por Booking, se solicita un',
    paymentSubtitleHighlight: 'ABONO OBLIGATORIO DEL 25 %',
    paymentSubtitlePart2: 'al momento de confirmar la reserva para asegurar la fecha, y el saldo restante se paga al llegar a la casa. FInal Fimal',
    // Bank Transfer Info
    paymentBankName: 'Bancolombia',
    paymentBankAccountType: 'Ahorros',
    paymentBankAccountNumber: '123-456789-00',
    paymentBankAccountHolder: 'Reserva de las Sierras S.A.S',
    paymentBankAccountNit: '901.234.567-8',
    // Nequi Info
    paymentNequiNumber: '3057501023',
    paymentNequiName: 'Osc_Can (Oscar Cante)',
    // QR Code
    paymentQRImageUrl: '',
    // WhatsApp for payment receipts
    paymentWhatsappNumber: '3027857026',
    paymentWhatsappMessage: 'Hola, adjunto mi comprobante de pago para la reserva',
    // B-bre / PSE Link
    paymentBbreLink: '',
    paymentBbreEmail: 'ingenierocante@gmail.com',
    paymentBbrePhone: '3057501023',
    // Galeria labels
    galeriaLabels: {},
    // Galeria Content
    galeriaContent: {
        pageTitle: 'Nuestra Galería',
        pageSubtitle: 'Explora cada rincón de Reserva de las Sierras.'
    },
    // Registro Content
    registroContent: {
        pageTitle: 'Registro de Huéspedes'
    },
    // Reservas Content
    reservasContent: {
        pageTitle: 'Reserva tu hospedaje',
        pageSubtitle: 'Selecciona tus fechas de llegada y salida.'
    },
    // Inicio Content
    inicioContent: {
        intro: {
            title: 'Bienvenidos a Reserva de las Sierras, Anapoima'
        }
    },
    // Site Colors
    siteColors: {
        pageBgInicio: '#ffffff',
        pageBgReservas: '#ffffff',
        pageBgGaleria: '#ffffff'
    },
    // Site Fonts
    siteFonts: {
        fontTitle: 'Outfit',
        fontBody: 'Inter',
        fontCard: 'Inter',
        fontButton: 'Poppins',
        fontAlert: 'Inter'
    },
    // Pricing Configuration
    pricing: {
        baseRates: {
            weekday: 350000,
            weekend: 450000,
            cleaningFee: 80000,
            cleaningEnabled: true,
            currency: 'COP',
            ivaEnabled: false,
            ivaPercent: 19
        },
        seasons: [
            { id: 1, name: 'Temporada Alta', multiplier: 1.3, startMonth: 12, startDay: 15, endMonth: 1, endDay: 15, color: '#2f4858' },
            { id: 2, name: 'Semana Santa', multiplier: 1.4, startMonth: 3, startDay: 24, endMonth: 3, endDay: 31, color: '#007983' }
        ],
        specialDates: [
            { id: 1, date: '2024-12-24', price: 600000, label: 'Nochebuena' },
            { id: 2, date: '2024-12-31', price: 700000, label: 'Año Nuevo' }
        ],
        discounts: {
            longStay: { enabled: true, nights: 7, percent: 15 },
            lastMinute: { enabled: false, hours: 48, percent: 10 }
        }
    }
}

const CONFIG_KEY = 'casacampestre_config'

/**
 * Initialize the application configuration.
 * This MUST be called at app startup to ensure credentials are always available.
 * It will preserve any user-saved settings while ensuring all required keys exist.
 */
export function initializeConfig() {
    try {
        const savedRaw = localStorage.getItem(CONFIG_KEY)

        if (!savedRaw) {
            // No config exists - save defaults
            localStorage.setItem(CONFIG_KEY, JSON.stringify(DEFAULT_CONFIG))
            console.log('✅ [Config] Initialized with default configuration')
            return DEFAULT_CONFIG
        }

        const saved = JSON.parse(savedRaw)

        // Check if critical credentials are missing
        const hasCriticalCredentials =
            saved.googleSheetsId &&
            saved.googlePrivateKey &&
            saved.googleServiceAccountEmail

        if (!hasCriticalCredentials) {
            // Merge defaults for missing keys while preserving existing values
            const merged = { ...DEFAULT_CONFIG, ...saved }
            localStorage.setItem(CONFIG_KEY, JSON.stringify(merged))
            console.log('✅ [Config] Merged missing credentials with saved config')
            return merged
        }

        // Config exists and has credentials - ensure any new fields are added
        let needsUpdate = false
        const merged = { ...saved }

        for (const key of Object.keys(DEFAULT_CONFIG)) {
            if (!(key in saved)) {
                merged[key] = DEFAULT_CONFIG[key]
                needsUpdate = true
            }
        }

        if (needsUpdate) {
            localStorage.setItem(CONFIG_KEY, JSON.stringify(merged))
            console.log('✅ [Config] Added new configuration fields')
        } else {
            console.log('✅ [Config] Configuration loaded successfully')
        }

        return merged
    } catch (error) {
        console.error('❌ [Config] Error initializing config:', error)
        // If something is broken, reset to defaults
        localStorage.setItem(CONFIG_KEY, JSON.stringify(DEFAULT_CONFIG))
        console.log('✅ [Config] Reset to default configuration due to error')
        return DEFAULT_CONFIG
    }
}

/**
 * Get the current configuration from localStorage
 */
export function getConfig() {
    try {
        const saved = localStorage.getItem(CONFIG_KEY)
        if (!saved) {
            return initializeConfig()
        }
        return JSON.parse(saved)
    } catch {
        return initializeConfig()
    }
}

/**
 * Save configuration to localStorage
 */
export function saveConfig(config) {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config))
    console.log('✅ [Config] Configuration saved')
}
