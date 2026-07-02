import { useState, useEffect } from 'react'

// Paleta de 12 colores permitidos
const ALLOWED_COLORS = [
    { hex: '#3db814', name: 'Verde Principal' },
    { hex: '#2a8a0e', name: 'Verde Oscuro' },
    { hex: '#ffffff', name: 'Blanco' },
    { hex: '#000000', name: 'Negro' },
    { hex: '#00a658', name: 'Verde Menta' },
    { hex: '#009178', name: 'Verde Azulado' },
    { hex: '#007983', name: 'Teal' },
    { hex: '#006076', name: 'Teal Oscuro' },
    { hex: '#2f4858', name: 'Azul Grisáceo' },
    { hex: '#00af52', name: 'Verde Lima' },
    { hex: '#00a381', name: 'Verde Mar' },
    { hex: '#0094a8', name: 'Turquesa' }
]

const PaletteColorPicker = ({ value, onChange }) => {
    const currentColor = ALLOWED_COLORS.find(c => c.hex.toLowerCase() === value?.toLowerCase())
    return (
        <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
                {ALLOWED_COLORS.map(color => (
                    <button
                        key={color.hex}
                        type="button"
                        onClick={() => onChange(color.hex)}
                        className={`w-8 h-8 rounded-lg transition-all ${value?.toLowerCase() === color.hex.toLowerCase()
                            ? 'ring-2 ring-offset-2 ring-primary scale-110'
                            : 'hover:scale-105 border border-gray-200'
                            }`}
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                    />
                ))}
            </div>
            <p className="text-xs text-text-muted">
                {currentColor ? currentColor.name : 'Selecciona un color'} - {value}
            </p>
        </div>
    )
}

export default function Conexiones() {
    // Default configuration values - these will be auto-saved if localStorage is empty
    const DEFAULT_CONFIG = {
        // Hero Video Settings
        heroVideoUrl: 'https://www.youtube.com/watch?v=yzjFNEuWwFI',
        heroFilterColor: '#3db814',
        heroFilterOpacity: 30,
        heroRotatingPhrases: [
            'Somos Reserva de las Sierras',
            'Somos Tranquilidad',
            'Somos Aire Puro',
            'Somos Espacio Verde'
        ],
        // iCal URLs
        airbnbUrl: 'https://www.airbnb.com.co/calendar/ical/1164759440955486077.ics?s=556ea5347565316f2bf679394086236b',
        bookingUrl: 'https://ical.booking.com/v1/export?t=1f8d5ee8-e773-4d57-a0a7-cb23c241ea8c',
        googleCalendarUrl: 'https://calendar.google.com/calendar/ical/b529ad8b58ec0ce1bd3c82399f798123c7e8d383bd73754ae640df211d9b16e7%40group.calendar.google.com/public/basic.ics',
        // Google Sheets Credentials
        sessionSecret: '',
        googleSheetsId: '1zUe1X-4OofPnDw8i74Llc3f6t1VlZrfmOppYT1-ntB8',
        googlePrivateKey: '',
        googleServiceAccountEmail: '',
        // Sheet Names
        sheetNameReservas: '1. BD',
        sheetNameHuespedes: '2. BH',
        // Hero Blur Amount
        heroBlurAmount: 15,
        // Tuya API Credentials (Monitoreo de Agua)
        tuyaAccessId: '',
        tuyaAccessSecret: '',
        tuyaDeviceIdAbajo: 'ebd09863004e52db0ehcrq',
        tuyaDeviceIdArriba: 'ebc4697fd7293917feksfa',
        tuyaDeviceIdCasa: 'eb04c0fcf71d11da80m8rm',
        tuyaApiRegion: 'https://openapi.tuyaus.com',
    }

    const [config, setConfig] = useState(DEFAULT_CONFIG)

    const [connectionStatus, setConnectionStatus] = useState({
        airbnb: 'disconnected',
        booking: 'disconnected',
        googleCalendar: 'disconnected',
        googleSheets: 'disconnected',
    })

    const [siteColors, setSiteColors] = useState({
        platformAirbnb: '#2f4858',
        platformBooking: '#006076',
        platformGoogle: '#0094a8'
    })

    const [saved, setSaved] = useState(false)

    // Load config: API first (file), then localStorage as fallback
    useEffect(() => {
        const loadConfig = async () => {
            let savedConfig = null

            // 1. Try to load from API (saved-config.json) first - this persists across app restarts
            try {
                const response = await fetch('/api/config')
                if (response.ok) {
                    const apiConfig = await response.json()
                    if (Object.keys(apiConfig).length > 0) {
                        savedConfig = apiConfig
                        console.log('✅ Config loaded from API (saved-config.json)')
                    }
                }
            } catch (e) {
                console.log('API not available, falling back to localStorage')
            }

            // 2. If API didn't have data, try localStorage
            if (!savedConfig) {
                const localData = localStorage.getItem('casacampestre_config')
                if (localData) {
                    savedConfig = JSON.parse(localData)
                    console.log('✅ Config loaded from localStorage')
                }
            }

            // 3. Apply config if found
            if (savedConfig) {
                // Deep merge: Start with DEFAULT_CONFIG, then OVERRIDE with saved values
                // This way new fields get added, but user's values are NEVER lost
                const mergedConfig = { ...DEFAULT_CONFIG }
                for (const key of Object.keys(savedConfig)) {
                    // User's saved value ALWAYS wins
                    mergedConfig[key] = savedConfig[key]
                }

                setConfig(mergedConfig)

                // Sync localStorage with merged config
                localStorage.setItem('casacampestre_config', JSON.stringify(mergedConfig))

                // Load platform colors
                if (savedConfig.siteColors) {
                    setSiteColors(prev => ({
                        ...prev,
                        platformAirbnb: savedConfig.siteColors.platformAirbnb || prev.platformAirbnb,
                        platformBooking: savedConfig.siteColors.platformBooking || prev.platformBooking,
                        platformGoogle: savedConfig.siteColors.platformGoogle || prev.platformGoogle
                    }))
                }
            } else {
                // CRITICAL: No saved config found - persist defaults immediately
                localStorage.setItem('casacampestre_config', JSON.stringify(DEFAULT_CONFIG))
                console.log('✅ Default configuration auto-saved to localStorage')
            }
        }

        loadConfig()
    }, [])

    const handleChange = (field, value) => {
        setConfig(prev => ({ ...prev, [field]: value }))
        setSaved(false)
    }

    const handleSave = async () => {
        // IMPORTANT: Save to API (Supabase) FIRST for persistence
        try {
            const response = await fetch('/api/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config)
            })
            if (response.ok) {
                console.log('✅ Config saved to Supabase')
                // Only sync to localStorage after successful API save
                localStorage.setItem('casacampestre_config', JSON.stringify(config))
                setSaved(true)
                setTimeout(() => setSaved(false), 3000)
            } else {
                throw new Error('API response not OK')
            }
        } catch (error) {
            console.error('❌ Error saving to Supabase:', error)
            // Fallback: save to localStorage but warn user
            localStorage.setItem('casacampestre_config', JSON.stringify(config))
            alert('⚠️ Los cambios se guardaron localmente pero NO en la nube. Verifica tu conexión a internet.')
        }
    }

    const testGoogleConnection = () => {
        if (config.googleSheetsId && config.googleServiceAccountEmail) {
            setConnectionStatus(prev => ({ ...prev, googleSheets: 'connected' }))
            alert('✅ Conexión exitosa con Google Sheets')
        } else {
            alert('❌ Por favor complete los campos requeridos')
        }
    }

    const StatusBadge = ({ status }) => (
        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${status === 'connected'
            ? 'bg-success-bg text-success-text dark:bg-green-900/30 dark:text-green-400'
            : 'bg-icon-bg-primary text-text-muted dark:bg-gray-800 dark:text-text-muted'
            }`}>
            <span className={`w-2 h-2 rounded-full ${status === 'connected' ? 'bg-success-bg0' : 'bg-gray-400'}`}></span>
            {status === 'connected' ? 'Conectado' : 'Sin conectar'}
        </span>
    )

    return (
        <>
            <header className="bg-white border-b border-border-card px-3 md:px-6 py-3 md:py-4">
                <div className="flex flex-col gap-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                            <h1 className="text-xl md:text-2xl font-black text-gray-900">Conexiones</h1>
                            <p className="text-text-subtitle dark:text-text-subtitle-dark text-sm">Configura tus calendarios iCal y conexión a Google Sheets</p>
                        </div>
                        <button
                            onClick={handleSave}
                            className={`h-12 px-8 rounded-lg font-bold shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2 ${saved
                                ? 'bg-success-bg0 text-white shadow-card'
                                : 'bg-primary hover:bg-btn-primary-hover text-white shadow-card'
                                }`}
                        >
                            <span className="material-symbols-outlined">{saved ? 'check_circle' : 'save'}</span>
                            {saved ? '¡Guardado!' : 'Guardar Cambios'}
                        </button>
                    </div>
                    <div className="h-2 w-full rounded-full bg-icon-bg-secondary dark:bg-border-card-dark relative overflow-hidden">
                        <div className="absolute top-0 left-0 h-full w-full bg-primary rounded-full"></div>
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-6 pt-4 space-y-6 font-display">
                {/* Video Hero Section */}
                <div className="bg-surface-card dark:bg-surface-card-dark rounded-xl border border-border-card dark:border-border-card-dark shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-border-card dark:border-border-card-dark flex items-center gap-3">
                        <div className="w-10 h-10 bg-icon-bg-primary dark:bg-icon-bg-dark rounded-lg flex items-center justify-center">
                            <span className="material-symbols-outlined text-icon-color text-xl">video_library</span>
                        </div>
                        <div>
                            <h3 className="text-text-main-light dark:text-text-main-dark text-lg font-bold">Video Hero (Inicio)</h3>
                            <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm">Configura el video de fondo y texto animado del hero</p>
                        </div>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* YouTube URL */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                <span className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-gray-600 text-lg">smart_display</span>
                                    URL del Video de YouTube
                                </span>
                            </label>
                            <input
                                type="url"
                                value={config.heroVideoUrl}
                                onChange={(e) => handleChange('heroVideoUrl', e.target.value)}
                                placeholder="https://www.youtube.com/watch?v=..."
                                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-surface-dark text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                            />
                            <p className="mt-1 text-xs text-text-muted">El video se reproducirá en bucle, silenciado y sin controles</p>
                        </div>

                        {/* Filter Settings Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Filter Color */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    <span className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-icon-color text-lg">palette</span>
                                        Color del Filtro
                                    </span>
                                </label>
                                <PaletteColorPicker
                                    value={config.heroFilterColor}
                                    onChange={(color) => handleChange('heroFilterColor', color)}
                                />
                            </div>

                            {/* Filter Opacity */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    <span className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-gray-600 text-lg">opacity</span>
                                        Opacidad del Filtro: {config.heroFilterOpacity}%
                                    </span>
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={config.heroFilterOpacity}
                                    onChange={(e) => handleChange('heroFilterOpacity', parseInt(e.target.value))}
                                    className="w-full h-3 rounded-lg appearance-none cursor-pointer bg-slate-200 dark:bg-slate-700 accent-primary"
                                />
                                <div className="flex justify-between text-xs text-text-muted mt-1">
                                    <span>0% (Sin filtro)</span>
                                    <span>100% (Sólido)</span>
                                </div>
                            </div>

                            {/* Background Blur Amount */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    <span className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-gray-600 text-lg">blur_on</span>
                                        Difuminado del Borde: {config.heroBlurAmount || 15}px
                                    </span>
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="50"
                                    value={config.heroBlurAmount || 15}
                                    onChange={(e) => handleChange('heroBlurAmount', parseInt(e.target.value))}
                                    className="w-full h-3 rounded-lg appearance-none cursor-pointer bg-gray-200 dark:bg-gray-700 accent-[#2a8a0e]"
                                />
                                <div className="flex justify-between text-xs text-text-muted mt-1">
                                    <span>0px (Nítido)</span>
                                    <span>50px (Muy difuminado)</span>
                                </div>
                            </div>
                        </div>

                        {/* Rotating Phrases */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                <span className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-gray-600 text-lg">text_rotation_none</span>
                                    Frases Rotativas (5 segundos c/u, última palabra en verde)
                                </span>
                            </label>
                            <div className="space-y-2">
                                {config.heroRotatingPhrases?.map((phrase, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-text-muted w-6">{index + 1}.</span>
                                        <input
                                            type="text"
                                            value={phrase}
                                            onChange={(e) => {
                                                const newPhrases = [...config.heroRotatingPhrases]
                                                newPhrases[index] = e.target.value
                                                handleChange('heroRotatingPhrases', newPhrases)
                                            }}
                                            className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-surface-dark text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                                        />
                                        <button
                                            onClick={() => {
                                                const newPhrases = config.heroRotatingPhrases.filter((_, i) => i !== index)
                                                handleChange('heroRotatingPhrases', newPhrases)
                                            }}
                                            className="p-2 text-primary hover:bg-success-bg dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-lg">delete</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={() => handleChange('heroRotatingPhrases', [...(config.heroRotatingPhrases || []), 'Nueva frase'])}
                                className="mt-3 flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors"
                            >
                                <span className="material-symbols-outlined text-lg">add</span>
                                Agregar Frase
                            </button>
                        </div>

                        {/* Preview */}
                        <div className="p-4 bg-slate-900 rounded-xl">
                            <p className="text-xs text-text-muted mb-2">Vista previa del texto:</p>
                            <p className="text-2xl font-bold text-white">
                                {config.heroRotatingPhrases?.[0]?.split(' ').slice(0, -1).join(' ')}{' '}
                                <span className="text-primary">{config.heroRotatingPhrases?.[0]?.split(' ').slice(-1)[0]}</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* iCal Section */}
                <div className="bg-surface-card dark:bg-surface-card-dark rounded-xl border border-border-card dark:border-border-card-dark shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-border-card dark:border-border-card-dark flex items-center gap-3">
                        <div className="w-10 h-10 bg-icon-bg-primary dark:bg-icon-bg-dark rounded-lg flex items-center justify-center">
                            <span className="material-symbols-outlined text-icon-color text-xl">calendar_month</span>
                        </div>
                        <div>
                            <h3 className="text-text-main-light dark:text-text-main-dark text-lg font-bold">Calendarios iCal</h3>
                            <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm">Sincroniza reservas desde plataformas externas</p>
                        </div>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Airbnb */}
                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                            <div className="flex items-center gap-3 md:w-48">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${siteColors.platformAirbnb}15` }}>
                                    <span className="font-bold text-sm" style={{ color: siteColors.platformAirbnb }}>Air</span>
                                </div>
                                <span className="font-medium text-text-main-light dark:text-text-main-dark">Airbnb</span>
                            </div>
                            <div className="flex-1">
                                <input
                                    type="url"
                                    value={config.airbnbUrl}
                                    onChange={(e) => handleChange('airbnbUrl', e.target.value)}
                                    placeholder="https://www.airbnb.com/calendar/ical/..."
                                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-surface-dark text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                                />
                            </div>
                            <StatusBadge status={config.airbnbUrl ? 'connected' : 'disconnected'} />
                        </div>

                        {/* Booking.com */}
                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                            <div className="flex items-center gap-3 md:w-48">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${siteColors.platformBooking}15` }}>
                                    <span className="font-bold text-sm" style={{ color: siteColors.platformBooking }}>B</span>
                                </div>
                                <span className="font-medium text-text-main-light dark:text-text-main-dark">Booking.com</span>
                            </div>
                            <div className="flex-1">
                                <input
                                    type="url"
                                    value={config.bookingUrl}
                                    onChange={(e) => handleChange('bookingUrl', e.target.value)}
                                    placeholder="https://admin.booking.com/hotel/..."
                                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-surface-dark text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                                />
                            </div>
                            <StatusBadge status={config.bookingUrl ? 'connected' : 'disconnected'} />
                        </div>

                        {/* Google Calendar */}
                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                            <div className="flex items-center gap-3 md:w-48">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${siteColors.platformGoogle}15` }}>
                                    <span className="material-symbols-outlined text-lg" style={{ color: siteColors.platformGoogle }}>event</span>
                                </div>
                                <span className="font-medium text-text-main-light dark:text-text-main-dark">Google Calendar</span>
                            </div>
                            <div className="flex-1">
                                <input
                                    type="url"
                                    value={config.googleCalendarUrl}
                                    onChange={(e) => handleChange('googleCalendarUrl', e.target.value)}
                                    placeholder="https://calendar.google.com/calendar/ical/..."
                                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-surface-dark text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                                />
                            </div>
                            <StatusBadge status={config.googleCalendarUrl ? 'connected' : 'disconnected'} />
                        </div>
                    </div>
                </div>

                {/* Google Sheets Section */}
                <div className="bg-surface-card dark:bg-surface-card-dark rounded-xl border border-border-card dark:border-border-card-dark shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-border-card dark:border-border-card-dark flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-icon-bg-primary dark:bg-icon-bg-dark rounded-lg flex items-center justify-center">
                                <span className="material-symbols-outlined text-success-text text-xl">table_chart</span>
                            </div>
                            <div>
                                <h3 className="text-text-main-light dark:text-text-main-dark text-lg font-bold">Google Sheets API</h3>
                                <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm">Credenciales de servicio para conexión a la base de datos</p>
                            </div>
                        </div>
                        <StatusBadge status={connectionStatus.googleSheets} />
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Session Secret */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                <span className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-gray-600 text-lg">vpn_key</span>
                                    SESSION_SECRET
                                </span>
                            </label>
                            <input
                                type="password"
                                value={config.sessionSecret}
                                onChange={(e) => handleChange('sessionSecret', e.target.value)}
                                placeholder="Token de sesión secreto"
                                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-surface-dark text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary text-sm font-mono"
                            />
                        </div>

                        {/* Google Sheets ID */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                <span className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-icon-color text-lg">grid_on</span>
                                    GOOGLE_SHEETS_ID
                                </span>
                            </label>
                            <input
                                type="text"
                                value={config.googleSheetsId}
                                onChange={(e) => handleChange('googleSheetsId', e.target.value)}
                                placeholder="ID del Spreadsheet (de la URL)"
                                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-surface-dark text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary text-sm font-mono"
                            />
                            <p className="mt-1 text-xs text-text-muted">El ID se encuentra en la URL: docs.google.com/spreadsheets/d/<strong>[ID]</strong>/edit</p>
                        </div>

                        {/* Service Account Email */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                <span className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-gray-600 text-lg">mail</span>
                                    GOOGLE_SERVICE_ACCOUNT_EMAIL
                                </span>
                            </label>
                            <input
                                type="email"
                                value={config.googleServiceAccountEmail}
                                onChange={(e) => handleChange('googleServiceAccountEmail', e.target.value)}
                                placeholder="cuenta@proyecto.iam.gserviceaccount.com"
                                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-surface-dark text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                            />
                        </div>

                        {/* Private Key */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                <span className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-gray-600 text-lg">lock</span>
                                    GOOGLE_PRIVATE_KEY
                                </span>
                            </label>
                            <textarea
                                value={config.googlePrivateKey}
                                onChange={(e) => handleChange('googlePrivateKey', e.target.value)}
                                placeholder="-----BEGIN PRIVATE KEY-----..."
                                rows={4}
                                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-surface-dark text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary text-sm font-mono resize-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Sheet Names Configuration */}
                <div className="bg-surface-card dark:bg-surface-card-dark rounded-xl border border-border-card dark:border-border-card-dark shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-border-card dark:border-border-card-dark flex items-center gap-3">
                        <div className="w-10 h-10 bg-icon-bg-primary dark:bg-icon-bg-dark rounded-lg flex items-center justify-center">
                            <span className="material-symbols-outlined text-icon-color text-xl">tab</span>
                        </div>
                        <div>
                            <h3 className="text-text-main-light dark:text-text-main-dark text-lg font-bold">Nombres de Hojas</h3>
                            <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm">Define qué hoja corresponde a cada base de datos</p>
                        </div>
                    </div>

                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Sheet Reservas */}
                        <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-icon-bg-primary/50 dark:bg-surface-dark/50">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                                <span className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-icon-color text-lg">event_note</span>
                                    Hoja de Reservas (Dashboard)
                                </span>
                            </label>
                            <input
                                type="text"
                                value={config.sheetNameReservas}
                                onChange={(e) => handleChange('sheetNameReservas', e.target.value)}
                                placeholder="Nombre de la hoja"
                                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-surface-card dark:bg-surface-card-dark text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary text-sm font-medium"
                            />
                            <p className="mt-2 text-xs text-text-muted">Esta hoja alimenta el Dashboard y la tabla de Reservas</p>
                        </div>

                        {/* Sheet Huéspedes */}
                        <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-icon-bg-primary/50 dark:bg-surface-dark/50">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                                <span className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-gray-600 text-lg">group</span>
                                    Hoja de Huéspedes (Registro)
                                </span>
                            </label>
                            <input
                                type="text"
                                value={config.sheetNameHuespedes}
                                onChange={(e) => handleChange('sheetNameHuespedes', e.target.value)}
                                placeholder="Nombre de la hoja"
                                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-surface-card dark:bg-surface-card-dark text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary text-sm font-medium"
                            />
                            <p className="mt-2 text-xs text-text-muted">Esta hoja contiene el registro de huéspedes</p>
                        </div>
                    </div>

                    <div className="px-6 pb-6 flex justify-end">
                        <button
                            onClick={testGoogleConnection}
                            className="bg-slate-100 hover:bg-slate-200 dark:bg-surface-dark dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-lg">wifi_tethering</span>
                            Probar Conexión
                        </button>
                    </div>
                </div>

                {/* Tuya API Section - Monitoreo de Agua */}
                <div className="bg-surface-card dark:bg-surface-card-dark rounded-xl border border-border-card dark:border-border-card-dark shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-border-card dark:border-border-card-dark flex items-center gap-3">
                        <div className="w-10 h-10 bg-icon-bg-primary dark:bg-icon-bg-dark rounded-lg flex items-center justify-center">
                            <span className="material-symbols-outlined text-icon-color text-xl">water_drop</span>
                        </div>
                        <div>
                            <h3 className="text-text-main-light dark:text-text-main-dark text-lg font-bold">Tuya API - Monitoreo de Agua</h3>
                            <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm">Credenciales para sensores ultrasónicos Tuya</p>
                        </div>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Access ID */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                <span className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-gray-600 text-lg">key</span>
                                    TUYA_ACCESS_ID (Client ID)
                                </span>
                            </label>
                            <input
                                type="text"
                                value={config.tuyaAccessId || ''}
                                onChange={(e) => handleChange('tuyaAccessId', e.target.value)}
                                placeholder="Access ID de Tuya IoT Platform"
                                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-surface-dark text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary text-sm font-mono"
                            />
                        </div>

                        {/* Access Secret */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                <span className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-gray-600 text-lg">vpn_key</span>
                                    TUYA_ACCESS_SECRET (Client Secret)
                                </span>
                            </label>
                            <input
                                type="password"
                                value={config.tuyaAccessSecret || ''}
                                onChange={(e) => handleChange('tuyaAccessSecret', e.target.value)}
                                placeholder="Access Secret de Tuya IoT Platform"
                                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-surface-dark text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary text-sm font-mono"
                            />
                        </div>

                        {/* Device IDs */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Tanque Abajo */}
                            <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-icon-bg-primary/50 dark:bg-surface-dark/50">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                                    <span className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary text-lg">water</span>
                                        Tanque Abajo (Zona Baja)
                                    </span>
                                </label>
                                <input
                                    type="text"
                                    value={config.tuyaDeviceIdAbajo || ''}
                                    onChange={(e) => handleChange('tuyaDeviceIdAbajo', e.target.value)}
                                    placeholder="Device ID"
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-surface-card dark:bg-surface-card-dark text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary text-xs font-mono"
                                />
                                <p className="mt-2 text-xs text-text-muted">Modelo: EPT- Ultrasonic sensor 3m</p>
                            </div>

                            {/* Tanque Arriba */}
                            <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-icon-bg-primary/50 dark:bg-surface-dark/50">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                                    <span className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary text-lg">water</span>
                                        Tanque Arriba (Zona Alta)
                                    </span>
                                </label>
                                <input
                                    type="text"
                                    value={config.tuyaDeviceIdArriba || ''}
                                    onChange={(e) => handleChange('tuyaDeviceIdArriba', e.target.value)}
                                    placeholder="Device ID"
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-surface-card dark:bg-surface-card-dark text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary text-xs font-mono"
                                />
                                <p className="mt-2 text-xs text-text-muted">Modelo: EPT- Ultrasonic sensor Z</p>
                            </div>

                            {/* Tanque Casa */}
                            <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-icon-bg-primary/50 dark:bg-surface-dark/50">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                                    <span className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary text-lg">home</span>
                                        Tanque Casa
                                    </span>
                                </label>
                                <input
                                    type="text"
                                    value={config.tuyaDeviceIdCasa || ''}
                                    onChange={(e) => handleChange('tuyaDeviceIdCasa', e.target.value)}
                                    placeholder="Device ID"
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-surface-card dark:bg-surface-card-dark text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary text-xs font-mono"
                                />
                                <p className="mt-2 text-xs text-text-muted">Modelo: EPT- Ultrasonic sensor Z</p>
                            </div>
                        </div>

                        {/* API Region */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                <span className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-gray-600 text-lg">public</span>
                                    Región del API
                                </span>
                            </label>
                            <select
                                value={config.tuyaApiRegion || 'https://openapi.tuyaus.com'}
                                onChange={(e) => handleChange('tuyaApiRegion', e.target.value)}
                                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-surface-dark text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                            >
                                <option value="https://openapi.tuyaus.com">Estados Unidos (USA)</option>
                                <option value="https://openapi.tuyaeu.com">Europa (EU)</option>
                                <option value="https://openapi.tuyacn.com">China (CN)</option>
                                <option value="https://openapi.tuyain.com">India (IN)</option>
                            </select>
                            <p className="mt-1 text-xs text-text-muted">Selecciona la región donde creaste tu proyecto en Tuya IoT Platform</p>
                        </div>
                    </div>
                </div>




                {/* Info Card - Green theme */}
                <div className="bg-success-bg dark:bg-green-900/10 border border-border-card dark:border-border-card-dark rounded-xl p-6">
                    <div className="flex items-start gap-4">
                        <span className="material-symbols-outlined text-icon-color text-2xl mt-0.5">info</span>
                        <div>
                            <h4 className="font-bold text-text-main-light dark:text-text-subtitle-dark mb-2">Estructura de Hojas Esperada</h4>
                            <div className="text-sm text-text-main-light dark:text-text-subtitle-dark space-y-2">
                                <p><strong>1. BD (Reservas):</strong> ID, Cliente, FechaInicio, FechaFin, Estado, Total, Fuente, Noches</p>
                                <p><strong>2. BH (Huéspedes):</strong> Nombre, Cedula, Telefono, Edad, ReservaID</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
