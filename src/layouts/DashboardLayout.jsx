import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import { serverApi } from '../api'

const pageTitles = {
    '/dashboard': 'Dashboard',
    '/server-info': 'Server Info',
    '/map': 'World Map',
    '/mods': 'Mods',
    '/stats': 'Player Stats',
    '/leaderboard': 'Leaderboard',
}

export default function DashboardLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const location = useLocation()
    const title = pageTitles[location.pathname] ?? 'Heavencraft'

    return (
        <div className="flex min-h-screen" style={{ background: '#0b1520' }}>
            <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Main content area */}
            <div
                className="flex-1 flex flex-col min-h-screen lg:ml-60"
                style={{ minWidth: 0 }}
            >
                {/* Top bar */}
                <header
                    className="sticky top-0 z-20 flex items-center gap-4 px-6 py-4"
                    style={{
                        background: 'rgba(11, 21, 32, 0.9)',
                        backdropFilter: 'blur(12px)',
                        borderBottom: '1px solid rgba(51,65,85,0.3)',
                    }}
                >
                    {/* Mobile hamburger */}
                    <button
                        className="lg:hidden text-slate-400 hover:text-white"
                        onClick={() => setSidebarOpen(true)}
                        aria-label="Open sidebar"
                    >
                        <span className="material-symbols-outlined">menu</span>
                    </button>

                    <h2 className="text-white font-bold text-lg">{title}</h2>

                    <div className="ml-auto flex items-center gap-3">
                        {/* Server status pill */}
                        <ServerStatusPill />
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

/* ── Tiny server status pill shown in the top bar ── */
function ServerStatusPill() {
    const [status, setStatus] = useState('offline')

    useEffect(() => {
        let mounted = true

        async function fetchStatus() {
            try {
                const res = await serverApi.status()
                if (mounted) setStatus(res.status)
            } catch {
                if (mounted) setStatus('offline')
            }
        }

        fetchStatus()

        // Refresh every 15s to keep the global badge updated
        const interval = setInterval(fetchStatus, 15000)
        return () => {
            mounted = false
            clearInterval(interval)
        }
    }, [])

    const cfg = {
        online: { color: '#22c55e', label: 'Online' },
        offline: { color: '#ef4444', label: 'Offline' },
        starting: { color: '#f59e0b', label: 'Starting…' },
    }[status] ?? { color: '#ef4444', label: 'Offline' }

    return (
        <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold animate-fadeIn"
            style={{
                background: `${cfg.color}18`,
                border: `1px solid ${cfg.color}40`,
                color: cfg.color,
            }}
        >
            <span
                className="inline-block w-1.5 h-1.5 rounded-full"
                style={{ background: cfg.color, boxShadow: `0 0 6px ${cfg.color}` }}
            />
            Server {cfg.label}
        </div>
    )
}

