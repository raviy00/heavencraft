import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    // Auth provider
    authProvider: {
        type: String,
        enum: ['discord', 'google', 'local', 'microsoft'],
        default: 'discord',
    },

    // Discord OAuth fields
    discordId: {
        type: String,
        default: null,
        sparse: true,
        index: true,
    },

    // Google OAuth fields
    googleId: {
        type: String,
        default: null,
        sparse: true,
        index: true,
    },
    googleAvatar: {
        type: String,
        default: null,
    },

    // Microsoft OAuth fields
    microsoftId: {
        type: String,
        default: null,
        sparse: true,
        index: true,
    },
    microsoftAvatar: {
        type: String,
        default: null,
    },

    // Shared profile fields
    username: {
        type: String,
        required: true,
    },
    discriminator: {
        type: String,
        default: '0',
    },
    email: {
        type: String,
        default: null,
    },
    password: {
        type: String,
        default: null, // used for 'local' auth
    },
    avatar: {
        type: String,
        default: null,
    },
    globalName: {
        type: String,
        default: null,
    },

    // Minecraft linking (future)
    minecraftUuid: {
        type: String,
        default: null,
    },
    minecraftUsername: {
        type: String,
        default: null,
    },

    // App-specific
    role: {
        type: String,
        enum: ['player', 'moderator', 'admin'],
        default: 'player',
    },
    lastLogin: {
        type: Date,
        default: Date.now,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
})

// Virtual for avatar URL
userSchema.virtual('avatarUrl').get(function () {
    // Google users
    if (this.authProvider === 'google' && this.googleAvatar) {
        return this.googleAvatar
    }
    // Microsoft users
    if (this.authProvider === 'microsoft' && this.microsoftAvatar) {
        return this.microsoftAvatar
    }
    // Discord users
    if (this.avatar && this.discordId) {
        return `https://cdn.discordapp.com/avatars/${this.discordId}/${this.avatar}.png?size=128`
    }
    if (this.discordId) {
        const index = this.discriminator === '0'
            ? (BigInt(this.discordId) >> 22n) % 6n
            : parseInt(this.discriminator) % 5
        return `https://cdn.discordapp.com/embed/avatars/${index}.png`
    }
    return null
})

// Include virtuals in JSON
userSchema.set('toJSON', { virtuals: true })
userSchema.set('toObject', { virtuals: true })

export default mongoose.model('User', userSchema)
