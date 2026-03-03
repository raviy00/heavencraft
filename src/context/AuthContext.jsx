import { createContext, useContext, useState, useEffect } from 'react'
import { authApi } from '../api'

const AuthContext = createContext(null)

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    // On mount, check for stored token and validate it with the server
    useEffect(() => {
        async function checkAuth() {
            const token = localStorage.getItem('hc_token')
            if (!token) {
                setLoading(false)
                return
            }

            try {
                const res = await fetch(`${API_URL}/auth/me`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
                if (res.ok) {
                    const data = await res.json()
                    setUser(data.user)
                } else {
                    // Token expired or invalid — clear it
                    localStorage.removeItem('hc_token')
                }
            } catch {
                // Server unreachable — do not fall back to localStorage user;
                // treat as unauthenticated to avoid security bypass
                console.warn('Auth check failed: server unreachable')
            }
            setLoading(false)
        }
        checkAuth()
    }, [])

    // Login with local username/password
    const login = async (username, password) => {
        try {
            const res = await authApi.login({ username, password })
            localStorage.setItem('hc_token', res.token)
            setUser(res.user)
            return true
        } catch (err) {
            console.error('Login failed:', err)
            throw new Error(err.message || 'Login failed')
        }
    }

    const register = async (username, email, password) => {
        try {
            await authApi.register({ username, email, password })
            // Do not log in automatically, user will go to login page
            return true
        } catch (err) {
            console.error('Registration failed:', err)
            throw new Error(err.message || 'Registration failed')
        }
    }

    // Login via OAuth token (Discord / Google / Microsoft callback)
    const loginWithToken = async (token) => {
        localStorage.setItem('hc_token', token)
        try {
            const res = await fetch(`${API_URL}/auth/me`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            if (res.ok) {
                const data = await res.json()
                setUser(data.user)
                return true
            }
        } catch (err) {
            console.error('Token login failed:', err)
        }
        localStorage.removeItem('hc_token')
        return false
    }

    const logout = () => {
        localStorage.removeItem('hc_token')
        setUser(null)
    }

    // Discord OAuth redirect
    const loginWithDiscord = () => {
        window.location.href = `${API_URL}/auth/discord`
    }

    // Google OAuth redirect
    const loginWithGoogle = () => {
        window.location.href = `${API_URL}/auth/google`
    }

    // Microsoft OAuth redirect
    const loginWithMicrosoft = () => {
        window.location.href = `${API_URL}/auth/microsoft`
    }

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            login,
            register,
            logout,
            loginWithToken,
            loginWithDiscord,
            loginWithGoogle,
            loginWithMicrosoft,
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    return useContext(AuthContext)
}
