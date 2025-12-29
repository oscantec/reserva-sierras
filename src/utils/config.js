// Default configuration for the entire application
// Contains ALL real content - loaded immediately for new visitors
// This file is auto-generated from saved-config.json

import configData from './config_data.json'

export const DEFAULT_CONFIG = configData

const CONFIG_KEY = 'casacampestre_config'

export function initializeConfig() {
    try {
        const savedRaw = localStorage.getItem(CONFIG_KEY)
        if (!savedRaw) {
            localStorage.setItem(CONFIG_KEY, JSON.stringify(DEFAULT_CONFIG))
            return DEFAULT_CONFIG
        }
        const saved = JSON.parse(savedRaw)
        const merged = { ...DEFAULT_CONFIG, ...saved }
        return merged
    } catch (error) {
        localStorage.setItem(CONFIG_KEY, JSON.stringify(DEFAULT_CONFIG))
        return DEFAULT_CONFIG
    }
}

export function getConfig() {
    try {
        const saved = localStorage.getItem(CONFIG_KEY)
        if (!saved) return initializeConfig()
        return JSON.parse(saved)
    } catch {
        return initializeConfig()
    }
}

export function saveConfig(config) {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config))
}
