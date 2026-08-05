import { useState, useEffect } from 'react'
import { processZoneDataFromPercent, computeZoneGrouped, geomMaxPerTank } from '../../utils/waterCalculations'
import { getTuyaCredentials } from '../../utils/tuyaConfig'

// Configuración por defecto de "Valores Reales" (medidas físicas exactas).
// Cada zona tiene uno o varios GRUPOS de tanques (distinta forma/altura).
// Diámetros / largo / ancho / diámetro en cm, altura máxima del líquido en m.
const REAL_CONFIG_VERSION = 2
const DEFAULT_REAL_CONFIG = {
    zonaBaja: {
        name: 'Tanque Abajo',
        groups: [
            { shape: 'cone', diameterBottom: 115.5, diameterTop: 140.5, maxHeight: 1.55, count: 3 },
            { shape: 'cylinder', diameter: 137.3, maxHeight: 1.35, count: 2 }, // tanques "botella" (~2 m³ c/u)
        ],
    },
    zonaAlta: {
        name: 'Tanque Arriba',
        groups: [
            { shape: 'cone', diameterBottom: 115.5, diameterTop: 140.5, maxHeight: 1.45, count: 2 },
        ],
    },
    zonaCasa: {
        name: 'Tanque Casa',
        groups: [
            { shape: 'rect', length: 280, width: 240, maxHeight: 1.35, count: 1 },
        ],
    },
}

const REAL_CONFIG_KEY = 'realTanksConfig'

// Etiquetas de forma para la UI
const SHAPE_LABELS = { cone: 'Cónico', rect: 'Rectangular', cylinder: 'Cilindro (botella)' }

// Series de la gráfica histórica (colores distinguibles por zona)
const CHART_SERIES = [
    { key: 'zonaBaja', label: 'Abajo', color: '#2563eb' },   // azul
    { key: 'zonaAlta', label: 'Arriba', color: '#f59e0b' },  // ámbar
    { key: 'zonaCasa', label: 'Casa', color: '#8b5cf6' },    // violeta
]
const CHART_TOTAL_COLOR = '#16a34a' // verde

// Carga la config de "Valores Reales". Usa la guardada solo si es de la versión
// actual (formato con grupos); de lo contrario aplica los valores por defecto.
function loadRealConfig() {
    try {
        const saved = JSON.parse(localStorage.getItem(REAL_CONFIG_KEY) || '{}')
        if (saved.__v === REAL_CONFIG_VERSION && saved.zones) {
            const merged = {}
            for (const key of Object.keys(DEFAULT_REAL_CONFIG)) {
                merged[key] = saved.zones[key] || DEFAULT_REAL_CONFIG[key]
            }
            return merged
        }
    } catch { /* ignore */ }
    return DEFAULT_REAL_CONFIG
}

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
    // "Valores Reales": config editable de medidas físicas y editor desplegable
    const [realConfig, setRealConfig] = useState(loadRealConfig)
    const [showRealEditor, setShowRealEditor] = useState(false)
    const [savingReal, setSavingReal] = useState(false)
    const [realSaved, setRealSaved] = useState(false)
    // Gráfica histórica: interactividad
    const [hoverIdx, setHoverIdx] = useState(null)
    const [hiddenSeries, setHiddenSeries] = useState({})
    const toggleSeries = (key) => setHiddenSeries(prev => ({ ...prev, [key]: !prev[key] }))

    // Guarda en localStorage con el envoltorio de versión ({__v, zones})
    const persistRealLocal = (cfg) => {
        try { localStorage.setItem(REAL_CONFIG_KEY, JSON.stringify({ __v: REAL_CONFIG_VERSION, zones: cfg })) } catch { /* ignore */ }
    }

    // Valores por defecto al elegir una forma de tanque
    const shapeDefaults = (shape) => {
        if (shape === 'cone') return { shape, diameterBottom: 115.5, diameterTop: 140.5 }
        if (shape === 'cylinder') return { shape, diameter: 137.3 }
        return { shape, length: 200, width: 200 } // rect
    }

    // Actualiza un campo de un grupo de tanques (estado + caché local instantáneo)
    const updateGroup = (zoneKey, groupIdx, field, value) => {
        setRealConfig(prev => {
            const zone = prev[zoneKey]
            const groups = zone.groups.map((g, i) => i === groupIdx ? { ...g, [field]: value } : g)
            const next = { ...prev, [zoneKey]: { ...zone, groups } }
            persistRealLocal(next)
            return next
        })
        setRealSaved(false)
    }

    // Cambia la forma de un grupo, aplicando medidas por defecto (conserva altura y cantidad)
    const setGroupShape = (zoneKey, groupIdx, shape) => {
        setRealConfig(prev => {
            const zone = prev[zoneKey]
            const groups = zone.groups.map((g, i) => i === groupIdx
                ? { ...shapeDefaults(shape), maxHeight: g.maxHeight, count: g.count }
                : g)
            const next = { ...prev, [zoneKey]: { ...zone, groups } }
            persistRealLocal(next)
            return next
        })
        setRealSaved(false)
    }

    const addGroup = (zoneKey) => {
        setRealConfig(prev => {
            const zone = prev[zoneKey]
            const groups = [...zone.groups, { ...shapeDefaults('cylinder'), maxHeight: 1.35, count: 1 }]
            const next = { ...prev, [zoneKey]: { ...zone, groups } }
            persistRealLocal(next)
            return next
        })
        setRealSaved(false)
    }

    const removeGroup = (zoneKey, groupIdx) => {
        setRealConfig(prev => {
            const zone = prev[zoneKey]
            if (zone.groups.length <= 1) return prev
            const groups = zone.groups.filter((_, i) => i !== groupIdx)
            const next = { ...prev, [zoneKey]: { ...zone, groups } }
            persistRealLocal(next)
            return next
        })
        setRealSaved(false)
    }

    // Guarda la config de "Valores Reales" en Supabase (site_config, merge profundo)
    const saveRealConfigToSupabase = async () => {
        setSavingReal(true)
        try {
            const res = await fetch('/api/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ realTanksConfig: { __v: REAL_CONFIG_VERSION, zones: realConfig } })
            })
            if (!res.ok) throw new Error('respuesta ' + res.status)
            persistRealLocal(realConfig)
            setRealSaved(true)
            setTimeout(() => setRealSaved(false), 2500)
        } catch (e) {
            alert('No se pudo guardar en Supabase: ' + e.message)
        } finally {
            setSavingReal(false)
        }
    }

    // Cargar configuración e histórico al inicio
    useEffect(() => {
        loadConfig()
        fetchHistoricalData()
    }, []) // Sin dependencias - solo se ejecuta una vez al montar

    // Cargar datos de sensores automáticamente cuando config esté disponible
    useEffect(() => {
        if (config && config.tankConfigs) {
            console.log('✅ Config disponible, cargando datos de sensores...')
            fetchSensorData()
        }
    }, [config]) // Se ejecuta cuando config cambia

    // Configuración REAL de tanques (igual que en cron-water-monitoring.js)
    // Usada como fallback si no hay config en Supabase
    const REAL_TANK_CONFIGS = {
        zonaBaja: {
            name: 'Tanque Abajo',
            type: 'conic',
            tankCount: 3,
            height: 155,       // REAL: 155 cm
            topRadius: 70.25,  // REAL: 70.25 cm
            bottomRadius: 57.25 // REAL: 57.25 cm
        },
        zonaAlta: {
            name: 'Tanque Arriba',
            type: 'conic',
            tankCount: 2,
            height: 155,       // REAL: 155 cm
            topRadius: 70.25,  // REAL: 70.25 cm
            bottomRadius: 57.25 // REAL: 57.25 cm
        },
        zonaCasa: {
            name: 'Tanque Casa',
            type: 'cubic',
            tankCount: 1,
            height: 140,    // REAL: 140 cm
            length: 280,    // REAL: 280 cm
            width: 240      // REAL: 240 cm
        }
    }

    // Cargar configuración desde API (Supabase) primero, fallback a valores reales
    const loadConfig = async () => {
        try {
            // 1. Intentar cargar desde API (Supabase)
            const response = await fetch('/api/config')
            if (response.ok) {
                const data = await response.json()

                // "Valores Reales": cargar desde Supabase si existe y es de la versión actual
                const rtc = data.realTanksConfig
                if (rtc && rtc.__v === REAL_CONFIG_VERSION && rtc.zones) {
                    const merged = {}
                    for (const key of Object.keys(DEFAULT_REAL_CONFIG)) {
                        merged[key] = rtc.zones[key] || DEFAULT_REAL_CONFIG[key]
                    }
                    setRealConfig(merged)
                    persistRealLocal(merged)
                    console.log('✅ Valores Reales cargados desde Supabase')
                }

                if (data.tankConfigs) {
                    console.log('✅ Config de tanques cargada desde Supabase')
                    setConfig({ tankConfigs: data.tankConfigs })
                    return
                }
            }
        } catch (error) {
            console.warn('No se pudo cargar config desde API:', error)
        }

        // 2. Fallback: usar valores REALES hardcodeados (igual que el cron)
        console.log('⚠️ Usando configuración de tanques por defecto (valores reales)')
        setConfig({ tankConfigs: REAL_TANK_CONFIGS })
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

            if (!tuya || (!tuya.deviceIdAbajo && !tuya.deviceIdArriba && !tuya.deviceIdCasa)) {
                console.error('Configura los deviceIds de Tuya en /admin/conexiones')
                // Solo mostrar alert si no hay datos históricos (primera vez)
                if (allMeasurements.length === 0) {
                    alert('⚠️ Configura los deviceIds de Tuya en /admin/conexiones')
                }
                setRefreshing(false)
                return
            }

            const deviceIds = [tuya.deviceIdAbajo, tuya.deviceIdArriba, tuya.deviceIdCasa].filter(Boolean).join(',')

            console.log('🔍 Consultando sensores Tuya...', { deviceIds })

            const response = await fetch(`/api/water-tuya?deviceIds=${deviceIds}`)
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
    // IMPORTANTE: Guardamos el porcentaje de Tuya directamente porque es el valor real del sensor
    // Esto evita problemas con configuraciones locales diferentes entre dispositivos
    const saveMeasurement = async (zone, data, tuyaPercent) => {
        try {
            await fetch('/api/water-measurements', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    zone,
                    volume_m3: parseFloat(data.totalVolume),
                    percentage: parseFloat(tuyaPercent), // Usar porcentaje de Tuya directamente
                    tuya_percent: parseFloat(tuyaPercent),
                    level_cm: parseFloat(data.level_cm)
                })
            })
            console.log(`💾 Guardando medición - Zona: ${zone}, % Tuya: ${tuyaPercent}%`)
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
    // % del sensor por zona: primero datos en vivo, si no, el último histórico
    const getZonePercent = (zoneKey) => {
        const live = currentData?.zones?.find(z => z.zone === zoneKey)
        if (live) return parseFloat(live.sensorPercent) || 0
        let latest = null
        allMeasurements.forEach(m => {
            if (m.zone === zoneKey && (!latest || new Date(m.timestamp) > new Date(latest.timestamp))) latest = m
        })
        return latest ? (parseFloat(latest.percentage) || 0) : 0
    }

    // Agua total = suma del volumen real (modelo por grupos) de todas las zonas
    const getTotalWater = () => Object.keys(realConfig).reduce(
        (sum, z) => sum + computeZoneGrouped(realConfig[z], getZonePercent(z)).volume, 0
    )

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

    // Prepare chart data - Filtrar para no saturar la gráfica si hay muchos datos
    // Si hay más de 200 puntos, tomamos muestras equitativas
    const maxPoints = 200
    const step = Math.ceil(historicalData.length / maxPoints)
    const chartPoints = historicalData.filter((_, i) => i % step === 0 || i === historicalData.length - 1)

    // Capacidad máxima por zona = geometría real de todos los grupos de tanques
    const maxCapacities = {
        zonaBaja: computeZoneGrouped(realConfig.zonaBaja, 100).maxVolume || 1,
        zonaAlta: computeZoneGrouped(realConfig.zonaAlta, 100).maxVolume || 1,
        zonaCasa: computeZoneGrouped(realConfig.zonaCasa, 100).maxVolume || 1,
    }

    const totalMaxCapacity = maxCapacities.zonaBaja + maxCapacities.zonaAlta + maxCapacities.zonaCasa

    const chartHeight = 300
    const chartWidth = 1000

    return (
        <div className="p-3 md:p-6 w-full md:max-w-7xl md:mx-auto overflow-x-hidden">
            {/* Header - Responsive */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-xl md:text-3xl font-bold text-text-title">Estadísticas de Agua</h1>
                    <p className="text-sm text-text-muted">Monitoreo en tiempo real</p>
                </div>
                <div className="flex gap-2 sm:gap-3">
                    <button
                        onClick={() => window.location.href = '/admin/agua/config'}
                        className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-surface-card hover:bg-surface-card-hover border border-border-card rounded-lg transition-colors text-sm"
                    >
                        <span className="material-symbols-outlined text-lg sm:text-xl">settings</span>
                        <span className="hidden sm:inline">Configuración</span>
                    </button>
                    <button
                        onClick={fetchSensorData}
                        disabled={refreshing}
                        className="flex items-center gap-1 sm:gap-2 px-4 sm:px-6 py-2 bg-primary hover:bg-btn-primary-hover text-white rounded-lg font-medium transition-colors disabled:opacity-50 text-sm"
                    >
                        <span className={`material-symbols-outlined ${refreshing ? 'animate-spin' : ''}`}>refresh</span>
                        <span className="hidden sm:inline">Actualizar</span>
                    </button>
                </div>
            </div>



            {/* Card de Agua Total - Responsive */}
            <div className="bg-gradient-to-br from-primary to-btn-primary-hover text-white rounded-xl p-4 md:p-6 mb-6 shadow-lg">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    {/* Left: Icon and main info */}
                    <div className="flex items-center gap-3 md:gap-4">
                        <span className="material-symbols-outlined text-4xl md:text-5xl">water_drop</span>
                        <div>
                            <h2 className="text-base md:text-lg opacity-90">Agua Total Disponible</h2>
                            <p className="text-3xl md:text-4xl font-bold mt-1">{totalWater.toFixed(2)} m³</p>
                            {currentData && (
                                <p className="text-xs opacity-75 mt-1">
                                    Últ. act: {new Date(currentData.timestamp).toLocaleString('es-CO', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </p>
                            )}
                        </div>
                    </div>
                    {/* Right: Stats */}
                    {currentData && (
                        <div className="flex gap-6 sm:gap-8 text-left sm:text-right w-full sm:w-auto justify-start sm:justify-end">
                            <div>
                                <p className="text-xs opacity-75">Capacidad Máx</p>
                                <p className="text-lg font-bold">
                                    {totalMaxCapacity.toFixed(2)} m³
                                </p>
                            </div>
                            <div>
                                <p className="text-xs opacity-75">% Actual</p>
                                <p className="text-lg font-bold">
                                    {(totalMaxCapacity > 0 ? (totalWater / totalMaxCapacity) * 100 : 0).toFixed(1)}%
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Estado por Zona - Responsive */}
            <h2 className="text-lg md:text-2xl font-bold mb-4">Estado por Zona</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
                {(() => {
                    const zoneNames = { zonaBaja: 'Tanque Abajo', zonaAlta: 'Tanque Arriba', zonaCasa: 'Tanque Casa' }
                    const tankCounts = { zonaBaja: 3, zonaAlta: 2, zonaCasa: 1 }
                    const zones = ['zonaBaja', 'zonaAlta', 'zonaCasa']

                    // Si hay datos en tiempo real, usarlos
                    if (currentData?.zones?.length > 0) {
                        return currentData.zones.map((zone, idx) => {
                            const tuyaPercent = parseFloat(zone.sensorPercent) || 0
                            // Volumen/capacidad/tanques desde el modelo por grupos (incluye todos los tipos de tanque)
                            const g = computeZoneGrouped(realConfig[zone.zone], tuyaPercent)
                            const percent = tuyaPercent            // "Nivel" = lectura del sensor
                            const volume = g.volume
                            const maxVol = g.maxVolume
                            const tankCount = g.totalCount

                            return (
                                <div key={idx} className="bg-surface-card border border-border-card rounded-xl p-3 md:p-4 shadow-sm">
                                    <h3 className="text-sm md:text-base font-bold mb-2 md:mb-3">{zone.name}</h3>

                                    {/* Nivel con Barra */}
                                    <div className="mb-2 md:mb-3">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs text-text-muted">Nivel</span>
                                            <span className="text-lg md:text-xl font-bold text-primary">{percent.toFixed(1)}%</span>
                                        </div>
                                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary transition-all duration-500"
                                                style={{ width: `${Math.min(percent, 100)}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Stats Grid - Compacto */}
                                    <div className="grid grid-cols-2 gap-2 text-xs border-t border-border-card pt-2">
                                        <div>
                                            <span className="text-text-muted block">Volumen</span>
                                            <span className="font-bold">{volume.toFixed(2)} m³</span>
                                        </div>
                                        <div>
                                            <span className="text-text-muted block">Capacidad</span>
                                            <span className="font-medium">{maxVol.toFixed(2)} m³</span>
                                        </div>
                                        <div>
                                            <span className="text-text-muted block">Sensor Tuya</span>
                                            <span className="font-medium text-primary">{tuyaPercent.toFixed(1)}%</span>
                                        </div>
                                        <div>
                                            <span className="text-text-muted block">Tanques</span>
                                            <span className="font-medium">{tankCount}</span>
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    }

                    // Fallback: usar datos históricos
                    const latestByZone = {}
                    allMeasurements.forEach(m => {
                        if (!latestByZone[m.zone] || new Date(m.timestamp) > new Date(latestByZone[m.zone].timestamp)) {
                            latestByZone[m.zone] = m
                        }
                    })

                    return zones.map((zoneKey, idx) => {
                        const data = latestByZone[zoneKey]
                        const maxCap = maxCapacities[zoneKey] || 1

                        // Calcular porcentaje si no existe
                        let percent = 0
                        let volume = 0

                        if (data) {
                            volume = parseFloat(data.volume_m3) || 0
                            percent = parseFloat(data.percentage) || 0
                            // Si no hay porcentaje, calcularlo
                            if (!percent && volume > 0 && maxCap > 0) {
                                percent = (volume / maxCap) * 100
                            }
                        }

                        return (
                            <div key={idx} className="bg-surface-card border border-border-card rounded-xl p-3 md:p-4 shadow-sm">
                                <div className="flex items-center justify-between mb-2 md:mb-3">
                                    <h3 className="text-sm md:text-base font-bold">{zoneNames[zoneKey]}</h3>
                                    {data && (
                                        <span className="text-[10px] text-text-muted bg-gray-100 px-1.5 py-0.5 rounded">
                                            {new Date(data.timestamp).toLocaleString('es-CO', { day: 'numeric', month: 'short' })}
                                        </span>
                                    )}
                                </div>

                                {/* Nivel con Barra */}
                                <div className="mb-2 md:mb-3">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs text-text-muted">Nivel</span>
                                        <span className="text-lg md:text-xl font-bold text-primary">
                                            {data ? `${percent.toFixed(1)}%` : '--'}
                                        </span>
                                    </div>
                                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary transition-all duration-500"
                                            style={{ width: `${data ? Math.min(percent, 100) : 0}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Stats Grid - Compacto */}
                                <div className="grid grid-cols-2 gap-2 text-xs border-t border-border-card pt-2">
                                    <div>
                                        <span className="text-text-muted block">Volumen</span>
                                        <span className="font-bold">{data ? `${volume.toFixed(2)} m³` : '--'}</span>
                                    </div>
                                    <div>
                                        <span className="text-text-muted block">Capacidad</span>
                                        <span className="font-medium">{maxCap.toFixed(2)} m³</span>
                                    </div>
                                    <div>
                                        <span className="text-text-muted block">Tanques</span>
                                        <span className="font-medium">{tankCounts[zoneKey]}</span>
                                    </div>
                                    <div>
                                        {!data && (
                                            <button
                                                onClick={fetchSensorData}
                                                disabled={refreshing}
                                                className="text-primary text-xs font-medium hover:underline"
                                            >
                                                Actualizar
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })
                })()}
            </div>

            {/* ===== Valores Reales (cálculo geométrico preciso) ===== */}
            <div className="mb-6 md:mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                    <div>
                        <h2 className="text-lg md:text-2xl font-bold">Valores Reales</h2>
                        <p className="text-xs text-text-muted">Cálculo geométrico preciso según las medidas físicas de cada tanque</p>
                    </div>
                    <button
                        onClick={() => setShowRealEditor(v => !v)}
                        className="flex items-center gap-1 sm:gap-2 px-4 py-2 border border-border-card hover:bg-surface-card-hover text-sm rounded-lg font-medium transition-colors self-start"
                    >
                        <span className="material-symbols-outlined text-base">tune</span>
                        {showRealEditor ? 'Cerrar edición' : 'Editar medidas'}
                    </button>
                </div>

                {(() => {
                    const zoneKeys = ['zonaBaja', 'zonaAlta', 'zonaCasa']

                    // Último % por zona: primero datos en vivo de Tuya, si no, histórico
                    const latestByZone = {}
                    allMeasurements.forEach(m => {
                        if (!latestByZone[m.zone] || new Date(m.timestamp) > new Date(latestByZone[m.zone].timestamp)) {
                            latestByZone[m.zone] = m
                        }
                    })
                    const getLivePercent = (zoneKey) => {
                        const live = currentData?.zones?.find(z => z.zone === zoneKey)
                        if (live) return parseFloat(live.sensorPercent) || 0
                        const hist = latestByZone[zoneKey]
                        return hist ? (parseFloat(hist.percentage) || 0) : 0
                    }

                    const results = zoneKeys.map(k => {
                        const pct = getLivePercent(k)
                        return { key: k, cfg: realConfig[k], pct, ...computeZoneGrouped(realConfig[k], pct) }
                    })
                    const totalMax = results.reduce((s, r) => s + r.maxVolume, 0)
                    const totalVol = results.reduce((s, r) => s + r.volume, 0)
                    const totalPct = totalMax > 0 ? (totalVol / totalMax) * 100 : 0

                    return (
                        <>
                            {/* Banner total real */}
                            <div className="bg-gradient-to-br from-primary to-btn-primary-hover text-white rounded-xl p-4 md:p-6 mb-4 shadow-lg">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <div className="flex items-center gap-3 md:gap-4">
                                        <span className="material-symbols-outlined text-4xl md:text-5xl">calculate</span>
                                        <div>
                                            <h3 className="text-base md:text-lg opacity-90">Agua Real Disponible</h3>
                                            <p className="text-3xl md:text-4xl font-bold mt-1">{totalVol.toFixed(2)} m³</p>
                                            <p className="text-xs opacity-75 mt-1">Basado en las medidas físicas reales de los tanques</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-6 sm:gap-8 text-left sm:text-right w-full sm:w-auto justify-start sm:justify-end">
                                        <div>
                                            <p className="text-xs opacity-75">Capacidad Máx</p>
                                            <p className="text-lg font-bold">{totalMax.toFixed(2)} m³</p>
                                        </div>
                                        <div>
                                            <p className="text-xs opacity-75">% Actual</p>
                                            <p className="text-lg font-bold">{totalPct.toFixed(1)}%</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Cards por zona */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                                {results.map(({ key, cfg, pct, volume, maxVolume, waterHeight, refHeight, groups }) => {
                                    const percent = maxVolume > 0 ? (volume / maxVolume) * 100 : 0
                                    const tanksSummary = groups.map(g => `${g.count} × ${SHAPE_LABELS[g.shape] || g.shape}`).join(' · ')
                                    return (
                                        <div key={key} className="bg-surface-card border border-border-card rounded-xl p-3 md:p-4 shadow-sm">
                                            <h3 className="text-sm md:text-base font-bold mb-2 md:mb-3">{cfg.name}</h3>
                                            <div className="mb-2 md:mb-3">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-xs text-text-muted">Llenado real</span>
                                                    <span className="text-lg md:text-xl font-bold text-primary">{percent.toFixed(1)}%</span>
                                                </div>
                                                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                                    <div className="h-full bg-primary transition-all duration-500" style={{ width: `${Math.min(percent, 100)}%` }} />
                                                </div>
                                                <p className="text-[11px] text-text-muted mt-1">
                                                    Profundidad: <span className="font-medium">{waterHeight.toFixed(2)} m</span> de {refHeight.toFixed(2)} m
                                                </p>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 text-xs border-t border-border-card pt-2">
                                                <div>
                                                    <span className="text-text-muted block">Volumen real</span>
                                                    <span className="font-bold">{volume.toFixed(2)} m³</span>
                                                </div>
                                                <div>
                                                    <span className="text-text-muted block">Capacidad máx</span>
                                                    <span className="font-medium">{maxVolume.toFixed(2)} m³</span>
                                                </div>
                                                <div>
                                                    <span className="text-text-muted block">Sensor Tuya</span>
                                                    <span className="font-medium text-primary">{pct.toFixed(1)}%</span>
                                                </div>
                                                <div>
                                                    <span className="text-text-muted block">Tanques</span>
                                                    <span className="font-medium">{tanksSummary}</span>
                                                </div>
                                            </div>
                                            {groups.length > 1 && (
                                                <div className="mt-2 pt-2 border-t border-border-card space-y-1">
                                                    {groups.map((g, gi) => (
                                                        <div key={gi} className="flex items-center justify-between text-[11px] text-text-muted">
                                                            <span>{g.count} × {SHAPE_LABELS[g.shape] || g.shape} <span className="opacity-60">(máx {g.maxHeight} m)</span></span>
                                                            <span className="font-medium text-text-main">{g.groupVol.toFixed(2)} / {g.groupMax.toFixed(2)} m³</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>

                            {/* Editor de medidas */}
                            {showRealEditor && (
                                <div className="mt-4 bg-surface-card border border-border-card rounded-xl p-4 md:p-5 shadow-sm">
                                    <h3 className="text-sm md:text-base font-bold mb-3">Editar medidas y número de tanques</h3>
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                        {zoneKeys.map(k => {
                                            const zone = realConfig[k]
                                            return (
                                                <div key={k} className="border border-border-card rounded-lg p-3">
                                                    <p className="font-bold text-sm mb-2">{zone.name}</p>
                                                    <div className="space-y-3">
                                                        {zone.groups.map((g, gi) => (
                                                            <div key={gi} className="rounded-lg bg-surface-card-hover p-2.5 space-y-2 text-xs">
                                                                <div className="flex items-center justify-between gap-2">
                                                                    <select value={g.shape}
                                                                        onChange={e => setGroupShape(k, gi, e.target.value)}
                                                                        className="flex-1 px-2 py-1 border border-border-card rounded bg-white font-medium">
                                                                        <option value="cone">Cónico</option>
                                                                        <option value="cylinder">Cilindro (botella)</option>
                                                                        <option value="rect">Rectangular</option>
                                                                    </select>
                                                                    {zone.groups.length > 1 && (
                                                                        <button onClick={() => removeGroup(k, gi)} title="Quitar grupo" className="text-red-500 hover:text-red-600">
                                                                            <span className="material-symbols-outlined text-base">delete</span>
                                                                        </button>
                                                                    )}
                                                                </div>
                                                                {g.shape === 'cone' && (<>
                                                                    <label className="block"><span className="text-text-muted">Diámetro inferior (cm)</span>
                                                                        <input type="number" step="0.1" value={g.diameterBottom}
                                                                            onChange={e => updateGroup(k, gi, 'diameterBottom', parseFloat(e.target.value) || 0)}
                                                                            className="w-full mt-0.5 px-2 py-1 border border-border-card rounded" /></label>
                                                                    <label className="block"><span className="text-text-muted">Diámetro superior (cm)</span>
                                                                        <input type="number" step="0.1" value={g.diameterTop}
                                                                            onChange={e => updateGroup(k, gi, 'diameterTop', parseFloat(e.target.value) || 0)}
                                                                            className="w-full mt-0.5 px-2 py-1 border border-border-card rounded" /></label>
                                                                </>)}
                                                                {g.shape === 'cylinder' && (
                                                                    <label className="block"><span className="text-text-muted">Diámetro (cm)</span>
                                                                        <input type="number" step="0.1" value={g.diameter}
                                                                            onChange={e => updateGroup(k, gi, 'diameter', parseFloat(e.target.value) || 0)}
                                                                            className="w-full mt-0.5 px-2 py-1 border border-border-card rounded" /></label>
                                                                )}
                                                                {g.shape === 'rect' && (<>
                                                                    <label className="block"><span className="text-text-muted">Largo (cm)</span>
                                                                        <input type="number" step="0.1" value={g.length}
                                                                            onChange={e => updateGroup(k, gi, 'length', parseFloat(e.target.value) || 0)}
                                                                            className="w-full mt-0.5 px-2 py-1 border border-border-card rounded" /></label>
                                                                    <label className="block"><span className="text-text-muted">Ancho (cm)</span>
                                                                        <input type="number" step="0.1" value={g.width}
                                                                            onChange={e => updateGroup(k, gi, 'width', parseFloat(e.target.value) || 0)}
                                                                            className="w-full mt-0.5 px-2 py-1 border border-border-card rounded" /></label>
                                                                </>)}
                                                                <label className="block"><span className="text-text-muted">Altura máx. del líquido (m)</span>
                                                                    <input type="number" step="0.01" value={g.maxHeight}
                                                                        onChange={e => updateGroup(k, gi, 'maxHeight', parseFloat(e.target.value) || 0)}
                                                                        className="w-full mt-0.5 px-2 py-1 border border-border-card rounded" /></label>
                                                                <label className="block"><span className="text-text-muted">Número de tanques</span>
                                                                    <select value={g.count}
                                                                        onChange={e => updateGroup(k, gi, 'count', parseInt(e.target.value) || 1)}
                                                                        className="w-full mt-0.5 px-2 py-1 border border-border-card rounded bg-white">
                                                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => <option key={n} value={n}>{n}</option>)}
                                                                    </select></label>
                                                                <p className="text-[10px] text-text-muted">≈ {geomMaxPerTank(g).toFixed(2)} m³ por tanque</p>
                                                            </div>
                                                        ))}
                                                        <button onClick={() => addGroup(k)}
                                                            className="w-full flex items-center justify-center gap-1 py-1.5 border border-dashed border-border-card rounded text-xs text-primary hover:bg-surface-card-hover">
                                                            <span className="material-symbols-outlined text-sm">add</span> Agregar grupo de tanques
                                                        </button>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                    <div className="flex items-center gap-3 mt-4">
                                        <button
                                            onClick={saveRealConfigToSupabase}
                                            disabled={savingReal}
                                            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-btn-primary-hover text-white rounded-lg font-medium transition-colors disabled:opacity-50 text-sm"
                                        >
                                            <span className={`material-symbols-outlined text-base ${savingReal ? 'animate-spin' : ''}`}>
                                                {savingReal ? 'progress_activity' : 'cloud_upload'}
                                            </span>
                                            {savingReal ? 'Guardando...' : 'Guardar en Supabase'}
                                        </button>
                                        {realSaved && (
                                            <span className="flex items-center gap-1 text-primary text-sm font-medium">
                                                <span className="material-symbols-outlined text-base">check_circle</span>
                                                Guardado
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[11px] text-text-muted mt-2">Se guarda en Supabase y estará disponible en todos los dispositivos.</p>
                                </div>
                            )}
                        </>
                    )
                })()}
            </div>

            {/* Gráfica de Líneas - Histórico - Responsive */}
            <div className="bg-surface-card border border-border-card rounded-xl p-4 md:p-6 shadow-sm mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div>
                        <h2 className="text-lg md:text-2xl font-bold">Histórico de Niveles (7 días)</h2>
                        <p className="text-xs text-text-muted">Mediciones cada hora (cron-job)</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 md:gap-2 text-xs">
                        {[...CHART_SERIES, { key: 'total', label: 'TOTAL', color: CHART_TOTAL_COLOR }].map(s => {
                            const hidden = hiddenSeries[s.key]
                            return (
                                <button
                                    key={s.key}
                                    onClick={() => toggleSeries(s.key)}
                                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-all ${hidden ? 'opacity-40 border-border-card' : 'border-border-card bg-surface-card-hover'} ${s.key === 'total' ? 'font-bold' : ''}`}
                                    title={hidden ? 'Mostrar' : 'Ocultar'}
                                >
                                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }}></span>
                                    {s.label}
                                </button>
                            )
                        })}
                    </div>
                </div>
                {chartPoints.length > 0 ? (
                    <div className="overflow-x-auto">
                        {(() => {
                            const plotTop = 20
                            const plotBottom = chartHeight        // 300
                            const plotH = plotBottom - plotTop
                            const leftX = 60
                            const rightX = chartWidth - 20
                            const n = chartPoints.length
                            const xAt = (i) => leftX + (i * (rightX - leftX) / (n - 1 || 1))
                            const yAt = (pct) => plotBottom - (Math.max(0, Math.min(100, pct)) * plotH / 100)
                            const totalCap = Object.values(maxCapacities).reduce((a, b) => a + b, 0)

                            const rows = chartPoints.map((point, i) => {
                                const pct = (key, cap) => cap > 0 ? ((point[key] || 0) / cap) * 100 : 0
                                const totalVol = (point.zonaBaja || 0) + (point.zonaAlta || 0) + (point.zonaCasa || 0)
                                return {
                                    i, x: xAt(i), timestamp: point.timestamp,
                                    zonaBaja: pct('zonaBaja', maxCapacities.zonaBaja),
                                    zonaAlta: pct('zonaAlta', maxCapacities.zonaAlta),
                                    zonaCasa: pct('zonaCasa', maxCapacities.zonaCasa),
                                    total: totalCap > 0 ? (totalVol / totalCap) * 100 : 0,
                                }
                            })

                            const buildPath = (key) => rows.map((r, idx) => `${idx === 0 ? 'M' : 'L'} ${r.x.toFixed(1)} ${yAt(r[key]).toFixed(1)}`).join(' ')
                            const totalArea = rows.length
                                ? `${buildPath('total')} L ${rows[rows.length - 1].x.toFixed(1)} ${plotBottom} L ${rows[0].x.toFixed(1)} ${plotBottom} Z`
                                : ''
                            const stepW = (rightX - leftX) / (n - 1 || 1)
                            const hover = hoverIdx != null ? rows[hoverIdx] : null

                            return (
                                <svg
                                    viewBox={`0 0 ${chartWidth} ${chartHeight + 130}`}
                                    className="w-full select-none"
                                    style={{ minWidth: '750px' }}
                                    onMouseLeave={() => setHoverIdx(null)}
                                >
                                    <defs>
                                        <linearGradient id="totalAreaGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor={CHART_TOTAL_COLOR} stopOpacity="0.22" />
                                            <stop offset="100%" stopColor={CHART_TOTAL_COLOR} stopOpacity="0" />
                                        </linearGradient>
                                    </defs>

                                    {/* Grid horizontal + etiquetas Y */}
                                    {[0, 20, 40, 60, 80, 100].map(i => {
                                        const y = yAt(i)
                                        return (
                                            <g key={i}>
                                                <line x1={leftX} y1={y} x2={rightX} y2={y} stroke="#eef2f7" strokeWidth="1" />
                                                <text x={leftX - 10} y={y + 4} textAnchor="end" fontSize="11" fill="#9ca3af">{i}%</text>
                                            </g>
                                        )
                                    })}

                                    {/* Grid vertical (00:00 / 12:00) */}
                                    {rows.map((r) => {
                                        const d = new Date(r.timestamp)
                                        if (d.getHours() % 12 !== 0) return null
                                        return <line key={`v-${r.i}`} x1={r.x} y1={plotTop} x2={r.x} y2={plotBottom} stroke="#f1f5f9" strokeWidth="1" />
                                    })}

                                    {/* Área bajo el total */}
                                    {!hiddenSeries.total && totalArea && <path d={totalArea} fill="url(#totalAreaGrad)" />}

                                    {/* Líneas por zona */}
                                    {CHART_SERIES.map(s => hiddenSeries[s.key] ? null : (
                                        <path key={s.key} d={buildPath(s.key)} fill="none" stroke={s.color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" opacity="0.95" />
                                    ))}

                                    {/* Línea total */}
                                    {!hiddenSeries.total && <path d={buildPath('total')} fill="none" stroke={CHART_TOTAL_COLOR} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />}

                                    {/* Crosshair + puntos + tooltip (hover) */}
                                    {hover && (
                                        <g>
                                            <line x1={hover.x} y1={plotTop} x2={hover.x} y2={plotBottom} stroke="#94a3b8" strokeWidth="1" strokeDasharray="4,3" />
                                            {CHART_SERIES.map(s => hiddenSeries[s.key] ? null : (
                                                <circle key={s.key} cx={hover.x} cy={yAt(hover[s.key])} r="4" fill="#fff" stroke={s.color} strokeWidth="2.5" />
                                            ))}
                                            {!hiddenSeries.total && <circle cx={hover.x} cy={yAt(hover.total)} r="5" fill="#fff" stroke={CHART_TOTAL_COLOR} strokeWidth="3" />}
                                            {(() => {
                                                const boxW = 172
                                                const left = hover.x > (leftX + rightX) / 2
                                                const bx = left ? hover.x - boxW - 12 : hover.x + 12
                                                const d = new Date(hover.timestamp)
                                                const dayName = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][d.getDay()]
                                                const dateLabel = `${dayName} ${d.getDate()}/${d.getMonth() + 1} ${String(d.getHours()).padStart(2, '0')}:00`
                                                const items = [
                                                    { label: 'Total', color: CHART_TOTAL_COLOR, val: hover.total, hidden: hiddenSeries.total },
                                                    { label: 'Abajo', color: '#2563eb', val: hover.zonaBaja, hidden: hiddenSeries.zonaBaja },
                                                    { label: 'Arriba', color: '#f59e0b', val: hover.zonaAlta, hidden: hiddenSeries.zonaAlta },
                                                    { label: 'Casa', color: '#8b5cf6', val: hover.zonaCasa, hidden: hiddenSeries.zonaCasa },
                                                ].filter(it => !it.hidden)
                                                return (
                                                    <g transform={`translate(${bx}, ${plotTop + 6})`}>
                                                        <rect x="0" y="0" width={boxW} height={22 + items.length * 20 + 6} rx="10" fill="#ffffff" stroke="#e5e7eb" strokeWidth="1" />
                                                        <text x="12" y="17" fontSize="11" fontWeight="bold" fill="#374151">{dateLabel}</text>
                                                        {items.map((it, k) => (
                                                            <g key={it.label} transform={`translate(12, ${34 + k * 20})`}>
                                                                <rect x="0" y="-8" width="10" height="10" rx="2" fill={it.color} />
                                                                <text x="16" y="1" fontSize="11" fill="#6b7280">{it.label}</text>
                                                                <text x={boxW - 24} y="1" fontSize="11" fontWeight="bold" textAnchor="end" fill="#111827">{it.val.toFixed(1)}%</text>
                                                            </g>
                                                        ))}
                                                    </g>
                                                )
                                            })()}
                                        </g>
                                    )}

                                    {/* Zonas de detección de hover (invisibles) */}
                                    {rows.map(r => (
                                        <rect key={`hit-${r.i}`} x={r.x - stepW / 2} y={plotTop} width={stepW} height={plotH} fill="transparent" onMouseEnter={() => setHoverIdx(r.i)} />
                                    ))}

                                    {/* Etiquetas eje X (00:00 / 12:00) */}
                                    {rows.map((r) => {
                                        const d = new Date(r.timestamp)
                                        if (d.getHours() % 12 !== 0) return null
                                        const dayName = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][d.getDay()]
                                        const label = `${dayName} ${d.getDate()}/${d.getMonth() + 1} ${String(d.getHours()).padStart(2, '0')}:00`
                                        return (
                                            <g key={`x-${r.i}`}>
                                                <line x1={r.x} y1={plotBottom} x2={r.x} y2={plotBottom + 6} stroke="#cbd5e1" strokeWidth="1" />
                                                <text x={r.x + 3} y={plotBottom + 12} textAnchor="start" fontSize="10" fill="#6b7280" transform={`rotate(90, ${r.x}, ${plotBottom + 12})`}>{label}</text>
                                            </g>
                                        )
                                    })}

                                    <text x="14" y={plotTop + plotH / 2} textAnchor="middle" fontSize="12" fill="#9ca3af" fontWeight="bold" transform={`rotate(-90, 14, ${plotTop + plotH / 2})`}>Porcentaje (%)</text>
                                </svg>
                            )
                        })()}
                    </div>
                ) : (
                    <div className="text-center py-12 text-text-muted">
                        <span className="material-symbols-outlined text-5xl mb-4">show_chart</span>
                        <p>No hay datos históricos disponibles</p>
                        <p className="text-sm mt-2">Los datos se guardan automáticamente cada hora (:00)</p>
                    </div>
                )}
            </div>

            {/* Tabla de Registros - Responsive */}
            <div className="bg-surface-card border border-border-card rounded-xl shadow-sm overflow-hidden">
                <div className="bg-background-light px-4 md:px-6 py-3 md:py-4 border-b border-border-card">
                    <h2 className="text-lg md:text-xl font-bold">Registros</h2>
                    <p className="text-xs text-text-muted">Últimas 50 mediciones</p>
                </div>
                {allMeasurements.length > 0 ? (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-sm">
                                <thead className="bg-background-light border-b border-border-card">
                                    <tr>
                                        <th className="py-2 md:py-3 px-3 md:px-6 text-xs font-semibold uppercase tracking-wider text-text-secondary-light whitespace-nowrap">Fecha</th>
                                        <th className="py-2 md:py-3 px-3 md:px-6 text-xs font-semibold uppercase tracking-wider text-text-secondary-light whitespace-nowrap text-center">Abajo<br /><span className="text-[10px] font-normal normal-case opacity-70">m³ / %</span></th>
                                        <th className="py-2 md:py-3 px-3 md:px-6 text-xs font-semibold uppercase tracking-wider text-text-secondary-light whitespace-nowrap text-center">Arriba<br /><span className="text-[10px] font-normal normal-case opacity-70">m³ / %</span></th>
                                        <th className="py-2 md:py-3 px-3 md:px-6 text-xs font-semibold uppercase tracking-wider text-text-secondary-light whitespace-nowrap text-center">Casa<br /><span className="text-[10px] font-normal normal-case opacity-70">m³ / %</span></th>
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
                                                percent: parseFloat(curr.percentage || 0) // Porcentaje de Tuya
                                            }
                                            return acc
                                        }, {})

                                        const sortedRows = Object.values(grouped).sort((a, b) =>
                                            new Date(b.timestamp) - new Date(a.timestamp)
                                        )

                                        return sortedRows.slice(0, 50).map((row, index) => {
                                            // Usar directamente los valores de la base de datos (sin recalcular)
                                            const baja = row.readings.zonaBaja
                                            const alta = row.readings.zonaAlta
                                            const casa = row.readings.zonaCasa

                                            const CellContent = ({ data }) => {
                                                if (!data) return <span className="text-gray-300">-</span>
                                                const vol = parseFloat(data.volume) || 0
                                                const pct = parseFloat(data.percent) || 0
                                                return (
                                                    <div className="flex flex-col items-center">
                                                        <span className="font-bold text-gray-900">{vol.toFixed(2)} m³</span>
                                                        <span className="text-xs font-bold text-black">
                                                            {pct.toFixed(1)}%
                                                        </span>
                                                    </div>
                                                )
                                            }

                                            return (
                                                <tr key={index} className={`hover:bg-gray-100 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                                    <td className="py-2 md:py-3 px-3 md:px-6 text-xs md:text-sm text-text-main-light font-medium whitespace-nowrap">
                                                        {new Date(row.timestamp).toLocaleString('es-CO', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </td>
                                                    <td className="py-2 md:py-3 px-3 md:px-6 text-center border-l border-r border-gray-100">
                                                        <CellContent data={baja} />
                                                    </td>
                                                    <td className="py-2 md:py-3 px-3 md:px-6 text-center border-r border-gray-100">
                                                        <CellContent data={alta} />
                                                    </td>
                                                    <td className="py-2 md:py-3 px-3 md:px-6 text-center">
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
