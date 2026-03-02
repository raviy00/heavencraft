import mongoose from 'mongoose'

const serverConfigSchema = new mongoose.Schema({
    _id: { type: String, default: 'main' }, // singleton
    ip: { type: String, default: 'heavencraft_tm.aternos.me' },
    port: { type: Number, default: 39013 },
    version: { type: String, default: 'Java 1.21.4' },
    motd: { type: String, default: 'Welcome to Heavencraft! Start your adventure.' },
    status: {
        type: String,
        enum: ['offline', 'online', 'starting'],
        default: 'offline',
    },
    maxPlayers: { type: Number, default: 20 },
    uptime: { type: String, default: '0h 0m' },
    lastStartedBy: { type: String, default: null },
    lastStartedAt: { type: Date, default: null },
    startedAt: { type: Date, default: null },
})

// Ensure only one document exists
serverConfigSchema.statics.getConfig = async function () {
    let config = await this.findById('main')
    if (!config) {
        config = await this.create({ _id: 'main' })
    }
    return config
}

export default mongoose.model('ServerConfig', serverConfigSchema)
