import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'

// ─── All character images ───
const IMAGES = [
    '/images/auth/card-pic-1.jpg',
    '/images/auth/card-pic-2.jpg',
    '/images/auth/card-pic-3.jpg',
    '/images/auth/card-pic-4.jpg',
    '/images/auth/card-pic-5.jpg',
    '/images/auth/card-pic-6.jpg',
    '/images/auth/card-pic-7.jpg',
]

// ─── Image carousel with auto-rotate + manual buttons ───
function ImageCarousel() {
    const [current, setCurrent] = useState(0)
    const [paused, setPaused] = useState(false)

    const next = useCallback(() => setCurrent(i => (i + 1) % IMAGES.length), [])
    const prev = useCallback(() => setCurrent(i => (i - 1 + IMAGES.length) % IMAGES.length), [])

    // Auto-advance every 4 seconds
    useEffect(() => {
        if (paused) return
        const id = setInterval(next, 4000)
        return () => clearInterval(id)
    }, [paused, next])

    return (
        <div
            className="auth-carousel"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
        >
            {/* Images stack — crossfade */}
            {IMAGES.map((src, i) => (
                <img
                    key={src}
                    src={src}
                    alt={`Character ${i + 1}`}
                    className="auth-carousel-img"
                    style={{
                        opacity: i === current ? 1 : 0,
                        transform: i === current ? 'scale(1)' : 'scale(0.95)',
                    }}
                />
            ))}

            {/* Nav buttons */}
            <button onClick={prev} className="auth-carousel-btn carousel-prev" aria-label="Previous image">
                <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>chevron_left</span>
            </button>
            <button onClick={next} className="auth-carousel-btn carousel-next" aria-label="Next image">
                <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>chevron_right</span>
            </button>

            {/* Dots */}
            <div className="auth-carousel-dots">
                {IMAGES.map((_, i) => (
                    <button
                        key={i}
                        className={`auth-dot ${i === current ? 'auth-dot-active' : ''}`}
                        onClick={() => setCurrent(i)}
                        aria-label={`Image ${i + 1}`}
                    />
                ))}
            </div>
        </div>
    )
}

// ─── Main AuthCard ───
export default function AuthCard({ initialView = 'login' }) {
    const [view, setView] = useState(initialView)

    useEffect(() => {
        setView(initialView)
    }, [initialView])

    return (
        <div className="auth-card-wrapper" style={{ animation: 'cardAppear 0.45s cubic-bezier(0.34,1.56,0.64,1) both' }}>
            {/* Character image carousel — left side */}
            <div className="auth-card-character">
                <ImageCarousel />
            </div>

            {/* Form — right side */}
            <div className="auth-card-form">
                {view === 'login' && <LoginPanel onSwitch={() => setView('register')} onForgot={() => setView('forgot')} />}
                {view === 'register' && <RegisterPanel onSwitch={() => setView('login')} />}
                {view === 'forgot' && <ForgotPanel onBack={() => setView('login')} />}
            </div>
        </div>
    )
}

// ─── Login Panel ───
function LoginPanel({ onSwitch, onForgot }) {
    const { login } = useAuth()
    const [form, setForm] = useState({ username: '', password: '', remember: false })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const onChange = e => {
        const { name, value, type, checked } = e.target
        setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    }

    const onSubmit = async e => {
        e.preventDefault()
        setError('')
        if (!form.username.trim()) return setError('Enter your Minecraft username.')
        if (!form.password) return setError('Enter your password.')

        setLoading(true)
        try {
            await login(form.username.trim(), form.password)
            // Redirect happens automatically if AuthContext provides one or AuthModal handles it
        } catch (err) {
            setError(err.message || 'Invalid username or password')
            setLoading(false)
        }
    }

    return (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <h2 className="auth-card-title" style={{ color: '#258cf4' }}>Member Login</h2>
            <p className="auth-card-subtitle">Welcome back to Heavencraft!</p>

            {error && (
                <div className="auth-error">
                    <span className="material-symbols-outlined" style={{ fontSize: '0.95rem' }}>error</span>
                    {error}
                </div>
            )}

            <form onSubmit={onSubmit} className="auth-form-fields" noValidate>
                <div className="auth-input-wrap">
                    <input name="username" type="text" placeholder="Minecraft Username"
                        value={form.username} onChange={onChange} autoComplete="username" className="auth-input" />
                    <span className="material-symbols-outlined auth-input-icon">person</span>
                </div>

                <div className="auth-input-wrap">
                    <input name="password" type="password" placeholder="Password"
                        value={form.password} onChange={onChange} autoComplete="current-password" className="auth-input" />
                    <span className="material-symbols-outlined auth-input-icon">lock</span>
                </div>

                <div className="auth-row-between">
                    <label className="auth-check-label">
                        <input name="remember" type="checkbox" checked={form.remember} onChange={onChange} />
                        Remember me
                    </label>
                    <button type="button" onClick={onForgot} className="auth-link" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Forgot password?</button>
                </div>

                <button type="submit" disabled={loading} className="auth-submit-btn login-btn">
                    {loading ? <><span className="material-symbols-outlined spin-icon" style={{ fontSize: '1rem' }}>progress_activity</span> Logging in…</> : 'Login'}
                </button>
            </form>

            <p className="auth-switch-text">
                Don't have an account?{' '}
                <button onClick={onSwitch} className="auth-switch-link">Register</button>
            </p>
        </div>
    )
}

// ─── Register Panel ───
function RegisterPanel({ onSwitch }) {
    const { register } = useAuth()
    const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    const onChange = e => {
        const { name, value } = e.target
        setForm(prev => ({ ...prev, [name]: value }))
    }

    const validate = () => {
        if (!form.username.trim()) return 'Enter your Minecraft username.'
        if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Enter a valid email.'
        if (form.password.length < 8) return 'Password must be 8+ characters.'
        if (form.password !== form.confirm) return 'Passwords do not match.'
        return ''
    }

    const onSubmit = async e => {
        e.preventDefault()
        setError(''); setSuccess(false)
        const err = validate()
        if (err) return setError(err)

        setLoading(true)
        try {
            await register(form.username.trim(), form.email, form.password)
            setSuccess(true)
            setForm({ username: '', email: '', password: '', confirm: '' })

            // Wait briefly before making them switch entirely, or let AuthContext handle auto-login if you prefer.
            // Since user logic requested "must login using credentials", we'll flip them to login view.
            setTimeout(() => {
                onSwitch()
            }, 1000)
        } catch (err) {
            setError(err.message || 'Failed to create account. Username/email may exist.')
            setLoading(false)
        }
    }

    return (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <h2 className="auth-card-title" style={{ color: '#ffb800' }}>Register</h2>
            <p className="auth-card-subtitle">Join Heavencraft and start your adventure!</p>

            {success && (
                <div className="auth-success">
                    <span className="material-symbols-outlined" style={{ fontSize: '0.95rem' }}>check_circle</span>
                    Account created! Check your email.
                </div>
            )}

            {error && (
                <div className="auth-error">
                    <span className="material-symbols-outlined" style={{ fontSize: '0.95rem' }}>error</span>
                    {error}
                </div>
            )}

            <form onSubmit={onSubmit} className="auth-form-fields" noValidate>
                <div className="auth-input-wrap">
                    <input name="username" type="text" placeholder="Minecraft Username"
                        value={form.username} onChange={onChange} autoComplete="username" className="auth-input" />
                    <span className="material-symbols-outlined auth-input-icon">person</span>
                </div>

                <div className="auth-input-wrap">
                    <input name="email" type="email" placeholder="Email"
                        value={form.email} onChange={onChange} autoComplete="email" className="auth-input" />
                    <span className="material-symbols-outlined auth-input-icon">mail</span>
                </div>

                <div className="auth-input-wrap">
                    <input name="password" type="password" placeholder="Your password"
                        value={form.password} onChange={onChange} autoComplete="new-password" className="auth-input" />
                    <span className="material-symbols-outlined auth-input-icon">lock</span>
                </div>

                <div className="auth-input-wrap">
                    <input name="confirm" type="password" placeholder="Repeat your password"
                        value={form.confirm} onChange={onChange} autoComplete="new-password" className="auth-input" />
                    <span className="material-symbols-outlined auth-input-icon">lock</span>
                </div>

                <button type="submit" disabled={loading} className="auth-submit-btn register-btn">
                    {loading ? <><span className="material-symbols-outlined spin-icon" style={{ fontSize: '1rem' }}>progress_activity</span> Creating…</> : 'Register'}
                </button>
            </form>

            <p className="auth-switch-text">
                Have an account?{' '}
                <button onClick={onSwitch} className="auth-switch-link">Sign-in</button>
            </p>
        </div>
    )
}

// ─── Forgot Password Panel ───
function ForgotPanel({ onBack }) {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')

    const onSubmit = async e => {
        e.preventDefault()
        if (!email.trim()) return setError('Enter your email address.')
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError('Enter a valid email.')

        setError('')
        setLoading(true)
        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim() }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Request failed')
            setMessage(data.message)
        } catch (err) {
            setError(err.message || 'Something went wrong. Try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <button
                onClick={onBack}
                className="auth-link"
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 0.75rem 0', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem' }}
            >
                <span className="material-symbols-outlined" style={{ fontSize: '0.95rem' }}>arrow_back</span>
                Back to login
            </button>

            <h2 className="auth-card-title" style={{ color: '#258cf4' }}>Forgot Password</h2>
            <p className="auth-card-subtitle">Enter your email to receive a reset link.</p>

            {message ? (
                <div className="auth-success">
                    <span className="material-symbols-outlined" style={{ fontSize: '0.95rem' }}>check_circle</span>
                    {message}
                </div>
            ) : (
                <>
                    {error && (
                        <div className="auth-error">
                            <span className="material-symbols-outlined" style={{ fontSize: '0.95rem' }}>error</span>
                            {error}
                        </div>
                    )}
                    <form onSubmit={onSubmit} className="auth-form-fields" noValidate>
                        <div className="auth-input-wrap">
                            <input
                                type="email"
                                placeholder="Email address"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                autoComplete="email"
                                className="auth-input"
                            />
                            <span className="material-symbols-outlined auth-input-icon">mail</span>
                        </div>
                        <button type="submit" disabled={loading} className="auth-submit-btn login-btn">
                            {loading
                                ? <><span className="material-symbols-outlined spin-icon" style={{ fontSize: '1rem' }}>progress_activity</span> Sending…</>
                                : 'Send Reset Link'
                            }
                        </button>
                    </form>
                </>
            )}
        </div>
    )
}
