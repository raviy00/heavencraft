import { Router } from 'express'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

const router = Router()

const DISCORD_API = 'https://discord.com/api/v10'
const GOOGLE_API = 'https://www.googleapis.com/oauth2/v2'
const MICROSOFT_API_AUTH = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize'
const MICROSOFT_API_TOKEN = 'https://login.microsoftonline.com/common/oauth2/v2.0/token'
const MICROSOFT_GRAPH_ME = 'https://graph.microsoft.com/v1.0/me'

const {
    DISCORD_CLIENT_ID,
    DISCORD_CLIENT_SECRET,
    DISCORD_REDIRECT_URI,
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI,
    MICROSOFT_CLIENT_ID,
    MICROSOFT_CLIENT_SECRET,
    MICROSOFT_REDIRECT_URI,
    JWT_SECRET,
} = process.env

// FRONTEND_URL: explicit env var > Render's auto-injected URL > localhost fallback
const FRONTEND_URL = process.env.FRONTEND_URL
    || process.env.RENDER_EXTERNAL_URL
    || 'http://localhost:5173'

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
    res.redirect(`https://discord.com/oauth2/authorize?${params}`)
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
        access_type: 'online',
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
//  MICROSOFT OAuth
// ═══════════════════════════════════════════════

router.get('/microsoft', (req, res) => {
    const params = new URLSearchParams({
        client_id: MICROSOFT_CLIENT_ID,
        redirect_uri: MICROSOFT_REDIRECT_URI,
        response_type: 'code',
        scope: 'User.Read openid profile email',
    })
    res.redirect(`${MICROSOFT_API_AUTH}?${params}`)
})

router.get('/microsoft/callback', async (req, res) => {
    const { code } = req.query
    if (!code) {
        return res.redirect(`${FRONTEND_URL}/?error=missing_code`)
    }

    try {
        const tokenRes = await fetch(MICROSOFT_API_TOKEN, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                client_id: MICROSOFT_CLIENT_ID,
                client_secret: MICROSOFT_CLIENT_SECRET,
                grant_type: 'authorization_code',
                code,
                redirect_uri: MICROSOFT_REDIRECT_URI,
            }),
        })

        if (!tokenRes.ok) return res.redirect(`${FRONTEND_URL}/?error=token_exchange_failed`)

        const tokenData = await tokenRes.json()

        const userRes = await fetch(MICROSOFT_GRAPH_ME, {
            headers: { Authorization: `Bearer ${tokenData.access_token}` },
        })

        if (!userRes.ok) return res.redirect(`${FRONTEND_URL}/?error=profile_fetch_failed`)

        const microsoftUser = await userRes.json()

        let dbUser = null
        const User = await getUser()

        if (User) {
            const email = microsoftUser.mail || microsoftUser.userPrincipalName || null
            dbUser = await User.findOneAndUpdate(
                { microsoftId: microsoftUser.id },
                {
                    microsoftId: microsoftUser.id,
                    username: microsoftUser.displayName || email?.split('@')[0] || 'Player',
                    email: email,
                    globalName: microsoftUser.displayName || null,
                    authProvider: 'microsoft',
                    lastLogin: new Date(),
                },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            )
        }

        const jwtPayload = {
            userId: dbUser?._id?.toString() || microsoftUser.id,
            microsoftId: microsoftUser.id,
            username: microsoftUser.displayName || 'Player',
            email: microsoftUser.mail || microsoftUser.userPrincipalName,
            role: dbUser?.role || 'player',
            authProvider: 'microsoft',
        }

        const token = jwt.sign(jwtPayload, JWT_SECRET, { expiresIn: '7d' })
        res.redirect(`${FRONTEND_URL}/auth/callback?token=${token}`)
    } catch (err) {
        console.error('Microsoft OAuth error:', err)
        res.redirect(`${FRONTEND_URL}/?error=server_error`)
    }
})


// ═══════════════════════════════════════════════
//  LOCAL Auth (Username / Password)
// ═══════════════════════════════════════════════

router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Username, email, and password are required' })
        }

        const User = await getUser()
        if (!User) return res.status(500).json({ error: 'Database error' })

        // Check if user already exists
        const existingError = await User.findOne({
            $or: [{ email }, { username }]
        }).collation({ locale: 'en', strength: 2 })

        if (existingError) {
            return res.status(409).json({ error: 'A user with that email or username already exists' })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            authProvider: 'local',
        })

        await newUser.save()

        res.json({ message: 'Registration successful' })

    } catch (err) {
        console.error('Local Register error:', err)
        res.status(500).json({ error: 'Internal server error: ' + err.message })
    }
})

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' })
        }

        const User = await getUser()
        if (!User) return res.status(500).json({ error: 'Database error' })

        // Find user by username
        const user = await User.findOne({ username }).collation({ locale: 'en', strength: 2 })

        if (!user || user.authProvider !== 'local' || !user.password) {
            return res.status(401).json({ error: 'Invalid username or password' })
        }

        const match = await bcrypt.compare(password, user.password)
        if (!match) {
            return res.status(401).json({ error: 'Invalid username or password' })
        }

        // Create JWT
        const jwtPayload = {
            userId: user._id.toString(),
            username: user.username,
            email: user.email,
            role: user.role,
            authProvider: 'local',
        }

        const token = jwt.sign(jwtPayload, JWT_SECRET, { expiresIn: '7d' })
        res.json({ token, user })

    } catch (err) {
        console.error('Local Login error:', err)
        res.status(500).json({ error: 'Internal server error' })
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
