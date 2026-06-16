import { useState, useEffect } from 'react'
import { fetchReservasData, fetchHuespedesData } from '../../utils/googleSheets'

export default function Dashboard() {
    const [config, setConfig] = useState(null)
    const [selectedMonth, setSelectedMonth] = useState('all')
    const [selectedStatus, setSelectedStatus] = useState('all')
    const [reservasData, setReservasData] = useState([])
    const [loading, setLoading] = useState(true)
    const [siteColors, setSiteColors] = useState({
        platformAirbnb: '#2f4858',
        platformBooking: '#006076',
        platformGoogle: '#0094a8',
        platformDirecta: '#00a658'
    })

    const monthOrder = ['Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre', 'Enero.26']
    const months = [
        { value: 'all', label: 'Todos los meses' },
        { value: 'Marzo', label: 'Marzo' },
        { value: 'Abril', label: 'Abril' },
        { value: 'Mayo', label: 'Mayo' },
        { value: 'Junio', label: 'Junio' },
        { value: 'Julio', label: 'Julio' },
        { value: 'Agosto', label: 'Agosto' },
        { value: 'Septiembre', label: 'Septiembre' },
        { value: 'Octubre', label: 'Octubre' },
        { value: 'Noviembre', label: 'Noviembre' },
        { value: 'Diciembre', label: 'Diciembre' },
        { value: 'Enero.26', label: 'Enero 2026' },
    ]

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
                if (configData.siteColors) {
                    setSiteColors(prev => ({
                        ...prev,
                        platformAirbnb: configData.siteColors.platformAirbnb || prev.platformAirbnb,
                        platformBooking: configData.siteColors.platformBooking || prev.platformBooking,
                        platformGoogle: configData.siteColors.platformGoogle || prev.platformGoogle,
                        platformDirecta: configData.siteColors.platformDirecta || prev.platformDirecta
                    }))
                }
            }
        }
        loadConfig()
        loadData()
    }, [])

    const parseCurrency = (value) => {
        if (!value) return 0
        if (typeof value === 'number') return value
        let str = value.toString().replace(/[$\s]/g, '').replace(/,/g, '')
        return parseFloat(str) || 0
    }

    const getCol = (row, ...variants) => {
        const keys = Object.keys(row)
        for (const variant of variants) {
            if (row[variant] !== undefined) return row[variant]
            const found = keys.find(k => k.toLowerCase().trim() === variant.toLowerCase().trim())
            if (found) return row[found]
            const partial = keys.find(k => k.toLowerCase().includes(variant.toLowerCase()))
            if (partial) return row[partial]
        }
        return ''
    }

    const parseSpanishDate = (dateStr) => {
        if (!dateStr) return null
        const monthMap = { enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5, julio: 6, agosto: 7, septiembre: 8, octubre: 9, noviembre: 10, diciembre: 11 }
        const match = dateStr.toString().match(/(\d{1,2})\s+de\s+(\w+)\s+de\s+(\d{4})/)
        if (!match) return null
        return new Date(parseInt(match[3]), monthMap[match[2].toLowerCase()], parseInt(match[1]))
    }

    const calculateNights = (dateRangeStr) => {
        if (!dateRangeStr) return 0
        const parts = dateRangeStr.toString().split('→')
        if (parts.length < 2) return 0
        const start = parseSpanishDate(parts[0]), end = parseSpanishDate(parts[1])
        if (!start || !end) return 0
        return Math.max(Math.ceil((end - start) / (1000 * 60 * 60 * 24)), 0)
    }

    const formatCurrency = (num) => '$' + num.toLocaleString('es-CO')
    const formatShortDate = (dateStr) => {
        const d = parseSpanishDate(dateStr)
        if (!d) return dateStr?.slice(0, 15) || '-'
        return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })
    }

    const loadData = async () => {
        setLoading(true)
        try {
            const [data, guests] = await Promise.all([
                fetchReservasData(),
                fetchHuespedesData()
            ])
            
            const registeredIds = new Set()
            if (guests?.length > 0) {
                guests.forEach(row => {
                    const noRes = getCol(row, 'No Reserva', 'NO RESERVA', 'No_Reserva', 'NoReserva', 'ID')?.toString().trim()
                    if (noRes) {
                        registeredIds.add(noRes)
                    }
                })
            }

            if (data?.length > 0) {
                const normalized = data.map(row => {
                    const fechaReservaStr = getCol(row, 'Fecha Reserva')
                    const parts = fechaReservaStr?.toString().split('→') || []
                    const fechaInicioStr = getCol(row, 'Fecha Inicio') || (parts[0]?.trim() || '')
                    const fechaSalidaStr = getCol(row, 'Fecha Salida') || (parts[1]?.trim() || '')
                    const id = getCol(row, 'No Reserva', 'ID') || 'N/A'

                    return {
                        id: id,
                        cliente: getCol(row, 'Nombre') || 'Desconocido',
                        telefono: getCol(row, 'Telefono', 'Teléfono', 'Tel', 'Celular') || '-',
                        estado: getCol(row, 'Estado').toString().trim() || 'Pendiente',
                        total: parseCurrency(getCol(row, 'Valor Reserva')),
                        fuente: getCol(row, 'Plataforma').toString().trim() || 'Directo',
                        noches: calculateNights(fechaReservaStr),
                        mes: getCol(row, 'Mes').toString().trim(),
                        abonos: parseCurrency(getCol(row, 'Abonos', 'Abono', 'Deposito')),
                        saldoPendiente: parseCurrency(getCol(row, 'Valor Pendiente', 'Saldo')),
                        huespedes: parseInt(getCol(row, 'Huespedes')) || 0,
                        fechaInicio: fechaInicioStr,
                        fechaInicioDate: parseSpanishDate(fechaInicioStr),
                        fechaSalida: fechaSalidaStr,
                        fechaSalidaDate: parseSpanishDate(fechaSalidaStr),
                        tiempo: getCol(row, 'Tiempo').toString().trim().toLowerCase(),
                        isRegistered: registeredIds.has(id.toString().trim())
                    }
                })
                setReservasData(normalized)
            }
        } catch (error) { console.error('Error:', error) }
        setLoading(false)
    }

    const filteredData = reservasData.filter(r => {
        const statusMatch = selectedStatus === 'all' || r.estado.toLowerCase().includes(selectedStatus.toLowerCase())
        const monthMatch = selectedMonth === 'all' || r.mes.toLowerCase().includes(selectedMonth.toLowerCase())
        return monthMatch && statusMatch
    })

    const validStatus = (e) => !e.toLowerCase().includes('cancelada')
    const isConfirmed = (e) => e.toLowerCase().includes('realizada') || e.toLowerCase().includes('abonada')

    const totalIngresos = filteredData.filter(r => validStatus(r.estado)).reduce((s, r) => s + r.total, 0)
    const totalAbonos = filteredData.filter(r => validStatus(r.estado)).reduce((s, r) => s + r.abonos, 0)
    const totalSaldoPendiente = filteredData.filter(r => validStatus(r.estado)).reduce((s, r) => s + r.saldoPendiente, 0)
    const totalReservas = filteredData.length
    const reservasConfirmadas = filteredData.filter(r => isConfirmed(r.estado)).length
    const totalNoches = filteredData.filter(r => validStatus(r.estado)).reduce((s, r) => s + r.noches, 0)
    const tarifaPromedio = totalReservas > 0 ? Math.round(totalIngresos / totalReservas) : 0

    // Calculate correct occupancy rate
    // From first reservation (March 19, 2025) to the last reserved night
    const calculateOccupancyRate = () => {
        const validReservations = filteredData.filter(r => validStatus(r.estado) && r.fechaSalidaDate)
        if (validReservations.length === 0) return 0

        const firstOperationDate = new Date(2025, 2, 19) // March 19, 2025
        const lastReservedDate = validReservations.reduce((max, r) =>
            r.fechaSalidaDate > max ? r.fechaSalidaDate : max, firstOperationDate)

        const totalPossibleNights = Math.max(Math.ceil((lastReservedDate - firstOperationDate) / (1000 * 60 * 60 * 24)), 1)
        return Math.min(((totalNoches / totalPossibleNights) * 100), 100).toFixed(0)
    }
    const occupancyRate = calculateOccupancyRate()

    // Calculate days until reservation
    const getDaysUntil = (fechaInicioDate) => {
        if (!fechaInicioDate) return null
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const diffTime = fechaInicioDate - today
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays
    }

    const bySource = filteredData.reduce((a, r) => { if (validStatus(r.estado) && r.fuente) a[r.fuente] = (a[r.fuente] || 0) + r.total; return a }, {})
    const byStatus = filteredData.reduce((a, r) => { if (r.estado) a[r.estado] = (a[r.estado] || 0) + 1; return a }, {})
    const byMonthRaw = filteredData.reduce((a, r) => {
        const m = r.mes || 'Sin Fecha'
        if (m && validStatus(r.estado)) { if (!a[m]) a[m] = { ingresos: 0, reservas: 0 }; a[m].ingresos += r.total; a[m].reservas += 1 }
        return a
    }, {})
    const byMonthSorted = Object.entries(byMonthRaw).sort((a, b) => {
        const iA = monthOrder.findIndex(m => a[0].toLowerCase().includes(m.toLowerCase()))
        const iB = monthOrder.findIndex(m => b[0].toLowerCase().includes(m.toLowerCase()))
        return (iA === -1 ? 999 : iA) - (iB === -1 ? 999 : iB)
    })

    const upcomingReservations = [...filteredData]
        .filter(r => ['activa', 'futura', 'si'].some(t => r.tiempo.includes(t)))
        .sort((a, b) => (a.fechaInicioDate || 0) - (b.fechaInicioDate || 0))
        .slice(0, 8)

    const recentReservations = [...filteredData].slice(0, 10)

    const getInitials = (name) => name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    const getBadgeStyle = (estado) => {
        const l = estado?.toLowerCase() || ''
        if (l.includes('realizada') || l.includes('confirmada')) return 'bg-gray-100 text-gray-800 border border-gray-300'
        if (l.includes('abonada') || l.includes('pendiente pago')) return 'bg-gray-200 text-gray-700 border border-gray-300'
        if (l.includes('cancelada')) return 'bg-gray-300 text-gray-600 border border-gray-400'
        return 'bg-gray-50 text-gray-600 border border-gray-200'
    }
    const getPlatformColor = (fuente) => {
        const f = fuente?.toLowerCase() || ''
        if (f.includes('airbnb')) return siteColors.platformAirbnb
        if (f.includes('booking')) return siteColors.platformBooking
        if (f.includes('google')) return siteColors.platformGoogle
        return siteColors.platformDirecta
    }

    return (
        <div className="flex-1 flex flex-col overflow-y-auto bg-surface-page">
            {/* Header - Same style as Reservas */}
            <header className="bg-white border-b border-border-card px-3 md:px-6 py-3 md:py-4">
                <div className="flex flex-col gap-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                            <h1 className="text-xl md:text-2xl font-black text-gray-900">Panel de Control</h1>
                            <p className="text-text-subtitle dark:text-text-subtitle-dark text-sm">Bienvenido de nuevo, aquí está el resumen de hoy.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={loadData} className={`p-2 rounded-lg hover:bg-icon-bg-primary text-text-muted ${loading ? 'animate-spin' : ''}`}>
                                <span className="material-symbols-outlined text-lg md:text-xl">refresh</span>
                            </button>
                            <div className="flex items-center gap-1 px-2 md:px-3 py-1.5 md:py-2 bg-white border border-border-card rounded-lg text-xs md:text-sm">
                                <span className="material-symbols-outlined text-text-muted text-base md:text-lg">calendar_today</span>
                                <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="bg-transparent border-none outline-none text-text-main-light font-medium text-xs md:text-sm">
                                    {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="h-2 w-full rounded-full bg-icon-bg-secondary dark:bg-border-card-dark relative overflow-hidden">
                        <div className="absolute top-0 left-0 h-full w-full bg-primary rounded-full"></div>
                    </div>
                </div>
            </header>

            <div className="p-3 md:p-6">
                {/* KPI Cards - Mobile optimized: 2x2 grid on mobile */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 mb-4 md:mb-6">
                    <div className="bg-white rounded-lg md:rounded-xl p-3 md:p-5 shadow-sm border-l-4 border-l-green-500 border border-border-card">
                        <p className="text-[10px] md:text-xs text-text-muted font-medium mb-0.5 md:mb-1">Ingresos Totales</p>
                        <p className="text-base md:text-2xl font-bold text-gray-900">{formatCurrency(totalIngresos)}</p>
                        <div className="flex items-center gap-1 mt-1 md:mt-2">
                            <span className="material-symbols-outlined text-icon-color text-xs md:text-sm">trending_up</span>
                            <span className="text-[10px] md:text-xs text-success-text font-medium">+{((totalAbonos / totalIngresos) * 100 || 0).toFixed(0)}%</span>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg md:rounded-xl p-3 md:p-5 shadow-sm border-l-4 border-l-green-500 border border-border-card">
                        <p className="text-[10px] md:text-xs text-text-muted font-medium mb-0.5 md:mb-1">Abonos</p>
                        <p className="text-base md:text-2xl font-bold text-gray-900">{formatCurrency(totalAbonos)}</p>
                        <div className="flex items-center gap-1 mt-1 md:mt-2">
                            <span className="material-symbols-outlined text-icon-color text-xs md:text-sm">check_circle</span>
                            <span className="text-[10px] md:text-xs text-success-text font-medium">{reservasConfirmadas} conf.</span>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg md:rounded-xl p-3 md:p-5 shadow-sm border-l-4 border-l-primary border border-border-card">
                        <p className="text-[10px] md:text-xs text-text-muted font-medium mb-0.5 md:mb-1">Saldo Pendiente</p>
                        <p className="text-base md:text-2xl font-bold text-primary">{formatCurrency(totalSaldoPendiente)}</p>
                        <div className="flex items-center gap-1 mt-1 md:mt-2">
                            <span className="material-symbols-outlined text-icon-color text-xs md:text-sm">pending</span>
                            <span className="text-[10px] md:text-xs text-primary font-medium">Por cobrar</span>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg md:rounded-xl p-3 md:p-5 shadow-sm border-l-4 border-l-green-500 border border-border-card">
                        <p className="text-[10px] md:text-xs text-text-muted font-medium mb-0.5 md:mb-1">Tarifa Prom.</p>
                        <p className="text-base md:text-2xl font-bold text-gray-900">{formatCurrency(tarifaPromedio)}</p>
                        <div className="flex items-center gap-1 mt-1 md:mt-2">
                            <span className="material-symbols-outlined text-text-muted text-xs md:text-sm">hotel</span>
                            <span className="text-[10px] md:text-xs text-text-muted font-medium">{totalNoches} noches</span>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    {/* Chart Section - 2 cols */}
                    <div className="lg:col-span-2 bg-white rounded-lg md:rounded-xl p-3 md:p-6 shadow-sm border border-border-card">
                        <div className="flex items-center justify-between mb-3 md:mb-4">
                            <div>
                                <h3 className="text-sm md:text-base font-bold text-gray-900">Ingresos por Mes</h3>
                                <p className="text-[10px] md:text-xs text-text-muted hidden sm:block">Resumen financiero últimos meses</p>
                            </div>
                            <div className="flex items-center gap-2 md:gap-4 text-[10px] md:text-xs">
                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary"></span> Ingresos</span>
                            </div>
                        </div>
                        <div className="space-y-2 md:space-y-3">
                            {byMonthSorted.map(([mes, data]) => {
                                const max = Math.max(...byMonthSorted.map(([, d]) => d.ingresos), 1)
                                return (
                                    <div key={mes} className="flex items-center gap-2 md:gap-3">
                                        <span className="w-12 md:w-16 text-[10px] md:text-xs font-medium text-text-muted text-right truncate">{mes}</span>
                                        <div className="flex-1 h-6 md:h-8 bg-surface-light rounded-lg overflow-hidden relative">
                                            <div className="absolute inset-y-0 left-0 bg-primary rounded-lg flex items-center justify-end pr-2 md:pr-3" style={{ width: `${Math.max((data.ingresos / max) * 100, 15)}%` }}>
                                                <span className="text-[9px] md:text-xs font-bold text-white drop-shadow">{formatCurrency(data.ingresos)}</span>
                                            </div>
                                        </div>
                                        <span className="w-6 md:w-8 text-[10px] md:text-xs font-medium text-text-muted text-center">{data.reservas}</span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Próximas Reservas - 1 col */}
                    <div className="bg-white rounded-lg md:rounded-xl p-3 md:p-6 shadow-sm border border-border-card">
                        <div className="flex items-center justify-between mb-3 md:mb-4">
                            <h3 className="text-sm md:text-base font-bold text-gray-900">Próximas</h3>
                            <span className="text-[10px] md:text-xs text-text-muted">{upcomingReservations.length} reservas</span>
                        </div>
                        <div className="space-y-2 md:space-y-3">
                            {upcomingReservations.slice(0, 4).map((r, i) => {
                                const daysUntil = getDaysUntil(r.fechaInicioDate)
                                return (
                                    <div key={i} className="flex items-center gap-2 md:gap-3 p-2 md:p-3 bg-surface-light rounded-lg">
                                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-success-bg flex items-center justify-center">
                                            <span className="material-symbols-outlined text-icon-color text-base md:text-lg">person</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs md:text-sm font-semibold text-gray-900 truncate">{r.cliente}</p>
                                            <p className="text-[10px] md:text-xs text-text-muted">{r.noches}N</p>
                                        </div>
                                        <div className="text-right">
                                            <span className={`px-1.5 md:px-2 py-0.5 md:py-1 rounded text-[10px] md:text-xs font-bold ${daysUntil !== null && daysUntil <= 0
                                                ? 'bg-primary text-white'
                                                : 'bg-gray-800 text-white'
                                                }`}>
                                                {daysUntil !== null && daysUntil <= 0
                                                    ? 'Hoy'
                                                    : daysUntil === 1
                                                        ? 'Mañana'
                                                        : `${daysUntil}d`}
                                            </span>
                                        </div>
                                    </div>
                                )
                            })}
                            {upcomingReservations.length === 0 && <p className="text-xs text-text-muted text-center py-4">No hay próximas reservas</p>}
                        </div>
                    </div>
                </div>

                {/* Stats Row - Mobile optimized */}
                <div className="grid grid-cols-4 gap-2 md:gap-4 mb-4 md:mb-6">
                    <div className="bg-white rounded-lg md:rounded-xl p-2 md:p-4 shadow-sm border border-border-card text-center">
                        <p className="text-lg md:text-3xl font-bold text-primary">{totalReservas}</p>
                        <p className="text-[9px] md:text-xs text-text-muted mt-0.5 md:mt-1">Reservas</p>
                    </div>
                    <div className="bg-white rounded-lg md:rounded-xl p-2 md:p-4 shadow-sm border border-border-card text-center">
                        <p className="text-lg md:text-3xl font-bold text-primary">{reservasConfirmadas}</p>
                        <p className="text-[9px] md:text-xs text-text-muted mt-0.5 md:mt-1">Conf.</p>
                    </div>
                    <div className="bg-white rounded-lg md:rounded-xl p-2 md:p-4 shadow-sm border border-border-card text-center">
                        <p className="text-lg md:text-3xl font-bold text-primary">{totalNoches}</p>
                        <p className="text-[9px] md:text-xs text-text-muted mt-0.5 md:mt-1">Noches</p>
                    </div>
                    <div className="bg-white rounded-lg md:rounded-xl p-2 md:p-4 shadow-sm border border-border-card text-center">
                        <p className="text-lg md:text-3xl font-bold text-primary">{occupancyRate}%</p>
                        <p className="text-[9px] md:text-xs text-text-muted mt-0.5 md:mt-1">Ocupación</p>
                    </div>
                </div>


                {/* Detailed Próximas Reservas Table */}
                <div className="bg-white rounded-xl shadow-sm border border-border-card overflow-hidden mt-6">
                    <div className="flex items-center justify-between p-5 border-b border-border-card">
                        <h3 className="text-base font-bold text-gray-900">Próximas Reservas - Detalle Completo</h3>
                        <span className="text-xs text-text-muted">{upcomingReservations.length} reservas próximas</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-surface-light">
                                <tr>
                                    <th className="text-left py-3 px-4 font-semibold text-text-muted uppercase text-xs whitespace-nowrap">Nombre</th>
                                    <th className="text-left py-3 px-4 font-semibold text-text-muted uppercase text-xs whitespace-nowrap">Teléfono</th>
                                    <th className="text-left py-3 px-4 font-semibold text-text-muted uppercase text-xs whitespace-nowrap">Entrada</th>
                                    <th className="text-left py-3 px-4 font-semibold text-text-muted uppercase text-xs whitespace-nowrap">Salida</th>
                                    <th className="text-center py-3 px-4 font-semibold text-text-muted uppercase text-xs whitespace-nowrap">Huéspedes</th>
                                    <th className="text-center py-3 px-4 font-semibold text-text-muted uppercase text-xs whitespace-nowrap">Noches</th>
                                    <th className="text-left py-3 px-4 font-semibold text-text-muted uppercase text-xs whitespace-nowrap">Plataforma</th>
                                    <th className="text-left py-3 px-4 font-semibold text-text-muted uppercase text-xs whitespace-nowrap">Registro</th>
                                    <th className="text-right py-3 px-4 font-semibold text-text-muted uppercase text-xs whitespace-nowrap">Valor</th>
                                    <th className="text-right py-3 px-4 font-semibold text-text-muted uppercase text-xs whitespace-nowrap">Abono</th>
                                    <th className="text-right py-3 px-4 font-semibold text-text-muted uppercase text-xs whitespace-nowrap">Saldo</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {upcomingReservations.map((r, i) => (
                                    <tr key={i} className="hover:bg-surface-light transition-colors">
                                        <td className="py-3 px-4 whitespace-nowrap">
                                            <span className="font-semibold text-gray-900">{r.cliente}</span>
                                        </td>
                                        <td className="py-3 px-4 text-text-muted whitespace-nowrap">{r.telefono}</td>
                                        <td className="py-3 px-4 text-text-main-light whitespace-nowrap">{formatShortDate(r.fechaInicio)}</td>
                                        <td className="py-3 px-4 text-text-main-light whitespace-nowrap">{formatShortDate(r.fechaSalida)}</td>
                                        <td className="py-3 px-4 text-center font-medium text-text-main-light whitespace-nowrap">{r.huespedes || '-'}</td>
                                        <td className="py-3 px-4 text-center whitespace-nowrap">
                                            <span className="px-2 py-1 bg-primary text-white rounded-full text-xs font-bold">{r.noches}</span>
                                        </td>
                                        <td className="py-3 px-4 whitespace-nowrap">
                                            <span className="px-2 py-1 rounded text-xs font-medium bg-primary text-white">
                                                {r.fuente}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 whitespace-nowrap">
                                            {r.isRegistered ? (
                                                <span className="px-2 py-1 rounded text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                                                    Usuario Registrado
                                                </span>
                                            ) : (
                                                <span className="px-2 py-1 rounded text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                                                    Usuario No registrado
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-right font-bold text-gray-900 whitespace-nowrap">{formatCurrency(r.total)}</td>
                                        <td className="py-3 px-4 text-right font-medium text-success-text whitespace-nowrap">{formatCurrency(r.abonos)}</td>
                                        <td className="py-3 px-4 text-right font-medium text-primary whitespace-nowrap">{formatCurrency(r.saldoPendiente)}</td>
                                    </tr>
                                ))}
                                {upcomingReservations.length === 0 && (
                                    <tr><td colSpan="10" className="py-8 text-center text-text-muted">No hay reservas próximas</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Platform Distribution */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-border-card">
                        <h3 className="text-base font-bold text-gray-900 mb-4">Ingresos por Plataforma</h3>
                        <div className="space-y-3">
                            {Object.entries(bySource).map(([fuente, total]) => {
                                const percentage = totalIngresos > 0 ? ((total / totalIngresos) * 100).toFixed(1) : 0
                                return (
                                    <div key={fuente} className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-xs bg-primary">
                                            {fuente.slice(0, 3).toUpperCase()}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between mb-1">
                                                <span className="text-sm font-medium text-gray-900">{fuente}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-medium text-text-muted">({percentage}%)</span>
                                                    <span className="text-sm font-bold text-gray-900">{formatCurrency(total)}</span>
                                                </div>
                                            </div>
                                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full bg-primary"
                                                    style={{ width: `${percentage}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-border-card">
                        <h3 className="text-base font-bold text-gray-900 mb-4">Indicadores Clave</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {/* Promedio de estadía */}
                            <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="material-symbols-outlined text-primary text-lg">hotel</span>
                                    <span className="text-xs font-medium text-text-muted">Estadía Prom.</span>
                                </div>
                                <p className="text-2xl font-bold text-primary">{totalReservas > 0 ? (totalNoches / totalReservas).toFixed(1) : 0}</p>
                                <p className="text-xs text-text-muted">noches por reserva</p>
                            </div>
                            {/* Huéspedes promedio */}
                            <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="material-symbols-outlined text-primary text-lg">groups</span>
                                    <span className="text-xs font-medium text-text-muted">Huéspedes Prom.</span>
                                </div>
                                <p className="text-2xl font-bold text-primary">
                                    {totalReservas > 0 ? (filteredData.filter(r => validStatus(r.estado)).reduce((s, r) => s + r.huespedes, 0) / totalReservas).toFixed(1) : 0}
                                </p>
                                <p className="text-xs text-text-muted">por reserva</p>
                            </div>
                            {/* Mejor mes */}
                            <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="material-symbols-outlined text-primary text-lg">emoji_events</span>
                                    <span className="text-xs font-medium text-text-muted">Mejor Mes</span>
                                </div>
                                <p className="text-2xl font-bold text-primary">
                                    {byMonthSorted.length > 0 ? byMonthSorted.reduce((max, curr) => curr[1].ingresos > max[1].ingresos ? curr : max)[0].slice(0, 3) : '-'}
                                </p>
                                <p className="text-xs text-text-muted">
                                    {byMonthSorted.length > 0 ? formatCurrency(byMonthSorted.reduce((max, curr) => curr[1].ingresos > max[1].ingresos ? curr : max)[1].ingresos) : '-'}
                                </p>
                            </div>
                            {/* Ingreso por noche */}
                            <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="material-symbols-outlined text-primary text-lg">payments</span>
                                    <span className="text-xs font-medium text-text-muted">Ingreso/Noche</span>
                                </div>
                                <p className="text-2xl font-bold text-primary">
                                    {totalNoches > 0 ? formatCurrency(Math.round(totalIngresos / totalNoches)) : '-'}
                                </p>
                                <p className="text-xs text-text-muted">promedio</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
