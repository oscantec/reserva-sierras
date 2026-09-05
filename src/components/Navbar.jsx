import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import logoFavicon from '../images/Logo ReservaSierras (Favicon).png'
import NavigationDrawer from './NavigationDrawer'

const navLinks = [
    { path: '/', label: 'Inicio', icon: 'home' },
    { path: '/reservas', label: 'Reservas', icon: 'calendar_month' },
    { path: '/registro', label: 'Registro', icon: 'edit_document' },
    { path: '/galeria', label: 'Galería', icon: 'photo_library' },
    { path: '/guia', label: 'Guía', icon: 'info' },
]

export default function Navbar() {
    const { pathname } = useLocation()
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    useEffect(() => { setIsMenuOpen(false) }, [pathname])

    return (
        <>
            <nav className={`site-nav ${pathname === '/' ? 'site-nav--home' : ''}`} aria-label="Navegación principal">
                <div className="site-nav__inner">
                    <Link to="/" className="site-brand" onClick={() => setIsMenuOpen(false)}>
                        <img src={logoFavicon} alt="" width="42" height="42" />
                        <span>Reserva de las Sierras</span>
                    </Link>
                    <div className="site-nav__links">
                        {navLinks.map(link => (
                            <Link key={link.path} to={link.path} aria-current={pathname === link.path ? 'page' : undefined}>
                                {link.label}
                            </Link>
                        ))}
                    </div>
                    <div className="flex items-center gap-2">
                        <Link to="/admin" className="site-nav__admin" aria-label="Panel Admin">
                            <span className="material-symbols-outlined" aria-hidden="true">admin_panel_settings</span>
                            <span>Panel Admin</span>
                        </Link>
                        <button type="button" onClick={() => setIsMenuOpen(true)} className="ui-icon-button site-nav__toggle" aria-label="Abrir menú" aria-expanded={isMenuOpen} aria-haspopup="dialog">
                            <span className="material-symbols-outlined" aria-hidden="true">menu</span>
                        </button>
                    </div>
                </div>
            </nav>
            <NavigationDrawer open={isMenuOpen} onClose={() => setIsMenuOpen(false)}>
                <nav className="drawer-links" aria-label="Navegación móvil">
                    {navLinks.map(link => (
                        <Link key={link.path} to={link.path} onClick={() => setIsMenuOpen(false)} aria-current={pathname === link.path ? 'page' : undefined}>
                            <span className="material-symbols-outlined" aria-hidden="true">{link.icon}</span>
                            {link.label}
                            <span className="material-symbols-outlined ml-auto" aria-hidden="true">arrow_forward</span>
                        </Link>
                    ))}
                    <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="mt-4">
                        <span className="material-symbols-outlined" aria-hidden="true">admin_panel_settings</span>
                        Panel Admin
                    </Link>
                </nav>
                <div className="mt-8 text-sm text-premium-ink/60">
                    <p>Reserva de las Sierras</p>
                    <p>© 2024</p>
                </div>
            </NavigationDrawer>
        </>
    )
}
