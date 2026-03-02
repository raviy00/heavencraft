import { Router } from 'express'
import Mod from '../models/Mod.js'

const router = Router()

// ────────────────────────────────────────────────
// GET /api/mods
// List all mods with optional category filter
// ────────────────────────────────────────────────
router.get('/', async (req, res) => {
    try {
        const { category } = req.query
        const filter = category ? { category } : {}
        const mods = await Mod.find(filter).sort({ category: 1, name: 1 })
        res.json(mods)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// ────────────────────────────────────────────────
// GET /api/mods/:id
// Single mod
// ────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
    try {
        const mod = await Mod.findById(req.params.id)
        if (!mod) return res.status(404).json({ error: 'Mod not found' })
        res.json(mod)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// ────────────────────────────────────────────────
// POST /api/mods
// Add a new mod (admin)
// ────────────────────────────────────────────────
router.post('/', async (req, res) => {
    try {
        const mod = await Mod.create(req.body)
        res.status(201).json(mod)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// ────────────────────────────────────────────────
// DELETE /api/mods/:id
// Remove a mod (admin)
// ────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
    try {
        await Mod.findByIdAndDelete(req.params.id)
        res.json({ message: 'Mod deleted' })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

export default router
