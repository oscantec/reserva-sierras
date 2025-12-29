import { Link } from 'react-router-dom'
import { useState, useEffect, useRef, memo } from 'react'
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

// STABLE Video Component - Uses YouTube IFrame API for deeper control
const VideoBackground = memo(({ videoId, blurAmount }) => {
    const playerRef = useRef(null);

    useEffect(() => {
        if (!videoId) return;

        const initPlayer = () => {
            if (playerRef.current) {
                try { playerRef.current.destroy(); } catch (e) { }
            }

            playerRef.current = new window.YT.Player('hero-video-player', {
                videoId: videoId,
                playerVars: {
                    autoplay: 1,
                    mute: 1,
                    controls: 0,
                    showinfo: 0,
                    rel: 0,
                    modestbranding: 1,
                    loop: 1,
                    playlist: videoId,
                    playsinline: 1,
                    enablejsapi: 1,
                    iv_load_policy: 3,
                    disablekb: 1,
                    origin: window.location.origin,
                    widget_referrer: window.location.origin
                },
                events: {
                    onReady: (event) => {
                        event.target.mute();
                        event.target.setPlaybackQuality('hd1080');
                        event.target.playVideo();

                        // AGGRESSIVE HEARTBEAT: Mobile browsers often ignore the first playVideo().
                        // We check every 500ms if it's playing, and force it if not.
                        let attempts = 0;
                        const heartbeat = setInterval(() => {
                            const state = event.target.getPlayerState();
                            if (state !== 1 && attempts < 10) { // 1 = PLAYING
                                event.target.mute();
                                event.target.playVideo();
                                attempts++;
                            } else if (state === 1) {
                                // Once playing, fade in and stop heartbeat
                                const iframe = document.getElementById('hero-video-player');
                                if (iframe) iframe.style.opacity = '1';
                                clearInterval(heartbeat);
                            } else {
                                clearInterval(heartbeat);
                            }
                        }, 500);
                    },
                    onStateChange: (event) => {
                        // Ensure it stays muted and playing
                        if (event.data === window.YT.PlayerState.PAUSED) {
                            event.target.playVideo();
                        }
                        if (event.data === window.YT.PlayerState.ENDED) {
                            event.target.playVideo();
                        }
                        if (event.data === window.YT.PlayerState.PLAYING) {
                            const iframe = document.getElementById('hero-video-player');
                            if (iframe) iframe.style.opacity = '1';
                        }
                    }
                }
            });
        };

        if (window.YT && window.YT.Player) {
            initPlayer();
        } else {
            // Wait for API to be ready
            window.onYouTubeIframeAPIReady = initPlayer;
        }

        return () => {
            if (playerRef.current) {
                try { playerRef.current.destroy(); } catch (e) { }
            }
        };
    }, [videoId]);

    if (!videoId) return null;

    return (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-black">
            {/* Native Video Unlocker */}
            <video
                autoPlay
                muted
                playsInline
                loop
                className="absolute w-1 h-1 opacity-0 pointer-events-none"
                src="data:video/mp4;base64,AAAAHGZ0eXBpc29tAAAAAGlzb21tcDQyAAAAA21vb3YAAABsbXZoZAAAAADR7m730e5u9wAAA+gAAAcQAAEAAAEAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAABidHJha3YAAABcdGtoZAAAAADR7m730e5u9wAAAAEAAAAAAAcQAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAZBtZWRpYQAAACBtZGhkAAAAANHubvfR7m73AAA7eAAAFuBAAQAAAQAAAAAAAAAAAAAAAAAAJWhkbHIAAAAAAAAAAHZpZGUAAAAAAAAAAAAAAABWaWRlb0hhbmRsZXIAAAABUW1pbmYAAAAUdm1oZAAAAAEAAAAAAAAAAAAAACRkaW5mAAAAHGRyZWYAAAAAAAAAAQAAAAxyZWRsAAAAAQAAAHBzdGJsAAAALXN0c2QAAAAAAAAAAQAAAB1hdmMxAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAgACABIAAAASAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGP//AAAALWF2Y0MBQsAN/+EAFWdCwA3ZAsTsBEAAAPpAADqYAA8SGmXiwAAAAAAhYnBocgAAAAAAABAAAABidHJlZgAAAAAIdmlydAAAAAEAAACgc3R0cwAAAAAAAAABAAAAAQAAADsAAABoc3RzYwAAAAAAAAABAAAAAQAAAAEAAAABAAAAXHN0c3oAAAAAAAAAAAAAAAEAAAA7AAAAZHN0Y28AAAAAAAAAAQAAADAAAABidWR0YQAAADptZXRhAAAAAAAAACFoZGxyAAAAAAAAAABtZGlyYXBwbAAAAAAAAAAAAAAAAGlsc3QAAAASAK1kYXRhAAAAAQAAAAAA"
            />
            {/* 
               SCALING LOGIC: To achieve a true "Cover" effect with an Iframe, 
               we use a container that is always at least 100% width and 56.25vw height (16:9).
               We scale it up to ensure no black bars ever show on any monitor.
            */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full min-w-[100%] min-h-[100%]">
                <div
                    id="hero-video-player"
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[67.5vw] min-w-[100vw] min-h-[56.25vw] sm:w-[150vw] sm:h-[84.375vw] xl:w-[110vw] xl:h-[61.875vw] opacity-0 transition-opacity duration-1000"
                    style={{
                        filter: `blur(${blurAmount}px) brightness(0.9) saturate(1.2)`,
                        pointerEvents: 'none'
                    }}
                />
            </div>
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
    const [checkTimes, setCheckTimes] = useState({
        checkIn: INITIAL_STATE.checkInTime,
        checkOut: INITIAL_STATE.checkOutTime
    })

    const videoId = getYouTubeVideoId(heroConfig.videoUrl) || INITIAL_VIDEO_ID

    // Load YouTube API script once
    useEffect(() => {
        if (!window.YT) {
            const tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        }
    }, []);

    // KICKSTART: Force video play on first user interaction (Secret of high-end mobile sites)
    useEffect(() => {
        const kickstartVideo = () => {
            const iframe = document.getElementById('hero-video-player');
            if (iframe && iframe.contentWindow) {
                // Try multiple ways to trigger play
                iframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
                iframe.contentWindow.postMessage('{"event":"command","func":"mute","args":""}', '*');
            }
            // Cleanup: only need to do this once
            window.removeEventListener('scroll', kickstartVideo);
            window.removeEventListener('click', kickstartVideo);
            window.removeEventListener('touchstart', kickstartVideo);
        };

        window.addEventListener('scroll', kickstartVideo, { passive: true });
        window.addEventListener('click', kickstartVideo);
        window.addEventListener('touchstart', kickstartVideo, { passive: true });

        return () => {
            window.removeEventListener('scroll', kickstartVideo);
            window.removeEventListener('click', kickstartVideo);
            window.removeEventListener('touchstart', kickstartVideo);
        };
    }, [videoId]);

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

                {/* GHOST OVERLAY: Invisible bridge to "unlock" video on mobile */}
                <div
                    className="absolute inset-0 z-10 cursor-pointer"
                    onPointerDown={() => {
                        const iframe = document.getElementById('hero-video-player');
                        if (iframe && iframe.contentWindow) {
                            iframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
                            iframe.contentWindow.postMessage('{"event":"command","func":"mute","args":""}', '*');
                        }
                    }}
                ></div>

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
