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

    return (
        <footer className="site-footer home-site-footer relative mt-auto overflow-hidden border-t border-premium-gold/30">
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

            {/* Same compact footer hierarchy used on the public homepage. */}
            <div className="site-footer__content relative z-10 max-w-7xl mx-auto px-4 sm:px-6 text-center py-16 md:py-20">
                <div className="home-footer-name font-premium-display font-semibold tracking-tight text-white">Reserva de las Sierras</div>
                <nav className="home-footer-nav flex flex-wrap justify-center gap-x-6 gap-y-2 mt-6 mb-8 text-sm font-premium-body font-medium" aria-label="Navegación del sitio">
                    <a href="/" className="text-white/80 hover:text-white transition-colors duration-300 ease-premium">Inicio</a>
                    <Link to="/galeria" className="text-white/80 hover:text-white transition-colors duration-300 ease-premium">Galería</Link>
                    <Link to="/reservas" className="text-white/80 hover:text-white transition-colors duration-300 ease-premium">Reservas</Link>
                    <Link to="/registro" className="text-white/80 hover:text-white transition-colors duration-300 ease-premium">Registro</Link>
                </nav>

                <div className="home-footer-meta flex flex-wrap items-center justify-center gap-1 sm:gap-2 text-xs font-premium-body text-white/60">
                    <span>{config.copyright}</span>
                </div>

                <div className="home-powered flex items-center justify-center gap-2 mt-6">
                    <span className="font-premium-body text-white/40 uppercase tracking-[0.18em]">Powered by</span>
                    <img
                        src={nextLogo}
                        alt="NextCan"
                        className="w-auto opacity-80 hover:opacity-100 transition-opacity"
                    />
                </div>
            </div>
        </footer>
    )
}
