import 'dotenv/config'
import dns from 'node:dns'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { existsSync } from 'node:fs'
import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'

// Routes
import authRoutes from './routes/auth.js'
import serverRoutes from './routes/server.js'
import playerRoutes from './routes/players.js'
import leaderboardRoutes from './routes/leaderboard.js'
import { startBot } from './bot.js'
import modRoutes from './routes/mods.js'
import activityRoutes from './routes/activity.js'
import statsRoutes from './routes/stats.js'
import mapRoutes from './routes/map.js'
import userRoutes from './routes/users.js'
import contactRoutes from './routes/contact.js'

// Fix Node.js DNS — use Google DNS for SRV resolution
dns.setDefaultResultOrder('ipv4first')
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1'])

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const DIST_PATH = join(__dirname, '..', 'dist')

const app = express()
const PORT = process.env.PORT || 3001
const IS_PROD = process.env.NODE_ENV === 'production'

// ── Security headers ─────────────────────────────────────────
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('X-Frame-Options', 'SAMEORIGIN')
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
    res.setHeader('X-XSS-Protection', '0')
    next()
})

// ── CORS — allow localhost dev + Render deployed URL ─────────
const allowedOrigins = [
    process.env.FRONTEND_URL,
    process.env.RENDER_EXTERNAL_URL,
    'http://localhost:5173',
    'http://localhost:3001',
].filter(Boolean)

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (curl, Postman, same-origin requests)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true)
        } else {
            callback(new Error(`CORS: origin ${origin} not allowed`))
        }
    },
    credentials: true,
}))

app.use(express.json({ limit: '2mb' }))

// ── API Routes ───────────────────────────────────────────────
app.use('/api/auth', authRoutes)
app.use('/api/server', serverRoutes)
app.use('/api/players', playerRoutes)
app.use('/api/leaderboard', leaderboardRoutes)
app.use('/api/mods', modRoutes)
app.use('/api/activity', activityRoutes)
app.use('/api/stats', statsRoutes)
app.use('/api/map', mapRoutes)
app.use('/api/users', userRoutes)
app.use('/api/contact', contactRoutes)

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        env: IS_PROD ? 'production' : 'development',
        mongo: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    })
})

// ── API 404 — scoped to /api/* only ─────────────────────────
app.use('/api', (req, res) => {
    res.status(404).json({ error: 'API endpoint not found' })
})

// ── Serve React frontend in production ───────────────────────
// In production the Express server doubles as a static file server,
// so we only need a single Render service (no separate static site).
if (IS_PROD && existsSync(DIST_PATH)) {
    app.use(express.static(DIST_PATH, { maxAge: '1y', etag: true }))
    // SPA fallback — return index.html for all non-API routes
    app.get('*', (_req, res) => {
        res.sendFile(join(DIST_PATH, 'index.html'))
    })
}

// ── Global error handler ─────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
    console.error('Unhandled error:', err)
    res.status(500).json({ error: 'Internal server error' })
})

// ── MongoDB + Start ──────────────────────────────────────────
async function start() {
    try {
        console.log('⛏  Connecting to MongoDB…')
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 15000,
            family: 4,
        })
        console.log('✅ MongoDB connected to:', mongoose.connection.name)
    } catch (err) {
        console.error('❌ MongoDB connection failed:', err.message)
        process.exit(1)
    }

    // Render requires listening on 0.0.0.0 (not just 127.0.0.1)
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 Heavencraft running on port ${PORT} [${IS_PROD ? 'production' : 'development'}]`)
        if (IS_PROD && existsSync(DIST_PATH)) {
            console.log(`🌐 Serving React frontend from ${DIST_PATH}`)
        }

        // Start the keep-alive Aternos bot
        startBot();
    })
}

// ── Handle unexpected rejections ─────────────────────────────
process.on('unhandledRejection', (reason) => {
    console.error('Unhandled promise rejection:', reason)
})

start()
