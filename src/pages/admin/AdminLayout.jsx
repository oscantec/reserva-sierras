import { useState, useEffect } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import nextLogo from '../../images/NextLogo.png'

export default function AdminLayout() {
    const location = useLocation()
    const navigate = useNavigate()
    const { logout } = useAuth()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [adminLogoHeight, setAdminLogoHeight] = useState(24)

    useEffect(() => {
        const loadConfig = async () => {
            try {
                // Try API first
                const response = await fetch('/api/config')
                if (response.ok) {
                    const data = await response.json()
                    if (data.inicioContent?.footer?.adminLogoHeight) {
                        setAdminLogoHeight(data.inicioContent.footer.adminLogoHeight)
                        return
                    }
                }

                // Fallback to localStorage
                const saved = localStorage.getItem('casacampestre_config')
                if (saved) {
                    const data = JSON.parse(saved)
                    if (data.inicioContent?.footer?.adminLogoHeight) {
                        setAdminLogoHeight(data.inicioContent.footer.adminLogoHeight)
                    }
                }
            } catch (e) {
                console.log('Error loading admin logo height')
            }
        }
        loadConfig()
    }, [])

    const handleLogout = () => {
        logout()
        navigate('/admin/login')
    }

    const isActive = (path) => {
        if (path === '/admin' && location.pathname === '/admin') return true
        if (path !== '/admin' && location.pathname.startsWith(path)) return true
        return false
    }

    const navItems = [
        { path: '/admin', label: 'Dashboard', icon: 'dashboard' },
        { path: '/admin/calendario', label: 'Calendario', icon: 'calendar_month' },
        { path: '/admin/conexiones', label: 'Conexiones', icon: 'sync' },
        { path: '/admin/base-datos', label: 'Base de Datos', icon: 'database' },
        { path: '/admin/tarifas', label: 'Tarifas', icon: 'sell' },
        { path: '/admin/contenido', label: 'Contenido', icon: 'edit_note' },
        { path: '/admin/seguridad', label: 'Seguridad', icon: 'shield' },
    ]

    // Mobile bottom navigation items - includes home to exit admin
    const mobileNavItems = [
        { path: '/', label: 'Inicio', icon: 'home' },
        { path: '/admin', label: 'Dashboard', icon: 'dashboard' },
        { path: '/admin/calendario', label: 'Calendario', icon: 'calendar_month' },
        { path: '/admin/conexiones', label: 'Conexiones', icon: 'sync' },
        { path: '/admin/base-datos', label: 'Base Datos', icon: 'database' },
        { path: '/admin/tarifas', label: 'Tarifas', icon: 'sell' },
        { path: '/admin/contenido', label: 'Contenido', icon: 'edit_note' },
        { path: '/admin/seguridad', label: 'Seguridad', icon: 'shield' },
    ]

    return (
        <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark">
            {/* Desktop Sidebar */}
            <aside className="w-64 flex-shrink-0 border-r border-border-card dark:border-border-card-dark bg-surface-card dark:bg-surface-card-dark hidden lg:flex flex-col justify-between">
                <div className="flex flex-col h-full p-4">
                    <div className="flex justify-center mb-8 px-2 mt-2">
                        <img
                            src={nextLogo}
                            alt="NextLogo"
                            style={{ width: '100%', maxWidth: '180px' }}
                            className="h-auto object-contain opacity-90"
                        />
                    </div>

                    <nav className="flex flex-col gap-1 flex-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${isActive(item.path)
                                    ? 'bg-icon-bg-primary text-icon-color'
                                    : 'text-text-main-light dark:text-text-main-dark hover:bg-background-light dark:hover:bg-background-dark/50'
                                    }`}
                            >
                                <span className={`material-symbols-outlined ${isActive(item.path) ? 'filled-icon' : 'text-text-secondary-light dark:text-text-secondary-dark'}`}>
                                    {item.icon}
                                </span>
                                <span className={`text-sm ${isActive(item.path) ? 'font-semibold' : 'font-medium'}`}>{item.label}</span>
                            </Link>
                        ))}

                        <div className="border-t border-border-card dark:border-border-card-dark my-4"></div>

                        {/* Links to public pages */}
                        <p className="px-3 text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Páginas</p>
                        <Link to="/" className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-main-light dark:text-text-main-dark hover:bg-background-light dark:hover:bg-background-dark/50 transition-all">
                            <span className="material-symbols-outlined text-text-secondary-light dark:text-text-secondary-dark text-xl">home</span>
                            <span className="text-sm font-medium">Inicio</span>
                        </Link>
                        <Link to="/galeria" className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-main-light dark:text-text-main-dark hover:bg-background-light dark:hover:bg-background-dark/50 transition-all">
                            <span className="material-symbols-outlined text-text-secondary-light dark:text-text-secondary-dark text-xl">photo_library</span>
                            <span className="text-sm font-medium">Galería</span>
                        </Link>
                        <Link to="/reservas" className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-main-light dark:text-text-main-dark hover:bg-background-light dark:hover:bg-background-dark/50 transition-all">
                            <span className="material-symbols-outlined text-text-secondary-light dark:text-text-secondary-dark text-xl">calendar_month</span>
                            <span className="text-sm font-medium">Reservas</span>
                        </Link>
                        <Link to="/registro" className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-main-light dark:text-text-main-dark hover:bg-background-light dark:hover:bg-background-dark/50 transition-all">
                            <span className="material-symbols-outlined text-text-secondary-light dark:text-text-secondary-dark text-xl">how_to_reg</span>
                            <span className="text-sm font-medium">Registro</span>
                        </Link>
                        <Link to="/guia" className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-main-light dark:text-text-main-dark hover:bg-background-light dark:hover:bg-background-dark/50 transition-all">
                            <span className="material-symbols-outlined text-text-secondary-light dark:text-text-secondary-dark text-xl">menu_book</span>
                            <span className="text-sm font-medium">Guía</span>
                        </Link>

                        <div className="border-t border-border-card dark:border-border-card-dark my-4"></div>

                        {/* Logout Button */}
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all w-full"
                        >
                            <span className="material-symbols-outlined text-xl">logout</span>
                            <span className="text-sm font-medium">Cerrar Sesión</span>
                        </button>
                    </nav>
                </div>
            </aside>

            {/* Main content - with bottom padding for mobile nav */}
            <main className="flex-1 flex flex-col h-full overflow-y-auto relative pb-16 lg:pb-0">
                <Outlet />
            </main>

            {/* Mobile Bottom Navigation - Compact */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-surface-card dark:bg-surface-card-dark border-t border-border-card dark:border-border-card-dark z-50 safe-area-inset-bottom">
                <div className="flex justify-around items-center h-12">
                    {mobileNavItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex flex-col items-center justify-center flex-1 h-full py-0.5 transition-colors ${isActive(item.path)
                                ? 'text-primary'
                                : 'text-text-muted dark:text-text-muted'
                                }`}
                        >
                            <span className={`material-symbols-outlined text-lg ${isActive(item.path) ? 'filled-icon' : ''}`}>
                                {item.icon}
                            </span>
                            <span className="text-[8px] font-medium leading-tight">{item.label}</span>
                        </Link>
                    ))}
                </div>
            </nav>
        </div>
    )
}
