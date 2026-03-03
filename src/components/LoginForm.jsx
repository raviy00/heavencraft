import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function LoginForm() {
    const { login, verify } = useAuth()
    const navigate = useNavigate()
    const [form, setForm] = useState({ username: '', password: '', remember: false, code: '', email: '' })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [step, setStep] = useState('login') // 'login' or 'verify'

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    }

    const handleSubmit = async (e) => {
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
        try {
            const result = await login(form.username.trim(), form.password)
            if (result.requiresVerification) {
                setLoading(false)
                setForm(prev => ({ ...prev, email: result.email }))
                setStep('verify')
                return
            }
            navigate('/dashboard')
        } catch (err) {
            setError(err.message || 'Invalid username or password')
            setLoading(false)
        }
    }

    const handleVerify = async (e) => {
        e.preventDefault()
        setError('')
        if (!form.code.trim()) {
            setError('Please enter the verification code.')
            return
        }

        setLoading(true)
        try {
            await verify(form.email, form.code)
            navigate('/dashboard')
        } catch (err) {
            setError(err.message || 'Invalid verification code.')
            setLoading(false)
        }
    }

    return (
        <div>
            {/* Heading */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined" style={{ color: '#258cf4' }}>
                        {step === 'login' ? 'login' : 'mark_email_read'}
                    </span>
                    {step === 'login' ? 'Login' : 'Verify Email'}
                </h2>
                <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                    {step === 'login' ? 'Welcome back, adventurer.' : `We sent a code to ${form.email}`}
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

            {step === 'login' ? (
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
            ) : (
                <form onSubmit={handleVerify} className="space-y-5" noValidate>
                    <div className="space-y-2">
                        <label
                            htmlFor="verify-code"
                            className="block text-xs font-bold uppercase tracking-wider"
                            style={{ color: '#64748b' }}
                        >
                            6-Digit Verification Code
                        </label>
                        <input
                            id="verify-code"
                            name="code"
                            type="text"
                            placeholder="123456"
                            value={form.code}
                            onChange={handleChange}
                            className="chiseled-input chiseled-input-gold text-center tracking-[0.5em] text-xl"
                            maxLength={6}
                        />
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading || form.code.length !== 6}
                            className="w-full font-bold py-4 rounded pixel-border flex items-center justify-center gap-2"
                            style={{
                                background: (loading || form.code.length !== 6) ? 'rgba(37,140,244,0.6)' : '#258cf4',
                                color: 'white',
                                cursor: (loading || form.code.length !== 6) ? 'not-allowed' : 'pointer',
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
                                    Verifying…
                                </>
                            ) : (
                                'ENTER REALM'
                            )}
                        </button>
                    </div>
                    <button
                        type="button"
                        onClick={() => setStep('login')}
                        className="w-full text-sm text-slate-400 hover:text-white transition-colors py-2"
                    >
                        &larr; Back to login
                    </button>
                </form>
            )}

            <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
        </div>
    )
}
