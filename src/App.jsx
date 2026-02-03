import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { useEffect, lazy, Suspense } from 'react'
import { initializeConfig } from './utils/config'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import PageLoader from './components/PageLoader'

// Pages - Inicio se carga inmediatamente (LCP crítica)
import Inicio from './pages/Inicio'

// Pages - Lazy loaded (mejora performance inicial)
const Galeria = lazy(() => import('./pages/Galeria'))
const Reservas = lazy(() => import('./pages/Reservas'))
const Registro = lazy(() => import('./pages/Registro'))
const Guia = lazy(() => import('./pages/Guia'))
const TestSparkles = lazy(() => import('./pages/TestSparkles'))

// Admin pages - Lazy loaded
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'))
const Dashboard = lazy(() => import('./pages/admin/Dashboard'))
const Conexiones = lazy(() => import('./pages/admin/Conexiones'))
const BaseDatos = lazy(() => import('./pages/admin/BaseDatos'))
const Calendario = lazy(() => import('./pages/admin/Calendario'))
const Tarifas = lazy(() => import('./pages/admin/Tarifas'))
const AdminContenido = lazy(() => import('./pages/admin/AdminContenido'))
const Login = lazy(() => import('./pages/admin/Login'))
const Seguridad = lazy(() => import('./pages/admin/Seguridad'))
const AdminWaterConfig = lazy(() => import('./pages/admin/AdminWaterConfig'))
const AdminWaterStats = lazy(() => import('./pages/admin/AdminWaterStats'))

// Scroll to top on every page change
function ScrollToTop() {
    const { pathname } = useLocation()
    useEffect(() => {
        window.scrollTo(0, 0)
    }, [pathname])
    return null
}

function App() {
    // Initialize configuration on app startup - CRITICAL for Google Sheets connection
    useEffect(() => {
        initializeConfig()

        // Function to apply colors from config
        const applyColorsFromConfig = (config) => {
            if (!config) return
            const root = document.documentElement

            // Apply legacy siteColors for backwards compatibility
            if (config.siteColors) {
                const colors = config.siteColors
                root.style.setProperty('--color-primary', colors.primary)
                root.style.setProperty('--color-primary-dark', colors.primaryDark)
                root.style.setProperty('--color-primary-light', colors.primaryLight)
                root.style.setProperty('--color-primary-lighter', colors.primaryLighter)
                root.style.setProperty('--color-accent-info', colors.accentInfo)
                root.style.setProperty('--color-accent-info-text', colors.accentInfoText)
                root.style.setProperty('--color-accent-info-icon', colors.accentInfoIcon)
                root.style.setProperty('--color-surface-info', colors.surfaceInfo)
                root.style.setProperty('--color-surface-info-dark', colors.surfaceInfoDark)
                root.style.setProperty('--color-icon-bg', colors.iconBg)
                root.style.setProperty('--color-icon-bg-dark', colors.iconBgDark)
            }

            // Apply new standardized colors system (saved as siteColors by AdminContenido)
            if (config.siteColors) {
                const c = config.siteColors
                // Botones
                if (c.btnPrimary) root.style.setProperty('--color-btn-primary', c.btnPrimary)
                if (c.btnPrimaryHover) root.style.setProperty('--color-btn-primary-hover', c.btnPrimaryHover)
                // Textos - COMPLETOS
                if (c.textMain) root.style.setProperty('--color-text-main', c.textMain)
                if (c.textTitle) root.style.setProperty('--color-text-title', c.textTitle)
                if (c.textMuted) root.style.setProperty('--color-text-muted', c.textMuted)
                if (c.textSubtitle) root.style.setProperty('--color-text-subtitle', c.textSubtitle)
                if (c.textSubtitleDark) root.style.setProperty('--color-text-subtitle-dark', c.textSubtitleDark)
                if (c.textLink) root.style.setProperty('--color-text-link', c.textLink)
                if (c.textAccent) root.style.setProperty('--color-text-accent', c.textAccent)
                if (c.textOnPrimary) root.style.setProperty('--color-text-on-primary', c.textOnPrimary)
                // Iconos - COLORES COMPLETOS
                if (c.iconColor) root.style.setProperty('--color-icon-color', c.iconColor)
                if (c.iconColorSecondary) root.style.setProperty('--color-icon-color-secondary', c.iconColorSecondary)
                if (c.iconColorDark) root.style.setProperty('--color-icon-color-dark', c.iconColorDark)
                if (c.iconBgPrimary) root.style.setProperty('--color-icon-bg-primary', c.iconBgPrimary)
                if (c.iconBgSecondary) root.style.setProperty('--color-icon-bg-secondary', c.iconBgSecondary)
                if (c.iconBgDark) root.style.setProperty('--color-icon-bg-dark', c.iconBgDark)
                if (c.iconBorder) root.style.setProperty('--color-icon-border', c.iconBorder)
                // Superficies
                if (c.surfaceCard) root.style.setProperty('--color-surface-card', c.surfaceCard)
                if (c.surfacePage) root.style.setProperty('--color-surface-page', c.surfacePage)
                if (c.surfaceCardDark) root.style.setProperty('--color-surface-card-dark', c.surfaceCardDark)
                if (c.surfacePageDark) root.style.setProperty('--color-surface-page-dark', c.surfacePageDark)
                if (c.surfaceSection) root.style.setProperty('--color-surface-section', c.surfaceSection)
                if (c.surfaceCardHover) root.style.setProperty('--color-surface-card-hover', c.surfaceCardHover)
                if (c.surfaceNav) root.style.setProperty('--color-surface-nav', c.surfaceNav)
                if (c.surfaceFooter) root.style.setProperty('--color-surface-footer', c.surfaceFooter)
                if (c.surfaceLight) root.style.setProperty('--color-surface-light', c.surfaceLight)
                // Fondos de Páginas
                if (c.pageBgInicio) root.style.setProperty('--color-page-bg-inicio', c.pageBgInicio)
                if (c.pageBgReservas) root.style.setProperty('--color-page-bg-reservas', c.pageBgReservas)
                if (c.pageBgGaleria) root.style.setProperty('--color-page-bg-galeria', c.pageBgGaleria)
                if (c.pageBgRegistro) root.style.setProperty('--color-page-bg-registro', c.pageBgRegistro)
                if (c.pageBgGuia) root.style.setProperty('--color-page-bg-guia', c.pageBgGuia)
                if (c.pageBgAdmin) root.style.setProperty('--color-page-bg-admin', c.pageBgAdmin)
                // Bordes
                if (c.borderCard) root.style.setProperty('--color-border-card', c.borderCard)
                if (c.borderCardDark) root.style.setProperty('--color-border-card-dark', c.borderCardDark)
                // Sombras
                if (c.cardShadow) root.style.setProperty('--color-card-shadow', c.cardShadow)
                // Badges
                if (c.badgeBg) root.style.setProperty('--color-badge-bg', c.badgeBg)
                if (c.badgeText) root.style.setProperty('--color-badge-text', c.badgeText)
                // Plataformas
                if (c.platformAirbnb) root.style.setProperty('--color-platform-airbnb', c.platformAirbnb)
                if (c.platformBooking) root.style.setProperty('--color-platform-booking', c.platformBooking)
                if (c.platformGoogle) root.style.setProperty('--color-platform-google', c.platformGoogle)
                if (c.platformDirecta) root.style.setProperty('--color-platform-directa', c.platformDirecta)
                if (c.navWaze) root.style.setProperty('--color-nav-waze', c.navWaze)
                if (c.navMaps) root.style.setProperty('--color-nav-maps', c.navMaps)
                // Alertas - Success
                if (c.successBg) root.style.setProperty('--color-success-bg', c.successBg)
                if (c.successText) root.style.setProperty('--color-success-text', c.successText)
                if (c.successIcon) root.style.setProperty('--color-success-icon', c.successIcon)
                if (c.successBorder) root.style.setProperty('--color-success-border', c.successBorder)
                // Alertas - Warning
                if (c.warningBg) root.style.setProperty('--color-warning-bg', c.warningBg)
                if (c.warningText) root.style.setProperty('--color-warning-text', c.warningText)
                if (c.warningIcon) root.style.setProperty('--color-warning-icon', c.warningIcon)
                if (c.warningBorder) root.style.setProperty('--color-warning-border', c.warningBorder)
                // Alertas - Info
                if (c.infoBg) root.style.setProperty('--color-info-bg', c.infoBg)
                if (c.infoText) root.style.setProperty('--color-info-text', c.infoText)
                if (c.infoIcon) root.style.setProperty('--color-info-icon', c.infoIcon)
                if (c.infoBorder) root.style.setProperty('--color-info-border', c.infoBorder)
                // Alertas - Error
                if (c.errorBg) root.style.setProperty('--color-error-bg', c.errorBg)
                if (c.errorText) root.style.setProperty('--color-error-text', c.errorText)
                if (c.errorIcon) root.style.setProperty('--color-error-icon', c.errorIcon)
                if (c.errorBorder) root.style.setProperty('--color-error-border', c.errorBorder)
            }

            // Apply custom fonts
            if (config.siteFonts) {
                const f = config.siteFonts
                if (f.fontGlobal) root.style.setProperty('--font-display', `"${f.fontGlobal}", sans-serif`)
            }
        }

        // SIEMPRE cargar desde API (Supabase) primero - localStorage es solo cache
        const loadAndApplyConfig = async () => {
            try {
                // PRIORIDAD 1: Siempre intentar cargar desde API (Supabase)
                const response = await fetch('/api/config')
                if (response.ok) {
                    const apiConfig = await response.json()
                    if (Object.keys(apiConfig).length > 0) {
                        applyColorsFromConfig(apiConfig)
                        // Actualizar cache local
                        localStorage.setItem('casacampestre_config', JSON.stringify(apiConfig))
                        console.log('✅ Configuración cargada desde Supabase')
                        return
                    }
                }
            } catch (e) {
                console.log('API no disponible, usando cache local')
            }

            // PRIORIDAD 2: Solo usar localStorage si API falló
            const savedConfig = localStorage.getItem('casacampestre_config')
            if (savedConfig) {
                const config = JSON.parse(savedConfig)
                applyColorsFromConfig(config)
                console.log('⚠️ Usando configuración de cache local')
            }
        }

        loadAndApplyConfig()
    }, [])

    return (
        <AuthProvider>
            <ScrollToTop />
            <Suspense fallback={<PageLoader />}>
                <Routes>
                    {/* Public routes - Inicio carga inmediatamente (LCP crítica) */}
                    <Route path="/" element={<Inicio />} />
                    
                    {/* Public routes - Lazy loaded */}
                    <Route path="/galeria" element={<Galeria />} />
                    <Route path="/reservas" element={<Reservas />} />
                    <Route path="/registro" element={<Registro />} />
                    <Route path="/guia" element={<Guia />} />
                    <Route path="/test-sparkles" element={<TestSparkles />} />

                    {/* Admin Login (public) - Lazy loaded */}
                    <Route path="/admin/login" element={<Login />} />

                    {/* Protected Admin routes - Lazy loaded */}
                    <Route path="/admin" element={
                        <ProtectedRoute>
                            <AdminLayout />
                        </ProtectedRoute>
                    }>
                        <Route index element={<Dashboard />} />
                        <Route path="conexiones" element={<Conexiones />} />
                        <Route path="base-datos" element={<BaseDatos />} />
                        <Route path="calendario" element={<Calendario />} />
                        <Route path="tarifas" element={<Tarifas />} />
                        <Route path="contenido" element={<AdminContenido />} />
                        <Route path="seguridad" element={<Seguridad />} />
                        <Route path="agua/config" element={<AdminWaterConfig />} />
                        <Route path="agua/stats" element={<AdminWaterStats />} />
                    </Route>
                </Routes>
            </Suspense>
        </AuthProvider>
    )
}


export default App
