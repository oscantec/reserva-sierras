import { useState, useEffect, useMemo } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { fetchAllCalendars } from '../utils/icalParser'

export default function Booking() {
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [reservedDates, setReservedDates] = useState([])
    const [selectedRange, setSelectedRange] = useState({ start: null, end: null })
    const [isLoading, setIsLoading] = useState(true)
    const [pricing, setPricing] = useState(null)
    const [siteColors, setSiteColors] = useState({
        discountText: '#3db814'
    })
    const [pageContent, setPageContent] = useState({
        pageTitle: 'Reserva tu escape',
        pageSubtitle: 'Selecciona tus fechas de llegada y salida.',
        stepIndicator: 'Paso 1 de 4',
        stepLabel: 'Fechas',
        tarifasTitle: 'Nuestras Tarifas',
        weekdayLabel: 'Lun - Jue',
        weekdayDesc: 'Perfecto para desconectar y trabajar en remoto.',
        weekendLabel: 'Vie - Dom',
        weekendDesc: 'Disfruta de actividades al aire libre y eventos.',
        discountDesc: 'días y ahorra.',
        sidebarTitle: 'Tu Reserva',
        arrivalLabel: 'Llegada',
        departureLabel: 'Salida',
        continueButton: 'Continuar Reserva',
        emptyCalendarText: 'Selecciona fechas en el calendario para ver el precio'
    })

    // Fetch iCal events on mount
    useEffect(() => {
        const fetchReservations = async () => {
            setIsLoading(true)
            try {
                const events = await fetchAllCalendars()
                // Convert events to array of reserved date ranges
                const reserved = events.map(event => ({
                    start: new Date(event.start),
                    end: new Date(event.end),
                    source: event.source,
                    title: event.title
                }))
                setReservedDates(reserved)
            } catch (error) {
                console.error('Error fetching calendars:', error)
            }
            setIsLoading(false)
        }
        fetchReservations()
    }, [])

    // Load pricing from localStorage
    useEffect(() => {
        const config = JSON.parse(localStorage.getItem('casacampestre_config') || '{}')
        if (config.pricing) {
            setPricing(config.pricing)
        }
        if (config.siteColors?.discountText) {
            setSiteColors(prev => ({
                ...prev,
                discountText: config.siteColors.discountText
            }))
        }
        // Load page content
        if (config.reservasContent) {
            setPageContent(prev => ({ ...prev, ...config.reservasContent }))
        }
    }, [])

    // Check if a date is reserved
    const isDateReserved = (date) => {
        return reservedDates.some(reservation => {
            const checkDate = new Date(date)
            checkDate.setHours(0, 0, 0, 0)
            const start = new Date(reservation.start)
            start.setHours(0, 0, 0, 0)
            const end = new Date(reservation.end)
            end.setHours(0, 0, 0, 0)
            return checkDate >= start && checkDate < end
        })
    }

    // Check if date is in past
    const isDatePast = (date) => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        return date < today
    }

    // Helper para normalizar fecha a solo día (sin hora)
    const getDateOnly = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()

    // Check if date is in selected range (excluyendo inicio y fin)
    const isDateInRange = (date) => {
        if (!selectedRange.start || !selectedRange.end) return false
        const d = getDateOnly(date)
        const s = getDateOnly(selectedRange.start)
        const e = getDateOnly(selectedRange.end)
        return d > s && d < e
    }

    const isStartDate = (date) => selectedRange.start && getDateOnly(date) === getDateOnly(selectedRange.start)
    const isEndDate = (date) => selectedRange.end && getDateOnly(date) === getDateOnly(selectedRange.end)

    // Calculate calendar days
    const calendarDays = useMemo(() => {
        const year = currentMonth.getFullYear()
        const month = currentMonth.getMonth()
        const firstDay = new Date(year, month, 1)
        const lastDay = new Date(year, month + 1, 0)
        const startPadding = firstDay.getDay()
        const days = []

        // Add padding for days before month starts
        for (let i = 0; i < startPadding; i++) {
            days.push(null)
        }

        // Add all days in month
        for (let d = 1; d <= lastDay.getDate(); d++) {
            days.push(new Date(year, month, d))
        }

        return days
    }, [currentMonth])

    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

    const navigateMonth = (direction) => {
        setCurrentMonth(prev => {
            const newMonth = new Date(prev)
            newMonth.setMonth(newMonth.getMonth() + direction)
            return newMonth
        })
    }

    const handleDateClick = (date) => {
        if (isDateReserved(date) || isDatePast(date)) return

        if (!selectedRange.start || (selectedRange.start && selectedRange.end)) {
            // Start new selection
            setSelectedRange({ start: date, end: null })
        } else {
            // Complete selection
            if (date < selectedRange.start) {
                setSelectedRange({ start: date, end: selectedRange.start })
            } else {
                setSelectedRange({ start: selectedRange.start, end: date })
            }
        }
    }

    // Calculate nights and total
    const nights = selectedRange.start && selectedRange.end
        ? Math.ceil((selectedRange.end - selectedRange.start) / (1000 * 60 * 60 * 24))
        : 0

    // Helper: Check if a date is a weekend day (Fri=5, Sat=6, Sun=0)
    const isWeekendDay = (date) => {
        const day = date.getDay()
        return day === 5 || day === 6 || day === 0
    }

    // Helper: Check if a date matches a special date
    const getSpecialDatePrice = (date) => {
        if (!pricing?.specialDates) return null
        const dateStr = date.toISOString().split('T')[0]
        const special = pricing.specialDates.find(s => s.date === dateStr)
        return special?.price || null
    }

    // Helper: Get season multiplier for a date
    const getSeasonMultiplier = (date) => {
        if (!pricing?.seasons) return 1
        const month = date.getMonth() + 1
        const day = date.getDate()

        for (const season of pricing.seasons) {
            let inSeason = false

            // Handle seasons that span year boundary (e.g., Dec 15 - Jan 15)
            if (season.startMonth > season.endMonth) {
                // Season crosses year boundary
                if (month > season.startMonth || (month === season.startMonth && day >= season.startDay)) {
                    inSeason = true
                } else if (month < season.endMonth || (month === season.endMonth && day <= season.endDay)) {
                    inSeason = true
                }
            } else {
                // Normal season within same year
                if ((month > season.startMonth || (month === season.startMonth && day >= season.startDay)) &&
                    (month < season.endMonth || (month === season.endMonth && day <= season.endDay))) {
                    inSeason = true
                }
            }

            if (inSeason) return season.multiplier
        }
        return 1
    }

    // Calculate price for a single night (check-in date)
    const getPriceForNight = (date) => {
        // 1. Check special dates first
        const specialPrice = getSpecialDatePrice(date)
        if (specialPrice) return { price: specialPrice, type: 'special' }

        // 2. Get base rate based on day of week
        const baseRate = isWeekendDay(date)
            ? (pricing?.baseRates?.weekend || 450000)
            : (pricing?.baseRates?.weekday || 350000)

        // 3. Apply season multiplier
        const multiplier = getSeasonMultiplier(date)
        const finalPrice = Math.round(baseRate * multiplier)

        return {
            price: finalPrice,
            type: isWeekendDay(date) ? 'weekend' : 'weekday',
            multiplier: multiplier
        }
    }

    // Calculate detailed pricing breakdown
    const calculatePricing = () => {
        if (!selectedRange.start || !selectedRange.end || nights === 0) {
            return { subtotal: 0, weekdayNights: 0, weekendNights: 0, specialNights: 0, breakdown: [] }
        }

        let subtotal = 0
        let weekdayNights = 0
        let weekendNights = 0
        let specialNights = 0
        const breakdown = []

        // Iterate through each night (not including checkout day)
        const current = new Date(selectedRange.start)
        while (current < selectedRange.end) {
            const { price, type, multiplier } = getPriceForNight(current)
            subtotal += price

            if (type === 'special') specialNights++
            else if (type === 'weekend') weekendNights++
            else weekdayNights++

            breakdown.push({
                date: new Date(current),
                price,
                type,
                multiplier
            })

            current.setDate(current.getDate() + 1)
        }

        return { subtotal, weekdayNights, weekendNights, specialNights, breakdown }
    }

    const pricingDetails = calculatePricing()

    // Apply long stay discount
    const longStayDiscount = pricing?.discounts?.longStay
    const applyLongStayDiscount = longStayDiscount?.enabled && nights >= (longStayDiscount?.nights || 7)
    const discountPercent = applyLongStayDiscount ? (longStayDiscount?.percent || 15) : 0
    const discountAmount = Math.round(pricingDetails.subtotal * (discountPercent / 100))

    // Cleaning fee (respect toggle)
    const cleaningEnabled = pricing?.baseRates?.cleaningEnabled !== false
    const cleaningFee = cleaningEnabled ? (pricing?.baseRates?.cleaningFee || 80000) : 0

    // Subtotal after discount
    const subtotalAfterDiscount = pricingDetails.subtotal - discountAmount

    // IVA (respect toggle)
    const ivaEnabled = pricing?.baseRates?.ivaEnabled === true
    const ivaPercent = pricing?.baseRates?.ivaPercent || 19
    const taxes = ivaEnabled ? Math.round((subtotalAfterDiscount + cleaningFee) * (ivaPercent / 100)) : 0

    // Total
    const total = subtotalAfterDiscount + cleaningFee + taxes

    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(price)
    }

    const formatDate = (date) => {
        if (!date) return '-'
        return date.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })
    }

    return (
        <div className="flex flex-col min-h-screen bg-page-bg-reservas dark:bg-surface-card-dark text-text-main dark:text-white font-display">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 flex flex-col lg:flex-row gap-8 w-full">
                <div className="flex-1 flex flex-col gap-8">
                    <div className="flex flex-col gap-3">
                        <div className="flex justify-between items-end">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em] mb-2">{pageContent.pageTitle}</h1>
                                <p className="text-text-subtitle dark:text-text-subtitle-dark text-base">{pageContent.pageSubtitle}</p>
                            </div>
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-bold text-primary">{pageContent.stepIndicator}</p>
                                <p className="text-xs text-text-muted dark:text-text-muted">{pageContent.stepLabel}</p>
                            </div>
                        </div>
                        <div className="h-2 w-full rounded-full bg-icon-bg-secondary dark:bg-border-card-dark mt-2 relative overflow-hidden">
                            <div className="absolute top-0 left-0 h-full w-[25%] bg-primary rounded-full"></div>
                        </div>
                    </div>

                    <div className="bg-surface-card dark:bg-surface-card-dark rounded-xl p-6 shadow-sm border border-border-card dark:border-border-card-dark">
                        <div className="flex flex-col xl:flex-row gap-8 justify-center">
                            <div className="flex-1 min-w-[300px]">
                                {/* Month Navigation */}
                                <div className="flex items-center justify-between mb-4">
                                    <button
                                        onClick={() => navigateMonth(-1)}
                                        className="w-10 h-10 flex items-center justify-center bg-icon-bg-primary dark:bg-icon-bg-dark rounded-lg hover:bg-primary hover:text-white transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-icon-color">chevron_left</span>
                                    </button>
                                    <span className="text-lg font-bold">{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</span>
                                    <button
                                        onClick={() => navigateMonth(1)}
                                        className="w-10 h-10 flex items-center justify-center bg-icon-bg-primary dark:bg-icon-bg-dark rounded-lg hover:bg-primary hover:text-white transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-icon-color">chevron_right</span>
                                    </button>
                                </div>

                                {/* Day Headers */}
                                <div className="grid grid-cols-7 gap-1 text-center mb-2">
                                    {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((d, i) => (
                                        <span key={i} className="text-xs font-bold text-text-muted">{d}</span>
                                    ))}
                                </div>

                                {/* Calendar Grid */}
                                <div className="grid grid-cols-7 gap-1">
                                    {isLoading ? (
                                        <div className="col-span-7 py-12 text-center text-text-muted">
                                            <span className="material-symbols-outlined animate-spin text-3xl">sync</span>
                                            <p className="mt-2">Cargando disponibilidad...</p>
                                        </div>
                                    ) : (
                                        calendarDays.map((date, index) => {
                                            if (!date) {
                                                return <span key={index}></span>
                                            }

                                            const reserved = isDateReserved(date)
                                            const past = isDatePast(date)
                                            const isStart = isStartDate(date)
                                            const isEnd = isEndDate(date)
                                            const inRange = isDateInRange(date)

                                            let className = "h-10 w-full flex items-center justify-center text-sm transition-colors "

                                            if (reserved || past) {
                                                className += "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed line-through"
                                            } else if (isStart && isEnd) {
                                                // Solo un día seleccionado
                                                className += "rounded-full bg-primary text-white font-bold shadow-md shadow-card-sm"
                                            } else if (isStart) {
                                                className += "rounded-l-full bg-primary text-white font-bold shadow-md shadow-card-sm"
                                            } else if (isEnd) {
                                                className += "rounded-r-full bg-primary text-white font-bold shadow-md shadow-card-sm"
                                            } else if (inRange) {
                                                className += "bg-primary text-white font-medium"
                                            } else {
                                                className += "rounded-lg hover:bg-icon-bg-primary dark:hover:bg-icon-bg-dark hover:text-primary cursor-pointer"
                                            }

                                            return (
                                                <button
                                                    key={index}
                                                    onClick={() => handleDateClick(date)}
                                                    disabled={reserved || past}
                                                    className={className}
                                                >
                                                    {date.getDate()}
                                                </button>
                                            )
                                        })
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="mt-6 flex flex-wrap gap-4 text-sm text-text-muted dark:text-text-muted border-t border-border-card dark:border-border-card-dark pt-4">
                            <div className="flex items-center gap-2">
                                <div className="size-3 rounded-full bg-primary"></div>
                                <span>Seleccionado</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="size-3 rounded-full border border-gray-300 bg-white dark:bg-gray-700"></div>
                                <span>Disponible</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="size-3 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                                <span>Reservado</span>
                            </div>
                        </div>
                    </div>

                    {/* Pricing Cards */}
                    <div>
                        <h3 className="text-xl font-bold mb-4">{pageContent.tarifasTitle}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-surface-card dark:bg-surface-card-dark rounded-xl p-5 border border-border-card dark:border-border-card-dark flex flex-col gap-2 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start">
                                    <div className="p-2 bg-icon-bg-primary dark:bg-icon-bg-dark rounded-lg text-icon-color">
                                        <span className="material-symbols-outlined">wb_twilight</span>
                                    </div>
                                    <span className="text-xs font-bold uppercase tracking-wider text-text-muted">{pageContent.weekdayLabel}</span>
                                </div>
                                <p className="text-3xl font-bold mt-2">
                                    {pricing ? formatPrice(pricing.baseRates?.weekday || 350000) : '$350.000'}
                                    <span className="text-sm font-normal text-text-muted">/noche</span>
                                </p>
                                <p className="text-sm text-text-muted dark:text-text-muted">{pageContent.weekdayDesc}</p>
                            </div>
                            <div className="bg-surface-card dark:bg-surface-card-dark rounded-xl p-5 pt-8 border border-primary/30 flex flex-col gap-2 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">POPULAR</div>
                                <div className="flex justify-between items-start">
                                    <div className="p-2 bg-icon-bg-primary dark:bg-icon-bg-dark rounded-lg text-icon-color">
                                        <span className="material-symbols-outlined">weekend</span>
                                    </div>
                                    <span className="text-xs font-bold uppercase tracking-wider text-primary">{pageContent.weekendLabel}</span>
                                </div>
                                <p className="text-3xl font-bold mt-2 text-primary">
                                    {pricing ? formatPrice(pricing.baseRates?.weekend || 450000) : '$450.000'}
                                    <span className="text-sm font-normal text-text-muted dark:text-text-muted">/noche</span>
                                </p>
                                <p className="text-sm text-text-muted dark:text-text-muted">{pageContent.weekendDesc}</p>
                            </div>
                            <div className="bg-surface-card dark:bg-surface-card-dark rounded-xl p-5 border border-border-card dark:border-border-card-dark flex flex-col gap-2 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start">
                                    <div className="p-2 bg-icon-bg-primary dark:bg-icon-bg-dark rounded-lg text-icon-color">
                                        <span className="material-symbols-outlined">date_range</span>
                                    </div>
                                    <span
                                        className="text-xs font-bold uppercase tracking-wider"
                                        style={{ color: siteColors.discountText }}
                                    >
                                        {pricing?.discounts?.longStay?.percent || 15}% OFF
                                    </span>
                                </div>
                                <p className="text-3xl font-bold mt-2">
                                    {formatPrice((pricing?.baseRates?.weekend || 450000) * (1 - (pricing?.discounts?.longStay?.percent || 15) / 100))}
                                    <span className="text-sm font-normal text-text-muted">/noche</span>
                                </p>
                                <p className="text-sm text-text-muted dark:text-text-muted">
                                    Reserva {pricing?.discounts?.longStay?.nights || 7}+ {pageContent.discountDesc}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Summary */}
                <div className="lg:w-[380px] shrink-0">
                    <div className="sticky top-24 flex flex-col gap-6">
                        <div className="bg-surface-card dark:bg-surface-card-dark rounded-2xl p-6 shadow-xl shadow-gray-200/50 dark:shadow-black/20 border border-border-card dark:border-border-card-dark">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold">Tu Reserva</h3>
                                <span className="bg-icon-bg-primary dark:bg-icon-bg-dark text-icon-color text-xs font-bold px-2 py-1 rounded">
                                    {nights} {nights === 1 ? 'Noche' : 'Noches'}
                                </span>
                            </div>
                            <div className="flex gap-4 mb-6">
                                <div className="flex-1 p-3 rounded-lg border border-border-card dark:border-border-card-dark bg-background-light dark:bg-background-dark">
                                    <p className="text-xs text-text-muted uppercase font-bold mb-1">Llegada</p>
                                    <p className="font-bold text-sm">{formatDate(selectedRange.start)}</p>
                                </div>
                                <div className="flex-1 p-3 rounded-lg border border-border-card dark:border-border-card-dark bg-background-light dark:bg-background-dark">
                                    <p className="text-xs text-text-muted uppercase font-bold mb-1">Salida</p>
                                    <p className="font-bold text-sm">{formatDate(selectedRange.end)}</p>
                                </div>
                            </div>
                            {nights > 0 && (
                                <>
                                    <div className="flex flex-col gap-2 mb-6">
                                        {/* Nights breakdown */}
                                        {pricingDetails.weekdayNights > 0 && (
                                            <div className="flex justify-between text-sm text-text-muted dark:text-text-muted">
                                                <span>{formatPrice(pricing?.baseRates?.weekday || 350000)} x {pricingDetails.weekdayNights} {pricingDetails.weekdayNights === 1 ? 'noche L-J' : 'noches L-J'}</span>
                                                <span>{formatPrice((pricing?.baseRates?.weekday || 350000) * pricingDetails.weekdayNights)}</span>
                                            </div>
                                        )}
                                        {pricingDetails.weekendNights > 0 && (
                                            <div className="flex justify-between text-sm text-text-muted dark:text-text-muted">
                                                <span>{formatPrice(pricing?.baseRates?.weekend || 450000)} x {pricingDetails.weekendNights} {pricingDetails.weekendNights === 1 ? 'noche V-D' : 'noches V-D'}</span>
                                                <span>{formatPrice((pricing?.baseRates?.weekend || 450000) * pricingDetails.weekendNights)}</span>
                                            </div>
                                        )}
                                        {pricingDetails.specialNights > 0 && (
                                            <div
                                                className="flex justify-between text-sm"
                                                style={{ color: siteColors.discountText }}
                                            >
                                                <span>⭐ {pricingDetails.specialNights} {pricingDetails.specialNights === 1 ? 'noche especial' : 'noches especiales'}</span>
                                                <span>Incluido</span>
                                            </div>
                                        )}

                                        {/* Subtotal */}
                                        <div className="flex justify-between text-sm font-medium text-text-main-light dark:text-text-muted pt-1">
                                            <span>Subtotal alojamiento</span>
                                            <span>{formatPrice(pricingDetails.subtotal)}</span>
                                        </div>

                                        {/* Long stay discount */}
                                        {applyLongStayDiscount && (
                                            <div className="flex justify-between text-sm text-success-text dark:text-green-400">
                                                <span>Descuento estadía larga (-{discountPercent}%)</span>
                                                <span>-{formatPrice(discountAmount)}</span>
                                            </div>
                                        )}

                                        {/* Cleaning fee */}
                                        {cleaningEnabled && cleaningFee > 0 && (
                                            <div className="flex justify-between text-sm text-text-muted dark:text-text-muted">
                                                <span>Tarifa de limpieza</span>
                                                <span>{formatPrice(cleaningFee)}</span>
                                            </div>
                                        )}

                                        {/* IVA */}
                                        {ivaEnabled && taxes > 0 && (
                                            <div className="flex justify-between text-sm text-text-muted dark:text-text-muted">
                                                <span>IVA ({ivaPercent}%)</span>
                                                <span>{formatPrice(taxes)}</span>
                                            </div>
                                        )}

                                        <div className="h-px bg-icon-bg-primary dark:bg-border-card-dark my-2"></div>
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold text-lg">Total</span>
                                            <span className="font-black text-2xl text-primary">{formatPrice(total)}</span>
                                        </div>
                                    </div>
                                    <button className="w-full h-12 rounded-lg bg-primary hover:bg-btn-primary-hover text-white font-bold text-base shadow-lg shadow-card transition-all transform active:scale-95 flex items-center justify-center gap-2">
                                        <span>Continuar Reserva</span>
                                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                    </button>
                                </>
                            )}
                            {nights === 0 && (
                                <p className="text-center text-text-muted text-sm py-4">
                                    Selecciona fechas en el calendario para ver el precio
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
