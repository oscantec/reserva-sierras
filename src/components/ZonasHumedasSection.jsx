import { useState, useEffect } from 'react'

export default function ZonasHumedasSection() {
    const defaults = {
        piscina: {
            id: 'piscina',
            icon: 'pool',
            title: 'Piscina Privada',
            subtitle: 'Uso exclusivo durante tu estadía',
            badge: 'Privada',
            badgeColor: 'bg-premium-pine/10 text-premium-pine',
            iconBg: 'bg-premium-mist',
            iconColor: 'text-premium-pine',
            rules: [
                { icon: 'schedule', text: 'Horario de uso: 8:00 AM - 10:00 PM' },
                { icon: 'checkroom', text: 'Se requiere gorro de baño obligatorio' },
                { icon: 'shower', text: 'Ducharse antes de ingresar a la piscina' },
                { icon: 'warning', text: 'No ingresar alimentos ni bebidas al área de la piscina' }
            ]
        },
        jacuzzi: {
            id: 'jacuzzi',
            icon: 'hot_tub',
            title: 'Jacuzzi Privado',
            subtitle: 'Relájate en total privacidad',
            badge: 'Exclusivo',
            badgeColor: 'bg-premium-gold/10 text-premium-gold',
            iconBg: 'bg-premium-sand',
            iconColor: 'text-premium-gold',
            rules: [
                { icon: 'wb_sunny', text: 'Recomendamos usarlo durante el día para mayor disfrute' },
                { icon: 'timer', text: 'Máximo 90 minutos por día para conservación de equipos' },
                { icon: 'thermostat', text: 'No manipular la temperatura del agua' },
                { icon: 'favorite', text: 'Cuida el jacuzzi como si fuera tuyo' }
            ]
        },
        bottomMessage: 'Las zonas húmedas son de uso exclusivo para los huéspedes de la reserva. Por favor, respeta las normas para mantener las instalaciones en óptimas condiciones.'
    }

    const [content, setContent] = useState(defaults)

    useEffect(() => {
        const loadConfig = async () => {
            // 1. Try API first
            try {
                const response = await fetch('/api/config')
                if (response.ok) {
                    const config = await response.json()
                    if (config.inicioContent?.zonasHumedas) {
                        setContent(prev => ({
                            ...prev,
                            piscina: { ...prev.piscina, ...config.inicioContent.zonasHumedas.piscina },
                            jacuzzi: { ...prev.jacuzzi, ...config.inicioContent.zonasHumedas.jacuzzi },
                            bottomMessage: config.inicioContent.zonasHumedas.bottomMessage || prev.bottomMessage
                        }))
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
                if (config.inicioContent?.zonasHumedas) {
                    setContent(prev => ({
                        ...prev,
                        piscina: { ...prev.piscina, ...config.inicioContent.zonasHumedas.piscina },
                        jacuzzi: { ...prev.jacuzzi, ...config.inicioContent.zonasHumedas.jacuzzi },
                        bottomMessage: config.inicioContent.zonasHumedas.bottomMessage || prev.bottomMessage
                    }))
                }
            }
        }
        loadConfig()
    }, [])

    const zonas = [content.piscina, content.jacuzzi]

    return (
        <section className="px-4 py-6 md:py-10 bg-premium-cream">
            <div className="max-w-7xl mx-auto">
                {/* Header - Premium style */}
                <div className="flex flex-col gap-2 mb-3 md:mb-4">
                    <div className="flex justify-between items-end">
                        <div>
                            <p className="eyebrow mb-2">Bienestar</p>
                            <h2 className="font-premium-display text-premium-forest text-2xl md:text-3xl leading-tight tracking-tight mb-2 text-balance">Zonas Húmedas</h2>
                            <p className="text-sm md:text-base text-premium-ink/60">Disfruta de nuestras instalaciones exclusivas para tu descanso.</p>
                        </div>
                    </div>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {zonas.map((zona) => (
                        <div
                            key={zona.id}
                            className="card-premium p-6"
                        >
                            {/* Card Header */}
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <div className={`w-14 h-14 ${zona.iconBg} rounded-premium flex items-center justify-center`}>
                                        <span className={`material-symbols-outlined text-3xl ${zona.iconColor}`}>{zona.icon}</span>
                                    </div>
                                    <div>
                                        <h3 className="font-premium-display text-premium-forest text-lg">{zona.title}</h3>
                                        <p className="text-sm text-premium-ink/60">{zona.subtitle}</p>
                                    </div>
                                </div>
                                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${zona.badgeColor}`}>
                                    {zona.badge}
                                </span>
                            </div>

                            {/* Rules List */}
                            <div className="space-y-3">
                                <p className="text-xs font-semibold text-premium-ink/50 uppercase tracking-[0.18em] mb-3">Normas de uso</p>
                                {zona.rules.map((rule, index) => (
                                    <div
                                        key={index}
                                        className="flex items-start gap-3 p-3 rounded-premium bg-premium-mist hairline"
                                    >
                                        <div className={`w-8 h-8 ${zona.iconBg === 'bg-premium-mist' ? 'bg-white text-premium-pine' : 'bg-white text-premium-gold'} rounded-lg flex items-center justify-center flex-shrink-0`}>
                                            <span className="material-symbols-outlined text-lg">{rule.icon}</span>
                                        </div>
                                        <p className="text-sm text-premium-ink/70 leading-relaxed pt-1">{rule.text}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom Info - Custom color via CSS variable */}
                <div
                    className="mt-6 rounded-premium p-4 flex items-start gap-3 hairline bg-premium-sand"
                >
                    <span className="material-symbols-outlined text-premium-gold mt-0.5">info</span>
                    <p className="text-sm text-premium-ink/70">
                        {content.bottomMessage.split('uso exclusivo').map((part, i) =>
                            i === 0 ? part : <><strong key={i}>uso exclusivo</strong>{part}</>
                        )}
                    </p>
                </div>
            </div>
        </section>
    )
}
