import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ContactoInicialSection from '../components/ContactoInicialSection'
import PaymentSection from '../components/PaymentSection'
import LocationSection from '../components/LocationSection'
import RulesSection from '../components/RulesSection'
import WaterConservationSection from '../components/WaterConservationSection'
import AntesDePartirSection from '../components/AntesDePartirSection'
import ZonasHumedasSection from '../components/ZonasHumedasSection'

export default function Guia() {
    return (
        <div className="flex flex-col min-h-screen bg-page-bg-inicio dark:bg-surface-card-dark text-text-main dark:text-white font-display">
            <Navbar />

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

