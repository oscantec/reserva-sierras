import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { fetchReservasData, appendHuespedData } from '../utils/googleSheets'

// Lista de países con Colombia primero
const COUNTRIES = [
    'Colombia',
    'Afganistán', 'Albania', 'Alemania', 'Andorra', 'Angola', 'Argentina', 'Armenia', 'Australia', 'Austria', 'Azerbaiyán',
    'Bahamas', 'Bangladés', 'Barbados', 'Bélgica', 'Belice', 'Benín', 'Bielorrusia', 'Bolivia', 'Bosnia', 'Botsuana', 'Brasil', 'Brunéi', 'Bulgaria', 'Burkina Faso',
    'Cabo Verde', 'Camboya', 'Camerún', 'Canadá', 'Catar', 'Chad', 'Chile', 'China', 'Chipre', 'Costa Rica', 'Croacia', 'Cuba',
    'Dinamarca', 'Dominica',
    'Ecuador', 'Egipto', 'El Salvador', 'Emiratos Árabes Unidos', 'Eritrea', 'Eslovaquia', 'Eslovenia', 'España', 'Estados Unidos', 'Estonia', 'Etiopía',
    'Filipinas', 'Finlandia', 'Francia',
    'Gabón', 'Gambia', 'Georgia', 'Ghana', 'Granada', 'Grecia', 'Guatemala', 'Guinea', 'Guyana',
    'Haití', 'Honduras', 'Hungría',
    'India', 'Indonesia', 'Irak', 'Irán', 'Irlanda', 'Islandia', 'Israel', 'Italia',
    'Jamaica', 'Japón', 'Jordania',
    'Kazajistán', 'Kenia', 'Kirguistán', 'Kuwait',
    'Laos', 'Letonia', 'Líbano', 'Liberia', 'Libia', 'Liechtenstein', 'Lituania', 'Luxemburgo',
    'Madagascar', 'Malasia', 'Malaui', 'Maldivas', 'Malí', 'Malta', 'Marruecos', 'Mauricio', 'Mauritania', 'México', 'Moldavia', 'Mónaco', 'Mongolia', 'Montenegro', 'Mozambique', 'Myanmar',
    'Namibia', 'Nepal', 'Nicaragua', 'Níger', 'Nigeria', 'Noruega', 'Nueva Zelanda',
    'Omán',
    'Países Bajos', 'Pakistán', 'Panamá', 'Papúa Nueva Guinea', 'Paraguay', 'Perú', 'Polonia', 'Portugal', 'Puerto Rico',
    'Reino Unido', 'República Checa', 'República Dominicana', 'Ruanda', 'Rumania', 'Rusia',
    'Samoa', 'San Marino', 'Senegal', 'Serbia', 'Singapur', 'Siria', 'Somalia', 'Sri Lanka', 'Sudáfrica', 'Sudán', 'Suecia', 'Suiza', 'Surinam',
    'Tailandia', 'Taiwán', 'Tanzania', 'Tayikistán', 'Togo', 'Trinidad y Tobago', 'Túnez', 'Turkmenistán', 'Turquía',
    'Ucrania', 'Uganda', 'Uruguay', 'Uzbekistán',
    'Vanuatu', 'Vaticano', 'Venezuela', 'Vietnam',
    'Yemen',
    'Zambia', 'Zimbabue'
]

export default function CheckIn() {
    // Estados del formulario
    const [step, setStep] = useState(1)
    const [noReserva, setNoReserva] = useState('')
    const [reservaValidada, setReservaValidada] = useState(null)
    const [validando, setValidando] = useState(false)
    const [errorValidacion, setErrorValidacion] = useState('')

    // Huésped principal
    const [plataforma, setPlataforma] = useState('Directa')
    const [nombrePrincipal, setNombrePrincipal] = useState('')
    const [tipoDocumento, setTipoDocumento] = useState('Cédula de Ciudadanía')
    const [documento, setDocumento] = useState('')
    const [nacionalidad, setNacionalidad] = useState('Colombia')
    const [edad, setEdad] = useState('')
    const [telefono, setTelefono] = useState('')

    // Acompañantes
    const [numAcompanantes, setNumAcompanantes] = useState(0)
    const [acompanantes, setAcompanantes] = useState([])

    // Estado general
    const [aceptaTerminos, setAceptaTerminos] = useState(false)
    const [enviando, setEnviando] = useState(false)
    const [enviado, setEnviado] = useState(false)

    // Colores configurables
    const [siteColors, setSiteColors] = useState({
        warningBg: '#007983',
        warningText: '#ffffff',
        warningIcon: '#ffffff',
        warningBorder: '#006076'
    })

    // Contenido dinámico de la página
    const [pageContent, setPageContent] = useState({
        pageTitle: 'Registro de Huéspedes',
        pageSubtitle: 'Completa el registro de todos los huéspedes para tu estadía.',
        step1Title: 'Valida tu Reserva',
        step2Title: 'Datos del Huésped Principal',
        step3Title: 'Acompañantes',
        successTitle: '¡Registro Exitoso!',
        successMessage: 'Tu registro ha sido completado. Te esperamos pronto.'
    })

    // Load colors and config
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
            if (config.siteColors) {
                setSiteColors(prev => ({
                    ...prev,
                    warningBg: config.siteColors.warningBg || prev.warningBg,
                    warningText: config.siteColors.warningText || prev.warningText,
                    warningIcon: config.siteColors.warningIcon || prev.warningIcon,
                    warningBorder: config.siteColors.warningBorder || prev.warningBorder
                }))
            }
            // Load page content
            if (config.registroContent) {
                setPageContent(prev => ({ ...prev, ...config.registroContent }))
            }
        }

        loadConfig()
    }, [])

    // Actualizar acompañantes cuando cambia el número
    useEffect(() => {
        const nuevosAcompanantes = []
        for (let i = 0; i < numAcompanantes; i++) {
            nuevosAcompanantes.push(acompanantes[i] || {
                nombre: '',
                nacionalidad: 'Colombia',
                edad: ''
            })
        }
        setAcompanantes(nuevosAcompanantes)
    }, [numAcompanantes])

    // Validar reserva
    const validarReserva = async () => {
        if (!noReserva.trim()) {
            setErrorValidacion('Ingresa un número de reserva')
            return
        }

        setValidando(true)
        setErrorValidacion('')
        setReservaValidada(null)

        try {
            const reservas = await fetchReservasData()
            // Buscar reserva por No Reserva (columna "No Reserva" o similar)
            const reserva = reservas?.find(r => {
                const id = r['No Reserva'] || r['no_reserva'] || r['ID'] || r['id'] || ''
                return id.toString().toLowerCase().trim() === noReserva.toLowerCase().trim()
            })

            if (reserva) {
                // Extraer fechas de la reserva
                const fechaReserva = reserva['Fecha Reserva'] || ''
                const partes = fechaReserva.toString().split('→')
                const checkIn = partes[0]?.trim() || reserva['Fecha Inicio'] || '-'
                const checkOut = partes[1]?.trim() || reserva['Fecha Salida'] || '-'
                const plataformaReserva = reserva['Plataforma'] || 'Directa'

                // Extraer número de huéspedes de la base de datos
                const numHuespedes = parseInt(reserva['Huéspedes'] || reserva['Huespedes'] || reserva['Personas'] || reserva['No Personas'] || reserva['Guests'] || reserva['guests'] || '1') || 1

                console.log('✅ Reserva encontrada:', {
                    noReserva,
                    checkIn,
                    checkOut,
                    plataforma: plataformaReserva,
                    huespedes: numHuespedes,
                    rawReserva: reserva
                })

                setReservaValidada({
                    noReserva: noReserva,
                    checkIn,
                    checkOut,
                    plataforma: plataformaReserva,
                    cliente: reserva['Nombre'] || '',
                    huespedes: numHuespedes
                })
                setPlataforma(plataformaReserva)
                setStep(2)
            } else {
                setErrorValidacion('No se encontró una reserva con ese número. Verifica e intenta nuevamente.')
            }
        } catch (error) {
            console.error('Error validando reserva:', error)
            setErrorValidacion('Error al validar. Intenta nuevamente.')
        }

        setValidando(false)
    }

    // Actualizar acompañante
    const updateAcompanante = (index, field, value) => {
        const nuevos = [...acompanantes]
        nuevos[index] = { ...nuevos[index], [field]: value }
        setAcompanantes(nuevos)
    }

    // Enviar registro
    const enviarRegistro = async () => {
        if (!aceptaTerminos) {
            alert('Debes aceptar los términos y condiciones')
            return
        }

        if (!nombrePrincipal || !documento || !edad || !telefono) {
            alert('Por favor completa todos los campos del huésped principal')
            return
        }

        setEnviando(true)

        try {
            const fechaRegistro = new Date().toLocaleDateString('es-CO')
            const documentoCompleto = `${tipoDocumento === 'Cédula de Ciudadanía' ? 'CC' : 'PP'} ${documento}`

            console.log('📝 Iniciando registro de huéspedes...', {
                noReserva,
                plataforma,
                nombrePrincipal,
                acompanantes: acompanantes.length
            })

            // Registrar huésped principal
            console.log('📤 Enviando huésped principal...')
            const resultPrincipal = await appendHuespedData({
                noReserva: noReserva,
                plataforma: plataforma,
                nombre: nombrePrincipal,
                tipoHuesped: 'Principal',
                telefono: telefono,
                checkIn: reservaValidada?.checkIn || '',
                checkOut: reservaValidada?.checkOut || '',
                nacionalidad: nacionalidad,
                edad: edad,
                documento: documentoCompleto,
                fechaRegistro: fechaRegistro
            })
            console.log('✅ Huésped principal registrado:', resultPrincipal)

            // Registrar acompañantes
            for (let i = 0; i < acompanantes.length; i++) {
                const acomp = acompanantes[i]
                if (acomp.nombre) {
                    console.log(`📤 Enviando acompañante ${i + 1}...`)
                    const resultAcomp = await appendHuespedData({
                        noReserva: noReserva,
                        plataforma: plataforma,
                        nombre: acomp.nombre,
                        tipoHuesped: 'Acompañante',
                        telefono: '-',
                        checkIn: reservaValidada?.checkIn || '',
                        checkOut: reservaValidada?.checkOut || '',
                        nacionalidad: acomp.nacionalidad || 'Colombia',
                        edad: acomp.edad || '',
                        documento: '-',
                        fechaRegistro: fechaRegistro
                    })
                    console.log(`✅ Acompañante ${i + 1} registrado:`, resultAcomp)
                }
            }

            console.log('🎉 Registro completo exitoso!')

            setEnviado(true)
            setStep(3)
        } catch (error) {
            console.error('Error enviando registro:', error)
            alert('Error al registrar. Intenta nuevamente.')
        }

        setEnviando(false)
    }

    // Calcular progreso
    const getProgress = () => {
        if (step === 1) return 33
        if (step === 2) return 66
        return 100
    }

    return (
        <div className="flex flex-col min-h-screen bg-page-bg-registro dark:bg-surface-card-dark text-text-main dark:text-white font-display">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 flex flex-col lg:flex-row gap-8 w-full">
                {/* Main Form */}
                <div className="flex-1 flex flex-col gap-8">
                    {/* Header - Style from Reservas */}
                    <div className="flex flex-col gap-3">
                        <div className="flex justify-between items-end">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em] mb-2">{pageContent.pageTitle}</h1>
                                <p className="text-text-subtitle dark:text-text-subtitle-dark text-base">{pageContent.pageSubtitle}</p>
                            </div>
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-bold text-primary">Paso {step} de 3</p>
                                <p className="text-xs text-text-muted dark:text-text-muted">
                                    {step === 1 ? 'Validación' : step === 2 ? 'Datos' : 'Confirmado'}
                                </p>
                            </div>
                        </div>
                        <div className="h-2 w-full rounded-full bg-icon-bg-secondary dark:bg-border-card-dark mt-2 relative overflow-hidden">
                            <div className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${getProgress()}%` }}></div>
                        </div>
                    </div>

                    {enviado ? (
                        /* Confirmación exitosa */
                        <div className="bg-surface-card dark:bg-surface-card-dark rounded-xl p-8 shadow-sm border border-border-card dark:border-border-card-dark text-center">
                            <div className="w-20 h-20 mx-auto mb-6 bg-icon-bg-primary dark:bg-icon-bg-dark rounded-full flex items-center justify-center">
                                <span className="material-symbols-outlined text-4xl text-primary">check_circle</span>
                            </div>
                            <h2 className="text-2xl font-bold mb-2">{pageContent.successTitle}</h2>
                            <p className="text-text-muted dark:text-text-muted mb-4">
                                {pageContent.successMessage}
                            </p>
                            <div className="bg-icon-bg-primary dark:bg-icon-bg-dark rounded-lg p-4 inline-block">
                                <p className="text-sm text-success-text dark:text-green-300">
                                    <strong>Reserva:</strong> {noReserva} | <strong>Check-In:</strong> {reservaValidada?.checkIn}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                            {/* Step 1: Validate Reservation */}
                            <div className="bg-surface-card dark:bg-surface-card-dark rounded-xl p-6 shadow-sm border border-border-card dark:border-border-card-dark">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className={`flex items-center justify-center size-8 rounded-full ${step >= 1 ? 'bg-primary text-white' : 'bg-icon-bg-secondary dark:bg-border-card-dark'} font-bold text-sm`}>1</div>
                                    <h2 className="text-xl font-bold">{pageContent.step1Title}</h2>
                                </div>
                                <div className="flex flex-col md:flex-row gap-4 items-end">
                                    <div className="flex-grow w-full md:max-w-md">
                                        <label className="block text-sm font-medium text-text-main-light dark:text-text-muted mb-2">Número de Reserva</label>
                                        <div className="relative">
                                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-text-muted">
                                                <span className="material-symbols-outlined text-xl">confirmation_number</span>
                                            </span>
                                            <input
                                                className="block w-full pl-10 pr-3 py-3 border border-border-card dark:border-border-card-dark rounded-lg bg-background-light dark:bg-background-dark focus:ring-2 focus:ring-primary focus:border-primary placeholder:text-text-muted transition-all"
                                                placeholder="Ej: R001"
                                                type="text"
                                                value={noReserva}
                                                onChange={(e) => setNoReserva(e.target.value.toUpperCase())}
                                                disabled={reservaValidada !== null}
                                            />
                                        </div>
                                        <p className="mt-1 text-xs text-text-muted">Ingresa la letra R seguida de los números de tu reserva</p>
                                    </div>
                                    <button
                                        className="w-full md:w-auto px-6 py-3 bg-primary hover:bg-btn-primary-hover text-white font-bold rounded-lg shadow-lg shadow-card transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                        type="button"
                                        onClick={validarReserva}
                                        disabled={validando || reservaValidada !== null}
                                    >
                                        <span>{validando ? 'Verificando...' : reservaValidada ? 'Verificado' : 'Verificar'}</span>
                                        <span className="material-symbols-outlined text-sm">{reservaValidada ? 'check' : 'check_circle'}</span>
                                    </button>
                                </div>

                                {/* Mensajes de estado */}
                                <div className="mt-4 border-t border-border-card dark:border-border-card-dark pt-4">
                                    {errorValidacion && (
                                        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                                            <span className="material-symbols-outlined text-base">error</span>
                                            <span className="text-sm">{errorValidacion}</span>
                                        </div>
                                    )}
                                    {reservaValidada && (
                                        <div className="flex items-center gap-2 text-success-text dark:text-green-400">
                                            <span className="material-symbols-outlined text-base">check</span>
                                            <span className="text-sm">
                                                ✓ Check Reserva Encontrada: <strong>{reservaValidada.checkIn}</strong> a <strong>{reservaValidada.checkOut}</strong>
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Step 2: Main Guest Information */}
                            {step >= 2 && (
                                <div className="bg-surface-card dark:bg-surface-card-dark rounded-xl p-6 shadow-sm border border-border-card dark:border-border-card-dark">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="flex items-center justify-center size-8 rounded-full bg-primary text-white font-bold text-sm">2</div>
                                        <h2 className="text-xl font-bold">Huésped Principal</h2>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Plataforma */}
                                        <div className="col-span-1 md:col-span-2">
                                            <label className="block text-sm font-medium text-text-main-light dark:text-text-muted mb-3">Plataforma de Reserva</label>
                                            <div className="grid grid-cols-3 gap-3">
                                                {[
                                                    { id: 'Directa', icon: 'storefront', label: 'Directa' },
                                                    { id: 'Airbnb', icon: 'airbnb', label: 'Airbnb', isBrand: true },
                                                    { id: 'Booking', icon: 'calendar_month', label: 'Booking' }
                                                ].map((p) => (
                                                    <button
                                                        key={p.id}
                                                        type="button"
                                                        onClick={() => setPlataforma(p.id)}
                                                        className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${plataforma === p.id
                                                            ? 'border-primary bg-primary/5 text-primary shadow-sm'
                                                            : 'border-border-card dark:border-border-card-dark bg-background-light dark:bg-background-dark text-text-main-light dark:text-text-muted hover:border-primary/50'
                                                            }`}
                                                    >
                                                        {p.id === 'Airbnb' ? (
                                                            /* Airbnb Logo SVG */
                                                            <svg width="24" height="24" viewBox="0 0 32 32" fill="currentColor" className={plataforma === 'Airbnb' ? 'text-primary' : 'text-current'}>
                                                                <path d="M16 1c2.008 0 3.463.963 4.751 3.269l.533 1.025c1.954 3.83 6.114 12.54 7.1 14.836l.145.353c.667 1.591.91 2.472.96 3.396l.01.415.001.228c0 4.062-2.877 6.478-6.357 6.478-2.224 0-4.556-1.258-6.709-3.386l-.257-.26-.172-.179h-.011l-.176.185c-2.044 2.1-4.393 3.405-6.701 3.619l-.265.022c-3.481 0-6.358-2.416-6.358-6.478 0-1.541.38-2.91.97-4.14l.115-.22c1.334-2.456 5.374-11.08 7.106-14.836l.533-1.025C12.537 1.963 13.992 1 16 1zm0 2c-1.232 0-2.203.693-3.366 2.757C10.975 8.923 6.64 18.068 5.64 19.957c-.43.837-.64 1.777-.64 2.768 0 2.924 1.944 4.478 4.358 4.478 1.488 0 3.197-.88 4.885-2.585l.757-.796.757.796c1.688 1.705 3.398 2.585 4.886 2.585 2.414 0 4.357-1.554 4.357-4.478 0-.814-.24-1.748-.684-2.86l-.105-.246c-.996-2.26-5.467-11.85-7.004-14.853C18.203 3.693 17.232 3 16 3zm0 11.5c1.933 0 3.5 1.567 3.5 3.5s-1.567 3.5-3.5 3.5-3.5-1.567-3.5-3.5 1.567-3.5 3.5-3.5zm0 2c-.828 0-1.5.672-1.5 1.5s.672 1.5 1.5 1.5 1.5-.672 1.5-1.5-.672-1.5-1.5-1.5z" />
                                                            </svg>
                                                        ) : (
                                                            <span className="material-symbols-outlined text-2xl">{p.icon}</span>
                                                        )}
                                                        <span className="text-xs font-bold leading-none">{p.label}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Nacionalidad */}
                                        <div>
                                            <label className="block text-sm font-medium text-text-main-light dark:text-text-muted mb-2">Nacionalidad</label>
                                            <select
                                                className="block w-full px-4 py-3 border border-border-card dark:border-border-card-dark rounded-lg bg-background-light dark:bg-background-dark focus:ring-primary focus:border-primary"
                                                value={nacionalidad}
                                                onChange={(e) => setNacionalidad(e.target.value)}
                                            >
                                                {COUNTRIES.map(country => (
                                                    <option key={country} value={country}>{country}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Nombre Completo */}
                                        <div className="col-span-1 md:col-span-2">
                                            <label className="block text-sm font-medium text-text-main-light dark:text-text-muted mb-2">Nombre Completo</label>
                                            <div className="relative">
                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-text-muted">
                                                    <span className="material-symbols-outlined text-xl">person</span>
                                                </span>
                                                <input
                                                    className="block w-full pl-10 py-3 border border-border-card dark:border-border-card-dark rounded-lg bg-background-light dark:bg-background-dark focus:ring-primary focus:border-primary"
                                                    placeholder="Ingresa tu nombre completo"
                                                    type="text"
                                                    value={nombrePrincipal}
                                                    onChange={(e) => setNombrePrincipal(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        {/* Tipo de Documento + Número */}
                                        <div>
                                            <label className="block text-sm font-medium text-text-main-light dark:text-text-muted mb-2">Tipo de Documento</label>
                                            <select
                                                className="block w-full px-4 py-3 border border-border-card dark:border-border-card-dark rounded-lg bg-background-light dark:bg-background-dark focus:ring-primary focus:border-primary"
                                                value={tipoDocumento}
                                                onChange={(e) => setTipoDocumento(e.target.value)}
                                            >
                                                <option value="Cédula de Ciudadanía">Cédula de Ciudadanía</option>
                                                <option value="No. de Pasaporte">No. de Pasaporte</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-text-main-light dark:text-text-muted mb-2">Número de Documento</label>
                                            <div className="relative">
                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-text-muted">
                                                    <span className="material-symbols-outlined text-xl">badge</span>
                                                </span>
                                                <input
                                                    className="block w-full pl-10 py-3 border border-border-card dark:border-border-card-dark rounded-lg bg-background-light dark:bg-background-dark focus:ring-primary focus:border-primary"
                                                    placeholder="Número de identificación"
                                                    type="text"
                                                    value={documento}
                                                    onChange={(e) => setDocumento(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        {/* Edad */}
                                        <div>
                                            <label className="block text-sm font-medium text-text-main-light dark:text-text-muted mb-2">Edad</label>
                                            <input
                                                className="block w-full px-4 py-3 border border-border-card dark:border-border-card-dark rounded-lg bg-background-light dark:bg-background-dark focus:ring-primary focus:border-primary"
                                                placeholder="Años"
                                                type="number"
                                                value={edad}
                                                onChange={(e) => setEdad(e.target.value)}
                                            />
                                        </div>

                                        {/* Teléfono */}
                                        <div>
                                            <label className="block text-sm font-medium text-text-main-light dark:text-text-muted mb-2">Teléfono de Contacto</label>
                                            <div className="relative">
                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-text-muted">
                                                    <span className="material-symbols-outlined text-xl">phone</span>
                                                </span>
                                                <input
                                                    className="block w-full pl-10 py-3 border border-border-card dark:border-border-card-dark rounded-lg bg-background-light dark:bg-background-dark focus:ring-primary focus:border-primary"
                                                    placeholder="+57 300 000 0000"
                                                    type="tel"
                                                    value={telefono}
                                                    onChange={(e) => setTelefono(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Additional Guests */}
                            {step >= 2 && (
                                <div className="bg-surface-card dark:bg-surface-card-dark rounded-xl p-6 shadow-sm border border-border-card dark:border-border-card-dark">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center justify-center size-8 rounded-full bg-icon-bg-secondary dark:bg-border-card-dark font-bold text-sm">3</div>
                                            <div>
                                                <h2 className="text-xl font-bold">Acompañantes</h2>
                                                <p className="text-sm text-text-muted dark:text-text-muted">¿Cuántas personas viajan contigo?</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center bg-background-light dark:bg-background-dark rounded-lg border border-border-card dark:border-border-card-dark p-1">
                                            <button
                                                className="size-10 flex items-center justify-center text-text-muted hover:text-primary hover:bg-surface-light dark:hover:bg-surface-dark rounded-md transition-colors"
                                                type="button"
                                                onClick={() => setNumAcompanantes(Math.max(0, numAcompanantes - 1))}
                                            >
                                                <span className="material-symbols-outlined">remove</span>
                                            </button>
                                            <div className="w-12 text-center font-bold text-lg">{numAcompanantes}</div>
                                            <button
                                                className="size-10 flex items-center justify-center text-text-muted hover:text-primary hover:bg-surface-light dark:hover:bg-surface-dark rounded-md transition-colors"
                                                type="button"
                                                onClick={() => setNumAcompanantes(numAcompanantes + 1)}
                                            >
                                                <span className="material-symbols-outlined">add</span>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        {acompanantes.map((acomp, index) => (
                                            <div key={index} className="border border-border-card dark:border-border-card-dark rounded-xl p-5 bg-background-light dark:bg-background-dark relative group hover:border-primary/30 transition-colors">
                                                <div className="absolute -top-3 left-4 bg-surface-card dark:bg-surface-card-dark px-2 text-xs font-semibold text-primary uppercase tracking-wider">
                                                    Huésped Adicional {index + 1}
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                                    <div className="md:col-span-5">
                                                        <label className="block text-xs font-semibold text-text-muted dark:text-text-muted mb-1">Nombre</label>
                                                        <input
                                                            className="block w-full px-3 py-2 border border-border-card dark:border-border-card-dark rounded-md bg-surface-card dark:bg-surface-card-dark focus:ring-primary focus:border-primary text-sm"
                                                            placeholder="Nombre completo"
                                                            type="text"
                                                            value={acomp.nombre}
                                                            onChange={(e) => updateAcompanante(index, 'nombre', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="md:col-span-5">
                                                        <label className="block text-xs font-semibold text-text-muted dark:text-text-muted mb-1">Nacionalidad</label>
                                                        <select
                                                            className="block w-full px-3 py-2 border border-border-card dark:border-border-card-dark rounded-md bg-surface-card dark:bg-surface-card-dark focus:ring-primary focus:border-primary text-sm"
                                                            value={acomp.nacionalidad}
                                                            onChange={(e) => updateAcompanante(index, 'nacionalidad', e.target.value)}
                                                        >
                                                            {COUNTRIES.map(country => (
                                                                <option key={country} value={country}>{country}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="md:col-span-2">
                                                        <label className="block text-xs font-semibold text-text-muted dark:text-text-muted mb-1">Edad</label>
                                                        <input
                                                            className="block w-full px-3 py-2 border border-border-card dark:border-border-card-dark rounded-md bg-surface-card dark:bg-surface-card-dark focus:ring-primary focus:border-primary text-sm"
                                                            placeholder="0"
                                                            type="number"
                                                            value={acomp.edad}
                                                            onChange={(e) => updateAcompanante(index, 'edad', e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Footer Actions */}
                            {step >= 2 && (
                                <div className="flex flex-col md:flex-row items-center justify-between pt-4 gap-6">
                                    <label className="flex items-start gap-3 cursor-pointer group">
                                        <input
                                            className="text-primary rounded border-gray-300 focus:ring-primary mt-1 size-5"
                                            type="checkbox"
                                            checked={aceptaTerminos}
                                            onChange={(e) => setAceptaTerminos(e.target.checked)}
                                        />
                                        <span className="text-sm text-text-muted dark:text-text-muted group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors">
                                            Acepto los <a className="text-primary underline hover:text-success-text" href="#">términos y condiciones</a> y la política de tratamiento de datos personales.
                                        </span>
                                    </label>
                                    <div className="flex gap-4 w-full md:w-auto">
                                        <button
                                            className="flex-1 md:flex-none px-8 py-3 bg-primary hover:bg-btn-primary-hover text-white font-bold rounded-lg shadow-lg shadow-card transition-all transform active:scale-95 disabled:opacity-50"
                                            type="button"
                                            onClick={enviarRegistro}
                                            disabled={enviando || !aceptaTerminos}
                                        >
                                            {enviando ? 'Enviando...' : 'Confirmar Registro'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </form>
                    )}
                </div>

                {/* Right Sidebar - Style from Reservas */}
                <div className="lg:w-[380px] shrink-0">
                    <div className="sticky top-24 flex flex-col gap-6">
                        <div className="bg-surface-card dark:bg-surface-card-dark rounded-2xl p-6 shadow-xl shadow-gray-200/50 dark:shadow-black/20 border border-border-card dark:border-border-card-dark">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold">Tu Reserva</h3>
                                <span className={`text-xs font-bold px-2 py-1 rounded ${reservaValidada ? 'bg-icon-bg-primary dark:bg-icon-bg-dark text-icon-color' : 'bg-icon-bg-primary dark:bg-gray-800 text-text-muted'}`}>
                                    {reservaValidada ? 'Verificada' : 'Pendiente'}
                                </span>
                            </div>
                            {reservaValidada ? (
                                <>
                                    <div className="flex gap-4 mb-6">
                                        <div className="flex-1 p-3 rounded-lg border border-border-card dark:border-border-card-dark bg-background-light dark:bg-background-dark">
                                            <p className="text-xs text-text-muted uppercase font-bold mb-1">Llegada</p>
                                            <p className="font-bold text-sm">{reservaValidada.checkIn}</p>
                                        </div>
                                        <div className="flex-1 p-3 rounded-lg border border-border-card dark:border-border-card-dark bg-background-light dark:bg-background-dark">
                                            <p className="text-xs text-text-muted uppercase font-bold mb-1">Salida</p>
                                            <p className="font-bold text-sm">{reservaValidada.checkOut}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-3 text-sm text-text-muted dark:text-text-muted">
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-icon-color">confirmation_number</span>
                                            <span>Reserva: <strong className="text-primary">{noReserva}</strong></span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-icon-color">groups</span>
                                            <span>Huéspedes: <strong className="text-primary">{reservaValidada?.huespedes || 1}</strong></span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-icon-color">home</span>
                                            <span>Reserva de las Sierras</span>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-8 text-text-muted">
                                    <span className="material-symbols-outlined text-4xl mb-2">search</span>
                                    <p className="text-sm">Ingresa tu número de reserva para continuar</p>
                                </div>
                            )}
                            <div className="h-px bg-icon-bg-primary dark:bg-border-card-dark my-4"></div>
                            <div
                                className="p-4 rounded-lg border"
                                style={{
                                    backgroundColor: siteColors.warningBg,
                                    borderColor: siteColors.warningBorder
                                }}
                            >
                                <p className="text-sm flex items-start gap-2" style={{ color: siteColors.warningText }}>
                                    <span className="material-symbols-outlined text-lg" style={{ color: siteColors.warningIcon }}>info</span>
                                    <span>Todos los huéspedes deben registrarse antes del check-in.</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
