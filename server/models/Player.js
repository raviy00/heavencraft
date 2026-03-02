import mongoose from 'mongoose'

const playerSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    uuid: { type: String, required: true, unique: true },
    kills: { type: Number, default: 0 },
    deaths: { type: Number, default: 0 },
    playtime: { type: Number, default: 0 }, // hours
    blocksMined: { type: Number, default: 0 },
    lastDeath: {
        x: Number,
        y: Number,
        z: Number,
        cause: String,
    },
    joinDate: { type: Date, default: Date.now },
    lastSeen: { type: Date, default: Date.now },
    skin: { type: String, default: null },
    isOnline: { type: Boolean, default: false },
})

// Virtual: K/D ratio
playerSchema.virtual('kdr').get(function () {
    return this.deaths === 0 ? this.kills : +(this.kills / this.deaths).toFixed(2)
})

playerSchema.set('toJSON', { virtuals: true })
playerSchema.set('toObject', { virtuals: true })

export default mongoose.model('Player', playerSchema)
