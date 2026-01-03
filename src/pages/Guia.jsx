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

    // Load custom content from localStorage (overrides if available)
    useEffect(() => {
        const saved = localStorage.getItem('casacampestre_config')
        if (saved) {
            const config = JSON.parse(saved)
            if (config.guiaContent) {
                setPageContent(prev => ({ ...prev, ...config.guiaContent }))
            }
        }
    }, [])

    return (
        <div className="flex flex-col min-h-screen bg-page-bg-inicio dark:bg-surface-card-dark text-text-main dark:text-white font-display">
            <Navbar />

            <PageHeader
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
