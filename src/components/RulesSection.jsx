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
        <section className="px-4 py-6 md:py-10 bg-page-bg-inicio dark:bg-surface-card-dark relative">
            <div className="max-w-7xl mx-auto">
                {/* Header - Unified left-aligned style */}
                <div className="flex flex-col gap-2 mb-3 md:mb-4">
                    <div className="flex justify-between items-end">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-black leading-tight tracking-[-0.033em] mb-2">Normas de la Casa</h2>
                            <p className="text-sm md:text-base text-text-subtitle dark:text-text-subtitle-dark">Reglas de convivencia para una estadía armónica.</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 md:gap-6">
                    {rules.map((rule, idx) => (
                        <div key={idx} className="flex flex-col md:flex-row md:items-start gap-2 md:gap-3 p-3 md:p-5 rounded-lg md:rounded-xl bg-surface-card dark:bg-surface-card-dark border border-border-card dark:border-border-card-dark hover:shadow-md hover:scale-[1.02] transition-all group">
                            <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-icon-bg-primary dark:bg-icon-bg-dark flex items-center justify-center text-icon-color group-hover:bg-primary group-hover:text-white transition-all duration-300 flex-shrink-0">
                                <span className="material-symbols-outlined text-icon-color text-lg md:text-xl">{rule.icon}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-base md:text-lg text-text-main-light dark:text-white mb-0.5 md:mb-1">{rule.title}</h3>
                                <p className="text-sm text-text-muted dark:text-text-muted leading-snug">{rule.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
