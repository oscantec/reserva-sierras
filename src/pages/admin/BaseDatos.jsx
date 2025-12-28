import { useState, useEffect } from 'react'
import { fetchReservasData, fetchHuespedesData } from '../../utils/googleSheets'

export default function BaseDatos() {
    const [activeTab, setActiveTab] = useState('reservas')
    const [config, setConfig] = useState(null)

    const [reservasData, setReservasData] = useState([])
    const [huespdesData, setHuespdesData] = useState([])

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const loadConfig = async () => {
            let configData = null
            // 1. Try API first (Supabase)
            try {
                const response = await fetch('/api/config')
                if (response.ok) {
                    const data = await response.json()
                    if (Object.keys(data).length > 0) {
                        configData = data
                        localStorage.setItem('casacampestre_config', JSON.stringify(data))
                    }
                }
            } catch (e) {
                console.log('API not available, using localStorage')
            }
            // 2. Fallback to localStorage
            if (!configData) {
                const saved = localStorage.getItem('casacampestre_config')
                if (saved) configData = JSON.parse(saved)
            }
            // 3. Apply config
            if (configData) {
                setConfig(configData)
            }
        }
        loadConfig()
        loadData()
    }, [])

    const loadData = async () => {
        setLoading(true)
        setError(null)
        try {
            // Fetch both sheets concurrently
            const [reservas, huespedes] = await Promise.all([
                fetchReservasData(),
                fetchHuespedesData()
            ])

            setReservasData(reservas || [])
            setHuespdesData(huespedes || [])

            if ((!reservas || reservas.length === 0) && (!huespedes || huespedes.length === 0)) {
                setError('No se encontraron datos o hubo un error de conexión. Verifica tus credenciales (Private Key, Service Account Email) en Conexiones.')
            }
        } catch (err) {
            setError('Error de autenticación o red: ' + err.message)
        }
        setLoading(false)
    }

    // Helper to format header keys for display (e.g., "fecha_inicio" -> "Fecha Inicio")
    const formatHeader = (key) => {
        return key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    }

    // Render a generic table for any data structure
    const DataTable = ({ data, emptyMessage }) => {
        if (!data || data.length === 0) {
            return (
                <div className="p-8 text-center text-text-muted bg-surface-card dark:bg-surface-card-dark rounded-xl border border-border-card dark:border-border-card-dark">
                    <span className="material-symbols-outlined text-4xl mb-2">table_view</span>
                    <p>{emptyMessage}</p>
                </div>
            )
        }

        const headers = Object.keys(data[0])

        return (
            <div className="bg-surface-card dark:bg-surface-card-dark rounded-xl border border-border-card dark:border-border-card-dark shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-background-light dark:bg-surface-dark/50 border-b border-border-card dark:border-border-card-dark">
                            <tr>
                                {headers.map(key => (
                                    <th key={key} className="py-3 px-6 text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark whitespace-nowrap">
                                        {formatHeader(key)}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#f0f4ef] dark:divide-[#2a3825]">
                            {data.map((row, index) => (
                                <tr key={index} className={`hover:bg-gray-100 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                    {headers.map((key, i) => (
                                        <td key={i} className="py-2.5 px-6 text-sm text-text-main-light dark:text-text-main-dark max-w-[250px] truncate" title={row[key]}>
                                            {row[key]}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="bg-icon-bg-primary dark:bg-surface-dark/50 px-6 py-3 border-t border-border-card dark:border-border-card-dark flex justify-between items-center">
                    <span className="text-xs text-text-muted">Mostrando {data.length} registros</span>
                </div>
            </div>
        )
    }

    return (
        <>
            <header className="bg-white border-b border-border-card px-3 md:px-6 py-3 md:py-4">
                <div className="flex flex-col gap-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                            <h1 className="text-xl md:text-2xl font-black text-gray-900">Base de Datos</h1>
                            <p className="text-text-subtitle dark:text-text-subtitle-dark text-sm">Conectado a Google Sheets: <span className="font-mono text-primary">{config?.googleSheetsId?.slice(0, 15) || '...'}...</span></p>
                        </div>
                        <button
                            onClick={loadData}
                            disabled={loading}
                            className="bg-slate-100 hover:bg-slate-200 dark:bg-surface-dark dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                            <span className={`material-symbols-outlined text-lg ${loading ? 'animate-spin' : ''}`}>sync</span>
                            {loading ? 'Cargando...' : 'Sincronizar Ahora'}
                        </button>
                    </div>
                    <div className="h-2 w-full rounded-full bg-icon-bg-secondary dark:bg-border-card-dark relative overflow-hidden">
                        <div className="absolute top-0 left-0 h-full w-full bg-primary rounded-full"></div>
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-6 pt-4">
                {error && (
                    <div className="mb-6 bg-gray-100 border border-gray-300 rounded-xl p-4 flex items-center gap-3">
                        <span className="material-symbols-outlined text-gray-600">error</span>
                        <div className="flex-1">
                            <p className="text-sm font-bold text-gray-800">Error de conexión</p>
                            <p className="text-xs text-gray-600">{error}</p>
                        </div>
                    </div>
                )}

                {/* Tabs */}
                <div className="flex border-b border-border-card dark:border-border-card-dark mb-6">
                    <button
                        onClick={() => setActiveTab('reservas')}
                        className={`flex items-center gap-2 px-6 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'reservas'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-text-muted hover:text-slate-700 dark:hover:text-slate-300'
                            }`}
                    >
                        <span className="material-symbols-outlined text-lg">event_note</span>
                        {config?.sheetNameReservas || 'Reservas'}
                        <span className="bg-slate-100 dark:bg-surface-dark text-text-muted dark:text-text-muted text-xs px-2 py-0.5 rounded-full">{reservasData.length}</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('huespedes')}
                        className={`flex items-center gap-2 px-6 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'huespedes'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-text-muted hover:text-slate-700 dark:hover:text-slate-300'
                            }`}
                    >
                        <span className="material-symbols-outlined text-lg">group</span>
                        {config?.sheetNameHuespedes || 'Huéspedes'}
                        <span className="bg-slate-100 dark:bg-surface-dark text-text-muted dark:text-text-muted text-xs px-2 py-0.5 rounded-full">{huespdesData.length}</span>
                    </button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="flex flex-col items-center gap-4">
                            <span className="material-symbols-outlined text-4xl text-primary animate-spin">cloud_sync</span>
                            <p className="text-text-muted">Autenticando y descargando datos...</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {activeTab === 'reservas' && <DataTable data={reservasData} emptyMessage="No hay datos en la hoja de Reservas." />}
                        {activeTab === 'huespedes' && <DataTable data={huespdesData} emptyMessage="No hay datos en la hoja de Huéspedes." />}
                    </>
                )}

                {/* Info Card - Green theme */}
                <div className="mt-6 flex flex-col md:flex-row gap-4">
                    <div className="flex-1 bg-success-bg dark:bg-green-900/10 border border-border-card dark:border-border-card-dark rounded-xl p-4 flex items-start gap-3">
                        <span className="material-symbols-outlined text-icon-color text-lg mt-0.5">verified_user</span>
                        <div className="text-sm text-text-main-light dark:text-text-subtitle-dark">
                            <p className="font-bold">Autenticación Segura (Service Account)</p>
                            <p className="text-xs mt-1">Se están utilizando las credenciales provistas para acceder a las hojas privadas. Los datos se obtienen directamente de Google.</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
