import { useEffect, useRef } from 'react'

// ── Minecraft block colour palette ──────────────────────────
// Each block: top face (light), front face (mid), right face (dark), optional glow
const BLOCK_TYPES = [
    { top: '#7CB848', front: '#5A8A2A', right: '#4A7221', glow: false },  // Grass
    { top: '#A0A0A0', front: '#8C8C8C', right: '#757575', glow: false },  // Stone
    { top: '#A07040', front: '#8B5E34', right: '#72502C', glow: false },  // Dirt
    { top: '#5DE6E6', front: '#38C8C8', right: '#28AEAE', glow: true },  // Diamond
    { top: '#FFD700', front: '#E6BA00', right: '#CCA300', glow: true },  // Gold Block
    { top: '#E8E8E8', front: '#D0D0D0', right: '#B8B8B8', glow: false },  // Iron Block
    { top: '#D4A264', front: '#A07840', right: '#8A6432', glow: false },  // Wood Planks
    { top: '#50B850', front: '#3CA03C', right: '#2C8C2C', glow: false },  // Oak Leaves
    { top: '#3A1A4A', front: '#281233', right: '#1C0C26', glow: false },  // Obsidian
    { top: '#FFEC00', front: '#FFCA22', right: '#E6AE00', glow: true },  // Glowstone
    { top: '#1E74C8', front: '#145AAE', right: '#0E4494', glow: false },  // Lapis
    { top: '#CC2A0A', front: '#AA1E06', right: '#8C1404', glow: false },  // TNT
    { top: '#78CC78', front: '#5AAA5A', right: '#468A46', glow: false },  // Slime
    { top: '#8080FF', front: '#6060EE', right: '#4848DC', glow: true },  // Enchant Table
    { top: '#FF8C00', front: '#E07000', right: '#C45C00', glow: true },  // Magma/Lava
    { top: '#58C0D8', front: '#3A9CC0', right: '#2880A8', glow: false },  // Prismarine
]

// Draw a single 3-face isometric block
function drawBlock(ctx, x, y, size, type, alpha) {
    const iso = size * 0.5 // isometric depth offset
    const isoH = iso * 0.5 // half height for perspective

    ctx.globalAlpha = alpha

    // Glow for special blocks
    if (type.glow) {
        ctx.shadowColor = type.top
        ctx.shadowBlur = size * 0.8
    }

    // Front face (square)
    ctx.fillStyle = type.front
    ctx.fillRect(x, y, size, size)

    // Top face (parallelogram, upper-right)
    ctx.fillStyle = type.top
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x + iso, y - isoH)
    ctx.lineTo(x + size + iso, y - isoH)
    ctx.lineTo(x + size, y)
    ctx.closePath()
    ctx.fill()

    // Right face (parallelogram, lower-right)
    ctx.fillStyle = type.right
    ctx.beginPath()
    ctx.moveTo(x + size, y)
    ctx.lineTo(x + size + iso, y - isoH)
    ctx.lineTo(x + size + iso, y + size - isoH)
    ctx.lineTo(x + size, y + size)
    ctx.closePath()
    ctx.fill()

    // Reset
    ctx.shadowBlur = 0
    ctx.globalAlpha = 1
}

export default function MinecraftBackground() {
    const canvasRef = useRef(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')

        let W = window.innerWidth
        let H = window.innerHeight
        canvas.width = W
        canvas.height = H

        // Spawn count: denser on wide screens, fewer on mobile
        const COUNT = Math.min(80, Math.max(30, Math.floor((W * H) / 28000)))

        // Create blocks — some start mid-screen so it isn't empty at load
        const blocks = Array.from({ length: COUNT }, (_, i) => ({
            x: Math.random() * (W + 80) - 40,
            y: i < COUNT * 0.6 ? Math.random() * H : -Math.random() * H * 0.5,
            size: 14 + Math.random() * 46,            // 14–60 px
            speed: 0.35 + Math.random() * 1.2,         // fall speed
            wobble: (Math.random() - 0.5) * 0.45,       // horizontal drift
            type: BLOCK_TYPES[Math.floor(Math.random() * BLOCK_TYPES.length)],
            alpha: 0.08 + Math.random() * 0.28,        // 0.08 – 0.36
        }))

        let animId

        const animate = () => {
            // Dark gradient sky background
            const grad = ctx.createLinearGradient(0, 0, 0, H)
            grad.addColorStop(0, '#030810')
            grad.addColorStop(0.5, '#04090f')
            grad.addColorStop(1, '#070e1a')
            ctx.globalAlpha = 1
            ctx.fillStyle = grad
            ctx.fillRect(0, 0, W, H)

            // Subtle star layer (static, fast to draw)
            ctx.fillStyle = 'rgba(255,255,255,0.5)'
            for (let s = 0; s < 60; s++) {
                // deterministic pseudo-random so stars don't flicker
                const sx = ((s * 137 + 31) % W)
                const sy = ((s * 197 + 73) % (H * 0.7))
                const sr = s % 3 === 0 ? 1 : 0.5
                ctx.beginPath()
                ctx.arc(sx, sy, sr, 0, Math.PI * 2)
                ctx.fill()
            }

            // Update + draw each block
            for (const b of blocks) {
                b.y += b.speed
                b.x += b.wobble

                // Vertical wrap
                if (b.y > H + b.size * 2) {
                    b.y = -b.size * 2
                    b.x = Math.random() * W
                }
                // Horizontal wrap
                if (b.x < -b.size * 2) b.x = W + b.size
                if (b.x > W + b.size * 2) b.x = -b.size

                drawBlock(ctx, b.x, b.y, b.size, b.type, b.alpha)
            }

            animId = requestAnimationFrame(animate)
        }

        animate()

        const onResize = () => {
            W = window.innerWidth
            H = window.innerHeight
            canvas.width = W
            canvas.height = H
        }
        window.addEventListener('resize', onResize)

        return () => {
            cancelAnimationFrame(animId)
            window.removeEventListener('resize', onResize)
        }
    }, [])

    return (
        <canvas
            ref={canvasRef}
            aria-hidden="true"
            style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', zIndex: 0 }}
        />
    )
}
