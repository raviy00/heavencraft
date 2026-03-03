import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import AuthModal from './AuthModal'

export default function Header() {
    const [modalOpen, setModalOpen] = useState(false)
    const [modalView, setModalView] = useState('login')
    const location = useLocation()

    const openModal = (view) => {
        setModalView(view)
        setModalOpen(true)
    }

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'About Us', path: '/about' },
        { name: 'Contact', path: '/contact' },
        { name: 'Support', path: '/support' },
        { name: 'Donate', path: '/donate' }
    ]

    return (
        <>
            <header className="absolute top-0 w-full z-40 flex items-center justify-between px-6 lg:px-12 py-5 bg-gradient-to-b from-black/80 to-transparent">

                {/* Left: Logo and Name */}
                <Link to="/" className="flex items-center gap-3 decoration-transparent group">
                    <img
                        src="/logo.png"
                        alt="Heavencraft"
                        className="h-10 md:h-12 object-contain group-hover:scale-105 transition-transform duration-300"
                        style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))' }}
                        onError={(e) => {
                            // Fallback to text icon if the image isn't saved yet
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling.style.display = 'flex';
                        }}
                    />
                    <div className="hidden items-center justify-center p-2 rounded-lg bg-primary shadow-[0_0_15px_rgba(37,140,244,0.5)]">
                        <span className="material-symbols-outlined text-white" style={{ fontSize: '1.5rem' }}>deployed_code</span>
                    </div>
                    <h1 className="text-white text-2xl md:text-3xl font-bold tracking-widest uppercase italic font-display drop-shadow-md">
                        Heavencraft
                    </h1>
                </Link>

                {/* Middle: Navbar */}
                <nav className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => {
                        const isActive = location.pathname === link.path
                        return (
                            <Link
                                key={link.name}
                                to={link.path}
                                className={`text-sm font-bold tracking-wider uppercase transition-colors px-2 py-1 ${isActive ? 'text-primary border-b-2 border-primary' : 'text-slate-300 hover:text-white'
                                    }`}
                            >
                                {link.name}
                            </Link>
                        )
                    })}
                </nav>

                {/* Right: Auth Buttons */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => openModal('login')}
                        className="text-white text-sm font-bold uppercase tracking-wider hover:text-primary transition-colors"
                    >
                        Sign In
                    </button>
                    <button
                        onClick={() => openModal('register')}
                        className="px-5 py-2 rounded-md font-bold text-sm uppercase tracking-wider transition-all"
                        style={{
                            background: 'linear-gradient(145deg, rgba(255,184,0,0.85) 0%, rgba(220,155,0,0.90) 100%)',
                            color: '#0f172a',
                            border: '1px solid rgba(255,184,0,0.5)',
                            boxShadow: '0 4px 15px rgba(255,184,0,0.25)',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-1px)'
                            e.currentTarget.style.boxShadow = '0 6px 20px rgba(255,184,0,0.35)'
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)'
                            e.currentTarget.style.boxShadow = '0 4px 15px rgba(255,184,0,0.25)'
                        }}
                    >
                        Sign Up
                    </button>
                </div>
            </header>

            {/* Auth Modal Portal */}
            <AuthModal isOpen={modalOpen} onClose={() => setModalOpen(false)} initialView={modalView} />
        </>
    )
}
