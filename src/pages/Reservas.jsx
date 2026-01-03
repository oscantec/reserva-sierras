import { useState, useEffect, useMemo } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { fetchAllCalendars } from '../utils/icalParser'
import { DEFAULT_CONFIG } from '../utils/config'
import { isHoliday, getHolidayName } from '../utils/holidays'
import PageHeader from '../components/PageHeader'

export default function Booking() {
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [reservedDates, setReservedDates] = useState([])
    const [selectedRange, setSelectedRange] = useState({ start: null, end: null })
    const [numberOfGuests, setNumberOfGuests] = useState(4) // Default 4 guests
    const [isLoading, setIsLoading] = useState(true)
    const [pricing, setPricing] = useState(DEFAULT_CONFIG.pricing)
    const [siteColors, setSiteColors] = useState({
        discountText: DEFAULT_CONFIG.siteColors?.discountText || '#3db814'
    })
    const [pageContent, setPageContent] = useState({
        pageTitle: DEFAULT_CONFIG.reservasContent?.pageTitle || 'Reserva tu hospedaje',
        pageSubtitle: DEFAULT_CONFIG.reservasContent?.pageSubtitle || 'Selecciona tus fechas de llegada y salida.',
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

    // Load pricing and content from API (overrides defaults and localStorage)
    useEffect(() => {
        const loadConfig = async () => {
            // 1. Try API first
            try {
                const response = await fetch('/api/config')
                if (response.ok) {
                    const config = await response.json()
                    if (Object.keys(config).length > 0) {
                        applyConfig(config)
                        localStorage.setItem('casacampestre_config', JSON.stringify(config))
                        return
                    }
                }
            } catch (e) {
                console.log('API not available, using localStorage')
            }

            // 2. Fallback to localStorage
            const saved = localStorage.getItem('casacampestre_config')
            if (saved) {
                applyConfig(JSON.parse(saved))
            }
        }

        const applyConfig = (config) => {
            if (config.pricing) {
                setPricing(prev => ({ ...DEFAULT_CONFIG.pricing, ...config.pricing }))
            }
            if (config.siteColors?.discountText) {
                setSiteColors(prev => ({
                    ...prev,
                    discountText: config.siteColors.discountText
                }))
            }
            if (config.reservasContent) {
                setPageContent(prev => ({ ...prev, ...config.reservasContent }))
            }
        }

        loadConfig()
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

    // Check if date is the start of an existing reservation
    const isDateStartOfReservation = (date) => {
        return reservedDates.some(reservation => {
            const checkDate = new Date(date)
            checkDate.setHours(0, 0, 0, 0)
            const start = new Date(reservation.start)
            start.setHours(0, 0, 0, 0)
            return checkDate.getTime() === start.getTime()
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

    // Helper para formatear fecha localmente YYYY-MM-DD
    const formatDateLocal = (date) => {
        const d = new Date(date)
        const year = d.getFullYear()
        const month = String(d.getMonth() + 1).padStart(2, '0')
        const day = String(d.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
    }

    // Check if date is in selected range (excluyendo inicio y fin)
    const isDateInRange = (date) => {
        if (!selectedRange.start || !selectedRange.end) return false
        const current = date.getTime()
        return current > selectedRange.start.getTime() && current < selectedRange.end.getTime()
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
        if (isDatePast(date)) return

        const reserved = isDateReserved(date)
        const isStartExisting = isDateStartOfReservation(date)

        // Si está reservado y NO es inicio de otra reserva, bloquear
        if (reserved && !isStartExisting) return

        // Si es inicio de otra reserva, solo permitir como fecha FIN de mi selección actual
        if (isStartExisting) {
            if (!selectedRange.start || (selectedRange.end)) return // No puedo empezar nueva reserva aquí
            if (date <= selectedRange.start) return // No puedo ir hacia atrás
        }

        if (!selectedRange.start || (selectedRange.start && selectedRange.end)) {
            // Start new selection (si es inicio de existente, ya retornó arriba)
            if (reserved) return
            setSelectedRange({ start: date, end: null })
        } else {
            // Complete selection - validate no reserved dates in between (EXCEPT the last day if it's just a check-in)
            const startDate = date < selectedRange.start ? date : selectedRange.start
            const endDate = date < selectedRange.start ? selectedRange.start : date

            // Check if any date in the range is reserved (excluding the checkout day if it allows checkin)
            const current = new Date(startDate)
            let hasReservedDate = false

            while (current < endDate) { // Check strictly dates BEFORE end date
                if (isDateReserved(current)) {
                    hasReservedDate = true
                    break
                }
                current.setDate(current.getDate() + 1)
            }

            // Check the last day specifically
            // It is invalid if it is reserved AND NOT the start of another reservation
            if (!hasReservedDate) {
                if (isDateReserved(endDate) && !isDateStartOfReservation(endDate)) {
                    hasReservedDate = true
                }
            }

            // Only set the range if there are no reserved dates
            if (!hasReservedDate) {
                if (date < selectedRange.start) {
                    setSelectedRange({ start: date, end: selectedRange.start })
                } else {
                    setSelectedRange({ start: selectedRange.start, end: date })
                }
            } else {
                // Reset selection if trying to cross a reserved date
                // Si intenta seleccionar una fecha reservada inválida, reiniciamos O simplemente no hacemos nada
                if (!isDateReserved(date) || isDateStartOfReservation(date)) {
                    // Si clicó en un lugar válido para empezar, iniciamos ahí
                    setSelectedRange({ start: date, end: null })
                } else {
                    setSelectedRange({ start: selectedRange.start, end: null })
                }
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

    // Helper: Get multiplier and name (checks both Special Dates and Seasons)
    // ALWAYS picks the MAXIMUM multiplier if multiple apply.
    const getMultiplierConfig = (date) => {
        if (!pricing) return { multiplier: 1, name: null }

        let activeMultipliers = []

        // 1. Check Special Dates (Ranges)
        if (pricing.specialDates) {
            const dateStr = formatDateLocal(date)
            for (const special of pricing.specialDates) {
                if (special.startDate && special.endDate) {
                    if (dateStr >= special.startDate && dateStr <= special.endDate) {
                        activeMultipliers.push({ multiplier: special.multiplier || 1.4, name: special.label })
                    }
                } else if (special.date === dateStr) {
                    activeMultipliers.push({ multiplier: special.multiplier || 1.4, name: special.label })
                }
            }
        }

        // 2. Check Annual Seasons
        if (pricing.seasons) {
            const month = date.getMonth() + 1
            const day = date.getDate()

            for (const season of pricing.seasons) {
                let inSeason = false
                if (season.startMonth > season.endMonth) {
                    if (month > season.startMonth || (month === season.startMonth && day >= season.startDay)) {
                        inSeason = true
                    } else if (month < season.endMonth || (month === season.endMonth && day <= season.endDay)) {
                        inSeason = true
                    }
                } else {
                    if ((month > season.startMonth || (month === season.startMonth && day >= season.startDay)) &&
                        (month < season.endMonth || (month === season.endMonth && day <= season.endDay))) {
                        inSeason = true
                    }
                }

                if (inSeason) {
                    activeMultipliers.push({ multiplier: season.multiplier, name: season.name })
                }
            }
        }

        if (activeMultipliers.length === 0) return { multiplier: 1, name: null }

        // Pick the one with HIGHEST multiplier
        return activeMultipliers.reduce((prev, current) => (prev.multiplier > current.multiplier) ? prev : current)
    }

    // Calculate price for a single night (check-in date)
    const getPriceForNight = (date) => {
        const isWeekend = isWeekendDay(date)
        const baseRate = isWeekend
            ? (pricing?.baseRates?.weekend || 450000)
            : (pricing?.baseRates?.weekday || 350000)

        const { multiplier, name } = getMultiplierConfig(date)
        const finalPrice = Math.round(baseRate * multiplier)

        return {
            price: finalPrice,
            baseRate,
            type: isWeekend ? 'weekend' : 'weekday',
            multiplier,
            seasonName: name
        }
    }

    // Calculate detailed pricing breakdown
    const calculatePricing = () => {
        if (!selectedRange.start || !selectedRange.end || nights === 0) {
            return { subtotal: 0, weekdayNights: 0, weekendNights: 0, specialNights: 0, breakdown: [], appliedSeasons: [], extraGuestCharge: 0, extraGuests: 0, totalSeasonCharge: 0 }
        }

        let subtotal = 0
        let weekdayNights = 0
        let weekendNights = 0
        let specialNights = 0
        const breakdown = []

        // Track unique seasons and their SPECIFIC contribution
        const seasonSums = {} // name -> { extraCharge, multiplier, dates: [] }

        // Iterate through each night (not including checkout day)
        const current = new Date(selectedRange.start)
        while (current < selectedRange.end) {
            const { price, baseRate, type, multiplier, seasonName } = getPriceForNight(current)
            subtotal += price

            if (type === 'weekend') weekendNights++
            else weekdayNights++

            // Track individual season contribution for this night
            if (seasonName && multiplier > 1) {
                const extraForThisNight = price - baseRate
                if (!seasonSums[seasonName]) {
                    seasonSums[seasonName] = { extraCharge: 0, multiplier: multiplier, dates: [] }
                }
                seasonSums[seasonName].extraCharge += extraForThisNight
                // Format date as "22 ene"
                const dateShort = current.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' }).replace('.', '')
                seasonSums[seasonName].dates.push(dateShort)
            }

            breakdown.push({
                date: new Date(current),
                price,
                type,
                multiplier,
                seasonName
            })

            current.setDate(current.getDate() + 1)
        }

        // Convert seasonSums to appliedSeasons array for UI
        const appliedSeasons = Object.keys(seasonSums).map(name => ({
            name,
            charge: seasonSums[name].extraCharge,
            multiplier: seasonSums[name].multiplier,
            datesFormatted: seasonSums[name].dates.join(', ')
        }))

        const totalSeasonCharge = Object.values(seasonSums).reduce((acc, curr) => acc + curr.extraCharge, 0)

        // Calculate extra guest charge (10% per person over 7)
        let extraGuestCharge = 0
        let extraGuests = 0
        if (numberOfGuests > 7) {
            extraGuests = numberOfGuests - 7
            extraGuestCharge = Math.round(subtotal * 0.10 * extraGuests)
        }

        return { subtotal, weekdayNights, weekendNights, specialNights, breakdown, appliedSeasons, extraGuestCharge, extraGuests, totalSeasonCharge }
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

    // Subtotal after discount + extra guest charge
    const subtotalAfterDiscount = pricingDetails.subtotal - discountAmount + pricingDetails.extraGuestCharge

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

    // Handle Continuar Reserva - Enviar mensaje a WhatsApp
    const handleContinuarReserva = () => {
        if (!selectedRange.start || !selectedRange.end || nights === 0) return

        const fechaLlegada = formatDate(selectedRange.start)
        const fechaSalida = formatDate(selectedRange.end)
        const phoneNumber = '573027857026' // Número de WhatsApp con código de país

        const mensaje = `Hola Oscar, queremos reservar contigo las fechas del ${fechaLlegada} al ${fechaSalida} (${nights} ${nights === 1 ? 'noche' : 'noches'}), por un valor total de ${formatPrice(total)}. ¿Está disponible?`

        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(mensaje)}`
        window.open(whatsappUrl, '_blank')
    }

    return (
        <div className="flex flex-col min-h-screen bg-page-bg-reservas dark:bg-surface-card-dark text-text-main dark:text-white font-display">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 flex flex-col lg:flex-row gap-8 w-full">
                <div className="flex-1 flex flex-col gap-8">
                    <PageHeader
                        title={pageContent.pageTitle}
                        subtitle={pageContent.pageSubtitle}
                        currentStep={1}
                        totalSteps={4}
                        stepLabel={pageContent.stepLabel}
                    />

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

                                            // 1. ANÁLISIS DE ESTADO DE RESERVA (BASE GRIS)
                                            // 'none' | 'start' (Entrada otro, Gris Derecha) | 'end' (Salida otro, Gris Izq) | 'middle' (Full Gris)
                                            let resState = 'none'
                                            const dateTime = date.getTime()

                                            // Lógica mejorada para detectar cruces de reserva (fin de una, inicio de otra = Full)
                                            let isResStart = false
                                            let isResEnd = false
                                            let isResMiddle = false

                                            for (const r of reservedDates) {
                                                const rStart = new Date(r.start); rStart.setHours(0, 0, 0, 0)
                                                const rEnd = new Date(r.end); rEnd.setHours(0, 0, 0, 0)
                                                const tStart = rStart.getTime()
                                                const tEnd = rEnd.getTime()

                                                if (dateTime > tStart && dateTime < tEnd) { isResMiddle = true; break; }
                                                if (dateTime === tStart) isResStart = true
                                                if (dateTime === tEnd) isResEnd = true
                                            }

                                            // Consolidar estado reserva
                                            if (isResMiddle) resState = 'middle'
                                            else if (isResStart && isResEnd) resState = 'middle' // Cruce: sale uno, entra otro el mismo día -> Todo ocupado para tránsitos, pero visualmente...
                                            // Espera, si sale uno y entra otro, es [Gris|Gris]. Sí, middle.
                                            else if (isResStart) resState = 'start'
                                            else if (isResEnd) resState = 'end'


                                            // 2. ANÁLISIS DE SELECCIÓN (CAPA VERDE)
                                            // 'none' | 'selStart' (Mi Entrada, Verde Derecha) | 'selEnd' (Mi Salida, Verde Izq) | 'selMiddle' (Full Verde)
                                            const isSelStart = isStartDate(date)
                                            const isSelEnd = isEndDate(date)
                                            const isSelMiddle = isDateInRange(date) // Días intermedios selección

                                            const past = isDatePast(date)
                                            const holiday = isHoliday(date)

                                            // 3. DEFINICIÓN DE COLORES (IZQUIERDA | DERECHA)
                                            const cTrans = "transparent"
                                            const cGray = "rgba(209, 213, 219, 1)" // gray-300

                                            // IMPORTANTE: Usamos la variable CSS directa definida en index.css/tailwind
                                            // 'primary' en Tailwind mapea a '--color-btn-primary'
                                            const cGreen = "var(--color-btn-primary)"

                                            let leftColor = cTrans
                                            let rightColor = cTrans

                                            // --- APLICAR CAPA BASE (RESERVAS) ---
                                            if (resState === 'middle') { leftColor = cGray; rightColor = cGray; }
                                            else if (resState === 'end') { leftColor = cGray; }
                                            else if (resState === 'start') { rightColor = cGray; }

                                            // --- APLICAR CAPA SELECCIÓN (SOBRESCRIBE/COMPLEMENTA) ---
                                            if (isSelMiddle) {
                                                leftColor = cGreen; rightColor = cGreen;
                                            } else {
                                                if (isSelEnd) leftColor = cGreen // Mi salida pinta izquierda verde
                                                if (isSelStart) rightColor = cGreen // Mi entrada pinta derecha verde
                                            }

                                            // 4. ESTILOS DE TEXTO Y CURSOR
                                            let textClass = "text-gray-700 dark:text-white font-medium"
                                            let cursorClass = "cursor-pointer"
                                            let borderClass = ""
                                            let hoverClass = "hover:ring-2 hover:ring-primary/30"

                                            // Días pasados o bloqueados totalmente
                                            if (past) {
                                                cursorClass = "cursor-not-allowed"
                                                textClass = "text-gray-300 dark:text-gray-600"
                                                hoverClass = ""
                                            } else if (resState === 'middle') {
                                                cursorClass = "cursor-not-allowed"
                                                textClass = "text-gray-400 dark:text-gray-500"
                                                hoverClass = ""
                                            } else if (resState === 'start' || resState === 'end') {
                                                // Días parcialmente reservados (mitad gris)
                                                textClass = "text-gray-700 dark:text-white font-medium"
                                            } else {
                                                // Días completamente disponibles
                                                textClass = "text-gray-700 dark:text-white font-medium"
                                            }

                                            // Texto para días seleccionados
                                            if (isSelStart || isSelEnd || isSelMiddle) {
                                                // Si es el fin de la selección (ej: el 15), el número está a la derecha (fondo blanco)
                                                // por lo tanto debe ser texto verde. Si es inicio o intermedio, fondo verde -> texto blanco.
                                                if (isSelEnd && !isSelMiddle) {
                                                    textClass = "text-primary font-bold"
                                                } else {
                                                    textClass = "text-white font-bold"
                                                }

                                                borderClass = "ring-2 ring-primary ring-inset"
                                                hoverClass = "hover:ring-2 hover:ring-white"
                                            } else if (holiday && !past && resState !== 'middle') {
                                                textClass = "text-primary font-bold dark:text-primary"
                                            }

                                            // 5. GENERAR GRADIENTE
                                            const gradient = `linear-gradient(90deg, ${leftColor} 50%, ${rightColor} 50%)`

                                            // 6. BORDES REDONDEADOS (SOLO ESTÉTICO)
                                            let shapeClass = "rounded-lg"
                                            if (isSelMiddle) {
                                                shapeClass = "rounded-none"
                                            } else if (isSelStart && isSelEnd) {
                                                shapeClass = "rounded-lg"
                                            } else if (isSelStart) {
                                                shapeClass = "rounded-l-lg rounded-r-none"
                                            } else if (isSelEnd) {
                                                shapeClass = "rounded-r-lg rounded-l-none"
                                            }

                                            return (
                                                <button
                                                    key={index}
                                                    onClick={() => handleDateClick(date)}
                                                    disabled={past || resState === 'middle'}
                                                    className={`h-12 w-full flex items-start justify-end p-1.5 text-xs transition-all relative ${cursorClass} ${textClass} ${shapeClass} ${borderClass} ${hoverClass}`}
                                                    style={{ background: gradient }}
                                                    title={holiday ? holiday.name : ''}
                                                >
                                                    <span className="relative z-10">{date.getDate()}</span>

                                                    {/* Indicador de festivo - Ahora en la izquierda */}
                                                    {holiday && !isSelMiddle && !isSelStart && !isSelEnd && resState !== 'middle' && (
                                                        <span className="absolute bottom-1.5 left-1.5 w-1.5 h-1.5 bg-primary rounded-full"></span>
                                                    )}
                                                </button>
                                            )
                                        })
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="mt-6 flex flex-wrap gap-4 justify-center text-sm text-text-muted dark:text-text-muted border-t border-border-card dark:border-border-card-dark pt-4">
                            <div className="flex items-center gap-2">
                                <div className="size-3 rounded-full bg-primary"></div>
                                <span>Seleccionado</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="size-3 rounded-full border border-primary/30" style={{ backgroundColor: '#e8f5e9' }}></div>
                                <span>Disponible</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="size-3 rounded-full bg-primary/10 border border-primary/30 relative">
                                    <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-primary rounded-full"></span>
                                </div>
                                <span>Festivo</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="size-3 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                                <span>Reservado</span>
                            </div>
                        </div>
                    </div>

                    {/* Tu Reserva - Mobile only (visible solo en móvil, en desktop está el sidebar) */}
                    <div className="lg:hidden bg-surface-card dark:bg-surface-card-dark rounded-2xl p-6 shadow-xl shadow-gray-200/50 dark:shadow-black/20 border border-border-card dark:border-border-card-dark">
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

                        {/* Guest count selector - Mobile */}
                        <div className="mb-6 p-4 rounded-lg border border-border-card dark:border-border-card-dark bg-background-light dark:bg-background-dark">
                            <label className="block text-xs text-text-muted uppercase font-bold mb-2">Número de Huéspedes</label>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setNumberOfGuests(Math.max(1, numberOfGuests - 1))}
                                    className="w-10 h-10 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-bold transition-colors"
                                >
                                    -
                                </button>
                                <div className="flex-1 text-center">
                                    <span className="text-2xl font-bold text-primary">{numberOfGuests}</span>
                                    <p className="text-xs text-text-muted mt-1">
                                        {numberOfGuests <= 7 ? 'Tarifa base' : `+${pricingDetails.extraGuests} extra`}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setNumberOfGuests(Math.min(10, numberOfGuests + 1))}
                                    className="w-10 h-10 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-bold transition-colors"
                                >
                                    +
                                </button>
                            </div>
                            {numberOfGuests > 7 && (
                                <p className="text-xs text-warning-text dark:text-warning-text mt-2 text-center">
                                    +10% por cada persona adicional sobre 7
                                </p>
                            )}
                        </div>

                        {nights > 0 && (
                            <>
                                <div className="flex flex-col gap-2 mb-6">
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
                                        <div className="flex justify-between text-sm" style={{ color: siteColors.discountText }}>
                                            <span>⭐ {pricingDetails.specialNights} {pricingDetails.specialNights === 1 ? 'noche especial' : 'noches especiales'}</span>
                                            <span>Incluido</span>
                                        </div>
                                    )}
                                    {/* Season Multiplier Display */}
                                    {pricingDetails.appliedSeasons && pricingDetails.appliedSeasons.length > 0 && pricingDetails.totalSeasonCharge > 0 && (
                                        <div className="space-y-1 py-2 border-t border-border-card dark:border-border-card-dark mt-2">
                                            {pricingDetails.appliedSeasons.map((season, idx) => (
                                                <div key={idx} className="flex justify-between text-sm text-primary font-medium">
                                                    <div className="flex flex-col">
                                                        <span>Multiplicador {season.multiplier}x - {season.name}</span>
                                                        <span className="text-[10px] opacity-70">({season.datesFormatted})</span>
                                                    </div>
                                                    <span>+{formatPrice(season.charge)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Extra guest charge - Mobile BEFORE subtotal */}
                                    {pricingDetails.extraGuestCharge > 0 && (
                                        <div className="flex justify-between text-sm text-primary font-medium">
                                            <span>Multiplicador por Huésped adicional</span>
                                            <span>+{formatPrice(pricingDetails.extraGuestCharge)}</span>
                                        </div>
                                    )}

                                    <div className="flex justify-between text-sm font-medium text-text-main-light dark:text-text-muted pt-1">
                                        <span>Subtotal alojamiento</span>
                                        <span className="font-bold">{formatPrice(pricingDetails.subtotal)}</span>
                                    </div>

                                    {applyLongStayDiscount && (
                                        <div className="flex justify-between text-sm text-primary font-medium">
                                            <span>Descuento estadía larga (-{discountPercent}%)</span>
                                            <span>-{formatPrice(discountAmount)}</span>
                                        </div>
                                    )}
                                    {cleaningEnabled && cleaningFee > 0 && (
                                        <div className="flex justify-between text-sm text-text-muted dark:text-text-muted">
                                            <span>Tarifa de limpieza</span>
                                            <span>{formatPrice(cleaningFee)}</span>
                                        </div>
                                    )}
                                    {ivaEnabled && taxes > 0 && (
                                        <div className="flex justify-between text-sm text-primary font-medium">
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
                                <button
                                    onClick={handleContinuarReserva}
                                    className="w-full h-12 rounded-lg bg-primary hover:bg-btn-primary-hover text-white font-bold text-base shadow-lg shadow-card transition-all transform active:scale-95 flex items-center justify-center gap-2"
                                >
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
                                <p className="text-xs text-primary font-semibold mt-2">Aplica para hasta 7 huéspedes</p>
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
                                <p className="text-xs text-primary font-semibold mt-2">Aplica para hasta 7 huéspedes</p>
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
                                <p className="text-xs text-primary font-semibold mt-2">Aplica para hasta 7 huéspedes</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Summary - Desktop only */}
                <div className="hidden lg:block lg:w-[380px] shrink-0">
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

                            {/* Guest count selector */}
                            <div className="mb-6 p-4 rounded-lg border border-border-card dark:border-border-card-dark bg-background-light dark:bg-background-dark">
                                <label className="block text-xs text-text-muted uppercase font-bold mb-2">Número de Huéspedes</label>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setNumberOfGuests(Math.max(1, numberOfGuests - 1))}
                                        className="w-10 h-10 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-bold transition-colors"
                                    >
                                        -
                                    </button>
                                    <div className="flex-1 text-center">
                                        <span className="text-2xl font-bold text-primary">{numberOfGuests}</span>
                                        <p className="text-xs text-text-muted mt-1">
                                            {numberOfGuests <= 7 ? 'Tarifa base' : `+${pricingDetails.extraGuests} extra`}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setNumberOfGuests(Math.min(10, numberOfGuests + 1))}
                                        className="w-10 h-10 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-bold transition-colors"
                                    >
                                        +
                                    </button>
                                </div>
                                {numberOfGuests > 7 && (
                                    <p className="text-xs text-warning-text dark:text-warning-text mt-2 text-center">
                                        +10% por cada persona adicional sobre 7
                                    </p>
                                )}
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

                                        {/* Season Multiplier Display */}
                                        {pricingDetails.appliedSeasons && pricingDetails.appliedSeasons.length > 0 && pricingDetails.totalSeasonCharge > 0 && (
                                            <div className="space-y-1 py-2 border-t border-border-card dark:border-border-card-dark mt-2">
                                                {pricingDetails.appliedSeasons.map((season, idx) => (
                                                    <div key={idx} className="flex justify-between text-sm text-primary font-medium">
                                                        <div className="flex flex-col">
                                                            <span>Multiplicador {season.multiplier}x - {season.name}</span>
                                                            <span className="text-[10px] opacity-70">({season.datesFormatted})</span>
                                                        </div>
                                                        <span>+{formatPrice(season.charge)}</span>
                                                    </div>
                                                ))}                                            </div>
                                        )}

                                        {/* Extra guest charge - BEFORE subtotal */}
                                        {pricingDetails.extraGuestCharge > 0 && (
                                            <div className="flex justify-between text-sm text-primary font-medium">
                                                <span>Multiplicador por Huésped adicional</span>
                                                <span>+{formatPrice(pricingDetails.extraGuestCharge)}</span>
                                            </div>
                                        )}

                                        {/* Subtotal */}
                                        <div className="flex justify-between text-sm font-medium text-text-main-light dark:text-text-muted pt-1">
                                            <span>Subtotal alojamiento</span>
                                            <span className="font-bold">{formatPrice(pricingDetails.subtotal)}</span>
                                        </div>

                                        {/* Long stay discount */}
                                        {applyLongStayDiscount && (
                                            <div className="flex justify-between text-sm text-primary font-medium">
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
                                            <div className="flex justify-between text-sm text-primary font-medium">
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
                                    <button
                                        onClick={handleContinuarReserva}
                                        className="w-full h-12 rounded-lg bg-primary hover:bg-btn-primary-hover text-white font-bold text-base shadow-lg shadow-card transition-all transform active:scale-95 flex items-center justify-center gap-2"
                                    >
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
