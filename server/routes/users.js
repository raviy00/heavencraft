import { Router } from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const router = Router()
const { JWT_SECRET } = process.env

// Middleware: extract user from JWT
function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Not authenticated' })
    }
    try {
        req.user = jwt.verify(authHeader.split(' ')[1], JWT_SECRET)
        next()
    } catch {
        return res.status(401).json({ error: 'Invalid token' })
    }
}

// ────────────────────────────────────────────────
// PUT /api/users/profile
// Update current user's profile
// ────────────────────────────────────────────────
router.put('/profile', authMiddleware, async (req, res) => {
    try {
        const { minecraftUsername, minecraftUuid } = req.body

        const user = await User.findById(req.user.userId)
        if (!user) return res.status(404).json({ error: 'User not found' })

        if (minecraftUsername) user.minecraftUsername = minecraftUsername
        if (minecraftUuid) user.minecraftUuid = minecraftUuid

        await user.save()
        res.json({ user: user.toJSON() })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// ────────────────────────────────────────────────
// PATCH /api/users/role
// Admin: change a user's role
// ────────────────────────────────────────────────
router.patch('/role', authMiddleware, async (req, res) => {
    try {
        // Check if requester is admin
        const requester = await User.findById(req.user.userId)
        if (!requester || requester.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' })
        }

        const { targetUserId, role } = req.body
        if (!['player', 'moderator', 'admin'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role' })
        }

        const targetUser = await User.findByIdAndUpdate(
            targetUserId,
            { role },
            { new: true }
        )

        if (!targetUser) return res.status(404).json({ error: 'User not found' })
        res.json({ user: targetUser.toJSON() })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// ────────────────────────────────────────────────
// GET /api/users
// List all users (admin)
// ────────────────────────────────────────────────
router.get('/', authMiddleware, async (req, res) => {
    try {
        const users = await User.find()
            .select('-__v')
            .sort({ lastLogin: -1 })
            .lean()

        // Add avatar URLs
        const result = users.map(u => {
            let avatarUrl = null
            if (u.authProvider === 'google' && u.googleAvatar) {
                avatarUrl = u.googleAvatar
            } else if (u.avatar && u.discordId) {
                avatarUrl = `https://cdn.discordapp.com/avatars/${u.discordId}/${u.avatar}.png?size=128`
            }
            return { ...u, avatarUrl }
        })

        res.json(result)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

export default router
