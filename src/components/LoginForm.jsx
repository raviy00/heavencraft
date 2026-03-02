import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function LoginForm() {
    const { login } = useAuth()
    const [form, setForm] = useState({ username: '', password: '', remember: false })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        setError('')

        if (!form.username.trim()) {
            setError('Please enter your Minecraft username.')
            return
        }
        if (!form.password) {
            setError('Please enter your password.')
            return
        }

        setLoading(true)
        // Simulate async login — replace with real API call in production
        setTimeout(() => {
            login(form.username.trim())
            setLoading(false)
        }, 1200)
    }

    return (
        <div>
            {/* Heading */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined" style={{ color: '#258cf4' }}>
                        login
                    </span>
                    Login
                </h2>
                <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                    Welcome back, adventurer.
                </p>
            </div>

            {/* Error banner */}
            {error && (
                <div
                    className="mb-4 px-4 py-3 rounded flex items-center gap-2 text-sm"
                    style={{
                        background: 'rgba(239,68,68,0.12)',
                        border: '1px solid rgba(239,68,68,0.3)',
                        color: '#fca5a5',
                    }}
                >
                    <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>
                        error
                    </span>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                {/* Username */}
                <div className="space-y-2">
                    <label
                        htmlFor="login-username"
                        className="block text-xs font-bold uppercase tracking-wider"
                        style={{ color: '#64748b' }}
                    >
                        Minecraft Username
                    </label>
                    <input
                        id="login-username"
                        name="username"
                        type="text"
                        autoComplete="username"
                        placeholder="e.g. Steve_Craft"
                        value={form.username}
                        onChange={handleChange}
                        className="chiseled-input"
                    />
                </div>

                {/* Password */}
                <div className="space-y-2">
                    <label
                        htmlFor="login-password"
                        className="block text-xs font-bold uppercase tracking-wider"
                        style={{ color: '#64748b' }}
                    >
                        Password
                    </label>
                    <input
                        id="login-password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        placeholder="••••••••"
                        value={form.password}
                        onChange={handleChange}
                        className="chiseled-input"
                    />
                </div>

                {/* Remember + Forgot */}
                <div className="flex items-center justify-between text-xs">
                    <label className="flex items-center gap-2 cursor-pointer" style={{ color: '#94a3b8' }}>
                        <input
                            id="login-remember"
                            name="remember"
                            type="checkbox"
                            checked={form.remember}
                            onChange={handleChange}
                            className="rounded"
                            style={{ accentColor: '#258cf4' }}
                        />
                        Remember me
                    </label>
                    <a
                        href="#"
                        className="hover:underline transition-colors"
                        style={{ color: '#258cf4' }}
                    >
                        Forgot password?
                    </a>
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full font-bold py-4 rounded pixel-border flex items-center justify-center gap-2"
                    style={{
                        background: loading ? 'rgba(37,140,244,0.6)' : '#258cf4',
                        color: 'white',
                        cursor: loading ? 'not-allowed' : 'pointer',
                    }}
                >
                    {loading ? (
                        <>
                            <span
                                className="material-symbols-outlined"
                                style={{ fontSize: '1.1rem', animation: 'spin 1s linear infinite' }}
                            >
                                progress_activity
                            </span>
                            Logging in…
                        </>
                    ) : (
                        'LOG INTO REALM'
                    )}
                </button>
            </form>

            <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
        </div>
    )
}
