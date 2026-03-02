import { Router } from 'express'
import Player from '../models/Player.js'

const router = Router()

// ────────────────────────────────────────────────
// GET /api/players
// List all players with optional search & sort
// ────────────────────────────────────────────────
router.get('/', async (req, res) => {
    try {
        const { search, sort = 'kills', order = 'desc', limit = 50 } = req.query

        const filter = search
            ? { username: { $regex: search, $options: 'i' } }
            : {}

        const sortOrder = order === 'asc' ? 1 : -1
        const players = await Player.find(filter)
            .sort({ [sort]: sortOrder })
            .limit(parseInt(limit))
            .lean()

        // Add KDR manually for lean queries
        const result = players.map(p => ({
            ...p,
            kdr: p.deaths === 0 ? p.kills : +(p.kills / p.deaths).toFixed(2),
        }))

        res.json(result)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// ────────────────────────────────────────────────
// GET /api/players/:id
// Single player by ID or username
// ────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params

        // Try by MongoDB ID first, then by username
        let player = null
        if (id.match(/^[0-9a-fA-F]{24}$/)) {
            player = await Player.findById(id)
        }
        if (!player) {
            player = await Player.findOne({
                username: { $regex: `^${id}$`, $options: 'i' },
            })
        }

        if (!player) {
            return res.status(404).json({ error: 'Player not found' })
        }

        res.json(player)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// ────────────────────────────────────────────────
// PUT /api/players/:id
// Update player stats (admin/system use)
// ────────────────────────────────────────────────
router.put('/:id', async (req, res) => {
    try {
        const player = await Player.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        )
        if (!player) return res.status(404).json({ error: 'Player not found' })
        res.json(player)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

export default router
