import { Link } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ContactoInicialSection from '../components/ContactoInicialSection'
import PaymentSection from '../components/PaymentSection'
import LocationSection from '../components/LocationSection'
import RulesSection from '../components/RulesSection'
import WaterConservationSection from '../components/WaterConservationSection'
import AntesDePartirSection from '../components/AntesDePartirSection'
import ZonasHumedasSection from '../components/ZonasHumedasSection'
import { DEFAULT_CONFIG } from '../utils/config'

// Extract YouTube video ID - calculated ONCE at module load, not in component
function getYouTubeVideoId(url) {
    if (!url) return null
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return (match && match[2].length === 11) ? match[2] : null
}

// IMMEDIATE: Video ID calculated at load time, NOT waiting for React state
const INITIAL_VIDEO_ID = getYouTubeVideoId(DEFAULT_CONFIG.heroVideoUrl)
const INITIAL_BLUR = DEFAULT_CONFIG.heroBlurAmount || 2
const INITIAL_FILTER_COLOR = DEFAULT_CONFIG.heroFilterColor || '#22c55e'
const INITIAL_FILTER_OPACITY = DEFAULT_CONFIG.heroFilterOpacity || 4

export default function Landing() {
    const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0)
    const [isVisible, setIsVisible] = useState(true)
    const [heroConfig, setHeroConfig] = useState({
        videoUrl: DEFAULT_CONFIG.heroVideoUrl,
        filterColor: INITIAL_FILTER_COLOR,
        filterOpacity: INITIAL_FILTER_OPACITY,
        blurAmount: INITIAL_BLUR,
        phrases: DEFAULT_CONFIG.heroRotatingPhrases
    })
    const [intro, setIntro] = useState({
        title: DEFAULT_CONFIG.inicioContent?.intro?.title || 'Bienvenidos a Reserva de las Sierras, Anapoima',
        description: DEFAULT_CONFIG.inicioContent?.intro?.description || 'Reserva de las Sierras no es solo un alojamiento, es una experiencia diseñada para tu descanso y conexión con la naturaleza.'
    })
    const [amenidades, setAmenidades] = useState(DEFAULT_CONFIG.inicioContent?.amenidades || [])
    const [checkTimes, setCheckTimes] = useState({
        checkIn: DEFAULT_CONFIG.checkInTime,
        checkOut: DEFAULT_CONFIG.checkOutTime
    })

    // Use INITIAL_VIDEO_ID for immediate render, then update from state if config changes
    const videoId = INITIAL_VIDEO_ID

    // Load config (for updates only - initial values are already set)
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
            } catch (e) {
                // API not available
            }

            const saved = localStorage.getItem('casacampestre_config')
            if (saved) {
                applyConfig(JSON.parse(saved))
            }
        }

        const applyConfig = (config) => {
            setHeroConfig(prev => ({
                videoUrl: config.heroVideoUrl || prev.videoUrl,
                filterColor: config.heroFilterColor || prev.filterColor,
                filterOpacity: config.heroFilterOpacity ?? prev.filterOpacity,
                blurAmount: config.heroBlurAmount ?? prev.blurAmount,
                phrases: config.heroRotatingPhrases || prev.phrases
            }))
            if (config.inicioContent?.intro) {
                setIntro(prev => ({ ...prev, ...config.inicioContent.intro }))
            }
            if (config.inicioContent?.amenidades) {
                setAmenidades(config.inicioContent.amenidades)
            }
            if (config.checkInTime || config.checkOutTime) {
                setCheckTimes(prev => ({
                    checkIn: config.checkInTime || prev.checkIn,
                    checkOut: config.checkOutTime || prev.checkOut
                }))
            }
        }

        loadConfig()
    }, [])

    // Rotate phrases every 5 seconds with fade effect
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

    // Get current phrase and split into main text + highlighted word
    const currentPhrase = heroConfig.phrases[currentPhraseIndex] || ''
    const words = currentPhrase.split(' ')
    const lastWord = words.pop()
    const mainText = words.join(' ')


    // YouTube Player Reference
    const playerRef = useRef(null)
    const playerInstance = useRef(null)

    // Load YouTube API and initialize player
    useEffect(() => {
        if (!videoId) return

        // Function to initialize player
        const initPlayer = () => {
            if (!playerRef.current) return

            // If player already exists, just change video if needed
            if (playerInstance.current && typeof playerInstance.current.loadVideoById === 'function') {
                playerInstance.current.loadVideoById(videoId)
                return
            }

            playerInstance.current = new window.YT.Player(playerRef.current, {
                videoId: videoId,
                playerVars: {
                    autoplay: 1,
                    mute: 1,
                    loop: 1,
                    playlist: videoId,
                    controls: 0,
                    showinfo: 0,
                    rel: 0,
                    modestbranding: 1,
                    playsinline: 1,
                    enablejsapi: 1,
                    disablekb: 1,
                    fs: 0,
                    iv_load_policy: 3,
                    origin: window.location.origin
                },
                events: {
                    onReady: (event) => {
                        event.target.mute()
                        event.target.playVideo()
                    },
                    onStateChange: (event) => {
                        // Loop manually if needed (some browsers ignore playlist loop)
                        if (event.data === window.YT.PlayerState.ENDED) {
                            event.target.playVideo()
                        }
                    }
                }
            })
        }

        // Check if API is already loaded
        if (!window.YT) {
            const tag = document.createElement('script')
            tag.src = "https://www.youtube.com/iframe_api"
            const firstScriptTag = document.getElementsByTagName('script')[0]
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)

            window.onYouTubeIframeAPIReady = initPlayer
        } else {
            initPlayer()
        }

        return () => {
            if (playerInstance.current) {
                playerInstance.current.destroy()
                playerInstance.current = null
            }
        }
    }, [videoId])

    return (
        <div className="flex flex-col min-h-screen bg-page-bg-inicio dark:bg-surface-card-dark text-text-main dark:text-white font-display">
            <Navbar />

            {/* Hero Section - YouTube API implementation for better mobile autoplay */}
            <header className="relative w-full h-[500px] lg:h-[600px] flex items-center justify-center overflow-hidden">
                {/* Background Placeholder while video loads */}
                <div
                    className="absolute inset-0 z-0 bg-cover bg-center scale-110"
                    style={{
                        backgroundImage: videoId
                            ? `url(https://img.youtube.com/vi/${videoId}/maxresdefault.jpg)`
                            : "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600')",
                        filter: `blur(${heroConfig.blurAmount}px) brightness(0.7)`
                    }}
                ></div>

                {/* YouTube Player Container */}
                <div className="absolute inset-0 z-1 pointer-events-none">
                    <div ref={playerRef} className="w-full h-full scale-[1.5] lg:scale-[1.2]"></div>
                </div>

                <style>{`
                    #player {
                        pointer-events: none;
                    }
                    /* Ensure the iframe covers the container */
                    iframe {
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        width: 100vw;
                        height: 56.25vw; /* 16:9 aspect ratio */
                        min-height: 100vh;
                        min-width: 177.77vh; /* 16:9 aspect ratio */
                        transform: translate(-50%, -50%);
                    }
                `}</style>

                {/* Green Filter Overlay */}
                <div
                    className="absolute inset-0 z-10"
                    style={{
                        backgroundColor: heroConfig.filterColor,
                        opacity: heroConfig.filterOpacity / 100
                    }}
                ></div>

                {/* Dark Gradient Overlay for text readability */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60 z-10"></div>

                {/* Content - Only Dynamic Rotating Text */}
                <div className="relative z-20 text-center px-4 max-w-4xl mx-auto flex flex-col items-center justify-center h-full fade-in">
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
                {/* Intro Section */}
                <div className="flex flex-col gap-2 mb-4 md:mb-8">
                    <div className="flex justify-between items-end">
                        <div>
                            <h2 className="text-2xl md:text-4xl font-black leading-tight tracking-[-0.033em] mb-1 md:mb-2">{intro.title}</h2>
                            <p className="text-text-subtitle dark:text-text-subtitle-dark text-sm md:text-base max-w-2xl">{intro.description}</p>
                        </div>
                    </div>
                </div>

                {/* Amenities Grid - Compact 2-column mobile layout */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-6 mb-4 md:mb-8">
                    {amenidades.map((item, i) => (
                        <div key={i} className={`bg-surface-card dark:bg-surface-card-dark rounded-lg md:rounded-xl p-3 md:p-6 border border-border-card dark:border-border-card-dark hover:shadow-md transition-all ${i === amenidades.length - 1 && amenidades.length % 2 !== 0 ? 'col-span-2 md:col-span-1' : ''}`}>
                            <div
                                className="w-8 h-8 md:w-12 md:h-12 rounded-lg flex items-center justify-center mb-2 md:mb-4"
                                style={{ backgroundColor: 'var(--color-icon-bg)' }}
                            >
                                <span className="material-symbols-outlined text-lg md:text-2xl" style={{ color: 'var(--color-primary)' }}>{item.icon}</span>
                            </div>
                            <h3 className="text-sm md:text-lg font-bold mb-1">{item.title}</h3>
                            <p className="text-xs md:text-sm text-text-muted dark:text-text-muted">{item.description}</p>
                        </div>
                    ))}
                </div>
            </div>

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
