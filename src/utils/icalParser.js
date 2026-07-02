// iCal Parser utility
// Parses iCal URLs and returns event data

export async function fetchICalEvents(url) {
    try {
        // Primary: Use our own serverless proxy (avoids CORS + no third-party dependency)
        const response = await fetch('/api/ical-proxy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url })
        })

        if (!response.ok) {
            throw new Error(`Proxy error! status: ${response.status}`)
        }

        const icsData = await response.text()
        return parseICS(icsData)
    } catch (primaryError) {
        console.warn('Primary iCal proxy failed, trying fallback:', primaryError.message)
        
        // Fallback: Use corsproxy.io as backup
        try {
            const fallbackUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`
            const response = await fetch(fallbackUrl)

            if (!response.ok) {
                throw new Error(`Fallback proxy error! status: ${response.status}`)
            }

            const icsData = await response.text()
            return parseICS(icsData)
        } catch (fallbackError) {
            console.error('All iCal proxies failed:', fallbackError)
            return []
        }
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
    const cleaned = dateStr.replace(/[^0-9TZ]/g, '')

    if (cleaned.length >= 8) {
        const year = parseInt(cleaned.substring(0, 4), 10)
        const month = parseInt(cleaned.substring(4, 6), 10) - 1 // JavaScript months are 0-indexed
        const day = parseInt(cleaned.substring(6, 8), 10)

        if (cleaned.length > 8 && cleaned.includes('T')) {
            const hour = parseInt(cleaned.substring(9, 11) || '0', 10)
            const minute = parseInt(cleaned.substring(11, 13) || '0', 10)
            const second = parseInt(cleaned.substring(13, 15) || '0', 10)

            // If the original string ends with 'Z', it's UTC time
            if (dateStr.endsWith('Z')) {
                return new Date(Date.UTC(year, month, day, hour, minute, second))
            }
            // Otherwise treat as local time
            return new Date(year, month, day, hour, minute, second)
        }

        // For date-only values (YYYYMMDD like "20260303"), use LOCAL timezone
        // This prevents the date from shifting when converting to local time
        // Example: "20260303" should be March 3rd in local time, not March 2nd
        return new Date(year, month, day, 12, 0, 0) // Use noon to avoid any edge cases
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
