import { useState, useEffect } from 'react'
import { fetchAllCalendars } from '../../utils/icalParser'

export default function Calendario() {
    const [events, setEvents] = useState([])
    const [loading, setLoading] = useState(true)
    const [currentDate, setCurrentDate] = useState(new Date())
    const [config, setConfig] = useState(null)
    const [siteColors, setSiteColors] = useState({
        todayBorder: '#3db814',
        todayText: '#2a8a0e',
        todayPulse: '#00a658',
        platformAirbnb: '#2f4858',
        platformBooking: '#006076',
        platformGoogle: '#0094a8'
    })

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
                        todayBorder: configData.siteColors.todayBorder || prev.todayBorder,
                        todayText: configData.siteColors.todayText || prev.todayText,
                        todayPulse: configData.siteColors.todayPulse || prev.todayPulse,
                        platformAirbnb: configData.siteColors.platformAirbnb || prev.platformAirbnb,
                        platformBooking: configData.siteColors.platformBooking || prev.platformBooking,
                        platformGoogle: configData.siteColors.platformGoogle || prev.platformGoogle
                    }))
                }
            }
        }
        loadConfig()
        loadCalendars()
    }, [])

    const loadCalendars = async () => {
        setLoading(true)
        try {
            const allEvents = await fetchAllCalendars()
            setEvents(allEvents)
        } catch (error) {
            console.error('Error loading calendars:', error)
        }
        setLoading(false)
    }

    const getDaysInMonth = (date) => {
        const year = date.getFullYear()
        const month = date.getMonth()
        const firstDay = new Date(year, month, 1)
        const lastDay = new Date(year, month + 1, 0)
        return {
            daysInMonth: lastDay.getDate(),
            startingDay: firstDay.getDay(),
            year,
            month
        }
    }

    const { daysInMonth, startingDay, year, month } = getDaysInMonth(currentDate)
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
    const dayNames = ['D', 'L', 'M', 'M', 'J', 'V', 'S']

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

    const today = new Date()
    const isToday = (day) => day === today.getDate() && month === today.getMonth() && year === today.getFullYear()

    // Obtener color de plataforma con colores configurables
    const getPlatformColor = (source) => {
        switch (source?.toLowerCase()) {
            case 'airbnb': return siteColors.platformAirbnb
            case 'booking': return siteColors.platformBooking
            case 'google': return siteColors.platformGoogle
            default: return '#888888'
        }
    }

    // Modificado para detectar múltiples plataformas por día
    const getDayStatus = (day) => {
        const dateStr = new Date(year, month, day)
        dateStr.setHours(0, 0, 0, 0)

        // Buscar TODAS las reservas que cubren este día
        const reservedEvents = events.filter(event => {
            const start = new Date(event.start); start.setHours(0, 0, 0, 0)
            const end = new Date(event.end); end.setHours(0, 0, 0, 0)
            return dateStr >= start && dateStr < end
        })

        if (reservedEvents.length > 0) {
            // Obtener plataformas únicas
            const uniquePlatforms = [...new Set(reservedEvents.map(e => e.source))]
            const platforms = uniquePlatforms.map(source => ({
                source,
                color: getPlatformColor(source)
            }))
            return {
                status: 'reserved',
                events: reservedEvents,
                platforms
            }
        }
        if (dateStr < new Date().setHours(0, 0, 0, 0)) return { status: 'past', events: [], platforms: [] }
        return { status: 'available', events: [], platforms: [] }
    }

    // Generate calendar grid
    const days = []
    for (let i = 0; i < startingDay; i++) days.push(null)
    for (let i = 1; i <= daysInMonth; i++) days.push(i)

    return (
        <>
            <header className="bg-white border-b border-border-card px-3 md:px-6 py-3 md:py-4">
                <div className="flex flex-col gap-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                            <h1 className="text-xl md:text-2xl font-black text-gray-900">Calendario de Ocupación</h1>
                            <p className="text-text-subtitle dark:text-text-subtitle-dark text-sm">Vista consolidada de reservas (Airbnb, Booking, Google)</p>
                        </div>
                        <button
                            onClick={loadCalendars}
                            disabled={loading}
                            className="bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 disabled:opacity-50"
                        >
                            <span className={`material-symbols-outlined text-lg ${loading ? 'animate-spin' : ''}`}>sync</span>
                            {loading ? 'Sincronizando...' : 'Sincronizar'}
                        </button>
                    </div>
                    <div className="h-2 w-full rounded-full bg-icon-bg-secondary dark:bg-border-card-dark relative overflow-hidden">
                        <div className="absolute top-0 left-0 h-full w-full bg-primary rounded-full"></div>
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-6 pt-4">
                {/* EXACT COPY of Booking.jsx calendar design */}
                <div className="bg-surface-card dark:bg-surface-card-dark rounded-xl p-6 shadow-sm border border-border-card dark:border-border-card-dark max-w-4xl mx-auto">
                    <div className="flex flex-col xl:flex-row gap-8 justify-center">
                        <div className="flex-1 min-w-[300px]">
                            {/* Month Navigation */}
                            <div className="flex items-center justify-between mb-4">
                                <button onClick={prevMonth} className="size-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
                                    <span className="material-symbols-outlined text-gray-700">chevron_left</span>
                                </button>
                                <span className="text-lg font-bold text-gray-900">{monthNames[month]} {year}</span>
                                <button onClick={nextMonth} className="size-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
                                    <span className="material-symbols-outlined text-gray-700">chevron_right</span>
                                </button>
                            </div>

                            {/* Day Headers - EXACT from Booking.jsx */}
                            <div className="grid grid-cols-7 gap-1 text-center mb-2">
                                {dayNames.map((d, i) => <span key={i} className="text-xs font-bold text-text-muted">{d}</span>)}
                            </div>

                            {/* Calendar Grid - Same classes as Booking.jsx */}
                            <div className="grid grid-cols-7 gap-1">
                                {days.map((day, index) => {
                                    if (!day) return <span key={index}></span>

                                    const { status, events: dayEvents, platforms } = getDayStatus(day)
                                    let buttonClass = "h-10 w-full rounded-lg flex items-center justify-center text-sm relative "

                                    if (status === 'reserved') {
                                        // Reserved: Dark gray background
                                        buttonClass += "bg-gray-800 text-white font-bold shadow-md"
                                    } else if (status === 'past') {
                                        // Past: Light gray background
                                        buttonClass += "bg-gray-200 text-gray-400 cursor-not-allowed"
                                    } else if (isToday(day)) {
                                        // Today: Green border
                                        buttonClass += "border-2 border-primary text-primary font-bold bg-white"
                                    } else {
                                        // Available: Hover effect
                                        buttonClass += "hover:bg-gray-100 text-gray-700 transition-colors"
                                    }

                                    return (
                                        <button
                                            key={index}
                                            className={buttonClass}
                                            title={dayEvents?.length > 0 ? dayEvents.map(e => `${e.source}: ${e.title || 'Reserva'}`).join(', ') : ''}
                                        >
                                            {day}
                                            {/* Platform color lines */}
                                            {status === 'reserved' && platforms.length > 0 && (
                                                <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 flex gap-0.5">
                                                    {platforms.slice(0, 3).map((p, i) => (
                                                        <span
                                                            key={i}
                                                            className="w-4 h-1 rounded-full"
                                                            style={{ backgroundColor: p.color }}
                                                            title={p.source}
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                            {/* Today indicator dot */}
                                            {isToday(day) && status !== 'reserved' && (
                                                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                                                    <span
                                                        className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-primary"
                                                    ></span>
                                                    <span
                                                        className="relative inline-flex rounded-full h-2 w-2 bg-primary"
                                                    ></span>
                                                </span>
                                            )}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Legend - Centered */}
                    <div className="mt-6 flex flex-wrap justify-center gap-6 text-sm text-gray-600 border-t border-gray-200 pt-4">
                        <div className="flex items-center gap-2">
                            <div className="size-3 rounded-full bg-gray-800"></div>
                            <span>Reservado</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="size-3 rounded-full border border-gray-300 bg-white"></div>
                            <span>Disponible</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="size-3 rounded-full bg-gray-200"></div>
                            <span>Pasado</span>
                        </div>
                    </div>
                </div>

                {/* Platform Sources Legend - con colores configurables */}
                <div className="mt-8 flex justify-center gap-6 max-w-4xl mx-auto">
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: siteColors.platformAirbnb }}></span>
                        <span className="text-sm font-medium text-text-muted dark:text-text-muted">Airbnb</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: siteColors.platformBooking }}></span>
                        <span className="text-sm font-medium text-text-muted dark:text-text-muted">Booking</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: siteColors.platformGoogle }}></span>
                        <span className="text-sm font-medium text-text-muted dark:text-text-muted">Google</span>
                    </div>
                </div>
            </div >
        </>
    )
}
