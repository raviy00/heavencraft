import { Router } from 'express'
import ServerConfig from '../models/ServerConfig.js'
import Player from '../models/Player.js'
import Activity from '../models/Activity.js'
import { getServerStatus } from '../utils/mcServerStatus.js'

const router = Router()

// ────────────────────────────────────────────────
// GET /api/server/info
// Full server info
// ────────────────────────────────────────────────
router.get('/info', async (req, res) => {
    try {
        const config = await ServerConfig.getConfig()

        // Fetch real status from third-party library/api (mcstatus.io / minecraft-server-util)
        // This emulates the live website's functionality as requested.
        const liveInfo = await getServerStatus(config.ip, config.port)

        // Decide status (if DB says starting, we override live ping until it finishes)
        let finalStatus = config.status
        if (config.status === 'starting') {
            if (liveInfo.status === 'online') {
                finalStatus = 'online'
                config.status = 'online'
                await config.save()
            } else {
                // If it's been starting for over 10 minutes, reset to offline
                const elapsed = Date.now() - new Date(config.lastStartedAt || Date.now()).getTime()
                if (elapsed > 10 * 60 * 1000) {
                    finalStatus = 'offline'
                    config.status = 'offline'
                    await config.save()
                }
            }
        }

        if (finalStatus !== 'starting') {
            finalStatus = liveInfo.status;
            // Auto update DB status to reflect real world offline/online state transitions
            if (config.status !== finalStatus) {
                config.status = finalStatus
                if (finalStatus === 'offline') config.uptime = '0h 0m'
                await config.save()
            }
        }

        res.json({
            ip: config.ip,
            port: config.port,
            version: liveInfo.version || config.version,
            motd: liveInfo.motd || config.motd,
            status: finalStatus,
            onlinePlayers: liveInfo.onlinePlayers,
            maxPlayers: liveInfo.maxPlayers || config.maxPlayers,
            playersList: liveInfo.playersList || [],
            uptime: config.uptime,
            lastStartedBy: config.lastStartedBy,
            lastStartedAt: config.lastStartedAt,
        })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// ────────────────────────────────────────────────
// GET /api/server/status
// Quick status check
// ────────────────────────────────────────────────
router.get('/status', async (req, res) => {
    try {
        const config = await ServerConfig.getConfig()

        // Fetch real status from third-party library/api
        const liveInfo = await getServerStatus(config.ip, config.port)

        let finalStatus = config.status
        if (config.status === 'starting') {
            if (liveInfo.status === 'online') {
                finalStatus = 'online'
                config.status = 'online'
                await config.save()
            } else {
                const elapsed = Date.now() - new Date(config.lastStartedAt || Date.now()).getTime()
                if (elapsed > 10 * 60 * 1000) {
                    finalStatus = 'offline'
                    config.status = 'offline'
                    await config.save()
                }
            }
        }

        if (finalStatus !== 'starting') {
            finalStatus = liveInfo.status;
            if (config.status !== finalStatus) {
                config.status = finalStatus
                if (finalStatus === 'offline') config.uptime = '0h 0m'
                await config.save()
            }
        }

        res.json({
            status: finalStatus,
            onlinePlayers: liveInfo.onlinePlayers,
            maxPlayers: liveInfo.maxPlayers || config.maxPlayers,
        })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// ────────────────────────────────────────────────
// POST /api/server/start
// Simulate server start (offline → starting → online)
// ────────────────────────────────────────────────
router.post('/start', async (req, res) => {
    try {
        const config = await ServerConfig.getConfig()

        if (config.status === 'online') {
            return res.status(400).json({ error: 'Server is already online' })
        }

        if (config.status === 'starting') {
            return res.status(400).json({ error: 'Server is already starting' })
        }

        const username = req.body.username || 'Unknown'

        // Set to starting
        config.status = 'starting'
        config.lastStartedBy = username
        config.lastStartedAt = new Date()
        await config.save()

        // Log activity
        await Activity.create({
            type: 'join',
            player: username,
            detail: 'started the server',
            icon: 'power_settings_new',
        })

        // We rely on the /info API polling mcstatus or our custom checks to detect when it comes fully online.



        res.json({ message: 'Server starting…', status: 'starting' })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// ────────────────────────────────────────────────
// POST /api/server/stop
// Stop the server
// ────────────────────────────────────────────────
router.post('/stop', async (req, res) => {
    try {
        const config = await ServerConfig.getConfig()

        if (config.status === 'offline') {
            return res.status(400).json({ error: 'Server is already offline' })
        }

        const username = req.body.username || 'Unknown'

        // Calculate uptime
        let uptimeStr = '0h 0m'
        if (config.startedAt) {
            const ms = Date.now() - config.startedAt.getTime()
            const hours = Math.floor(ms / 3600000)
            const mins = Math.floor((ms % 3600000) / 60000)
            uptimeStr = `${hours}h ${mins}m`
        }

        config.status = 'offline'
        config.uptime = uptimeStr
        config.startedAt = null
        await config.save()

        // Set all players offline
        await Player.updateMany({}, { isOnline: false })

        await Activity.create({
            type: 'leave',
            player: username,
            detail: 'stopped the server',
            icon: 'power_settings_new',
        })

        res.json({ message: 'Server stopped', status: 'offline' })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

export default router
