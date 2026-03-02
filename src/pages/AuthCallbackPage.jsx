import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AuthCallbackPage() {
    const [searchParams] = useSearchParams()
    const { loginWithToken } = useAuth()
    const navigate = useNavigate()
    const [status, setStatus] = useState('Connecting to Discord…')

    useEffect(() => {
        async function handleCallback() {
            const token = searchParams.get('token')
            const error = searchParams.get('error')

            if (error) {
                setStatus(`Authentication failed: ${error}`)
                setTimeout(() => navigate('/', { replace: true }), 3000)
                return
            }

            if (!token) {
                setStatus('No token received. Redirecting…')
                setTimeout(() => navigate('/', { replace: true }), 2000)
                return
            }

            setStatus('Verifying your identity…')
            const success = await loginWithToken(token)

            if (success) {
                setStatus('Welcome to Heavencraft! Redirecting…')
                setTimeout(() => navigate('/dashboard', { replace: true }), 1000)
            } else {
                setStatus('Token verification failed. Redirecting…')
                setTimeout(() => navigate('/', { replace: true }), 3000)
            }
        }

        handleCallback()
    }, [searchParams, loginWithToken, navigate])

    return (
        <div
            className="min-h-screen flex items-center justify-center"
            style={{ background: '#04090f' }}
        >
            <div
                className="text-center p-8 rounded-2xl max-w-md w-full"
                style={{
                    background: 'rgba(12, 20, 36, 0.55)',
                    backdropFilter: 'blur(44px) saturate(170%)',
                    border: '1px solid rgba(255, 255, 255, 0.14)',
                    boxShadow: '0 28px 72px rgba(0, 0, 0, 0.55)',
                    animation: 'cardAppear 0.4s ease-out',
                }}
            >
                {/* Animated Loader */}
                <div className="mb-6 flex justify-center">
                    <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center"
                        style={{
                            background: 'linear-gradient(135deg, #5865F2, #4752C4)',
                            boxShadow: '0 0 30px rgba(88,101,242,0.4)',
                            animation: 'pulse 2s ease-in-out infinite',
                        }}
                    >
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
                            <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286z" />
                        </svg>
                    </div>
                </div>

                <h2
                    className="text-xl font-bold text-white mb-2"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                    Discord Authentication
                </h2>
                <p className="text-slate-400 text-sm mb-6">{status}</p>

                {/* Loading spinner */}
                <div className="flex justify-center">
                    <div
                        className="w-6 h-6 border-2 rounded-full"
                        style={{
                            borderColor: 'rgba(88,101,242,0.3)',
                            borderTopColor: '#5865F2',
                            animation: 'spin 1s linear infinite',
                        }}
                    />
                </div>
            </div>

            <style>{`
                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                }
            `}</style>
        </div>
    )
}
