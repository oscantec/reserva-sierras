// iCal Parser utility
// Parses iCal URLs and returns event data

export async function fetchICalEvents(url) {
    try {
        // Use a CORS proxy for fetching iCal data
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`
        const response = await fetch(proxyUrl)

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        const icsData = await response.text()
        return parseICS(icsData)
    } catch (error) {
        console.error('Error fetching iCal:', error)
        return []
    }
}

function parseICS(icsData) {
    const events = []
    const lines = icsData.split(/\r?\n/)
    let currentEvent = null

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i]

        // Handle line continuations
        while (i + 1 < lines.length && (lines[i + 1].startsWith(' ') || lines[i + 1].startsWith('\t'))) {
            i++
            line += lines[i].substring(1)
        }

        if (line.startsWith('BEGIN:VEVENT')) {
            currentEvent = {}
        } else if (line.startsWith('END:VEVENT') && currentEvent) {
            events.push(currentEvent)
            currentEvent = null
        } else if (currentEvent) {
            const colonIndex = line.indexOf(':')
            if (colonIndex > 0) {
                let key = line.substring(0, colonIndex)
                const value = line.substring(colonIndex + 1)

                // Remove parameters from key
                const semicolonIndex = key.indexOf(';')
                if (semicolonIndex > 0) {
                    key = key.substring(0, semicolonIndex)
                }

                switch (key) {
                    case 'DTSTART':
                        currentEvent.start = parseICSDate(value)
                        break
                    case 'DTEND':
                        currentEvent.end = parseICSDate(value)
                        break
                    case 'SUMMARY':
                        currentEvent.title = value
                        break
                    case 'DESCRIPTION':
                        currentEvent.description = value
                        break
                    case 'UID':
                        currentEvent.uid = value
                        break
                }
            }
        }
    }

    return events
}

function parseICSDate(dateStr) {
    // Handle different date formats
    // YYYYMMDD or YYYYMMDDTHHmmssZ
    const cleaned = dateStr.replace(/[^0-9T]/g, '')

    if (cleaned.length >= 8) {
        const year = cleaned.substring(0, 4)
        const month = cleaned.substring(4, 6)
        const day = cleaned.substring(6, 8)

        if (cleaned.length > 8) {
            const hour = cleaned.substring(9, 11) || '00'
            const minute = cleaned.substring(11, 13) || '00'
            return new Date(`${year}-${month}-${day}T${hour}:${minute}:00`)
        }

        return new Date(`${year}-${month}-${day}`)
    }

    return new Date(dateStr)
}

export async function fetchAllCalendars() {
    // CRITICAL: Load config from API (Supabase) first, then fallback to localStorage
    let config = {}

    // 1. Try to load from API (Supabase) - PRODUCTION PRIORITY
    try {
        const response = await fetch('/api/config')
        if (response.ok) {
            const apiConfig = await response.json()
            if (Object.keys(apiConfig).length > 0) {
                config = apiConfig
                console.log('✅ iCal URLs loaded from Supabase')
            }
        }
    } catch (e) {
        console.log('API not available for iCal, using localStorage')
    }

    // 2. Fallback to localStorage if API didn't work
    if (Object.keys(config).length === 0) {
        const localData = localStorage.getItem('casacampestre_config')
        if (localData) {
            config = JSON.parse(localData)
            console.log('✅ iCal URLs loaded from localStorage')
        }
    }

    const allEvents = []

    const calendars = [
        { url: config.airbnbUrl, source: 'Airbnb', color: '#FF5A5F' },
        { url: config.bookingUrl, source: 'Booking', color: '#003580' },
        { url: config.googleCalendarUrl, source: 'Google', color: '#4285F4' },
    ]

    for (const cal of calendars) {
        if (cal.url) {
            const events = await fetchICalEvents(cal.url)
            events.forEach(event => {
                event.source = cal.source
                event.color = cal.color
            })
            allEvents.push(...events)
        }
    }

    return allEvents.sort((a, b) => new Date(a.start) - new Date(b.start))
}
