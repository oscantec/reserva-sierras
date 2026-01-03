import { useState } from 'react'
import { supabase } from '../../utils/supabaseClient'
import { useAuth } from '../../contexts/AuthContext'

export default function Seguridad() {
    const { user } = useAuth()
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState({ type: '', text: '' })
    const [passwords, setPasswords] = useState({
        new: '',
        confirm: ''
    })

    const handleUpdatePassword = async (e) => {
        e.preventDefault()
        setMessage({ type: '', text: '' })

        if (passwords.new !== passwords.confirm) {
            setMessage({ type: 'error', text: 'Las contraseñas no coinciden' })
            return
        }

        if (passwords.new.length < 6) {
            setMessage({ type: 'error', text: 'La contraseña debe tener al menos 6 caracteres' })
            return
        }

        setLoading(true)
        try {
            const { error } = await supabase.auth.updateUser({
                password: passwords.new
            })

            if (error) throw error

            setMessage({ type: 'success', text: 'Contraseña actualizada correctamente' })
            setPasswords({ new: '', confirm: '' })
        } catch (error) {
            setMessage({ type: 'error', text: error.message })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-col h-full bg-background-light dark:bg-background-dark">
            <header className="bg-white dark:bg-surface-card-dark border-b border-border-card dark:border-border-card-dark px-6 py-4">
                <div className="flex flex-col gap-3">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Seguridad</h1>
                        <p className="text-text-subtitle dark:text-text-subtitle-dark text-sm">Gestiona el acceso y la protección de tu cuenta administrativa</p>
                    </div>
                    <div className="h-2 w-full rounded-full bg-icon-bg-secondary dark:bg-border-card-dark relative overflow-hidden">
                        <div className="absolute top-0 left-0 h-full w-full bg-primary rounded-full"></div>
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-2xl space-y-6">
                    {/* User Info Card */}
                    <div className="bg-white dark:bg-surface-card-dark rounded-2xl border border-border-card dark:border-border-card-dark p-6 shadow-sm">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                                <span className="material-symbols-outlined text-primary text-2xl">admin_panel_settings</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white">Sesión Activa</h3>
                                <p className="text-sm text-text-muted">{user?.email}</p>
                            </div>
                        </div>

                        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-gray-400">shield</span>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    Tu cuenta está protegida por <strong>Supabase Auth</strong> con cifrado industrial y tokens de sesión seguros.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Change Password Form */}
                    <div className="bg-white dark:bg-surface-card-dark rounded-2xl border border-border-card dark:border-border-card-dark p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined">key</span>
                            Cambiar Contraseña
                        </h3>

                        {message.text && (
                            <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${message.type === 'success'
                                ? 'bg-green-50 text-green-700 border border-green-200'
                                : 'bg-red-50 text-red-700 border border-red-200'
                                }`}>
                                <span className="material-symbols-outlined">
                                    {message.type === 'success' ? 'check_circle' : 'error'}
                                </span>
                                {message.text}
                            </div>
                        )}

                        <form onSubmit={handleUpdatePassword} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Nueva Contraseña
                                </label>
                                <input
                                    type="password"
                                    value={passwords.new}
                                    onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                    required
                                    placeholder="Mínimo 6 caracteres"
                                    className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Confirmar Nueva Contraseña
                                </label>
                                <input
                                    type="password"
                                    value={passwords.confirm}
                                    onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                    required
                                    placeholder="Repite la contraseña"
                                    className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full sm:w-auto px-8 py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Actualizando...
                                    </>
                                ) : 'Guardar Nueva Contraseña'}
                            </button>
                        </form>
                    </div>

                    {/* Security Recommendations */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-5 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-gray-700">
                            <span className="material-symbols-outlined text-primary mb-2">info</span>
                            <h4 className="font-bold text-gray-900 dark:text-gray-100 text-sm">Contraseña Robusta</h4>
                            <p className="text-xs text-text-muted mt-1">
                                Usa una combinación de letras, números y símbolos para mayor seguridad.
                            </p>
                        </div>
                        <div className="p-5 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-gray-700">
                            <span className="material-symbols-outlined text-primary mb-2">lock_reset</span>
                            <h4 className="font-bold text-gray-900 dark:text-gray-100 text-sm">Expiración de Sesión</h4>
                            <p className="text-xs text-text-muted mt-1">
                                Tu sesión se cerrará automáticamente periódicamente por seguridad.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
