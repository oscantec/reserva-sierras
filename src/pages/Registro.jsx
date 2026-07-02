import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { fetchReservasData, appendHuespedData } from '../utils/googleSheets'
import PageHeader from '../components/PageHeader'

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
    const [codigoUnico, setCodigoUnico] = useState('')
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
        warningBg: '#2d6a4f',
        warningText: '#ffffff',
        warningIcon: '#ffffff',
        warningBorder: '#1b4332'
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
        if (!codigoUnico.trim()) {
            setErrorValidacion('Ingresa el código único de tu reserva')
            return
        }

        setValidando(true)
        setErrorValidacion('')
        setReservaValidada(null)

        try {
            const reservas = await fetchReservasData()
            // Buscar reserva por No Reserva Y Código Único
            const reserva = reservas?.find(r => {
                const id = r['No Reserva'] || r['no_reserva'] || r['ID'] || r['id'] || ''
                const codigo = r['Código Único'] || r['Codigo Unico'] || r['codigo_unico'] || r['CodigoUnico'] || ''
                const matchId = id.toString().toLowerCase().trim() === noReserva.toLowerCase().trim()
                const matchCodigo = codigo.toString().trim() === codigoUnico.trim()
                return matchId && matchCodigo
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
                    codigoUnico,
                    checkIn,
                    checkOut,
                    plataforma: plataformaReserva,
                    huespedes: numHuespedes,
                    rawReserva: reserva
                })

                setReservaValidada({
                    noReserva: noReserva,
                    codigoUnico: codigoUnico,
                    checkIn,
                    checkOut,
                    plataforma: plataformaReserva,
                    cliente: reserva['Nombre'] || '',
                    huespedes: numHuespedes
                })
                setPlataforma(plataformaReserva)
                setStep(2)
            } else {
                setErrorValidacion('No se encontró una reserva con ese número y código único. Verifica ambos datos e intenta nuevamente.')
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
        <div className="flex flex-col min-h-screen bg-premium-cream text-premium-ink font-premium-body">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 flex flex-col lg:flex-row gap-8 w-full">
                {/* Main Form */}
                <div className="flex-1 flex flex-col gap-8">
                    <PageHeader
                        eyebrow="Registro de huéspedes"
                        title={pageContent.pageTitle}
                        subtitle={pageContent.pageSubtitle}
                        currentStep={step}
                        totalSteps={3}
                        stepLabel={step === 1 ? 'Validación' : step === 2 ? 'Datos' : 'Confirmado'}
                    />

                    {enviado ? (
                        /* Confirmación exitosa */
                        <div className="card-premium p-8 text-center">
                            <div className="w-20 h-20 mx-auto mb-6 bg-premium-pine/10 rounded-full flex items-center justify-center">
                                <span className="material-symbols-outlined text-4xl text-premium-pine">check_circle</span>
                            </div>
                            <h2 className="font-premium-display text-premium-forest text-2xl mb-2">{pageContent.successTitle}</h2>
                            <p className="text-premium-ink/70 mb-4">
                                {pageContent.successMessage}
                            </p>
                            <div className="bg-premium-mist rounded-premium hairline p-4 inline-block">
                                <p className="text-sm text-premium-pine">
                                    <strong>Reserva:</strong> {noReserva} | <strong>Check-In:</strong> {reservaValidada?.checkIn}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                            {/* Step 1: Validate Reservation */}
                            <div className="card-premium p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className={`flex items-center justify-center size-8 rounded-full ${step >= 1 ? 'bg-premium-forest text-premium-cream' : 'bg-premium-sand text-premium-ink/50'} font-premium-display font-semibold text-sm`}>1</div>
                                    <h2 className="font-premium-display text-premium-forest text-xl">{pageContent.step1Title}</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div className="w-full">
                                        <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-premium-ink/60 mb-2">Número de Reserva</label>
                                        <div className="relative">
                                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-premium-ink/40">
                                                <span className="material-symbols-outlined text-xl">confirmation_number</span>
                                            </span>
                                            <input
                                                className="block w-full pl-10 pr-3 py-3 rounded-premium hairline bg-white focus:outline-none focus:ring-2 focus:ring-premium-gold/40 focus:border-premium-gold placeholder:text-premium-ink/40 transition-all ease-premium"
                                                placeholder="Ej: R189"
                                                type="text"
                                                value={noReserva}
                                                onChange={(e) => setNoReserva(e.target.value.toUpperCase())}
                                                disabled={reservaValidada !== null}
                                            />
                                        </div>
                                        <p className="mt-1 text-xs text-premium-ink/50">Ingresa la letra R seguida de los números de tu reserva</p>
                                    </div>
                                    <div className="w-full">
                                        <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-premium-ink/60 mb-2">Código Único</label>
                                        <div className="relative">
                                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-premium-ink/40">
                                                <span className="material-symbols-outlined text-xl">pin</span>
                                            </span>
                                            <input
                                                className="block w-full pl-10 pr-3 py-3 rounded-premium hairline bg-white focus:outline-none focus:ring-2 focus:ring-premium-gold/40 focus:border-premium-gold placeholder:text-premium-ink/40 transition-all ease-premium"
                                                placeholder="Ej: 579"
                                                type="text"
                                                value={codigoUnico}
                                                onChange={(e) => setCodigoUnico(e.target.value)}
                                                disabled={reservaValidada !== null}
                                            />
                                        </div>
                                        <p className="mt-1 text-xs text-premium-ink/50">Código único de 3 dígitos de tu reserva</p>
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        className="w-full md:w-auto px-6 py-3 bg-premium-forest hover:bg-premium-pine text-premium-cream font-semibold rounded-premium shadow-premium hover:shadow-gold-glow transition-all ease-premium flex items-center justify-center gap-2 disabled:opacity-60"
                                        type="button"
                                        onClick={validarReserva}
                                        disabled={validando || reservaValidada !== null}
                                    >
                                        <span>{validando ? 'Verificando...' : reservaValidada ? 'Verificado' : 'Verificar'}</span>
                                        <span className="material-symbols-outlined text-sm">{reservaValidada ? 'check' : 'check_circle'}</span>
                                    </button>
                                </div>

                                {/* Mensajes de estado */}
                                <div className="mt-4 border-t border-premium-ink/10 pt-4">
                                    {errorValidacion && (
                                        <div className="flex items-center gap-2 text-[#B4533A]">
                                            <span className="material-symbols-outlined text-base">error</span>
                                            <span className="text-sm">{errorValidacion}</span>
                                        </div>
                                    )}
                                    {reservaValidada && (
                                        <div className="flex items-center gap-2 text-premium-pine">
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
                                <div className="card-premium p-6">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="flex items-center justify-center size-8 rounded-full bg-premium-forest text-premium-cream font-premium-display font-semibold text-sm">2</div>
                                        <h2 className="font-premium-display text-premium-forest text-xl">Huésped Principal</h2>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Plataforma */}
                                        <div className="col-span-1 md:col-span-2">
                                            <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-premium-ink/60 mb-3">Plataforma de Reserva</label>
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
                                                        className={`flex flex-col items-center gap-2 p-3 rounded-premium border-2 transition-all ease-premium ${plataforma === p.id
                                                            ? 'border-premium-gold bg-premium-gold/5 text-premium-forest shadow-premium-sm'
                                                            : 'border-premium-ink/10 bg-white text-premium-ink/60 hover:border-premium-gold/50'
                                                            }`}
                                                    >
                                                        {p.id === 'Airbnb' ? (
                                                            /* Airbnb Logo SVG */
                                                            <svg width="24" height="24" viewBox="0 0 32 32" fill="currentColor" className={plataforma === 'Airbnb' ? 'text-premium-forest' : 'text-current'}>
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
                                            <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-premium-ink/60 mb-2">Nacionalidad</label>
                                            <select
                                                className="block w-full px-4 py-3 rounded-premium hairline bg-white focus:outline-none focus:ring-2 focus:ring-premium-gold/40 focus:border-premium-gold placeholder:text-premium-ink/40 transition-all ease-premium"
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
                                            <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-premium-ink/60 mb-2">Nombre Completo</label>
                                            <div className="relative">
                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-premium-ink/40">
                                                    <span className="material-symbols-outlined text-xl">person</span>
                                                </span>
                                                <input
                                                    className="block w-full pl-10 py-3 rounded-premium hairline bg-white focus:outline-none focus:ring-2 focus:ring-premium-gold/40 focus:border-premium-gold placeholder:text-premium-ink/40 transition-all ease-premium"
                                                    placeholder="Ingresa tu nombre completo"
                                                    type="text"
                                                    value={nombrePrincipal}
                                                    onChange={(e) => setNombrePrincipal(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        {/* Tipo de Documento + Número */}
                                        <div>
                                            <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-premium-ink/60 mb-2">Tipo de Documento</label>
                                            <select
                                                className="block w-full px-4 py-3 rounded-premium hairline bg-white focus:outline-none focus:ring-2 focus:ring-premium-gold/40 focus:border-premium-gold placeholder:text-premium-ink/40 transition-all ease-premium"
                                                value={tipoDocumento}
                                                onChange={(e) => setTipoDocumento(e.target.value)}
                                            >
                                                <option value="Cédula de Ciudadanía">Cédula de Ciudadanía</option>
                                                <option value="No. de Pasaporte">No. de Pasaporte</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-premium-ink/60 mb-2">Número de Documento</label>
                                            <div className="relative">
                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-premium-ink/40">
                                                    <span className="material-symbols-outlined text-xl">badge</span>
                                                </span>
                                                <input
                                                    className="block w-full pl-10 py-3 rounded-premium hairline bg-white focus:outline-none focus:ring-2 focus:ring-premium-gold/40 focus:border-premium-gold placeholder:text-premium-ink/40 transition-all ease-premium"
                                                    placeholder="Número de identificación"
                                                    type="text"
                                                    value={documento}
                                                    onChange={(e) => setDocumento(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        {/* Edad */}
                                        <div>
                                            <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-premium-ink/60 mb-2">Edad</label>
                                            <input
                                                className="block w-full px-4 py-3 rounded-premium hairline bg-white focus:outline-none focus:ring-2 focus:ring-premium-gold/40 focus:border-premium-gold placeholder:text-premium-ink/40 transition-all ease-premium"
                                                placeholder="Años"
                                                type="number"
                                                value={edad}
                                                onChange={(e) => setEdad(e.target.value)}
                                            />
                                        </div>

                                        {/* Teléfono */}
                                        <div>
                                            <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-premium-ink/60 mb-2">Teléfono de Contacto</label>
                                            <div className="relative">
                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-premium-ink/40">
                                                    <span className="material-symbols-outlined text-xl">phone</span>
                                                </span>
                                                <input
                                                    className="block w-full pl-10 py-3 rounded-premium hairline bg-white focus:outline-none focus:ring-2 focus:ring-premium-gold/40 focus:border-premium-gold placeholder:text-premium-ink/40 transition-all ease-premium"
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
                                <div className="card-premium p-6">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center justify-center size-8 rounded-full bg-premium-forest text-premium-cream font-premium-display font-semibold text-sm">3</div>
                                            <div>
                                                <h2 className="font-premium-display text-premium-forest text-xl">Acompañantes</h2>
                                                <p className="text-sm text-premium-ink/60">¿Cuántas personas viajan contigo?</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center bg-premium-mist rounded-premium hairline p-1">
                                            <button
                                                className="size-10 flex items-center justify-center text-premium-ink/50 hover:text-premium-forest hover:bg-white rounded-lg transition-colors ease-premium"
                                                type="button"
                                                onClick={() => setNumAcompanantes(Math.max(0, numAcompanantes - 1))}
                                            >
                                                <span className="material-symbols-outlined">remove</span>
                                            </button>
                                            <div className="w-12 text-center font-premium-display font-semibold text-lg text-premium-forest">{numAcompanantes}</div>
                                            <button
                                                className="size-10 flex items-center justify-center text-premium-ink/50 hover:text-premium-forest hover:bg-white rounded-lg transition-colors ease-premium"
                                                type="button"
                                                onClick={() => setNumAcompanantes(numAcompanantes + 1)}
                                            >
                                                <span className="material-symbols-outlined">add</span>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        {acompanantes.map((acomp, index) => (
                                            <div key={index} className="hairline rounded-premium p-5 bg-premium-mist relative group hover:border-premium-gold/40 transition-colors ease-premium">
                                                <div className="absolute -top-3 left-4 bg-white rounded-full px-3 py-0.5 text-xs font-semibold text-premium-gold uppercase tracking-[0.14em]">
                                                    Huésped Adicional {index + 1}
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                                    <div className="md:col-span-5">
                                                        <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-premium-ink/60 mb-1">Nombre</label>
                                                        <input
                                                            className="block w-full px-3 py-2 rounded-premium hairline bg-white focus:outline-none focus:ring-2 focus:ring-premium-gold/40 focus:border-premium-gold placeholder:text-premium-ink/40 transition-all ease-premium text-sm"
                                                            placeholder="Nombre completo"
                                                            type="text"
                                                            value={acomp.nombre}
                                                            onChange={(e) => updateAcompanante(index, 'nombre', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="md:col-span-5">
                                                        <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-premium-ink/60 mb-1">Nacionalidad</label>
                                                        <select
                                                            className="block w-full px-3 py-2 rounded-premium hairline bg-white focus:outline-none focus:ring-2 focus:ring-premium-gold/40 focus:border-premium-gold placeholder:text-premium-ink/40 transition-all ease-premium text-sm"
                                                            value={acomp.nacionalidad}
                                                            onChange={(e) => updateAcompanante(index, 'nacionalidad', e.target.value)}
                                                        >
                                                            {COUNTRIES.map(country => (
                                                                <option key={country} value={country}>{country}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="md:col-span-2">
                                                        <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-premium-ink/60 mb-1">Edad</label>
                                                        <input
                                                            className="block w-full px-3 py-2 rounded-premium hairline bg-white focus:outline-none focus:ring-2 focus:ring-premium-gold/40 focus:border-premium-gold placeholder:text-premium-ink/40 transition-all ease-premium text-sm"
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
                                            className="text-premium-forest rounded border-premium-ink/20 focus:ring-premium-gold/40 mt-1 size-5"
                                            type="checkbox"
                                            checked={aceptaTerminos}
                                            onChange={(e) => setAceptaTerminos(e.target.checked)}
                                        />
                                        <span className="text-sm text-premium-ink/60 group-hover:text-premium-ink transition-colors">
                                            Acepto los <a className="text-premium-pine underline hover:text-premium-gold transition-colors" href="#">términos y condiciones</a> y la política de tratamiento de datos personales.
                                        </span>
                                    </label>
                                    <div className="flex gap-4 w-full md:w-auto">
                                        <button
                                            className="flex-1 md:flex-none px-8 py-3 bg-premium-forest hover:bg-premium-pine text-premium-cream font-semibold rounded-premium shadow-premium hover:shadow-gold-glow transition-all ease-premium transform active:scale-95 disabled:opacity-50"
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
                        <div className="card-premium p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-premium-display text-premium-forest text-lg">Tu Reserva</h3>
                                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${reservaValidada ? 'bg-premium-pine/10 text-premium-pine' : 'bg-premium-gold/10 text-premium-gold'}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${reservaValidada ? 'bg-premium-pine' : 'bg-premium-gold'}`}></span>
                                    {reservaValidada ? 'Verificada' : 'Pendiente'}
                                </span>
                            </div>
                            {reservaValidada ? (
                                <>
                                    <div className="flex gap-4 mb-6">
                                        <div className="flex-1 p-3 rounded-premium hairline bg-premium-mist">
                                            <p className="text-xs text-premium-ink/50 uppercase tracking-[0.14em] font-semibold mb-1">Llegada</p>
                                            <p className="font-bold text-sm text-premium-forest">{reservaValidada.checkIn}</p>
                                        </div>
                                        <div className="flex-1 p-3 rounded-premium hairline bg-premium-mist">
                                            <p className="text-xs text-premium-ink/50 uppercase tracking-[0.14em] font-semibold mb-1">Salida</p>
                                            <p className="font-bold text-sm text-premium-forest">{reservaValidada.checkOut}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-3 text-sm text-premium-ink/60">
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-premium-gold">confirmation_number</span>
                                            <span>Reserva: <strong className="text-premium-forest">{noReserva}</strong></span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-premium-gold">groups</span>
                                            <span>Huéspedes: <strong className="text-premium-forest">{reservaValidada?.huespedes || 1}</strong></span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-premium-gold">home</span>
                                            <span>Reserva de las Sierras</span>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-8 text-premium-ink/50">
                                    <span className="material-symbols-outlined text-4xl mb-2 text-premium-sage">search</span>
                                    <p className="text-sm">Ingresa tu número de reserva para continuar</p>
                                </div>
                            )}
                            <div className="h-px bg-premium-ink/10 my-4"></div>
                            <div
                                className="p-4 rounded-premium border"
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
