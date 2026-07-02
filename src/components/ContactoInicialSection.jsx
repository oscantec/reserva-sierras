import { useState, useEffect } from 'react'

export default function ContactoInicialSection() {
    const defaults = {
        whatsappNumber: '573001234567',
        hostName: 'Marcela',
        sectionTitle: 'Contacto Inicial',
        sectionSubtitle: 'Coordina los detalles de tu llegada con nuestra anfitriona.',
        welcomeText: '¡Gracias por elegir Reserva de las Sierras! Para garantizar una llegada organizada, es necesario coordinar previamente los detalles de tu llegada.',
        whatsappMessage: '¡Hola! Acabo de hacer una reserva en Reserva de las Sierras y me gustaría coordinar los detalles de mi llegada.',
        whatsappButtonText: 'Escribir por WhatsApp',
        items: [
            { icon: 'schedule', title: 'Hora de llegada', description: 'Confirma tu hora aproximada de check-in' },
            { icon: 'directions_car', title: 'Indicaciones', description: 'Recibe instrucciones detalladas para llegar' },
            { icon: 'key', title: 'Acceso', description: 'Coordina la entrega de llaves' }
        ]
    }

    const [config, setConfig] = useState(defaults)

    useEffect(() => {
        const loadConfig = async () => {
            // 1. Try API first (this is where saved-config.json data comes from)
            try {
                const response = await fetch('/api/config')
                if (response.ok) {
                    const data = await response.json()
                    if (Object.keys(data).length > 0) {
                        applyConfig(data)
                        localStorage.setItem('casacampestre_config', JSON.stringify(data))
                        console.log('✅ ContactoInicial: Config loaded from API')
                        return
                    }
                }
            } catch (e) {
                console.log('API not available, trying localStorage')
            }

            // 2. Fallback to localStorage
            const saved = localStorage.getItem('casacampestre_config')
            if (saved) {
                applyConfig(JSON.parse(saved))
            }
        }

        const applyConfig = (parsed) => {
            setConfig(prev => ({
                ...prev,
                whatsappNumber: parsed.whatsappNumber || prev.whatsappNumber,
                hostName: parsed.hostName || prev.hostName
            }))
            if (parsed.inicioContent?.contactoInicial) {
                const ci = parsed.inicioContent.contactoInicial
                setConfig(prev => ({
                    ...prev,
                    sectionTitle: ci.sectionTitle || prev.sectionTitle,
                    sectionSubtitle: ci.sectionSubtitle || prev.sectionSubtitle,
                    welcomeText: ci.welcomeText || prev.welcomeText,
                    whatsappMessage: ci.whatsappMessage || prev.whatsappMessage,
                    whatsappButtonText: ci.whatsappButtonText || prev.whatsappButtonText,
                    items: ci.items || prev.items
                }))
            }
        }

        loadConfig()
    }, [])

    const whatsappLink = `https://wa.me/${config.whatsappNumber?.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(config.whatsappMessage)}`

    return (
        <section className="px-4 py-6 md:py-10 bg-premium-cream">
            <div className="max-w-7xl mx-auto">
                {/* Header - Premium style */}
                <div className="flex flex-col gap-2 mb-3 md:mb-4">
                    <div className="flex justify-between items-end">
                        <div>
                            <p className="eyebrow mb-2">Tu llegada</p>
                            <h2 className="font-premium-display text-premium-forest text-2xl md:text-3xl leading-tight tracking-tight mb-2 text-balance">{config.sectionTitle}</h2>
                            <p className="text-sm md:text-base text-premium-ink/60">{config.sectionSubtitle}</p>
                        </div>
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-semibold text-premium-gold">Bienvenido</p>
                            <p className="text-xs text-premium-ink/50">A tu reserva</p>
                        </div>
                    </div>
                </div>

                {/* Main Content - Reservas layout */}
                <div className="flex flex-col lg:flex-row gap-3 md:gap-4">
                    {/* Left - Info Card */}
                    <div className="flex-1 card-premium p-4 md:p-6">
                        <p className="text-sm md:text-base text-premium-ink/70 mb-4 md:mb-6">
                            {config.welcomeText}
                        </p>

                        <div className="space-y-3 md:space-y-4">
                            {config.items.map((item, i) => (
                                <div key={i} className="flex items-start gap-3 p-3 bg-premium-mist rounded-premium hairline hover:shadow-premium-sm transition-all duration-200 ease-premium">
                                    <div className={`p-2 rounded-lg ${i % 2 === 0 ? 'bg-premium-mist text-premium-pine' : 'bg-premium-sand text-premium-gold'}`}>
                                        <span className="material-symbols-outlined">{item.icon}</span>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-base text-premium-forest">{item.title}</p>
                                        <p className="text-sm text-premium-ink/60">{item.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right - WhatsApp Card */}
                    <div className="lg:w-[380px] shrink-0">
                        <div className="card-premium p-4 md:p-6">
                            <div className="flex justify-between items-center mb-4 md:mb-6">
                                <h3 className="font-premium-display text-premium-forest text-lg">Contacta a {config.hostName}</h3>
                            </div>

                            <p className="text-sm text-premium-ink/60 mb-6">
                                Escríbenos por WhatsApp para coordinar todos los detalles de tu estadía.
                            </p>

                            <a
                                href={whatsappLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full h-12 rounded-premium bg-[#25D366] hover:bg-[#1EBE5B] text-white font-semibold shadow-premium hover:shadow-premium-lg transition-all ease-premium flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                </svg>
                                {config.whatsappButtonText}
                            </a>

                            <div className="flex items-center justify-center gap-2 mt-4 text-xs text-premium-ink/50">
                                <span className="material-symbols-outlined text-sm text-premium-gold">verified</span>
                                Anfitrión verificado · Respuesta rápida
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
