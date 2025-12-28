import { useState, useEffect } from 'react'

export default function AntesDePartirSection() {
    const defaults = {
        title: 'Antes de partir',
        subtitle: 'Sigue estas pautas para un check-out sin contratiempos.',
        items: [
            { icon: 'schedule', title: 'Horario de Check-out', description: 'Salida a las 11:00 AM para permitir limpieza profunda.', isWarning: false },
            { icon: 'delete', title: 'Manejo de Residuos', description: 'Disponga residuos en contenedores verdes de la zona exterior.', isWarning: false },
            { icon: 'cleaning_services', title: 'Orden y Limpieza', description: 'Entregue la cocina sin platos sucios y la casa ordenada.', isWarning: false },
            { icon: 'chair', title: 'Cuidado del Mobiliario', description: 'Si movió muebles, regréselos a su sitio original.', isWarning: false },
            { icon: 'warning', title: 'Reporte de Daños', description: 'Notifíquenos de cualquier rotura o mal funcionamiento.', isWarning: true },
            { icon: 'key', title: 'Entrega de Llaves', description: 'Deposite llaves en caja de seguridad junto a la puerta.', isWarning: false }
        ]
    }

    const [content, setContent] = useState(defaults)

    useEffect(() => {
        const loadConfig = async () => {
            // 1. Try API first
            try {
                const response = await fetch('/api/config')
                if (response.ok) {
                    const config = await response.json()
                    if (config.inicioContent?.antesDePartir) {
                        setContent(prev => ({ ...prev, ...config.inicioContent.antesDePartir }))
                        localStorage.setItem('casacampestre_config', JSON.stringify(config))
                        return
                    }
                }
            } catch (e) {
                console.log('API not available')
            }
            // 2. Fallback to localStorage
            const saved = localStorage.getItem('casacampestre_config')
            if (saved) {
                const config = JSON.parse(saved)
                if (config.inicioContent?.antesDePartir) {
                    setContent(prev => ({ ...prev, ...config.inicioContent.antesDePartir }))
                }
            }
        }
        loadConfig()
    }, [])

    return (
        <section className="px-4 py-6 md:py-10 bg-page-bg-inicio dark:bg-surface-card-dark">
            <div className="max-w-7xl mx-auto">
                {/* Header - Reservas style */}
                <div className="flex flex-col gap-2 mb-3 md:mb-4">
                    <div className="flex justify-between items-end">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em] mb-2">{content.title}</h2>
                            <p className="text-text-subtitle dark:text-text-subtitle-dark text-base">{content.subtitle}</p>
                        </div>
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold text-text-accent">{content.items.length} pasos</p>
                            <p className="text-xs text-text-muted dark:text-text-muted">Check-out</p>
                        </div>
                    </div>
                </div>

                {/* Grid - Compact 2-column mobile layout */}
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4">
                    {content.items.map((item, index) => (
                        <div
                            key={index}
                            className="bg-surface-card dark:bg-surface-card-dark rounded-lg md:rounded-xl p-3 md:p-5 border border-border-card dark:border-border-card-dark hover:shadow-md hover:scale-[1.02] transition-all"
                        >
                            <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center mb-2 bg-icon-bg-primary dark:bg-icon-bg-dark text-icon-color">
                                <span className="material-symbols-outlined text-lg md:text-xl">{item.icon}</span>
                            </div>
                            <h3 className="text-sm md:text-base font-bold mb-1">{item.title}</h3>
                            <p className="text-xs text-text-muted dark:text-text-muted">{item.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

