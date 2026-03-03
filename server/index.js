import 'dotenv/config'
import dns from 'node:dns'
import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'

// Routes
import authRoutes from './routes/auth.js'
import serverRoutes from './routes/server.js'
import playerRoutes from './routes/players.js'
import leaderboardRoutes from './routes/leaderboard.js'
import modRoutes from './routes/mods.js'
import activityRoutes from './routes/activity.js'
import statsRoutes from './routes/stats.js'
import mapRoutes from './routes/map.js'
import userRoutes from './routes/users.js'
import contactRoutes from './routes/contact.js'

// Fix Node.js DNS — use Google DNS for SRV resolution
dns.setDefaultResultOrder('ipv4first')
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1'])

const app = express()
const PORT = process.env.PORT || 3001

// ── Security headers (no extra dep needed) ──────────────────
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('X-Frame-Options', 'SAMEORIGIN')
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
    res.setHeader('X-XSS-Protection', '0') // modern browsers ignore it; CSP is better
    next()
})

// ── Middleware ──────────────────────────────────
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
}))
app.use(express.json({ limit: '2mb' }))

// ── Routes ─────────────────────────────────────
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
        mongo: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    })
})

// ── 404 fallback ────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' })
})

// ── Global error handler ────────────────────────
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err)
    res.status(500).json({ error: 'Internal server error' })
})

// ── MongoDB + Start ────────────────────────────
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

    app.listen(PORT, () => {
        console.log(`🚀 Heavencraft API running on http://localhost:${PORT}`)
        console.log(`📡 Endpoints:`)
        console.log(`   Auth:        /api/auth/discord, /api/auth/google, /api/auth/microsoft`)
        console.log(`   Server:      /api/server/info, /status, /start, /stop`)
        console.log(`   Players:     /api/players`)
        console.log(`   Leaderboard: /api/leaderboard`)
        console.log(`   Mods:        /api/mods`)
        console.log(`   Activity:    /api/activity`)
        console.log(`   Stats:       /api/stats/network, /top`)
        console.log(`   Map:         /api/map/chunks, /pois`)
        console.log(`   Users:       /api/users/profile, /role`)
    })
}

// ── Handle unexpected rejections ────────────────
process.on('unhandledRejection', (reason) => {
    console.error('Unhandled promise rejection:', reason)
})

start()
