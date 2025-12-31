import { useState, useEffect } from 'react'
import { supabase } from '../../utils/supabaseClient'

// Paleta de 12 colores permitidos
const ALLOWED_COLORS = [
    { hex: '#3db814', name: 'Verde Principal' },
    { hex: '#2a8a0e', name: 'Verde Oscuro' },
    { hex: '#ffffff', name: 'Blanco' },
    { hex: '#000000', name: 'Negro' },
    { hex: '#00a658', name: 'Verde Menta' },
    { hex: '#009178', name: 'Verde Azulado' },
    { hex: '#007983', name: 'Teal' },
    { hex: '#006076', name: 'Teal Oscuro' },
    { hex: '#2f4858', name: 'Azul Grisáceo' },
    { hex: '#00af52', name: 'Verde Lima' },
    { hex: '#00a381', name: 'Verde Mar' },
    { hex: '#0094a8', name: 'Turquesa' }
]

const PaletteColorPicker = ({ value, onChange }) => {
    const currentColor = ALLOWED_COLORS.find(c => c.hex.toLowerCase() === value?.toLowerCase())
    return (
        <div className="flex flex-wrap gap-1">
            {ALLOWED_COLORS.map(color => (
                <button
                    key={color.hex}
                    type="button"
                    onClick={() => onChange(color.hex)}
                    className={`w-6 h-6 rounded transition-all ${value?.toLowerCase() === color.hex.toLowerCase()
                        ? 'ring-2 ring-offset-1 ring-primary scale-110'
                        : 'hover:scale-105 border border-gray-200'
                        }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                />
            ))}
        </div>
    )
}

export default function Tarifas() {
    const DEFAULT_PRICING = {
        baseRates: {
            weekday: 350000,
            weekend: 450000,
            cleaningFee: 80000,
            cleaningEnabled: true,
            currency: 'COP',
            ivaEnabled: false,
            ivaPercent: 19
        },
        seasons: [
            { id: 1, name: 'Temporada Alta', multiplier: 1.3, startMonth: 12, startDay: 15, endMonth: 1, endDay: 15, color: '#2f4858' },
            { id: 2, name: 'Semana Santa', multiplier: 1.4, startMonth: 3, startDay: 24, endMonth: 3, endDay: 31, color: '#007983' },
        ],
        specialDates: [
            { id: 1, startDate: '2026-01-01', endDate: '2026-01-01', multiplier: 1.4, label: 'Año Nuevo' },
            { id: 2, startDate: '2026-01-09', endDate: '2026-01-12', multiplier: 1.4, label: 'Puente Reyes Magos' },
            { id: 3, startDate: '2026-03-20', endDate: '2026-03-23', multiplier: 1.4, label: 'Puente San José' },
            { id: 4, startDate: '2026-04-02', endDate: '2026-04-05', multiplier: 1.4, label: 'Semana Santa (Jueves-Domingo)' },
            { id: 5, startDate: '2026-04-30', endDate: '2026-05-03', multiplier: 1.4, label: 'Puente Día del Trabajo' },
            { id: 6, startDate: '2026-05-15', endDate: '2026-05-18', multiplier: 1.4, label: 'Puente Ascensión' },
            { id: 7, startDate: '2026-06-05', endDate: '2026-06-08', multiplier: 1.4, label: 'Puente Corpus Christi' },
            { id: 8, startDate: '2026-06-12', endDate: '2026-06-15', multiplier: 1.4, label: 'Puente Sagrado Corazón' },
            { id: 9, startDate: '2026-06-26', endDate: '2026-06-29', multiplier: 1.4, label: 'Puente San Pedro' },
            { id: 10, startDate: '2026-07-17', endDate: '2026-07-20', multiplier: 1.4, label: 'Puente Independencia' },
            { id: 11, startDate: '2026-08-06', endDate: '2026-08-09', multiplier: 1.4, label: 'Puente Batalla de Boyacá' },
            { id: 12, startDate: '2026-08-14', endDate: '2026-08-17', multiplier: 1.4, label: 'Puente Asunción' },
            { id: 13, startDate: '2026-10-09', endDate: '2026-10-12', multiplier: 1.4, label: 'Puente Día de la Raza' },
            { id: 14, startDate: '2026-10-30', endDate: '2026-11-02', multiplier: 1.4, label: 'Puente Todos los Santos' },
            { id: 15, startDate: '2026-11-13', endDate: '2026-11-16', multiplier: 1.4, label: 'Puente Indep. Cartagena' },
            { id: 16, startDate: '2026-12-07', endDate: '2026-12-08', multiplier: 1.4, label: 'Inmaculada Concepción' },
            { id: 17, startDate: '2026-12-24', endDate: '2026-12-27', multiplier: 1.4, label: 'Navidad (Jueves-Domingo)' },
        ],
        discounts: {
            longStay: { enabled: true, nights: 7, percent: 15 },
            lastMinute: { enabled: false, hours: 48, percent: 10 },
        }
    }

    const [pricing, setPricing] = useState(DEFAULT_PRICING)
    const [saved, setSaved] = useState(false)
    const [saving, setSaving] = useState(false)
    const [activeTab, setActiveTab] = useState('base')

    useEffect(() => {
        const loadPricing = async () => {
            try {
                // 1. Intentar cargar desde Supabase (Base de datos real)
                const { data, error } = await supabase
                    .from('site_config')
                    .select('config_data')
                    .eq('id', 1)
                    .single()

                if (error) throw error

                if (data?.config_data?.pricing) {
                    console.log('✅ Tarifas cargadas desde DB:', data.config_data.pricing)
                    setPricing(prev => ({ ...prev, ...data.config_data.pricing }))

                    // Sincronizar localStorage por si acaso
                    const localConfig = JSON.parse(localStorage.getItem('casacampestre_config') || '{}')
                    localConfig.pricing = data.config_data.pricing
                    localStorage.setItem('casacampestre_config', JSON.stringify(localConfig))
                } else {
                    // Si no hay en DB, intentar localStorage
                    const config = JSON.parse(localStorage.getItem('casacampestre_config') || '{}')
                    if (config.pricing) {
                        setPricing(prev => ({ ...prev, ...config.pricing }))
                    }
                }
            } catch (err) {
                console.error('Error cargando tarifas:', err)
                // Fallback a localStorage si falla la DB
                const config = JSON.parse(localStorage.getItem('casacampestre_config') || '{}')
                if (config.pricing) {
                    setPricing(prev => ({ ...prev, ...config.pricing }))
                }
            }
        }
        loadPricing()
    }, [])

    const handleSave = async () => {
        setSaving(true)
        try {
            // 1. Obtener la config actual completa de la DB para no perder otros datos
            const { data: currentData, error: fetchError } = await supabase
                .from('site_config')
                .select('config_data')
                .eq('id', 1)
                .single()

            if (fetchError && fetchError.code !== 'PGRST116') throw fetchError

            const currentConfig = currentData?.config_data || {}

            // 2. Actualizar solo la sección de pricing
            const updatedConfig = {
                ...currentConfig,
                pricing: pricing
            }

            // 3. Guardar en DB
            const { error: updateError } = await supabase
                .from('site_config')
                .upsert({ id: 1, config_data: updatedConfig })

            if (updateError) throw updateError

            // 4. Actualizar localStorage como respaldo
            localStorage.setItem('casacampestre_config', JSON.stringify(updatedConfig))

            console.log('✅ Tarifas guardadas exitosamente en DB')
            setSaved(true)
            setTimeout(() => setSaved(false), 3000)
        } catch (err) {
            console.error('Error al guardar tarifas:', err)
            alert('Error al guardar cambios. Verifica tu conexión.')
        } finally {
            setSaving(false)
        }
    }

    const updateBaseRate = (field, value) => {
        setPricing(prev => ({
            ...prev,
            baseRates: { ...prev.baseRates, [field]: (field === 'ivaEnabled' || field === 'cleaningEnabled') ? value : (parseInt(value) || 0) }
        }))
        setSaved(false)
    }

    const addSeason = () => {
        const newSeason = {
            id: Date.now(),
            name: 'Nueva Temporada',
            multiplier: 1.2,
            startMonth: 1,
            startDay: 1,
            endMonth: 1,
            endDay: 31,
            color: '#3db814'
        }
        setPricing(prev => ({
            ...prev,
            seasons: [...prev.seasons, newSeason]
        }))
        setSaved(false)
    }

    const updateSeason = (id, field, value) => {
        setPricing(prev => ({
            ...prev,
            seasons: prev.seasons.map(s => s.id === id ? { ...s, [field]: value } : s)
        }))
        setSaved(false)
    }

    const deleteSeason = (id) => {
        setPricing(prev => ({
            ...prev,
            seasons: prev.seasons.filter(s => s.id !== id)
        }))
        setSaved(false)
    }

    const addSpecialDate = () => {
        const newDate = {
            id: Date.now(),
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date().toISOString().split('T')[0],
            multiplier: 1.4,
            label: 'Nueva Fecha Especial'
        }
        setPricing(prev => ({
            ...prev,
            specialDates: [...prev.specialDates, newDate]
        }))
        setSaved(false)
    }

    const updateSpecialDate = (id, field, value) => {
        setPricing(prev => ({
            ...prev,
            specialDates: prev.specialDates.map(d => d.id === id ? { ...d, [field]: value } : d)
        }))
        setSaved(false)
    }

    const deleteSpecialDate = (id) => {
        setPricing(prev => ({
            ...prev,
            specialDates: prev.specialDates.filter(d => d.id !== id)
        }))
        setSaved(false)
    }

    const updateDiscount = (type, field, value) => {
        setPricing(prev => ({
            ...prev,
            discounts: {
                ...prev.discounts,
                [type]: { ...prev.discounts[type], [field]: value }
            }
        }))
        setSaved(false)
    }

    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(price)
    }

    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

    return (
        <>
            <header className="bg-white border-b border-border-card px-3 md:px-6 py-3 md:py-4">
                <div className="flex flex-col gap-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                            <h1 className="text-xl md:text-2xl font-black text-gray-900">Tarifas</h1>
                            <p className="text-text-subtitle dark:text-text-subtitle-dark text-sm">Gestiona precios dinámicos por temporada, fechas especiales y descuentos</p>
                        </div>
                        <button
                            onClick={handleSave}
                            className={`px-6 py-2.5 rounded-lg text-sm font-bold shadow-lg transition-all hover:scale-105 active:scale-95 flex items-center gap-2 ${saved
                                ? 'bg-success-bg0 text-white shadow-card-sm'
                                : 'bg-primary hover:bg-primary-dark text-white shadow-primary/20'
                                }`}
                        >
                            <span className="material-symbols-outlined text-lg">{saved ? 'check_circle' : 'save'}</span>
                            {saved ? '¡Guardado!' : 'Guardar Cambios'}
                        </button>
                    </div>
                    <div className="h-2 w-full rounded-full bg-icon-bg-secondary dark:bg-border-card-dark relative overflow-hidden">
                        <div className="absolute top-0 left-0 h-full w-full bg-primary rounded-full"></div>
                    </div>
                </div>
            </header>

            {/* Tabs */}
            <div className="px-6 pt-4">
                <div className="flex gap-2 border-b border-border-card dark:border-border-card-dark">
                    {[
                        { id: 'base', label: 'Tarifas Base', icon: 'payments' },
                        { id: 'seasons', label: 'Temporadas', icon: 'calendar_month' },
                        { id: 'special', label: 'Fechas Especiales', icon: 'star' },
                        { id: 'discounts', label: 'Descuentos', icon: 'local_offer' },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id
                                ? 'border-primary text-primary'
                                : 'border-transparent text-text-secondary-light dark:text-text-secondary-dark hover:text-text-main-light dark:hover:text-text-main-dark'
                                }`}
                        >
                            <span className="material-symbols-outlined text-lg">{tab.icon}</span>
                            <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 pt-4">
                {/* Base Rates Tab */}
                {activeTab === 'base' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Weekday Rate */}
                            <div className="bg-surface-card dark:bg-surface-card-dark rounded-xl p-6 border border-border-card dark:border-border-card-dark">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-icon-bg-primary dark:bg-icon-bg-dark rounded-lg flex items-center justify-center">
                                        <span className="material-symbols-outlined text-icon-color">wb_twilight</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-text-main-light dark:text-text-main-dark">Entre Semana</h3>
                                        <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">Lun - Jue</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-lg font-bold text-text-muted">$</span>
                                    <input
                                        type="number"
                                        value={pricing.baseRates.weekday}
                                        onChange={(e) => updateBaseRate('weekday', e.target.value)}
                                        className="flex-1 px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-surface-card dark:bg-surface-card-dark text-slate-900 dark:text-white focus:ring-2 focus:ring-primary text-xl font-bold"
                                    />
                                </div>
                                <p className="mt-2 text-sm text-text-secondary-light dark:text-text-secondary-dark">{formatPrice(pricing.baseRates.weekday)} / noche</p>
                            </div>

                            {/* Weekend Rate */}
                            <div className="bg-surface-card dark:bg-surface-card-dark rounded-xl p-6 border border-primary/30">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                        <span className="material-symbols-outlined text-icon-color">weekend</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-text-main-light dark:text-text-main-dark">Fin de Semana</h3>
                                        <p className="text-xs text-primary font-medium">Vie - Dom (Popular)</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-lg font-bold text-text-muted">$</span>
                                    <input
                                        type="number"
                                        value={pricing.baseRates.weekend}
                                        onChange={(e) => updateBaseRate('weekend', e.target.value)}
                                        className="flex-1 px-4 py-3 border border-primary/30 rounded-lg bg-surface-card dark:bg-surface-card-dark text-slate-900 dark:text-white focus:ring-2 focus:ring-primary text-xl font-bold"
                                    />
                                </div>
                                <p className="mt-2 text-sm text-icon-color font-medium">{formatPrice(pricing.baseRates.weekend)} / noche</p>
                            </div>

                            {/* Cleaning Fee */}
                            <div className={`bg-surface-card dark:bg-surface-card-dark rounded-xl p-6 border ${pricing.baseRates.cleaningEnabled ? 'border-green-200 dark:border-green-900/30' : 'border-border-card dark:border-border-card-dark opacity-60'}`}>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-icon-bg-primary dark:bg-icon-bg-dark rounded-lg flex items-center justify-center">
                                            <span className="material-symbols-outlined text-icon-color">cleaning_services</span>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-text-main-light dark:text-text-main-dark">Limpieza (Aseo)</h3>
                                            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">Cargo único por reserva</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={pricing.baseRates.cleaningEnabled !== false}
                                            onChange={(e) => updateBaseRate('cleaningEnabled', e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-border-card peer-focus:ring-2 peer-focus:ring-primary rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                    </label>
                                </div>
                                {pricing.baseRates.cleaningEnabled !== false && (
                                    <>
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg font-bold text-text-muted">$</span>
                                            <input
                                                type="number"
                                                value={pricing.baseRates.cleaningFee}
                                                onChange={(e) => updateBaseRate('cleaningFee', e.target.value)}
                                                className="flex-1 px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-surface-card dark:bg-surface-card-dark text-slate-900 dark:text-white focus:ring-2 focus:ring-primary text-xl font-bold"
                                            />
                                        </div>
                                        <p className="mt-2 text-sm text-icon-color font-medium">{formatPrice(pricing.baseRates.cleaningFee)} / reserva</p>
                                    </>
                                )}
                                {pricing.baseRates.cleaningEnabled === false && (
                                    <p className="text-sm text-text-muted italic">Cargo de limpieza desactivado</p>
                                )}
                            </div>
                        </div>

                        {/* IVA Toggle Card */}
                        <div className="md:col-span-3 bg-surface-card dark:bg-surface-card-dark rounded-xl p-6 border border-border-card dark:border-border-card-dark">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-icon-bg-primary dark:bg-icon-bg-dark rounded-lg flex items-center justify-center">
                                        <span className="material-symbols-outlined text-icon-color">receipt_long</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-text-main-light dark:text-text-main-dark">IVA (Impuesto)</h3>
                                        <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">Aplicar {pricing.baseRates.ivaPercent}% de IVA a las tarifas</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={pricing.baseRates.ivaEnabled}
                                        onChange={(e) => updateBaseRate('ivaEnabled', e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-14 h-7 bg-border-card peer-focus:ring-2 peer-focus:ring-primary rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all after:shadow-md peer-checked:bg-primary"></div>
                                    <span className="ml-3 text-sm font-bold text-primary">{pricing.baseRates.ivaEnabled ? 'Activo' : 'Inactivo'}</span>
                                </label>
                            </div>
                            {pricing.baseRates.ivaEnabled && (
                                <div className="mt-4 p-3 bg-success-bg dark:bg-green-900/10 rounded-lg border border-border-card dark:border-border-card-dark">
                                    <p className="text-xs text-text-main-light dark:text-text-subtitle-dark">
                                        <span className="font-bold">Con IVA ({pricing.baseRates.ivaPercent}%):</span> Entre semana: {formatPrice(Math.round(pricing.baseRates.weekday * 1.19))} · Fin de semana: {formatPrice(Math.round(pricing.baseRates.weekend * 1.19))} · Limpieza: {formatPrice(Math.round(pricing.baseRates.cleaningFee * 1.19))}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Preview Card - Green theme */}
                        <div className="bg-success-bg dark:bg-green-900/10 border border-border-card dark:border-border-card-dark rounded-xl p-6">
                            <h4 className="font-bold text-text-main-light dark:text-text-subtitle-dark mb-3 flex items-center gap-2">
                                <span className="material-symbols-outlined">info</span>
                                Vista Previa de Precios
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                    <p className="text-text-subtitle dark:text-text-subtitle-dark">1 noche (L-J)</p>
                                    <p className="font-bold text-text-main-light dark:text-white">{formatPrice(pricing.baseRates.weekday + pricing.baseRates.cleaningFee)}</p>
                                </div>
                                <div>
                                    <p className="text-text-subtitle dark:text-text-subtitle-dark">1 noche (V-D)</p>
                                    <p className="font-bold text-text-main-light dark:text-white">{formatPrice(pricing.baseRates.weekend + pricing.baseRates.cleaningFee)}</p>
                                </div>
                                <div>
                                    <p className="text-text-subtitle dark:text-text-subtitle-dark">Fin de semana (2 noches)</p>
                                    <p className="font-bold text-text-main-light dark:text-white">{formatPrice(pricing.baseRates.weekend * 2 + pricing.baseRates.cleaningFee)}</p>
                                </div>
                                <div>
                                    <p className="text-text-subtitle dark:text-text-subtitle-dark">Semana completa (7 noches)</p>
                                    <p className="font-bold text-text-main-light dark:text-white">{formatPrice(pricing.baseRates.weekday * 4 + pricing.baseRates.weekend * 3 + pricing.baseRates.cleaningFee)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Seasons Tab */}
                {activeTab === 'seasons' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <p className="text-text-secondary-light dark:text-text-secondary-dark">Define multiplicadores de precios para diferentes épocas del año</p>
                            <button
                                onClick={addSeason}
                                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-bold text-sm hover:bg-primary-dark transition-colors"
                            >
                                <span className="material-symbols-outlined text-lg">add</span>
                                Agregar Temporada
                            </button>
                        </div>

                        <div className="space-y-4">
                            {pricing.seasons.map(season => (
                                <div key={season.id} className="bg-surface-card dark:bg-surface-card-dark rounded-xl p-5 border border-border-card dark:border-border-card-dark">
                                    <div className="flex flex-col md:flex-row gap-4">
                                        <div className="flex-1 grid grid-cols-2 md:grid-cols-5 gap-4">
                                            <div className="col-span-2 md:col-span-1">
                                                <label className="block text-xs font-medium text-text-muted dark:text-text-muted mb-1">Nombre</label>
                                                <input
                                                    type="text"
                                                    value={season.name}
                                                    onChange={(e) => updateSeason(season.id, 'name', e.target.value)}
                                                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-surface-card dark:bg-surface-card-dark text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-text-muted dark:text-text-muted mb-1">Multiplicador</label>
                                                <div className="flex items-center gap-1">
                                                    <input
                                                        type="number"
                                                        step="0.1"
                                                        min="1"
                                                        max="3"
                                                        value={season.multiplier}
                                                        onChange={(e) => updateSeason(season.id, 'multiplier', parseFloat(e.target.value) || 1)}
                                                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-surface-card dark:bg-surface-card-dark text-sm font-mono"
                                                    />
                                                    <span className="text-sm font-bold text-text-muted">x</span>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-text-muted dark:text-text-muted mb-1">Inicio</label>
                                                <div className="flex gap-1">
                                                    <select
                                                        value={season.startDay}
                                                        onChange={(e) => updateSeason(season.id, 'startDay', parseInt(e.target.value))}
                                                        className="w-14 px-2 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-surface-card dark:bg-surface-card-dark text-sm"
                                                    >
                                                        {[...Array(31)].map((_, i) => <option key={i} value={i + 1}>{i + 1}</option>)}
                                                    </select>
                                                    <select
                                                        value={season.startMonth}
                                                        onChange={(e) => updateSeason(season.id, 'startMonth', parseInt(e.target.value))}
                                                        className="flex-1 px-2 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-surface-card dark:bg-surface-card-dark text-sm"
                                                    >
                                                        {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                                                    </select>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-text-muted dark:text-text-muted mb-1">Fin</label>
                                                <div className="flex gap-1">
                                                    <select
                                                        value={season.endDay}
                                                        onChange={(e) => updateSeason(season.id, 'endDay', parseInt(e.target.value))}
                                                        className="w-14 px-2 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-surface-card dark:bg-surface-card-dark text-sm"
                                                    >
                                                        {[...Array(31)].map((_, i) => <option key={i} value={i + 1}>{i + 1}</option>)}
                                                    </select>
                                                    <select
                                                        value={season.endMonth}
                                                        onChange={(e) => updateSeason(season.id, 'endMonth', parseInt(e.target.value))}
                                                        className="flex-1 px-2 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-surface-card dark:bg-surface-card-dark text-sm"
                                                    >
                                                        {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="flex items-end gap-2">
                                                <div className="flex-1">
                                                    <PaletteColorPicker
                                                        value={season.color}
                                                        onChange={(color) => updateSeason(season.id, 'color', color)}
                                                    />
                                                </div>
                                                <button
                                                    onClick={() => deleteSeason(season.id)}
                                                    className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                                >
                                                    <span className="material-symbols-outlined">delete</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                                        <p className="text-xs text-text-muted">
                                            Precio en esta temporada: <span className="font-bold text-slate-700 dark:text-slate-300">{formatPrice(pricing.baseRates.weekday * season.multiplier)}</span> (L-J) · <span className="font-bold text-slate-700 dark:text-slate-300">{formatPrice(pricing.baseRates.weekend * season.multiplier)}</span> (V-D)
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Special Dates Tab */}
                {activeTab === 'special' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center flex-wrap gap-2">
                            <p className="text-text-secondary-light dark:text-text-secondary-dark">Define precios específicos para fechas importantes</p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        if (window.confirm('¿Cargar festivos de Colombia 2026? Esto reemplazará las fechas especiales actuales.')) {
                                            setPricing(prev => ({ ...prev, specialDates: DEFAULT_PRICING.specialDates }))
                                            setSaved(false)
                                        }
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-surface-card-dark border border-gray-300 dark:border-gray-600 text-text-main-light dark:text-text-main-dark rounded-lg font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-lg">calendar_month</span>
                                    Cargar Festivos 2026
                                </button>
                                <button
                                    onClick={addSpecialDate}
                                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-bold text-sm hover:bg-primary-dark transition-colors"
                                >
                                    <span className="material-symbols-outlined text-lg">add</span>
                                    Agregar Fecha
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {pricing.specialDates.map(item => (
                                <div key={item.id} className="bg-surface-card dark:bg-surface-card-dark rounded-xl p-5 border border-border-card dark:border-border-card-dark">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-10 h-10 bg-icon-bg-primary dark:bg-icon-bg-dark rounded-lg flex items-center justify-center">
                                            <span className="material-symbols-outlined text-icon-color">celebration</span>
                                        </div>
                                        <button
                                            onClick={() => deleteSpecialDate(item.id)}
                                            className="p-1 text-primary hover:bg-success-bg dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-lg">close</span>
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-xs font-medium text-text-muted dark:text-text-muted mb-1">Nombre</label>
                                            <input
                                                type="text"
                                                value={item.label}
                                                onChange={(e) => updateSpecialDate(item.id, 'label', e.target.value)}
                                                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-surface-card dark:bg-surface-card-dark text-sm"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="block text-xs font-medium text-text-muted dark:text-text-muted mb-1">Desde</label>
                                                <input
                                                    type="date"
                                                    value={item.startDate || item.date}
                                                    onChange={(e) => updateSpecialDate(item.id, 'startDate', e.target.value)}
                                                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-surface-card dark:bg-surface-card-dark text-xs"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-text-muted dark:text-text-muted mb-1">Hasta</label>
                                                <input
                                                    type="date"
                                                    value={item.endDate || item.date}
                                                    onChange={(e) => updateSpecialDate(item.id, 'endDate', e.target.value)}
                                                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-surface-card dark:bg-surface-card-dark text-xs"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-text-muted dark:text-text-muted mb-1">Multiplicador</label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    min="1"
                                                    max="3"
                                                    value={item.multiplier || 1.4}
                                                    onChange={(e) => updateSpecialDate(item.id, 'multiplier', parseFloat(e.target.value) || 1)}
                                                    className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-surface-card dark:bg-surface-card-dark text-sm font-mono"
                                                />
                                                <span className="text-sm font-bold text-text-muted">x</span>
                                            </div>
                                        </div>
                                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-text-muted">
                                            Precio aprox: <span className="font-bold">{formatPrice(pricing.baseRates.weekend * (item.multiplier || 1.4))}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Discounts Tab */}
                {activeTab === 'discounts' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Long Stay Discount */}
                            <div className="bg-surface-card dark:bg-surface-card-dark rounded-xl p-6 border border-border-card dark:border-border-card-dark">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-icon-bg-primary dark:bg-icon-bg-dark rounded-lg flex items-center justify-center">
                                            <span className="material-symbols-outlined text-success-text">date_range</span>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-text-main-light dark:text-text-main-dark">Estadía Larga</h3>
                                            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">Descuento por más noches</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={pricing.discounts.longStay.enabled}
                                            onChange={(e) => updateDiscount('longStay', 'enabled', e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-border-card peer-focus:ring-2 peer-focus:ring-primary rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                    </label>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-text-muted dark:text-text-muted mb-1">Mínimo noches</label>
                                        <input
                                            type="number"
                                            min="2"
                                            value={pricing.discounts.longStay.nights}
                                            onChange={(e) => updateDiscount('longStay', 'nights', parseInt(e.target.value) || 7)}
                                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-surface-card dark:bg-surface-card-dark text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-text-muted dark:text-text-muted mb-1">% Descuento</label>
                                        <div className="flex items-center gap-1">
                                            <input
                                                type="number"
                                                min="1"
                                                max="50"
                                                value={pricing.discounts.longStay.percent}
                                                onChange={(e) => updateDiscount('longStay', 'percent', parseInt(e.target.value) || 15)}
                                                className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-surface-card dark:bg-surface-card-dark text-sm font-mono"
                                            />
                                            <span className="text-sm font-bold text-text-muted">%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Last Minute Discount */}
                            <div className="bg-surface-card dark:bg-surface-card-dark rounded-xl p-6 border border-border-card dark:border-border-card-dark">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-icon-bg-primary dark:bg-icon-bg-dark rounded-lg flex items-center justify-center">
                                            <span className="material-symbols-outlined text-icon-color">schedule</span>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-text-main-light dark:text-text-main-dark">Última Hora</h3>
                                            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">Reserva de último momento</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={pricing.discounts.lastMinute.enabled}
                                            onChange={(e) => updateDiscount('lastMinute', 'enabled', e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-border-card peer-focus:ring-2 peer-focus:ring-primary rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                    </label>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-text-muted dark:text-text-muted mb-1">Dentro de (horas)</label>
                                        <input
                                            type="number"
                                            min="12"
                                            value={pricing.discounts.lastMinute.hours}
                                            onChange={(e) => updateDiscount('lastMinute', 'hours', parseInt(e.target.value) || 48)}
                                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-surface-card dark:bg-surface-card-dark text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-text-muted dark:text-text-muted mb-1">% Descuento</label>
                                        <div className="flex items-center gap-1">
                                            <input
                                                type="number"
                                                min="1"
                                                max="50"
                                                value={pricing.discounts.lastMinute.percent}
                                                onChange={(e) => updateDiscount('lastMinute', 'percent', parseInt(e.target.value) || 10)}
                                                className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-surface-card dark:bg-surface-card-dark text-sm font-mono"
                                            />
                                            <span className="text-sm font-bold text-text-muted">%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}
