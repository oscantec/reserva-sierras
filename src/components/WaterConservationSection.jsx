import { useState, useEffect, useMemo } from 'react'

export default function WaterConservationSection() {
    const defaults = {
        title: 'Cuidado del Agua – Un compromiso vital',
        subtitle: 'Anapoima, y en especial la zona donde se encuentra la vivienda, enfrenta una problemática real y constante en el suministro de agua. Este no es un recurso abundante ni garantizado. Cada gota cuenta. Por eso, les pedimos de manera muy consciente y responsable hacer un uso estrictamente racional del agua durante su estadía. Un consumo excesivo o descuidado puede afectar no solo la operación de la casa',
        tips: [
            { icon: 'local_laundry_service', title: 'Sin Lavandería', desc: 'Evitar lavar ropa durante la estadía contribuye significativamente al ahorro de agua y al buen funcionamiento de la casa.' },
            { icon: 'water_drop', title: 'Cierra el Grifo', desc: 'Mientras te enjabonas o te cepillas los dientes, mantener el grifo cerrado ayuda a evitar desperdicios innecesarios' },
            { icon: 'report', title: 'Reporta Fugas', desc: 'Si notas alguna fuga o goteo, avísanos de inmediato. Detectarlas a tiempo permite ahorrar grandes cantidades de agua.' },
            { icon: 'shower', title: 'Duchas Cortas', desc: 'Intenta que las duchas sean breves. Reducir solo unos minutos marca una gran diferencia en el consumo de agua.' },
        ],
        warningMessage: 'En esta zona el agua no es constante ni abundante y los cortes son frecuentes. Un consumo responsable es fundamental para que el servicio se mantenga durante toda la estadía.',
        showUrgencyBadge: true,
        urgencyBadgeText: 'IMPORTANTE',
        // Rain effect settings
        showRain: true,
        rainColor: '#3db814',
        rainCount: 100,
        rainOpacity: 50,
        rainSpeed: 2
    }

    const [content, setContent] = useState(defaults)

    useEffect(() => {
        const loadConfig = async () => {
            try {
                const response = await fetch('/api/config')
                if (response.ok) {
                    const config = await response.json()
                    if (config.inicioContent?.waterConservation) {
                        setContent(prev => ({ ...prev, ...config.inicioContent.waterConservation }))
                        localStorage.setItem('casacampestre_config', JSON.stringify(config))
                        return
                    }
                }
            } catch (e) {
                console.log('API not available')
            }

            const saved = localStorage.getItem('casacampestre_config')
            if (saved) {
                const config = JSON.parse(saved)
                if (config.inicioContent?.waterConservation) {
                    setContent(prev => ({ ...prev, ...config.inicioContent.waterConservation }))
                }
            }
        }
        loadConfig()
    }, [])

    // Duplicate tips array for seamless infinite scroll
    const duplicatedTips = [...content.tips, ...content.tips]

    // Rain configuration
    const showRain = content.showRain !== false
    const rainColor = content.rainColor || '#3db814'
    const rainCount = content.rainCount || 100
    const rainOpacity = (content.rainOpacity || 50) / 100
    const rainSpeed = content.rainSpeed || 2

    // Generate rain drops with splash particles
    const rainDrops = useMemo(() => {
        return Array.from({ length: rainCount }, (_, i) => {
            const left = Math.random() * 100
            const delay = Math.random() * 5
            const duration = rainSpeed + Math.random() * 2
            const opacity = rainOpacity * (0.3 + Math.random() * 0.7)

            return {
                id: i,
                left,
                height: 15 + Math.random() * 25,
                delay,
                duration,
                opacity,
                // Splash particles for this drop
                splashParticles: Array.from({ length: 3 }, (_, j) => ({
                    id: j,
                    offsetX: (Math.random() - 0.5) * 20, // -10 to 10px spread
                    height: 3 + Math.random() * 5,
                    delay: delay + duration * 0.9, // Splash happens when drop reaches bottom
                }))
            }
        })
    }, [rainCount, rainSpeed, rainOpacity])

    return (
        <section className="px-4 py-8 md:py-12 bg-premium-mist overflow-hidden relative">
            {/* Rain Animation with Splash Effect */}
            {showRain && (
                <div className="absolute inset-0 overflow-hidden pointer-events-none z-30">
                    {rainDrops.map(drop => (
                        <div key={drop.id}>
                            {/* Main rain streak */}
                            <div
                                className="rain-streak"
                                style={{
                                    '--left': `${drop.left}%`,
                                    '--height': `${drop.height}px`,
                                    '--delay': `${drop.delay}s`,
                                    '--duration': `${drop.duration}s`,
                                    '--opacity': drop.opacity,
                                    '--color': rainColor
                                }}
                            />
                            {/* Splash particles */}
                            {drop.splashParticles.map(particle => (
                                <div
                                    key={`${drop.id}-splash-${particle.id}`}
                                    className="splash-particle"
                                    style={{
                                        '--left': `calc(${drop.left}% + ${particle.offsetX}px)`,
                                        '--height': `${particle.height}px`,
                                        '--delay': `${particle.delay}s`,
                                        '--duration': `${drop.duration}s`,
                                        '--opacity': drop.opacity * 0.8,
                                        '--color': rainColor
                                    }}
                                />
                            ))}
                        </div>
                    ))}
                </div>
            )}

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <div className="mb-6">
                    {content.showUrgencyBadge !== false && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] rounded-full mb-3 bg-premium-gold/10 text-premium-gold">
                            <span className="material-symbols-outlined text-sm">warning</span>
                            {content.urgencyBadgeText}
                        </span>
                    )}
                    <h2 className="font-premium-display text-premium-forest text-2xl md:text-3xl leading-tight tracking-tight mb-2 text-balance">
                        {content.title}
                    </h2>
                    <p className="text-premium-ink/60">
                        {content.subtitle}
                    </p>
                </div>

                {/* Infinite Scrolling Tips Marquee */}
                <div className="relative mb-6">
                    <div className="flex animate-marquee gap-4" style={{ width: 'max-content' }}>
                        {duplicatedTips.map((tip, idx) => (
                            <div
                                key={idx}
                                className="card-premium p-5 flex flex-col gap-3 flex-shrink-0 w-72"
                            >
                                <div className="flex justify-between items-start">
                                    <div className={`p-2 rounded-lg ${idx % 2 === 0 ? 'bg-premium-mist text-premium-pine' : 'bg-premium-sand text-premium-gold'}`}>
                                        <span className="material-symbols-outlined">{tip.icon}</span>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-base text-premium-forest mb-1">
                                        {tip.title}
                                    </h3>
                                    <p className="text-sm text-premium-ink/60 leading-relaxed">
                                        {tip.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Warning Card */}
                <div className="bg-white rounded-premium p-5 pt-8 border border-premium-gold/30 shadow-premium-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-premium-forest text-premium-cream text-[10px] font-semibold tracking-[0.14em] px-2 py-1 rounded-bl-lg">
                        IMPORTANTE
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="p-2 bg-premium-sand rounded-lg text-premium-gold flex-shrink-0">
                            <span className="material-symbols-outlined">priority_high</span>
                        </div>
                        <p className="text-sm text-premium-ink/70 leading-relaxed pt-1">
                            {content.warningMessage}
                        </p>
                    </div>
                </div>
            </div>

            {/* CSS - Rain with splash effect */}
            <style>{`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee {
                    animation: marquee 30s linear infinite;
                }
                .animate-marquee:hover {
                    animation-play-state: paused;
                }
                
                /* Rain streak - thin vertical line with gradient */
                .rain-streak {
                    position: absolute;
                    left: var(--left);
                    top: -50px;
                    width: 2px;
                    height: var(--height);
                    background: linear-gradient(
                        to bottom,
                        transparent 0%,
                        var(--color) 30%,
                        var(--color) 70%,
                        transparent 100%
                    );
                    opacity: var(--opacity);
                    animation: rain-fall var(--duration) linear var(--delay) infinite;
                    border-radius: 2px;
                }
                
                @keyframes rain-fall {
                    0% {
                        transform: translateY(0);
                        opacity: 0;
                    }
                    5% {
                        opacity: var(--opacity, 0.5);
                    }
                    90% {
                        opacity: var(--opacity, 0.5);
                    }
                    100% {
                        transform: translateY(calc(100vh + 100px));
                        opacity: 0;
                    }
                }
                
                /* Splash particles - small dots that shoot up and fall */
                .splash-particle {
                    position: absolute;
                    left: var(--left);
                    bottom: 10px;
                    width: 3px;
                    height: var(--height);
                    background: var(--color);
                    opacity: 0;
                    border-radius: 50%;
                    animation: splash var(--duration) ease-out var(--delay) infinite;
                }
                
                @keyframes splash {
                    0%, 85% {
                        opacity: 0;
                        transform: translateY(0) scale(1);
                    }
                    90% {
                        opacity: var(--opacity, 0.6);
                        transform: translateY(-15px) scale(1.2);
                    }
                    95% {
                        opacity: var(--opacity, 0.4);
                        transform: translateY(-8px) scale(0.8);
                    }
                    100% {
                        opacity: 0;
                        transform: translateY(5px) scale(0.5);
                    }
                }
            `}</style>
        </section>
    )
}
