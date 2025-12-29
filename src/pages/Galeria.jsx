import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { DEFAULT_CONFIG } from '../utils/config'

// Import all images - EXTERNAS (removed accesoCasa2 - only for Inicio)
import exterior1 from '../images/Exterior1.webp'
import exterior2 from '../images/Exterior 2.webp'
import exterior3 from '../images/Exterior 3.webp'
import exterior4 from '../images/Exterior 4.webp'
import casa1 from '../images/Casa 1.webp'
import casa2 from '../images/Casa 2.webp'
import casa3 from '../images/Casa 3.webp'
import bbq1 from '../images/BBQ 1.webp'
import bbq2 from '../images/BBQ 2.webp'
import frutales1 from '../images/Frutales 1.webp'
import frutales2 from '../images/Frutales 2.webp'
import sendero1 from '../images/Sendero 1.webp'
import sendero2 from '../images/Sendero 2.webp'
import solar1 from '../images/Solar 1.webp'
import garaje from '../images/garaje.webp'
import portada1 from '../images/Portada 1.webp'
import portada2 from '../images/Portada 2.webp'
import portada3 from '../images/Portada 3.webp'

// Import all images - INTERNAS
import balcon from '../images/Balcon.webp'
import bano1 from '../images/Bano 1.webp'
import bano2 from '../images/Bano 2.webp'
import cocina1 from '../images/Cocina 1.webp'
import cocina2 from '../images/Cocina 2.webp'
import habitacion11 from '../images/Habitacion 1 1.webp'
import habitacion12 from '../images/Habitacion 1 2.webp'
import habitacion21 from '../images/Habitacion 2 1.webp'
import habitacion22 from '../images/Habitacion 2 2.webp'
import habitacion31 from '../images/Habitacion 3 1.webp'
import habitacion32 from '../images/Habitacion 3 2.webp'
import habitacion41 from '../images/Habitacion 4 1.webp'
import habitacion42 from '../images/Habitacion 4 2.webp'
import habitacion52 from '../images/Habitacion 5 2.webp'
import sala11 from '../images/Sala 1 1.webp'
import sala12 from '../images/Sala 1 2.webp'
import sala21 from '../images/Sala 2 1.webp'
import sala22 from '../images/Sala 2 2.webp'
import tv1 from '../images/TV 1.webp'
import tv2 from '../images/TV 2.webp'
import tv3 from '../images/TV 3.webp'
import tv4 from '../images/TV 4.webp'

// Import all images - ZONAS HUMEDAS
import piscina1 from '../images/Piscina 1.webp'
import piscina2 from '../images/Piscina 2.webp'
import piscina3 from '../images/Piscina 3.webp'
import piscina4 from '../images/Piscina 4.webp'
import piscina5 from '../images/Piscina 5.webp'
import jac1 from '../images/Jac 1.webp'
import jac2 from '../images/Jac 2.webp'
import jac3 from '../images/Jac 3.webp'
import jac4 from '../images/Jac 4.webp'
import jac5 from '../images/Jac 5.webp'

export default function Gallery() {
    const [activeCategory, setActiveCategory] = useState('todas')
    const [lightboxImage, setLightboxImage] = useState(null)
    const [lightboxIndex, setLightboxIndex] = useState(0)
    const [isAnimating, setIsAnimating] = useState(false)
    const [customLabels, setCustomLabels] = useState(DEFAULT_CONFIG.galeriaLabels || {})
    const [pageContent, setPageContent] = useState({
        pageTitle: DEFAULT_CONFIG.galeriaContent?.pageTitle || 'Nuestra Galería',
        pageSubtitle: DEFAULT_CONFIG.galeriaContent?.pageSubtitle || 'Explora cada rincón de Reserva de las Sierras.',
        categoryAll: 'Galería Completa',
        categoryExternas: 'Externas',
        categoryInternas: 'Internas',
        categoryHumedas: 'Zonas Húmedas'
    })

    // Load custom labels from localStorage (overrides if available)
    useEffect(() => {
        const saved = localStorage.getItem('casacampestre_config')
        if (saved) {
            const config = JSON.parse(saved)
            if (config.galeriaLabels) {
                setCustomLabels(prev => ({ ...prev, ...config.galeriaLabels }))
            }
            if (config.galeriaContent) {
                setPageContent(prev => ({ ...prev, ...config.galeriaContent }))
            }
        }
    }, [])

    // Keyboard navigation for lightbox
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!lightboxImage) return
            if (e.key === 'ArrowLeft') navigateLightbox(-1)
            if (e.key === 'ArrowRight') navigateLightbox(1)
            if (e.key === 'Escape') closeLightbox()
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [lightboxImage, lightboxIndex])

    const categories = [
        { id: 'todas', label: 'Todas', icon: 'photo_library' },
        { id: 'externas', label: 'Externas', icon: 'landscape' },
        { id: 'internas', label: 'Internas', icon: 'chair' },
        { id: 'humedas', label: 'Zonas Húmedas', icon: 'pool' },
    ]

    // Helper to get custom or default value
    const getImageData = (id, field, defaultValue) => {
        return customLabels[id]?.[field] || defaultValue
    }

    // All images with labels and unique IDs
    const defaultImages = [
        // EXTERNAS
        { id: 'portada1', src: portada1, title: 'Vista Principal', label: 'Portada', category: 'externas' },
        { id: 'exterior1', src: exterior1, title: 'Fachada Principal', label: 'Exterior', category: 'externas' },
        { id: 'casa1', src: casa1, title: 'Casa Principal', label: 'Casa', category: 'externas' },
        { id: 'casa2', src: casa2, title: 'Vista Lateral', label: 'Casa', category: 'externas' },
        { id: 'casa3', src: casa3, title: 'Estructura', label: 'Casa', category: 'externas' },
        { id: 'exterior2', src: exterior2, title: 'Jardines', label: 'Exterior', category: 'externas' },
        { id: 'exterior3', src: exterior3, title: 'Zonas Verdes', label: 'Exterior', category: 'externas' },
        { id: 'exterior4', src: exterior4, title: 'Entorno Natural', label: 'Exterior', category: 'externas' },
        { id: 'bbq1', src: bbq1, title: 'Zona BBQ', label: 'BBQ', category: 'externas' },
        { id: 'bbq2', src: bbq2, title: 'Asadero', label: 'BBQ', category: 'externas' },
        { id: 'frutales1', src: frutales1, title: 'Árboles Frutales', label: 'Frutales', category: 'externas' },
        { id: 'frutales2', src: frutales2, title: 'Huerta', label: 'Frutales', category: 'externas' },
        { id: 'sendero1', src: sendero1, title: 'Sendero Ecológico', label: 'Sendero', category: 'externas' },
        { id: 'sendero2', src: sendero2, title: 'Caminos', label: 'Sendero', category: 'externas' },
        { id: 'solar1', src: solar1, title: 'Paneles Solares', label: 'Solar', category: 'externas' },
        { id: 'garaje', src: garaje, title: 'Garaje', label: 'Garaje', category: 'externas' },
        { id: 'portada2', src: portada2, title: 'Atardecer', label: 'Portada', category: 'externas' },
        { id: 'portada3', src: portada3, title: 'Paisaje', label: 'Portada', category: 'externas' },

        // INTERNAS
        { id: 'habitacion11', src: habitacion11, title: 'Habitación 1', label: 'Habitación 1', category: 'internas' },
        { id: 'habitacion12', src: habitacion12, title: 'Habitación 1 Vista', label: 'Habitación 1', category: 'internas' },
        { id: 'habitacion21', src: habitacion21, title: 'Habitación 2', label: 'Habitación 2', category: 'internas' },
        { id: 'habitacion22', src: habitacion22, title: 'Habitación 2 Vista', label: 'Habitación 2', category: 'internas' },
        { id: 'habitacion31', src: habitacion31, title: 'Habitación 3', label: 'Habitación 3', category: 'internas' },
        { id: 'habitacion32', src: habitacion32, title: 'Habitación 3 Vista', label: 'Habitación 3', category: 'internas' },
        { id: 'habitacion41', src: habitacion41, title: 'Habitación 4', label: 'Habitación 4', category: 'internas' },
        { id: 'habitacion42', src: habitacion42, title: 'Habitación 4 Vista', label: 'Habitación 4', category: 'internas' },
        { id: 'habitacion52', src: habitacion52, title: 'Habitación 5', label: 'Habitación 5', category: 'internas' },
        { id: 'sala11', src: sala11, title: 'Sala Principal', label: 'Sala 1', category: 'internas' },
        { id: 'sala12', src: sala12, title: 'Sala Detalle', label: 'Sala 1', category: 'internas' },
        { id: 'sala21', src: sala21, title: 'Sala de Estar', label: 'Sala 2', category: 'internas' },
        { id: 'sala22', src: sala22, title: 'Zona de Descanso', label: 'Sala 2', category: 'internas' },
        { id: 'cocina1', src: cocina1, title: 'Cocina Equipada', label: 'Cocina', category: 'internas' },
        { id: 'cocina2', src: cocina2, title: 'Área de Cocina', label: 'Cocina', category: 'internas' },
        { id: 'bano1', src: bano1, title: 'Baño Principal', label: 'Baño 1', category: 'internas' },
        { id: 'bano2', src: bano2, title: 'Baño Secundario', label: 'Baño 2', category: 'internas' },
        { id: 'balcon', src: balcon, title: 'Balcón', label: 'Balcón', category: 'internas' },
        { id: 'tv1', src: tv1, title: 'Zona TV 1', label: 'TV', category: 'internas' },
        { id: 'tv2', src: tv2, title: 'Zona TV 2', label: 'TV', category: 'internas' },
        { id: 'tv3', src: tv3, title: 'Smart TV', label: 'TV', category: 'internas' },
        { id: 'tv4', src: tv4, title: 'Sala Multimedia', label: 'TV', category: 'internas' },

        // ZONAS HUMEDAS
        { id: 'piscina1', src: piscina1, title: 'Piscina Privada', label: 'Piscina', category: 'humedas' },
        { id: 'piscina2', src: piscina2, title: 'Vista Piscina', label: 'Piscina', category: 'humedas' },
        { id: 'piscina3', src: piscina3, title: 'Área de Piscina', label: 'Piscina', category: 'humedas' },
        { id: 'piscina4', src: piscina4, title: 'Zona de Descanso', label: 'Piscina', category: 'humedas' },
        { id: 'piscina5', src: piscina5, title: 'Piscina Noche', label: 'Piscina', category: 'humedas' },
        { id: 'jac1', src: jac1, title: 'Jacuzzi Principal', label: 'Jacuzzi', category: 'humedas' },
        { id: 'jac2', src: jac2, title: 'Jacuzzi Vista', label: 'Jacuzzi', category: 'humedas' },
        { id: 'jac3', src: jac3, title: 'Spa Privado', label: 'Jacuzzi', category: 'humedas' },
        { id: 'jac4', src: jac4, title: 'Hidromasaje', label: 'Jacuzzi', category: 'humedas' },
        { id: 'jac5', src: jac5, title: 'Relax Total', label: 'Jacuzzi', category: 'humedas' },
    ]

    // Apply custom labels from config
    const allImages = defaultImages.map(img => ({
        ...img,
        title: getImageData(img.id, 'title', img.title),
        label: getImageData(img.id, 'label', img.label)
    }))

    // Seeded shuffle function for consistent random order
    const seededShuffle = (array, seed = 42) => {
        const shuffled = [...array]
        let m = shuffled.length, t, i
        const random = () => {
            seed = (seed * 9301 + 49297) % 233280
            return seed / 233280
        }
        while (m) {
            i = Math.floor(random() * m--)
            t = shuffled[m]
            shuffled[m] = shuffled[i]
            shuffled[i] = t
        }
        return shuffled
    }

    // Shuffle images for "Todas" view
    const galleryImages = seededShuffle(allImages)

    // Bento grid patterns - for "Todas" view only
    const bentoPatterns = [
        'lg', 'sm', 'sm', 'rect',
        'rect', 'sm', 'sm',
        'sm', 'sm', 'lg',
        'rect', 'sm', 'sm',
        'rect', 'sm', 'sm',
        'sm', 'sm', 'rect',
        'sm', 'sm', 'sm', 'sm',
        'sm', 'sm', 'rect',
        'lg', 'sm', 'sm',
        'rect', 'rect',
        'sm', 'sm', 'sm', 'sm',
        'rect', 'rect',
        'lg', 'rect',
        'rect', 'sm', 'sm',
    ]

    const getBentoClass = (index) => {
        const pattern = bentoPatterns[index % bentoPatterns.length]
        switch (pattern) {
            case 'lg': return 'col-span-2 row-span-2'
            case 'rect': return 'col-span-2 row-span-1'
            default: return 'col-span-1 row-span-1'
        }
    }

    // Filter images by category with animation
    const handleCategoryChange = (categoryId) => {
        if (categoryId === activeCategory) return
        setIsAnimating(true)
        setTimeout(() => {
            setActiveCategory(categoryId)
            setTimeout(() => setIsAnimating(false), 50)
        }, 200)
    }

    // Filter images - keep original order for categories, shuffle for "todas"
    const filteredImages = activeCategory === 'todas'
        ? galleryImages
        : allImages.filter(img => img.category === activeCategory)

    // Images for marquee - filter out tv2 for the top section as requested
    const marqueeImages = galleryImages.filter(img => img.id !== 'tv2').slice(0, 15)

    // Open lightbox
    const openLightbox = (image, index) => {
        setLightboxImage(image)
        setLightboxIndex(index)
        document.body.style.overflow = 'hidden'
    }

    // Navigate lightbox
    const navigateLightbox = (direction) => {
        const newIndex = lightboxIndex + direction
        if (newIndex >= 0 && newIndex < filteredImages.length) {
            setLightboxImage(filteredImages[newIndex])
            setLightboxIndex(newIndex)
        }
    }

    // Close lightbox
    const closeLightbox = () => {
        setLightboxImage(null)
        document.body.style.overflow = ''
    }

    // Get category count
    const getCategoryCount = (categoryId) => {
        if (categoryId === 'todas') return allImages.length
        return allImages.filter(img => img.category === categoryId).length
    }

    return (
        <div className="flex flex-col min-h-screen bg-page-bg-galeria dark:bg-surface-card-dark text-text-main dark:text-white font-display">
            <Navbar />

            {/* Header Section - Same style as Reservas */}
            <div className="max-w-7xl mx-auto px-4 md:px-8 pt-8 w-full">
                <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-end">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em] mb-2">{pageContent.pageTitle}</h1>
                            <p className="text-text-subtitle dark:text-text-subtitle-dark text-base">{pageContent.pageSubtitle}</p>
                        </div>
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold text-primary">{allImages.length} Fotos</p>
                            <p className="text-xs text-text-muted dark:text-text-muted">{pageContent.categoryAll}</p>
                        </div>
                    </div>
                    <div className="h-2 w-full rounded-full bg-icon-bg-secondary dark:bg-border-card-dark mt-2 relative overflow-hidden">
                        <div className="absolute top-0 left-0 h-full w-full bg-primary rounded-full"></div>
                    </div>
                </div>
            </div>

            {/* Hero Header with marquee */}
            <div className="relative overflow-hidden py-8" style={{ minHeight: '320px' }}>
                {/* Background image - Full coverage, fills all gaps */}
                <div className="absolute inset-0">
                    <img src={exterior1} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/30"></div>
                </div>

                {/* Top gradient fade */}
                <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-black/40 to-transparent z-10"></div>

                {/* First row - scrolling right */}
                <div className="flex gap-4 animate-marquee mb-4 relative z-5">
                    {[...marqueeImages, ...marqueeImages].map((img, idx) => (
                        <div
                            key={`row1-${idx}`}
                            className="flex-shrink-0 w-40 h-28 md:w-56 md:h-36 rounded-xl overflow-hidden hover:scale-105 transition-transform duration-300 shadow-lg"
                        >
                            <img src={img.src} alt="" className="w-full h-full object-cover" />
                        </div>
                    ))}
                </div>

                {/* Second row - scrolling left */}
                <div className="flex gap-4 animate-marquee-reverse relative z-5">
                    {[...marqueeImages.slice().reverse(), ...marqueeImages.slice().reverse()].map((img, idx) => (
                        <div
                            key={`row2-${idx}`}
                            className="flex-shrink-0 w-40 h-28 md:w-56 md:h-36 rounded-xl overflow-hidden hover:scale-105 transition-transform duration-300 shadow-lg"
                        >
                            <img src={img.src} alt="" className="w-full h-full object-cover" />
                        </div>
                    ))}
                </div>

                {/* Bottom gradient fade */}
                <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/40 to-transparent z-10"></div>
            </div>

            <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 w-full">
                {/* Category Buttons - Centered, Green style from Reservas */}
                <div className="mb-8 flex flex-col items-center gap-3">
                    {/* Main gallery button on top */}
                    <button
                        onClick={() => handleCategoryChange('todas')}
                        className={`w-full max-w-md flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 shadow-lg ${activeCategory === 'todas'
                            ? 'bg-primary text-white shadow-card'
                            : 'bg-surface-card dark:bg-surface-card-dark text-text-muted dark:text-text-muted hover:bg-surface-light dark:hover:bg-gray-800 border border-border-card dark:border-border-card-dark'
                            }`}
                    >
                        <span className="material-symbols-outlined text-lg">photo_library</span>
                        <span>{pageContent.categoryAll}</span>
                    </button>

                    {/* Three category buttons in a row */}
                    <div className="w-full max-w-md grid grid-cols-3 gap-2">
                        {categories.slice(1).map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => handleCategoryChange(cat.id)}
                                className={`flex flex-col items-center justify-center gap-1 px-3 py-3 rounded-xl text-xs font-bold transition-all duration-300 shadow-lg ${activeCategory === cat.id
                                    ? 'bg-primary text-white shadow-card'
                                    : 'bg-surface-card dark:bg-surface-card-dark text-text-muted dark:text-text-muted hover:bg-surface-light dark:hover:bg-gray-800 border border-border-card dark:border-border-card-dark'
                                    }`}
                            >
                                <span className="material-symbols-outlined text-xl">{cat.icon}</span>
                                <span className="truncate">{cat.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Gallery Grid */}
                <div className={`transition-all duration-500 ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
                    {activeCategory === 'todas' ? (
                        /* Bento grid for "Todas" */
                        <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[120px] md:auto-rows-[150px] gap-3 md:gap-4">
                            {filteredImages.map((image, index) => (
                                <div
                                    key={`todas-${index}`}
                                    onClick={() => openLightbox(image, index)}
                                    className={`group relative overflow-hidden rounded-2xl cursor-pointer ${getBentoClass(index)} transition-all duration-500 hover:z-10`}
                                >
                                    <img
                                        src={image.src}
                                        alt={image.title}
                                        className="absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                                    <div className="absolute bottom-0 left-0 right-0 p-3 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                        <p className="text-white/70 text-xs font-medium">{image.label}</p>
                                        <h3 className="text-white font-bold text-sm">{image.title}</h3>
                                    </div>
                                    <div className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg">
                                        <span className="material-symbols-outlined text-icon-color text-sm">fullscreen</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        /* Uniform grid for specific categories with labels */
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {filteredImages.map((image, index) => (
                                <div
                                    key={`cat-${index}`}
                                    onClick={() => openLightbox(image, index)}
                                    className="group relative overflow-hidden rounded-2xl cursor-pointer aspect-square bg-surface-card dark:bg-surface-card-dark border border-border-card dark:border-border-card-dark shadow-md hover:shadow-xl transition-all duration-300"
                                >
                                    <img
                                        src={image.src}
                                        alt={image.title}
                                        className="absolute inset-0 w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
                                        loading="lazy"
                                    />
                                    {/* Always visible label at bottom */}
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3">
                                        <span className="inline-block bg-primary/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full mb-1">
                                            {image.label}
                                        </span>
                                        <h3 className="text-white font-bold text-sm leading-tight">{image.title}</h3>
                                    </div>
                                    {/* Zoom icon on hover */}
                                    <div className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg">
                                        <span className="material-symbols-outlined text-icon-color text-sm">fullscreen</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Lightbox Modal */}
            {lightboxImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center animate-fadeIn"
                    onClick={closeLightbox}
                >
                    <div className="absolute inset-0 bg-black/95 backdrop-blur-xl"></div>

                    <button
                        onClick={closeLightbox}
                        className="absolute top-6 right-6 w-14 h-14 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 z-50 group hover:scale-110"
                    >
                        <span className="material-symbols-outlined text-white text-2xl group-hover:rotate-90 transition-transform duration-300">close</span>
                    </button>

                    <div className="absolute top-6 left-6 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 z-50">
                        <p className="text-white/90 text-sm font-medium">
                            {lightboxIndex + 1} <span className="text-white/50">/ {filteredImages.length}</span>
                        </p>
                    </div>

                    {lightboxIndex > 0 && (
                        <button
                            onClick={(e) => { e.stopPropagation(); navigateLightbox(-1); }}
                            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 group hover:scale-110"
                        >
                            <span className="material-symbols-outlined text-white text-2xl">chevron_left</span>
                        </button>
                    )}
                    {lightboxIndex < filteredImages.length - 1 && (
                        <button
                            onClick={(e) => { e.stopPropagation(); navigateLightbox(1); }}
                            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 group hover:scale-110"
                        >
                            <span className="material-symbols-outlined text-white text-2xl">chevron_right</span>
                        </button>
                    )}

                    <div
                        className="relative max-w-6xl max-h-[85vh] mx-4 animate-scaleIn"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            src={lightboxImage.src}
                            alt={lightboxImage.title}
                            className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-6 md:p-8 rounded-b-2xl">
                            <span className="inline-block bg-primary text-white text-xs font-bold px-3 py-1 rounded-full mb-2">
                                {lightboxImage.label}
                            </span>
                            <h3 className="text-white font-bold text-xl md:text-2xl">{lightboxImage.title}</h3>
                        </div>
                    </div>

                    {/* Thumbnails */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 max-w-[90vw] overflow-x-auto p-2 bg-black/30 backdrop-blur-sm rounded-full">
                        {filteredImages.slice(Math.max(0, lightboxIndex - 3), Math.min(filteredImages.length, lightboxIndex + 4)).map((img, idx) => {
                            const actualIndex = Math.max(0, lightboxIndex - 3) + idx
                            return (
                                <button
                                    key={actualIndex}
                                    onClick={(e) => { e.stopPropagation(); setLightboxImage(img); setLightboxIndex(actualIndex); }}
                                    className={`w-12 h-12 rounded-lg overflow-hidden transition-all duration-300 flex-shrink-0 ${actualIndex === lightboxIndex
                                        ? 'ring-2 ring-white scale-110'
                                        : 'opacity-50 hover:opacity-100'
                                        }`}
                                >
                                    <img src={img.src} alt="" className="w-full h-full object-cover" />
                                </button>
                            )
                        })}
                    </div>
                </div>
            )}

            <Footer />

            {/* Custom animations */}
            <style>{`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee {
                    animation: marquee 60s linear infinite;
                }
                @keyframes marquee-reverse {
                    0% { transform: translateX(-50%); }
                    100% { transform: translateX(0); }
                }
                .animate-marquee-reverse {
                    animation: marquee-reverse 60s linear infinite;
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }
                @keyframes scaleIn {
                    from { opacity: 0; transform: scale(0.9); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-scaleIn {
                    animation: scaleIn 0.3s ease-out;
                }
            `}</style>
        </div>
    )
}
