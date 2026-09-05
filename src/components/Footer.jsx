import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import exteriorImg from '../images/Exterior1.webp'
import nextLogo from '../images/NextLogo.png'

export default function Footer() {
    const [config, setConfig] = useState({
        icon: 'nature_people',
        copyright: '© 2024 Reserva de las Sierras. Todos los derechos reservados.',
        email: 'contacto@reservadelassierras.com',
        poweredBy: 'Ingenierocante',
        showAdmin: true,
        overlayColor: '#16302B',
        overlayOpacity: 90,
        logoSize: 5
    })

    useEffect(() => {
        const loadConfig = async () => {
            // Try API first
            try {
                const response = await fetch('/api/config')
                if (response.ok) {
                    const data = await response.json()
                    if (data.inicioContent?.footer) {
                        setConfig(prev => ({ ...prev, ...data.inicioContent.footer }))
                        return
                    }
                }
            } catch (e) {
                console.log('API not available for footer config')
            }

            // Fallback to localStorage
            const saved = localStorage.getItem('casacampestre_config')
            if (saved) {
                const data = JSON.parse(saved)
                if (data.inicioContent?.footer) {
                    setConfig(prev => ({ ...prev, ...data.inicioContent.footer }))
                }
            }
        }
        loadConfig()
    }, [])

    // Calculate overlay opacity (0-1 from 0-100)
    const overlayOpacity = (config.overlayOpacity ?? 90) / 100

    // Logo size in vh (viewport height) - responsive across all devices
    const logoSizeVh = config.logoSize || 5

    return (
        <footer className="site-footer relative mt-auto overflow-hidden border-t border-premium-gold/30">
            {/* Background Image */}
            <div className="absolute inset-0">
                <img
                    src={exteriorImg}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Dynamic overlay for text readability */}
            <div
                className="absolute inset-0"
                style={{
                    backgroundColor: config.overlayColor || '#16302B',
                    opacity: overlayOpacity
                }}
            ></div>

            {/* Content - Editorial Layout */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 text-center py-16 md:py-20">
                <div className="flex flex-col items-center justify-center gap-3 text-white/90">
                    <span className="material-symbols-outlined text-2xl text-white">{config.icon}</span>
                    <span className="font-premium-display text-xl md:text-2xl font-semibold tracking-tight text-white">Reserva de las Sierras</span>
                </div>
                <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-6 mb-8 text-sm font-premium-body font-medium">
                    <Link to="/" className="text-white/80 hover:text-white transition-colors duration-300 ease-premium">Inicio</Link>
                    <Link to="/galeria" className="text-white/80 hover:text-white transition-colors duration-300 ease-premium">Galería</Link>
                    <Link to="/reservas" className="text-white/80 hover:text-white transition-colors duration-300 ease-premium">Reservas</Link>
                    <Link to="/registro" className="text-white/80 hover:text-white transition-colors duration-300 ease-premium">Registro</Link>
                    {config.showAdmin !== false && (
                        <Link to="/admin" className="text-white/80 hover:text-white transition-colors duration-300 ease-premium">Admin</Link>
                    )}
                </div>

                {/* Copyright & Email - Single Line */}
                <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2 text-xs font-premium-body text-white/60">
                    <span>{config.copyright}</span>
                    {config.email && (
                        <>
                            <span className="hidden sm:inline">•</span>
                            <a href={`mailto:${config.email}`} className="hover:text-white transition-colors duration-300 ease-premium">
                                {config.email}
                            </a>
                        </>
                    )}
                </div>

                {/* Powered By - Configurable Logo */}
                <div className="flex items-center justify-center gap-2 mt-6">
                    <span className="text-[10px] font-premium-body text-white/40 uppercase tracking-[0.18em]">Powered by</span>
                    <img
                        src={nextLogo}
                        alt="NextLogo"
                        style={{ height: `${config.logoSize || 8}vh` }}
                        className="w-auto opacity-80 hover:opacity-100 transition-opacity"
                    />
                </div>
            </div>
        </footer>
    )
}
