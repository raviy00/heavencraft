import { useState } from 'react'

function Tooltip({ children, text }) {
    return (
        <div className="tooltip-wrap">
            {children}
            <div className="tooltip-box">{text}</div>
        </div>
    )
}

export default function RegisterForm() {
    const [form, setForm] = useState({
        username: '',
        email: '',
        password: '',
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    const handleChange = (e) => {
        const { name, value } = e.target
        setForm((prev) => ({ ...prev, [name]: value }))
    }

    const validate = () => {
        if (!form.username.trim()) return 'Please enter your Minecraft username.'
        if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
            return 'Please enter a valid email address.'
        if (form.password.length < 8) return 'Password must be at least 8 characters.'
        return ''
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        setError('')
        setSuccess(false)
        const err = validate()
        if (err) { setError(err); return }

        setLoading(true)
        // Simulate async registration
        setTimeout(() => {
            setLoading(false)
            setSuccess(true)
            setForm({ username: '', email: '', password: '' })
        }, 1500)
    }

    return (
        <div>
            {/* Heading */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined" style={{ color: '#ffb800' }}>
                        person_add
                    </span>
                    Register
                </h2>
                <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                    Start your journey today.
                </p>
            </div>

            {/* Success banner */}
            {success && (
                <div
                    className="mb-4 px-4 py-3 rounded flex items-center gap-2 text-sm"
                    style={{
                        background: 'rgba(34,197,94,0.12)',
                        border: '1px solid rgba(34,197,94,0.3)',
                        color: '#86efac',
                    }}
                >
                    <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>
                        check_circle
                    </span>
                    Account created! Check your email to verify.
                </div>
            )}

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

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                {/* Username */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label
                            htmlFor="reg-username"
                            className="text-xs font-bold uppercase tracking-wider"
                            style={{ color: '#64748b' }}
                        >
                            Minecraft Username
                        </label>
                        <Tooltip text="Username must exactly match your in-game Minecraft character name.">
                            <span
                                className="material-symbols-outlined cursor-help"
                                style={{ color: '#64748b', fontSize: '1rem' }}
                            >
                                info
                            </span>
                        </Tooltip>
                    </div>
                    <input
                        id="reg-username"
                        name="username"
                        type="text"
                        autoComplete="username"
                        placeholder="Your in-game name"
                        value={form.username}
                        onChange={handleChange}
                        className="chiseled-input chiseled-input-gold"
                        style={{ borderColor: form.username ? undefined : undefined }}
                    />
                </div>

                {/* Email */}
                <div className="space-y-2">
                    <label
                        htmlFor="reg-email"
                        className="block text-xs font-bold uppercase tracking-wider"
                        style={{ color: '#64748b' }}
                    >
                        Email Address
                    </label>
                    <input
                        id="reg-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        placeholder="alex@creeper.com"
                        value={form.email}
                        onChange={handleChange}
                        className="chiseled-input chiseled-input-gold"
                    />
                </div>

                {/* Password */}
                <div className="space-y-2">
                    <label
                        htmlFor="reg-password"
                        className="block text-xs font-bold uppercase tracking-wider"
                        style={{ color: '#64748b' }}
                    >
                        Create Password
                    </label>
                    <input
                        id="reg-password"
                        name="password"
                        type="password"
                        autoComplete="new-password"
                        placeholder="••••••••"
                        value={form.password}
                        onChange={handleChange}
                        className="chiseled-input chiseled-input-gold"
                    />
                    {/* Password strength hint */}
                    {form.password.length > 0 && (
                        <PasswordStrength password={form.password} />
                    )}
                </div>

                {/* Submit */}
                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full font-bold py-4 rounded pixel-border flex items-center justify-center gap-2"
                        style={{
                            background: loading ? 'rgba(255,184,0,0.6)' : '#ffb800',
                            color: '#0f172a',
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
                                Creating account…
                            </>
                        ) : (
                            'BEGIN ADVENTURE'
                        )}
                    </button>
                </div>
            </form>

            {/* Security note */}
            <div
                className="mt-8 p-4 rounded-lg flex gap-3"
                style={{
                    background: 'rgba(37,140,244,0.08)',
                    border: '1px solid rgba(37,140,244,0.2)',
                }}
            >
                <span className="material-symbols-outlined" style={{ color: '#258cf4', flexShrink: 0 }}>
                    verified_user
                </span>
                <div style={{ fontSize: '0.75rem', color: '#cbd5e1', lineHeight: '1.5' }}>
                    <p className="font-bold mb-1" style={{ color: '#258cf4' }}>
                        Server Security Note
                    </p>
                    Heavencraft uses secure encryption to protect your account. Never share your
                    password with anyone, including staff members.
                </div>
            </div>

            <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
        </div>
    )
}

/* ── Password strength meter ── */
function PasswordStrength({ password }) {
    const getStrength = () => {
        let score = 0
        if (password.length >= 8) score++
        if (/[A-Z]/.test(password)) score++
        if (/[0-9]/.test(password)) score++
        if (/[^A-Za-z0-9]/.test(password)) score++
        return score
    }

    const score = getStrength()
    const labels = ['', 'Weak', 'Fair', 'Good', 'Strong']
    const colors = ['', '#ef4444', '#f97316', '#eab308', '#22c55e']

    return (
        <div className="mt-2">
            <div className="flex gap-1 mb-1">
                {[1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className="h-1 flex-1 rounded"
                        style={{
                            background: i <= score ? colors[score] : 'rgba(51,65,85,0.5)',
                            transition: 'background 0.3s',
                        }}
                    />
                ))}
            </div>
            {score > 0 && (
                <p style={{ fontSize: '0.7rem', color: colors[score] }}>
                    {labels[score]} password
                </p>
            )}
        </div>
    )
}
