import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ContactoInicialSection from '../components/ContactoInicialSection'
import PaymentSection from '../components/PaymentSection'
import LocationSection from '../components/LocationSection'
import RulesSection from '../components/RulesSection'
import WaterConservationSection from '../components/WaterConservationSection'
import AntesDePartirSection from '../components/AntesDePartirSection'
import ZonasHumedasSection from '../components/ZonasHumedasSection'
import PageHeader from '../components/PageHeader'
import { DEFAULT_CONFIG } from '../utils/config'

export default function Guia() {
    const [pageContent, setPageContent] = useState({
        pageTitle: DEFAULT_CONFIG.guiaContent?.pageTitle || 'Guía del Huésped',
        pageSubtitle: DEFAULT_CONFIG.guiaContent?.pageSubtitle || 'Todo lo que necesitas saber para tu estadía.'
    })

    // Load custom content from API (overrides defaults and localStorage)
    useEffect(() => {
        const loadConfig = async () => {
            // 1. Try API first
            try {
                const response = await fetch('/api/config')
                if (response.ok) {
                    const config = await response.json()
                    if (Object.keys(config).length > 0) {
                        applyConfig(config)
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
                applyConfig(JSON.parse(saved))
            }
        }

        const applyConfig = (config) => {
            if (config.guiaContent) {
                setPageContent(prev => ({ ...prev, ...config.guiaContent }))
            }
        }

        loadConfig()
    }, [])

    return (
        <div className="flex flex-col min-h-screen bg-premium-cream text-premium-ink font-premium-body">
            <Navbar />

            <PageHeader
                eyebrow="Guía del huésped"
                title={pageContent.pageTitle}
                subtitle={pageContent.pageSubtitle}
                progress={100}
                className="max-w-7xl mx-auto px-4 md:px-8 pt-8"
            />

            <ContactoInicialSection />
            <LocationSection />
            <PaymentSection />
            <WaterConservationSection />
            <RulesSection />
            <ZonasHumedasSection />
            <AntesDePartirSection />

            <Footer />
        </div>
    )
}
