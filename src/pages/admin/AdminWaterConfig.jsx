import { useState, useEffect } from 'react'

/**
 * Componente para configurar dimensiones de tanques y credenciales API de Tuya
 */
export default function AdminWaterConfig() {
    const CONFIG_KEY = 'water_monitoring_config'

    // Estado para configuración de Tuya API (precargado con tus datos)
    const [tuyaConfig, setTuyaConfig] = useState({
        clientId: 'aw59ugmntjfevwdkx8py',
        clientSecret: '43fd349daf50449d8c2b061e25118c8e',
        zonaBaja: { deviceId: 'ebd09863004e52db0ehcrq' },  // Tanque Abajo
        zonaAlta: { deviceId: 'ebc4697fd7293917feksfa' },  // Tanque Arriba
        zonaCasa: { deviceId: 'eb04c0fcf71d11da80m8rm' }   // Tanque Casa
    })

    // Estado para configuración de tanques (con alturas reales de liquid_depth_max)
    const [tankConfigs, setTankConfigs] = useState({
        zonaBaja: {
            name: 'Zona Baja - Tanque Abajo',
            type: 'conic',
            tankCount: 3,
            height: 23,  // 230 mm liquid_depth_max convertido a cm
            topRadius: 40,  // Ajusta según tu tanque real
            bottomRadius: 30  // Ajusta según tu tanque real
        },
        zonaAlta: {
            name: 'Zona Alta - Tanque Arriba',
            type: 'conic',
            tankCount: 2,
            height: 30,  // 300 mm liquid_depth_max convertido a cm
            topRadius: 37.5,  // Ajusta según tu tanque real
            bottomRadius: 27.5  // Ajusta según tu tanque real
        },
        zonaCasa: {
            name: 'Zona Casa - Tanque Casa',
            type: 'cubic',
            tankCount: 1,
            height: 25,  // 250 mm liquid_depth_max convertido a cm
            length: 50,  // Ajusta según tu tanque real (cm)
            width: 50   // Ajusta según tu tanque real (cm)
        }
    })

    // Estado para configuración de alertas
    const [alertConfig, setAlertConfig] = useState({
        criticalThreshold: 20, // Porcentaje crítico
        warningThreshold: 40   // Porcentaje de advertencia
    })

    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)

    // Cargar configuración guardada
    useEffect(() => {
        const loadConfig = () => {
            const savedConfig = localStorage.getItem(CONFIG_KEY)
            if (savedConfig) {
                const parsed = JSON.parse(savedConfig)
                setTuyaConfig(prev => ({ ...prev, ...parsed.tuyaConfig }))
                setTankConfigs(prev => ({ ...prev, ...parsed.tankConfigs }))
                setAlertConfig(prev => ({ ...prev, ...parsed.alertConfig }))
            }
        }
        loadConfig()
    }, [])

    // Guardar configuración
    const saveConfig = () => {
        setSaving(true)
        const config = {
            tuyaConfig,
            tankConfigs,
            alertConfig,
            lastUpdated: new Date().toISOString()
        }
        localStorage.setItem(CONFIG_KEY, JSON.stringify(config))
        setSaving(false)
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
    }

    // Actualizar configuración de Tuya
    const updateTuyaConfig = (field, value) => {
        setTuyaConfig(prev => ({ ...prev, [field]: value }))
    }

    const updateZoneDevice = (zone, deviceId) => {
        setTuyaConfig(prev => ({
            ...prev,
            [zone]: { deviceId }
        }))
    }

    // Actualizar configuración de tanques
    const updateTankConfig = (zone, field, value) => {
        setTankConfigs(prev => ({
            ...prev,
            [zone]: {
                ...prev[zone],
                [field]: parseFloat(value) || value
            }
        }))
    }

    return (
        <div className="min-h-screen bg-page-bg-admin p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-text-title mb-2">
                        Configuración de Monitoreo de Agua
                    </h1>
                    <p className="text-text-muted">
                        Configura las dimensiones de los tanques y las credenciales de API de Tuya
                    </p>
                </div>

                {/* Sección de Credenciales Tuya API */}
                <section className="bg-surface-card rounded-2xl shadow-lg p-6 mb-6 border border-border-card">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="material-symbols-rounded text-3xl text-icon-color">cloud</span>
                        <h2 className="text-xl font-bold text-text-title">Credenciales API Tuya</h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-text-main mb-2">
                                Access ID (Client ID)
                            </label>
                            <input
                                type="text"
                                value={tuyaConfig.clientId}
                                onChange={(e) => updateTuyaConfig('clientId', e.target.value)}
                                className="w-full px-4 py-2 border border-border-card rounded-lg focus:ring-2 focus:ring-primary"
                                placeholder="Ingresa tu Client ID de Tuya"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-main mb-2">
                                Access Secret (Client Secret)
                            </label>
                            <input
                                type="password"
                                value={tuyaConfig.clientSecret}
                                onChange={(e) => updateTuyaConfig('clientSecret', e.target.value)}
                                className="w-full px-4 py-2 border border-border-card rounded-lg focus:ring-2 focus:ring-primary"
                                placeholder="Ingresa tu Client Secret de Tuya"
                            />
                        </div>
                    </div>

                    <div className="bg-surface-section rounded-lg p-4">
                        <h3 className="font-semibold text-text-title mb-3">Device IDs por Zona</h3>
                        <div className="grid md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-text-main mb-2">
                                    Zona Baja
                                </label>
                                <input
                                    type="text"
                                    value={tuyaConfig.zonaBaja.deviceId}
                                    onChange={(e) => updateZoneDevice('zonaBaja', e.target.value)}
                                    className="w-full px-3 py-2 border border-border-card rounded-lg focus:ring-2 focus:ring-primary text-sm"
                                    placeholder="Device ID Zona Baja"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-main mb-2">
                                    Zona Alta
                                </label>
                                <input
                                    type="text"
                                    value={tuyaConfig.zonaAlta.deviceId}
                                    onChange={(e) => updateZoneDevice('zonaAlta', e.target.value)}
                                    className="w-full px-3 py-2 border border-border-card rounded-lg focus:ring-2 focus:ring-primary text-sm"
                                    placeholder="Device ID Zona Alta"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-main mb-2">
                                    Zona Casa
                                </label>
                                <input
                                    type="text"
                                    value={tuyaConfig.zonaCasa.deviceId}
                                    onChange={(e) => updateZoneDevice('zonaCasa', e.target.value)}
                                    className="w-full px-3 py-2 border border-border-card rounded-lg focus:ring-2 focus:ring-primary text-sm"
                                    placeholder="Device ID Zona Casa"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Sección de Configuración de Tanques */}
                <section className="bg-surface-card rounded-2xl shadow-lg p-6 mb-6 border border-border-card">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="material-symbols-rounded text-3xl text-icon-color">water_drop</span>
                        <h2 className="text-xl font-bold text-text-title">Dimensiones de Tanques</h2>
                    </div>

                    {/* Zona Baja */}
                    <div className="mb-6 p-4 bg-surface-section rounded-lg">
                        <h3 className="font-semibold text-text-title mb-3 flex items-center gap-2">
                            <span className="material-symbols-rounded text-primary">water</span>
                            {tankConfigs.zonaBaja.name}
                        </h3>
                        <div className="grid md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-text-main mb-2">
                                    Cantidad de Tanques
                                </label>
                                <input
                                    type="number"
                                    value={tankConfigs.zonaBaja.tankCount}
                                    onChange={(e) => updateTankConfig('zonaBaja', 'tankCount', e.target.value)}
                                    className="w-full px-3 py-2 border border-border-card rounded-lg focus:ring-2 focus:ring-primary"
                                    min="1"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-main mb-2">
                                    Altura Total (cm)
                                </label>
                                <input
                                    type="number"
                                    value={tankConfigs.zonaBaja.height}
                                    onChange={(e) => updateTankConfig('zonaBaja', 'height', e.target.value)}
                                    className="w-full px-3 py-2 border border-border-card rounded-lg focus:ring-2 focus:ring-primary"
                                    step="0.1"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-main mb-2">
                                    Radio Superior (cm)
                                </label>
                                <input
                                    type="number"
                                    value={tankConfigs.zonaBaja.topRadius}
                                    onChange={(e) => updateTankConfig('zonaBaja', 'topRadius', e.target.value)}
                                    className="w-full px-3 py-2 border border-border-card rounded-lg focus:ring-2 focus:ring-primary"
                                    step="0.1"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-main mb-2">
                                    Radio Inferior (cm)
                                </label>
                                <input
                                    type="number"
                                    value={tankConfigs.zonaBaja.bottomRadius}
                                    onChange={(e) => updateTankConfig('zonaBaja', 'bottomRadius', e.target.value)}
                                    className="w-full px-3 py-2 border border-border-card rounded-lg focus:ring-2 focus:ring-primary"
                                    step="0.1"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Zona Alta */}
                    <div className="mb-6 p-4 bg-surface-section rounded-lg">
                        <h3 className="font-semibold text-text-title mb-3 flex items-center gap-2">
                            <span className="material-symbols-rounded text-primary">water</span>
                            {tankConfigs.zonaAlta.name}
                        </h3>
                        <div className="grid md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-text-main mb-2">
                                    Cantidad de Tanques
                                </label>
                                <input
                                    type="number"
                                    value={tankConfigs.zonaAlta.tankCount}
                                    onChange={(e) => updateTankConfig('zonaAlta', 'tankCount', e.target.value)}
                                    className="w-full px-3 py-2 border border-border-card rounded-lg focus:ring-2 focus:ring-primary"
                                    min="1"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-main mb-2">
                                    Altura Total (cm)
                                </label>
                                <input
                                    type="number"
                                    value={tankConfigs.zonaAlta.height}
                                    onChange={(e) => updateTankConfig('zonaAlta', 'height', e.target.value)}
                                    className="w-full px-3 py-2 border border-border-card rounded-lg focus:ring-2 focus:ring-primary"
                                    step="0.1"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-main mb-2">
                                    Radio Superior (cm)
                                </label>
                                <input
                                    type="number"
                                    value={tankConfigs.zonaAlta.topRadius}
                                    onChange={(e) => updateTankConfig('zonaAlta', 'topRadius', e.target.value)}
                                    className="w-full px-3 py-2 border border-border-card rounded-lg focus:ring-2 focus:ring-primary"
                                    step="0.1"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-main mb-2">
                                    Radio Inferior (cm)
                                </label>
                                <input
                                    type="number"
                                    value={tankConfigs.zonaAlta.bottomRadius}
                                    onChange={(e) => updateTankConfig('zonaAlta', 'bottomRadius', e.target.value)}
                                    className="w-full px-3 py-2 border border-border-card rounded-lg focus:ring-2 focus:ring-primary"
                                    step="0.1"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Zona Casa */}
                    <div className="mb-4 p-4 bg-surface-section rounded-lg">
                        <h3 className="font-semibold text-text-title mb-3 flex items-center gap-2">
                            <span className="material-symbols-rounded text-primary">home</span>
                            {tankConfigs.zonaCasa.name}
                        </h3>
                        <div className="grid md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-text-main mb-2">
                                    Cantidad de Tanques
                                </label>
                                <input
                                    type="number"
                                    value={tankConfigs.zonaCasa.tankCount}
                                    onChange={(e) => updateTankConfig('zonaCasa', 'tankCount', e.target.value)}
                                    className="w-full px-3 py-2 border border-border-card rounded-lg focus:ring-2 focus:ring-primary"
                                    min="1"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-main mb-2">
                                    Altura Total (cm)
                                </label>
                                <input
                                    type="number"
                                    value={tankConfigs.zonaCasa.height}
                                    onChange={(e) => updateTankConfig('zonaCasa', 'height', e.target.value)}
                                    className="w-full px-3 py-2 border border-border-card rounded-lg focus:ring-2 focus:ring-primary"
                                    step="0.1"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-main mb-2">
                                    Largo (cm)
                                </label>
                                <input
                                    type="number"
                                    value={tankConfigs.zonaCasa.length}
                                    onChange={(e) => updateTankConfig('zonaCasa', 'length', e.target.value)}
                                    className="w-full px-3 py-2 border border-border-card rounded-lg focus:ring-2 focus:ring-primary"
                                    step="0.1"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-main mb-2">
                                    Ancho (cm)
                                </label>
                                <input
                                    type="number"
                                    value={tankConfigs.zonaCasa.width}
                                    onChange={(e) => updateTankConfig('zonaCasa', 'width', e.target.value)}
                                    className="w-full px-3 py-2 border border-border-card rounded-lg focus:ring-2 focus:ring-primary"
                                    step="0.1"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Sección de Alertas */}
                <section className="bg-surface-card rounded-2xl shadow-lg p-6 mb-6 border border-border-card">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="material-symbols-rounded text-3xl text-icon-color">notifications</span>
                        <h2 className="text-xl font-bold text-text-title">Configuración de Alertas</h2>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-text-main mb-2">
                                Umbral Crítico (%)
                            </label>
                            <input
                                type="number"
                                value={alertConfig.criticalThreshold}
                                onChange={(e) => setAlertConfig(prev => ({ ...prev, criticalThreshold: parseFloat(e.target.value) }))}
                                className="w-full px-4 py-2 border border-border-card rounded-lg focus:ring-2 focus:ring-primary"
                                min="0"
                                max="100"
                            />
                            <p className="text-xs text-text-muted mt-1">
                                El sistema marcará en rojo cuando esté por debajo de este porcentaje
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-main mb-2">
                                Umbral de Advertencia (%)
                            </label>
                            <input
                                type="number"
                                value={alertConfig.warningThreshold}
                                onChange={(e) => setAlertConfig(prev => ({ ...prev, warningThreshold: parseFloat(e.target.value) }))}
                                className="w-full px-4 py-2 border border-border-card rounded-lg focus:ring-2 focus:ring-primary"
                                min="0"
                                max="100"
                            />
                            <p className="text-xs text-text-muted mt-1">
                                El sistema marcará en amarillo cuando esté por debajo de este porcentaje
                            </p>
                        </div>
                    </div>
                </section>

                {/* Botón de Guardar */}
                <div className="flex justify-end">
                    <button
                        onClick={saveConfig}
                        disabled={saving}
                        className="px-8 py-3 bg-btn-primary hover:bg-btn-primary-hover text-white font-semibold rounded-lg shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                        {saving ? (
                            <>
                                <span className="material-symbols-rounded animate-spin">refresh</span>
                                Guardando...
                            </>
                        ) : saved ? (
                            <>
                                <span className="material-symbols-rounded">check</span>
                                Guardado
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-rounded">save</span>
                                Guardar Configuración
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
