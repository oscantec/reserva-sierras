import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import logoFavicon from '../images/Logo ReservaSierras (Favicon).png'

export default function Navbar() {
    const location = useLocation()
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isScrolled, setIsScrolled] = useState(
        typeof window !== 'undefined' ? window.scrollY > 24 : false
    )

    const isHome = location.pathname === '/'
    // Transparent state only at the very top of the home page (over the hero)
    const isTransparent = isHome && !isScrolled

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 24)
        handleScroll()
        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const navLinks = [
        { path: '/', label: 'Inicio' },
        { path: '/reservas', label: 'Reservas' },
        { path: '/registro', label: 'Registro' },
        { path: '/galeria', label: 'Galería' },
        { path: '/guia', label: 'Guía' },
    ]

    const handleLinkClick = () => {
        setIsMenuOpen(false)
    }

    // Animated gold underline for desktop links
    const linkBase = 'relative px-3 py-2 text-sm font-premium-body font-medium transition-colors duration-300 ease-premium after:absolute after:left-3 after:right-3 after:-bottom-0.5 after:h-[2px] after:origin-left after:scale-x-0 after:bg-premium-gold after:transition-transform after:duration-300 after:ease-premium hover:after:scale-x-100'

    const linkColors = (path) => {
        const active = location.pathname === path
        if (isTransparent) {
            return active
                ? 'text-premium-gold-light after:scale-x-100'
                : 'text-white/85 hover:text-white'
        }
        return active
            ? 'text-premium-forest font-semibold after:scale-x-100'
            : 'text-premium-ink/70 hover:text-premium-forest'
    }

    return (
        <>
            <nav
                className={`${isHome ? 'fixed' : 'sticky'} top-0 left-0 right-0 z-50 w-full transition-all duration-500 ease-premium ${isTransparent
                    ? 'bg-transparent border-b border-transparent'
                    : 'glass shadow-premium-sm'
                    }`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-2" onClick={handleLinkClick}>
                            <img src={logoFavicon} alt="Reserva de las Sierras" className="w-10 h-10 object-contain relative -top-0.5" />
                            <span className={`text-lg font-premium-display font-semibold tracking-tight transition-colors duration-500 ease-premium hidden sm:inline ${isTransparent ? 'text-white' : 'text-premium-forest'}`}>
                                Reserva de las Sierras
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-1">
                            {navLinks.map(link => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`${linkBase} ${linkColors(link.path)}`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>

                        {/* Right Side - Admin Button + Hamburger */}
                        <div className="flex items-center gap-3">
                            {/* Admin button - hidden on small screens */}
                            <Link
                                to="/admin"
                                className="hidden sm:flex bg-premium-forest hover:bg-premium-pine hover:shadow-gold-glow text-white px-4 py-2 rounded-premium text-sm font-premium-body font-semibold transition-all duration-300 ease-premium items-center gap-2"
                            >
                                <span className="material-symbols-outlined text-lg">admin_panel_settings</span>
                                <span className="hidden lg:inline">Panel Admin</span>
                            </Link>

                            {/* Hamburger Button - Mobile only */}
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className={`md:hidden p-2 rounded-lg transition-colors duration-300 ${isTransparent ? 'text-white hover:bg-white/10' : 'text-premium-forest hover:bg-premium-forest/5'}`}
                                aria-label="Abrir menú"
                            >
                                <span className="material-symbols-outlined text-2xl">
                                    {isMenuOpen ? 'close' : 'menu'}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div
                    className="fixed inset-0 bg-premium-ink/50 z-40 md:hidden"
                    onClick={() => setIsMenuOpen(false)}
                />
            )}

            {/* Mobile Menu Panel */}
            <div className={`fixed top-0 right-0 h-full w-72 bg-premium-cream z-50 transform transition-transform duration-300 ease-premium md:hidden ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-premium-gold/30">
                    <span className="font-premium-display font-semibold text-lg text-premium-forest">Menú</span>
                    <button
                        onClick={() => setIsMenuOpen(false)}
                        className="p-2 rounded-lg text-premium-forest hover:bg-premium-forest/5 transition-colors"
                        aria-label="Cerrar menú"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Navigation Links */}
                <div className="p-4 space-y-2">
                    {navLinks.map(link => (
                        <Link
                            key={link.path}
                            to={link.path}
                            onClick={handleLinkClick}
                            className={`flex items-center gap-3 p-3 rounded-premium font-premium-body transition-colors duration-300 ${location.pathname === link.path
                                ? 'bg-premium-forest/10 text-premium-forest font-semibold'
                                : 'text-premium-ink/80 hover:bg-premium-forest/5 hover:text-premium-forest'
                                }`}
                        >
                            <span className="material-symbols-outlined text-xl">
                                {link.path === '/' && 'home'}
                                {link.path === '/galeria' && 'photo_library'}
                                {link.path === '/reservas' && 'calendar_month'}
                                {link.path === '/registro' && 'edit_document'}
                                {link.path === '/guia' && 'info'}
                            </span>
                            {link.label}
                        </Link>
                    ))}
                </div>

                {/* Admin Link in Mobile Menu */}
                <div className="p-4 border-t border-premium-gold/20">
                    <Link
                        to="/admin"
                        onClick={handleLinkClick}
                        className="flex items-center gap-3 p-3 rounded-premium bg-premium-forest text-white font-premium-body font-semibold hover:bg-premium-pine hover:shadow-gold-glow transition-all duration-300 ease-premium"
                    >
                        <span className="material-symbols-outlined">admin_panel_settings</span>
                        Panel Admin
                    </Link>
                </div>

                {/* Footer Info */}
                <div className="absolute bottom-0 left-0 right-0 p-4 text-center text-xs font-premium-body text-premium-ink/50">
                    <p>Reserva de las Sierras</p>
                    <p>© 2024</p>
                </div>
            </div>
        </>
    )
}
