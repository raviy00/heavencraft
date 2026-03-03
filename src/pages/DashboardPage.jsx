import { useAuth } from '../context/AuthContext'
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { statsApi, playerApi, activityApi } from '../api'
import { useServerStatus } from '../layouts/DashboardLayout'

function StatCard({ icon, label, value, sub, accent }) {
    return (
        <div
            className="rounded-xl p-5 flex items-start gap-4"
            style={{
                background: 'rgba(15,25,38,0.8)',
                border: '1px solid rgba(51,65,85,0.4)',
            }}
        >
            <div
                className="w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: `${accent}18` }}
            >
                <span className="material-symbols-outlined" style={{ color: accent, fontSize: '1.4rem' }}>
                    {icon}
                </span>
            </div>
            <div>
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="text-sm font-medium" style={{ color: '#94a3b8' }}>{label}</p>
                {sub && <p className="text-xs mt-0.5" style={{ color: '#475569' }}>{sub}</p>}
            </div>
        </div>
    )
}

const activityColors = {
    kill: '#ef4444',
    death: '#f59e0b',
    mine: '#8b5cf6',
    join: '#22c55e',
}

export default function DashboardPage() {
    const { user } = useAuth()
    const [loading, setLoading] = useState(true)

    // ── Use shared server status from DashboardLayout context (same as top-bar pill) ──
    const serverInfo = useServerStatus()

    const [networkStats, setNetworkStats] = useState({ totalKills: 0, totalDeaths: 0, totalPlaytime: 0, totalBlocksMined: 0 })
    const [myStats, setMyStats] = useState(null)
    const [recentActivity, setRecentActivity] = useState([])

    useEffect(() => {
        async function loadData() {
            setLoading(true)
            try {
                const queryUsername = user?.minecraftUsername || user?.globalName || user?.username

                const [statsRes, activityRes] = await Promise.all([
                    statsApi.network().catch(() => ({ totalKills: 0, totalDeaths: 0, totalPlaytime: 0, totalBlocksMined: 0 })),
                    activityApi.list(10).catch(() => []),
                ])

                setNetworkStats(statsRes)
                setRecentActivity(activityRes)

                if (queryUsername) {
                    const myStatsRes = await playerApi.get(queryUsername).catch(() => null)
                    setMyStats(myStatsRes)
                }
            } catch (err) {
                console.error('Error loading dashboard data:', err)
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [user])

    const quickLinks = [
        { to: '/server-info', label: 'Manage Server', icon: 'power_settings_new', color: '#22c55e' },
        { to: '/stats', label: 'Player Stats', icon: 'bar_chart', color: '#258cf4' },
        { to: '/mods', label: 'Download Mods', icon: 'extension', color: '#8b5cf6' },
        { to: '/leaderboard', label: 'Leaderboard', icon: 'leaderboard', color: '#ffb800' },
    ]

    return (
        <div className="space-y-8 max-w-7xl animate-fadeIn">
            {/* Welcome */}
            <div>
                <h1 className="text-2xl font-bold text-white mb-1">
                    Welcome back, <span style={{ color: '#258cf4' }}>{user?.globalName || user?.username} 👋</span>
                </h1>
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                    Here's what's happening on Heavencraft today.
                </p>
            </div>

            {/* Server status banner */}
            <div
                className="rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 transition-colors"
                style={{
                    background: serverInfo.status === 'online'
                        ? 'linear-gradient(135deg, rgba(34,197,94,0.12) 0%, rgba(15,25,38,0.8) 100%)'
                        : serverInfo.status === 'starting'
                            ? 'linear-gradient(135deg, rgba(234,179,8,0.12) 0%, rgba(15,25,38,0.8) 100%)'
                            : 'linear-gradient(135deg, rgba(239,68,68,0.12) 0%, rgba(15,25,38,0.8) 100%)',
                    border: `1px solid ${serverInfo.status === 'online' ? 'rgba(34,197,94,0.3)'
                        : serverInfo.status === 'starting' ? 'rgba(234,179,8,0.3)'
                            : 'rgba(239,68,68,0.3)'
                        }`,
                }}
            >
                <div className="flex items-center gap-3 flex-1">
                    <div
                        className={`w-3 h-3 rounded-full flex-shrink-0 ${serverInfo.status === 'online' ? 'animate-pulse' :
                            serverInfo.status === 'starting' ? 'animate-bounce' : ''
                            }`}
                        style={{
                            background: serverInfo.status === 'online' ? '#22c55e'
                                : serverInfo.status === 'starting' ? '#eab308'
                                    : '#ef4444',
                            boxShadow: `0 0 10px ${serverInfo.status === 'online' ? '#22c55e'
                                : serverInfo.status === 'starting' ? '#eab308'
                                    : '#ef4444'
                                }`,
                        }}
                    />
                    <div>
                        <p className="text-white font-bold capitalize">
                            Server is currently {serverInfo.status}
                        </p>
                        <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                            {serverInfo.onlinePlayers} / {serverInfo.maxPlayers} Players Online
                        </p>
                    </div>
                </div>
                <Link
                    to="/server-info"
                    className="px-5 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center gap-2"
                    style={{ background: '#22c55e', color: 'white' }}
                >
                    <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>
                        power_settings_new
                    </span>
                    Manage Server
                </Link>
            </div>

            {/* Network stats */}
            <div>
                <h2 className="text-white font-bold mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined" style={{ color: '#258cf4', fontSize: '1.2rem' }}>
                        analytics
                    </span>
                    Network Statistics
                </h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard icon="skull" label="Total Kills" value={networkStats.totalKills.toLocaleString()} accent="#ef4444" />
                    <StatCard icon="heart_broken" label="Total Deaths" value={networkStats.totalDeaths.toLocaleString()} accent="#f59e0b" />
                    <StatCard icon="schedule" label="Total Playtime" value={`${networkStats.totalPlaytime.toLocaleString()}h`} accent="#258cf4" />
                    <StatCard icon="construction" label="Blocks Mined" value={`${(networkStats.totalBlocksMined / 1000).toFixed(1)}K`} accent="#8b5cf6" />
                </div>
            </div>

            {/* My Stats (if user exists in roster) + Quick Links */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* My Stats */}
                <div
                    className="rounded-xl p-5"
                    style={{
                        background: 'rgba(15,25,38,0.8)',
                        border: '1px solid rgba(51,65,85,0.4)',
                    }}
                >
                    <h2 className="text-white font-bold mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined" style={{ color: '#ffb800', fontSize: '1.2rem' }}>
                            person
                        </span>
                        My Stats
                    </h2>
                    {loading ? (
                        <div className="text-center py-6 text-slate-400">Loading your stats...</div>
                    ) : myStats ? (
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { label: 'Kills', value: myStats.kills, icon: 'skull', c: '#ef4444' },
                                { label: 'Deaths', value: myStats.deaths, icon: 'heart_broken', c: '#f59e0b' },
                                { label: 'Playtime', value: `${myStats.playtime}h`, icon: 'schedule', c: '#258cf4' },
                                { label: 'Blocks Mined', value: myStats.blocksMined.toLocaleString(), icon: 'construction', c: '#8b5cf6' },
                            ].map(({ label, value, icon, c }) => (
                                <div
                                    key={label}
                                    className="rounded-lg p-3 flex items-center gap-3"
                                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(51,65,85,0.3)' }}
                                >
                                    <span className="material-symbols-outlined" style={{ color: c, fontSize: '1.1rem' }}>{icon}</span>
                                    <div>
                                        <p className="text-white font-bold text-base leading-none">{value}</p>
                                        <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>{label}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-6" style={{ color: '#475569' }}>
                            <span className="material-symbols-outlined text-4xl mb-2 block">person_off</span>
                            <p className="text-sm">No stats found for <strong className="text-slate-400">{user?.minecraftUsername || user?.globalName || user?.username}</strong></p>
                            <p className="text-xs mt-1">Join the server to start tracking!</p>
                        </div>
                    )}
                </div>

                {/* Quick Links */}
                <div
                    className="rounded-xl p-5"
                    style={{
                        background: 'rgba(15,25,38,0.8)',
                        border: '1px solid rgba(51,65,85,0.4)',
                    }}
                >
                    <h2 className="text-white font-bold mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined" style={{ color: '#258cf4', fontSize: '1.2rem' }}>
                            apps
                        </span>
                        Quick Links
                    </h2>
                    <div className="grid grid-cols-2 gap-3">
                        {quickLinks.map(({ to, label, icon, color }) => (
                            <Link
                                key={to}
                                to={to}
                                className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl font-semibold text-sm text-center transition-all"
                                style={{
                                    background: `${color}12`,
                                    border: `1px solid ${color}30`,
                                    color,
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = `${color}22`)}
                                onMouseLeave={(e) => (e.currentTarget.style.background = `${color}12`)}
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: '1.6rem' }}>{icon}</span>
                                {label}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div
                className="rounded-xl p-5"
                style={{
                    background: 'rgba(15,25,38,0.8)',
                    border: '1px solid rgba(51,65,85,0.4)',
                }}
            >
                <h2 className="text-white font-bold mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined" style={{ color: '#258cf4', fontSize: '1.2rem' }}>
                        timeline
                    </span>
                    Recent Activity
                </h2>
                <div className="space-y-3">
                    {loading ? (
                        <div className="text-center py-4 text-slate-400">Loading activity feed...</div>
                    ) : recentActivity.length > 0 ? (
                        recentActivity.map((evt) => {
                            const color = activityColors[evt.type] || '#94a3b8'
                            return (
                                <div
                                    key={evt._id || Math.random()}
                                    className="flex items-center gap-4 p-3 rounded-lg"
                                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(51,65,85,0.2)' }}
                                >
                                    <div
                                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                        style={{ background: `${color}18` }}
                                    >
                                        <span className="material-symbols-outlined" style={{ color, fontSize: '1rem' }}>
                                            {evt.icon}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-white">
                                            <span className="font-semibold" style={{ color: '#258cf4' }}>{evt.player}</span>
                                            {' '}{evt.detail}
                                        </p>
                                    </div>
                                    <span className="text-xs flex-shrink-0" style={{ color: '#475569' }}>{evt.time}</span>
                                </div>
                            )
                        })
                    ) : (
                        <div className="text-center py-4 text-slate-400">No recent activity.</div>
                    )}
                </div>
            </div>
        </div>
    )
}

