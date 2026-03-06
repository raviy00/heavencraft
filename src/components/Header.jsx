import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import AuthModal from './AuthModal'

export default function Header() {
    const [modalOpen, setModalOpen] = useState(false)
    const [modalView, setModalView] = useState('login')
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const location = useLocation()

    const openModal = (view) => {
        setModalView(view)
        setModalOpen(true)
        setMobileMenuOpen(false)
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
            <header className="absolute top-0 w-full z-40 px-4 md:px-6 lg:px-12 py-4 bg-gradient-to-b from-black/80 to-transparent">
                <div className="flex items-center justify-between relative">
                    {/* Left: Logo and Name */}
                    <Link to="/" className="flex items-center gap-2 decoration-transparent group shrink-0">
                        <img
                            src="/Logo.png"
                            alt="Heavencraft"
                            className="h-9 md:h-12 object-contain group-hover:scale-105 transition-transform duration-300"
                            style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))' }}
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling.style.display = 'flex';
                            }}
                        />
                        <div className="hidden items-center justify-center p-2 rounded-lg bg-primary shadow-[0_0_15px_rgba(37,140,244,0.5)]">
                            <span className="material-symbols-outlined text-white" style={{ fontSize: '1.5rem' }}>deployed_code</span>
                        </div>
                        <h1 className="text-white text-xl md:text-3xl font-bold tracking-widest uppercase italic font-display drop-shadow-md">
                            Heavencraft
                        </h1>
                    </Link>

                    {/* Middle: Navbar — desktop only */}
                    <nav className="hidden md:flex items-center gap-6 lg:gap-8 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                        {navLinks.map((link) => {
                            const isActive = location.pathname === link.path
                            return (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    className={`text-xs lg:text-sm font-bold tracking-wider uppercase transition-colors px-2 py-1 ${isActive ? 'text-primary border-b-2 border-primary' : 'text-slate-300 hover:text-white'}`}
                                >
                                    {link.name}
                                </Link>
                            )
                        })}
                    </nav>

                    {/* Right: Auth Buttons (desktop) + Hamburger (mobile) */}
                    <div className="flex items-center gap-3">
                        {/* Desktop auth buttons */}
                        <div className="hidden md:flex items-center gap-3">
                            <button
                                onClick={() => openModal('login')}
                                className="text-white text-sm font-bold uppercase tracking-wider hover:text-primary transition-colors"
                            >
                                Sign In
                            </button>
                            <button
                                onClick={() => openModal('register')}
                                className="px-4 py-2 rounded-md font-bold text-sm uppercase tracking-wider transition-all"
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

                        {/* Mobile hamburger button */}
                        <button
                            className="md:hidden text-white p-1"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            aria-label="Toggle menu"
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: '1.75rem' }}>
                                {mobileMenuOpen ? 'close' : 'menu'}
                            </span>
                        </button>
                    </div>
                </div>

                {/* Mobile dropdown menu */}
                {mobileMenuOpen && (
                    <div
                        className="md:hidden mt-4 rounded-xl p-4 flex flex-col gap-3"
                        style={{
                            background: 'rgba(4, 9, 15, 0.95)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            animation: 'fadeIn 0.2s ease',
                        }}
                    >
                        {navLinks.map((link) => {
                            const isActive = location.pathname === link.path
                            return (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`text-sm font-bold tracking-wider uppercase py-2 px-3 rounded-lg transition-colors ${isActive ? 'text-primary bg-primary/10' : 'text-slate-300 hover:text-white hover:bg-white/5'}`}
                                >
                                    {link.name}
                                </Link>
                            )
                        })}

                        <div className="border-t border-white/10 pt-3 flex flex-col gap-2">
                            <button
                                onClick={() => openModal('login')}
                                className="text-white text-sm font-bold uppercase tracking-wider py-2 px-3 rounded-lg text-left hover:bg-white/5 transition-colors"
                            >
                                Sign In
                            </button>
                            <button
                                onClick={() => openModal('register')}
                                className="py-2.5 px-4 rounded-md font-bold text-sm uppercase tracking-wider text-center"
                                style={{
                                    background: 'linear-gradient(145deg, rgba(255,184,0,0.85) 0%, rgba(220,155,0,0.90) 100%)',
                                    color: '#0f172a',
                                    border: '1px solid rgba(255,184,0,0.5)',
                                }}
                            >
                                Sign Up
                            </button>
                        </div>
                    </div>
                )}
            </header>

            {/* Auth Modal Portal */}
            <AuthModal isOpen={modalOpen} onClose={() => setModalOpen(false)} initialView={modalView} />
        </>
    )
}
