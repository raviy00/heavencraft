import { Router } from 'express'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'

const router = Router()

const DISCORD_API = 'https://discord.com/api/v10'
const GOOGLE_API = 'https://www.googleapis.com/oauth2/v2'
const {
    DISCORD_CLIENT_ID,
    DISCORD_CLIENT_SECRET,
    DISCORD_REDIRECT_URI,
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI,
    FRONTEND_URL,
    JWT_SECRET,
} = process.env

// Dynamically import User model only when MongoDB is connected
async function getUser() {
    if (mongoose.connection.readyState === 1) {
        const mod = await import('../models/User.js')
        return mod.default
    }
    return null
}

// Helper: build Discord avatar URL
function getDiscordAvatarUrl(discordUser) {
    if (discordUser.avatar) {
        return `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png?size=128`
    }
    const index = (BigInt(discordUser.id) >> 22n) % 6n
    return `https://cdn.discordapp.com/embed/avatars/${index}.png`
}


// ═══════════════════════════════════════════════
//  DISCORD OAuth
// ═══════════════════════════════════════════════

router.get('/discord', (req, res) => {
    const params = new URLSearchParams({
        client_id: DISCORD_CLIENT_ID,
        redirect_uri: DISCORD_REDIRECT_URI,
        response_type: 'code',
        scope: 'identify email',
    })
    res.redirect(`${DISCORD_API}/oauth2/authorize?${params}`)
})

router.get('/discord/callback', async (req, res) => {
    const { code } = req.query
    if (!code) {
        return res.redirect(`${FRONTEND_URL}/?error=missing_code`)
    }

    try {
        // 1) Exchange code for access token
        const tokenRes = await fetch(`${DISCORD_API}/oauth2/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                client_id: DISCORD_CLIENT_ID,
                client_secret: DISCORD_CLIENT_SECRET,
                grant_type: 'authorization_code',
                code,
                redirect_uri: DISCORD_REDIRECT_URI,
            }),
        })

        if (!tokenRes.ok) {
            const err = await tokenRes.text()
            console.error('Discord token exchange failed:', err)
            return res.redirect(`${FRONTEND_URL}/?error=token_exchange_failed`)
        }

        const tokenData = await tokenRes.json()

        // 2) Fetch user profile from Discord
        const userRes = await fetch(`${DISCORD_API}/users/@me`, {
            headers: { Authorization: `Bearer ${tokenData.access_token}` },
        })

        if (!userRes.ok) {
            return res.redirect(`${FRONTEND_URL}/?error=profile_fetch_failed`)
        }

        const discordUser = await userRes.json()

        // 3) Try to upsert in MongoDB
        let dbUser = null
        const User = await getUser()

        if (User) {
            dbUser = await User.findOneAndUpdate(
                { discordId: discordUser.id },
                {
                    discordId: discordUser.id,
                    username: discordUser.username,
                    discriminator: discordUser.discriminator || '0',
                    email: discordUser.email || null,
                    avatar: discordUser.avatar,
                    globalName: discordUser.global_name || null,
                    authProvider: 'discord',
                    lastLogin: new Date(),
                },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            )
        }

        // 4) Create JWT
        const jwtPayload = {
            userId: dbUser?._id?.toString() || discordUser.id,
            discordId: discordUser.id,
            username: discordUser.username,
            globalName: discordUser.global_name || null,
            avatar: discordUser.avatar,
            avatarUrl: getDiscordAvatarUrl(discordUser),
            email: discordUser.email || null,
            role: dbUser?.role || 'player',
            authProvider: 'discord',
        }

        const token = jwt.sign(jwtPayload, JWT_SECRET, { expiresIn: '7d' })
        res.redirect(`${FRONTEND_URL}/auth/callback?token=${token}`)
    } catch (err) {
        console.error('Discord OAuth error:', err)
        res.redirect(`${FRONTEND_URL}/?error=server_error`)
    }
})


// ═══════════════════════════════════════════════
//  GOOGLE OAuth
// ═══════════════════════════════════════════════

router.get('/google', (req, res) => {
    const params = new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        redirect_uri: GOOGLE_REDIRECT_URI,
        response_type: 'code',
        scope: 'openid email profile',
        access_type: 'offline',
        prompt: 'consent',
    })
    res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`)
})

router.get('/google/callback', async (req, res) => {
    const { code } = req.query
    if (!code) {
        return res.redirect(`${FRONTEND_URL}/?error=missing_code`)
    }

    try {
        // 1) Exchange code for access token
        const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                client_id: GOOGLE_CLIENT_ID,
                client_secret: GOOGLE_CLIENT_SECRET,
                grant_type: 'authorization_code',
                code,
                redirect_uri: GOOGLE_REDIRECT_URI,
            }),
        })

        if (!tokenRes.ok) {
            const err = await tokenRes.text()
            console.error('Google token exchange failed:', err)
            return res.redirect(`${FRONTEND_URL}/?error=token_exchange_failed`)
        }

        const tokenData = await tokenRes.json()

        // 2) Fetch user profile from Google
        const userRes = await fetch(`${GOOGLE_API}/userinfo`, {
            headers: { Authorization: `Bearer ${tokenData.access_token}` },
        })

        if (!userRes.ok) {
            return res.redirect(`${FRONTEND_URL}/?error=profile_fetch_failed`)
        }

        const googleUser = await userRes.json()
        // googleUser: { id, email, verified_email, name, given_name, family_name, picture, locale }

        // 3) Try to upsert in MongoDB
        let dbUser = null
        const User = await getUser()

        if (User) {
            dbUser = await User.findOneAndUpdate(
                { googleId: googleUser.id },
                {
                    googleId: googleUser.id,
                    username: googleUser.name || googleUser.email.split('@')[0],
                    email: googleUser.email || null,
                    avatar: null,
                    globalName: googleUser.name || null,
                    googleAvatar: googleUser.picture || null,
                    authProvider: 'google',
                    lastLogin: new Date(),
                },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            )
        }

        // 4) Create JWT
        const jwtPayload = {
            userId: dbUser?._id?.toString() || googleUser.id,
            googleId: googleUser.id,
            username: googleUser.name || googleUser.email.split('@')[0],
            globalName: googleUser.name || null,
            avatarUrl: googleUser.picture || null,
            email: googleUser.email || null,
            role: dbUser?.role || 'player',
            authProvider: 'google',
        }

        const token = jwt.sign(jwtPayload, JWT_SECRET, { expiresIn: '7d' })
        res.redirect(`${FRONTEND_URL}/auth/callback?token=${token}`)
    } catch (err) {
        console.error('Google OAuth error:', err)
        res.redirect(`${FRONTEND_URL}/?error=server_error`)
    }
})


// ═══════════════════════════════════════════════
//  SHARED ROUTES
// ═══════════════════════════════════════════════

// GET /api/auth/me — Returns current user from JWT
router.get('/me', async (req, res) => {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' })
    }

    try {
        const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET)

        // Try to get fresh data from DB
        const User = await getUser()
        if (User && decoded.userId) {
            const user = await User.findById(decoded.userId).catch(() => null)
            if (user) {
                return res.json({ user: user.toJSON() })
            }
        }

        // Fallback: return data from JWT itself
        res.json({
            user: {
                _id: decoded.userId,
                discordId: decoded.discordId || null,
                googleId: decoded.googleId || null,
                username: decoded.username,
                globalName: decoded.globalName,
                avatarUrl: decoded.avatarUrl,
                email: decoded.email,
                role: decoded.role || 'player',
                authProvider: decoded.authProvider || 'unknown',
            },
        })
    } catch (err) {
        return res.status(401).json({ error: 'Invalid token' })
    }
})

// POST /api/auth/logout
router.post('/logout', (req, res) => {
    res.json({ message: 'Logged out' })
})

export default router
