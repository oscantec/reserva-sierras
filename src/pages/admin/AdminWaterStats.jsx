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
    const [allMeasurements, setAllMeasurements] = useState([])
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
                            name: 'Tanque Abajo',
                            type: 'conic',
                            tankCount: 3,
                            height: 23,
                            topRadius: 40,
                            bottomRadius: 30
                        },
                        zonaAlta: {
                            name: 'Tanque Arriba',
                            type: 'conic',
                            tankCount: 2,
                            height: 30,
                            topRadius: 37.5,
                            bottomRadius: 27.5
                        },
                        zonaCasa: {
                            name: 'Tanque Casa',
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
                // Guardar todas las mediciones para la tabla
                setAllMeasurements(data.measurements || [])

                // Procesar datos para gráfica de líneas
                const chartData = {}
                data.measurements.forEach(m => {
                    const date = new Date(m.timestamp).toLocaleString('es-CO', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })
                    if (!chartData[date]) {
                        chartData[date] = { date, timestamp: m.timestamp }
                    }
                    chartData[date][m.zone] = parseFloat(m.volume_m3)
                })
                setHistoricalData(Object.values(chartData).sort((a, b) =>
                    new Date(a.timestamp) - new Date(b.timestamp)
                ))
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

    // Prepare chart data
    const chartPoints = historicalData.slice(-48) // Last 48 measurements (24 hours at 30min intervals)
    const maxValue = Math.max(...chartPoints.flatMap(p => [p.zonaBaja || 0, p.zonaAlta || 0, p.zonaCasa || 0]), 10)
    const chartHeight = 300
    const chartWidth = 1000

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

            {/* Gráfica de Líneas - Histórico */}
            <div className="bg-surface-card border border-border-card rounded-xl p-6 shadow-sm mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-2xl font-bold">Histórico de Agua (últimas 48 horas)</h2>
                        <p className="text-sm text-text-muted">Mediciones cada 30 minutos</p>
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
                {chartPoints.length > 0 ? (
                    <div className="overflow-x-auto">
                        <svg viewBox={`0 0 ${chartWidth} ${chartHeight + 60}`} className="w-full" style={{ minWidth: '800px' }}>
                            {/* Grid lines */}
                            {[0, 1, 2, 3, 4, 5].map(i => {
                                const y = chartHeight - (i * chartHeight / 5)
                                return (
                                    <g key={i}>
                                        <line x1="60" y1={y} x2={chartWidth - 20} y2={y} stroke="#e5e7eb" strokeWidth="1" />
                                        <text x="50" y={y + 4} textAnchor="end" fontSize="12" fill="#6b7280">
                                            {(maxValue * i / 5).toFixed(1)}
                                        </text>
                                    </g>
                                )
                            })}

                            {/* Lines for each zone */}
                            {['zonaBaja', 'zonaAlta', 'zonaCasa'].map((zoneKey, zoneIdx) => {
                                const colors = ['#3db814', 'rgba(61, 184, 20, 0.7)', 'rgba(61, 184, 20, 0.4)']
                                const points = chartPoints.map((point, i) => {
                                    const x = 60 + (i * (chartWidth - 80) / (chartPoints.length - 1 || 1))
                                    const value = point[zoneKey] || 0
                                    const y = chartHeight - (value / maxValue * chartHeight)
                                    return { x, y, value }
                                }).filter(p => p.value > 0)

                                if (points.length === 0) return null

                                const pathData = points.map((p, i) =>
                                    `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
                                ).join(' ')

                                return (
                                    <g key={zoneKey}>
                                        <path d={pathData} fill="none" stroke={colors[zoneIdx]} strokeWidth="2.5" />
                                        {points.map((p, i) => (
                                            <circle key={i} cx={p.x} cy={p.y} r="4" fill={colors[zoneIdx]} />
                                        ))}
                                    </g>
                                )
                            })}

                            {/* X-axis labels */}
                            {chartPoints.map((point, i) => {
                                if (i % Math.ceil(chartPoints.length / 8) !== 0 && i !== chartPoints.length - 1) return null
                                const x = 60 + (i * (chartWidth - 80) / (chartPoints.length - 1 || 1))
                                return (
                                    <text key={i} x={x} y={chartHeight + 20} textAnchor="middle" fontSize="11" fill="#6b7280">
                                        {point.date.split(',')[0]}
                                    </text>
                                )
                            })}

                            {/* Axis labels */}
                            <text x="10" y={chartHeight / 2} textAnchor="middle" fontSize="12" fill="#6b7280" transform={`rotate(-90, 10, ${chartHeight / 2})`}>
                                Volumen (m³)
                            </text>
                        </svg>
                    </div>
                ) : (
                    <div className="text-center py-12 text-text-muted">
                        <span className="material-symbols-outlined text-5xl mb-4">show_chart</span>
                        <p>No hay datos históricos disponibles</p>
                        <p className="text-sm mt-2">Los datos se guardarán automáticamente cada 30 minutos</p>
                    </div>
                )}
            </div>

            {/* Tabla de Registros */}
            <div className="bg-surface-card border border-border-card rounded-xl shadow-sm overflow-hidden">
                <div className="bg-background-light px-6 py-4 border-b border-border-card">
                    <h2 className="text-xl font-bold">Registros de Mediciones</h2>
                    <p className="text-sm text-text-muted">Últimas 50 mediciones guardadas</p>
                </div>
                {allMeasurements.length > 0 ? (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-background-light border-b border-border-card">
                                    <tr>
                                        <th className="py-3 px-6 text-xs font-semibold uppercase tracking-wider text-text-secondary-light whitespace-nowrap">Fecha y Hora</th>
                                        <th className="py-3 px-6 text-xs font-semibold uppercase tracking-wider text-text-secondary-light whitespace-nowrap">Zona</th>
                                        <th className="py-3 px-6 text-xs font-semibold uppercase tracking-wider text-text-secondary-light whitespace-nowrap">Volumen (m³)</th>
                                        <th className="py-3 px-6 text-xs font-semibold uppercase tracking-wider text-text-secondary-light whitespace-nowrap">% Nivel</th>
                                        <th className="py-3 px-6 text-xs font-semibold uppercase tracking-wider text-text-secondary-light whitespace-nowrap">% Tuya</th>
                                        <th className="py-3 px-6 text-xs font-semibold uppercase tracking-wider text-text-secondary-light whitespace-nowrap">Nivel (cm)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#f0f4ef]">
                                    {allMeasurements.slice(0, 50).map((measurement, index) => {
                                        const zoneName = measurement.zone === 'zonaBaja' ? 'Tanque Abajo' :
                                            measurement.zone === 'zonaAlta' ? 'Tanque Arriba' : 'Tanque Casa'
                                        return (
                                            <tr key={index} className={`hover:bg-gray-100 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                                <td className="py-2.5 px-6 text-sm text-text-main-light">
                                                    {new Date(measurement.timestamp).toLocaleString('es-CO', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </td>
                                                <td className="py-2.5 px-6 text-sm text-text-main-light font-medium">{zoneName}</td>
                                                <td className="py-2.5 px-6 text-sm text-text-main-light">{parseFloat(measurement.volume_m3).toFixed(2)}</td>
                                                <td className="py-2.5 px-6 text-sm text-text-main-light">{parseFloat(measurement.level_percent).toFixed(2)}%</td>
                                                <td className="py-2.5 px-6 text-sm text-primary font-medium">{parseFloat(measurement.tuya_percent).toFixed(2)}%</td>
                                                <td className="py-2.5 px-6 text-sm text-text-main-light">{parseFloat(measurement.level_cm).toFixed(2)}</td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                        <div className="bg-icon-bg-primary px-6 py-3 border-t border-border-card flex justify-between items-center">
                            <span className="text-xs text-text-muted">Mostrando {Math.min(50, allMeasurements.length)} de {allMeasurements.length} registros</span>
                        </div>
                    </>
                ) : (
                    <div className="p-8 text-center text-text-muted">
                        <span className="material-symbols-outlined text-4xl mb-2">table_view</span>
                        <p>No hay registros disponibles</p>
                    </div>
                )}
            </div>
        </div>
    )
}
