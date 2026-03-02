import { Router } from 'express'
import Player from '../models/Player.js'

const router = Router()

const METRICS = [
    { key: 'kills', label: 'Kills', icon: 'skull', unit: '' },
    { key: 'blocksMined', label: 'Blocks Mined', icon: 'construction', unit: '' },
    { key: 'playtime', label: 'Playtime', icon: 'schedule', unit: 'h' },
    { key: 'deaths', label: 'Deaths', icon: 'heart_broken', unit: '' },
    { key: 'kdr', label: 'K/D Ratio', icon: 'trending_up', unit: '' },
]

// ────────────────────────────────────────────────
// GET /api/leaderboard
// Returns ranked players for a given metric
// ────────────────────────────────────────────────
router.get('/', async (req, res) => {
    try {
        const { metric = 'kills', limit = 10 } = req.query

        // Validate metric
        const validKeys = ['kills', 'deaths', 'playtime', 'blocksMined', 'kdr']
        const sortKey = validKeys.includes(metric) ? metric : 'kills'

        let players

        if (sortKey === 'kdr') {
            // KDR requires computation — use aggregation
            players = await Player.aggregate([
                {
                    $addFields: {
                        kdr: {
                            $cond: [
                                { $eq: ['$deaths', 0] },
                                '$kills',
                                { $round: [{ $divide: ['$kills', '$deaths'] }, 2] },
                            ],
                        },
                    },
                },
                { $sort: { kdr: -1 } },
                { $limit: parseInt(limit) },
                {
                    $project: {
                        username: 1, kills: 1, deaths: 1,
                        playtime: 1, blocksMined: 1, kdr: 1,
                        joinDate: 1, lastSeen: 1, isOnline: 1,
                    },
                },
            ])
        } else {
            players = await Player.find()
                .sort({ [sortKey]: -1 })
                .limit(parseInt(limit))
                .lean()

            // Add KDR
            players = players.map(p => ({
                ...p,
                kdr: p.deaths === 0 ? p.kills : +(p.kills / p.deaths).toFixed(2),
            }))
        }

        res.json({ metrics: METRICS, players })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

export default router
