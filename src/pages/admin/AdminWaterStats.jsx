import { useState, useEffect } from 'react'
import { processZoneDataFromPercent } from '../../utils/waterCalculations'

/**
 * Dashboard de Estadísticas de Agua
 * Muestra datos en tiempo real, históricos y alertas
 */
export default function AdminWaterStats() {
    const CONFIG_KEY = 'water_monitoring_config'

    const [config, setConfig] = useState(null)
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [currentData, setCurrentData] = useState(null)
    const [historicalData, setHistoricalData] = useState([])
    const [selectedDays, setSelectedDays] = useState(7)
    const [selectedZone, setSelectedZone] = useState('all')

    // Cargar configuración
    useEffect(() => {
        const loadConfig = () => {
            const savedConfig = localStorage.getItem(CONFIG_KEY)
            if (savedConfig) {
                setConfig(JSON.parse(savedConfig))
            }
            setLoading(false)
        }
        loadConfig()
    }, [])

    // Fetch datos de sensores Tuya
    const fetchSensorData = async () => {
        if (!config || !config.tuyaConfig) {
            console.error('Configuración no disponible')
            return
        }

        setRefreshing(true)
        try {
            const { clientId, clientSecret, zonaBaja, zonaAlta, zonaCasa } = config.tuyaConfig
            const deviceIds = [zonaBaja.deviceId, zonaAlta.deviceId, zonaCasa.deviceId].filter(Boolean).join(',')

            const response = await fetch(`/api/water-tuya?clientId=${clientId}&clientSecret=${clientSecret}&deviceIds=${deviceIds}`)
            const data = await response.json()

            if (data.success && data.sensors) {
                // Procesar datos de cada zona
                const processedData = {
                    timestamp: data.timestamp,
                    zones: []
                }

                data.sensors.forEach((sensor, index) => {
                    const zones = ['zonaBaja', 'zonaAlta', 'zonaCasa']
                    const zone = zones[index]
                    const tankConfig = config.tankConfigs[zone]

                    if (sensor.success && sensor.liquidLevelPercent !== null && tankConfig) {
                        const zoneData = processZoneDataFromPercent(
                            tankConfig,
                            sensor.liquidLevelPercent,
                            tankConfig.tankCount
                        )

                        processedData.zones.push({
                            zone,
                            name: tankConfig.name,
                            ...zoneData,
                            sensorPercent: sensor.liquidLevelPercent
                        })

                        // Guardar en base de datos
                        saveMeasurement(zone, zoneData)
                    }
                })

                setCurrentData(processedData)
            }
        } catch (error) {
            console.error('Error obteniendo datos de sensores:', error)
        }
        setRefreshing(false)
    }

    // Guardar medición en base de datos
    const saveMeasurement = async (zone, data) => {
        try {
            await fetch('/api/water-data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    zone,
                    level_cm: data.level_cm,
                    volume_m3: data.totalVolume,
                    percentage: data.percentage,
                    tank_count: data.tankCount
                })
            })
        } catch (error) {
            console.error('Error guardando medición:', error)
        }
    }

    // Obtener datos históricos
    const fetchHistoricalData = async () => {
        try {
            const zoneParam = selectedZone !== 'all' ? `&zone=${selectedZone}` : ''
            const response = await fetch(`/api/water-data?days=${selectedDays}${zoneParam}`)
            const data = await response.json()

            if (data.success) {
                setHistoricalData(data.data)
            }
        } catch (error) {
            console.error('Error obteniendo datos históricos:', error)
        }
    }

    // Auto-refresh cada 30 minutos
    useEffect(() => {
        if (config) {
            fetchSensorData()
            const interval = setInterval(fetchSensorData, 30 * 60 * 1000) // 30 minutos
            return () => clearInterval(interval)
        }
    }, [config])

    // Cargar históricos cuando cambien filtros
    useEffect(() => {
        if (config) {
            fetchHistoricalData()
        }
    }, [selectedDays, selectedZone, config])

    // Calcular alertas
    const getAlertLevel = (percentage) => {
        if (!config || !config.alertConfig) return 'normal'
        const { criticalThreshold, warningThreshold } = config.alertConfig

        if (percentage < criticalThreshold) return 'critical'
        if (percentage < warningThreshold) return 'warning'
        return 'normal'
    }

    // Calcular total de agua disponible
    const getTotalWater = () => {
        if (!currentData || !currentData.zones) return 0
        return currentData.zones.reduce((sum, zone) => sum + zone.totalVolume, 0)
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-page-bg-admin flex items-center justify-center">
                <div className="text-center">
                    <span className="material-symbols-rounded text-6xl text-primary animate-spin">refresh</span>
                    <p className="text-text-muted mt-4">Cargando configuración...</p>
                </div>
            </div>
        )
    }

    if (!config) {
        return (
            <div className="min-h-screen bg-page-bg-admin flex items-center justify-center p-8">
                <div className="bg-surface-card rounded-2xl shadow-lg p-8 max-w-md text-center border border-border-card">
                    <span className="material-symbols-rounded text-6xl text-warning-bg">warning</span>
                    <h2 className="text-2xl font-bold text-text-title mt-4 mb-2">
                        Configuración Requerida
                    </h2>
                    <p className="text-text-muted mb-6">
                        Debes configurar primero las dimensiones de los tanques y las credenciales de API
                    </p>
                    <a
                        href="/admin/agua/config"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-btn-primary hover:bg-btn-primary-hover text-white font-semibold rounded-lg"
                    >
                        <span className="material-symbols-rounded">settings</span>
                        Ir a Configuración
                    </a>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-page-bg-admin p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex justify-between items-center flex-wrap gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-text-title mb-2">
                            Estadísticas de Agua
                        </h1>
                        <p className="text-text-muted">
                            Monitoreo en tiempo real del sistema de agua
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <a
                            href="/admin/agua/config"
                            className="flex items-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-lg border border-border-card transition-all"
                        >
                            <span className="material-symbols-rounded">settings</span>
                            Configurar Dimensiones
                        </a>
                        <button
                            onClick={fetchSensorData}
                            disabled={refreshing}
                            className="flex items-center gap-2 px-6 py-3 bg-btn-primary hover:bg-btn-primary-hover text-white font-semibold rounded-lg disabled:opacity-50"
                        >
                            <span className={`material-symbols-rounded ${refreshing ? 'animate-spin' : ''}`}>
                                refresh
                            </span>
                            {refreshing ? 'Actualizando...' : 'Actualizar Ahora'}
                        </button>
                    </div>
                </div>

                {/* Dashboard Global */}
                <section className="mb-8">
                    <div className="bg-gradient-to-br from-primary to-btn-primary-hover rounded-2xl shadow-xl p-8 text-white">
                        <div className="flex items-center gap-4 mb-4">
                            <span className="material-symbols-rounded text-5xl">water_drop</span>
                            <div>
                                <h2 className="text-2xl font-bold">Agua Total Disponible</h2>
                                <p className="text-white/80">En todo el complejo</p>
                            </div>
                        </div>
                        <div className="text-5xl font-bold">
                            {getTotalWater().toFixed(2)} m³
                        </div>
                        {currentData && (
                            <p className="text-white/70 mt-2 text-sm">
                                Última actualización: {new Date(currentData.timestamp).toLocaleString('es-CO')}
                            </p>
                        )}
                    </div>
                </section>

                {/* Cards por Zona */}
                <section className="mb-8">
                    <h2 className="text-xl font-bold text-text-title mb-4">Estado por Zona</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        {currentData?.zones.map((zone) => {
                            const alertLevel = getAlertLevel(zone.percentage)
                            const borderColor = alertLevel === 'critical' ? 'border-red-500' :
                                alertLevel === 'warning' ? 'border-yellow-500' : 'border-border-card'
                            const bgColor = alertLevel === 'critical' ? 'bg-red-50' :
                                alertLevel === 'warning' ? 'bg-yellow-50' : 'bg-surface-card'

                            return (
                                <div
                                    key={zone.zone}
                                    className={`${bgColor} rounded-2xl shadow-lg p-6 border-2 ${borderColor}`}
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-bold text-text-title">{zone.name}</h3>
                                        {alertLevel === 'critical' && (
                                            <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                                                CRÍTICO
                                            </span>
                                        )}
                                        {alertLevel === 'warning' && (
                                            <span className="px-3 py-1 bg-yellow-500 text-white text-xs font-bold rounded-full">
                                                BAJO
                                            </span>
                                        )}
                                    </div>

                                    {/* Barra de progreso */}
                                    <div className="mb-4">
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-text-muted">Nivel Calculado</span>
                                            <span className="font-semibold text-text-title">{zone.percentage}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-3">
                                            <div
                                                className={`h-3 rounded-full transition-all ${alertLevel === 'critical' ? 'bg-red-500' :
                                                    alertLevel === 'warning' ? 'bg-yellow-500' : 'bg-primary'
                                                    }`}
                                                style={{ width: `${zone.percentage}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Datos detallados */}
                                    <div className="space-y-2 text-sm">
                                        {/* Porcentaje de Tuya */}
                                        <div className="flex justify-between p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                                            <span className="text-text-muted font-medium">📟 % Tuya (Sensor):</span>
                                            <span className="font-bold text-blue-600 dark:text-blue-400">{zone.sensorPercent?.toFixed(1) || 0}%</span>
                                        </div>
                                        {/* Porcentaje Calculado */}
                                        <div className="flex justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded">
                                            <span className="text-text-muted font-medium">🧮 % Real (Calculado):</span>
                                            <span className="font-bold text-primary">{zone.percentage}%</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-text-muted">Volumen Total:</span>
                                            <span className="font-semibold text-text-title">{zone.totalVolume} m³</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-text-muted">Capacidad Máx:</span>
                                            <span className="font-semibold text-text-title">{zone.maxVolume} m³</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-text-muted">Nivel de Agua:</span>
                                            <span className="font-semibold text-text-title">{zone.level_cm} cm</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-text-muted">Tanques:</span>
                                            <span className="font-semibold text-text-title">{zone.tankCount}</span>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </section>

                {/* Sección de Gráficos Históricos */}
                <section className="bg-surface-card rounded-2xl shadow-lg p-6 border border-border-card">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-text-title">Histórico de Consumo</h2>
                        <div className="flex gap-4">
                            <select
                                value={selectedZone}
                                onChange={(e) => setSelectedZone(e.target.value)}
                                className="px-4 py-2 border border-border-card rounded-lg focus:ring-2 focus:ring-primary"
                            >
                                <option value="all">Todas las zonas</option>
                                <option value="zonaBaja">Zona Baja</option>
                                <option value="zonaAlta">Zona Alta</option>
                                <option value="zonaCasa">Zona Casa</option>
                            </select>
                            <select
                                value={selectedDays}
                                onChange={(e) => setSelectedDays(parseInt(e.target.value))}
                                className="px-4 py-2 border border-border-card rounded-lg focus:ring-2 focus:ring-primary"
                            >
                                <option value="1">Últimas 24 horas</option>
                                <option value="7">Últimos 7 días</option>
                                <option value="30">Últimos 30 días</option>
                                <option value="90">Últimos 90 días</option>
                            </select>
                        </div>
                    </div>

                    {/* Tabla de datos históricos */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-surface-section">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-text-title">Fecha/Hora</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-text-title">Zona</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-text-title">Nivel (cm)</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-text-title">Volumen (m³)</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-text-title">% Llenado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-card">
                                {historicalData.length > 0 ? (
                                    historicalData.map((record, idx) => (
                                        <tr key={idx} className="hover:bg-surface-section">
                                            <td className="px-4 py-3 text-sm text-text-main">
                                                {new Date(record.timestamp).toLocaleString('es-CO')}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-text-main">
                                                {record.zone === 'zonaBaja' ? 'Zona Baja' :
                                                    record.zone === 'zonaAlta' ? 'Zona Alta' : 'Zona Casa'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-text-main">{record.level_cm} cm</td>
                                            <td className="px-4 py-3 text-sm text-text-main">{record.volume_m3} m³</td>
                                            <td className="px-4 py-3 text-sm">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getAlertLevel(record.percentage) === 'critical' ? 'bg-red-100 text-red-700' :
                                                    getAlertLevel(record.percentage) === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-green-100 text-green-700'
                                                    }`}>
                                                    {record.percentage}%
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-4 py-8 text-center text-text-muted">
                                            No hay datos históricos disponibles
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mensaje sobre detección de fugas */}
                    {historicalData.length > 0 && (
                        <div className="mt-6 p-4 bg-info-bg/10 border border-info-border rounded-lg">
                            <div className="flex items-start gap-3">
                                <span className="material-symbols-rounded text-info-bg">info</span>
                                <div>
                                    <h4 className="font-semibold text-text-title mb-1">Detección de Fugas</h4>
                                    <p className="text-sm text-text-muted">
                                        Los descensos abruptos de nivel en horas de no consumo (típicamente de 11 PM a 6 AM)
                                        pueden indicar posibles fugas. Revisa los patrones en el histórico para detectar anomalías.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </div>
    )
}
