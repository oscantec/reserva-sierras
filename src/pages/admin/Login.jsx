import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const { login } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    const from = location.state?.from?.pathname || '/admin'

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const result = await login(email, password)
            if (result.success) {
                setTimeout(() => {
                    navigate(from, { replace: true })
                }, 500)
            } else {
                setError(result.error)
                setLoading(false)
            }
        } catch (err) {
            setError('Ocurrió un fallo en la conexión. Intenta de nuevo.')
            setLoading(false)
        }
    }

    return (
        <div className="admin-login min-h-screen flex items-center justify-center p-4">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gray-200/50 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gray-200/50 rounded-full blur-3xl"></div>
            </div>

            <div className="relative w-full max-w-md">
                {/* Card */}
                <div className="admin-login__card bg-white rounded-3xl shadow-2xl shadow-green-900/10 p-8 border border-white/50">
                    {/* Logo & Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl shadow-lg shadow-card mb-4" style={{ background: 'linear-gradient(to bottom right, #2a8a0e, #1b4332)' }}>
                            <span className="material-symbols-outlined text-white text-3xl">cabin</span>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
                        <p className="text-text-muted mt-1">Reserva de las Sierras</p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div role="alert" className="mb-6 p-4 bg-gray-100 border border-gray-300 rounded-xl flex items-center gap-3">
                            <span className="material-symbols-outlined text-gray-700">error</span>
                            <p className="text-gray-800 text-sm font-medium">{error}</p>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email Field */}
                        <div>
                            <label htmlFor="admin-email" className="block text-sm font-semibold text-text-main-light mb-2">
                                Correo electrónico
                            </label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-xl">
                                    mail
                                </span>
                                <input
                                    type="email"
                                    id="admin-email"
                                    autoComplete="username"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@reservadelassierras.com"
                                    required
                                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2a8a0e] focus:border-transparent transition-all"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label htmlFor="admin-password" className="block text-sm font-semibold text-text-main-light mb-2">
                                Contraseña
                            </label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-xl">
                                    lock
                                </span>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="admin-password"
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="w-full pl-12 pr-12 py-3.5 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2a8a0e] focus:border-transparent transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                    aria-pressed={showPassword}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-muted transition-colors"
                                >
                                    <span className="material-symbols-outlined text-xl">
                                        {showPassword ? 'visibility_off' : 'visibility'}
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            style={{ background: 'linear-gradient(to right, #2a8a0e, #1b4332)' }}
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Verificando...
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined">login</span>
                                    Acceder al Panel
                                </>
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-8 pt-6 border-t border-border-card text-center">
                        <a
                            href="/"
                            className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-success-text transition-colors"
                        >
                            <span className="material-symbols-outlined text-lg">arrow_back</span>
                            Volver al sitio público
                        </a>
                    </div>
                </div>

                {/* Security Badge */}
                <div className="mt-6 flex items-center justify-center gap-2 text-text-muted text-xs">
                    <span className="material-symbols-outlined text-sm">verified_user</span>
                    Conexión segura • Sesión de 24 horas
                </div>
            </div>
        </div>
    )
}
