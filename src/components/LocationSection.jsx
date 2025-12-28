import { useState, useEffect } from 'react'

export default function LocationSection() {
    const defaults = {
        title: 'Cómo llegar a Reserva de las Sierras',
        subtitle: 'Sigue nuestras indicaciones para disfrutar sin contratiempos.',
        mapUrl: 'https://maps.google.com/maps?q=Reserva+de+las+Sierras&output=embed',
        wazeUrl: 'https://waze.com/ul',
        mapsUrl: 'https://maps.google.com',
        referenceImage: '/src/images/Acceso Casa2.webp',
        referenceCaption: 'Acceso a la Finca',
        roadCondition: 'Carretera pavimentada en 95%. Últimos 500m de vía destapada accesible.',
        stepsCarro: [
            { title: 'Salida por Autopista Norte', desc: 'Mantente en carril izquierdo hasta el Peaje Los Andes.' },
            { title: 'Glorieta San Mateo', desc: 'Toma la segunda salida hacia variante rural.' },
            { title: 'Desvío Veredal (Km 12)', desc: 'Gira a la derecha. Referencia: tienda azul.' },
            { title: 'Llegada', desc: '500m más, tercera finca a la izquierda.' }
        ],
        stepsBus: [
            { title: 'Terminal de Transporte', desc: 'Toma un bus hacia Anapoima desde el Terminal del Sur.' },
            { title: 'Bajarse en el cruce', desc: 'Pide al conductor dejarte en el cruce de la vereda.' },
            { title: 'Mototaxi o caminata', desc: 'Toma un mototaxi o camina 15 minutos hasta la finca.' },
            { title: 'Llegada', desc: 'Busca el letrero "Reserva de las Sierras" a la izquierda.' }
        ],
        helpMessage: '¿Te perdiste? Llámanos, te guiaremos en tiempo real.'
    }

    const [content, setContent] = useState(defaults)
    const [transportMode, setTransportMode] = useState('carro') // 'carro' or 'bus'

    useEffect(() => {
        const loadConfig = async () => {
            // 1. Try API first
            try {
                const response = await fetch('/api/config')
                if (response.ok) {
                    const configData = await response.json()
                    if (configData.inicioContent?.location) {
                        const loc = configData.inicioContent.location
                        setContent(prev => ({
                            ...prev,
                            ...loc,
                            stepsCarro: loc.stepsCarro || loc.steps || prev.stepsCarro,
                            stepsBus: loc.stepsBus || prev.stepsBus
                        }))
                        localStorage.setItem('casacampestre_config', JSON.stringify(configData))
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
                if (config.inicioContent?.location) {
                    const loc = config.inicioContent.location
                    setContent(prev => ({
                        ...prev,
                        ...loc,
                        stepsCarro: loc.stepsCarro || loc.steps || prev.stepsCarro,
                        stepsBus: loc.stepsBus || prev.stepsBus
                    }))
                }
            }
        }
        loadConfig()
    }, [])

    const currentSteps = transportMode === 'carro' ? content.stepsCarro : content.stepsBus

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
                        <div className="flex gap-3">
                            <a href={content.wazeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-surface-card dark:bg-surface-card-dark border border-border-card dark:border-border-card-dark rounded-lg text-sm font-bold hover:shadow-md hover:scale-[1.02] transition-all group">
                                {/* Waze Logo - Ghost (Wazer) */}
                                <svg width="20" height="20" viewBox="0 0 24 24" className="text-text-main-light dark:text-white group-hover:text-primary transition-colors">
                                    <path fill="currentColor" d="M12 2C6.5 2 2 6.5 2 12c0 2.3.8 4.4 2.1 6.1-.3 1.3-1 2.4-1.9 3.3-.2.2-.1.5.1.6.1.1.2.1.3.1 1.5 0 2.9-.6 4-1.5 1.6.8 3.4 1.3 5.4 1.3 5.5 0 10-4.5 10-10S17.5 2 12 2m0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8" />
                                    <circle fill="currentColor" cx="9" cy="10" r="1.5" />
                                    <circle fill="currentColor" cx="15" cy="10" r="1.5" />
                                    <path fill="currentColor" d="M12 16c-1.5 0-2.7-.8-3.4-2h6.8c-.7 1.2-1.9 2-3.4 2" />
                                </svg>
                                Waze
                            </a>
                            <a href={content.mapsUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-surface-card dark:bg-surface-card-dark border border-border-card dark:border-border-card-dark rounded-lg text-sm font-bold hover:shadow-md hover:scale-[1.02] transition-all group">
                                {/* Google Maps Icon - Clean Style */}
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-text-main-light dark:text-white group-hover:text-primary transition-colors">
                                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" fill="currentColor" />
                                </svg>
                                Maps
                            </a>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-3 md:gap-4">
                    {/* Left - Map and References */}
                    <div className="flex-1 flex flex-col gap-3 md:gap-4">
                        {/* Map Card with Green Pin */}
                        <div className="bg-surface-card dark:bg-surface-card-dark rounded-xl border border-border-card dark:border-border-card-dark overflow-hidden relative">
                            {/* Map with grayscale filter */}
                            <div className="w-full h-[180px] md:h-[280px]" style={{ filter: 'grayscale(60%)' }}>
                                <iframe
                                    src={content.mapUrl}
                                    className="w-full h-full"
                                    style={{ border: 0 }}
                                    allowFullScreen=""
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                ></iframe>
                            </div>
                            {/* Green Pin - OUTSIDE filter container */}
                            <div
                                className="absolute pointer-events-none z-10"
                                style={{
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -100%)'
                                }}
                            >
                                <svg width="28" height="36" viewBox="0 0 24 30" style={{ filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.4))' }}>
                                    <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 18 12 18s12-9 12-18c0-6.6-5.4-12-12-12z" fill="var(--color-btn-primary, #3db814)" />
                                </svg>
                            </div>
                        </div>

                        {/* Visual References Card */}
                        <div className="bg-surface-card dark:bg-surface-card-dark rounded-xl p-3 md:p-5 border border-border-card dark:border-border-card-dark">
                            <h3 className="font-bold text-base md:text-lg mb-3 md:mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-icon-color">location_on</span>
                                Puntos de Referencia
                            </h3>
                            <div className="mb-3">
                                <div className="relative rounded-xl overflow-hidden">
                                    <img src={content.referenceImage} className="w-full h-auto object-contain" alt={content.referenceCaption} />
                                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/60">
                                        <p className="text-white text-xs font-bold">{content.referenceCaption}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right - Directions */}
                    <div className="lg:w-[380px] shrink-0">
                        <div className="sticky top-24 bg-surface-card dark:bg-surface-card-dark rounded-xl p-3 md:p-5 border border-border-card dark:border-border-card-dark">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold">Instrucciones</h3>
                            </div>

                            {/* Transport Mode Selector */}
                            <div className="flex gap-2 mb-6">
                                <button
                                    onClick={() => setTransportMode('carro')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-bold transition-all ${transportMode === 'carro'
                                        ? 'bg-primary text-white shadow-lg shadow-card'
                                        : 'bg-page-bg-inicio dark:bg-surface-card-dark border border-border-card dark:border-border-card-dark text-text-muted dark:text-text-muted hover:bg-surface-light dark:hover:bg-border-card-dark'
                                        }`}
                                >
                                    <span className="material-symbols-outlined text-lg">directions_car</span>
                                    Carro
                                </button>
                                <button
                                    onClick={() => setTransportMode('bus')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-bold transition-all ${transportMode === 'bus'
                                        ? 'bg-primary text-white shadow-lg shadow-card'
                                        : 'bg-page-bg-inicio dark:bg-surface-card-dark border border-border-card dark:border-border-card-dark text-text-muted dark:text-text-muted hover:bg-surface-light dark:hover:bg-border-card-dark'
                                        }`}
                                >
                                    <span className="material-symbols-outlined text-lg">directions_bus</span>
                                    Bus
                                </button>
                            </div>

                            <div className="space-y-4 md:space-y-6">
                                {currentSteps.map((step, i) => (
                                    <div key={i} className="flex gap-4">
                                        <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">{i + 1}</div>
                                        <div>
                                            <p className="font-bold text-sm">{step.title}</p>
                                            <p className="text-xs text-text-muted dark:text-text-muted">{step.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="h-px bg-icon-bg-primary dark:bg-border-card-dark my-6"></div>

                            <div
                                className="p-4 rounded-lg border"
                                style={{
                                    backgroundColor: 'var(--color-accent-info)',
                                    borderColor: 'var(--color-accent-info)'
                                }}
                            >
                                <p className="text-sm flex items-start gap-2" style={{ color: 'var(--color-accent-info-text)' }}>
                                    <span className="material-symbols-outlined text-lg" style={{ color: 'var(--color-accent-info-icon)' }}>info</span>
                                    <span>{content.helpMessage}</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
