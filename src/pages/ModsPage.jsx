import { useState, useEffect } from 'react'
import { modApi } from '../api'

const CATEGORIES = ['All', 'Core', 'Performance', 'Visual', 'HUD', 'Social', 'QoL']

const categoryColors = {
    Core: '#ef4444',
    Performance: '#22c55e',
    Visual: '#8b5cf6',
    HUD: '#258cf4',
    Social: '#ffb800',
    QoL: '#f97316',
}

export default function ModsPage() {
    const [mods, setMods] = useState([])
    const [loading, setLoading] = useState(true)
    const [selected, setSelected] = useState('All')
    const [search, setSearch] = useState('')

    useEffect(() => {
        async function loadMods() {
            setLoading(true)
            try {
                // Fetch mods. We can fetch all and filter client-side since the list is small,
                // or fetch by category. Doing all for instant filtering.
                const data = await modApi.list()
                setMods(data)
            } catch (err) {
                console.error('Failed to load mods:', err)
            } finally {
                setLoading(false)
            }
        }
        loadMods()
    }, [])

    const filtered = mods.filter((m) => {
        const matchCat = selected === 'All' || m.category === selected
        const matchSearch =
            (m.name || '').toLowerCase().includes(search.toLowerCase()) ||
            (m.description || '').toLowerCase().includes(search.toLowerCase())
        return matchCat && matchSearch
    })

    return (
        <div className="space-y-6 max-w-5xl animate-fadeIn">
            {/* Header */}
            <div>
                <h1 className="text-white font-bold text-lg mb-1">Required Mods</h1>
                <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
                    Download and install all mods below to connect to Heavencraft. Use Fabric Loader.
                </p>
            </div>

            {/* Search + filter */}
            <div className="flex flex-col sm:flex-row gap-3">
                {/* Search */}
                <div className="relative flex-1">
                    <span
                        className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined"
                        style={{ color: '#475569', fontSize: '1.1rem' }}
                    >
                        search
                    </span>
                    <input
                        type="text"
                        placeholder="Search mods…"
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

                {/* Category pills */}
                <div className="flex gap-2 flex-wrap">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelected(cat)}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all"
                            style={{
                                background:
                                    selected === cat
                                        ? (cat === 'All' ? '#258cf4' : categoryColors[cat] || '#258cf4')
                                        : 'rgba(51,65,85,0.3)',
                                color: selected === cat ? 'white' : '#64748b',
                                border: `1px solid ${selected === cat
                                    ? (cat === 'All' ? '#258cf4' : categoryColors[cat] || '#258cf4') + '60'
                                    : 'rgba(51,65,85,0.3)'
                                    }`,
                            }}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                    <span className="material-symbols-outlined animate-spin text-4xl mb-2 text-[#8b5cf6]">autorenew</span>
                    Loading mod list...
                </div>
            ) : (
                <>
                    {/* Count */}
                    <p style={{ color: '#475569', fontSize: '0.8rem' }}>
                        Showing {filtered.length} of {mods.length} mods
                    </p>

                    {/* Mod cards grid */}
                    <div className="grid sm:grid-cols-2 gap-4">
                        {filtered.map((mod) => {
                            const color = categoryColors[mod.category] || '#94a3b8'
                            return (
                                <div
                                    key={mod._id || Math.random()}
                                    className="rounded-xl p-5 flex flex-col gap-3 transition-all"
                                    style={{
                                        background: 'rgba(15,25,38,0.85)',
                                        border: '1px solid rgba(51,65,85,0.4)',
                                    }}
                                    onMouseEnter={(e) =>
                                        (e.currentTarget.style.border = `1px solid ${color}50`)
                                    }
                                    onMouseLeave={(e) =>
                                        (e.currentTarget.style.border = '1px solid rgba(51,65,85,0.4)')
                                    }
                                >
                                    {/* Top row */}
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div
                                                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                                                style={{ background: `${color}18` }}
                                            >
                                                <span
                                                    className="material-symbols-outlined"
                                                    style={{ color, fontSize: '1.2rem' }}
                                                >
                                                    extension
                                                </span>
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-white font-bold text-sm truncate">{mod.name}</p>
                                                <p className="text-xs font-mono" style={{ color: '#475569' }}>
                                                    v{mod.version}
                                                </p>
                                            </div>
                                        </div>
                                        <span
                                            className="text-xs font-bold px-2 py-1 rounded flex-shrink-0"
                                            style={{ background: `${color}18`, color }}
                                        >
                                            {mod.category}
                                        </span>
                                    </div>

                                    {/* Description */}
                                    <p className="text-sm flex-1" style={{ color: '#94a3b8' }}>
                                        {mod.description}
                                    </p>

                                    {/* Footer */}
                                    <div className="flex items-center justify-between pt-1">
                                        <span className="text-xs" style={{ color: '#334155' }}>
                                            {mod.fileSize || 'N/A'}
                                        </span>
                                        <a
                                            href={mod.downloadUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all pixel-border cursor-pointer hover:brightness-110"
                                            style={{ background: color, color: 'white' }}
                                        >
                                            <span className="material-symbols-outlined" style={{ fontSize: '0.9rem' }}>
                                                download
                                            </span>
                                            Download
                                        </a>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {filtered.length === 0 && (
                        <div className="text-center py-12" style={{ color: '#475569' }}>
                            <span className="material-symbols-outlined text-5xl block mb-3">search_off</span>
                            <p>No mods found for "{search}"{selected !== 'All' ? ` in category ${selected}` : ''}</p>
                            <button
                                onClick={() => { setSearch(''); setSelected('All'); }}
                                className="mt-4 text-[#258cf4] hover:underline text-sm font-bold"
                            >
                                Clear filters
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

