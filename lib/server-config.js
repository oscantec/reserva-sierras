import { createClient } from '@supabase/supabase-js'

let cachedConfig = null
let cachedAt = 0
const TTL_MS = 60 * 1000 // 1 minuto de caché para no golpear Supabase en cada request

// Cliente creado de forma perezosa, para que las variables de entorno
// ya estén cargadas cuando se construya (importante en pruebas locales).
function getClient() {
    // Vercel usa process.env sin prefijo VITE_; desarrollo usa el prefijo VITE_
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY
    return createClient(supabaseUrl || '', supabaseAnonKey || '')
}

/**
 * Lee la configuración del sitio guardada en Supabase (tabla site_config, id=1).
 * Aquí viven las credenciales que el panel Admin -> Conexiones guarda
 * (Google Service Account, Tuya, etc.). Se lee en el servidor, nunca se
 * expone al cliente.
 */
export async function getServerConfig() {
    const now = Date.now()
    if (cachedConfig && now - cachedAt < TTL_MS) {
        return cachedConfig
    }

    const { data, error } = await getClient()
        .from('site_config')
        .select('config_data')
        .eq('id', 1)
        .single()

    if (error) {
        // Si no hay fila todavía, devolver objeto vacío en vez de romper
        if (error.code === 'PGRST116') return {}
        throw error
    }

    cachedConfig = data?.config_data || {}
    cachedAt = now
    return cachedConfig
}

/**
 * Normaliza una llave privada de Google: convierte los "\n" literales
 * (como suelen quedar en variables de entorno o JSON) en saltos de línea reales.
 */
export function normalizePrivateKey(key) {
    return (key || '').replace(/\\n/g, '\n')
}
