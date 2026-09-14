import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import logoBrand from '../images/Logo.webp'
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
            <nav className="site-nav" aria-label="Navegación principal">
                <div className="site-nav__inner">
                    <a href="/" className="site-brand" onClick={() => setIsMenuOpen(false)}>
                        <img src={logoBrand} alt="Reserva de las Sierras" width="170" height="52" />
                        <span>Reserva de las Sierras</span>
                    </a>
                    <div className="site-nav__links">
                        {navLinks.map(link => link.path === '/' ? (
                            <a key={link.path} href={link.path} style={{ color: '#f4a261' }} aria-current={pathname === link.path ? 'page' : undefined}>{link.label}</a>
                        ) : (
                            <Link key={link.path} to={link.path} style={{ color: '#f4a261' }} aria-current={pathname === link.path ? 'page' : undefined}>{link.label}</Link>
                        ))}
                    </div>
                    <div className="site-nav__actions flex items-center gap-2">
                        <button type="button" onClick={() => setIsMenuOpen(true)} className="ui-icon-button site-nav__toggle" aria-label="Abrir menú" aria-expanded={isMenuOpen} aria-haspopup="dialog">
                            <span className="navbar-hamburger-bars" aria-hidden="true"><i style={{ backgroundColor: '#f4a261' }}></i><i style={{ backgroundColor: '#f4a261' }}></i><i style={{ backgroundColor: '#f4a261' }}></i></span>
                        </button>
                        <Link to="/admin" className="site-nav__admin" aria-label="Panel Admin">
                            <span className="material-symbols-outlined" aria-hidden="true">key</span>
                            <span>Panel Admin</span>
                        </Link>
                    </div>
                </div>
            </nav>
            <NavigationDrawer open={isMenuOpen} onClose={() => setIsMenuOpen(false)}>
                <nav className="drawer-links" aria-label="Navegación móvil">
                    {navLinks.map(link => {
                        const linkContent = <><span className="material-symbols-outlined" aria-hidden="true">{link.icon}</span>{link.label}<span className="material-symbols-outlined ml-auto" aria-hidden="true">arrow_forward</span></>
                        return link.path === '/' ? (
                            <a key={link.path} href={link.path} onClick={() => setIsMenuOpen(false)} aria-current={pathname === link.path ? 'page' : undefined}>{linkContent}</a>
                        ) : (
                            <Link key={link.path} to={link.path} onClick={() => setIsMenuOpen(false)} aria-current={pathname === link.path ? 'page' : undefined}>{linkContent}</Link>
                        )
                    })}
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
