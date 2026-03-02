import { Router } from 'express'
import Activity from '../models/Activity.js'

const router = Router()

// ────────────────────────────────────────────────
// GET /api/activity
// Recent activity feed
// ────────────────────────────────────────────────
router.get('/', async (req, res) => {
    try {
        const { limit = 20, type } = req.query
        const filter = type ? { type } : {}

        const activities = await Activity.find(filter)
            .sort({ timestamp: -1 })
            .limit(parseInt(limit))
            .lean()

        // Add relative time
        const now = Date.now()
        const result = activities.map(a => {
            const diff = now - new Date(a.timestamp).getTime()
            let time
            if (diff < 60000) time = 'just now'
            else if (diff < 3600000) time = `${Math.floor(diff / 60000)}m ago`
            else if (diff < 86400000) time = `${Math.floor(diff / 3600000)}h ago`
            else time = `${Math.floor(diff / 86400000)}d ago`

            return { ...a, time }
        })

        res.json(result)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// ────────────────────────────────────────────────
// POST /api/activity
// Log a new activity event
// ────────────────────────────────────────────────
router.post('/', async (req, res) => {
    try {
        const activity = await Activity.create(req.body)
        res.status(201).json(activity)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

export default router
