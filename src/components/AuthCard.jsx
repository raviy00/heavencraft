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

// ─── Google & Discord SVG icons ───
function GoogleIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
    )
}

function DiscordIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
            <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03z" />
        </svg>
    )
}

// ─── Main AuthCard ───
export default function AuthCard() {
    const [view, setView] = useState('login')

    return (
        <div className="auth-card-wrapper" style={{ animation: 'cardAppear 0.45s cubic-bezier(0.34,1.56,0.64,1) both' }}>
            {/* Character image carousel — left side */}
            <div className="auth-card-character">
                <ImageCarousel />
            </div>

            {/* Form — right side */}
            <div className="auth-card-form">
                {view === 'login'
                    ? <LoginPanel onSwitch={() => setView('register')} />
                    : <RegisterPanel onSwitch={() => setView('login')} />
                }
            </div>
        </div>
    )
}

// ─── Login Panel ───
function LoginPanel({ onSwitch }) {
    const { login, loginWithDiscord, loginWithGoogle } = useAuth()
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

            <div className="auth-oauth-row">
                <button type="button" className="oauth-google" onClick={loginWithGoogle}>
                    <GoogleIcon /> Google
                </button>
                <button type="button" className="oauth-discord" onClick={loginWithDiscord}>
                    <DiscordIcon /> Discord
                </button>
            </div>

            <div className="or-divider"><span>or</span></div>

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
                    <a href="#" className="auth-link">Forgot password?</a>
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
    const { register, loginWithDiscord, loginWithGoogle } = useAuth()
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

            <div className="auth-oauth-row">
                <button type="button" className="oauth-google" onClick={loginWithGoogle}>
                    <GoogleIcon /> Google
                </button>
                <button type="button" className="oauth-discord" onClick={loginWithDiscord}>
                    <DiscordIcon /> Discord
                </button>
            </div>

            <div className="or-divider"><span>or</span></div>

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
