/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                // === BOTONES ===
                "primary": "var(--color-btn-primary)",
                "primary-hover": "var(--color-btn-primary-hover)",
                "btn-primary": "var(--color-btn-primary)",
                "btn-primary-hover": "var(--color-btn-primary-hover)",

                // === SUPERFICIES - CONTENEDORES ===
                "surface-card": "var(--color-surface-card)",
                "surface-card-hover": "var(--color-surface-card-hover)",
                "surface-card-dark": "var(--color-surface-card-dark)",
                "surface-light": "var(--color-surface-light)",
                "surface-section": "var(--color-surface-section)",
                "surface-nav": "var(--color-surface-nav)",
                "surface-footer": "var(--color-surface-footer)",
                "surface-page": "var(--color-surface-page)",
                "surface-page-dark": "var(--color-surface-page-dark)",

                // === BORDES ===
                "border-card": "var(--color-border-card)",
                "border-card-dark": "var(--color-border-card-dark)",

                // === TEXTOS - COLORES COMPLETOS ===
                "text-main": "var(--color-text-main)",
                "text-title": "var(--color-text-title)",
                "text-muted": "var(--color-text-muted)",
                "text-subtitle": "var(--color-text-subtitle)",
                "text-subtitle-dark": "var(--color-text-subtitle-dark)",
                "text-link": "var(--color-text-link)",
                "text-accent": "var(--color-text-accent)",
                "text-on-primary": "var(--color-text-on-primary)",

                // === ICONOS - COLORES COMPLETOS ===
                "icon-color": "var(--color-icon-color)",
                "icon-color-secondary": "var(--color-icon-color-secondary)",
                "icon-color-dark": "var(--color-icon-color-dark)",
                "icon-bg-primary": "var(--color-icon-bg-primary)",
                "icon-bg-secondary": "var(--color-icon-bg-secondary)",
                "icon-bg-dark": "var(--color-icon-bg-dark)",
                "icon-border": "var(--color-icon-border)",

                // === BADGES ===
                "badge-bg": "var(--color-badge-bg)",
                "badge-text": "var(--color-badge-text)",

                // === PLATAFORMAS ===
                "platform-airbnb": "var(--color-platform-airbnb)",
                "platform-booking": "var(--color-platform-booking)",
                "platform-google": "var(--color-platform-google)",
                "platform-directa": "var(--color-platform-directa)",

                // === NAVEGACIÓN ===
                "nav-waze": "var(--color-nav-waze)",
                "nav-maps": "var(--color-nav-maps)",

                // === ALERTAS - SUCCESS ===
                "success-bg": "var(--color-success-bg)",
                "success-text": "var(--color-success-text)",
                "success-icon": "var(--color-success-icon)",
                "success-border": "var(--color-success-border)",

                // === ALERTAS - WARNING ===
                "warning-bg": "var(--color-warning-bg)",
                "warning-text": "var(--color-warning-text)",
                "warning-icon": "var(--color-warning-icon)",
                "warning-border": "var(--color-warning-border)",

                // === ALERTAS - ERROR ===
                "error-bg": "var(--color-error-bg)",
                "error-text": "var(--color-error-text)",
                "error-icon": "var(--color-error-icon)",
                "error-border": "var(--color-error-border)",

                // === ALERTAS - INFO ===
                "info-bg": "var(--color-info-bg)",
                "info-text": "var(--color-info-text)",
                "info-icon": "var(--color-info-icon)",
                "info-border": "var(--color-info-border)",

                // === FONDOS DE PÁGINAS ===
                "page-bg-inicio": "var(--color-page-bg-inicio)",
                "page-bg-reservas": "var(--color-page-bg-reservas)",
                "page-bg-galeria": "var(--color-page-bg-galeria)",
                "page-bg-registro": "var(--color-page-bg-registro)",
                "page-bg-guia": "var(--color-page-bg-guia)",
                "page-bg-admin": "var(--color-page-bg-admin)",

                // === AGUA ===
                "water-bg-primary": "var(--color-water-bg-primary)",
                "water-bg-secondary": "var(--color-water-bg-secondary)",
                "water-text": "var(--color-water-text)",
                "water-badge-bg": "var(--color-water-badge-bg)",
                "water-badge-text": "var(--color-water-badge-text)",

                // === PREMIUM DESIGN SYSTEM (lujo natural editorial) ===
                // Un solo verde de marca (#1b4332) en toda la paleta.
                // forest/pine/sage/gold/gold-light apuntan todos al mismo tono.
                premium: {
                    forest: "#1b4332",
                    pine: "#1b4332",
                    sage: "#1b4332",
                    cream: "#FAF7F0",
                    sand: "#EFE9DC",
                    gold: "#1b4332",
                    "gold-light": "#1b4332",
                    ink: "#1C1917",
                    mist: "#F4F6F3",
                },
            },
            fontFamily: {
                // Tipografía configurable desde Admin Panel -> Tipografía
                "display": ["var(--font-display)", "sans-serif"],
                "body": ["var(--font-display)", "sans-serif"],
                // Premium design system (no reemplazan a las anteriores,
                // que están en uso vía Admin Panel)
                "premium-display": ["Montserrat", "system-ui", "sans-serif"],
                "premium-body": ["Montserrat", "system-ui", "sans-serif"],
            },
            boxShadow: {
                "premium-sm": "0 1px 2px rgba(22,48,43,0.06), 0 2px 8px rgba(22,48,43,0.04)",
                "premium": "0 2px 8px rgba(22,48,43,0.06), 0 12px 32px rgba(22,48,43,0.10)",
                "premium-lg": "0 4px 16px rgba(22,48,43,0.08), 0 24px 64px rgba(22,48,43,0.14)",
                "gold-glow": "0 0 0 1px rgba(27,67,50,0.25), 0 8px 24px rgba(27,67,50,0.18)",
            },
            borderRadius: {
                "premium": "1.25rem",
                "premium-lg": "2rem",
            },
            transitionTimingFunction: {
                "premium": "cubic-bezier(0.22, 1, 0.36, 1)",
            },
            keyframes: {
                fadeUp: {
                    "0%": { opacity: "0", transform: "translateY(24px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
                kenBurns: {
                    "0%": { transform: "scale(1)" },
                    "100%": { transform: "scale(1.08)" },
                },
            },
            animation: {
                "fade-up": "fadeUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) both",
                "ken-burns": "kenBurns 18s ease-in-out alternate infinite",
            },
        },
    },
    plugins: [],
}
