import { Router } from 'express'
import Player from '../models/Player.js'

const router = Router()

// ────────────────────────────────────────────────
// GET /api/stats/network
// Aggregate network-wide statistics
// ────────────────────────────────────────────────
router.get('/network', async (req, res) => {
    try {
        const [stats] = await Player.aggregate([
            {
                $group: {
                    _id: null,
                    totalPlayers: { $sum: 1 },
                    totalKills: { $sum: '$kills' },
                    totalDeaths: { $sum: '$deaths' },
                    totalPlaytime: { $sum: '$playtime' },
                    totalBlocksMined: { $sum: '$blocksMined' },
                    onlinePlayers: {
                        $sum: { $cond: ['$isOnline', 1, 0] },
                    },
                },
            },
        ])

        res.json(stats || {
            totalPlayers: 0,
            totalKills: 0,
            totalDeaths: 0,
            totalPlaytime: 0,
            totalBlocksMined: 0,
            onlinePlayers: 0,
        })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// ────────────────────────────────────────────────
// GET /api/stats/top
// Top players per metric (quick summary)
// ────────────────────────────────────────────────
router.get('/top', async (req, res) => {
    try {
        const topKills = await Player.findOne().sort({ kills: -1 }).select('username kills').lean()
        const topPlaytime = await Player.findOne().sort({ playtime: -1 }).select('username playtime').lean()
        const topBlocks = await Player.findOne().sort({ blocksMined: -1 }).select('username blocksMined').lean()
        const topDeaths = await Player.findOne().sort({ deaths: -1 }).select('username deaths').lean()

        res.json({ topKills, topPlaytime, topBlocks, topDeaths })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

export default router
