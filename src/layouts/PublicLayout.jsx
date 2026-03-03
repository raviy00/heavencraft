import { Outlet } from 'react-router-dom'
import Header from '../components/Header'

export default function PublicLayout() {
    return (
        <div className="relative min-h-screen text-slate-200" style={{ backgroundColor: '#04090f' }}>

            {/* Background Video */}
            <video
                autoPlay
                loop
                muted
                playsInline
                aria-hidden="true"
                style={{
                    position: 'fixed',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    zIndex: 0,
                }}
            >
                <source src="/videos/bg.webm" type="video/webm" />
                <source src="/videos/bg.mp4" type="video/mp4" />
            </video>

            {/* Dark vignette overlay for readability */}
            <div
                aria-hidden="true"
                style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 1,
                    background: 'radial-gradient(ellipse at center, rgba(4,9,15,0.40) 0%, rgba(4,9,15,0.85) 100%)',
                    pointerEvents: 'none',
                }}
            />

            {/* Top Header */}
            <Header />

            {/* Page Content */}
            <main className="relative z-10 pt-28 pb-12 px-6 lg:px-12 min-h-screen flex flex-col items-center">
                <Outlet />
            </main>

            {/* Simple Footer */}
            <footer className="relative z-10 w-full text-center py-6 text-xs text-white/30 border-t border-white/5">
                <p>© 2026 Heavencraft Server Network · Not affiliated with Mojang or Microsoft</p>
            </footer>
        </div>
    )
}
