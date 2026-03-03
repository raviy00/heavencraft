import { useState, useEffect } from 'react'
import { playerApi } from '../api'

function StatBar({ value, max, color }) {
    const pct = Math.min(100, max > 0 ? (value / max) * 100 : 0)
    return (
        <div className="flex items-center gap-2">
            <div
                className="flex-1 rounded-full overflow-hidden"
                style={{ background: 'rgba(51,65,85,0.4)', height: '5px' }}
            >
                <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${pct}%`, background: color }}
                />
            </div>
        </div>
    )
}

export default function StatsPage() {
    const [players, setPlayers] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [sortKey, setSortKey] = useState('playtime')
    const [sortDir, setSortDir] = useState('desc')
    const [selectedPlayer, setSelectedPlayer] = useState(null)

    useEffect(() => {
        async function loadPlayers() {
            setLoading(true)
            try {
                // Fetch max 100 players
                const data = await playerApi.list({ limit: 100 })
                setPlayers(data)
            } catch (err) {
                console.error('Failed to load players:', err)
            } finally {
                setLoading(false)
            }
        }
        loadPlayers()
    }, [])

    const maxes = {
        kills: Math.max(0, ...players.map((p) => p.kills)),
        deaths: Math.max(0, ...players.map((p) => p.deaths)),
        playtime: Math.max(0, ...players.map((p) => p.playtime)),
        blocksMined: Math.max(0, ...players.map((p) => p.blocksMined)),
    }

    const filtered = players
        .filter((p) => (p.username || '').toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => {
            const va = sortKey === 'kdr' ? a.kdr : a[sortKey]
            const vb = sortKey === 'kdr' ? b.kdr : b[sortKey]
            return sortDir === 'desc' ? vb - va : va - vb
        })

    const toggleSort = (key) => {
        if (sortKey === key) setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'))
        else { setSortKey(key); setSortDir('desc') }
    }

    const SortIcon = ({ col }) => {
        if (sortKey !== col) return <span className="material-symbols-outlined" style={{ fontSize: '0.9rem', color: '#334155' }}>unfold_more</span>
        return (
            <span className="material-symbols-outlined" style={{ fontSize: '0.9rem', color: '#258cf4' }}>
                {sortDir === 'desc' ? 'arrow_downward' : 'arrow_upward'}
            </span>
        )
    }

    const sp = selectedPlayer

    return (
        <div className="space-y-6 max-w-6xl animate-fadeIn">
            <div>
                <h1 className="text-white font-bold text-lg mb-1">Player Statistics</h1>
                <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
                    Click a player row to view detailed stats.
                </p>
            </div>

            {/* Selected player detail panel */}
            {sp && (
                <div
                    className="rounded-xl p-5"
                    style={{
                        background: 'linear-gradient(135deg, rgba(37,140,244,0.08) 0%, rgba(15,25,38,0.95) 100%)',
                        border: '1px solid rgba(37,140,244,0.3)',
                    }}
                >
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-4">
                            {/* Avatar */}
                            <div
                                className="w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold flex-shrink-0"
                                style={{ background: 'linear-gradient(135deg, #258cf4, #1a6bc4)', color: 'white' }}
                            >
                                {sp.skin ? (
                                    <img src={sp.skin} alt={sp.username} className="w-full h-full rounded-xl object-cover" />
                                ) : (
                                    (sp.username || 'Un').substring(0, 2).toUpperCase()
                                )}
                            </div>
                            <div>
                                <p className="text-white font-bold text-xl flex items-center gap-2">
                                    {sp.username || 'Unknown'}
                                    {sp.isOnline && <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]"></span>}
                                </p>
                                <p style={{ color: '#64748b', fontSize: '0.8rem' }}>
                                    Joined {new Date(sp.joinDate).toLocaleDateString()} ·
                                    {sp.isOnline ? ' Online now' : ` Last seen ${new Date(sp.lastSeen).toLocaleDateString()}`}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setSelectedPlayer(null)}
                            style={{ color: '#475569' }}
                            className="hover:text-white transition-colors"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5">
                        {[
                            { label: 'Kills', value: sp.kills, icon: 'skull', c: '#ef4444' },
                            { label: 'Deaths', value: sp.deaths, icon: 'heart_broken', c: '#f59e0b' },
                            { label: 'K/D Ratio', value: sp.kdr, icon: 'trending_up', c: '#22c55e' },
                            { label: 'Playtime', value: `${sp.playtime}h`, icon: 'schedule', c: '#258cf4' },
                            { label: 'Blocks Mined', value: sp.blocksMined.toLocaleString(), icon: 'construction', c: '#8b5cf6' },
                            ...(sp.lastDeath ? [{ label: 'Last Death', value: sp.lastDeath.cause, icon: 'warning', c: '#ef4444' }] : []),
                        ].map(({ label, value, icon, c }) => (
                            <div
                                key={label}
                                className="rounded-lg p-3"
                                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(51,65,85,0.3)' }}
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="material-symbols-outlined" style={{ color: c, fontSize: '1rem' }}>{icon}</span>
                                    <span className="text-xs" style={{ color: '#64748b' }}>{label}</span>
                                </div>
                                <p className="text-white font-bold">{value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Last death coords */}
                    {sp.lastDeath && (
                        <div
                            className="mt-4 p-3 rounded-lg flex items-center gap-3"
                            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
                        >
                            <span className="material-symbols-outlined" style={{ color: '#ef4444', fontSize: '1.1rem' }}>
                                location_on
                            </span>
                            <div className="text-sm" style={{ color: '#fca5a5' }}>
                                <span className="font-bold">Last Death Location:</span>{' '}
                                X: <strong>{sp.lastDeath.x}</strong>  Y: <strong>{sp.lastDeath.y}</strong>  Z: <strong>{sp.lastDeath.z}</strong>
                                {' '}· Cause: <strong>{sp.lastDeath.cause}</strong>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Search */}
            <div className="relative max-w-xs">
                <span
                    className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined"
                    style={{ color: '#475569', fontSize: '1rem' }}
                >
                    search
                </span>
                <input
                    type="text"
                    placeholder="Filter players…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm text-white"
                    style={{
                        background: 'rgba(15,25,38,0.9)',
                        border: '1px solid rgba(51,65,85,0.5)',
                        outline: 'none',
                        fontFamily: 'Space Grotesk, sans-serif',
                    }}
                />
            </div>

            {/* Table */}
            <div
                className="rounded-xl overflow-hidden relative"
                style={{ border: '1px solid rgba(51,65,85,0.4)', minHeight: '200px' }}
            >
                {loading && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#0a121c]/80 backdrop-blur-sm">
                        <span className="material-symbols-outlined animate-spin text-4xl text-[#258cf4] mb-2">autorenew</span>
                        <span className="text-slate-400 font-medium">Loading statistics...</span>
                    </div>
                )}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr style={{ background: 'rgba(10,18,28,0.95)', borderBottom: '1px solid rgba(51,65,85,0.4)' }}>
                                {[
                                    { key: null, label: '#', w: '40px' },
                                    { key: null, label: 'Player', w: 'auto' },
                                    { key: 'kills', label: 'Kills', w: '100px' },
                                    { key: 'deaths', label: 'Deaths', w: '100px' },
                                    { key: 'kdr', label: 'K/D', w: '100px' },
                                    { key: 'playtime', label: 'Playtime', w: '110px' },
                                    { key: 'blocksMined', label: 'Blocks', w: '120px' },
                                ].map(({ key, label, w }) => (
                                    <th
                                        key={label}
                                        className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider transition-colors hover:text-white"
                                        style={{ color: '#475569', width: w, cursor: key ? 'pointer' : 'default', userSelect: 'none' }}
                                        onClick={() => key && toggleSort(key)}
                                    >
                                        <span className="flex items-center gap-1">
                                            {label}
                                            {key && <SortIcon col={key} />}
                                        </span>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {!loading && filtered.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-4 py-8 text-center text-slate-400">
                                        No players found matching your search.
                                    </td>
                                </tr>
                            ) : filtered.map((p, i) => {
                                const isSelected = selectedPlayer?._id === p._id
                                return (
                                    <tr
                                        key={p._id}
                                        onClick={() => setSelectedPlayer(isSelected ? null : p)}
                                        className="transition-colors cursor-pointer"
                                        style={{
                                            background: isSelected
                                                ? 'rgba(37,140,244,0.1)'
                                                : i % 2 === 0
                                                    ? 'rgba(15,25,38,0.6)'
                                                    : 'rgba(10,18,28,0.6)',
                                            borderBottom: '1px solid rgba(51,65,85,0.2)',
                                            borderLeft: isSelected ? '3px solid #258cf4' : '3px solid transparent',
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!isSelected) e.currentTarget.style.background = 'rgba(37,140,244,0.06)'
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!isSelected)
                                                e.currentTarget.style.background =
                                                    i % 2 === 0 ? 'rgba(15,25,38,0.6)' : 'rgba(10,18,28,0.6)'
                                        }}
                                    >
                                        <td className="px-4 py-3" style={{ color: '#475569' }}>{i + 1}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-7 h-7 rounded flex items-center justify-center text-xs font-bold flex-shrink-0"
                                                    style={{ background: 'linear-gradient(135deg,#258cf4,#1a6bc4)', color: 'white' }}
                                                >
                                                    {(p.username || 'Un').slice(0, 2).toUpperCase()}
                                                </div>
                                                <span className="text-white font-medium">{p.username || 'Unknown'}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div>
                                                <span style={{ color: '#ef4444', fontWeight: 600 }}>{p.kills}</span>
                                                <StatBar value={p.kills} max={maxes.kills} color="#ef4444" />
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div>
                                                <span style={{ color: '#f59e0b', fontWeight: 600 }}>{p.deaths}</span>
                                                <StatBar value={p.deaths} max={maxes.deaths} color="#f59e0b" />
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className="font-bold"
                                                style={{ color: parseFloat(p.kdr) >= 2 ? '#22c55e' : parseFloat(p.kdr) >= 1 ? '#f59e0b' : '#ef4444' }}
                                            >
                                                {p.kdr}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div>
                                                <span style={{ color: '#258cf4', fontWeight: 600 }}>{p.playtime}h</span>
                                                <StatBar value={p.playtime} max={maxes.playtime} color="#258cf4" />
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div>
                                                <span style={{ color: '#8b5cf6', fontWeight: 600 }}>{(p.blocksMined / 1000).toFixed(1)}K</span>
                                                <StatBar value={p.blocksMined} max={maxes.blocksMined} color="#8b5cf6" />
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
