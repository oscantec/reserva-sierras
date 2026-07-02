/**
 * iCal Proxy Endpoint
 * Fetches iCal data from external URLs (Airbnb, Booking, Google Calendar)
 * to avoid CORS issues when fetching from the browser.
 * 
 * Usage: POST /api/ical-proxy
 * Body: { "url": "https://..." }
 */
export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

    if (req.method === 'OPTIONS') {
        return res.status(200).end()
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
        const { url } = req.body

        if (!url) {
            return res.status(400).json({ error: 'URL is required' })
        }

        // Validate that the URL is from a trusted source
        const allowedDomains = [
            'airbnb.com',
            'airbnb.com.co',
            'booking.com',
            'ical.booking.com',
            'calendar.google.com',
            'www.airbnb.com',
            'www.airbnb.com.co',
        ]

        let urlObj
        try {
            urlObj = new URL(url)
        } catch {
            return res.status(400).json({ error: 'Invalid URL format' })
        }

        const hostname = urlObj.hostname
        const isAllowed = allowedDomains.some(domain => 
            hostname === domain || hostname.endsWith('.' + domain)
        )

        if (!isAllowed) {
            return res.status(403).json({ error: 'Domain not allowed' })
        }

        // Fetch the iCal data from the external URL
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'ReservaDeLasSierras/1.0 iCal-Sync',
                'Accept': 'text/calendar, text/plain, */*',
            },
            redirect: 'follow',
        })

        if (!response.ok) {
            console.error(`iCal proxy error: ${response.status} for URL: ${url}`)
            return res.status(502).json({ 
                error: `Failed to fetch calendar: HTTP ${response.status}` 
            })
        }

        const icsData = await response.text()

        // Return the raw iCal data
        res.setHeader('Content-Type', 'text/plain; charset=utf-8')
        res.setHeader('Cache-Control', 'public, max-age=300') // Cache 5 minutes
        return res.status(200).send(icsData)

    } catch (error) {
        console.error('iCal proxy error:', error)
        return res.status(500).json({ error: 'Internal server error fetching calendar' })
    }
}
