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
    return (
        <div className="flex flex-col min-h-screen bg-page-bg-inicio dark:bg-surface-card-dark text-text-main dark:text-white font-display">
            <Navbar />

            <PageHeader
                title={DEFAULT_CONFIG.guiaContent?.pageTitle || 'Guía del Huésped'}
                subtitle={DEFAULT_CONFIG.guiaContent?.pageSubtitle || 'Todo lo que necesitas saber para tu estadía.'}
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

