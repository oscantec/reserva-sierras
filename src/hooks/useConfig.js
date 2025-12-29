import { useState, useEffect } from 'react'
import { DEFAULT_CONFIG } from '../utils/config'

const CONFIG_KEY = 'casacampestre_config'

/**
 * Custom hook to load configuration.
 * Uses DEFAULT_CONFIG as the base, then merges with any localStorage overrides.
 */
export function useConfig() {
    const [config, setConfig] = useState(DEFAULT_CONFIG)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const loadConfig = async () => {
            // Start with defaults
            let finalConfig = { ...DEFAULT_CONFIG }

            // Check localStorage for any saved overrides
            try {
                const saved = localStorage.getItem(CONFIG_KEY)
                if (saved) {
                    const parsed = JSON.parse(saved)
                    finalConfig = { ...DEFAULT_CONFIG, ...parsed }
                }
            } catch {
                // If localStorage fails, just use defaults
            }

            // Try to fetch from API for latest updates
            try {
                const response = await fetch('/api/config')
                if (response.ok) {
                    const data = await response.json()
                    if (Object.keys(data).length > 0) {
                        finalConfig = { ...DEFAULT_CONFIG, ...data }
                        localStorage.setItem(CONFIG_KEY, JSON.stringify(finalConfig))
                    }
                }
            } catch {
                // API not available, use local config
            }

            setConfig(finalConfig)
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
