import { useState, useEffect } from 'react'

export default function RulesSection() {
    const defaultRules = [
        { icon: "schedule", title: "Check-in / Check-out", desc: "Entrada: 3:00 PM. Salida: 11:00 AM. Flexible bajo petición." },
        { icon: "volume_off", title: "Horas de Silencio", desc: "Por respeto a los vecinos, moderar ruido a partir de las 10:00 PM." },
        { icon: "pets", title: "Mascotas", desc: "Bienvenidas con previo aviso. Deben estar vigiladas en zonas comunes." },
        { icon: "smoke_free", title: "No Fumar", desc: "Prohibido fumar en espacios interiores. Usar zonas habilitadas." },
        { icon: "celebration", title: "Eventos", desc: "No se permiten fiestas o eventos ruidosos sin autorización escrita." },
        { icon: "nature_people", title: "Cuidado Ambiental", desc: "Ayúdanos a cuidar el entorno, no arrojar basura en los senderos." },
    ]

    const [rules, setRules] = useState(defaultRules)

    useEffect(() => {
        const loadConfig = async () => {
            // 1. Try API first
            try {
                const response = await fetch('/api/config')
                if (response.ok) {
                    const config = await response.json()
                    if (config.inicioContent?.rules) {
                        setRules(config.inicioContent.rules)
                        localStorage.setItem('casacampestre_config', JSON.stringify(config))
                        return
                    }
                }
            } catch (e) {
                console.log('API not available, using localStorage')
            }

            // 2. Fallback to localStorage
            const saved = localStorage.getItem('casacampestre_config')
            if (saved) {
                const config = JSON.parse(saved)
                if (config.inicioContent?.rules) {
                    setRules(config.inicioContent.rules)
                }
            }
        }
        loadConfig()
    }, [])

    return (
        <section className="px-4 py-6 md:py-10 bg-premium-cream relative">
            <div className="max-w-7xl mx-auto">
                {/* Header - Premium style */}
                <div className="flex flex-col gap-2 mb-3 md:mb-4">
                    <div className="flex justify-between items-end">
                        <div>
                            <p className="eyebrow mb-2">Convivencia</p>
                            <h2 className="font-premium-display text-premium-forest text-2xl md:text-3xl leading-tight tracking-tight mb-2 text-balance">Normas de la Casa</h2>
                            <p className="text-sm md:text-base text-premium-ink/60">Reglas de convivencia para una estadía armónica.</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 md:gap-6">
                    {rules.map((rule, idx) => (
                        <div key={idx} className="card-premium flex flex-col md:flex-row md:items-start gap-2 md:gap-3 p-3 md:p-5 group">
                            <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center ${idx % 2 === 0 ? 'bg-premium-mist text-premium-pine' : 'bg-premium-sand text-premium-gold'} group-hover:bg-premium-forest group-hover:text-premium-cream transition-all duration-300 ease-premium flex-shrink-0`}>
                                <span className="material-symbols-outlined text-lg md:text-xl">{rule.icon}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-base md:text-lg text-premium-forest mb-0.5 md:mb-1">{rule.title}</h3>
                                <p className="text-sm text-premium-ink/60 leading-snug">{rule.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
