import { useEffect, useRef, useState, useCallback } from 'react'
import { mapApi } from '../api'

const CHUNK = 8 // pixels per chunk at zoom=1

export default function MapPage() {
    const canvasRef = useRef(null)
    const [zoom, setZoom] = useState(1)
    const [pan, setPan] = useState({ x: 0, y: 0 })
    const [dragging, setDragging] = useState(false)
    const [dragStart, setDragStart] = useState(null)
    const [lastUpdate, setLastUpdate] = useState(new Date())

    const [mapData, setMapData] = useState(null)
    const [loading, setLoading] = useState(true)

    const [targetLoc, setTargetLoc] = useState({ x: 0, z: 0 })

    const loadData = useCallback(async () => {
        try {
            // Fetch map chunks 
            const chunkRes = await mapApi.chunks(targetLoc.x, targetLoc.z, 30)

            // Reconstruct 2D array for map from chunk data
            const chunksList = chunkRes.chunks || chunkRes || []
            const minX = chunksList.length > 0 ? Math.min(...chunksList.map(c => c.x)) : 0
            const maxX = chunksList.length > 0 ? Math.max(...chunksList.map(c => c.x)) : 0
            const minZ = chunksList.length > 0 ? Math.min(...chunksList.map(c => c.z)) : 0
            const maxZ = chunksList.length > 0 ? Math.max(...chunksList.map(c => c.z)) : 0

            const cols = Math.max(1, maxX - minX + 1)
            const rows = Math.max(1, maxZ - minZ + 1)
            const map2D = Array(rows).fill(null).map(() => Array(cols).fill(null))

            chunksList.forEach(chunk => {
                const r = chunk.z - minZ
                const c = chunk.x - minX
                if (r >= 0 && r < rows && c >= 0 && c < cols) {
                    map2D[r][c] = chunk
                }
            })

            setMapData({
                map: map2D,
                minX, minZ,
                COLS: cols,
                ROWS: rows
            })

            setLastUpdate(new Date())
        } catch (err) {
            console.error('Failed to load map data:', err)
        } finally {
            setLoading(false)
        }
    }, [targetLoc])

    useEffect(() => {
        loadData()
    }, [loadData])

    const draw = useCallback(() => {
        const canvas = canvasRef.current
        if (!canvas || !mapData) return
        const ctx = canvas.getContext('2d')
        const { map, COLS, ROWS, minX, minZ } = mapData
        const cw = canvas.width
        const ch = canvas.height
        ctx.clearRect(0, 0, cw, ch)

        const cs = Math.round(CHUNK * zoom)

        // Offset relative to actual 0,0 making sure the world origin is at the center of pan
        const originX = (-minX) * cs
        const originZ = (-minZ) * cs

        // Base offset (panning + centering)
        const offsetX = Math.round(pan.x + cw / 2 - originX)
        const offsetY = Math.round(pan.y + ch / 2 - originZ)

        // Draw chunks
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                if (map[r][c]) {
                    ctx.fillStyle = map[r][c].color
                    ctx.fillRect(offsetX + c * cs, offsetY + r * cs, cs, cs)
                }
            }
        }

        // Grid lines at zoom >= 1.5
        if (zoom >= 1.5) {
            ctx.strokeStyle = 'rgba(0,0,0,0.15)'
            ctx.lineWidth = 0.5
            for (let r = 0; r <= ROWS; r++) {
                ctx.beginPath()
                ctx.moveTo(offsetX, offsetY + r * cs)
                ctx.lineTo(offsetX + COLS * cs, offsetY + r * cs)
                ctx.stroke()
            }
            for (let c = 0; c <= COLS; c++) {
                ctx.beginPath()
                ctx.moveTo(offsetX + c * cs, offsetY)
                ctx.lineTo(offsetX + c * cs, offsetY + ROWS * cs)
                ctx.stroke()
            }
        }

        // Compass
        ctx.save()
        ctx.translate(cw - 50, 50)
        ctx.fillStyle = 'rgba(0,0,0,0.6)'
        ctx.beginPath(); ctx.arc(0, 0, 24, 0, Math.PI * 2); ctx.fill()
        ctx.font = 'bold 11px "Space Grotesk", sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillStyle = '#ef4444'; ctx.fillText('N', 0, -12)
        ctx.fillStyle = '#94a3b8'; ctx.fillText('S', 0, 12)
        ctx.fillStyle = '#94a3b8'; ctx.fillText('E', 12, 0)
        ctx.fillStyle = '#94a3b8'; ctx.fillText('W', -12, 0)
        ctx.restore()

        // Coords overlay (bottom-left)
        ctx.fillStyle = 'rgba(0,0,0,0.6)'
        ctx.fillRect(8, ch - 32, 160, 24)
        ctx.font = '11px monospace'
        ctx.fillStyle = '#94a3b8'
        ctx.fillText(`Zoom: ${zoom.toFixed(1)}x`, 16, ch - 16)
    }, [zoom, pan, mapData])

    useEffect(() => { draw() }, [draw])

    // Auto-refresh every 30s
    useEffect(() => {
        const id = setInterval(loadData, 30000)
        return () => clearInterval(id)
    }, [loadData])

    const onWheel = (e) => {
        e.preventDefault()
        setZoom((z) => Math.min(4, Math.max(0.5, z - e.deltaY * 0.001)))
    }

    const onMouseDown = (e) => {
        setDragging(true)
        setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
    }

    const onMouseMove = (e) => {
        if (!dragging || !dragStart) return
        setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y })
    }

    const onMouseUp = () => { setDragging(false); setDragStart(null) }

    return (
        <div className="space-y-4 flex flex-col animate-fadeIn" style={{ height: 'calc(100vh - 120px)' }}>
            {/* Controls bar */}
            <div className="flex items-center justify-between flex-shrink-0 flex-wrap gap-3">
                <div>
                    <h1 className="text-white font-bold text-lg flex items-center gap-2">
                        <span className="material-symbols-outlined text-amber-500">explore</span>
                        World Map
                    </h1>
                    <p style={{ color: '#475569', fontSize: '0.8rem' }}>
                        Last updated: {lastUpdate.toLocaleTimeString()} · Auto-refreshes every 30s
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
                        className="w-9 h-9 flex items-center justify-center rounded-lg text-white transition-colors hover:bg-slate-700"
                        style={{ background: 'rgba(51,65,85,0.5)', border: '1px solid rgba(51,65,85,0.6)' }}
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>remove</span>
                    </button>
                    <span
                        className="px-3 py-1.5 rounded text-sm font-mono text-white"
                        style={{ background: 'rgba(51,65,85,0.4)', minWidth: '52px', textAlign: 'center' }}
                    >
                        {zoom.toFixed(1)}x
                    </span>
                    <button
                        onClick={() => setZoom((z) => Math.min(4, z + 0.25))}
                        className="w-9 h-9 flex items-center justify-center rounded-lg text-white transition-colors hover:bg-slate-700"
                        style={{ background: 'rgba(51,65,85,0.5)', border: '1px solid rgba(51,65,85,0.6)' }}
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>add</span>
                    </button>
                    <button
                        onClick={() => { setPan({ x: 0, y: 0 }); setZoom(1); setTargetLoc({ x: 0, z: 0 }); }}
                        className="px-3 py-1.5 rounded-lg text-sm font-medium text-white transition-colors flex items-center gap-1 hover:bg-blue-600 hover:text-white"
                        style={{ background: 'rgba(37,140,244,0.2)', border: '1px solid rgba(37,140,244,0.3)', color: '#258cf4' }}
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>my_location</span>
                        Reset
                    </button>
                </div>
            </div>

            {/* Canvas Area */}
            <div
                className="flex-1 rounded-xl overflow-hidden relative"
                style={{ border: '1px solid rgba(51,65,85,0.5)', cursor: dragging ? 'grabbing' : 'grab', minHeight: '400px' }}
            >
                {loading && !mapData && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#0a121c]/80 backdrop-blur-sm">
                        <span className="material-symbols-outlined animate-spin text-4xl text-[#258cf4] mb-2">autorenew</span>
                        <span className="text-slate-400 font-medium">Loading terrain data...</span>
                    </div>
                )}

                <canvas
                    ref={canvasRef}
                    className="w-full h-full"
                    width={1200}
                    height={700}
                    onWheel={onWheel}
                    onMouseDown={onMouseDown}
                    onMouseMove={onMouseMove}
                    onMouseUp={onMouseUp}
                    onMouseLeave={onMouseUp}
                    style={{ display: 'block' }}
                />
            </div>
        </div>
    )
}
