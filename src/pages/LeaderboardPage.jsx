import { useState, useEffect } from 'react'
import { leaderboardApi } from '../api'

const MEDALS = ['🥇', '🥈', '🥉']

const METRICS = [
    { key: 'kills', label: 'Kills', icon: 'skull', unit: '' },
    { key: 'blocksMined', label: 'Blocks Mined', icon: 'construction', unit: '' },
    { key: 'playtime', label: 'Playtime', icon: 'schedule', unit: 'h' },
    { key: 'deaths', label: 'Deaths', icon: 'heart_broken', unit: '' },
    { key: 'kdr', label: 'K/D Ratio', icon: 'trending_up', unit: '' },
]

export default function LeaderboardPage() {
    const [activeMetric, setActiveMetric] = useState(METRICS[0])
    const [ranked, setRanked] = useState([])
    const [loading, setLoading] = useState(true)
    const [lastUpdated, setLastUpdated] = useState(new Date())

    const loadData = async () => {
        setLoading(true)
        try {
            const data = await leaderboardApi.get(activeMetric.key, 50)

            // Format for display
            const formatted = data.players.map(p => ({
                ...p,
                value: p[activeMetric.key],
                displayValue: activeMetric.key === 'playtime'
                    ? `${p[activeMetric.key]}${activeMetric.unit}`
                    : activeMetric.key === 'blocksMined'
                        ? `${(p[activeMetric.key] / 1000).toFixed(1)}K`
                        : `${p[activeMetric.key]}${activeMetric.unit}`
            }))

            setRanked(formatted)
            setLastUpdated(new Date())
        } catch (err) {
            console.error('Failed to load leaderboard', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadData()
    }, [activeMetric])

    // Auto-update every 60s
    useEffect(() => {
        const id = setInterval(loadData, 60000)
        return () => clearInterval(id)
    }, [activeMetric])

    const max = ranked[0]?.value || 1
    const podium = ranked.slice(0, 3)

    return (
        <div className="space-y-6 max-w-3xl animate-fadeIn">
            <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-white font-bold text-lg mb-1">Leaderboard</h1>
                    <p style={{ color: '#64748b', fontSize: '0.8rem' }}>
                        Auto-updates every 60s · Last: {lastUpdated.toLocaleTimeString()}
                    </p>
                </div>
            </div>

            {/* Metric selector */}
            <div className="flex gap-2 flex-wrap">
                {METRICS.map((m) => (
                    <button
                        key={m.key}
                        onClick={() => setActiveMetric(m)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all disabled:opacity-50"
                        disabled={loading && activeMetric.key !== m.key}
                        style={{
                            background:
                                activeMetric.key === m.key
                                    ? 'rgba(255,184,0,0.15)'
                                    : 'rgba(51,65,85,0.3)',
                            color: activeMetric.key === m.key ? '#ffb800' : '#64748b',
                            border: `1px solid ${activeMetric.key === m.key
                                ? 'rgba(255,184,0,0.4)'
                                : 'rgba(51,65,85,0.4)'
                                }`,
                        }}
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>{m.icon}</span>
                        {m.label}
                    </button>
                ))}
            </div>

            {loading && ranked.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                    <span className="material-symbols-outlined animate-spin text-4xl mb-2 text-[#ffb800]">autorenew</span>
                    Loading rankings...
                </div>
            ) : (
                <>
                    {/* ── Podium (top 3) ── */}
                    {podium.length >= 3 && (
                        <div className="flex items-end justify-center gap-4 py-4">
                            {/* 2nd place */}
                            <PodiumCard player={podium[1]} rank={2} height="h-28" color="#94a3b8" />
                            {/* 1st place */}
                            <PodiumCard player={podium[0]} rank={1} height="h-36" color="#ffb800" glow />
                            {/* 3rd place */}
                            <PodiumCard player={podium[2]} rank={3} height="h-20" color="#cd7f32" />
                        </div>
                    )}

                    {/* ── Main rankings list ── */}
                    <div
                        className={`rounded-xl overflow-hidden transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}
                        style={{ border: '1px solid rgba(51,65,85,0.4)' }}
                    >
                        {ranked.length === 0 ? (
                            <div className="p-8 text-center text-slate-400">No data available for this metric.</div>
                        ) : ranked.map((p, i) => {
                            const pct = Math.min(100, max > 0 ? (p.value / max) * 100 : 0)
                            const isTop3 = i < 3
                            return (
                                <div
                                    key={p._id || Math.random()}
                                    className="flex items-center gap-4 px-5 py-4 transition-colors"
                                    style={{
                                        background: isTop3
                                            ? 'rgba(255,184,0,0.04)'
                                            : i % 2 === 0
                                                ? 'rgba(15,25,38,0.6)'
                                                : 'rgba(10,18,28,0.6)',
                                        borderBottom: '1px solid rgba(51,65,85,0.2)',
                                        borderLeft: isTop3 ? '3px solid rgba(255,184,0,0.5)' : '3px solid transparent',
                                    }}
                                >
                                    {/* Rank */}
                                    <div className="w-8 text-center flex-shrink-0">
                                        {MEDALS[i] || (
                                            <span className="font-bold text-sm" style={{ color: '#475569' }}>
                                                {i + 1}
                                            </span>
                                        )}
                                    </div>

                                    {/* Avatar + name */}
                                    <div className="flex items-center gap-3 w-36 flex-shrink-0">
                                        <div
                                            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 overflow-hidden"
                                            style={{
                                                background: isTop3
                                                    ? 'linear-gradient(135deg,#ffb800,#d48a00)'
                                                    : 'linear-gradient(135deg,#258cf4,#1a6bc4)',
                                                color: 'white',
                                            }}
                                        >
                                            {p.skin ? (
                                                <img src={p.skin} alt={p.username} className="w-full h-full object-cover" />
                                            ) : (
                                                p.username.slice(0, 2).toUpperCase()
                                            )}
                                        </div>
                                        <span
                                            className="text-sm font-semibold truncate"
                                            style={{ color: isTop3 ? '#ffb800' : 'white' }}
                                        >
                                            {p.username}
                                        </span>
                                    </div>

                                    {/* Bar + value */}
                                    <div className="flex-1 flex items-center gap-3">
                                        <div
                                            className="flex-1 rounded-full overflow-hidden"
                                            style={{ background: 'rgba(51,65,85,0.4)', height: '6px' }}
                                        >
                                            <div
                                                className="h-full rounded-full"
                                                style={{
                                                    width: `${pct}%`,
                                                    background: isTop3
                                                        ? 'linear-gradient(90deg,#ffb800,#f59e0b)'
                                                        : 'linear-gradient(90deg,#258cf4,#1d4ed8)',
                                                    transition: 'width 0.5s ease',
                                                }}
                                            />
                                        </div>
                                        <span
                                            className="text-sm font-bold w-20 text-right flex-shrink-0"
                                            style={{ color: isTop3 ? '#ffb800' : 'white' }}
                                        >
                                            {p.displayValue}
                                        </span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </>
            )}
        </div>
    )
}

function PodiumCard({ player, rank, height, color, glow = false }) {
    return (
        <div className="flex flex-col items-center gap-2">
            {/* Avatar */}
            <div
                className="w-14 h-14 rounded-xl flex items-center justify-center text-lg font-bold overflow-hidden"
                style={{
                    background: `linear-gradient(135deg, ${color}44, ${color}22)`,
                    border: `2px solid ${color}80`,
                    color,
                    boxShadow: glow ? `0 0 20px ${color}60` : 'none',
                }}
            >
                {player.skin ? (
                    <img src={player.skin} alt={player.username} className="w-full h-full object-cover" />
                ) : (
                    player.username.slice(0, 2).toUpperCase()
                )}
            </div>
            <span className="text-xs font-bold truncate max-w-[80px] text-center" style={{ color }}>
                {player.username}
            </span>
            <span className="text-lg">{MEDALS[rank - 1]}</span>
            {/* Podium block */}
            <div
                className={`w-24 ${height} rounded-t-lg flex items-center justify-center font-bold text-sm`}
                style={{
                    background: `linear-gradient(180deg, ${color}30, ${color}10)`,
                    border: `1px solid ${color}50`,
                    color,
                }}
            >
                #{rank}
            </div>
        </div>
    )
}
