import { useEffect, useRef } from 'react'

// ── Palette: deep Minecraft night tones ──────────────────────────────────────
const COLORS = {
    star: ['#ffffff', '#a0c8ff', '#ffe0a0', '#c0e8ff'],
    block: ['#5b8a3c', '#7cad52', '#4a7032', '#8bc34a', '#2e5c14'],
    ore: ['#3daee9', '#ffb800', '#e74c3c', '#9b59b6'],
    particle: ['#ffb800', '#ff6b35', '#ffd700', '#ff4500'],
    torch: '#ffb84d',
}

const PIXEL = 6          // base pixel size (px)
const FPS = 30
const MS = 1000 / FPS

// ── Helpers ───────────────────────────────────────────────────────────────────
function rand(min, max) { return Math.random() * (max - min) + min }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)] }

// ── Entity factories ──────────────────────────────────────────────────────────

function makeBlock(W, H) {
    const size = PIXEL * (Math.random() < 0.5 ? 2 : 3)
    return {
        type: 'block',
        x: rand(0, W),
        y: rand(-50, H + 50),
        size,
        color: pick(COLORS.block),
        ore: Math.random() < 0.25 ? pick(COLORS.ore) : null,
        vy: rand(0.08, 0.22),
        rot: rand(0, Math.PI * 2),
        drot: rand(-0.005, 0.005),
        alpha: rand(0.08, 0.18),
    }
}

function makeStar(W, H) {
    return {
        type: 'star',
        x: rand(0, W),
        y: rand(0, H),
        r: rand(0.5, 1.8),
        color: pick(COLORS.star),
        alpha: rand(0.2, 0.7),
        dalpha: rand(0.002, 0.007) * (Math.random() < 0.5 ? 1 : -1),
    }
}

function makeParticle(W, H) {
    return {
        type: 'particle',
        x: rand(0, W),
        y: H + 10,
        vx: rand(-0.3, 0.3),
        vy: rand(-0.6, -1.4),
        size: PIXEL * rand(0.5, 1),
        color: pick(COLORS.particle),
        alpha: rand(0.5, 0.9),
        life: 1.0,
        drain: rand(0.003, 0.008),
    }
}

function makeTorch(W, H) {
    return {
        type: 'torch',
        x: rand(40, W - 40),
        y: rand(H * 0.2, H * 0.85),
        flicker: rand(0, Math.PI * 2),
    }
}

// ── Pixel art drawers ─────────────────────────────────────────────────────────
function drawBlock(ctx, b) {
    ctx.save()
    ctx.globalAlpha = b.alpha
    ctx.translate(b.x, b.y)
    ctx.rotate(b.rot)

    const s = b.size
    // Face
    ctx.fillStyle = b.color
    ctx.fillRect(-s / 2, -s / 2, s, s)
    // Top highlight
    ctx.fillStyle = 'rgba(255,255,255,0.18)'
    ctx.fillRect(-s / 2, -s / 2, s, PIXEL * 0.5)
    // Left shadow
    ctx.fillStyle = 'rgba(0,0,0,0.20)'
    ctx.fillRect(-s / 2, -s / 2, PIXEL * 0.5, s)
    // Ore speck
    if (b.ore) {
        ctx.fillStyle = b.ore
        ctx.globalAlpha = b.alpha * 0.7
        const ss = PIXEL * 0.9
        ctx.fillRect(s * 0.1, -s * 0.1, ss, ss)
    }
    ctx.restore()
}

function drawStar(ctx, s) {
    ctx.save()
    ctx.globalAlpha = s.alpha
    ctx.fillStyle = s.color
    // 2-pixel star cross
    ctx.fillRect(s.x - 1, s.y - s.r * 3, 2, s.r * 6)
    ctx.fillRect(s.x - s.r * 3, s.y - 1, s.r * 6, 2)
    ctx.restore()
}

function drawParticle(ctx, p) {
    ctx.save()
    ctx.globalAlpha = p.alpha * p.life
    ctx.fillStyle = p.color
    const s = Math.max(1, p.size * p.life)
    ctx.fillRect(p.x - s / 2, p.y - s / 2, s, s)
    ctx.restore()
}

function drawTorch(ctx, t, time) {
    ctx.save()
    ctx.translate(t.x, t.y)

    const flicker = Math.sin(time * 0.006 + t.flicker) * 0.15

    // Stick (4×8 pixels)
    ctx.fillStyle = '#7a4a1e'
    ctx.globalAlpha = 0.25
    ctx.fillRect(-PIXEL * 0.5, 0, PIXEL, PIXEL * 1.5)

    // Warm coal top
    ctx.fillStyle = '#ff6a00'
    ctx.globalAlpha = 0.3 + flicker
    ctx.fillRect(-PIXEL * 0.7, -PIXEL * 0.6, PIXEL * 1.4, PIXEL)

    // Glow halo
    const grad = ctx.createRadialGradient(0, -PIXEL * 0.3, 1, 0, -PIXEL * 0.3, PIXEL * 7)
    grad.addColorStop(0, `rgba(255,168,0,${0.12 + flicker * 0.5})`)
    grad.addColorStop(1, 'rgba(255,100,0,0)')
    ctx.globalAlpha = 1
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.arc(0, -PIXEL * 0.3, PIXEL * 7, 0, Math.PI * 2)
    ctx.fill()

    ctx.restore()
}

// ── Main component ────────────────────────────────────────────────────────────
export default function PixelBackground() {
    const canvasRef = useRef(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')

        let W = canvas.offsetWidth
        let H = canvas.offsetHeight
        canvas.width = W
        canvas.height = H

        // Spawn entities
        const BLOCK_COUNT = Math.floor((W * H) / 90000)
        const STAR_COUNT = 60
        const PARTICLE_COUNT = 12
        const TORCH_COUNT = Math.max(2, Math.floor((W * H) / 160000))

        let entities = [
            ...Array.from({ length: BLOCK_COUNT }, () => makeBlock(W, H)),
            ...Array.from({ length: STAR_COUNT }, () => makeStar(W, H)),
            ...Array.from({ length: PARTICLE_COUNT }, () => makeParticle(W, H)),
            ...Array.from({ length: TORCH_COUNT }, () => makeTorch(W, H)),
        ]

        let last = 0
        let rafId

        function tick(ts) {
            rafId = requestAnimationFrame(tick)
            if (ts - last < MS) return
            last = ts

            // Re-check size in case of resize
            if (canvas.offsetWidth !== W || canvas.offsetHeight !== H) {
                W = canvas.offsetWidth
                H = canvas.offsetHeight
                canvas.width = W
                canvas.height = H
            }

            ctx.clearRect(0, 0, W, H)

            for (let e of entities) {
                if (e.type === 'block') {
                    e.y += e.vy
                    e.rot += e.drot
                    if (e.y > H + 80) { Object.assign(e, makeBlock(W, H)); e.y = -60 }
                    drawBlock(ctx, e)
                }
                else if (e.type === 'star') {
                    e.alpha += e.dalpha
                    if (e.alpha > 0.75 || e.alpha < 0.05) e.dalpha *= -1
                    drawStar(ctx, e)
                }
                else if (e.type === 'particle') {
                    e.x += e.vx
                    e.y += e.vy
                    e.life -= e.drain
                    if (e.life <= 0) Object.assign(e, makeParticle(W, H))
                    drawParticle(ctx, e)
                }
                else if (e.type === 'torch') {
                    drawTorch(ctx, e, ts)
                }
            }
        }

        rafId = requestAnimationFrame(tick)
        return () => cancelAnimationFrame(rafId)
    }, [])

    return (
        <canvas
            ref={canvasRef}
            aria-hidden="true"
            style={{
                position: 'fixed',
                inset: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 0,
                opacity: 0.65,
            }}
        />
    )
}
