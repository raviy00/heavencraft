import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { serverApi } from '../api'

function InfoRow({ label, value, icon, accent = '#94a3b8' }) {
    return (
        <div
            className="flex items-center justify-between p-4 rounded-lg"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(51,65,85,0.25)' }}
        >
            <div className="flex items-center gap-3">
                <span className="material-symbols-outlined" style={{ color: accent, fontSize: '1.1rem' }}>
                    {icon}
                </span>
                <span className="text-sm font-medium" style={{ color: '#94a3b8' }}>{label}</span>
            </div>
            <span className="text-sm font-bold text-white">{value}</span>
        </div>
    )
}

export default function ServerInfoPage() {
    const { user } = useAuth()
    const [info, setInfo] = useState(null)
    const [loading, setLoading] = useState(true)
    const [log, setLog] = useState([])
    const [actionLoading, setActionLoading] = useState(false)

    // Load server info
    const loadInfo = async () => {
        try {
            const data = await serverApi.info()
            setInfo(data)
        } catch (err) {
            console.error('Failed to load server info', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadInfo()

        // Auto-refresh status if online/starting
        const interval = setInterval(() => {
            if (info && (info.status === 'online' || info.status === 'starting')) {
                loadInfo()
            }
        }, 5000)

        return () => clearInterval(interval)
    }, [info?.status])

    const addLog = (msg) => {
        const ts = new Date().toLocaleTimeString()
        setLog((prev) => [`[${ts}] ${msg}`, ...prev].slice(0, 20))
    }

    const handleStartServer = async () => {
        if (!info || info.status !== 'offline') return
        setActionLoading(true)
        addLog(`Server start requested by ${user?.username || 'Admin'}`)
        addLog('Initialising JVM flags…')

        try {
            // Optimistic update
            setInfo(prev => ({ ...prev, status: 'starting' }))
            const res = await serverApi.start()
            addLog(`Server is now ${res.status.toUpperCase()} ✓`)
            await loadInfo()
        } catch (err) {
            addLog(`Error starting server: ${err.message}`)
            setInfo(prev => ({ ...prev, status: 'offline' })) // revert
        } finally {
            setActionLoading(false)
        }
    }

    const handleStop = async () => {
        if (!info || info.status !== 'online') return
        setActionLoading(true)
        addLog(`Server stop requested by ${user?.username || 'Admin'}...`)

        try {
            // Optimistic update
            setInfo(prev => ({ ...prev, status: 'offline', players: 0 }))
            const res = await serverApi.stop()
            addLog(`Server stopped. Status: ${res.status.toUpperCase()}`)
            await loadInfo()
        } catch (err) {
            addLog(`Error stopping server: ${err.message}`)
            setInfo(prev => ({ ...prev, status: 'online' })) // revert
        } finally {
            setActionLoading(false)
        }
    }

    if (loading && !info) {
        return (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400">
                <span className="material-symbols-outlined animate-spin text-5xl mb-4 text-[#258cf4]">autorenew</span>
                <p>Loading server infrastructure...</p>
            </div>
        )
    }

    // Fallbacks if data fails to load completely
    const serverDetails = info || {
        status: 'offline',
        ip: 'heavencraft_tm.aternos.me',
        port: 39013,
        version: 'Java 1.21.4',
        motd: 'Heavencraft RPG SMP',
        maxPlayers: 100,
        onlinePlayers: 0,
        playersList: []
    }

    const statusCfg = {
        online: { color: '#22c55e', label: 'Online', icon: 'check_circle' },
        offline: { color: '#ef4444', label: 'Offline', icon: 'cancel' },
        starting: { color: '#f59e0b', label: 'Starting…', icon: 'pending' },
    }[serverDetails.status] || { color: '#ef4444', label: 'Offline', icon: 'cancel' }

    return (
        <div className="space-y-8 max-w-4xl animate-fadeIn">
            {/* Status + start */}
            <div
                className="rounded-xl p-6 flex flex-col sm:flex-row items-center gap-6"
                style={{
                    background: 'rgba(15,25,38,0.8)',
                    border: `1px solid ${statusCfg.color}35`,
                }}
            >
                {/* Status indicator */}
                <div className="flex flex-col items-center gap-2 min-w-[120px]">
                    <div
                        className="w-20 h-20 rounded-full flex items-center justify-center"
                        style={{
                            background: `${statusCfg.color}15`,
                            border: `2px solid ${statusCfg.color}50`,
                            boxShadow: `0 0 24px ${statusCfg.color}30`,
                        }}
                    >
                        <span
                            className="material-symbols-outlined"
                            style={{
                                color: statusCfg.color,
                                fontSize: '2.5rem',
                                animation: serverDetails.status === 'starting' ? 'pulse 1s ease-in-out infinite' : 'none',
                            }}
                        >
                            {statusCfg.icon}
                        </span>
                    </div>
                    <span className="font-bold" style={{ color: statusCfg.color }}>
                        {statusCfg.label}
                    </span>
                    {serverDetails.status === 'online' && (
                        <span className="text-xs" style={{ color: '#64748b' }}>
                            {serverDetails.onlinePlayers}/{serverDetails.maxPlayers} players
                        </span>
                    )}
                </div>

                {/* Controls */}
                <div className="flex-1 flex flex-col gap-3 w-full">
                    <h2 className="text-white font-bold text-lg">Server Control</h2>
                    <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
                        {serverDetails.ip}:{serverDetails.port} • {serverDetails.version}
                    </p>
                    <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{serverDetails.motd}</p>

                    <div className="flex flex-wrap gap-3 mt-2">
                        {serverDetails.status === 'offline' && (
                            <button
                                onClick={handleStartServer}
                                disabled={actionLoading}
                                className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-bold text-sm transition-all pixel-border ${actionLoading ? 'opacity-50 cursor-not-allowed' : 'hover:brightness-110'}`}
                                style={{ background: '#22c55e', color: 'white' }}
                            >
                                <span className={`material-symbols-outlined ${actionLoading ? 'animate-spin' : ''}`} style={{ fontSize: '1.1rem' }}>
                                    {actionLoading ? 'autorenew' : 'power_settings_new'}
                                </span>
                                Start Server
                            </button>
                        )}
                        {serverDetails.status === 'starting' && (
                            <button
                                disabled
                                className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-bold text-sm cursor-not-allowed w-full sm:w-auto"
                                style={{ background: 'rgba(245,158,11,0.2)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' }}
                            >
                                <span
                                    className="material-symbols-outlined"
                                    style={{ fontSize: '1.1rem', animation: 'spin 1s linear infinite' }}
                                >
                                    progress_activity
                                </span>
                                Starting instance...
                            </button>
                        )}
                        {serverDetails.status === 'online' && (
                            <button
                                onClick={handleStop}
                                disabled={actionLoading}
                                className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-bold text-sm transition-all ${actionLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-500 hover:text-white'}`}
                                style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}
                            >
                                <span className={`material-symbols-outlined ${actionLoading ? 'animate-spin' : ''}`} style={{ fontSize: '1.1rem' }}>
                                    {actionLoading ? 'autorenew' : 'stop_circle'}
                                </span>
                                Stop Server
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Server details */}
                <div
                    className="rounded-xl p-5"
                    style={{
                        background: 'rgba(15,25,38,0.8)',
                        border: '1px solid rgba(51,65,85,0.4)',
                    }}
                >
                    <h2 className="text-white font-bold mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined" style={{ color: '#258cf4', fontSize: '1.2rem' }}>
                            dns
                        </span>
                        Server Details
                    </h2>
                    <div className="space-y-2">
                        <InfoRow label="IP Address" value={serverDetails.ip} icon="wifi" accent="#258cf4" />
                        <InfoRow label="Port" value={serverDetails.port} icon="lan" accent="#258cf4" />
                        <InfoRow label="Version" value={serverDetails.version} icon="info" accent="#8b5cf6" />
                        <InfoRow label="Online Players" value={`${serverDetails.onlinePlayers} / ${serverDetails.maxPlayers}`} icon="group" accent="#22c55e" />
                        <InfoRow label="Status" value={statusCfg.label} icon="radio_button_checked" accent={statusCfg.color} />
                    </div>
                </div>

                {/* Console log */}
                <div
                    className="rounded-xl p-5"
                    style={{
                        background: 'rgba(15,25,38,0.8)',
                        border: '1px solid rgba(51,65,85,0.4)',
                    }}
                >
                    <h2 className="text-white font-bold mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined" style={{ color: '#22c55e', fontSize: '1.2rem' }}>
                            terminal
                        </span>
                        Activity Log
                    </h2>
                    <div
                        className="rounded-lg p-3 font-mono text-xs overflow-y-auto space-y-1"
                        style={{
                            background: '#020912',
                            border: '1px solid rgba(51,65,85,0.4)',
                            height: '180px',
                            color: '#4ade80',
                        }}
                    >
                        {log.length === 0 ? (
                            <p style={{ color: '#334155' }}>No activity logged this session.</p>
                        ) : (
                            log.map((entry, i) => (
                                <p key={i}>{entry}</p>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Currently online players */}
            {serverDetails.status === 'online' && serverDetails.onlinePlayers > 0 && (
                <div
                    className="rounded-xl p-5"
                    style={{
                        background: 'rgba(15,25,38,0.8)',
                        border: '1px solid rgba(51,65,85,0.4)',
                    }}
                >
                    <h2 className="text-white font-bold mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined" style={{ color: '#22c55e', fontSize: '1.2rem' }}>
                            group
                        </span>
                        Online Players ({serverDetails.onlinePlayers})
                    </h2>
                    <div className="flex flex-wrap gap-3">
                        {serverDetails.playersList && serverDetails.playersList.map((p) => (
                            <div
                                key={p.id || p._id || Math.random()}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
                                style={{
                                    background: 'rgba(34,197,94,0.08)',
                                    border: '1px solid rgba(34,197,94,0.2)',
                                }}
                            >
                                <span
                                    className="w-2 h-2 rounded-full flex-shrink-0"
                                    style={{ background: '#22c55e', boxShadow: '0 0 6px #22c55e' }}
                                />
                                <span className="text-white font-medium">{p.username}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <style>{`
        @keyframes spin   { to { transform: rotate(360deg); } }
        @keyframes pulse  { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
      `}</style>
        </div>
    )
}
