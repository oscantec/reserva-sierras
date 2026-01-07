import { useState, useEffect } from 'react'
import { processZoneDataFromPercent } from '../../utils/waterCalculations'
import { getTuyaCredentials } from '../../utils/tuyaConfig'

/**
 * Dashboard de Estadísticas de Agua
 * Muestra datos en tiempo real, históricos con gráficas
 */
export default function AdminWaterStats() {
    const [config, setConfig] = useState(null)
    const [currentData, setCurrentData] = useState(null)
    const [historicalData, setHistoricalData] = useState([])
    const [refreshing, setRefreshing] = useState(false)
    const [showConfig, setShowConfig] = useState(false)

    // Cargar configuración de tanques
    useEffect(() => {
        loadConfig()
        fetchHistoricalData()
        const interval = setInterval(() => {
            fetchSensorData()
        }, 1800000) // Cada 30 minutos
        return () => clearInterval(interval)
    }, [])

    const loadConfig = () => {
        try {
            const CONFIG_KEY = 'water_monitoring_config'
            const savedConfig = localStorage.getItem(CONFIG_KEY)
            if (savedConfig) {
                const parsed = JSON.parse(savedConfig)
                setConfig(parsed)
            } else {
                // Default config if nothing is saved
                setConfig({
                    tankConfigs: {
                        zonaBaja: {
                            name: 'Zona Baja - Tanque Abajo',
                            type: 'conic',
                            tankCount: 3,
                            height: 23,
                            topRadius: 40,
                            bottomRadius: 30
                        },
                        zonaAlta: {
                            name: 'Zona Alta - Tanque Arriba',
                            type: 'conic',
                            tankCount: 2,
                            height: 30,
                            topRadius: 37.5,
                            bottomRadius: 27.5
                        },
                        zonaCasa: {
                            name: 'Zona Casa - Tanque Casa',
                            type: 'cubic',
                            tankCount: 1,
                            height: 25,
                            length: 50,
                            width: 50
                        }
                    }
                })
            }
        } catch (error) {
            console.error('Error loading config:', error)
        }
    }

    // Fetch datos de sensores Tuya
    const fetchSensorData = async () => {
        if (!config || !config.tankConfigs) {
            console.error('Configuración de tanques no disponible')
            return
        }

        setRefreshing(true)
        try {
            const tuya = await getTuyaCredentials()

            if (!tuya || !tuya.clientId || !tuya.clientSecret) {
                console.error('Credenciales Tuya no configuradas')
                alert('⚠️ Debes configurar las credenciales de Tuya en /admin/conexiones primero')
                setRefreshing(false)
                return
            }

            const deviceIds = [tuya.deviceIdAbajo, tuya.deviceIdArriba, tuya.deviceIdCasa].filter(Boolean).join(',')

            console.log('🔍 Consultando sensores Tuya...', { clientId: tuya.clientId, deviceIds })

            const response = await fetch(`/api/water-tuya?clientId=${tuya.clientId}&clientSecret=${tuya.clientSecret}&deviceIds=${deviceIds}`)
            const data = await response.json()

            console.log('✅ Respuesta de Tuya:', data)

            if (data.success && data.sensors) {
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
                        saveMeasurement(zone, zoneData, sensor.liquidLevelPercent)
                    }
                })

                setCurrentData(processedData)
            } else {
                console.error('Error en respuesta de Tuya:', data)
            }
        } catch (error) {
            console.error('Error obteniendo datos de sensores:', error)
        }
        setRefreshing(false)
    }

    // Guardar medición en base de datos
    const saveMeasurement = async (zone, data, tuyaPercent) => {
        try {
            await fetch('/api/water-measurements', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    zone,
                    volume_m3: parseFloat(data.totalVolume),
                    level_percent: parseFloat(data.percentage),
                    tuya_percent: parseFloat(tuyaPercent),
                    level_cm: parseFloat(data.level_cm)
                })
            })
            // Actualizar histórico después de guardar
            fetchHistoricalData()
        } catch (error) {
            console.error('Error guardando medición:', error)
        }
    }

    // Obtener datos históricos
    const fetchHistoricalData = async () => {
        try {
            const response = await fetch('/api/water-measurements?days=7')
            const data = await response.json()

            if (data.success) {
                // Procesar datos para gráfica
                const chartData = {}
                data.measurements.forEach(m => {
                    const date = new Date(m.timestamp).toLocaleString('es-CO', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })
                    if (!chartData[date]) {
                        chartData[date] = { date }
                    }
                    chartData[date][m.zone] = parseFloat(m.volume_m3)
                })
                setHistoricalData(Object.values(chartData))
            }
        } catch (error) {
            console.error('Error loading historical data:', error)
        }
    }

    // Calcular total de agua disponible
    const getTotalWater = () => {
        if (!currentData || !currentData.zones) return 0
        return currentData.zones.reduce((sum, zone) => sum + parseFloat(zone.totalVolume), 0)
    }

    if (!config) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <span className="material-symbols-outlined text-6xl text-primary animate-spin">sync</span>
                    <p className="mt-4 text-text-muted">Cargando configuración...</p>
                </div>
            </div>
        )
    }

    const totalWater = getTotalWater()

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-text-title">Estadísticas de Agua</h1>
                    <p className="text-text-muted">Monitoreo en tiempo real del sistema de agua</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowConfig(!showConfig)}
                        className="flex items-center gap-2 px-4 py-2 bg-surface-card hover:bg-surface-card-hover border border-border-card rounded-lg transition-colors"
                    >
                        <span className="material-symbols-outlined text-xl">settings</span>
                        <span>Configurar Dimensiones</span>
                    </button>
                    <button
                        onClick={fetchSensorData}
                        disabled={refreshing}
                        className="flex items-center gap-2 px-6 py-2 bg-primary hover:bg-btn-primary-hover text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                        <span className={`material-symbols-outlined ${refreshing ? 'animate-spin' : ''}`}>refresh</span>
                        <span>Actualizar Ahora</span>
                    </button>
                </div>
            </div>

            {/* Modal de Configuración */}
            {showConfig && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowConfig(false)}>
                    <div className="bg-surface-card rounded-xl p-6 max-w-2xl w-full mx-4" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-bold">Configuración de Tanques</h2>
                            <button onClick={() => setShowConfig(false)} className="material-symbols-outlined text-2xl hover:text-primary">close</button>
                        </div>
                        <p className="text-text-muted mb-4">Accede a /admin/agua/config para modificar las dimensiones</p>
                        <button
                            onClick={() => { window.location.href = '/admin/agua/config'; }}
                            className="w-full py-3 bg-primary hover:bg-btn-primary-hover text-white rounded-lg font-medium"
                        >
                            Ir a Configuración
                        </button>
                    </div>
                </div>
            )}

            {/* Card de Agua Total */}
            <div className="bg-gradient-to-br from-primary to-btn-primary-hover text-white rounded-xl p-6 mb-6 shadow-lg">
                <div className="flex items-center justify-between gap-6">
                    {/* Left: Icon and main info */}
                    <div className="flex items-center gap-4">
                        <span className="material-symbols-outlined text-5xl">water_drop</span>
                        <div>
                            <h2 className="text-lg opacity-90">Agua Total Disponible</h2>
                            <p className="text-xs opacity-75">En todo el complejo</p>
                            <p className="text-4xl font-bold mt-1">{totalWater.toFixed(2)} m³</p>
                            {currentData && (
                                <p className="text-xs opacity-75 mt-1">
                                    Última actualización: {new Date(currentData.timestamp).toLocaleString('es-CO')}
                                </p>
                            )}
                        </div>
                    </div>
                    {/* Right: Stats */}
                    {currentData && (
                        <div className="text-right">
                            <div className="mb-2">
                                <p className="text-xs opacity-75">Capacidad Máxima</p>
                                <p className="text-lg font-bold">
                                    {currentData.zones.reduce((sum, zone) => sum + parseFloat(zone.maxVolume), 0).toFixed(2)} m³
                                </p>
                            </div>
                            <div>
                                <p className="text-xs opacity-75">Porcentaje Actual</p>
                                <p className="text-lg font-bold">
                                    {((totalWater / currentData.zones.reduce((sum, zone) => sum + parseFloat(zone.maxVolume), 0)) * 100).toFixed(1)}%
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Estado por Zona */}
            <h2 className="text-2xl font-bold mb-4">Estado por Zona</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {currentData?.zones.map((zone, idx) => {
                    const percent = parseFloat(zone.percentage)
                    const tuyaPercent = parseFloat(zone.sensorPercent)

                    return (
                        <div key={idx} className="bg-surface-card border border-border-card rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                            <h3 className="text-base font-bold mb-3">{zone.name}</h3>

                            {/* Nivel Calculado con Barra */}
                            <div className="mb-3">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-medium text-text-muted">Nivel Calculado</span>
                                    <span className="text-xl font-bold text-primary">{percent.toFixed(2)}%</span>
                                </div>
                                <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary transition-all duration-500"
                                        style={{ width: `${percent}%` }}
                                    />
                                </div>
                            </div>

                            {/* Tuya % */}
                            <div className="flex items-center justify-between py-1.5 border-t border-border-card">
                                <div className="flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-base text-primary">sensors</span>
                                    <span className="text-xs text-text-muted">% Tuya (Sensor):</span>
                                </div>
                                <span className="font-medium text-primary text-sm">{tuyaPercent.toFixed(2)}%</span>
                            </div>

                            {/* Volumen Total */}
                            <div className="flex items-center justify-between py-1.5">
                                <span className="text-xs text-text-muted">Volumen Total:</span>
                                <span className="font-bold text-sm">{parseFloat(zone.totalVolume).toFixed(2)} m³</span>
                            </div>

                            {/* Capacidad Máx */}
                            <div className="flex items-center justify-between py-1.5">
                                <span className="text-xs text-text-muted">Capacidad Máx:</span>
                                <span className="font-medium text-sm">{parseFloat(zone.maxVolume).toFixed(2)} m³</span>
                            </div>

                            {/* Nivel de Agua */}
                            <div className="flex items-center justify-between py-1.5">
                                <span className="text-xs text-text-muted">Nivel de Agua:</span>
                                <span className="font-medium text-sm">{parseFloat(zone.level_cm).toFixed(2)} cm</span>
                            </div>

                            {/* Tanques */}
                            <div className="flex items-center justify-between py-1.5">
                                <span className="text-xs text-text-muted">Tanques:</span>
                                <span className="font-medium text-sm">{zone.tankCount}</span>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Histórico de Consumo */}
            <div className="bg-surface-card border border-border-card rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-2xl font-bold">Histórico de Agua (últimas 48 horas)</h2>
                        <p className="text-sm text-text-muted">Mediciones automáticas cada 30 minutos</p>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                        <span className="flex items-center gap-1">
                            <span className="w-3 h-3 rounded-full bg-primary"></span> Tanque Abajo
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="w-3 h-3 rounded-full bg-primary opacity-70"></span> Tanque Arriba
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="w-3 h-3 rounded-full bg-primary opacity-40"></span> Tanque Casa
                        </span>
                    </div>
                </div>
                {historicalData.length > 0 ? (
                    <div className="space-y-3">
                        {historicalData.slice(-20).reverse().map((entry, idx) => {
                            const maxVolume = Math.max(
                                parseFloat(entry.zonaBaja || 0),
                                parseFloat(entry.zonaAlta || 0),
                                parseFloat(entry.zonaCasa || 0),
                                5 // Minimum scale
                            )
                            return (
                                <div key={idx} className="flex items-center gap-3">
                                    <span className="w-24 text-xs font-medium text-text-muted text-right">{entry.date}</span>
                                    <div className="flex-1 flex items-center gap-2">
                                        {/* Zona Baja */}
                                        {entry.zonaBaja && (
                                            <div className="flex-1">
                                                <div className="h-7 bg-surface-light rounded-lg overflow-hidden relative">
                                                    <div className="absolute inset-y-0 left-0 bg-primary rounded-lg flex items-center justify-end pr-2"
                                                        style={{ width: `${Math.max((parseFloat(entry.zonaBaja) / maxVolume) * 100, 10)}%` }}>
                                                        <span className="text-xs font-bold text-white drop-shadow">{parseFloat(entry.zonaBaja).toFixed(2)} m³</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {/* Zona Alta */}
                                        {entry.zonaAlta && (
                                            <div className="flex-1">
                                                <div className="h-7 bg-surface-light rounded-lg overflow-hidden relative">
                                                    <div className="absolute inset-y-0 left-0 bg-primary opacity-70 rounded-lg flex items-center justify-end pr-2"
                                                        style={{ width: `${Math.max((parseFloat(entry.zonaAlta) / maxVolume) * 100, 10)}%` }}>
                                                        <span className="text-xs font-bold text-white drop-shadow">{parseFloat(entry.zonaAlta).toFixed(2)} m³</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {/* Zona Casa */}
                                        {entry.zonaCasa && (
                                            <div className="flex-1">
                                                <div className="h-7 bg-surface-light rounded-lg overflow-hidden relative">
                                                    <div className="absolute inset-y-0 left-0 bg-primary opacity-40 rounded-lg flex items-center justify-end pr-2"
                                                        style={{ width: `${Math.max((parseFloat(entry.zonaCasa) / maxVolume) * 100, 10)}%` }}>
                                                        <span className="text-xs font-bold text-white drop-shadow">{parseFloat(entry.zonaCasa).toFixed(2)} m³</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div className="text-center py-12 text-text-muted">
                        <span className="material-symbols-outlined text-5xl mb-4">show_chart</span>
                        <p>No hay datos históricos disponibles</p>
                        <p className="text-sm mt-2">Los datos se guardarán automáticamente cada 30 minutos</p>
                    </div>
                )}
            </div>
        </div>
    )
}
