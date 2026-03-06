import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { authApi } from '../api'

export default function ResetPasswordPage() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const email = searchParams.get('email')
    const token = searchParams.get('token')

    const [password, setPassword] = useState('')
    const [confirm, setConfirm] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    useEffect(() => {
        if (!email || !token) {
            setError('Invalid or missing reset token.')
        }
    }, [email, token])

    const onSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setSuccess('')

        if (password.length < 8) {
            return setError('Password must be at least 8 characters long.')
        }
        if (password !== confirm) {
            return setError('Passwords do not match.')
        }

        setLoading(true)
        try {
            const res = await authApi.resetPassword({ email, token, password })
            setSuccess(res.message || 'Password reset successfully!')
            setTimeout(() => {
                navigate('/') // Redirect to home so they can login
            }, 3000)
        } catch (err) {
            setError(err.message || 'Failed to reset password.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#04090f',
            backgroundImage: 'radial-gradient(circle at 50% 0%, #0d1e30 0%, #04090f 70%)',
            padding: '2rem'
        }}>
            <div style={{
                background: 'rgba(15, 23, 42, 0.7)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '16px',
                padding: '2.5rem',
                width: '100%',
                maxWidth: '400px',
                boxShadow: '0 24px 48px -12px rgba(0,0,0,0.5)',
                color: '#fff',
                fontFamily: 'Inter, sans-serif'
            }}>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem', color: '#258cf4' }}>
                    Reset Password
                </h2>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '2rem' }}>
                    Choose a new password for your account.
                </p>

                {error && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        color: '#ef4444',
                        padding: '0.75rem 1rem',
                        borderRadius: '8px',
                        marginBottom: '1.5rem',
                        fontSize: '0.9rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>error</span>
                        {error}
                    </div>
                )}

                {success && (
                    <div style={{
                        background: 'rgba(34, 197, 94, 0.1)',
                        border: '1px solid rgba(34, 197, 94, 0.2)',
                        color: '#22c55e',
                        padding: '0.75rem 1rem',
                        borderRadius: '8px',
                        marginBottom: '1.5rem',
                        fontSize: '0.9rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>check_circle</span>
                        {success}
                    </div>
                )}

                {(!email || !token) ? (
                    <button
                        onClick={() => navigate('/')}
                        style={{
                            width: '100%', padding: '0.85rem', background: '#258cf4', color: '#fff',
                            border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer',
                        }}
                    >
                        Return to Home
                    </button>
                ) : (
                    <form onSubmit={onSubmit}>
                        <div style={{ marginBottom: '1.25rem' }}>
                            <div style={{
                                display: 'flex', alignItems: 'center',
                                background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '8px', padding: '0.75rem'
                            }}>
                                <span className="material-symbols-outlined" style={{ color: '#64748b', marginRight: '0.75rem' }}>lock</span>
                                <input
                                    type="password"
                                    placeholder="New Password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                    style={{
                                        background: 'transparent', border: 'none', color: '#fff',
                                        width: '100%', fontSize: '0.95rem', outline: 'none'
                                    }}
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <div style={{
                                display: 'flex', alignItems: 'center',
                                background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '8px', padding: '0.75rem'
                            }}>
                                <span className="material-symbols-outlined" style={{ color: '#64748b', marginRight: '0.75rem' }}>lock</span>
                                <input
                                    type="password"
                                    placeholder="Confirm Password"
                                    value={confirm}
                                    onChange={e => setConfirm(e.target.value)}
                                    required
                                    style={{
                                        background: 'transparent', border: 'none', color: '#fff',
                                        width: '100%', fontSize: '0.95rem', outline: 'none'
                                    }}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '0.85rem',
                                background: loading ? '#0f172a' : '#258cf4',
                                color: loading ? '#64748b' : '#fff',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '1rem',
                                fontWeight: 600,
                                cursor: loading ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: '0.5rem',
                                transition: 'all 0.2s'
                            }}
                        >
                            {loading && <span className="material-symbols-outlined spin-icon" style={{ animation: 'spin 1s linear infinite' }}>progress_activity</span>}
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    )
}
