import { useState, useEffect } from 'react'
import { fetchReservasData } from '../utils/googleSheets'
import qrImage from '/src/images/QR RS.png'
import { DEFAULT_CONFIG } from '../utils/config'

export default function PaymentSection() {
    const [config, setConfig] = useState({
        paymentAdvancePercent: DEFAULT_CONFIG.paymentAdvancePercent,
        paymentBalancePercent: DEFAULT_CONFIG.paymentBalancePercent,
        paymentBbreEmail: DEFAULT_CONFIG.paymentBbreEmail,
        paymentBbrePhone: DEFAULT_CONFIG.paymentBbrePhone,
        paymentNequiNumber: DEFAULT_CONFIG.paymentNequiNumber,
        paymentNequiName: DEFAULT_CONFIG.paymentNequiName,
        paymentQRImageUrl: DEFAULT_CONFIG.paymentQRImageUrl,
        paymentWhatsappNumber: DEFAULT_CONFIG.paymentWhatsappNumber,
        paymentWhatsappMessage: DEFAULT_CONFIG.paymentWhatsappMessage,
        paymentSubtitlePart1: DEFAULT_CONFIG.paymentSubtitlePart1,
        paymentSubtitleHighlight: DEFAULT_CONFIG.paymentSubtitleHighlight,
        paymentSubtitlePart2: DEFAULT_CONFIG.paymentSubtitlePart2,
    })

    const [selectedMethod, setSelectedMethod] = useState(null)
    const [showModal, setShowModal] = useState(false)

    // Two-step validation state
    const [reservationRef, setReservationRef] = useState('')
    const [codigoUnico, setCodigoUnico] = useState('')
    const [validationError, setValidationError] = useState('')
    const [validatedReservation, setValidatedReservation] = useState(null)
    const [isValidating, setIsValidating] = useState(false)
    const [reservationData, setReservationData] = useState(null) // Cached data from DB

    // Load payment config from API first, then localStorage
    useEffect(() => {
        const loadConfig = async () => {
            // 1. Try API first
            try {
                const response = await fetch('/api/config')
                if (response.ok) {
                    const parsed = await response.json()
                    if (Object.keys(parsed).length > 0) {
                        setConfig(prev => ({ ...prev, ...parsed }))
                        localStorage.setItem('casacampestre_config', JSON.stringify(parsed))
                        return
                    }
                }
            } catch (e) {
                console.log('API not available')
            }
            // 2. Fallback to localStorage
            const saved = localStorage.getItem('casacampestre_config')
            if (saved) {
                const parsed = JSON.parse(saved)
                setConfig(prev => ({ ...prev, ...parsed }))
            }
        }
        loadConfig()
    }, [])

    const paymentMethods = [
        { id: 'qr', icon: 'qr_code_2', label: 'Código QR', desc: 'Escanea y paga al instante' },
        { id: 'bbre', icon: 'key', label: 'B-Bre (Llave)', desc: 'Correo o teléfono' },
        { id: 'nequi', icon: 'smartphone', label: 'Nequi', desc: 'Pago móvil rápido' },
    ]

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text)
        alert('¡Copiado al portapapeles!')
    }

    // Handle method selection - open modal
    const handleMethodClick = (methodId) => {
        setSelectedMethod(methodId)
        setShowModal(true)
        setReservationRef('')
        setCodigoUnico('')
        setValidationError('')
        setValidatedReservation(null)
        setReservationData(null)
    }

    // Lookup and validate reservation with both fields
    const validateAccess = async () => {
        const trimmedRef = reservationRef.trim()
        const trimmedCodigo = codigoUnico.trim()

        if (!trimmedRef || !trimmedCodigo) {
            setValidationError('Completa ambos campos para continuar')
            return
        }

        setIsValidating(true)
        setValidationError('')

        try {
            // Fetch real data from Google Sheets
            const data = await fetchReservasData()

            if (!data || data.length === 0) {
                setValidationError('No se pudo conectar con la base de datos.')
                setIsValidating(false)
                return
            }

            // Data is an array of objects where each key is a column header
            const headers = Object.keys(data[0] || {})

            // Find the keys that match our expected column names (case-insensitive)
            const findKey = (searchTerms) => {
                return headers.find(h => {
                    const lower = h.toLowerCase()
                    return searchTerms.some(term => lower.includes(term))
                })
            }

            const idKey = findKey(['id', 'referencia', 'reserva'])
            const clienteKey = findKey(['cliente', 'nombre', 'huesped', 'huésped'])
            const totalKey = findKey(['total', 'valor'])
            const abonoKey = findKey(['abono', 'pago', 'anticipo', 'deposito', 'depósito'])
            const estadoKey = findKey(['estado', 'status'])
            const codigoUnicoKey = findKey(['codigo unico', 'código único', 'codigounico', 'códigounico', 'codigo_unico', 'código_único', 'unico', 'único'])

            // Search for the reservation by ID first
            const normalizedRef = trimmedRef.toUpperCase()
            const normalizedCodigo = trimmedCodigo.toUpperCase()

            const foundRow = data.find(row => {
                const rowId = String(row[idKey] || '').trim().toUpperCase()
                return rowId === normalizedRef
            })

            if (!foundRow) {
                setValidationError('Reserva no encontrada.')
                setIsValidating(false)
                return
            }

            // Now validate the Codigo Unico
            const rowCodigo = String(foundRow[codigoUnicoKey] || '').trim().toUpperCase()

            if (rowCodigo !== normalizedCodigo) {
                setValidationError('Código de acceso incorrecto.')
                setIsValidating(false)
                return
            }

            // Both validated! Build reservation object
            const reservation = {
                id: foundRow[idKey] || trimmedRef,
                cliente: foundRow[clienteKey] || 'Cliente',
                total: parseFloat(String(foundRow[totalKey] || '0').replace(/[^0-9.-]/g, '')) || 0,
                abono: parseFloat(String(foundRow[abonoKey] || '0').replace(/[^0-9.-]/g, '')) || 0,
                estado: foundRow[estadoKey] || 'Pendiente'
            }

            setValidatedReservation(reservation)
            setIsValidating(false)

        } catch (error) {
            console.error('Error fetching reservation:', error)
            setValidationError('Error al verificar. Intenta de nuevo.')
            setIsValidating(false)
        }
    }

    // Handle Enter key press
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            validateAccess()
        }
    }

    // Close modal and reset state
    const closeModal = () => {
        setShowModal(false)
        setSelectedMethod(null)
        setReservationRef('')
        setCodigoUnico('')
        setValidationError('')
        setValidatedReservation(null)
    }

    // Format currency
    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(price)
    }

    // Get QR image source
    const qrImageSrc = config.paymentQRImageUrl || qrImage

    // Get selected method details
    const getSelectedMethodInfo = () => {
        return paymentMethods.find(m => m.id === selectedMethod)
    }

    return (
        <section className="px-4 py-6 md:py-10 bg-page-bg-inicio dark:bg-surface-card-dark">
            <div className="max-w-7xl mx-auto">
                {/* Header - Unified left-aligned style */}
                <div className="flex flex-col gap-2 mb-3 md:mb-4">
                    <div className="flex justify-between items-end">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em] mb-2">Pagar Reserva</h2>
                            <p className="text-text-main-light dark:text-text-muted text-base">
                                {config.paymentSubtitlePart1}{' '}
                                <strong className="font-bold">{config.paymentSubtitleHighlight}</strong>{' '}
                                {config.paymentSubtitlePart2}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Payment Method Selector - Grid Layout */}
                <div className="max-w-2xl mx-auto">
                    <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3 text-center">Método de Pago</p>
                    <div className="grid grid-cols-3 gap-3">
                        {paymentMethods.map((method) => (
                            <button
                                key={method.id}
                                onClick={() => handleMethodClick(method.id)}
                                className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-transparent bg-surface-card dark:bg-surface-card-dark hover:border-primary hover:shadow-md hover:scale-[1.02] transition-all text-center group"
                            >
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-icon-bg-primary text-icon-color group-hover:bg-primary group-hover:text-white transition-colors">
                                    <span className="material-symbols-outlined text-2xl">{method.icon}</span>
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-text-main-light dark:text-white">{method.label}</p>
                                    <p className="text-xs text-text-muted dark:text-text-muted hidden sm:block">{method.desc}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Modal Overlay */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-surface-card dark:bg-surface-card-dark rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-4 border-b border-border-card dark:border-border-card-dark">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-icon-bg-primary text-icon-color">
                                    <span className="material-symbols-outlined text-xl">{getSelectedMethodInfo()?.icon}</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-text-main-light dark:text-white">{getSelectedMethodInfo()?.label}</h3>
                                    <p className="text-xs text-text-muted">{getSelectedMethodInfo()?.desc}</p>
                                </div>
                            </div>
                            <button
                                onClick={closeModal}
                                className="p-2 hover:bg-icon-bg-primary dark:hover:bg-gray-800 rounded-full transition-colors"
                            >
                                <span className="material-symbols-outlined text-text-muted">close</span>
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6">
                            {!validatedReservation ? (
                                /* Step 1: Two-field validation form */
                                <div className="space-y-5">
                                    <div className="text-center mb-6">
                                        <div className="w-16 h-16 bg-icon-bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                                            <span className="material-symbols-outlined text-icon-color text-3xl">lock</span>
                                        </div>
                                        <h4 className="text-lg font-bold text-text-main-light dark:text-white mb-1">Acceso Privado</h4>
                                        <p className="text-sm text-text-muted">Ingresa tus datos de acceso</p>
                                    </div>

                                    {/* Reservation Reference Field */}
                                    <div>
                                        <label className="block text-sm font-medium text-text-main-light dark:text-white mb-2">
                                            Número de Reserva
                                        </label>
                                        <input
                                            type="text"
                                            value={reservationRef}
                                            onChange={(e) => {
                                                setReservationRef(e.target.value.toUpperCase())
                                                setValidationError('')
                                            }}
                                            onKeyPress={handleKeyPress}
                                            placeholder="Ingresa tu reserva"
                                            autoComplete="off"
                                            className="w-full px-4 py-3 text-center text-xl font-mono font-bold border-2 rounded-xl bg-page-bg-inicio dark:bg-surface-card-dark text-text-main-light dark:text-white focus:ring-2 focus:ring-primary transition-all border-border-card dark:border-border-card-dark focus:border-primary"
                                        />
                                    </div>

                                    {/* Codigo Unico Field */}
                                    <div>
                                        <label className="block text-sm font-medium text-text-main-light dark:text-white mb-2">
                                            Código de Acceso
                                        </label>
                                        <input
                                            type="text"
                                            value={codigoUnico}
                                            onChange={(e) => {
                                                setCodigoUnico(e.target.value.toUpperCase())
                                                setValidationError('')
                                            }}
                                            onKeyPress={handleKeyPress}
                                            placeholder="Ingresa tu código"
                                            autoComplete="off"
                                            className="w-full px-4 py-3 text-center text-xl font-mono font-bold border-2 rounded-xl bg-page-bg-inicio dark:bg-surface-card-dark text-text-main-light dark:text-white focus:ring-2 focus:ring-primary transition-all border-border-card dark:border-border-card-dark focus:border-primary"
                                        />
                                    </div>

                                    {validationError && (
                                        <p className="text-sm text-red-500 flex items-center justify-center gap-1">
                                            <span className="material-symbols-outlined text-sm">error</span>
                                            {validationError}
                                        </p>
                                    )}

                                    <button
                                        onClick={validateAccess}
                                        disabled={isValidating || !reservationRef.trim() || !codigoUnico.trim()}
                                        className="w-full py-3 px-6 rounded-xl bg-primary hover:bg-btn-primary-hover disabled:bg-border-card disabled:cursor-not-allowed text-white font-bold shadow-lg shadow-card transition-all flex items-center justify-center gap-2"
                                    >
                                        {isValidating ? (
                                            <>
                                                <span className="material-symbols-outlined animate-spin">sync</span>
                                                Verificando...
                                            </>
                                        ) : (
                                            <>
                                                <span className="material-symbols-outlined">login</span>
                                                Acceder
                                            </>
                                        )}
                                    </button>
                                </div>
                            ) : (
                                /* Step 2: Show Reservation Info + Payment Details - Reservas.jsx style */
                                <div className="space-y-6">
                                    {/* Reservation Summary Card - Reservas.jsx style */}
                                    <div className="bg-surface-card dark:bg-surface-card-dark rounded-2xl p-6 shadow-xl shadow-gray-200/50 dark:shadow-black/20 border border-border-card dark:border-border-card-dark">
                                        <div className="flex justify-between items-center mb-6">
                                            <h3 className="text-lg font-bold">Tu Reserva</h3>
                                            <span className="bg-icon-bg-primary dark:bg-icon-bg-dark text-icon-color text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                                                <span className="material-symbols-outlined text-sm">verified</span>
                                                Verificada
                                            </span>
                                        </div>

                                        {/* Reference and Client Info */}
                                        <div className="flex gap-4 mb-6">
                                            <div className="flex-1 p-3 rounded-lg border border-border-card dark:border-border-card-dark bg-page-bg-inicio dark:bg-surface-card-dark">
                                                <p className="text-xs text-text-muted uppercase font-bold mb-1">Referencia</p>
                                                <p className="font-bold text-sm">{validatedReservation.id}</p>
                                            </div>
                                            <div className="flex-1 p-3 rounded-lg border border-border-card dark:border-border-card-dark bg-page-bg-inicio dark:bg-surface-card-dark">
                                                <p className="text-xs text-text-muted uppercase font-bold mb-1">Cliente</p>
                                                <p className="font-bold text-sm truncate">{validatedReservation.cliente}</p>
                                            </div>
                                        </div>

                                        {/* Financial Details */}
                                        <div className="flex flex-col gap-2 mb-6">
                                            <div className="flex justify-between text-sm text-text-muted dark:text-text-muted">
                                                <span>Total reserva</span>
                                                <span className="font-medium">{formatPrice(validatedReservation.total)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm text-success-text dark:text-green-400">
                                                <span>Abono pagado</span>
                                                <span className="font-medium">{formatPrice(validatedReservation.abono)}</span>
                                            </div>
                                            <div className="h-px bg-icon-bg-primary dark:bg-border-card-dark my-2"></div>
                                            <div className="flex justify-between items-center">
                                                <span className="font-bold text-lg">Saldo pendiente</span>
                                                <span className="font-black text-2xl text-icon-color">{formatPrice(validatedReservation.total - validatedReservation.abono)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Payment Method Details */}
                                    <div>
                                        <h4 className="font-bold text-text-main-light dark:text-white mb-4 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-icon-color">payment</span>
                                            Datos de Pago
                                        </h4>

                                        {selectedMethod === 'qr' && (
                                            <div className="text-center">
                                                <div className="bg-surface-card dark:bg-surface-card-dark rounded-xl p-6 inline-block mb-4 border border-border-card dark:border-border-card-dark">
                                                    <img
                                                        src={qrImageSrc}
                                                        alt="Código QR de pago"
                                                        className="w-48 h-48 object-contain"
                                                    />
                                                </div>
                                                <p className="text-sm text-text-muted">
                                                    Escanea el código QR con la app de tu banco
                                                </p>
                                            </div>
                                        )}

                                        {selectedMethod === 'bbre' && (
                                            <div className="space-y-3">
                                                <div className="bg-surface-card dark:bg-surface-card-dark rounded-xl p-4 border border-border-card dark:border-border-card-dark">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="material-symbols-outlined text-blue-500">mail</span>
                                                        <span className="text-xs text-text-muted">Correo electrónico</span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <p className="font-mono font-bold text-text-main-light dark:text-white">{config.paymentBbreEmail}</p>
                                                        <button
                                                            onClick={() => copyToClipboard(config.paymentBbreEmail)}
                                                            className="p-2 hover:bg-icon-bg-primary dark:hover:bg-gray-800 rounded-lg transition-colors"
                                                        >
                                                            <span className="material-symbols-outlined text-icon-color text-sm">content_copy</span>
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="bg-surface-card dark:bg-surface-card-dark rounded-xl p-4 border border-border-card dark:border-border-card-dark">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="material-symbols-outlined text-icon-color">phone</span>
                                                        <span className="text-xs text-text-muted">Teléfono</span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <p className="font-mono font-bold text-lg text-text-main-light dark:text-white">{config.paymentBbrePhone}</p>
                                                        <button
                                                            onClick={() => copyToClipboard(config.paymentBbrePhone)}
                                                            className="p-2 hover:bg-icon-bg-primary dark:hover:bg-gray-800 rounded-lg transition-colors"
                                                        >
                                                            <span className="material-symbols-outlined text-icon-color text-sm">content_copy</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {selectedMethod === 'nequi' && (
                                            <div className="bg-surface-card dark:bg-surface-card-dark rounded-xl p-6 text-center border border-border-card dark:border-border-card-dark">
                                                <div className="w-16 h-16 bg-icon-bg-primary dark:bg-icon-bg-dark rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <span className="material-symbols-outlined text-icon-color dark:text-icon-color-dark text-3xl">smartphone</span>
                                                </div>
                                                <p className="text-sm text-icon-color dark:text-icon-color-dark mb-2">Envía tu pago al número</p>
                                                <p className="text-2xl font-black text-text-main-light dark:text-white tracking-wide mb-1">{config.paymentNequiNumber}</p>
                                                <p className="text-sm text-text-muted">A nombre de: <span className="font-bold text-text-accent">{config.paymentNequiName}</span></p>
                                                <button
                                                    onClick={() => copyToClipboard(config.paymentNequiNumber)}
                                                    className="mt-4 px-4 py-2 bg-icon-bg-primary dark:bg-icon-bg-dark hover:bg-icon-bg-secondary dark:hover:bg-icon-bg-dark rounded-lg text-icon-color dark:text-icon-color-dark text-sm font-medium transition-colors flex items-center gap-2 mx-auto"
                                                >
                                                    <span className="material-symbols-outlined text-sm">content_copy</span>
                                                    Copiar número
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Info Box - Green theme */}
                                    <div className="bg-icon-bg-primary dark:bg-icon-bg-dark rounded-xl p-4 flex items-start gap-3 border border-border-card dark:border-border-card-dark">
                                        <span className="material-symbols-outlined text-icon-color mt-0.5">info</span>
                                        <p className="text-sm text-text-main-light dark:text-text-subtitle-dark">
                                            Realiza el pago y envía el comprobante por WhatsApp para confirmar tu reserva.
                                        </p>
                                    </div>

                                    {/* CTA Button - WhatsApp */}
                                    <button
                                        onClick={() => {
                                            // Build WhatsApp message with reservation reference
                                            const fullMessage = `${config.paymentWhatsappMessage}\n\nReserva: ${validatedReservation.id}\nCliente: ${validatedReservation.cliente}`
                                            const encodedMessage = encodeURIComponent(fullMessage)
                                            const whatsappNumber = config.paymentWhatsappNumber.replace(/\D/g, '') // Remove non-digits
                                            window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, '_blank')
                                        }}
                                        className="w-full h-12 rounded-lg bg-primary hover:bg-btn-primary-hover text-white font-bold text-base shadow-lg shadow-primary/30 transition-all transform active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-sm">send</span>
                                        Enviar Comprobante por WhatsApp
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </section>
    )
}
