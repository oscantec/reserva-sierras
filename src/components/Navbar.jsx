import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import logoFavicon from '../images/Logo ReservaSierras (Favicon).png'

export default function Navbar() {
    const location = useLocation()
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    const isActive = (path) =>
        location.pathname === path
            ? "text-primary font-bold"
            : "text-text-muted dark:text-slate-300 hover:text-primary"

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

    return (
        <>
            <nav className="sticky top-0 z-50 w-full border-b border-border-light dark:border-white/10 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-2" onClick={handleLinkClick}>
                            <img src={logoFavicon} alt="Reserva de las Sierras" className="w-10 h-10 object-contain relative -top-0.5" />
                            <span className="text-lg font-bold tracking-tight text-text-main-light dark:text-white hidden sm:inline">Reserva de las Sierras</span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-full p-1">
                            {navLinks.map(link => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`relative px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 ${location.pathname === link.path
                                        ? 'bg-primary text-white shadow-lg shadow-card scale-105'
                                        : 'text-text-muted hover:text-primary hover:bg-white dark:hover:bg-gray-700'
                                        }`}
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
                                className="hidden sm:flex bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-card transition-all items-center gap-2"
                            >
                                <span className="material-symbols-outlined text-lg">admin_panel_settings</span>
                                <span className="hidden lg:inline">Panel Admin</span>
                            </Link>

                            {/* Hamburger Button - Mobile only */}
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="md:hidden p-2 text-text-main-light dark:text-white rounded-lg hover:bg-icon-bg-primary dark:hover:bg-white/10 transition-colors"
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
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsMenuOpen(false)}
                />
            )}

            {/* Mobile Menu Panel */}
            <div className={`fixed top-0 right-0 h-full w-72 bg-surface-card dark:bg-surface-card-dark z-50 transform transition-transform duration-300 ease-in-out md:hidden ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-border-light dark:border-border-dark">
                    <span className="font-bold text-lg">Menú</span>
                    <button
                        onClick={() => setIsMenuOpen(false)}
                        className="p-2 rounded-lg hover:bg-icon-bg-primary dark:hover:bg-white/10 transition-colors"
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
                            className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${location.pathname === link.path
                                ? 'bg-icon-bg-primary dark:bg-icon-bg-dark text-icon-color font-bold'
                                : 'hover:bg-icon-bg-primary dark:hover:bg-white/10'
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
                <div className="p-4 border-t border-border-light dark:border-border-dark">
                    <Link
                        to="/admin"
                        onClick={handleLinkClick}
                        className="flex items-center gap-3 p-3 rounded-xl bg-primary text-white font-bold hover:bg-primary-hover transition-colors"
                    >
                        <span className="material-symbols-outlined">admin_panel_settings</span>
                        Panel Admin
                    </Link>
                </div>

                {/* Footer Info */}
                <div className="absolute bottom-0 left-0 right-0 p-4 text-center text-xs text-text-muted dark:text-text-muted">
                    <p>Reserva de las Sierras</p>
                    <p>© 2024</p>
                </div>
            </div>
        </>
    )
}
