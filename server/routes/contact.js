import express from 'express'
import jwt from 'jsonwebtoken'
import ContactMessage from '../models/ContactMessage.js'

const router = express.Router()

// Middleware: require admin JWT
function requireAdmin(req, res, next) {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Not authenticated' })
    }
    try {
        const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET)
        if (decoded.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' })
        }
        req.user = decoded
        next()
    } catch {
        return res.status(401).json({ error: 'Invalid token' })
    }
}

// POST /api/contact - Submit a new contact message
router.post('/', async (req, res) => {
    try {
        const { name, email, message } = req.body

        if (!name || !email || !message) {
            return res.status(400).json({ error: 'Please provide all required fields: name, email, and message.' })
        }

        const newMessage = new ContactMessage({
            name,
            email,
            message,
        })

        await newMessage.save()

        res.status(201).json({ message: 'Your message has been successfully sent!', data: newMessage })
    } catch (error) {
        console.error('[Contact Error]', error)
        res.status(500).json({ error: 'An error occurred while saving your message. Please try again later.' })
    }
})

// GET /api/contact - Retrieve messages (Admin only)
router.get('/', requireAdmin, async (req, res) => {
    try {
        const messages = await ContactMessage.find().sort({ createdAt: -1 })
        res.json(messages)
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve messages.' })
    }
})

export default router
