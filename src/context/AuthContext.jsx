import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

const API_URL = 'http://localhost:3001/api'

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    // On mount, check for stored token and validate it
    useEffect(() => {
        async function checkAuth() {
            const token = localStorage.getItem('hc_token')
            if (!token) {
                // Fall back to legacy mock user
                try {
                    const stored = localStorage.getItem('hc_user')
                    if (stored) setUser(JSON.parse(stored))
                } catch { /* ignore */ }
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
                    // Token expired / invalid
                    localStorage.removeItem('hc_token')
                }
            } catch (err) {
                console.warn('Auth check failed, using offline mode')
                // If server is down, try legacy user
                try {
                    const stored = localStorage.getItem('hc_user')
                    if (stored) setUser(JSON.parse(stored))
                } catch { /* ignore */ }
            }
            setLoading(false)
        }
        checkAuth()
    }, [])

    // Mock login (for username/password form — no real backend)
    const login = (username) => {
        const userData = { username, loginAt: new Date().toISOString() }
        localStorage.setItem('hc_user', JSON.stringify(userData))
        setUser(userData)
    }

    // Real login via Discord OAuth token
    const loginWithToken = async (token) => {
        localStorage.setItem('hc_token', token)
        try {
            const res = await fetch(`${API_URL}/auth/me`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            if (res.ok) {
                const data = await res.json()
                // Also store as legacy user for dashboard compatibility
                localStorage.setItem('hc_user', JSON.stringify({
                    username: data.user.globalName || data.user.username,
                    discordId: data.user.discordId,
                    avatar: data.user.avatarUrl,
                    email: data.user.email,
                    role: data.user.role,
                    loginAt: new Date().toISOString(),
                }))
                setUser(data.user)
                return true
            }
        } catch (err) {
            console.error('Token login failed:', err)
        }
        return false
    }

    const logout = () => {
        localStorage.removeItem('hc_token')
        localStorage.removeItem('hc_user')
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

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            login,
            loginWithToken,
            loginWithDiscord,
            loginWithGoogle,
            logout,
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    return useContext(AuthContext)
}
