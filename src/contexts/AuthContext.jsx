import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../utils/supabaseClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        // 1. Get initial session
        const getInitialSession = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            setUser(session?.user ?? null)
            setIsLoading(false)
        }

        getInitialSession()

        // 2. Listen for auth changes (login, logout, token refresh)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
            setIsLoading(false)
        })

        return () => subscription.unsubscribe()
    }, [])

    const login = async (email, password) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) throw error
            return { success: true, user: data.user }
        } catch (error) {
            console.error('Login error:', error.message)
            let errorMessage = 'Error al iniciar sesión'
            if (error.message.includes('Invalid login credentials')) {
                errorMessage = 'Credenciales incorrectas o usuario no registrado'
            } else if (error.message.includes('Email not confirmed')) {
                errorMessage = 'Debes confirmar tu correo. Revisa tu bandeja de entrada o Spam.'
            } else {
                errorMessage = error.message // Mostrar el error real de Supabase para diagnosticar
            }
            return { success: false, error: errorMessage }
        }
    }

    const signUp = async (email, password) => {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
            })
            if (error) throw error
            return { success: true, user: data.user }
        } catch (error) {
            return { success: false, error: error.message }
        }
    }

    const logout = async () => {
        try {
            await supabase.auth.signOut()
            setUser(null)
        } catch (error) {
            console.error('Logout error:', error)
        }
    }

    // Recover password functionality
    const resetPassword = async (email) => {
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/admin/reset-password`,
            })
            if (error) throw error
            return { success: true }
        } catch (error) {
            return { success: false, error: error.message }
        }
    }

    return (
        <AuthContext.Provider value={{
            isAuthenticated: !!user,
            user,
            isLoading,
            login,
            signUp,
            logout,
            resetPassword
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
