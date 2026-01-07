import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
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
                    level_percent: parseFloat(data.levelPercent),
                    tuya_percent: parseFloat(tuyaPercent),
                    level_cm: parseFloat(data.totalHeight)
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
                    const date = new Date(m.timestamp).toLocaleDateString('es-CO', {
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
            <div className="bg-gradient-to-br from-primary to-btn-primary-hover text-white rounded-xl p-8 mb-6 shadow-lg">
                <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-6xl">water_drop</span>
                    <div>
                        <h2 className="text-xl opacity-90">Agua Total Disponible</h2>
                        <p className="text-sm opacity-75">En todo el complejo</p>
                        <p className="text-5xl font-bold mt-2">{totalWater.toFixed(2)} m³</p>
                        {currentData && (
                            <p className="text-sm opacity-75 mt-2">
                                Última actualización: {new Date(currentData.timestamp).toLocaleString('es-CO')}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Estado por Zona */}
            <h2 className="text-2xl font-bold mb-4">Estado por Zona</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {currentData?.zones.map((zone, idx) => {
                    const percent = parseFloat(zone.percentage)
                    const tuyaPercent = parseFloat(zone.sensorPercent)

                    return (
                        <div key={idx} className="bg-surface-card border border-border-card rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                            <h3 className="text-lg font-bold mb-4">{zone.name}</h3>

                            {/* Nivel Calculado con Barra */}
                            <div className="mb-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-text-muted">Nivel Calculado</span>
                                    <span className="text-2xl font-bold text-primary">{percent.toFixed(2)}%</span>
                                </div>
                                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary transition-all duration-500"
                                        style={{ width: `${percent}%` }}
                                    />
                                </div>
                            </div>

                            {/* Tuya % */}
                            <div className="flex items-center justify-between py-2 border-t border-border-card">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-lg text-primary">sensors</span>
                                    <span className="text-sm text-text-muted">% Tuya (Sensor):</span>
                                </div>
                                <span className="font-medium" style={{ color: 'rgb(59, 130, 246)' }}>{tuyaPercent.toFixed(2)}%</span>
                            </div>

                            {/* Volumen Total */}
                            <div className="flex items-center justify-between py-2">
                                <span className="text-sm text-text-muted">Volumen Total:</span>
                                <span className="font-bold">{parseFloat(zone.totalVolume).toFixed(2)} m³</span>
                            </div>

                            {/* Capacidad Máx */}
                            <div className="flex items-center justify-between py-2">
                                <span className="text-sm text-text-muted">Capacidad Máx:</span>
                                <span className="font-medium">{parseFloat(zone.maxVolume).toFixed(2)} m³</span>
                            </div>

                            {/* Nivel de Agua */}
                            <div className="flex items-center justify-between py-2">
                                <span className="text-sm text-text-muted">Nivel de Agua:</span>
                                <span className="font-medium">{parseFloat(zone.level_cm).toFixed(2)} cm</span>
                            </div>

                            {/* Tanques */}
                            <div className="flex items-center justify-between py-2">
                                <span className="text-sm text-text-muted">Tanques:</span>
                                <span className="font-medium">{zone.tankCount}</span>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Histórico de Consumo */}
            <div className="bg-surface-card border border-border-card rounded-xl p-6 shadow-sm">
                <h2 className="text-2xl font-bold mb-4">Histórico de Consumo (7 días)</h2>
                {historicalData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={historicalData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis label={{ value: 'm³', angle: -90, position: 'insideLeft' }} />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="zonaBaja" stroke="#3b82f6" name="Tanque Abajo" strokeWidth={2} />
                            <Line type="monotone" dataKey="zonaAlta" stroke="#10b981" name="Tanque Arriba" strokeWidth={2} />
                            <Line type="monotone" dataKey="zonaCasa" stroke="#8b5cf6" name="Tanque Casa" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
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
