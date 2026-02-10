import { Link } from 'react-router-dom'
import { useState, useEffect, useRef, memo } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { DEFAULT_CONFIG } from '../utils/config'
import PageHeader from '../components/PageHeader'
import { SparklesCore } from '../components/SparklesCore'
import LazyImage from '../components/LazyImage'

// Imágenes de previsualizaciones para las cards de Explora el Sitio
import previewReservas from '../images/medium/imagesinicio/reservas.webp'
import previewRegistro from '../images/medium/imagesinicio/registro.webp'
import previewGaleria from '../images/medium/imagesinicio/galeria.webp'
import previewGuia from '../images/medium/imagesinicio/guia.webp'
import placeholders from '../images/placeholders.json'

// Helper function to extract YouTube video ID from various URL formats
function getYouTubeVideoId(url) {
    if (!url) return null
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return (match && match[2].length === 11) ? match[2] : null
}

// Helper to get synced config from localStorage for instant, consistent initial render
const getInitialConfig = () => {
    try {
        const saved = localStorage.getItem('casacampestre_config')
        if (!saved) return DEFAULT_CONFIG
        return { ...DEFAULT_CONFIG, ...JSON.parse(saved) }
    } catch (e) {
        return DEFAULT_CONFIG
    }
}

const INITIAL_STATE = getInitialConfig()
const INITIAL_VIDEO_ID = getYouTubeVideoId(INITIAL_STATE.heroVideoUrl)

// Video Background - Optimized for mobile autoplay and desktop progressive quality
const VideoBackground = memo(({ videoId, blurAmount }) => {
    const [isReady, setIsReady] = useState(false);
    const iframeRef = useRef(null);

    if (!videoId) return null;

    // Detect if mobile for different quality settings
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    // Mobile: start with medium quality for faster load, Desktop: start with default (will upgrade)
    const initialQuality = isMobile ? 'medium' : 'default';

    // Build YouTube embed URL with optimized autoplay parameters
    // playsinline=1 is critical for iOS autoplay
    const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&enablejsapi=1&iv_load_policy=3&disablekb=1&vq=${initialQuality}&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`;

    // Upgrade quality on desktop after initial load
    useEffect(() => {
        if (isReady && !isMobile && iframeRef.current) {
            // Try to upgrade quality via postMessage after load
            const iframe = iframeRef.current;
            setTimeout(() => {
                try {
                    iframe.contentWindow?.postMessage('{"event":"command","func":"setPlaybackQuality","args":["hd1080"]}', '*');
                } catch (e) {
                    // Silently fail if cross-origin issues
                }
            }, 2000); // Wait 2 seconds for video to start playing
        }
    }, [isReady, isMobile]);

    return (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-black">
            {/* Single iframe that covers entire hero - stretches on wide screens */}
            <iframe
                ref={iframeRef}
                id="hero-video-player"
                src={embedUrl}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] min-w-[100%] min-h-[100%]"
                style={{
                    filter: `blur(${blurAmount}px) brightness(0.85) saturate(1.1)`,
                    border: 'none',
                    pointerEvents: 'none'
                }}
                allow="autoplay; encrypted-media; accelerometer; gyroscope"
                allowFullScreen
                loading="eager"
                onLoad={() => setIsReady(true)}
            />
        </div>
    );
});

export default function Landing() {
    const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0)
    const [isVisible, setIsVisible] = useState(true)
    const [heroConfig, setHeroConfig] = useState({
        videoUrl: INITIAL_STATE.heroVideoUrl,
        filterColor: INITIAL_STATE.heroFilterColor || '#22c55e',
        filterOpacity: INITIAL_STATE.heroFilterOpacity ?? 4,
        blurAmount: INITIAL_STATE.heroBlurAmount ?? 2,
        phrases: INITIAL_STATE.heroRotatingPhrases || []
    })
    const [intro, setIntro] = useState({
        title: INITIAL_STATE.inicioContent?.intro?.title || 'Bienvenidos a Reserva de las Sierras, Anapoima',
        description: INITIAL_STATE.inicioContent?.intro?.description || 'Reserva de las Sierras no es solo un alojamiento, es una experiencia diseñada para tu descanso y conexión con la naturaleza.'
    })
    const [amenidades, setAmenidades] = useState(INITIAL_STATE.inicioContent?.amenidades || [])
    const [destacados, setDestacados] = useState(INITIAL_STATE.inicioContent?.destacados || {
        title: 'Nuestra Casa',
        subtitle: 'Conoce los detalles de este espacio único.',
        items: [
            { icon: 'landscape', title: '2,300 m²', description: 'Amplio lote con zonas verdes y senderos ecológicos.' },
            { icon: 'location_on', title: 'A 5 km de Anapoima', description: 'Cerca del centro pero en total tranquilidad.' },
            { icon: 'group', title: 'Hasta 10 huéspedes', description: 'Ideal para familias y grupos de amigos.' }
        ]
    })
    const [exploraSitio, setExploraSitio] = useState(INITIAL_STATE.inicioContent?.exploraSitio || {
        title: 'Explora el Sitio',
        subtitle: 'Navega por las secciones para conocer todo sobre tu estadía.',
        items: [
            { path: '/reservas', icon: 'calendar_month', title: 'Reservas', description: 'Consulta disponibilidad y precios actualizados.' },
            { path: '/registro', icon: 'edit_document', title: 'Registro', description: 'Registra a los huéspedes una vez confirmes tu reserva.' },
            { path: '/galeria', icon: 'photo_library', title: 'Galería', description: 'Conoce los espacios y la distribución de la casa.' },
            { path: '/guia', icon: 'info', title: 'Guía', description: 'Detalles de llegada, estadía y salida.' }
        ]
    })
    const [checkTimes, setCheckTimes] = useState({
        checkIn: INITIAL_STATE.checkInTime,
        checkOut: INITIAL_STATE.checkOutTime
    })
    const [sparklesConfig, setSparklesConfig] = useState(INITIAL_STATE.inicioContent?.sparklesConfig || {
        enabled: true,
        particleColor: '#3db814',
        particleDensity: { amenidades: 80, destacados: 80, explora: 100 },
        particleSize: { min: 0.4, max: 1.2 },
        speed: 0.8,
        opacity: { amenidades: 50, destacados: 50, explora: 60 }
    })

    const videoId = getYouTubeVideoId(heroConfig.videoUrl) || INITIAL_VIDEO_ID

    // Load fresh config from API in background (updates if changed)
    useEffect(() => {
        const loadConfig = async () => {
            try {
                const response = await fetch('/api/config')
                if (response.ok) {
                    const config = await response.json()
                    if (Object.keys(config).length > 0) {
                        applyConfig(config)
                        localStorage.setItem('casacampestre_config', JSON.stringify(config))
                    }
                }
            } catch (e) { /* silent fail */ }
        }

        const applyConfig = (config) => {
            setHeroConfig(prev => ({
                videoUrl: config.heroVideoUrl || prev.videoUrl,
                filterColor: config.heroFilterColor || prev.filterColor,
                filterOpacity: config.heroFilterOpacity ?? prev.filterOpacity,
                blurAmount: config.heroBlurAmount ?? prev.blurAmount,
                phrases: config.heroRotatingPhrases || prev.phrases
            }))
            // Load all other dynamic content fields
            if (config.inicioContent?.intro) setIntro(config.inicioContent.intro)
            if (config.inicioContent?.amenidades) setAmenidades(config.inicioContent.amenidades)
            if (config.inicioContent?.destacados) setDestacados(config.inicioContent.destacados)
            if (config.inicioContent?.exploraSitio) setExploraSitio(config.inicioContent.exploraSitio)
            if (config.inicioContent?.sparklesConfig) setSparklesConfig(config.inicioContent.sparklesConfig)
            if (config.checkInTime || config.checkOutTime) {
                setCheckTimes({
                    checkIn: config.checkInTime || INITIAL_STATE.checkInTime,
                    checkOut: config.checkOutTime || INITIAL_STATE.checkOutTime
                })
            }
        }
        loadConfig()
    }, [])

    // Rotate phrases every 5 seconds
    useEffect(() => {
        if (heroConfig.phrases.length <= 1) return
        const interval = setInterval(() => {
            setIsVisible(false)
            setTimeout(() => {
                setCurrentPhraseIndex(prev => (prev + 1) % heroConfig.phrases.length)
                setIsVisible(true)
            }, 500)
        }, 5000)
        return () => clearInterval(interval)
    }, [heroConfig.phrases])

    const currentPhrase = heroConfig.phrases[currentPhraseIndex] || ''
    const words = currentPhrase.split(' ')
    const lastWord = words.pop()
    const mainText = words.join(' ')

    return (
        <div className="flex flex-col min-h-screen bg-page-bg-inicio dark:bg-surface-card-dark text-text-main dark:text-white font-display">
            <Navbar />

            {/* Hero Section - Optimized Iframe for INSTANT Mobile Autoplay */}
            <header className="relative w-full h-[500px] lg:h-[600px] flex items-center justify-center overflow-hidden">
                {/* Background Placeholder - Thumbnail loads instantly */}
                <div
                    className="absolute inset-0 z-0 bg-cover bg-center"
                    style={{
                        backgroundImage: videoId
                            ? `url(https://img.youtube.com/vi/${videoId}/maxresdefault.jpg)`
                            : "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600')",
                        filter: `blur(${heroConfig.blurAmount}px) brightness(0.7)`
                    }}
                ></div>

                {/* Video Background Component - MEMOIZED to prevent refreshes */}
                <VideoBackground
                    videoId={videoId}
                    blurAmount={heroConfig.blurAmount}
                />



                {/* Green Filter Overlay */}
                <div
                    className="absolute inset-0 z-1"
                    style={{
                        backgroundColor: heroConfig.filterColor,
                        opacity: heroConfig.filterOpacity / 100,
                        pointerEvents: 'none'
                    }}
                ></div>

                {/* Dark Gradient Overlay for text readability */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60 z-1 pointer-events-none"></div>

                {/* Content - Only Dynamic Rotating Text */}
                <div className="relative z-20 text-center px-4 max-w-4xl mx-auto flex flex-col items-center justify-center h-full fade-in pointer-events-none">
                    {/* Animated Rotating Text */}
                    <h1
                        className={`text-2xl sm:text-4xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight tracking-tight shadow-sm transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                            }`}
                    >
                        {mainText}{' '}
                        <span className="block sm:inline" style={{ color: '#2a8a0e' }}>{lastWord}</span>
                    </h1>
                </div>
            </header>

            {/* Check-in / Check-out Info Bar */}
            <div className="relative z-30 -mt-8 px-4 mb-8">
                <div className="max-w-3xl mx-auto bg-surface-card dark:bg-surface-card-dark rounded-xl shadow-sm p-4 md:p-5 border border-border-card dark:border-border-card-dark flex flex-col sm:flex-row gap-4 sm:gap-8 items-center justify-center">
                    {/* Check-in */}
                    <div className="flex items-center gap-3">
                        <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center"
                            style={{ backgroundColor: 'var(--color-icon-bg)' }}
                        >
                            <span className="material-symbols-outlined text-2xl" style={{ color: 'var(--color-primary)' }}>login</span>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-text-muted uppercase tracking-wide">Check-in</p>
                            <p className="text-xl font-black text-text-main-light dark:text-white">{checkTimes.checkIn}</p>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="hidden sm:block h-10 w-px bg-border-card dark:bg-border-card-dark"></div>
                    <div className="sm:hidden w-20 h-px bg-border-card dark:bg-border-card-dark"></div>

                    {/* Check-out */}
                    <div className="flex items-center gap-3">
                        <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center"
                            style={{ backgroundColor: 'var(--color-accent-info)' }}
                        >
                            <span className="material-symbols-outlined text-2xl" style={{ color: 'var(--color-accent-info-icon)' }}>logout</span>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-text-muted uppercase tracking-wide">Check-out</p>
                            <p className="text-xl font-black text-text-main-light dark:text-white">{checkTimes.checkOut}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content - Reservas container style */}
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 md:py-8 w-full">
                <PageHeader
                    title={intro.title}
                    subtitle={intro.description}
                    progress={100}
                    className="mb-8"
                />

                {/* Amenities Grid - Compact 2-column mobile layout */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6 mb-4 md:mb-8">
                    {amenidades.map((item, i) => (
                        <div key={i} className={`relative bg-surface-card dark:bg-surface-card-dark rounded-xl p-3 md:p-6 border border-border-card dark:border-border-card-dark hover:shadow-xl hover:scale-[1.03] transition-all duration-500 ease-out overflow-hidden ${i === amenidades.length - 1 && amenidades.length % 2 !== 0 ? 'col-span-2 md:col-span-1' : ''}`}>
                            {/* Efecto Sparkles de fondo - PERMANENTE */}
                            {sparklesConfig?.enabled && (
                                <div className="absolute inset-0 pointer-events-none" style={{ opacity: (sparklesConfig?.opacity?.amenidades || 50) / 100 }}>
                                    <SparklesCore
                                        id={`amenity-sparkles-${i}`}
                                        background="transparent"
                                        minSize={sparklesConfig?.particleSize?.min || 0.4}
                                        maxSize={sparklesConfig?.particleSize?.max || 1.2}
                                        particleDensity={sparklesConfig?.particleDensity?.amenidades || 80}
                                        className="w-full h-full"
                                        particleColor={sparklesConfig?.particleColor || '#3db814'}
                                        speed={sparklesConfig?.speed || 0.8}
                                    />
                                </div>
                            )}

                            <div className="relative z-10">
                                <div
                                    className="w-8 h-8 md:w-12 md:h-12 rounded-xl flex items-center justify-center mb-2 md:mb-4"
                                    style={{ backgroundColor: 'var(--color-icon-bg)' }}
                                >
                                    <span className="material-symbols-outlined text-lg md:text-2xl" style={{ color: 'var(--color-primary)' }}>{item.icon}</span>
                                </div>
                                <h3 className="text-base md:text-lg font-bold mb-1">{item.title}</h3>
                                <p className="text-sm text-text-muted dark:text-text-muted">{item.description}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Destacados de la Casa */}
                {destacados?.items?.length > 0 && (
                    <div className="mb-8 md:mb-12">
                        <div className="flex flex-col gap-2 mb-4">
                            <h2 className="text-2xl md:text-3xl font-black leading-tight tracking-[-0.033em]">{destacados.title}</h2>
                            <p className="text-sm md:text-base text-text-subtitle dark:text-text-subtitle-dark">{destacados.subtitle}</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6">
                            {destacados.items.map((item, i) => (
                                <div key={i} className="relative bg-surface-card dark:bg-surface-card-dark rounded-xl p-4 md:p-6 border border-border-card dark:border-border-card-dark hover:shadow-xl hover:scale-[1.03] transition-all duration-500 ease-out overflow-hidden flex items-start gap-4">
                                    {/* Efecto Sparkles de fondo - PERMANENTE */}
                                    {sparklesConfig?.enabled && (
                                        <div className="absolute inset-0 pointer-events-none" style={{ opacity: (sparklesConfig?.opacity?.destacados || 50) / 100 }}>
                                            <SparklesCore
                                                id={`destacado-sparkles-${i}`}
                                                background="transparent"
                                                minSize={sparklesConfig?.particleSize?.min || 0.4}
                                                maxSize={sparklesConfig?.particleSize?.max || 1.2}
                                                particleDensity={sparklesConfig?.particleDensity?.destacados || 80}
                                                className="w-full h-full"
                                                particleColor={sparklesConfig?.particleColor || '#3db814'}
                                                speed={sparklesConfig?.speed || 0.8}
                                            />
                                        </div>
                                    )}

                                    <div className="relative z-10 flex items-start gap-4 w-full">
                                        <div
                                            className="w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                                            style={{ backgroundColor: 'var(--color-icon-bg)' }}
                                        >
                                            <span className="material-symbols-outlined text-2xl md:text-3xl" style={{ color: 'var(--color-primary)' }}>{item.icon}</span>
                                        </div>
                                        <div>
                                            <h3 className="text-base md:text-lg font-bold mb-1">{item.title}</h3>
                                            <p className="text-sm text-text-muted dark:text-text-muted">{item.description}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Explora el Sitio - Cards con preview */}
                {exploraSitio?.items?.length > 0 && (
                    <div className="mb-8 md:mb-12">
                        <div className="flex flex-col gap-2 mb-4">
                            <h2 className="text-2xl md:text-3xl font-black leading-tight tracking-[-0.033em]">{exploraSitio.title}</h2>
                            <p className="text-sm md:text-base text-text-subtitle dark:text-text-subtitle-dark">{exploraSitio.subtitle}</p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                            {exploraSitio.items.map((item, i) => {
                                // Mapeo de rutas a imágenes de previsualizaciones
                                const previewImages = {
                                    '/reservas': previewReservas,
                                    '/registro': previewRegistro,
                                    '/galeria': previewGaleria,
                                    '/guia': previewGuia
                                };

                                const placeholderKeys = {
                                    '/reservas': 'imagesinicio/reservas.png',
                                    '/registro': 'imagesinicio/registro.png',
                                    '/galeria': 'imagesinicio/galeria.png',
                                    '/guia': 'imagesinicio/guia.png',
                                };

                                return (
                                    <Link
                                        key={i}
                                        to={item.path}
                                        className="group bg-surface-card dark:bg-surface-card-dark rounded-xl border border-border-card dark:border-border-card-dark hover:shadow-2xl hover:scale-[1.04] transition-all duration-500 ease-out overflow-hidden"
                                    >
                                        {/* Preview Area - Imagen panorámica con efecto sparkles */}
                                        <div className="aspect-[2/1] border-b border-border-card dark:border-border-card-dark overflow-hidden relative bg-white">
                                            <LazyImage
                                                src={previewImages[item.path]}
                                                placeholder={placeholders[placeholderKeys[item.path]]}
                                                alt={`Vista previa de ${item.title}`}
                                                className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-110"
                                                loading="lazy"
                                            />

                                            {/* Efecto Sparkles - PERMANENTE */}
                                            {sparklesConfig?.enabled && (
                                                <div className="absolute inset-0 pointer-events-none" style={{ opacity: (sparklesConfig?.opacity?.explora || 60) / 100 }}>
                                                    <SparklesCore
                                                        id={`sparkles-${i}`}
                                                        background="transparent"
                                                        minSize={sparklesConfig?.particleSize?.min || 0.5}
                                                        maxSize={sparklesConfig?.particleSize?.max || 1.5}
                                                        particleDensity={sparklesConfig?.particleDensity?.explora || 100}
                                                        className="w-full h-full"
                                                        particleColor={sparklesConfig?.particleColor || '#3db814'}
                                                        speed={sparklesConfig?.speed || 1.0}
                                                    />
                                                </div>
                                            )}

                                            {/* Gradiente sutil para mejor legibilidad */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none"></div>

                                            {/* Icono flotante */}
                                            <div className="absolute top-2 left-2 z-10">
                                                <div
                                                    className="w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center bg-white dark:bg-surface-card-dark shadow-sm border border-border-card dark:border-border-card-dark group-hover:bg-primary group-hover:border-primary transition-all"
                                                >
                                                    <span className="material-symbols-outlined text-sm md:text-base group-hover:text-white transition-colors" style={{ color: 'var(--color-primary)' }}>{item.icon}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="p-3 md:p-4">
                                            <h3 className="text-base md:text-lg font-bold mb-1">{item.title}</h3>
                                            <p className="text-xs md:text-sm text-text-muted dark:text-text-muted line-clamp-2">{item.description}</p>
                                        </div>
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                )}
            </div>


            <Footer />
        </div>
    )
}
