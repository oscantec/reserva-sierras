import { useState, useEffect } from 'react'
import { processZoneDataFromPercent, calculateMaxConicVolume, calculateMaxCubicVolume } from '../../utils/waterCalculations'
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

    // Cargar configuración al inicio (SIN auto-refresh para evitar bucles)
    useEffect(() => {
        loadConfig()
        fetchHistoricalData()
    }, []) // Sin dependencias - solo se ejecuta una vez al montar

    const loadConfig = () => {
        try {
            const CONFIG_KEY = 'water_monitoring_config'
            const savedConfig = localStorage.getItem(CONFIG_KEY)

            // Auto-cleanup: Remove old config with bad names
            if (savedConfig) {
                const parsed = JSON.parse(savedConfig)
                if (parsed.tankConfigs?.zonaBaja?.name?.includes('Suministro Principal') ||
                    parsed.tankConfigs?.zonaAlta?.name?.includes('Reserva')) {
                    console.log('🧹 Limpiando configuración antigua...')
                    localStorage.removeItem(CONFIG_KEY)
                    // Will use default config below
                } else {
                    setConfig(parsed)
                    return
                }
            }

            // Default config if nothing is saved OR old config was cleaned
            // Using REALISTIC default values (approx 2000L tanks)
            setConfig({
                tankConfigs: {
                    zonaBaja: {
                        name: 'Tanque Abajo',
                        type: 'conic',
                        tankCount: 3,
                        height: 160,       // ~1.6m altura
                        topRadius: 80,     // ~1.6m diámetro
                        bottomRadius: 70   // ~1.4m diámetro base
                    },
                    zonaAlta: {
                        name: 'Tanque Arriba',
                        type: 'conic',
                        tankCount: 2,
                        height: 160,
                        topRadius: 80,
                        bottomRadius: 70
                    },
                    zonaCasa: {
                        name: 'Tanque Casa',
                        type: 'cubic',
                        tankCount: 1,
                        height: 200,    // 2m alto
                        length: 220,    // 2.2m largo
                        width: 215      // 2.15m ancho (~9.4m3 total)
                    }
                }
            })
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

            console.log('🔍 Credenciales Tuya obtenidas:', {
                clientId: tuya?.clientId ? '✅ Presente' : '❌ Faltante',
                clientSecret: tuya?.clientSecret ? '✅ Presente' : '❌ Faltante',
                deviceIdAbajo: tuya?.deviceIdAbajo || 'N/A',
                deviceIdArriba: tuya?.deviceIdArriba || 'N/A',
                deviceIdCasa: tuya?.deviceIdCasa || 'N/A'
            })

            if (!tuya || !tuya.clientId || !tuya.clientSecret) {
                console.error('Credenciales Tuya no configuradas - ve a /admin/conexiones y haz clic en Guardar')
                // Solo mostrar alert si no hay datos históricos (primera vez)
                if (allMeasurements.length === 0) {
                    alert('⚠️ Debes configurar las credenciales de Tuya en /admin/conexiones primero')
                }
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
            console.log(`💾 Guardando medición - Zona: ${zone}, % Calculado: ${data.percentage}%, % Tuya: ${tuyaPercent}%`)
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

    // Calculate max capacities for percentage calculation using imported shared functions
    const maxCapacities = {
        zonaBaja: config.tankConfigs.zonaBaja ?
            (config.tankConfigs.zonaBaja.type === 'conic' ?
                calculateMaxConicVolume(
                    config.tankConfigs.zonaBaja.height,
                    config.tankConfigs.zonaBaja.topRadius,
                    config.tankConfigs.zonaBaja.bottomRadius
                ) * config.tankConfigs.zonaBaja.tankCount
                : calculateMaxCubicVolume(
                    config.tankConfigs.zonaBaja.height,
                    config.tankConfigs.zonaBaja.length,
                    config.tankConfigs.zonaBaja.width
                ) * config.tankConfigs.zonaBaja.tankCount
            ) : 1,
        zonaAlta: config.tankConfigs.zonaAlta ?
            (config.tankConfigs.zonaAlta.type === 'conic' ?
                calculateMaxConicVolume(
                    config.tankConfigs.zonaAlta.height,
                    config.tankConfigs.zonaAlta.topRadius,
                    config.tankConfigs.zonaAlta.bottomRadius
                ) * config.tankConfigs.zonaAlta.tankCount
                : calculateMaxCubicVolume(
                    config.tankConfigs.zonaAlta.height,
                    config.tankConfigs.zonaAlta.length,
                    config.tankConfigs.zonaAlta.width
                ) * config.tankConfigs.zonaAlta.tankCount
            ) : 1,
        zonaCasa: config.tankConfigs.zonaCasa ?
            (config.tankConfigs.zonaCasa.type === 'conic' ?
                calculateMaxConicVolume(
                    config.tankConfigs.zonaCasa.height,
                    config.tankConfigs.zonaCasa.topRadius,
                    config.tankConfigs.zonaCasa.bottomRadius
                ) * config.tankConfigs.zonaCasa.tankCount
                : calculateMaxCubicVolume(
                    config.tankConfigs.zonaCasa.height,
                    config.tankConfigs.zonaCasa.length,
                    config.tankConfigs.zonaCasa.width
                ) * config.tankConfigs.zonaCasa.tankCount
            ) : 1
    }

    const totalMaxCapacity = maxCapacities.zonaBaja + maxCapacities.zonaAlta + maxCapacities.zonaCasa

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
                        onClick={() => window.location.href = '/admin/agua/config'}
                        className="flex items-center gap-2 px-4 py-2 bg-surface-card hover:bg-surface-card-hover border border-border-card rounded-lg transition-colors"
                    >
                        <span className="material-symbols-outlined text-xl">settings</span>
                        <span>Configuración</span>
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
                {currentData?.zones?.length > 0 ? (
                    // Mostrar datos en tiempo real
                    currentData.zones.map((zone, idx) => {
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
                    })
                ) : (
                    // Fallback: Mostrar datos del último registro histórico por zona
                    (() => {
                        const zoneNames = { zonaBaja: 'Tanque Abajo', zonaAlta: 'Tanque Arriba', zonaCasa: 'Tanque Casa' }
                        const tankCounts = { zonaBaja: 3, zonaAlta: 2, zonaCasa: 1 }
                        const zones = ['zonaBaja', 'zonaAlta', 'zonaCasa']

                        // Obtener el último dato de cada zona
                        const latestByZone = {}
                        allMeasurements.forEach(m => {
                            if (!latestByZone[m.zone] || new Date(m.timestamp) > new Date(latestByZone[m.zone].timestamp)) {
                                latestByZone[m.zone] = m
                            }
                        })

                        return zones.map((zoneKey, idx) => {
                            const data = latestByZone[zoneKey]
                            const maxCap = maxCapacities[zoneKey] || 1

                            if (!data) {
                                return (
                                    <div key={idx} className="bg-surface-card border border-border-card rounded-xl p-4 shadow-sm">
                                        <h3 className="text-base font-bold mb-3">{zoneNames[zoneKey]}</h3>
                                        <div className="text-center py-4 text-text-muted">
                                            <span className="material-symbols-outlined text-3xl mb-2">water_drop</span>
                                            <p className="text-sm">Sin datos</p>
                                            <p className="text-xs">Haz clic en "Actualizar Ahora"</p>
                                        </div>
                                    </div>
                                )
                            }

                            const percent = parseFloat(data.percentage || 0)
                            const volume = parseFloat(data.volume_m3 || 0)

                            return (
                                <div key={idx} className="bg-surface-card border border-border-card rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-base font-bold">{zoneNames[zoneKey]}</h3>
                                        <span className="text-xs text-text-muted bg-icon-bg-primary px-2 py-1 rounded">Último registro</span>
                                    </div>

                                    {/* Nivel con Barra */}
                                    <div className="mb-3">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs font-medium text-text-muted">Nivel</span>
                                            <span className="text-xl font-bold text-primary">{percent.toFixed(2)}%</span>
                                        </div>
                                        <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary transition-all duration-500"
                                                style={{ width: `${Math.min(percent, 100)}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Volumen */}
                                    <div className="flex items-center justify-between py-1.5 border-t border-border-card">
                                        <span className="text-xs text-text-muted">Volumen:</span>
                                        <span className="font-bold text-sm">{volume.toFixed(2)} m³</span>
                                    </div>

                                    {/* Capacidad */}
                                    <div className="flex items-center justify-between py-1.5">
                                        <span className="text-xs text-text-muted">Capacidad:</span>
                                        <span className="font-medium text-sm">{maxCap.toFixed(2)} m³</span>
                                    </div>

                                    {/* Tanques */}
                                    <div className="flex items-center justify-between py-1.5">
                                        <span className="text-xs text-text-muted">Tanques:</span>
                                        <span className="font-medium text-sm">{tankCounts[zoneKey]}</span>
                                    </div>

                                    {/* Última actualización */}
                                    <div className="mt-2 pt-2 border-t border-border-card">
                                        <p className="text-xs text-text-muted text-center">
                                            {new Date(data.timestamp).toLocaleString('es-CO', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            )
                        })
                    })()
                )}
            </div>

            {/* Gráfica de Líneas - Histórico */}
            <div className="bg-surface-card border border-border-card rounded-xl p-6 shadow-sm mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-2xl font-bold">Histórico de Agua (últimos 7 días)</h2>
                        <p className="text-sm text-text-muted">Mediciones automáticas cada 5 minutos</p>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                        <span className="flex items-center gap-1">
                            <span className="w-3 h-3 rounded-full bg-black"></span> Tanque Abajo
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="w-3 h-3 rounded-full bg-gray-600"></span> Tanque Arriba
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="w-3 h-3 rounded-full bg-gray-400"></span> Tanque Casa
                        </span>
                        <span className="flex items-center gap-1 ml-4 font-bold">
                            <span className="w-4 h-4 rounded-full bg-primary"></span> TOTAL
                        </span>
                    </div>
                </div>
                {chartPoints.length > 0 ? (
                    <div className="overflow-x-auto">
                        <svg viewBox={`0 0 ${chartWidth} ${chartHeight + 80}`} className="w-full" style={{ minWidth: '800px' }}>
                            {/* Grid lines */}
                            {[0, 20, 40, 60, 80, 100].map(i => {
                                const y = 20 + (chartHeight - 20) - (i * (chartHeight - 20) / 100)
                                return (
                                    <g key={i}>
                                        <line x1="60" y1={y} x2={chartWidth - 20} y2={y} stroke="#e5e7eb" strokeWidth="1" />
                                        <text x="50" y={y + 4} textAnchor="end" fontSize="12" fill="#6b7280">
                                            {i}%
                                        </text>
                                    </g>
                                )
                            })}

                            {/* Lines for individual zones - solid black with different patterns */}
                            {[{ key: 'zonaBaja', dash: 'none', width: 2 },
                            { key: 'zonaAlta', dash: '8,4', width: 2 },
                            { key: 'zonaCasa', dash: '2,2', width: 2 }].map((zone, zoneIdx) => {
                                const points = chartPoints.map((point, i) => {
                                    const x = 60 + (i * (chartWidth - 80) / (chartPoints.length - 1 || 1))
                                    const value = point[zone.key] || 0
                                    const maxCap = maxCapacities[zone.key]
                                    const percent = maxCap > 0 ? (value / maxCap) * 100 : 0

                                    // Use same Y calculation as grid
                                    const y = 20 + (chartHeight - 20) - (percent * (chartHeight - 20) / 100)
                                    return { x, y, percent }
                                }).filter(p => p.percent > 0)

                                if (points.length === 0) return null

                                const pathData = points.map((p, i) =>
                                    `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
                                ).join(' ')

                                return (
                                    <g key={zone.key}>
                                        <path
                                            d={pathData}
                                            fill="none"
                                            stroke="#000000"
                                            strokeWidth={zone.width}
                                            strokeDasharray={zone.dash}
                                        />
                                        {points.map((p, i) => (
                                            <circle key={i} cx={p.x} cy={p.y} r="3" fill="#000000" />
                                        ))}
                                    </g>
                                )
                            })}

                            {/* TOTAL line - thick green */}
                            {(() => {
                                const totalPoints = chartPoints.map((point, i) => {
                                    const x = 60 + (i * (chartWidth - 80) / (chartPoints.length - 1 || 1))
                                    const total = (point.zonaBaja || 0) + (point.zonaAlta || 0) + (point.zonaCasa || 0)
                                    const totalCapacity = Object.values(maxCapacities).reduce((a, b) => a + b, 0)
                                    const percent = totalCapacity > 0 ? (total / totalCapacity) * 100 : 0

                                    // Use same Y calculation as grid
                                    const y = 20 + (chartHeight - 20) - (percent * (chartHeight - 20) / 100)
                                    return { x, y, percent }
                                }).filter(p => p.percent > 0)

                                if (totalPoints.length === 0) return null

                                const pathData = totalPoints.map((p, i) =>
                                    `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
                                ).join(' ')

                                return (
                                    <g>
                                        <path d={pathData} fill="none" stroke="#3db814" strokeWidth="4" />
                                        {totalPoints.map((p, i) => (
                                            <circle key={i} cx={p.x} cy={p.y} r="5" fill="#3db814" />
                                        ))}
                                    </g>
                                )
                            })()}

                            {/* X-axis labels */}
                            {chartPoints.map((point, i) => {
                                if (i % Math.ceil(chartPoints.length / 8) !== 0 && i !== chartPoints.length - 1) return null
                                const x = 60 + (i * (chartWidth - 80) / (chartPoints.length - 1 || 1))
                                return (
                                    <text key={i} x={x} y={chartHeight + 40} textAnchor="middle" fontSize="11" fill="#6b7280">
                                        {point.date.split(',')[0]}
                                    </text>
                                )
                            })}

                            {/* Axis labels */}
                            <text x="10" y={chartHeight / 2} textAnchor="middle" fontSize="12" fill="#6b7280" fontWeight="bold" transform={`rotate(-90, 10, ${chartHeight / 2})`}>
                                Porcentaje (%)
                            </text>
                        </svg>
                    </div>
                ) : (
                    <div className="text-center py-12 text-text-muted">
                        <span className="material-symbols-outlined text-5xl mb-4">show_chart</span>
                        <p>No hay datos históricos disponibles</p>
                        <p className="text-sm mt-2">Los datos se guardan automáticamente cada 5 minutos (:00, :05, :10...)</p>
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
                                        <th className="py-3 px-6 text-xs font-semibold uppercase tracking-wider text-text-secondary-light whitespace-nowrap text-center">Tanque Abajo<br /><span className="text-[10px] font-normal normal-case opacity-70">Vol (m³) / % Calc</span></th>
                                        <th className="py-3 px-6 text-xs font-semibold uppercase tracking-wider text-text-secondary-light whitespace-nowrap text-center">Tanque Arriba<br /><span className="text-[10px] font-normal normal-case opacity-70">Vol (m³) / % Calc</span></th>
                                        <th className="py-3 px-6 text-xs font-semibold uppercase tracking-wider text-text-secondary-light whitespace-nowrap text-center">Tanque Casa<br /><span className="text-[10px] font-normal normal-case opacity-70">Vol (m³) / % Calc</span></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#f0f4ef]">
                                    {(() => {
                                        // Group measurements by rounded timestamp (to nearest minute)
                                        const grouped = allMeasurements.reduce((acc, curr) => {
                                            const date = new Date(curr.timestamp)
                                            date.setSeconds(0)
                                            date.setMilliseconds(0)
                                            const key = date.toISOString()

                                            if (!acc[key]) acc[key] = { timestamp: key, readings: {} }
                                            acc[key].readings[curr.zone] = {
                                                volume: parseFloat(curr.volume_m3),
                                                percent: parseFloat(curr.level_percent || 0) // Prefer calculated percent
                                            }
                                            return acc
                                        }, {})

                                        const sortedRows = Object.values(grouped).sort((a, b) =>
                                            new Date(b.timestamp) - new Date(a.timestamp)
                                        )

                                        return sortedRows.slice(0, 50).map((row, index) => {
                                            // Lógica de corrección: Si el porcentaje es 0 pero hay volumen, lo calculamos
                                            const getFixedData = (data, zoneKey) => {
                                                if (!data) return null
                                                let { volume, percent } = data

                                                // Si el porcentaje es 0 o inexistente, pero tenemos volumen y capacidad maxima conocida
                                                if ((!percent || percent <= 0.1) && volume > 0) {
                                                    const maxCap = maxCapacities[zoneKey]
                                                    if (maxCap > 0) {
                                                        percent = (volume / maxCap) * 100
                                                    }
                                                }
                                                return { ...data, percent }
                                            }

                                            const baja = getFixedData(row.readings.zonaBaja, 'zonaBaja')
                                            const alta = getFixedData(row.readings.zonaAlta, 'zonaAlta')
                                            const casa = getFixedData(row.readings.zonaCasa, 'zonaCasa')

                                            const CellContent = ({ data }) => {
                                                if (!data) return <span className="text-gray-300">-</span>
                                                return (
                                                    <div className="flex flex-col items-center">
                                                        <span className="font-bold text-gray-900">{data.volume.toFixed(2)} m³</span>
                                                        <span className="text-xs font-bold text-black">
                                                            {data.percent.toFixed(1)}%
                                                        </span>
                                                    </div>
                                                )
                                            }

                                            return (
                                                <tr key={index} className={`hover:bg-gray-100 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                                    <td className="py-3 px-6 text-sm text-text-main-light font-medium whitespace-nowrap">
                                                        {new Date(row.timestamp).toLocaleString('es-CO', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </td>
                                                    <td className="py-3 px-6 text-center border-l border-r border-gray-100">
                                                        <CellContent data={baja} />
                                                    </td>
                                                    <td className="py-3 px-6 text-center border-r border-gray-100">
                                                        <CellContent data={alta} />
                                                    </td>
                                                    <td className="py-3 px-6 text-center">
                                                        <CellContent data={casa} />
                                                    </td>
                                                </tr>
                                            )
                                        })
                                    })()}
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
