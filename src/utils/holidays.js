// Colombian holidays for 2026 and 2027
// Source: Colombian law - Festivos móviles adjusted to Monday (Ley Emiliani)

export const COLOMBIAN_HOLIDAYS = {
    2026: [
        { date: '2026-01-01', name: 'Año Nuevo' },
        { date: '2026-01-12', name: 'Día de los Reyes Magos' }, // Moved to Monday
        { date: '2026-03-23', name: 'Día de San José' }, // Moved to Monday
        { date: '2026-04-02', name: 'Jueves Santo' },
        { date: '2026-04-03', name: 'Viernes Santo' },
        { date: '2026-05-01', name: 'Día del Trabajo' },
        { date: '2026-05-18', name: 'Ascensión del Señor' }, // Moved to Monday
        { date: '2026-06-08', name: 'Corpus Christi' }, // Moved to Monday
        { date: '2026-06-15', name: 'Sagrado Corazón de Jesús' }, // Moved to Monday
        { date: '2026-06-29', name: 'San Pedro y San Pablo' }, // Moved to Monday
        { date: '2026-07-20', name: 'Día de la Independencia' },
        { date: '2026-08-07', name: 'Batalla de Boyacá' },
        { date: '2026-08-17', name: 'La Asunción de la Virgen' }, // Moved to Monday
        { date: '2026-10-12', name: 'Día de la Raza' }, // Moved to Monday
        { date: '2026-11-02', name: 'Día de Todos los Santos' }, // Moved to Monday
        { date: '2026-11-16', name: 'Independencia de Cartagena' }, // Moved to Monday
        { date: '2026-12-08', name: 'Día de la Inmaculada Concepción' },
        { date: '2026-12-25', name: 'Navidad' }
    ],
    2027: [
        { date: '2027-01-01', name: 'Año Nuevo' },
        { date: '2027-01-11', name: 'Día de los Reyes Magos' }, // Moved to Monday
        { date: '2027-03-22', name: 'Día de San José' }, // Moved to Monday
        { date: '2027-03-25', name: 'Jueves Santo' },
        { date: '2027-03-26', name: 'Viernes Santo' },
        { date: '2027-05-01', name: 'Día del Trabajo' },
        { date: '2027-05-10', name: 'Ascensión del Señor' }, // Moved to Monday
        { date: '2027-05-31', name: 'Corpus Christi' }, // Moved to Monday
        { date: '2027-06-07', name: 'Sagrado Corazón de Jesús' }, // Moved to Monday
        { date: '2027-06-28', name: 'San Pedro y San Pablo' }, // Moved to Monday
        { date: '2027-07-20', name: 'Día de la Independencia' },
        { date: '2027-08-07', name: 'Batalla de Boyacá' },
        { date: '2027-08-16', name: 'La Asunción de la Virgen' }, // Moved to Monday
        { date: '2027-10-11', name: 'Día de la Raza' }, // Moved to Monday
        { date: '2027-11-01', name: 'Día de Todos los Santos' }, // Moved to Monday
        { date: '2027-11-15', name: 'Independencia de Cartagena' }, // Moved to Monday
        { date: '2027-12-08', name: 'Día de la Inmaculada Concepción' },
        { date: '2027-12-25', name: 'Navidad' }
    ]
}

// Helper function to check if a date is a holiday
export const isHoliday = (date) => {
    const year = date.getFullYear()
    const dateString = date.toISOString().split('T')[0]

    if (!COLOMBIAN_HOLIDAYS[year]) return null

    const holiday = COLOMBIAN_HOLIDAYS[year].find(h => h.date === dateString)
    return holiday || null
}

// Helper to get holiday name for a date
export const getHolidayName = (date) => {
    const holiday = isHoliday(date)
    return holiday ? holiday.name : null
}
