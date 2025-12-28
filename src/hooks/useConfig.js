import { useState, useEffect } from 'react'

/**
 * Custom hook to load configuration from API first, then localStorage as fallback.
 * This ensures all components always have the latest saved configuration.
 */
export function useConfig() {
    const [config, setConfig] = useState(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const loadConfig = async () => {
            // 1. Try API first (saved-config.json in dev, Supabase in prod)
            try {
                const response = await fetch('/api/config')
                if (response.ok) {
                    const data = await response.json()
                    if (Object.keys(data).length > 0) {
                        setConfig(data)
                        localStorage.setItem('casacampestre_config', JSON.stringify(data))
                        setIsLoading(false)
                        return
                    }
                }
            } catch (e) {
                console.log('API not available, using localStorage fallback')
            }

            // 2. Fallback to localStorage
            const saved = localStorage.getItem('casacampestre_config')
            if (saved) {
                try {
                    setConfig(JSON.parse(saved))
                } catch {
                    setConfig({})
                }
            } else {
                setConfig({})
            }
            setIsLoading(false)
        }

        loadConfig()
    }, [])

    return { config, isLoading }
}

/**
 * Get a nested value from config object using dot notation
 * e.g., getConfigValue(config, 'inicioContent.intro.title', 'Default Title')
 */
export function getConfigValue(config, path, defaultValue) {
    if (!config) return defaultValue

    const keys = path.split('.')
    let value = config

    for (const key of keys) {
        if (value && typeof value === 'object' && key in value) {
            value = value[key]
        } else {
            return defaultValue
        }
    }

    return value ?? defaultValue
}
