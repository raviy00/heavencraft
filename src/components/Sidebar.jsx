import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'

const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { to: '/server-info', label: 'Server Info', icon: 'dns' },
    { to: '/mods', label: 'Mods', icon: 'extension' },
    { to: '/stats', label: 'Player Stats', icon: 'bar_chart' },
    { to: '/leaderboard', label: 'Leaderboard', icon: 'leaderboard' },
]

export default function Sidebar({ mobileOpen, onClose }) {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate('/')
    }

    const initials = user?.username
        ? user.username.slice(0, 2).toUpperCase()
        : 'HC'

    return (
        <>
            {/* Mobile overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-30 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 h-full z-40 flex flex-col transition-transform duration-300
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
                style={{
                    width: '15rem',
                    background: 'linear-gradient(180deg, #0d1720 0%, #0a1219 100%)',
                    borderRight: '1px solid rgba(51,65,85,0.4)',
                }}
            >
                {/* Logo */}
                <div
                    className="flex flex-col items-center justify-center gap-2 px-5 py-6"
                    style={{ borderBottom: '1px solid rgba(51,65,85,0.3)', minHeight: '120px' }}
                >
                    <img
                        src="/Logo.png"
                        alt="Heavencraft"
                        className="w-full max-w-[140px] drop-shadow-md object-contain"
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling.style.display = 'flex';
                        }}
                    />
                    <div className="hidden items-center gap-3 w-full">
                        <div
                            className="p-2 rounded-lg shadow-lg flex-shrink-0"
                            style={{ background: '#258cf4' }}
                        >
                            <span className="material-symbols-outlined text-white" style={{ fontSize: '1.4rem' }}>
                                deployed_code
                            </span>
                        </div>
                        <div>
                            <h1 className="text-white font-bold tracking-tight uppercase text-base leading-none">
                                Heavencraft
                            </h1>
                            <p style={{ color: '#64748b', fontSize: '0.65rem' }}>Server Network</p>
                        </div>
                    </div>
                </div>

                {/* Mobile close */}
                <button
                    className="absolute top-4 right-4 lg:hidden text-slate-400 hover:text-white z-50 bg-black/50 p-1 rounded-full"
                    onClick={onClose}
                >
                    <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>close</span>
                </button>

                {/* Navigation */}
                <nav className="flex-1 py-4 overflow-y-auto">
                    <p
                        className="px-5 mb-2 text-xs font-bold uppercase tracking-widest"
                        style={{ color: '#334155' }}
                    >
                        Navigation
                    </p>
                    {navItems.map(({ to, label, icon }) => (
                        <NavLink
                            key={to}
                            to={to}
                            onClick={onClose}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-5 py-3 text-sm font-medium transition-all mx-2 rounded-lg mb-0.5 ${isActive
                                    ? 'text-white'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`
                            }
                            style={({ isActive }) =>
                                isActive
                                    ? { background: 'rgba(37,140,244,0.15)', color: '#258cf4', borderLeft: '3px solid #258cf4', paddingLeft: '1.1rem' }
                                    : {}
                            }
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>
                                {icon}
                            </span>
                            {label}
                        </NavLink>
                    ))}
                </nav>

                {/* User + Logout */}
                <div
                    className="p-4"
                    style={{ borderTop: '1px solid rgba(51,65,85,0.3)' }}
                >
                    <div className="flex items-center gap-3 mb-3">
                        {/* Avatar */}
                        {user?.avatarUrl ? (
                            <img
                                src={user.avatarUrl}
                                alt={user?.username || 'User'}
                                className="w-9 h-9 rounded-lg flex-shrink-0 object-cover"
                                style={{ border: '2px solid rgba(37,140,244,0.4)' }}
                            />
                        ) : (
                            <div
                                className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0"
                                style={{ background: 'linear-gradient(135deg, #258cf4, #1a6bc4)', color: 'white' }}
                            >
                                {initials}
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-semibold truncate">
                                {user?.globalName || user?.username || 'Unknown'}
                            </p>
                            <p style={{ color: '#64748b', fontSize: '0.7rem' }}>{user?.role || 'Player'}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all"
                        style={{
                            background: 'rgba(239,68,68,0.1)',
                            color: '#f87171',
                            border: '1px solid rgba(239,68,68,0.2)',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239,68,68,0.2)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(239,68,68,0.1)')}
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>logout</span>
                        Logout
                    </button>
                </div>
            </aside>
        </>
    )
}
