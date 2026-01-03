import { useState, useEffect } from 'react'

const CONFIG_KEY = 'casacampestre_config'

// Default content structure
const getDefaultContent = () => ({
    intro: {
        title: 'Un refugio donde el tiempo se detiene',
        description: 'Reserva de las Sierras no es solo un alojamiento, es una experiencia diseñada para tu descanso y conexión con la naturaleza.'
    },
    amenidades: [
        { icon: 'pool', title: 'Piscina Privada', description: 'Disfruta de un baño refrescante en total privacidad.' },
        { icon: 'wifi', title: 'Wi-Fi Alta Velocidad', description: 'Mantente conectado con Starlink.' },
        { icon: 'pets', title: 'Pet Friendly', description: 'Tus mascotas son bienvenidas.' }
    ],
    destacados: {
        title: 'Nuestra Casa',
        subtitle: 'Conoce los detalles de este espacio único.',
        items: [
            { icon: 'landscape', title: '2,300 m²', description: 'Amplio lote con zonas verdes y senderos ecológicos.' },
            { icon: 'location_on', title: 'A 5 km de Anapoima', description: 'Cerca del centro pero en total tranquilidad.' },
            { icon: 'group', title: 'Hasta 10 huéspedes', description: 'Ideal para familias y grupos de amigos.' }
        ]
    },
    exploraSitio: {
        title: 'Explora el Sitio',
        subtitle: 'Navega por las secciones para conocer todo sobre tu estadía.',
        items: [
            { path: '/reservas', icon: 'calendar_month', title: 'Reservas', description: 'Consulta disponibilidad y precios actualizados.', image: '/src/images/Piscina 1.webp' },
            { path: '/registro', icon: 'edit_document', title: 'Registro', description: 'Registra a los huéspedes una vez confirmes tu reserva.', image: '/src/images/Sala 1 1.webp' },
            { path: '/galeria', icon: 'photo_library', title: 'Galería', description: 'Conoce los espacios y la distribución de la casa.', image: '/src/images/Casa 1.webp' },
            { path: '/guia', icon: 'info', title: 'Guía', description: 'Detalles de llegada, estadía y salida.', image: '/src/images/Exterior1.webp' }
        ]
    },
    contactoInicial: {
        sectionTitle: 'Contacto Inicial',
        sectionSubtitle: 'Coordina los detalles de tu llegada con nuestra anfitriona.',
        welcomeText: '¡Gracias por elegir Reserva de las Sierras! Para garantizar una llegada organizada, es necesario coordinar previamente los detalles de tu llegada.',
        whatsappMessage: '¡Hola! Acabo de hacer una reserva en Reserva de las Sierras y me gustaría coordinar los detalles de mi llegada.',
        whatsappButtonText: 'Escribir por WhatsApp',
        items: [
            { icon: 'schedule', title: 'Hora de llegada', description: 'Confirma tu hora aproximada de check-in' },
            { icon: 'directions_car', title: 'Indicaciones', description: 'Recibe instrucciones detalladas para llegar' },
            { icon: 'key', title: 'Acceso', description: 'Coordina la entrega de llaves' }
        ]
    },
    zonasHumedas: {
        piscina: {
            title: 'Piscina Privada',
            subtitle: 'Uso exclusivo durante tu estadía',
            badge: 'Privada',
            rules: [
                { icon: 'schedule', text: 'Horario de uso: 8:00 AM - 10:00 PM' },
                { icon: 'checkroom', text: 'Se requiere gorro de baño obligatorio' },
                { icon: 'shower', text: 'Ducharse antes de ingresar a la piscina' },
                { icon: 'warning', text: 'No ingresar alimentos ni bebidas al área de la piscina' }
            ]
        },
        jacuzzi: {
            title: 'Jacuzzi Privado',
            subtitle: 'Relájate en total privacidad',
            badge: 'Exclusivo',
            rules: [
                { icon: 'wb_sunny', text: 'Recomendamos usarlo durante el día para mayor disfrute' },
                { icon: 'timer', text: 'Máximo 90 minutos por día para conservación de equipos' },
                { icon: 'thermostat', text: 'No manipular la temperatura del agua' },
                { icon: 'favorite', text: 'Cuida el jacuzzi como si fuera tuyo' }
            ]
        },
        bottomMessage: 'Las zonas húmedas son de uso exclusivo para los huéspedes de la reserva. Por favor, respeta las normas para mantener las instalaciones en óptimas condiciones.'
    },
    waterConservation: {
        title: 'Cuidado del Agua',
        subtitle: 'Anapoima presenta desafíos con el suministro. Tu colaboración es fundamental.',
        tips: [
            { icon: 'shower', title: 'Duchas Cortas', desc: 'Máximo 5 minutos. Disfrutarás igual y ahorraremos juntos.' },
            { icon: 'local_laundry_service', title: 'Sin Lavandería', desc: 'Evita lavar ropa durante tu estadía, ayuda mucho.' },
            { icon: 'water_drop', title: 'Cierra el Grifo', desc: 'Mientras te enjabonas o cepillas los dientes.' },
            { icon: 'report', title: 'Reporta Fugas', desc: 'Avísanos inmediatamente de cualquier fuga o goteo.' }
        ],
        warningMessage: 'En esta zona el agua no es constante ni abundante y los cortes son frecuentes. Un consumo responsable es fundamental para que el servicio se mantenga durante toda la estadía.',
        animationSpeed: 30,
        showUrgencyBadge: true,
        urgencyBadgeText: 'ZONA DE ESCASEZ HÍDRICA'
    },
    rules: [
        { icon: 'schedule', title: 'Check-in / Check-out', desc: 'Entrada: 3:00 PM. Salida: 11:00 AM. Flexible bajo petición.' },
        { icon: 'volume_off', title: 'Horas de Silencio', desc: 'Por respeto a los vecinos, moderar ruido a partir de las 10:00 PM.' },
        { icon: 'pets', title: 'Mascotas', desc: 'Bienvenidas con previo aviso. Deben estar vigiladas en zonas comunes.' },
        { icon: 'smoke_free', title: 'No Fumar', desc: 'Prohibido fumar en espacios interiores. Usar zonas habilitadas.' },
        { icon: 'celebration', title: 'Eventos', desc: 'No se permiten fiestas o eventos ruidosos sin autorización escrita.' },
        { icon: 'nature_people', title: 'Cuidado Ambiental', desc: 'Ayúdanos a cuidar el entorno, no arrojar basura en los senderos.' }
    ],
    location: {
        title: 'Cómo llegar a Reserva de las Sierras',
        subtitle: 'Sigue nuestras indicaciones para disfrutar sin contratiempos.',
        mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3977.123!2d-74.536!3d4.553!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e3f0!2sReserva%20de%20las%20Sierras!5e0!3m2!1ses!2sco!4v1703436000000',
        wazeUrl: 'https://waze.com/ul?ll=4.553,-74.536&navigate=yes',
        mapsUrl: 'https://maps.app.goo.gl/C7Y1c7Ce8LrJaBUWA',
        referenceImage: '/src/images/Acceso Casa2.webp',
        referenceCaption: 'Acceso a la Finca',
        roadCondition: 'Carretera pavimentada en 95%. Últimos 500m de vía destapada accesible.',
        stepsCarro: [
            { title: 'Salida por Autopista Norte', desc: 'Mantente en carril izquierdo hasta el Peaje Los Andes.' },
            { title: 'Glorieta San Mateo', desc: 'Toma la segunda salida hacia variante rural.' },
            { title: 'Desvío Veredal (Km 12)', desc: 'Gira a la derecha. Referencia: tienda azul.' },
            { title: 'Llegada', desc: '500m más, tercera finca a la izquierda.' }
        ],
        stepsBus: [
            { title: 'Terminal de Transporte', desc: 'Toma un bus hacia Anapoima desde el Terminal del Sur.' },
            { title: 'Bajarse en el cruce', desc: 'Pide al conductor dejarte en el cruce de la vereda.' },
            { title: 'Mototaxi o caminata', desc: 'Toma un mototaxi o camina 15 minutos hasta la finca.' },
            { title: 'Llegada', desc: 'Busca el letrero "Reserva de las Sierras" a la izquierda.' }
        ],
        helpMessage: '¿Te perdiste? Llámanos, te guiaremos en tiempo real.'
    },
    antesDePartir: {
        title: 'Antes de partir',
        subtitle: 'Sigue estas pautas para un check-out sin contratiempos.',
        items: [
            { icon: 'schedule', title: 'Horario de Check-out', description: 'Salida a las 11:00 AM para permitir limpieza profunda.', isWarning: false },
            { icon: 'delete', title: 'Manejo de Residuos', description: 'Disponga residuos en contenedores verdes de la zona exterior.', isWarning: false },
            { icon: 'cleaning_services', title: 'Orden y Limpieza', description: 'Entregue la cocina sin platos sucios y la casa ordenada.', isWarning: false },
            { icon: 'chair', title: 'Cuidado del Mobiliario', description: 'Si movió muebles, regréselos a su sitio original.', isWarning: false },
            { icon: 'warning', title: 'Reporte de Daños', description: 'Notifíquenos de cualquier rotura o mal funcionamiento.', isWarning: true },
            { icon: 'key', title: 'Entrega de Llaves', description: 'Deposite llaves en caja de seguridad junto a la puerta.', isWarning: false }
        ]
    },
    footer: {
        icon: 'nature_people',
        email: '',
        copyright: '© 2024 Reserva de las Sierras. Todos los derechos reservados.',
        poweredBy: 'Ingenierocante',
        showAdmin: true,
        overlayColor: '#2f4858',
        overlayOpacity: 70,
        logoHeight: 32,
        adminLogoHeight: 24
    }
})

// Contenido editable para Registro
const getDefaultRegistroContent = () => ({
    pageTitle: 'Registro de Huéspedes',
    pageSubtitle: 'Completa el registro de todos los huéspedes para tu estadía.',
    step1Title: 'Valida tu Reserva',
    step1Subtitle: 'Ingresa tu número de reserva para continuar.',
    step2Title: 'Datos del Huésped Principal',
    step2Subtitle: 'Completa la información del titular de la reserva.',
    step3Title: 'Acompañantes',
    step3Subtitle: 'Registra a las personas que te acompañarán.',
    step4Title: 'Confirmar Registro',
    step4Subtitle: 'Revisa la información antes de enviar.',
    successTitle: '¡Registro Exitoso!',
    successMessage: 'Tu registro ha sido completado. Te esperamos pronto.'
})

// Contenido editable para Reservas
const getDefaultReservasContent = () => ({
    pageTitle: 'Reserva tu escape',
    pageSubtitle: 'Selecciona tus fechas de llegada y salida.',
    stepIndicator: 'Paso 1 de 4',
    stepLabel: 'Fechas',
    calendarLoading: 'Cargando disponibilidad...',
    legendSelected: 'Seleccionado',
    legendAvailable: 'Disponible',
    legendReserved: 'Reservado',
    tarifasTitle: 'Nuestras Tarifas',
    weekdayLabel: 'Lun - Jue',
    weekdayDesc: 'Perfecto para desconectar y trabajar en remoto.',
    weekendLabel: 'Vie - Dom',
    weekendDesc: 'Disfruta de actividades al aire libre y eventos.',
    discountLabel: 'OFF',
    discountDesc: 'días y ahorra.',
    sidebarTitle: 'Tu Reserva',
    arrivalLabel: 'Llegada',
    departureLabel: 'Salida',
    continueButton: 'Continuar Reserva',
    emptyCalendarText: 'Selecciona fechas en el calendario para ver el precio'
})

// Contenido editable para Galería
const getDefaultGaleriaContent = () => ({
    pageTitle: 'Nuestra Galería',
    pageSubtitle: 'Explora cada rincón de Reserva de las Sierras.',
    heroTitle: 'Nuestros Espacios',
    categoryAll: 'Galería Completa',
    categoryExternas: 'Externas',
    categoryInternas: 'Internas',
    categoryHumedas: 'Zonas Húmedas'
})

// Contenido editable para Guía
const getDefaultGuiaContent = () => ({
    pageTitle: 'Guía del Huésped',
    pageSubtitle: 'Todo lo que necesitas saber para tu estadía.'
})

// Tabs principales (por página)
// === TABS ORGANIZADOS EN DOS SECCIONES ===
const CONTENT_TABS = [
    { id: 'inicio', label: 'Inicio', icon: 'home' },
    { id: 'guia', label: 'Guía', icon: 'info' },
    { id: 'registro', label: 'Registro', icon: 'edit_document' },
    { id: 'galeria', label: 'Galería', icon: 'photo_library' },
    { id: 'reservas', label: 'Reservas', icon: 'calendar_month' }
]

const EDITING_TABS = [
    { id: 'colores', label: 'Colores', icon: 'palette' },
    { id: 'tipografia', label: 'Tipografía', icon: 'text_format' }
]

// Tipografías modernas de Google Fonts (20 opciones)
const FONT_OPTIONS = [
    // === SANS-SERIF MODERNAS ===
    { id: 'Inter', name: 'Inter', category: 'Sans-serif', style: 'Modern/UI', preview: 'Moderna y legible' },
    { id: 'Poppins', name: 'Poppins', category: 'Sans-serif', style: 'Geometric', preview: 'Geométrica y limpia' },
    { id: 'Montserrat', name: 'Montserrat', category: 'Sans-serif', style: 'Urban', preview: 'Elegante urbana' },
    { id: 'Roboto', name: 'Roboto', category: 'Sans-serif', style: 'Universal', preview: 'Versatil y clara' },
    { id: 'Open Sans', name: 'Open Sans', category: 'Sans-serif', style: 'Classic', preview: 'Clásica y legible' },
    { id: 'Lato', name: 'Lato', category: 'Sans-serif', style: 'Warm', preview: 'Cálida y amigable' },
    { id: 'DM Sans', name: 'DM Sans', category: 'Sans-serif', style: 'Geometric', preview: 'Minimalista moderna' },
    { id: 'Work Sans', name: 'Work Sans', category: 'Sans-serif', style: 'Bold', preview: 'Impactante' },
    { id: 'Raleway', name: 'Raleway', category: 'Sans-serif', style: 'Elegant', preview: 'Sofisticada' },
    { id: 'Outfit', name: 'Outfit', category: 'Sans-serif', style: 'Contemporary', preview: 'Contemporánea' },
    // === 10 ADICIONALES ===
    { id: 'Nunito', name: 'Nunito', category: 'Sans-serif', style: 'Rounded', preview: 'Suave y amigable' },
    { id: 'Quicksand', name: 'Quicksand', category: 'Sans-serif', style: 'Rounded', preview: 'Redondeada moderna' },
    { id: 'Josefin Sans', name: 'Josefin Sans', category: 'Sans-serif', style: 'Vintage', preview: 'Elegante vintage' },
    { id: 'Source Sans 3', name: 'Source Sans 3', category: 'Sans-serif', style: 'Professional', preview: 'Profesional y clara' },
    { id: 'Oswald', name: 'Oswald', category: 'Sans-serif', style: 'Impact', preview: 'Impacto y fuerza' },
    { id: 'Plus Jakarta Sans', name: 'Plus Jakarta Sans', category: 'Sans-serif', style: 'Premium', preview: 'Premium y moderna' },
    { id: 'Manrope', name: 'Manrope', category: 'Sans-serif', style: 'Tech', preview: 'Tecnológica' },
    { id: 'Space Grotesk', name: 'Space Grotesk', category: 'Sans-serif', style: 'Tech', preview: 'Futurista' },
    // === SERIFAS ELEGANTES ===
    { id: 'Playfair Display', name: 'Playfair Display', category: 'Serif', style: 'Luxury', preview: 'Lujosa y elegante' },
    { id: 'Merriweather', name: 'Merriweather', category: 'Serif', style: 'Classic', preview: 'Clásica editorial' }
]

// Categorías de tipografía
const FONT_CATEGORIES = [
    { id: 'fontTitle', label: 'Títulos', desc: 'Encabezados principales y títulos de sección', default: 'Outfit' },
    { id: 'fontBody', label: 'Texto General', desc: 'Contenido de párrafos y texto normal', default: 'Inter' },
    { id: 'fontCard', label: 'Tarjetas', desc: 'Texto dentro de tarjetas y cards', default: 'Inter' },
    { id: 'fontButton', label: 'Botones', desc: 'Texto de botones de acción', default: 'Poppins' },
    { id: 'fontAlert', label: 'Avisos/Alertas', desc: 'Mensajes de advertencia e información', default: 'Inter' },
    { id: 'fontNav', label: 'Navegación', desc: 'Menús y enlaces de navegación', default: 'Inter' }
]

// Alias para retrocompatibilidad
const PAGE_TABS = [...CONTENT_TABS, ...EDITING_TABS]

// Sub-tabs para la página de Inicio (simplificada)
const INICIO_SUBTABS = [
    { id: 'general', label: 'General', icon: 'settings' },
    { id: 'hero', label: 'Hero', icon: 'movie' },
    { id: 'intro', label: 'Intro', icon: 'title' },
    { id: 'amenidades', label: 'Amenidades', icon: 'star' },
    { id: 'casa', label: 'Casa', icon: 'home_work' },
    { id: 'explora', label: 'Explora', icon: 'explore' },
    { id: 'footer', label: 'Footer', icon: 'bottom_navigation' }
]

// Sub-tabs para la página de Guía (operativa)
const GUIA_SUBTABS = [
    { id: 'encabezado', label: 'Encabezado', icon: 'title' },
    { id: 'contacto', label: 'Contacto', icon: 'chat' },
    { id: 'pagos', label: 'Pagos', icon: 'payment' },
    { id: 'zonas', label: 'Zonas Húmedas', icon: 'pool' },
    { id: 'agua', label: 'Agua', icon: 'water_drop' },
    { id: 'normas', label: 'Normas', icon: 'gavel' },
    { id: 'ubicacion', label: 'Ubicación', icon: 'map' },
    { id: 'checkout', label: 'Check-out', icon: 'logout' }
]

// Default gallery image data for admin editing
const GALLERY_IMAGES = [
    // EXTERNAS
    { id: 'portada1', defaultTitle: 'Vista Principal', defaultLabel: 'Portada', category: 'externas' },
    { id: 'exterior1', defaultTitle: 'Fachada Principal', defaultLabel: 'Exterior', category: 'externas' },
    { id: 'casa1', defaultTitle: 'Casa Principal', defaultLabel: 'Casa', category: 'externas' },
    { id: 'casa2', defaultTitle: 'Vista Lateral', defaultLabel: 'Casa', category: 'externas' },
    { id: 'casa3', defaultTitle: 'Estructura', defaultLabel: 'Casa', category: 'externas' },
    { id: 'exterior2', defaultTitle: 'Jardines', defaultLabel: 'Exterior', category: 'externas' },
    { id: 'exterior3', defaultTitle: 'Zonas Verdes', defaultLabel: 'Exterior', category: 'externas' },
    { id: 'exterior4', defaultTitle: 'Entorno Natural', defaultLabel: 'Exterior', category: 'externas' },
    { id: 'bbq1', defaultTitle: 'Zona BBQ', defaultLabel: 'BBQ', category: 'externas' },
    { id: 'bbq2', defaultTitle: 'Asadero', defaultLabel: 'BBQ', category: 'externas' },
    { id: 'frutales1', defaultTitle: 'Árboles Frutales', defaultLabel: 'Frutales', category: 'externas' },
    { id: 'frutales2', defaultTitle: 'Huerta', defaultLabel: 'Frutales', category: 'externas' },
    { id: 'sendero1', defaultTitle: 'Sendero Ecológico', defaultLabel: 'Sendero', category: 'externas' },
    { id: 'sendero2', defaultTitle: 'Caminos', defaultLabel: 'Sendero', category: 'externas' },
    { id: 'solar1', defaultTitle: 'Paneles Solares', defaultLabel: 'Solar', category: 'externas' },
    { id: 'garaje', defaultTitle: 'Garaje', defaultLabel: 'Garaje', category: 'externas' },
    { id: 'portada2', defaultTitle: 'Atardecer', defaultLabel: 'Portada', category: 'externas' },
    { id: 'portada3', defaultTitle: 'Paisaje', defaultLabel: 'Portada', category: 'externas' },
    // INTERNAS
    { id: 'habitacion11', defaultTitle: 'Habitación 1', defaultLabel: 'Habitación 1', category: 'internas' },
    { id: 'habitacion12', defaultTitle: 'Habitación 1 Vista', defaultLabel: 'Habitación 1', category: 'internas' },
    { id: 'habitacion21', defaultTitle: 'Habitación 2', defaultLabel: 'Habitación 2', category: 'internas' },
    { id: 'habitacion22', defaultTitle: 'Habitación 2 Vista', defaultLabel: 'Habitación 2', category: 'internas' },
    { id: 'habitacion31', defaultTitle: 'Habitación 3', defaultLabel: 'Habitación 3', category: 'internas' },
    { id: 'habitacion32', defaultTitle: 'Habitación 3 Vista', defaultLabel: 'Habitación 3', category: 'internas' },
    { id: 'habitacion41', defaultTitle: 'Habitación 4', defaultLabel: 'Habitación 4', category: 'internas' },
    { id: 'habitacion42', defaultTitle: 'Habitación 4 Vista', defaultLabel: 'Habitación 4', category: 'internas' },
    { id: 'habitacion52', defaultTitle: 'Habitación 5', defaultLabel: 'Habitación 5', category: 'internas' },
    { id: 'sala11', defaultTitle: 'Sala Principal', defaultLabel: 'Sala 1', category: 'internas' },
    { id: 'sala12', defaultTitle: 'Sala Detalle', defaultLabel: 'Sala 1', category: 'internas' },
    { id: 'sala21', defaultTitle: 'Sala de Estar', defaultLabel: 'Sala 2', category: 'internas' },
    { id: 'sala22', defaultTitle: 'Zona de Descanso', defaultLabel: 'Sala 2', category: 'internas' },
    { id: 'cocina1', defaultTitle: 'Cocina Equipada', defaultLabel: 'Cocina', category: 'internas' },
    { id: 'cocina2', defaultTitle: 'Área de Cocina', defaultLabel: 'Cocina', category: 'internas' },
    { id: 'bano1', defaultTitle: 'Baño Principal', defaultLabel: 'Baño 1', category: 'internas' },
    { id: 'bano2', defaultTitle: 'Baño Secundario', defaultLabel: 'Baño 2', category: 'internas' },
    { id: 'balcon', defaultTitle: 'Balcón', defaultLabel: 'Balcón', category: 'internas' },
    { id: 'tv1', defaultTitle: 'Zona TV 1', defaultLabel: 'TV', category: 'internas' },
    { id: 'tv2', defaultTitle: 'Zona TV 2', defaultLabel: 'TV', category: 'internas' },
    { id: 'tv3', defaultTitle: 'Smart TV', defaultLabel: 'TV', category: 'internas' },
    { id: 'tv4', defaultTitle: 'Sala Multimedia', defaultLabel: 'TV', category: 'internas' },
    // ZONAS HUMEDAS
    { id: 'piscina1', defaultTitle: 'Piscina Privada', defaultLabel: 'Piscina', category: 'humedas' },
    { id: 'piscina2', defaultTitle: 'Vista Piscina', defaultLabel: 'Piscina', category: 'humedas' },
    { id: 'piscina3', defaultTitle: 'Área de Piscina', defaultLabel: 'Piscina', category: 'humedas' },
    { id: 'piscina4', defaultTitle: 'Zona de Descanso', defaultLabel: 'Piscina', category: 'humedas' },
    { id: 'piscina5', defaultTitle: 'Piscina Noche', defaultLabel: 'Piscina', category: 'humedas' },
    { id: 'jac1', defaultTitle: 'Jacuzzi Principal', defaultLabel: 'Jacuzzi', category: 'humedas' },
    { id: 'jac2', defaultTitle: 'Jacuzzi Vista', defaultLabel: 'Jacuzzi', category: 'humedas' },
    { id: 'jac3', defaultTitle: 'Spa Privado', defaultLabel: 'Jacuzzi', category: 'humedas' },
    { id: 'jac4', defaultTitle: 'Hidromasaje', defaultLabel: 'Jacuzzi', category: 'humedas' },
    { id: 'jac5', defaultTitle: 'Relax Total', defaultLabel: 'Jacuzzi', category: 'humedas' }
]

// Sistema de Colores Estandarizado - Paleta Unificada
// Colores Principales: #3db814, #2a8a0e, #ffffff, #000000
// Colores Secundarios: #00a658, #009178, #007983, #006076, #2f4858, #00af52, #00a381, #0094a8
const DEFAULT_COLORS = {
    // === FONDOS DE PÁGINAS ===
    pageBgInicio: '#ffffff',
    pageBgReservas: '#ffffff',
    pageBgGaleria: '#ffffff',
    pageBgRegistro: '#ffffff',
    pageBgGuia: '#ffffff',
    pageBgAdmin: '#ffffff',

    // === BOTONES ===
    btnPrimary: '#3db814',
    btnPrimaryHover: '#2a8a0e',

    // === TEXTOS - COLORES COMPLETOS ===
    textMain: '#2f4858',          // Texto principal/cuerpo
    textTitle: '#2f4858',         // Títulos y encabezados
    textMuted: '#007983',         // Texto secundario/descripciones
    textSubtitle: '#009178',      // Subtítulos debajo de títulos
    textSubtitleDark: '#00a658',  // Subtítulos modo oscuro
    textLink: '#3db814',          // Enlaces y texto clickeable
    textAccent: '#3db814',        // Texto destacado/resaltado
    textOnPrimary: '#ffffff',     // Texto sobre botones primarios

    // === ICONOS - COLORES COMPLETOS ===
    iconColor: '#3db814',             // Color del símbolo del icono
    iconColorSecondary: '#009178',    // Color secundario del símbolo
    iconColorDark: '#ffffff',         // Color del símbolo en modo oscuro
    iconBgPrimary: '#ffffff',         // Fondo de iconos principales
    iconBgSecondary: '#ffffff',       // Fondo de iconos secundarios
    iconBgDark: '#006076',            // Fondo de iconos modo oscuro
    iconBorder: '#3db814',            // Borde de iconos

    // === SUPERFICIES - CONTENEDORES ===
    surfaceCard: '#ffffff',           // Cards principales
    surfaceCardHover: '#f8faf8',      // Cards al hover
    surfaceLight: '#ffffff',          // Secciones claras
    surfaceSection: '#f8faf8',        // Fondo de secciones alternas
    surfaceNav: '#ffffff',            // Navbar
    surfaceFooter: '#2f4858',         // Footer
    surfaceCardDark: '#2f4858',       // Cards modo oscuro

    // === BORDES ===
    borderCard: '#009178',
    borderCardDark: '#006076',

    // === SOMBRAS ===
    cardShadow: '#22c55e',            // Verde para sombras de botones y cards

    // === BADGES ===
    badgeBg: '#3db814',
    badgeText: '#ffffff',

    // === PLATAFORMAS ===
    platformAirbnb: '#2f4858',
    platformBooking: '#006076',
    platformGoogle: '#0094a8',
    platformDirecta: '#00a658',

    // === NAVEGACIÓN EXTERNA ===
    navWaze: '#007983',
    navMaps: '#006076',

    // === ALERTAS - WARNING ===
    warningBg: '#007983',
    warningText: '#ffffff',
    warningIcon: '#ffffff',
    warningBorder: '#006076',

    // === ALERTAS - INFO ===
    infoBg: '#0094a8',
    infoText: '#ffffff',
    infoIcon: '#ffffff',
    infoBorder: '#007983',

    // === ALERTAS - SUCCESS ===
    successBg: '#3db814',
    successText: '#ffffff',
    successIcon: '#ffffff',
    successBorder: '#2a8a0e',

    // === ALERTAS - ERROR ===
    errorBg: '#2f4858',
    errorText: '#ffffff',
    errorIcon: '#ffffff',
    errorBorder: '#006076'
}

// ============================================
// PALETA DE COLORES PERMITIDOS (12 colores únicos)
// Solo estos colores pueden ser seleccionados en el panel de colores
// ============================================
const ALLOWED_COLORS = [
    { hex: '#3db814', name: 'Verde Principal' },
    { hex: '#ffffff', name: 'Blanco' },
    { hex: '#000000', name: 'Negro' },
    { hex: '#d8f3dc', name: 'Frosted Mint' },
    { hex: '#b7e4c7', name: 'Celadon Claro' },
    { hex: '#95d5b2', name: 'Celadon' },
    { hex: '#74c69d', name: 'Mint Leaf Claro' },
    { hex: '#52b788', name: 'Mint Leaf' },
    { hex: '#40916c', name: 'Sea Green' },
    { hex: '#2d6a4f', name: 'Hunter Green' },
    { hex: '#1b4332', name: 'Pine Teal' },
    { hex: '#081c15', name: 'Carbon Black' }
]

// Componente de selector de colores con paleta + picker libre + input hexadecimal
const PaletteColorPicker = ({ value, onChange }) => {
    const currentColor = ALLOWED_COLORS.find(c => c.hex.toLowerCase() === value?.toLowerCase())
    return (
        <div className="space-y-3">
            {/* Color preview box with native color picker + hex input */}
            <div className="flex items-center gap-3">
                <div className="relative">
                    <input
                        type="color"
                        value={value || '#000000'}
                        onChange={e => onChange(e.target.value)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div
                        className="w-14 h-14 rounded-xl border-2 border-gray-300 shadow-inner cursor-pointer hover:border-primary transition-colors"
                        style={{ backgroundColor: value }}
                        title="Haz clic para abrir selector de colores"
                    />
                </div>
                <div className="flex-1">
                    <label className="block text-xs text-text-muted mb-1">Código hexadecimal</label>
                    <input
                        type="text"
                        value={value || ''}
                        onChange={e => onChange(e.target.value)}
                        placeholder="#000000"
                        className="w-full px-3 py-2 border border-border-card rounded-lg text-sm font-mono uppercase focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                </div>
            </div>

            {/* Quick palette with 12 approved colors */}
            <div>
                <p className="text-xs text-text-muted mb-2">Paleta rápida:</p>
                <div className="flex flex-wrap gap-2">
                    {ALLOWED_COLORS.map(color => (
                        <button
                            key={color.hex}
                            type="button"
                            onClick={() => onChange(color.hex)}
                            className={`w-7 h-7 rounded-lg transition-all ${value?.toLowerCase() === color.hex.toLowerCase()
                                ? 'ring-2 ring-offset-1 ring-primary scale-110'
                                : 'hover:scale-105 border border-gray-200'
                                }`}
                            style={{ backgroundColor: color.hex }}
                            title={color.name}
                        />
                    ))}
                </div>
            </div>

            {/* Current color label */}
            <p className="text-xs text-text-muted">
                {currentColor ? `✓ ${currentColor.name}` : 'Color personalizado'}
            </p>
        </div>
    )
}


export default function AdminContenido() {
    const [activePageTab, setActivePageTab] = useState('inicio')
    const [activeSubTab, setActiveSubTab] = useState('general')
    const [activeTab, setActiveTab] = useState('general') // Keep for backward compatibility
    const [colorCategory, setColorCategory] = useState('tarjetas') // Sub-category for colors
    const [config, setConfig] = useState({})
    const [content, setContent] = useState(getDefaultContent())
    const [registroContent, setRegistroContent] = useState(getDefaultRegistroContent())
    const [reservasContent, setReservasContent] = useState(getDefaultReservasContent())
    const [galeriaContent, setGaleriaContent] = useState(getDefaultGaleriaContent())
    const [guiaContent, setGuiaContent] = useState(getDefaultGuiaContent())
    const [galeriaLabels, setGaleriaLabels] = useState({})
    const [siteColors, setSiteColors] = useState(DEFAULT_COLORS)
    const [siteFonts, setSiteFonts] = useState({
        fontTitle: 'Outfit',
        fontBody: 'Inter',
        fontCard: 'Inter',
        fontButton: 'Poppins',
        fontAlert: 'Inter',
        fontNav: 'Inter',
        fontGlobal: 'Inter' // Fuente global para toda la página
    })
    const [generalConfig, setGeneralConfig] = useState({
        checkInTime: '3:00 PM',
        checkOutTime: '11:00 AM',
        whatsappNumber: '573001234567',
        hostName: 'Marcela'
    })
    const [paymentConfig, setPaymentConfig] = useState({
        paymentSubtitlePart1: 'Si tu reserva fue realizada a través de Airbnb, no es necesario efectuar pagos adicionales, ya que todo el proceso se gestiona directamente por la plataforma. Para reservas directas o realizadas por Booking, se solicita un',
        paymentSubtitleHighlight: 'ABONO OBLIGATORIO del 25 %',
        paymentSubtitlePart2: 'al momento de confirmar la reserva para asegurar la fecha, y el saldo restante se paga al llegar a la casa.',
        paymentBbreEmail: 'ingenierocante@gmail.com',
        paymentBbrePhone: '3057501023',
        paymentNequiNumber: '3057501023',
        paymentNequiName: 'Osc_ Can (Oscar Cante)',
        paymentWhatsappNumber: '3057501023',
        paymentWhatsappMessage: 'Hola, adjunto mi comprobante de pago para la reserva'
    })
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)

    // Apply colors to CSS variables
    const applyColors = (colors) => {
        const root = document.documentElement

        // Fondos de Páginas
        root.style.setProperty('--color-page-bg-inicio', colors.pageBgInicio)
        root.style.setProperty('--color-page-bg-reservas', colors.pageBgReservas)
        root.style.setProperty('--color-page-bg-galeria', colors.pageBgGaleria)
        root.style.setProperty('--color-page-bg-registro', colors.pageBgRegistro)
        root.style.setProperty('--color-page-bg-guia', colors.pageBgGuia)
        root.style.setProperty('--color-page-bg-admin', colors.pageBgAdmin)

        // Botones
        root.style.setProperty('--color-btn-primary', colors.btnPrimary)
        root.style.setProperty('--color-btn-primary-hover', colors.btnPrimaryHover)
        // Textos - Colores completos
        root.style.setProperty('--color-text-main', colors.textMain)
        root.style.setProperty('--color-text-title', colors.textTitle)
        root.style.setProperty('--color-text-muted', colors.textMuted)
        root.style.setProperty('--color-text-subtitle', colors.textSubtitle)
        root.style.setProperty('--color-text-subtitle-dark', colors.textSubtitleDark)
        root.style.setProperty('--color-text-link', colors.textLink)
        root.style.setProperty('--color-text-accent', colors.textAccent)
        root.style.setProperty('--color-text-on-primary', colors.textOnPrimary)
        // Iconos - Colores completos
        root.style.setProperty('--color-icon-color', colors.iconColor)
        root.style.setProperty('--color-icon-color-secondary', colors.iconColorSecondary)
        root.style.setProperty('--color-icon-color-dark', colors.iconColorDark)
        root.style.setProperty('--color-icon-bg-primary', colors.iconBgPrimary)
        root.style.setProperty('--color-icon-bg-secondary', colors.iconBgSecondary)
        root.style.setProperty('--color-icon-bg-dark', colors.iconBgDark)
        root.style.setProperty('--color-icon-border', colors.iconBorder)
        // Superficies - Contenedores
        root.style.setProperty('--color-surface-card', colors.surfaceCard)
        root.style.setProperty('--color-surface-card-hover', colors.surfaceCardHover)
        root.style.setProperty('--color-surface-light', colors.surfaceLight)
        root.style.setProperty('--color-surface-section', colors.surfaceSection)
        root.style.setProperty('--color-surface-nav', colors.surfaceNav)
        root.style.setProperty('--color-surface-footer', colors.surfaceFooter)
        root.style.setProperty('--color-surface-card-dark', colors.surfaceCardDark)
        // Bordes
        root.style.setProperty('--color-border-card', colors.borderCard)
        root.style.setProperty('--color-border-card-dark', colors.borderCardDark)
        // Sombras
        root.style.setProperty('--color-card-shadow', colors.cardShadow)
        // Badges
        root.style.setProperty('--color-badge-bg', colors.badgeBg)
        root.style.setProperty('--color-badge-text', colors.badgeText)
        // Plataformas
        root.style.setProperty('--color-platform-airbnb', colors.platformAirbnb)
        root.style.setProperty('--color-platform-booking', colors.platformBooking)
        root.style.setProperty('--color-platform-google', colors.platformGoogle)
        root.style.setProperty('--color-platform-directa', colors.platformDirecta)
        // Navegación
        root.style.setProperty('--color-nav-waze', colors.navWaze)
        root.style.setProperty('--color-nav-maps', colors.navMaps)
        // Alertas - Warning
        root.style.setProperty('--color-warning-bg', colors.warningBg)
        root.style.setProperty('--color-warning-text', colors.warningText)
        root.style.setProperty('--color-warning-icon', colors.warningIcon)
        root.style.setProperty('--color-warning-border', colors.warningBorder)
        // Alertas - Info
        root.style.setProperty('--color-info-bg', colors.infoBg)
        root.style.setProperty('--color-info-text', colors.infoText)
        root.style.setProperty('--color-info-icon', colors.infoIcon)
        root.style.setProperty('--color-info-border', colors.infoBorder)
        // Alertas - Success
        root.style.setProperty('--color-success-bg', colors.successBg)
        root.style.setProperty('--color-success-text', colors.successText)
        root.style.setProperty('--color-success-icon', colors.successIcon)
        root.style.setProperty('--color-success-border', colors.successBorder)
        // Alertas - Error
        root.style.setProperty('--color-error-bg', colors.errorBg)
        root.style.setProperty('--color-error-text', colors.errorText)
        root.style.setProperty('--color-error-icon', colors.errorIcon)
        root.style.setProperty('--color-error-border', colors.errorBorder)
    }

    useEffect(() => {
        const loadConfig = async () => {
            let savedData = null
            let source = 'defaults'

            // 1. Try API first (server-side persistence)
            try {
                const apiResponse = await fetch('/api/config')
                if (apiResponse.ok) {
                    const apiConfig = await apiResponse.json()
                    if (Object.keys(apiConfig).length > 0) {
                        savedData = JSON.stringify(apiConfig)
                        source = 'API'
                        // Sync to localStorage
                        localStorage.setItem(CONFIG_KEY, savedData)
                    }
                }
            } catch (e) {
                console.log('API not available, trying localStorage')
            }

            // 2. Fall back to localStorage
            if (!savedData) {
                savedData = localStorage.getItem(CONFIG_KEY)
                if (savedData) source = 'localStorage'
            }

            // 3. If still empty, try seed file
            if (!savedData) {
                try {
                    const response = await fetch('/site-config.json')
                    if (response.ok) {
                        const seedConfig = await response.json()
                        localStorage.setItem(CONFIG_KEY, JSON.stringify(seedConfig))
                        savedData = JSON.stringify(seedConfig)
                        source = 'seed file'
                    }
                } catch (e) {
                    console.log('No seed config found, using defaults')
                }
            }

            if (savedData) {
                console.log(`✅ Configuración cargada desde ${source}`)
                const parsed = JSON.parse(savedData)
                setConfig(parsed)
                if (parsed.inicioContent) {
                    setContent(prev => ({ ...prev, ...parsed.inicioContent }))
                }
                if (parsed.galeriaLabels) {
                    setGaleriaLabels(parsed.galeriaLabels)
                }
                if (parsed.registroContent) {
                    setRegistroContent(prev => ({ ...prev, ...parsed.registroContent }))
                }
                if (parsed.reservasContent) {
                    setReservasContent(prev => ({ ...prev, ...parsed.reservasContent }))
                }
                if (parsed.galeriaContent) {
                    setGaleriaContent(prev => ({ ...prev, ...parsed.galeriaContent }))
                }
                if (parsed.guiaContent) {
                    setGuiaContent(prev => ({ ...prev, ...parsed.guiaContent }))
                }
                if (parsed.siteColors) {
                    setSiteColors(prev => ({ ...prev, ...parsed.siteColors }))
                    applyColors({ ...DEFAULT_COLORS, ...parsed.siteColors })
                }
                // Load general config
                if (parsed.checkInTime || parsed.checkOutTime || parsed.whatsappNumber || parsed.hostName) {
                    setGeneralConfig(prev => ({
                        ...prev,
                        checkInTime: parsed.checkInTime || prev.checkInTime,
                        checkOutTime: parsed.checkOutTime || prev.checkOutTime,
                        whatsappNumber: parsed.whatsappNumber || prev.whatsappNumber,
                        hostName: parsed.hostName || prev.hostName
                    }))
                }
                // Load payment config
                setPaymentConfig(prev => ({
                    ...prev,
                    paymentSubtitlePart1: parsed.paymentSubtitlePart1 || prev.paymentSubtitlePart1,
                    paymentSubtitleHighlight: parsed.paymentSubtitleHighlight || prev.paymentSubtitleHighlight,
                    paymentSubtitlePart2: parsed.paymentSubtitlePart2 || prev.paymentSubtitlePart2,
                    paymentBbreEmail: parsed.paymentBbreEmail || prev.paymentBbreEmail,
                    paymentBbrePhone: parsed.paymentBbrePhone || prev.paymentBbrePhone,
                    paymentNequiNumber: parsed.paymentNequiNumber || prev.paymentNequiNumber,
                    paymentNequiName: parsed.paymentNequiName || prev.paymentNequiName,
                    paymentWhatsappNumber: parsed.paymentWhatsappNumber || prev.paymentWhatsappNumber,
                    paymentWhatsappMessage: parsed.paymentWhatsappMessage || prev.paymentWhatsappMessage
                }))
            }
        }
        loadConfig()
    }, [])

    const saveConfig = async () => {
        setSaving(true)
        const updated = {
            ...config,
            inicioContent: content,
            registroContent,
            reservasContent,
            galeriaContent,
            guiaContent,
            galeriaLabels,
            siteColors,
            siteFonts, // Tipografías
            checkInTime: generalConfig.checkInTime,
            checkOutTime: generalConfig.checkOutTime,
            whatsappNumber: generalConfig.whatsappNumber,
            hostName: generalConfig.hostName,
            // Payment config
            paymentSubtitlePart1: paymentConfig.paymentSubtitlePart1,
            paymentSubtitleHighlight: paymentConfig.paymentSubtitleHighlight,
            paymentSubtitlePart2: paymentConfig.paymentSubtitlePart2,
            paymentBbreEmail: paymentConfig.paymentBbreEmail,
            paymentBbrePhone: paymentConfig.paymentBbrePhone,
            paymentNequiNumber: paymentConfig.paymentNequiNumber,
            paymentNequiName: paymentConfig.paymentNequiName,
            paymentWhatsappNumber: paymentConfig.paymentWhatsappNumber,
            paymentWhatsappMessage: paymentConfig.paymentWhatsappMessage
        }

        // IMPORTANT: Save to API (Supabase) FIRST for persistence
        try {
            const response = await fetch('/api/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updated)
            })
            if (response.ok) {
                console.log('✅ Configuración guardada en Supabase')
                // Only sync to localStorage after successful API save
                localStorage.setItem(CONFIG_KEY, JSON.stringify(updated))
                setConfig(updated)
                applyColors(siteColors)
                setSaved(true)
                setTimeout(() => setSaved(false), 2000)
            } else {
                throw new Error('API response not OK')
            }
        } catch (e) {
            console.error('❌ Error guardando en Supabase:', e)
            // Fallback: save to localStorage but warn user
            localStorage.setItem(CONFIG_KEY, JSON.stringify(updated))
            setConfig(updated)
            applyColors(siteColors)
            alert('⚠️ Los cambios se guardaron localmente pero NO en la nube. Verifica tu conexión a internet.')
        }

        setSaving(false)
    }

    // Export configuration as JSON file
    const exportConfig = () => {
        const fullConfig = {
            ...config,
            inicioContent: content,
            galeriaLabels,
            siteColors,
            checkInTime: generalConfig.checkInTime,
            checkOutTime: generalConfig.checkOutTime,
            whatsappNumber: generalConfig.whatsappNumber,
            hostName: generalConfig.hostName
        }
        const blob = new Blob([JSON.stringify(fullConfig, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `site-config-backup-${new Date().toISOString().split('T')[0]}.json`
        a.click()
        URL.revokeObjectURL(url)
    }

    // Import configuration from JSON file
    const importConfig = (event) => {
        const file = event.target.files[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = (e) => {
            try {
                const imported = JSON.parse(e.target.result)
                localStorage.setItem(CONFIG_KEY, JSON.stringify(imported))
                setConfig(imported)
                if (imported.inicioContent) {
                    setContent(prev => ({ ...prev, ...imported.inicioContent }))
                }
                if (imported.galeriaLabels) {
                    setGaleriaLabels(imported.galeriaLabels)
                }
                if (imported.siteColors) {
                    setSiteColors(imported.siteColors)
                    applyColors(imported.siteColors)
                }
                if (imported.checkInTime || imported.checkOutTime || imported.whatsappNumber || imported.hostName) {
                    setGeneralConfig(prev => ({
                        ...prev,
                        checkInTime: imported.checkInTime || prev.checkInTime,
                        checkOutTime: imported.checkOutTime || prev.checkOutTime,
                        whatsappNumber: imported.whatsappNumber || prev.whatsappNumber,
                        hostName: imported.hostName || prev.hostName
                    }))
                }
                setSaved(true)
                setTimeout(() => setSaved(false), 2000)
                alert('✅ Configuración importada exitosamente')
            } catch (err) {
                alert('❌ Error al importar: ' + err.message)
            }
        }
        reader.readAsText(file)
        event.target.value = '' // Reset input
    }

    const updateColor = (key, value) => {
        const newColors = { ...siteColors, [key]: value }
        setSiteColors(newColors)
        // Apply immediately to see changes in real-time
        applyColors(newColors)
    }

    const resetColors = () => {
        // Restaurar colores por defecto
        setSiteColors(DEFAULT_COLORS)
        applyColors(DEFAULT_COLORS)
        // Guardar en localStorage
        try {
            const savedConfig = localStorage.getItem(CONFIG_KEY)
            const config = savedConfig ? JSON.parse(savedConfig) : {}
            config.siteColors = DEFAULT_COLORS
            localStorage.setItem(CONFIG_KEY, JSON.stringify(config))
            console.log('✅ Colores restaurados:', DEFAULT_COLORS)
            setSaved(true)
            setTimeout(() => setSaved(false), 2000)
        } catch (e) {
            console.error('Error restaurando colores:', e)
        }
    }

    const updateGaleriaLabel = (imageId, field, value) => {
        setGaleriaLabels(prev => ({
            ...prev,
            [imageId]: {
                ...prev[imageId],
                [field]: value
            }
        }))
    }

    const updateContent = (path, value) => {
        setContent(prev => {
            const keys = path.split('.')
            const newContent = { ...prev }
            let obj = newContent
            for (let i = 0; i < keys.length - 1; i++) {
                obj[keys[i]] = { ...obj[keys[i]] }
                obj = obj[keys[i]]
            }
            obj[keys[keys.length - 1]] = value
            return newContent
        })
    }

    const updateArrayItem = (arrayPath, index, field, value) => {
        setContent(prev => {
            const keys = arrayPath.split('.')
            const newContent = JSON.parse(JSON.stringify(prev))
            let arr = newContent
            for (const key of keys) arr = arr[key]
            arr[index][field] = value
            return newContent
        })
    }

    const addArrayItem = (arrayPath, newItem) => {
        setContent(prev => {
            const keys = arrayPath.split('.')
            const newContent = JSON.parse(JSON.stringify(prev))
            let arr = newContent
            for (const key of keys) arr = arr[key]
            arr.push(newItem)
            return newContent
        })
    }

    const removeArrayItem = (arrayPath, index) => {
        setContent(prev => {
            const keys = arrayPath.split('.')
            const newContent = JSON.parse(JSON.stringify(prev))
            let parent = newContent
            for (let i = 0; i < keys.length - 1; i++) parent = parent[keys[i]]
            parent[keys[keys.length - 1]].splice(index, 1)
            return newContent
        })
    }

    // Hero config (uses existing config pattern)
    const heroConfig = {
        videoUrl: config.heroVideoUrl || 'https://www.youtube.com/watch?v=yzjFNEuWwFI',
        filterColor: config.heroFilterColor || '#3db814',
        filterOpacity: config.heroFilterOpacity ?? 30,
        blurAmount: config.heroBlurAmount ?? 15,
        phrases: config.heroRotatingPhrases || ['Somos Reserva de las Sierras', 'Somos Tranquilidad', 'Somos Aire Puro', 'Somos Espacio Verde']
    }

    const updateHeroConfig = (field, value) => {
        const fieldMap = {
            videoUrl: 'heroVideoUrl',
            filterColor: 'heroFilterColor',
            filterOpacity: 'heroFilterOpacity',
            blurAmount: 'heroBlurAmount',
            phrases: 'heroRotatingPhrases'
        }
        setConfig(prev => ({ ...prev, [fieldMap[field]]: value }))
    }

    const renderGeneralTab = () => (
        <div className="space-y-6">
            {/* General Settings Card */}
            <div className="bg-white rounded-xl p-6 border border-border-card">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-icon-color">schedule</span>
                    Horarios de Check-in / Check-out
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-text-main-light mb-1">Hora de Check-in</label>
                        <input
                            type="text"
                            value={generalConfig.checkInTime}
                            onChange={e => setGeneralConfig(prev => ({ ...prev, checkInTime: e.target.value }))}
                            placeholder="3:00 PM"
                            className="w-full px-4 py-2 border border-border-card rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                        <p className="text-xs text-text-muted mt-1">Ejemplo: 3:00 PM</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-main-light mb-1">Hora de Check-out</label>
                        <input
                            type="text"
                            value={generalConfig.checkOutTime}
                            onChange={e => setGeneralConfig(prev => ({ ...prev, checkOutTime: e.target.value }))}
                            placeholder="11:00 AM"
                            className="w-full px-4 py-2 border border-border-card rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                        <p className="text-xs text-text-muted mt-1">Ejemplo: 11:00 AM</p>
                    </div>
                </div>
            </div>

            {/* Contact Info Card */}
            <div className="bg-white rounded-xl p-6 border border-border-card">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-icon-color">contact_phone</span>
                    Información de Contacto
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-text-main-light mb-1">Número de WhatsApp</label>
                        <input
                            type="text"
                            value={generalConfig.whatsappNumber}
                            onChange={e => setGeneralConfig(prev => ({ ...prev, whatsappNumber: e.target.value }))}
                            placeholder="573001234567"
                            className="w-full px-4 py-2 border border-border-card rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                        <p className="text-xs text-text-muted mt-1">Incluye código de país (ej: 57 para Colombia)</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-main-light mb-1">Nombre del Anfitrión</label>
                        <input
                            type="text"
                            value={generalConfig.hostName}
                            onChange={e => setGeneralConfig(prev => ({ ...prev, hostName: e.target.value }))}
                            placeholder="Marcela"
                            className="w-full px-4 py-2 border border-border-card rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                        <p className="text-xs text-text-muted mt-1">Aparece en la sección de contacto</p>
                    </div>
                </div>
            </div>

            {/* Export/Import Card */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h3 className="font-bold text-lg mb-2 flex items-center gap-2 text-gray-900">
                    <span className="material-symbols-outlined text-primary">backup</span>
                    Respaldo de Configuración
                </h3>
                <p className="text-sm text-text-muted mb-4">
                    Exporta tu configuración para guardarla o importa una configuración existente.
                    <strong className="text-primary"> Esto evita perder los datos si limpias el caché del navegador.</strong>
                </p>
                <div className="flex gap-3">
                    <button
                        onClick={exportConfig}
                        className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition-colors"
                    >
                        <span className="material-symbols-outlined text-lg">download</span>
                        Exportar Configuración
                    </button>
                    <label className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 hover:bg-surface-light text-text-main-light rounded-lg font-medium cursor-pointer transition-colors">
                        <span className="material-symbols-outlined text-lg">upload</span>
                        Importar Configuración
                        <input type="file" accept=".json" onChange={importConfig} className="hidden" />
                    </label>
                </div>
            </div>

            {/* Info Banner */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-gray-500">info</span>
                    <div>
                        <p className="text-sm text-gray-700 font-medium">Sobre la Persistencia de Datos</p>
                        <p className="text-xs text-gray-600 mt-1">
                            La configuración se guarda en el navegador. Si limpias el caché o cambias de dispositivo,
                            los datos podrían perderse. Usa "Exportar Configuración" regularmente para hacer respaldos.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )

    const renderHeroTab = () => (
        <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 border border-border-card">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-icon-color">video_library</span>
                    Video de Fondo
                </h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-text-main-light mb-1">URL del Video (YouTube)</label>
                        <input type="text" value={heroConfig.videoUrl} onChange={e => updateHeroConfig('videoUrl', e.target.value)}
                            className="w-full px-4 py-2 border border-border-card rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-text-main-light mb-1">Color del Filtro</label>
                            <PaletteColorPicker
                                value={heroConfig.filterColor}
                                onChange={(color) => updateHeroConfig('filterColor', color)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-main-light mb-1">Opacidad ({heroConfig.filterOpacity}%)</label>
                            <input type="range" min="0" max="100" value={heroConfig.filterOpacity} onChange={e => updateHeroConfig('filterOpacity', parseInt(e.target.value))}
                                className="w-full" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-main-light mb-1">Desenfoque ({heroConfig.blurAmount}px)</label>
                        <input type="range" min="0" max="50" value={heroConfig.blurAmount} onChange={e => updateHeroConfig('blurAmount', parseInt(e.target.value))}
                            className="w-full" />
                    </div>
                </div>
            </div>
            <div className="bg-white rounded-xl p-6 border border-border-card">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-icon-color">format_quote</span>
                    Frases Rotativas
                </h3>
                <div className="space-y-3">
                    {heroConfig.phrases.map((phrase, i) => (
                        <div key={i} className="flex gap-2">
                            <input type="text" value={phrase} onChange={e => {
                                const newPhrases = [...heroConfig.phrases]
                                newPhrases[i] = e.target.value
                                updateHeroConfig('phrases', newPhrases)
                            }} className="flex-1 px-4 py-2 border border-border-card rounded-lg" />
                            <button onClick={() => updateHeroConfig('phrases', heroConfig.phrases.filter((_, idx) => idx !== i))}
                                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"><span className="material-symbols-outlined">delete</span></button>
                        </div>
                    ))}
                    <button onClick={() => updateHeroConfig('phrases', [...heroConfig.phrases, 'Nueva frase'])}
                        className="flex items-center gap-2 px-4 py-2 text-primary hover:bg-primary/10 rounded-lg text-sm font-medium">
                        <span className="material-symbols-outlined">add</span>Agregar frase
                    </button>
                </div>
            </div>
        </div>
    )

    const renderIntroTab = () => (
        <div className="bg-white rounded-xl p-6 border border-border-card">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-icon-color">title</span>
                Sección de Introducción
            </h3>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-text-main-light mb-1">Título Principal</label>
                    <input type="text" value={content.intro.title} onChange={e => updateContent('intro.title', e.target.value)}
                        className="w-full px-4 py-2 border border-border-card rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-text-main-light mb-1">Descripción</label>
                    <textarea value={content.intro.description} onChange={e => updateContent('intro.description', e.target.value)} rows={3}
                        className="w-full px-4 py-2 border border-border-card rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                </div>
            </div>
        </div>
    )

    const renderAmenidadesTab = () => (
        <div className="bg-white rounded-xl p-6 border border-border-card">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-icon-color">star</span>
                Amenidades
            </h3>
            <div className="space-y-4">
                {content.amenidades.map((item, i) => (
                    <div key={i} className="p-4 bg-surface-light rounded-lg space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="font-medium text-sm text-text-muted">Amenidad {i + 1}</span>
                            <button onClick={() => removeArrayItem('amenidades', i)} className="text-gray-500 hover:bg-gray-100 p-1 rounded">
                                <span className="material-symbols-outlined text-sm">delete</span>
                            </button>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            <input type="text" value={item.icon} onChange={e => updateArrayItem('amenidades', i, 'icon', e.target.value)} placeholder="Icono"
                                className="px-3 py-2 border border-border-card rounded-lg text-sm" />
                            <input type="text" value={item.title} onChange={e => updateArrayItem('amenidades', i, 'title', e.target.value)} placeholder="Título"
                                className="px-3 py-2 border border-border-card rounded-lg text-sm" />
                            <input type="text" value={item.description} onChange={e => updateArrayItem('amenidades', i, 'description', e.target.value)} placeholder="Descripción"
                                className="px-3 py-2 border border-border-card rounded-lg text-sm" />
                        </div>
                    </div>
                ))}
                <button onClick={() => addArrayItem('amenidades', { icon: 'home', title: 'Nueva Amenidad', description: 'Descripción' })}
                    className="flex items-center gap-2 px-4 py-2 text-primary hover:bg-primary/10 rounded-lg text-sm font-medium">
                    <span className="material-symbols-outlined">add</span>Agregar amenidad
                </button>
            </div>
        </div>
    )

    const renderCasaTab = () => (
        <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 border border-border-card">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-icon-color">home_work</span>
                    Destacados de la Casa
                </h3>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-text-muted mb-1">Título de Sección</label>
                            <input type="text" value={content.destacados?.title || ''} onChange={e => setContent(prev => ({ ...prev, destacados: { ...prev.destacados, title: e.target.value } }))}
                                className="w-full px-3 py-2 border border-border-card rounded-lg text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-muted mb-1">Subtítulo</label>
                            <input type="text" value={content.destacados?.subtitle || ''} onChange={e => setContent(prev => ({ ...prev, destacados: { ...prev.destacados, subtitle: e.target.value } }))}
                                className="w-full px-3 py-2 border border-border-card rounded-lg text-sm" />
                        </div>
                    </div>
                    <div className="space-y-3">
                        {(content.destacados?.items || []).map((item, i) => (
                            <div key={i} className="p-4 bg-surface-light rounded-lg space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="font-medium text-sm text-text-muted">Destacado {i + 1}</span>
                                    <button onClick={() => {
                                        const items = [...(content.destacados?.items || [])]
                                        items.splice(i, 1)
                                        setContent(prev => ({ ...prev, destacados: { ...prev.destacados, items } }))
                                    }} className="text-gray-500 hover:bg-gray-100 p-1 rounded">
                                        <span className="material-symbols-outlined text-sm">delete</span>
                                    </button>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    <input type="text" value={item.icon} onChange={e => {
                                        const items = [...(content.destacados?.items || [])]
                                        items[i] = { ...items[i], icon: e.target.value }
                                        setContent(prev => ({ ...prev, destacados: { ...prev.destacados, items } }))
                                    }} placeholder="Icono" className="px-3 py-2 border border-border-card rounded-lg text-sm" />
                                    <input type="text" value={item.title} onChange={e => {
                                        const items = [...(content.destacados?.items || [])]
                                        items[i] = { ...items[i], title: e.target.value }
                                        setContent(prev => ({ ...prev, destacados: { ...prev.destacados, items } }))
                                    }} placeholder="Título" className="px-3 py-2 border border-border-card rounded-lg text-sm" />
                                    <input type="text" value={item.description} onChange={e => {
                                        const items = [...(content.destacados?.items || [])]
                                        items[i] = { ...items[i], description: e.target.value }
                                        setContent(prev => ({ ...prev, destacados: { ...prev.destacados, items } }))
                                    }} placeholder="Descripción" className="px-3 py-2 border border-border-card rounded-lg text-sm" />
                                </div>
                            </div>
                        ))}
                        <button onClick={() => {
                            const items = [...(content.destacados?.items || []), { icon: 'info', title: 'Nuevo Destacado', description: 'Descripción' }]
                            setContent(prev => ({ ...prev, destacados: { ...prev.destacados, items } }))
                        }} className="flex items-center gap-2 px-4 py-2 text-primary hover:bg-primary/10 rounded-lg text-sm font-medium">
                            <span className="material-symbols-outlined">add</span>Agregar destacado
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )

    const renderExploraTab = () => (
        <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 border border-border-card">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-icon-color">explore</span>
                    Explora el Sitio
                </h3>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-text-muted mb-1">Título de Sección</label>
                            <input type="text" value={content.exploraSitio?.title || ''} onChange={e => setContent(prev => ({ ...prev, exploraSitio: { ...prev.exploraSitio, title: e.target.value } }))}
                                className="w-full px-3 py-2 border border-border-card rounded-lg text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-muted mb-1">Subtítulo</label>
                            <input type="text" value={content.exploraSitio?.subtitle || ''} onChange={e => setContent(prev => ({ ...prev, exploraSitio: { ...prev.exploraSitio, subtitle: e.target.value } }))}
                                className="w-full px-3 py-2 border border-border-card rounded-lg text-sm" />
                        </div>
                    </div>
                    <div className="space-y-3">
                        {(content.exploraSitio?.items || []).map((item, i) => (
                            <div key={i} className="p-4 bg-surface-light rounded-lg space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="font-medium text-sm text-text-muted">{item.title}</span>
                                </div>
                                <div className="grid grid-cols-4 gap-3">
                                    <input type="text" value={item.path} onChange={e => {
                                        const items = [...(content.exploraSitio?.items || [])]
                                        items[i] = { ...items[i], path: e.target.value }
                                        setContent(prev => ({ ...prev, exploraSitio: { ...prev.exploraSitio, items } }))
                                    }} placeholder="Ruta" className="px-3 py-2 border border-border-card rounded-lg text-sm" />
                                    <input type="text" value={item.icon} onChange={e => {
                                        const items = [...(content.exploraSitio?.items || [])]
                                        items[i] = { ...items[i], icon: e.target.value }
                                        setContent(prev => ({ ...prev, exploraSitio: { ...prev.exploraSitio, items } }))
                                    }} placeholder="Icono" className="px-3 py-2 border border-border-card rounded-lg text-sm" />
                                    <input type="text" value={item.title} onChange={e => {
                                        const items = [...(content.exploraSitio?.items || [])]
                                        items[i] = { ...items[i], title: e.target.value }
                                        setContent(prev => ({ ...prev, exploraSitio: { ...prev.exploraSitio, items } }))
                                    }} placeholder="Título" className="px-3 py-2 border border-border-card rounded-lg text-sm" />
                                    <input type="text" value={item.description} onChange={e => {
                                        const items = [...(content.exploraSitio?.items || [])]
                                        items[i] = { ...items[i], description: e.target.value }
                                        setContent(prev => ({ ...prev, exploraSitio: { ...prev.exploraSitio, items } }))
                                    }} placeholder="Descripción" className="px-3 py-2 border border-border-card rounded-lg text-sm" />
                                </div>
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-text-muted">Las rutas están predefinidas y conectan con las páginas del sitio.</p>
                </div>
            </div>
        </div>
    )

    const renderRulesTab = () => (
        <div className="bg-white rounded-xl p-6 border border-border-card">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-icon-color">gavel</span>
                Normas de la Casa
            </h3>
            <div className="space-y-4">
                {content.rules.map((rule, i) => (
                    <div key={i} className="p-4 bg-surface-light rounded-lg space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="font-medium text-sm text-text-muted">Norma {i + 1}</span>
                            <button onClick={() => removeArrayItem('rules', i)} className="text-gray-500 hover:bg-gray-100 p-1 rounded">
                                <span className="material-symbols-outlined text-sm">delete</span>
                            </button>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            <input type="text" value={rule.icon} onChange={e => updateArrayItem('rules', i, 'icon', e.target.value)} placeholder="Icono"
                                className="px-3 py-2 border border-border-card rounded-lg text-sm" />
                            <input type="text" value={rule.title} onChange={e => updateArrayItem('rules', i, 'title', e.target.value)} placeholder="Título"
                                className="px-3 py-2 border border-border-card rounded-lg text-sm" />
                            <input type="text" value={rule.desc} onChange={e => updateArrayItem('rules', i, 'desc', e.target.value)} placeholder="Descripción"
                                className="px-3 py-2 border border-border-card rounded-lg text-sm" />
                        </div>
                    </div>
                ))}
                <button onClick={() => addArrayItem('rules', { icon: 'info', title: 'Nueva Norma', desc: 'Descripción' })}
                    className="flex items-center gap-2 px-4 py-2 text-primary hover:bg-primary/10 rounded-lg text-sm font-medium">
                    <span className="material-symbols-outlined">add</span>Agregar norma
                </button>
            </div>
        </div>
    )

    const renderWaterTab = () => (
        <div className="space-y-6">
            {/* Banner informativo sobre colores */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-success-text text-2xl">palette</span>
                    <div>
                        <p className="text-sm font-medium text-green-800">
                            Los colores de esta sección se editan en la pestaña <strong>"Colores"</strong>
                        </p>
                        <p className="text-xs text-success-text mt-0.5">
                            Busca "Sección Cuidado del Agua" para personalizar fondo, texto, tarjetas, ondas y badge.
                        </p>
                    </div>
                </div>
            </div>

            {/* Efectos Visuales */}
            <div className="bg-white rounded-xl p-6 border border-border-card">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-icon-color">settings</span>
                    Configuración
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <label className="flex items-center gap-3 p-3 bg-surface-light rounded-lg border border-border-card cursor-pointer hover:border-primary transition-colors">
                        <input
                            type="checkbox"
                            checked={content.waterConservation.showUrgencyBadge !== false}
                            onChange={e => updateContent('waterConservation.showUrgencyBadge', e.target.checked)}
                            className="w-5 h-5 text-primary rounded"
                        />
                        <div>
                            <span className="text-sm font-medium">🚨 Badge</span>
                            <p className="text-xs text-text-muted">Alerta de urgencia</p>
                        </div>
                    </label>
                    {/* Efecto Lluvia */}
                    <label className="flex items-center gap-3 p-3 bg-surface-light rounded-lg border border-border-card cursor-pointer hover:border-primary transition-colors">
                        <input
                            type="checkbox"
                            checked={content.waterConservation.showRain !== false}
                            onChange={e => updateContent('waterConservation.showRain', e.target.checked)}
                            className="w-5 h-5 text-primary rounded"
                        />
                        <div>
                            <span className="text-sm font-medium text-text-main-light">💧 Efecto Lluvia</span>
                            <p className="text-xs text-text-muted">Gotas de agua animadas</p>
                        </div>
                    </label>
                </div>

                {/* Rain Effect Settings - Clean white panel */}
                {content.waterConservation.showRain !== false && (
                    <div className="mt-4 p-4 bg-white rounded-lg border border-border-card">
                        <h4 className="text-sm font-bold text-text-main-light mb-3 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-lg">water_drop</span>
                            Configuración del Efecto Lluvia
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-text-main-light mb-1">Color</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={content.waterConservation.rainColor || '#3db814'}
                                        onChange={e => updateContent('waterConservation.rainColor', e.target.value)}
                                        className="w-10 h-10 border border-border-card rounded cursor-pointer"
                                    />
                                    <span className="text-xs text-text-muted font-mono">{content.waterConservation.rainColor || '#3db814'}</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-text-main-light mb-1">Cantidad</label>
                                <input
                                    type="number"
                                    min="10"
                                    max="80"
                                    value={content.waterConservation.rainCount || 40}
                                    onChange={e => updateContent('waterConservation.rainCount', parseInt(e.target.value))}
                                    className="w-full px-3 py-2 border border-border-card rounded-lg text-sm bg-white"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-text-main-light mb-1">Opacidad (%)</label>
                                <input
                                    type="number"
                                    min="20"
                                    max="100"
                                    value={content.waterConservation.rainOpacity || 50}
                                    onChange={e => updateContent('waterConservation.rainOpacity', parseInt(e.target.value))}
                                    className="w-full px-3 py-2 border border-border-card rounded-lg text-sm bg-white"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-text-main-light mb-1">Velocidad (s)</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={content.waterConservation.rainSpeed || 3}
                                    onChange={e => updateContent('waterConservation.rainSpeed', parseInt(e.target.value))}
                                    className="w-full px-3 py-2 border border-border-card rounded-lg text-sm bg-white"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Badge Text */}
                {content.waterConservation.showUrgencyBadge !== false && (
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-text-main-light mb-1">Texto del Badge de Urgencia</label>
                        <input
                            type="text"
                            value={content.waterConservation.urgencyBadgeText || 'ZONA DE ESCASEZ HÍDRICA'}
                            onChange={e => updateContent('waterConservation.urgencyBadgeText', e.target.value)}
                            className="w-full px-4 py-2 border border-border-card rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                    </div>
                )}
            </div>

            {/* Encabezado */}
            <div className="bg-white rounded-xl p-6 border border-border-card">
                <h3 className="font-bold text-lg mb-4">Encabezado</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-text-main-light mb-1">Título</label>
                        <input type="text" value={content.waterConservation.title} onChange={e => updateContent('waterConservation.title', e.target.value)}
                            className="w-full px-4 py-2 border border-border-card rounded-lg" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-main-light mb-1">Subtítulo</label>
                        <input type="text" value={content.waterConservation.subtitle} onChange={e => updateContent('waterConservation.subtitle', e.target.value)}
                            className="w-full px-4 py-2 border border-border-card rounded-lg" />
                    </div>
                </div>
            </div>
            <div className="bg-white rounded-xl p-6 border border-border-card">
                <h3 className="font-bold text-lg mb-4">Tips de Ahorro</h3>
                <div className="space-y-4">
                    {content.waterConservation.tips.map((tip, i) => (
                        <div key={i} className="p-4 bg-surface-light rounded-lg">
                            <div className="grid grid-cols-3 gap-3">
                                <input type="text" value={tip.icon} onChange={e => updateArrayItem('waterConservation.tips', i, 'icon', e.target.value)}
                                    placeholder="Icono" className="px-3 py-2 border border-border-card rounded-lg text-sm" />
                                <input type="text" value={tip.title} onChange={e => updateArrayItem('waterConservation.tips', i, 'title', e.target.value)}
                                    placeholder="Título" className="px-3 py-2 border border-border-card rounded-lg text-sm" />
                                <input type="text" value={tip.desc} onChange={e => updateArrayItem('waterConservation.tips', i, 'desc', e.target.value)}
                                    placeholder="Descripción" className="px-3 py-2 border border-border-card rounded-lg text-sm" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="bg-white rounded-xl p-6 border border-border-card">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-icon-color">priority_high</span>
                    Aviso Importante
                </h3>
                <p className="text-sm text-text-muted mb-3">Este mensaje aparece en la tarjeta destacada con el badge "IMPORTANTE"</p>
                <textarea
                    value={content.waterConservation.warningMessage || ''}
                    onChange={e => updateContent('waterConservation.warningMessage', e.target.value)}
                    rows={3}
                    placeholder="En esta zona el agua no es constante ni abundante..."
                    className="w-full px-4 py-2 border border-border-card rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
            </div>
        </div>
    )

    const renderLocationTab = () => {
        // Ensure stepsCarro and stepsBus exist (migrate from old 'steps' field if needed)
        const stepsCarro = content.location.stepsCarro || content.location.steps || []
        const stepsBus = content.location.stepsBus || []

        return (
            <div className="space-y-6">
                <div className="bg-white rounded-xl p-6 border border-border-card">
                    <h3 className="font-bold text-lg mb-4">Encabezado</h3>
                    <div className="space-y-4">
                        <input type="text" value={content.location.title} onChange={e => updateContent('location.title', e.target.value)}
                            placeholder="Título" className="w-full px-4 py-2 border border-border-card rounded-lg" />
                        <input type="text" value={content.location.subtitle} onChange={e => updateContent('location.subtitle', e.target.value)}
                            placeholder="Subtítulo" className="w-full px-4 py-2 border border-border-card rounded-lg" />
                    </div>
                </div>
                <div className="bg-white rounded-xl p-6 border border-border-card">
                    <h3 className="font-bold text-lg mb-4">Mapa e Imagen</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-text-main-light mb-1">URL del Mapa (embed)</label>
                            <input type="text" value={content.location.mapUrl} onChange={e => updateContent('location.mapUrl', e.target.value)}
                                className="w-full px-4 py-2 border border-border-card rounded-lg" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-main-light mb-1">Imagen de Referencia</label>
                            <input type="text" value={content.location.referenceImage} onChange={e => updateContent('location.referenceImage', e.target.value)}
                                className="w-full px-4 py-2 border border-border-card rounded-lg" />
                        </div>
                        <input type="text" value={content.location.roadCondition} onChange={e => updateContent('location.roadCondition', e.target.value)}
                            placeholder="Condición de la vía" className="w-full px-4 py-2 border border-border-card rounded-lg" />
                    </div>
                </div>

                {/* Waze and Maps Links */}
                <div className="bg-white rounded-xl p-6 border border-border-card">
                    <h3 className="font-bold text-lg mb-4">Enlaces de Navegación</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-text-main-light mb-1">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                    <path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.49.5.09.68-.22.68-.48v-1.71c-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02.8-.22 1.65-.33 2.5-.33.85 0 1.7.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48C19.14 20.16 22 16.42 22 12c0-5.52-4.48-10-10-10z" fill="#33CCFF" />
                                    <circle cx="8.5" cy="10" r="1.5" fill="#333" />
                                    <circle cx="15.5" cy="10" r="1.5" fill="#333" />
                                    <path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="#333" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                                Link de Waze
                            </label>
                            <input type="text" value={content.location.wazeUrl || ''} onChange={e => updateContent('location.wazeUrl', e.target.value)}
                                placeholder="https://waze.com/ul/..." className="w-full px-4 py-2 border border-border-card rounded-lg" />
                            <p className="text-xs text-text-muted mt-1">Abre la app de Waze con la ubicación</p>
                        </div>
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-text-main-light mb-1">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#EA4335" />
                                    <circle cx="12" cy="9" r="2.5" fill="white" />
                                </svg>
                                Link de Google Maps
                            </label>
                            <input type="text" value={content.location.mapsUrl || ''} onChange={e => updateContent('location.mapsUrl', e.target.value)}
                                placeholder="https://maps.google.com/..." className="w-full px-4 py-2 border border-border-card rounded-lg" />
                            <p className="text-xs text-text-muted mt-1">Abre la app de Google Maps con la ubicación</p>
                        </div>
                    </div>
                </div>

                {/* Instrucciones en Carro */}
                <div className="bg-white rounded-xl p-6 border border-border-card">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="material-symbols-outlined text-icon-color">directions_car</span>
                        <h3 className="font-bold text-lg">Instrucciones en Carro</h3>
                    </div>
                    <div className="space-y-4">
                        {stepsCarro.map((step, i) => (
                            <div key={i} className="p-4 bg-surface-light rounded-lg">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-text-muted">Paso {i + 1}</span>
                                    <button onClick={() => {
                                        const newSteps = stepsCarro.filter((_, idx) => idx !== i)
                                        updateContent('location.stepsCarro', newSteps)
                                    }} className="text-gray-500 hover:bg-gray-100 p-1 rounded">
                                        <span className="material-symbols-outlined text-sm">delete</span>
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <input type="text" value={step.title} onChange={e => {
                                        const newSteps = [...stepsCarro]
                                        newSteps[i] = { ...step, title: e.target.value }
                                        updateContent('location.stepsCarro', newSteps)
                                    }} placeholder="Título" className="px-3 py-2 border border-border-card rounded-lg text-sm" />
                                    <input type="text" value={step.desc} onChange={e => {
                                        const newSteps = [...stepsCarro]
                                        newSteps[i] = { ...step, desc: e.target.value }
                                        updateContent('location.stepsCarro', newSteps)
                                    }} placeholder="Descripción" className="px-3 py-2 border border-border-card rounded-lg text-sm" />
                                </div>
                            </div>
                        ))}
                        <button onClick={() => updateContent('location.stepsCarro', [...stepsCarro, { title: 'Nuevo paso', desc: 'Descripción' }])}
                            className="flex items-center gap-2 px-4 py-2 text-primary hover:bg-primary/10 rounded-lg text-sm font-medium">
                            <span className="material-symbols-outlined">add</span>Agregar paso
                        </button>
                    </div>
                </div>

                {/* Instrucciones en Bus */}
                <div className="bg-white rounded-xl p-6 border border-border-card">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="material-symbols-outlined text-gray-600">directions_bus</span>
                        <h3 className="font-bold text-lg">Instrucciones en Bus</h3>
                    </div>
                    <div className="space-y-4">
                        {stepsBus.map((step, i) => (
                            <div key={i} className="p-4 bg-gray-50 rounded-lg">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-text-muted">Paso {i + 1}</span>
                                    <button onClick={() => {
                                        const newSteps = stepsBus.filter((_, idx) => idx !== i)
                                        updateContent('location.stepsBus', newSteps)
                                    }} className="text-gray-500 hover:bg-gray-100 p-1 rounded">
                                        <span className="material-symbols-outlined text-sm">delete</span>
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <input type="text" value={step.title} onChange={e => {
                                        const newSteps = [...stepsBus]
                                        newSteps[i] = { ...step, title: e.target.value }
                                        updateContent('location.stepsBus', newSteps)
                                    }} placeholder="Título" className="px-3 py-2 border border-border-card rounded-lg text-sm" />
                                    <input type="text" value={step.desc} onChange={e => {
                                        const newSteps = [...stepsBus]
                                        newSteps[i] = { ...step, desc: e.target.value }
                                        updateContent('location.stepsBus', newSteps)
                                    }} placeholder="Descripción" className="px-3 py-2 border border-border-card rounded-lg text-sm" />
                                </div>
                            </div>
                        ))}
                        <button onClick={() => updateContent('location.stepsBus', [...stepsBus, { title: 'Nuevo paso', desc: 'Descripción' }])}
                            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg text-sm font-medium">
                            <span className="material-symbols-outlined">add</span>Agregar paso
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-border-card">
                    <h3 className="font-bold text-lg mb-4">Mensaje de Ayuda</h3>
                    <input type="text" value={content.location.helpMessage} onChange={e => updateContent('location.helpMessage', e.target.value)}
                        placeholder="Mensaje de ayuda" className="w-full px-4 py-2 border border-border-card rounded-lg" />
                </div>
            </div>
        )
    }

    const renderCheckoutTab = () => (
        <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 border border-border-card">
                <h3 className="font-bold text-lg mb-4">Encabezado</h3>
                <div className="grid grid-cols-2 gap-4">
                    <input type="text" value={content.antesDePartir.title} onChange={e => updateContent('antesDePartir.title', e.target.value)}
                        placeholder="Título" className="px-4 py-2 border border-border-card rounded-lg" />
                    <input type="text" value={content.antesDePartir.subtitle} onChange={e => updateContent('antesDePartir.subtitle', e.target.value)}
                        placeholder="Subtítulo" className="px-4 py-2 border border-border-card rounded-lg" />
                </div>
            </div>
            <div className="bg-white rounded-xl p-6 border border-border-card">
                <h3 className="font-bold text-lg mb-4">Items de Check-out</h3>
                <div className="space-y-4">
                    {content.antesDePartir.items.map((item, i) => (
                        <div key={i} className="p-4 bg-surface-light rounded-lg space-y-3">
                            <div className="flex justify-between">
                                <span className="font-medium text-sm text-text-muted">Item {i + 1}</span>
                                <label className="flex items-center gap-2 text-sm">
                                    <input type="checkbox" checked={item.isWarning} onChange={e => updateArrayItem('antesDePartir.items', i, 'isWarning', e.target.checked)} />
                                    Advertencia
                                </label>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <input type="text" value={item.icon} onChange={e => updateArrayItem('antesDePartir.items', i, 'icon', e.target.value)}
                                    placeholder="Icono" className="px-3 py-2 border border-border-card rounded-lg text-sm" />
                                <input type="text" value={item.title} onChange={e => updateArrayItem('antesDePartir.items', i, 'title', e.target.value)}
                                    placeholder="Título" className="px-3 py-2 border border-border-card rounded-lg text-sm" />
                                <input type="text" value={item.description} onChange={e => updateArrayItem('antesDePartir.items', i, 'description', e.target.value)}
                                    placeholder="Descripción" className="px-3 py-2 border border-border-card rounded-lg text-sm" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )

    const renderGuiaEncabezadoTab = () => (
        <div className="space-y-6">
            {/* Page Header Config */}
            <div className="bg-white rounded-xl p-6 border border-border-card">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-icon-color">title</span>
                    Encabezado de Página
                </h3>
                <p className="text-sm text-text-muted mb-4">
                    Este título y subtítulo aparecen en la parte superior de la página "Guía del Huésped".
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-text-main-light mb-1">Título de la Página</label>
                        <input type="text" value={guiaContent.pageTitle || ''}
                            onChange={e => setGuiaContent(prev => ({ ...prev, pageTitle: e.target.value }))}
                            placeholder="Guía del Huésped" className="w-full px-4 py-2 border border-border-card rounded-lg" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-main-light mb-1">Subtítulo</label>
                        <input type="text" value={guiaContent.pageSubtitle || ''}
                            onChange={e => setGuiaContent(prev => ({ ...prev, pageSubtitle: e.target.value }))}
                            placeholder="Todo lo que necesitas saber para tu estadía." className="w-full px-4 py-2 border border-border-card rounded-lg" />
                    </div>
                </div>
            </div>
        </div>
    )

    const renderContactoTab = () => (
        <div className="space-y-6">
            {/* Section Header Config */}
            <div className="bg-white rounded-xl p-6 border border-border-card">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-icon-color">title</span>
                    Encabezado de Sección
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-text-main-light mb-1">Título de la Sección</label>
                        <input type="text" value={content.contactoInicial.sectionTitle || ''} onChange={e => updateContent('contactoInicial.sectionTitle', e.target.value)}
                            placeholder="Contacto Inicial" className="w-full px-4 py-2 border border-border-card rounded-lg" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-main-light mb-1">Subtítulo</label>
                        <input type="text" value={content.contactoInicial.sectionSubtitle || ''} onChange={e => updateContent('contactoInicial.sectionSubtitle', e.target.value)}
                            placeholder="Coordina los detalles de tu llegada..." className="w-full px-4 py-2 border border-border-card rounded-lg" />
                    </div>
                </div>
            </div>
            <div className="bg-white rounded-xl p-6 border border-border-card">
                <h3 className="font-bold text-lg mb-4">Texto de Bienvenida</h3>
                <textarea value={content.contactoInicial.welcomeText} onChange={e => updateContent('contactoInicial.welcomeText', e.target.value)}
                    rows={3} className="w-full px-4 py-2 border border-border-card rounded-lg" />
            </div>

            {/* WhatsApp Configuration */}
            <div className="bg-white rounded-xl p-6 border border-border-card">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 fill-green-500" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                    Configuración de WhatsApp
                </h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-text-main-light mb-1">Texto del Botón</label>
                        <input type="text" value={content.contactoInicial.whatsappButtonText || ''}
                            onChange={e => updateContent('contactoInicial.whatsappButtonText', e.target.value)}
                            placeholder="Escribir por WhatsApp" className="w-full px-4 py-2 border border-border-card rounded-lg" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-main-light mb-1">Mensaje Predeterminado (lo que ve el usuario al abrir WhatsApp)</label>
                        <textarea value={content.contactoInicial.whatsappMessage || ''}
                            onChange={e => updateContent('contactoInicial.whatsappMessage', e.target.value)}
                            rows={2} placeholder="¡Hola! Acabo de hacer una reserva..."
                            className="w-full px-4 py-2 border border-border-card rounded-lg" />
                    </div>
                    <p className="text-xs text-text-muted flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">info</span>
                        El número de WhatsApp se configura en la pestaña "General"
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-border-card">
                <h3 className="font-bold text-lg mb-4">Items de Coordinación</h3>
                <div className="space-y-4">
                    {content.contactoInicial.items.map((item, i) => (
                        <div key={i} className="p-4 bg-surface-light rounded-lg grid grid-cols-3 gap-3">
                            <input type="text" value={item.icon} onChange={e => updateArrayItem('contactoInicial.items', i, 'icon', e.target.value)}
                                placeholder="Icono" className="px-3 py-2 border border-border-card rounded-lg text-sm" />
                            <input type="text" value={item.title} onChange={e => updateArrayItem('contactoInicial.items', i, 'title', e.target.value)}
                                placeholder="Título" className="px-3 py-2 border border-border-card rounded-lg text-sm" />
                            <input type="text" value={item.description} onChange={e => updateArrayItem('contactoInicial.items', i, 'description', e.target.value)}
                                placeholder="Descripción" className="px-3 py-2 border border-border-card rounded-lg text-sm" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )

    const renderPagosTab = () => (
        <div className="space-y-6">
            {/* Section Header Text */}
            <div className="bg-white rounded-xl p-6 border border-border-card">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-icon-color">text_fields</span>
                    Texto de la Sección (3 partes)
                </h3>
                <p className="text-sm text-text-muted mb-4">
                    El subtítulo se compone de 3 partes: texto inicial (negro), texto destacado (solo negrita), y texto final (negro).
                </p>
                <div className="space-y-4">
                    {/* Parte 1 - Texto inicial */}
                    <div>
                        <label className="block text-sm font-medium text-text-main-light mb-1">
                            1. Texto inicial (negro)
                        </label>
                        <textarea
                            value={paymentConfig.paymentSubtitlePart1}
                            onChange={e => setPaymentConfig(prev => ({ ...prev, paymentSubtitlePart1: e.target.value }))}
                            placeholder="Si tu reserva fue realizada a través de Airbnb..."
                            rows={3}
                            className="w-full px-4 py-2 border border-border-card rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                    </div>

                    {/* Parte 2 - Texto destacado */}
                    <div>
                        <label className="block text-sm font-medium text-text-main-light mb-1">
                            2. Texto destacado <span className="font-bold">(NEGRITA)</span>
                        </label>
                        <input
                            type="text"
                            value={paymentConfig.paymentSubtitleHighlight}
                            onChange={e => setPaymentConfig(prev => ({ ...prev, paymentSubtitleHighlight: e.target.value }))}
                            placeholder="ABONO OBLIGATORIO del 25 %"
                            className="w-full px-4 py-2 border border-border-card rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary font-bold"
                        />
                        <p className="text-xs text-text-muted mt-1">Este texto se mostrará resaltado en negrita</p>
                    </div>

                    {/* Parte 3 - Texto final */}
                    <div>
                        <label className="block text-sm font-medium text-text-main-light mb-1">
                            3. Texto final (negro)
                        </label>
                        <textarea
                            value={paymentConfig.paymentSubtitlePart2}
                            onChange={e => setPaymentConfig(prev => ({ ...prev, paymentSubtitlePart2: e.target.value }))}
                            placeholder="al momento de confirmar la reserva..."
                            rows={3}
                            className="w-full px-4 py-2 border border-border-card rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                    </div>

                    {/* Vista previa */}
                    <div className="mt-4 p-4 bg-surface-light rounded-lg border border-border-card">
                        <p className="text-xs font-medium text-text-muted mb-2">Vista Previa:</p>
                        <p className="text-sm text-text-main-light">
                            {paymentConfig.paymentSubtitlePart1}{' '}
                            <strong className="font-bold">{paymentConfig.paymentSubtitleHighlight}</strong>{' '}
                            {paymentConfig.paymentSubtitlePart2}
                        </p>
                    </div>
                </div>
            </div>

            {/* Nequi Config */}
            <div className="bg-white rounded-xl p-6 border border-border-card">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-icon-color">smartphone</span>
                    Datos de Nequi
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-text-main-light mb-1">Número de Nequi</label>
                        <input
                            type="text"
                            value={paymentConfig.paymentNequiNumber}
                            onChange={e => setPaymentConfig(prev => ({ ...prev, paymentNequiNumber: e.target.value }))}
                            placeholder="3001234567"
                            className="w-full px-4 py-2 border border-border-card rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-main-light mb-1">Nombre del Titular</label>
                        <input
                            type="text"
                            value={paymentConfig.paymentNequiName}
                            onChange={e => setPaymentConfig(prev => ({ ...prev, paymentNequiName: e.target.value }))}
                            placeholder="Nombre completo"
                            className="w-full px-4 py-2 border border-border-card rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                    </div>
                </div>
            </div>

            {/* B-Bre Config */}
            <div className="bg-white rounded-xl p-6 border border-border-card">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-gray-600">key</span>
                    Datos de B-Bre (Llave)
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-text-main-light mb-1">Correo Electrónico</label>
                        <input
                            type="email"
                            value={paymentConfig.paymentBbreEmail}
                            onChange={e => setPaymentConfig(prev => ({ ...prev, paymentBbreEmail: e.target.value }))}
                            placeholder="correo@ejemplo.com"
                            className="w-full px-4 py-2 border border-border-card rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-main-light mb-1">Teléfono</label>
                        <input
                            type="text"
                            value={paymentConfig.paymentBbrePhone}
                            onChange={e => setPaymentConfig(prev => ({ ...prev, paymentBbrePhone: e.target.value }))}
                            placeholder="3001234567"
                            className="w-full px-4 py-2 border border-border-card rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono"
                        />
                    </div>
                </div>
            </div>

            {/* WhatsApp Config */}
            <div className="bg-white rounded-xl p-6 border border-border-card">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#25D366]">chat</span>
                    WhatsApp - Enviar Comprobante
                </h3>
                <p className="text-sm text-text-muted mb-4">Los huéspedes podrán enviar su comprobante de pago por WhatsApp.</p>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-text-main-light mb-1">Número de WhatsApp</label>
                        <input
                            type="text"
                            value={paymentConfig.paymentWhatsappNumber}
                            onChange={e => setPaymentConfig(prev => ({ ...prev, paymentWhatsappNumber: e.target.value }))}
                            placeholder="573001234567"
                            className="w-full px-4 py-2 border border-border-card rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono"
                        />
                        <p className="text-xs text-text-muted mt-1">Incluye código de país (57 para Colombia)</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-main-light mb-1">Mensaje Predeterminado</label>
                        <textarea
                            value={paymentConfig.paymentWhatsappMessage}
                            onChange={e => setPaymentConfig(prev => ({ ...prev, paymentWhatsappMessage: e.target.value }))}
                            placeholder="Hola, adjunto mi comprobante..."
                            rows={2}
                            className="w-full px-4 py-2 border border-border-card rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                        />
                    </div>
                </div>
            </div>

            {/* Info */}
            <div className="bg-success-bg border border-green-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-success-text">info</span>
                    <div>
                        <p className="text-sm text-green-800 font-medium">Persistencia de Datos</p>
                        <p className="text-xs text-success-text mt-1">
                            Estos cambios se guardan permanentemente. No se perderán al reiniciar la aplicación.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )

    const renderZonasTab = () => (
        <div className="space-y-6">
            {['piscina', 'jacuzzi'].map(zona => (
                <div key={zona} className="bg-white rounded-xl p-6 border border-border-card">
                    <h3 className="font-bold text-lg mb-4 capitalize">{zona}</h3>
                    <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                            <input type="text" value={content.zonasHumedas[zona].title} onChange={e => updateContent(`zonasHumedas.${zona}.title`, e.target.value)}
                                placeholder="Título" className="px-4 py-2 border border-border-card rounded-lg" />
                            <input type="text" value={content.zonasHumedas[zona].subtitle} onChange={e => updateContent(`zonasHumedas.${zona}.subtitle`, e.target.value)}
                                placeholder="Subtítulo" className="px-4 py-2 border border-border-card rounded-lg" />
                            <input type="text" value={content.zonasHumedas[zona].badge} onChange={e => updateContent(`zonasHumedas.${zona}.badge`, e.target.value)}
                                placeholder="Badge" className="px-4 py-2 border border-border-card rounded-lg" />
                        </div>
                        <p className="text-sm font-medium text-text-muted">Reglas:</p>
                        {content.zonasHumedas[zona].rules.map((rule, i) => (
                            <div key={i} className="grid grid-cols-2 gap-3 p-3 bg-surface-light rounded-lg">
                                <input type="text" value={rule.icon} onChange={e => {
                                    const newRules = [...content.zonasHumedas[zona].rules]
                                    newRules[i] = { ...newRules[i], icon: e.target.value }
                                    updateContent(`zonasHumedas.${zona}.rules`, newRules)
                                }} placeholder="Icono" className="px-3 py-2 border border-border-card rounded-lg text-sm" />
                                <input type="text" value={rule.text} onChange={e => {
                                    const newRules = [...content.zonasHumedas[zona].rules]
                                    newRules[i] = { ...newRules[i], text: e.target.value }
                                    updateContent(`zonasHumedas.${zona}.rules`, newRules)
                                }} placeholder="Texto" className="px-3 py-2 border border-border-card rounded-lg text-sm" />
                            </div>
                        ))}
                    </div>
                </div>
            ))}
            <div className="bg-white rounded-xl p-6 border border-border-card">
                <h3 className="font-bold text-lg mb-4">Mensaje Inferior</h3>
                <textarea value={content.zonasHumedas.bottomMessage} onChange={e => updateContent('zonasHumedas.bottomMessage', e.target.value)}
                    rows={2} className="w-full px-4 py-2 border border-border-card rounded-lg" />
            </div>
        </div>
    )

    const renderGaleriaTab = () => {
        const categories = [
            { id: 'externas', label: 'Áreas Externas', icon: 'landscape' },
            { id: 'internas', label: 'Áreas Internas', icon: 'chair' },
            { id: 'humedas', label: 'Zonas Húmedas', icon: 'pool' }
        ]

        return (
            <div className="space-y-6">
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-gray-500">info</span>
                        <div>
                            <p className="text-sm text-gray-800 font-medium">Editor de Etiquetas de Galería</p>
                            <p className="text-xs text-gray-600 mt-1">
                                Modifica el nombre y etiqueta que aparecen en cada imagen de la galería. Deja en blanco para usar el valor predeterminado.
                            </p>
                        </div>
                    </div>
                </div>

                {categories.map(cat => (
                    <div key={cat.id} className="bg-white rounded-xl p-6 border border-border-card">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="material-symbols-outlined text-icon-color">{cat.icon}</span>
                            <h3 className="font-bold text-lg">{cat.label}</h3>
                            <span className="text-xs bg-icon-bg-primary px-2 py-1 rounded-full text-text-muted">
                                {GALLERY_IMAGES.filter(img => img.category === cat.id).length} imágenes
                            </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {GALLERY_IMAGES.filter(img => img.category === cat.id).map(img => (
                                <div key={img.id} className="p-3 bg-surface-light rounded-lg border border-border-card">
                                    <p className="text-xs text-text-muted mb-2 font-mono">{img.id}</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="text-xs text-text-muted block mb-1">Nombre</label>
                                            <input
                                                type="text"
                                                value={galeriaLabels[img.id]?.title || ''}
                                                onChange={e => updateGaleriaLabel(img.id, 'title', e.target.value)}
                                                placeholder={img.defaultTitle}
                                                className="w-full px-3 py-2 border border-border-card rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-text-muted block mb-1">Etiqueta</label>
                                            <input
                                                type="text"
                                                value={galeriaLabels[img.id]?.label || ''}
                                                onChange={e => updateGaleriaLabel(img.id, 'label', e.target.value)}
                                                placeholder={img.defaultLabel}
                                                className="w-full px-3 py-2 border border-border-card rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    // Función para actualizar fuente
    const updateFont = (key, value) => {
        setSiteFonts(prev => ({ ...prev, [key]: value }))
        // Aplicar fuente inmediatamente al DOM
        if (key === 'fontGlobal') {
            document.documentElement.style.setProperty('--font-display', `"${value}", sans-serif`)
        }
    }

    const renderTipografiaTab = () => {
        return (
            <div className="space-y-6">
                {/* Info Banner */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(to bottom right, #2a8a0e, #1b4332)' }}>
                            <span className="material-symbols-outlined text-white text-2xl">text_format</span>
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-lg text-gray-900">Personalización de Tipografía</h3>
                            <p className="text-sm text-text-muted mt-1">
                                Selecciona la tipografía global para todo el sitio.
                                Las 10 fuentes disponibles son las más populares y legibles para páginas web.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Tipografía Global */}
                <div className="bg-white rounded-xl p-6 border border-border-card">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary">font_download</span>
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-gray-900">Tipografía Global</h3>
                            <p className="text-sm text-text-muted">Esta fuente se aplicará a TODA la página</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {FONT_OPTIONS.map(font => (
                            <button
                                key={font.id}
                                onClick={() => updateFont('fontGlobal', font.id)}
                                className={`p-4 rounded-xl border-2 transition-all text-left ${siteFonts.fontGlobal === font.id
                                    ? 'border-primary bg-primary/5 shadow-lg'
                                    : 'border-border-card hover:border-primary/50 hover:bg-surface-light'
                                    }`}
                            >
                                <p
                                    className="text-lg font-bold mb-1 text-gray-900"
                                    style={{ fontFamily: `"${font.id}", sans-serif` }}
                                >
                                    {font.name}
                                </p>
                                <p className="text-[10px] text-text-muted">{font.preview}</p>
                                {siteFonts.fontGlobal === font.id && (
                                    <span className="material-symbols-outlined text-primary text-sm mt-2 block">check_circle</span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Vista Previa */}
                <div className="bg-white rounded-xl p-6 border border-border-card">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-text-muted">visibility</span>
                        Vista Previa
                    </h3>
                    <div
                        className="p-6 bg-surface-light rounded-xl space-y-4"
                        style={{ fontFamily: `"${siteFonts.fontGlobal}", sans-serif` }}
                    >
                        <h1 className="text-3xl font-black text-gray-900">Título Principal de Ejemplo</h1>
                        <h2 className="text-xl font-bold text-gray-800">Subtítulo de Sección</h2>
                        <p className="text-base text-gray-700">
                            Este es un párrafo de ejemplo para ver cómo se ve el texto normal
                            con la tipografía seleccionada. La fuente <strong>{siteFonts.fontGlobal}</strong> se
                            aplicará a todo el contenido de la página.
                        </p>
                        <div className="flex gap-3">
                            <button className="px-4 py-2 bg-primary text-white rounded-lg font-bold">
                                Botón Ejemplo
                            </button>
                            <button className="px-4 py-2 border border-border-card rounded-lg font-medium text-gray-700">
                                Botón Secundario
                            </button>
                        </div>
                        <div className="p-3 bg-gray-100 border border-gray-200 rounded-lg">
                            <p className="text-sm text-gray-700">
                                <span className="material-symbols-outlined text-gray-500 text-sm align-middle mr-1">info</span>
                                Este es un aviso de ejemplo con la tipografía seleccionada.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    const renderColoresTab = () => {
        // Categorías de colores organizadas
        const colorCategories = {
            tarjetas: {
                label: 'Tarjetas',
                icon: 'dashboard',
                description: 'Fondos, bordes, sombras y efectos hover de todas las tarjetas/cards',
                colors: [
                    { key: 'surfaceCard', label: 'Fondo Tarjetas', desc: 'Fondo principal de cards y paneles' },
                    { key: 'surfaceCardHover', label: 'Tarjetas Hover', desc: 'Fondo al pasar el mouse' },
                    { key: 'surfaceCardDark', label: 'Tarjetas Oscuro', desc: 'Fondo en modo oscuro' },
                    { key: 'borderCard', label: 'Borde Tarjetas', desc: 'Contorno de cards e inputs' },
                    { key: 'borderCardDark', label: 'Borde Oscuro', desc: 'Contorno en modo oscuro' },
                    { key: 'cardShadow', label: 'Sombra Tarjetas', desc: 'Color de sombras en botones y cards' }
                ]
            },
            iconos: {
                label: 'Iconos',
                icon: 'interests',
                description: 'Color del símbolo, fondos y bordes de todos los iconos',
                colors: [
                    { key: 'iconColor', label: 'Color del Icono', desc: 'Color del símbolo (verde)' },
                    { key: 'iconColorSecondary', label: 'Color Secundario', desc: 'Símbolos secundarios' },
                    { key: 'iconColorDark', label: 'Color Modo Oscuro', desc: 'Símbolo en tema oscuro' },
                    { key: 'iconBgPrimary', label: 'Fondo Principal', desc: 'Fondo de iconos' },
                    { key: 'iconBgSecondary', label: 'Fondo Secundario', desc: 'Fondo alternativo' },
                    { key: 'iconBgDark', label: 'Fondo Oscuro', desc: 'Fondo en modo oscuro' },
                    { key: 'iconBorder', label: 'Borde de Iconos', desc: 'Contorno de iconos' }
                ]
            },
            fondos: {
                label: 'Fondos',
                icon: 'format_color_fill',
                description: 'Fondos de páginas, secciones, navbar y footer',
                colors: [
                    { key: 'pageBgInicio', label: 'Página Inicio', desc: 'Fondo de la página de inicio' },
                    { key: 'pageBgReservas', label: 'Página Reservas', desc: 'Fondo de reservas' },
                    { key: 'pageBgGaleria', label: 'Página Galería', desc: 'Fondo de galería' },
                    { key: 'pageBgRegistro', label: 'Página Registro', desc: 'Fondo de registro' },
                    { key: 'pageBgGuia', label: 'Página Guía', desc: 'Fondo de información' },
                    { key: 'pageBgAdmin', label: 'Panel Admin', desc: 'Fondo de administración' },
                    { key: 'surfaceSection', label: 'Fondo Secciones', desc: 'Secciones alternas' },
                    { key: 'surfaceLight', label: 'Fondo Claro', desc: 'Fondos suaves' },
                    { key: 'surfaceNav', label: 'Navbar', desc: 'Barra de navegación' },
                    { key: 'surfaceFooter', label: 'Footer', desc: 'Pie de página' }
                ]
            },
            textos: {
                label: 'Textos',
                icon: 'text_fields',
                description: 'Títulos, subtítulos, enlaces, texto destacado y texto sobre botones',
                colors: [
                    { key: 'textMain', label: 'Texto Principal', desc: 'Cuerpo y contenido general' },
                    { key: 'textTitle', label: 'Títulos', desc: 'Encabezados y títulos' },
                    { key: 'textMuted', label: 'Texto Secundario', desc: 'Descripciones y labels' },
                    { key: 'textSubtitle', label: 'Subtítulos', desc: 'Texto debajo de títulos' },
                    { key: 'textSubtitleDark', label: 'Subtítulos Oscuro', desc: 'Subtítulos modo oscuro' },
                    { key: 'textLink', label: 'Enlaces', desc: 'Texto clickeable y links' },
                    { key: 'textAccent', label: 'Texto Destacado', desc: 'Texto resaltado/énfasis' },
                    { key: 'textOnPrimary', label: 'Texto en Botones', desc: 'Texto blanco sobre botones' },
                    { key: 'badgeText', label: 'Texto Badges', desc: 'Texto en etiquetas' }
                ]
            },
            botones: {
                label: 'Botones',
                icon: 'smart_button',
                description: 'Botones de acción y badges/etiquetas',
                colors: [
                    { key: 'btnPrimary', label: 'Botón Principal', desc: 'Fondo de botones' },
                    { key: 'btnPrimaryHover', label: 'Botón Hover', desc: 'Al pasar mouse' },
                    { key: 'badgeBg', label: 'Fondo Badge', desc: 'Fondo de etiquetas' }
                ]
            },
            alertas: {
                label: 'Alertas',
                icon: 'notifications',
                description: 'Banners de advertencia, información, éxito y error',
                colors: [
                    { key: 'warningBg', label: 'Advertencia - Fondo', desc: 'Fondo banner amarillo' },
                    { key: 'warningText', label: 'Advertencia - Texto', desc: 'Texto del mensaje' },
                    { key: 'warningIcon', label: 'Advertencia - Icono', desc: 'Color del icono' },
                    { key: 'warningBorder', label: 'Advertencia - Borde', desc: 'Borde del banner' },
                    { key: 'infoBg', label: 'Info - Fondo', desc: 'Fondo banner azul' },
                    { key: 'infoText', label: 'Info - Texto', desc: 'Texto del mensaje' },
                    { key: 'infoIcon', label: 'Info - Icono', desc: 'Color del icono' },
                    { key: 'infoBorder', label: 'Info - Borde', desc: 'Borde del banner' },
                    { key: 'successBg', label: 'Éxito - Fondo', desc: 'Fondo banner verde' },
                    { key: 'successText', label: 'Éxito - Texto', desc: 'Texto del mensaje' },
                    { key: 'successIcon', label: 'Éxito - Icono', desc: 'Color del icono' },
                    { key: 'successBorder', label: 'Éxito - Borde', desc: 'Borde del banner' },
                    { key: 'errorBg', label: 'Error - Fondo', desc: 'Fondo banner rojo' },
                    { key: 'errorText', label: 'Error - Texto', desc: 'Texto del mensaje' },
                    { key: 'errorIcon', label: 'Error - Icono', desc: 'Color del icono' },
                    { key: 'errorBorder', label: 'Error - Borde', desc: 'Borde del banner' }
                ]
            },
            plataformas: {
                label: 'Plataformas',
                icon: 'travel_explore',
                description: 'Colores para identificar origen de reservas',
                colors: [
                    { key: 'platformAirbnb', label: 'Airbnb', desc: 'Reservas de Airbnb' },
                    { key: 'platformBooking', label: 'Booking', desc: 'Reservas de Booking' },
                    { key: 'platformGoogle', label: 'Google', desc: 'Reservas de Google' },
                    { key: 'platformDirecta', label: 'Directa', desc: 'Reservas directas' },
                    { key: 'navWaze', label: 'Waze', desc: 'Icono Waze en ubicación' },
                    { key: 'navMaps', label: 'Google Maps', desc: 'Icono Maps en ubicación' }
                ]
            }
        }

        const currentCategory = colorCategories[colorCategory] || colorCategories.tarjetas

        return (
            <div className="space-y-6">
                {/* Info Banner */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(to bottom right, #1b4332, #1e2e1a)' }}>
                            <span className="material-symbols-outlined text-white text-2xl">palette</span>
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-lg text-gray-900">Personalización de Colores</h3>
                            <p className="text-sm text-text-muted mt-1">
                                Modifica los colores principales del sitio. Los cambios se aplican en tiempo real al guardar.
                                Usa el selector de color o ingresa un código hexadecimal.
                            </p>
                        </div>
                        <button
                            onClick={resetColors}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-border-card rounded-lg text-sm font-medium text-text-main-light hover:bg-surface-light transition-colors"
                        >
                            <span className="material-symbols-outlined text-lg">restart_alt</span>
                            Restaurar Por Defecto
                        </button>
                    </div>
                </div>

                {/* Category Tabs - Sub-navigation */}
                <div className="bg-white rounded-xl border border-border-card overflow-hidden">
                    <div className="flex flex-wrap border-b border-border-card">
                        {Object.entries(colorCategories).map(([key, cat]) => (
                            <button
                                key={key}
                                onClick={() => setColorCategory(key)}
                                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all border-b-2 ${colorCategory === key
                                    ? 'border-primary text-primary bg-green-50'
                                    : 'border-transparent text-text-muted hover:text-primary hover:bg-gray-50'
                                    }`}
                            >
                                <span className="material-symbols-outlined text-lg">{cat.icon}</span>
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    {/* Category Content */}
                    <div className="p-6">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                <span className="material-symbols-outlined text-icon-color">{currentCategory.icon}</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-900">{currentCategory.label}</h3>
                                <p className="text-sm text-text-muted">{currentCategory.description}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {currentCategory.colors.map(color => (
                                <div key={color.key} className="p-4 bg-surface-light rounded-xl border border-border-card">
                                    <div className="flex items-center justify-between mb-3">
                                        <div>
                                            <p className="font-medium text-gray-900">{color.label}</p>
                                            <p className="text-xs text-text-muted">{color.desc}</p>
                                        </div>
                                        <div
                                            className="w-10 h-10 rounded-lg border-2 border-white shadow-md"
                                            style={{ backgroundColor: siteColors[color.key] }}
                                        />
                                    </div>
                                    <PaletteColorPicker
                                        value={siteColors[color.key]}
                                        onChange={(newColor) => updateColor(color.key, newColor)}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Preview Section */}
                <div className="bg-white rounded-xl p-6 border border-border-card">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-text-muted">visibility</span>
                        Vista Previa
                    </h3>
                    <div className="space-y-4">
                        {/* Primary Button Preview */}
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-text-muted w-32">Botón Primario:</span>
                            <button
                                className="px-6 py-2 rounded-lg font-bold text-white transition-all"
                                style={{ backgroundColor: siteColors.primary }}
                            >
                                Botón de Ejemplo
                            </button>
                        </div>
                        {/* Info Box Preview */}
                        <div className="flex items-start gap-4">
                            <span className="text-sm text-text-muted w-32">Caja de Info:</span>
                            <div
                                className="flex-1 p-4 rounded-xl flex items-start gap-3"
                                style={{ backgroundColor: siteColors.accentInfo }}
                            >
                                <span
                                    className="material-symbols-outlined"
                                    style={{ color: siteColors.accentInfoIcon }}
                                >info</span>
                                <p className="text-sm" style={{ color: siteColors.accentInfoText }}>
                                    Este es un mensaje de información de ejemplo.
                                </p>
                            </div>
                        </div>
                        {/* Surface Info Preview */}
                        <div className="flex items-start gap-4">
                            <span className="text-sm text-text-muted w-32">Fondo Info:</span>
                            <div
                                className="flex-1 p-4 rounded-xl flex items-start gap-3 border"
                                style={{ backgroundColor: siteColors.surfaceInfo, borderColor: siteColors.primaryLight }}
                            >
                                <div
                                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                                    style={{ backgroundColor: siteColors.iconBg }}
                                >
                                    <span className="material-symbols-outlined text-lg" style={{ color: siteColors.primary }}>check</span>
                                </div>
                                <p className="text-sm text-gray-800 pt-1">
                                    Este es el fondo usado en secciones informativas como Zonas Húmedas.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // ===== RENDER: TAB FOOTER =====
    const renderFooterTab = () => (
        <div className="space-y-6 max-w-4xl">
            <div className="bg-white rounded-xl p-6 border border-border-card">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-icon-color">bottom_navigation</span>
                    Configuración del Footer
                </h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-text-main-light mb-1">Icono (Material Symbols)</label>
                        <div className="flex gap-3 items-center">
                            <input type="text" value={content.footer?.icon || 'nature_people'}
                                onChange={e => updateContent('footer.icon', e.target.value)}
                                placeholder="nature_people" className="flex-1 px-4 py-2 border border-border-card rounded-lg" />
                            <div className="w-12 h-12 rounded-lg bg-icon-bg-primary flex items-center justify-center">
                                <span className="material-symbols-outlined text-2xl text-text-muted">{content.footer?.icon || 'nature_people'}</span>
                            </div>
                        </div>
                        <p className="text-xs text-text-muted mt-1">
                            Busca iconos en <a href="https://fonts.google.com/icons" target="_blank" rel="noopener noreferrer" className="text-primary underline">Google Material Symbols</a>
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-main-light mb-1">Correo Electrónico</label>
                        <input type="email" value={content.footer?.email || ''}
                            onChange={e => updateContent('footer.email', e.target.value)}
                            placeholder="contacto@tudominio.com" className="w-full px-4 py-2 border border-border-card rounded-lg" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-main-light mb-1">Texto de Copyright</label>
                        <input type="text" value={content.footer?.copyright || '© 2024 Reserva de las Sierras. Todos los derechos reservados.'}
                            onChange={e => updateContent('footer.copyright', e.target.value)}
                            className="w-full px-4 py-2 border border-border-card rounded-lg" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-main-light mb-1">Powered by</label>
                        <input type="text" value={content.footer?.poweredBy || ''}
                            onChange={e => updateContent('footer.poweredBy', e.target.value)}
                            placeholder="Ingenierocante" className="w-full px-4 py-2 border border-border-card rounded-lg" />
                        <p className="text-xs text-text-muted mt-1">Deja vacío para ocultar esta línea</p>
                    </div>
                    <label className="flex items-center gap-3 p-3 bg-surface-light rounded-lg cursor-pointer">
                        <input type="checkbox" checked={content.footer?.showAdmin !== false}
                            onChange={e => updateContent('footer.showAdmin', e.target.checked)}
                            className="w-5 h-5 text-primary rounded" />
                        <div>
                            <span className="font-medium">Mostrar link "Admin"</span>
                            <p className="text-xs text-text-muted">Muestra el acceso al panel de administración en el footer</p>
                        </div>
                    </label>
                </div>
            </div>

            {/* Configuración del Overlay */}
            <div className="bg-white rounded-xl p-6 border border-border-card">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-icon-color">gradient</span>
                    Configuración del Filtro de Imagen
                </h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-text-main-light mb-1">Color del Filtro</label>
                        <PaletteColorPicker
                            value={content.footer?.overlayColor || '#2f4858'}
                            onChange={(color) => updateContent('footer.overlayColor', color)}
                        />
                        <p className="text-xs text-text-muted mt-1">Color que se superpone sobre la imagen de fondo</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-main-light mb-2">
                            Opacidad del Filtro: <span className="text-primary font-bold">{content.footer?.overlayOpacity ?? 70}%</span>
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={content.footer?.overlayOpacity ?? 70}
                            onChange={e => updateContent('footer.overlayOpacity', parseInt(e.target.value))}
                            className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                        <div className="flex justify-between text-xs text-text-muted mt-1">
                            <span>0% (Solo imagen)</span>
                            <span>100% (Solo color)</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Configuración de Logos */}
            <div className="bg-white rounded-xl p-6 border border-border-card">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-icon-color">branding_watermark</span>
                    Tamaño del Logo en Footer
                </h3>
                <div>
                    <label className="block text-sm font-medium text-text-main-light mb-2">
                        Tamaño: <span className="text-primary font-bold">{content.footer?.logoSize || 8}vh</span>
                        <span className="text-text-muted ml-2">(% altura de pantalla - responsivo)</span>
                    </label>
                    <input
                        type="range"
                        min="3"
                        max="15"
                        step="1"
                        value={content.footer?.logoSize || 8}
                        onChange={e => updateContent('footer.logoSize', parseInt(e.target.value))}
                        className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <div className="flex justify-between text-[10px] text-text-muted mt-1">
                        <span>Pequeño (3vh)</span>
                        <span>Grande (15vh)</span>
                    </div>
                </div>
            </div>

            {/* Preview */}
            <div className="bg-white rounded-xl p-6 border border-border-card">
                <h3 className="font-bold text-lg mb-4">Vista Previa</h3>
                <div
                    className="relative rounded-lg overflow-hidden"
                    style={{ minHeight: '140px' }}
                >
                    {/* Background image preview */}
                    <div className="absolute inset-0 bg-gradient-to-br from-green-800 to-green-600"></div>
                    {/* Overlay preview */}
                    <div
                        className="absolute inset-0"
                        style={{
                            backgroundColor: content.footer?.overlayColor || '#2f4858',
                            opacity: (content.footer?.overlayOpacity ?? 70) / 100
                        }}
                    ></div>
                    {/* Content preview */}
                    <div className="relative z-10 p-6 text-center">
                        <div className="flex items-center justify-center gap-2 mb-2 text-white/90">
                            <span className="material-symbols-outlined text-2xl">{content.footer?.icon || 'nature_people'}</span>
                        </div>
                        <div className="flex justify-center gap-4 mb-3 text-sm font-medium text-white/80">
                            <span>Inicio</span>
                            <span>Galería</span>
                            <span>Reservas</span>
                            <span>Registro</span>
                            {content.footer?.showAdmin !== false && <span>Admin</span>}
                        </div>
                        <p className="text-sm text-white/80 mb-1">{content.footer?.copyright || '© 2024 Reserva de las Sierras. Todos los derechos reservados.'}</p>
                        {content.footer?.email && (
                            <p className="text-sm text-white/80 mb-1">{content.footer.email}</p>
                        )}
                        {content.footer?.poweredBy && (
                            <p className="text-xs text-white/60">Powered by <span className="font-medium text-white/80">{content.footer.poweredBy}</span></p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )

    // ===== RENDER: TAB REGISTRO =====
    const renderRegistroTab = () => {
        return (
            <div className="space-y-6 max-w-4xl">
                <div className="bg-white rounded-xl p-6 border border-border-card">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-icon-color">edit_document</span>
                        Textos de la Página de Registro
                    </h3>
                    <div className="grid gap-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-text-main-light mb-1">Título Principal</label>
                                <input type="text" value={registroContent.pageTitle}
                                    onChange={(e) => setRegistroContent(prev => ({ ...prev, pageTitle: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-main-light mb-1">Subtítulo</label>
                                <input type="text" value={registroContent.pageSubtitle}
                                    onChange={(e) => setRegistroContent(prev => ({ ...prev, pageSubtitle: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                            </div>
                        </div>

                        <div className="border-t pt-4 mt-2">
                            <h4 className="font-bold text-gray-800 mb-3">Pasos del Formulario</h4>
                            {[1, 2, 3, 4].map(step => (
                                <div key={step} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3 p-3 bg-surface-light rounded-lg">
                                    <div>
                                        <label className="block text-xs font-medium text-text-muted mb-1">Paso {step} - Título</label>
                                        <input type="text" value={registroContent[`step${step}Title`]}
                                            onChange={(e) => setRegistroContent(prev => ({ ...prev, [`step${step}Title`]: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-text-muted mb-1">Paso {step} - Subtítulo</label>
                                        <input type="text" value={registroContent[`step${step}Subtitle`]}
                                            onChange={(e) => setRegistroContent(prev => ({ ...prev, [`step${step}Subtitle`]: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="border-t pt-4 mt-2">
                            <h4 className="font-bold text-gray-800 mb-3">Mensaje de Éxito</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-text-main-light mb-1">Título de Éxito</label>
                                    <input type="text" value={registroContent.successTitle}
                                        onChange={(e) => setRegistroContent(prev => ({ ...prev, successTitle: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-main-light mb-1">Mensaje de Éxito</label>
                                    <input type="text" value={registroContent.successMessage}
                                        onChange={(e) => setRegistroContent(prev => ({ ...prev, successMessage: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // ===== RENDER: TAB RESERVAS =====
    const renderReservasTab = () => {
        return (
            <div className="space-y-6 max-w-4xl">
                <div className="bg-white rounded-xl p-6 border border-border-card">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-icon-color">calendar_month</span>
                        Textos de la Página de Reservas
                    </h3>
                    <div className="grid gap-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-text-main-light mb-1">Título Principal</label>
                                <input type="text" value={reservasContent.pageTitle}
                                    onChange={(e) => setReservasContent(prev => ({ ...prev, pageTitle: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-main-light mb-1">Subtítulo</label>
                                <input type="text" value={reservasContent.pageSubtitle}
                                    onChange={(e) => setReservasContent(prev => ({ ...prev, pageSubtitle: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                            </div>
                        </div>

                        <div className="border-t pt-4 mt-2">
                            <h4 className="font-bold text-gray-800 mb-3">Calendario</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-text-main-light mb-1">Indicador de Paso</label>
                                    <input type="text" value={reservasContent.stepIndicator}
                                        onChange={(e) => setReservasContent(prev => ({ ...prev, stepIndicator: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-main-light mb-1">Etiqueta del Paso</label>
                                    <input type="text" value={reservasContent.stepLabel}
                                        onChange={(e) => setReservasContent(prev => ({ ...prev, stepLabel: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-main-light mb-1">Texto Cargando</label>
                                    <input type="text" value={reservasContent.calendarLoading}
                                        onChange={(e) => setReservasContent(prev => ({ ...prev, calendarLoading: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                                </div>
                            </div>
                        </div>

                        <div className="border-t pt-4 mt-2">
                            <h4 className="font-bold text-gray-800 mb-3">Tarifas</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-text-main-light mb-1">Título de Tarifas</label>
                                    <input type="text" value={reservasContent.tarifasTitle}
                                        onChange={(e) => setReservasContent(prev => ({ ...prev, tarifasTitle: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-main-light mb-1">Etiqueta Entre Semana</label>
                                    <input type="text" value={reservasContent.weekdayLabel}
                                        onChange={(e) => setReservasContent(prev => ({ ...prev, weekdayLabel: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-main-light mb-1">Descripción Entre Semana</label>
                                    <input type="text" value={reservasContent.weekdayDesc}
                                        onChange={(e) => setReservasContent(prev => ({ ...prev, weekdayDesc: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-main-light mb-1">Etiqueta Fin de Semana</label>
                                    <input type="text" value={reservasContent.weekendLabel}
                                        onChange={(e) => setReservasContent(prev => ({ ...prev, weekendLabel: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-main-light mb-1">Descripción Fin de Semana</label>
                                    <input type="text" value={reservasContent.weekendDesc}
                                        onChange={(e) => setReservasContent(prev => ({ ...prev, weekendDesc: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-main-light mb-1">Botón Continuar</label>
                                    <input type="text" value={reservasContent.continueButton}
                                        onChange={(e) => setReservasContent(prev => ({ ...prev, continueButton: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // ===== RENDER: TAB GALERIA (PÁGINA) =====
    const renderGaleriaPageTab = () => {
        return (
            <div className="space-y-6 max-w-4xl">
                <div className="bg-white rounded-xl p-6 border border-border-card">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-icon-color">photo_library</span>
                        Textos de la Página de Galería
                    </h3>
                    <div className="grid gap-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-text-main-light mb-1">Título Principal</label>
                                <input type="text" value={galeriaContent.pageTitle}
                                    onChange={(e) => setGaleriaContent(prev => ({ ...prev, pageTitle: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-main-light mb-1">Subtítulo</label>
                                <input type="text" value={galeriaContent.pageSubtitle}
                                    onChange={(e) => setGaleriaContent(prev => ({ ...prev, pageSubtitle: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                            </div>
                        </div>

                        <div className="border-t pt-4 mt-2">
                            <h4 className="font-bold text-gray-800 mb-3">Categorías</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-text-main-light mb-1">Todas</label>
                                    <input type="text" value={galeriaContent.categoryAll}
                                        onChange={(e) => setGaleriaContent(prev => ({ ...prev, categoryAll: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-main-light mb-1">Externas</label>
                                    <input type="text" value={galeriaContent.categoryExternas}
                                        onChange={(e) => setGaleriaContent(prev => ({ ...prev, categoryExternas: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-main-light mb-1">Internas</label>
                                    <input type="text" value={galeriaContent.categoryInternas}
                                        onChange={(e) => setGaleriaContent(prev => ({ ...prev, categoryInternas: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-main-light mb-1">Zonas Húmedas</label>
                                    <input type="text" value={galeriaContent.categoryHumedas}
                                        onChange={(e) => setGaleriaContent(prev => ({ ...prev, categoryHumedas: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Etiquetas de imágenes - reutilizar el tab existente */}
                <div className="bg-white rounded-xl p-6 border border-border-card">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-icon-color">label</span>
                        Etiquetas de Imágenes
                    </h3>
                    {renderGaleriaTab()}
                </div>
            </div>
        )
    }

    const renderTabContent = () => {
        // Para las páginas principales de Inicio, usar activeSubTab
        if (activePageTab === 'inicio') {
            switch (activeSubTab) {
                case 'general': return renderGeneralTab()
                case 'hero': return renderHeroTab()
                case 'intro': return renderIntroTab()
                case 'amenidades': return renderAmenidadesTab()
                case 'casa': return renderCasaTab()
                case 'explora': return renderExploraTab()
                case 'footer': return renderFooterTab()
                default: return renderGeneralTab()
            }
        }

        // Página Guía con sus sub-tabs operativos
        if (activePageTab === 'guia') {
            switch (activeSubTab) {
                case 'encabezado': return renderGuiaEncabezadoTab()
                case 'contacto': return renderContactoTab()
                case 'pagos': return renderPagosTab()
                case 'zonas': return renderZonasTab()
                case 'agua': return renderWaterTab()
                case 'normas': return renderRulesTab()
                case 'ubicacion': return renderLocationTab()
                case 'checkout': return renderCheckoutTab()
                default: return renderGuiaEncabezadoTab()
            }
        }

        // Otras páginas
        switch (activePageTab) {
            case 'registro': return renderRegistroTab()
            case 'galeria': return renderGaleriaPageTab()
            case 'reservas': return renderReservasTab()
            case 'colores': return renderColoresTab()
            case 'tipografia': return renderTipografiaTab()
            default: return null
        }
    }

    return (
        <div className="flex-1 flex flex-col bg-page-bg-admin min-h-screen">
            <header className="bg-white border-b border-border-card px-3 md:px-6 py-3 md:py-4">
                <div className="flex flex-col gap-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                            <h1 className="text-xl md:text-2xl font-black text-gray-900">Contenido del Sitio</h1>
                            <p className="text-text-subtitle dark:text-text-subtitle-dark text-sm">Edita el contenido dinámico de las páginas del sitio</p>
                        </div>
                        <button onClick={saveConfig} disabled={saving}
                            className={`px-6 py-2 rounded-lg font-bold text-white transition-all flex items-center gap-2 ${saved ? 'bg-success-bg0' : 'bg-primary hover:bg-btn-primary-hover'}`}>
                            <span className="material-symbols-outlined text-lg">{saved ? 'check' : 'save'}</span>
                            {saving ? 'Guardando...' : saved ? 'Guardado' : 'Guardar'}
                        </button>
                    </div>
                    <div className="h-2 w-full rounded-full bg-icon-bg-secondary dark:bg-border-card-dark relative overflow-hidden">
                        <div className="absolute top-0 left-0 h-full w-full bg-primary rounded-full"></div>
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-hidden flex flex-col">
                {/* Tabs Organizados en dos secciones */}
                <div className="bg-white border-b border-border-card px-4 overflow-x-auto">
                    <div className="flex gap-1 min-w-max py-2 items-center">
                        {/* Sección CONTENIDO PÁGINAS */}
                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider px-2">Contenido</span>
                        {CONTENT_TABS.map(tab => (
                            <button key={tab.id} onClick={() => { setActivePageTab(tab.id); if (tab.id === 'inicio') setActiveSubTab('general'); if (tab.id === 'guia') setActiveSubTab('encabezado'); }}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activePageTab === tab.id ? 'bg-primary text-white shadow-md' : 'text-text-muted hover:bg-icon-bg-primary'}`}>
                                <span className="material-symbols-outlined text-lg">{tab.icon}</span>
                                <span>{tab.label}</span>
                            </button>
                        ))}
                        {/* Separador */}
                        <div className="w-px h-8 bg-border-card mx-2"></div>
                        {/* Sección EDICIÓN PÁGINAS */}
                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider px-2">Edición</span>
                        {EDITING_TABS.map(tab => (
                            <button key={tab.id} onClick={() => { setActivePageTab(tab.id); }}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activePageTab === tab.id ? 'bg-primary text-white shadow-md' : 'text-text-muted hover:bg-icon-bg-primary'}`}>
                                <span className="material-symbols-outlined text-lg">{tab.icon}</span>
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Sub-tabs para Inicio */}
                {activePageTab === 'inicio' && (
                    <div className="bg-surface-light border-b border-border-card px-4 overflow-x-auto">
                        <div className="flex gap-1 min-w-max py-2">
                            {INICIO_SUBTABS.map(subtab => (
                                <button key={subtab.id} onClick={() => setActiveSubTab(subtab.id)}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${activeSubTab === subtab.id ? 'bg-icon-bg-primary text-icon-color' : 'text-text-muted hover:bg-icon-bg-primary'}`}>
                                    <span className="material-symbols-outlined text-base">{subtab.icon}</span>
                                    <span className="hidden sm:inline">{subtab.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Sub-tabs para Guía */}
                {activePageTab === 'guia' && (
                    <div className="bg-surface-light border-b border-border-card px-4 overflow-x-auto">
                        <div className="flex gap-1 min-w-max py-2">
                            {GUIA_SUBTABS.map(subtab => (
                                <button key={subtab.id} onClick={() => setActiveSubTab(subtab.id)}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${activeSubTab === subtab.id ? 'bg-icon-bg-primary text-icon-color' : 'text-text-muted hover:bg-icon-bg-primary'}`}>
                                    <span className="material-symbols-outlined text-base">{subtab.icon}</span>
                                    <span className="hidden sm:inline">{subtab.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Tab Content */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6">
                    {renderTabContent()}
                </div>
            </div>
        </div>
    )
}
