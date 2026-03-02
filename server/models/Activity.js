import mongoose from 'mongoose'

const activitySchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['kill', 'death', 'mine', 'join', 'leave', 'achievement', 'chat'],
        required: true,
    },
    player: { type: String, required: true },
    detail: { type: String, required: true },
    icon: { type: String, default: 'info' },
    timestamp: { type: Date, default: Date.now },
})

// Auto-expire old activity after 30 days
activitySchema.index({ timestamp: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 })

export default mongoose.model('Activity', activitySchema)
