import mongoose from 'mongoose'

const modSchema = new mongoose.Schema({
    name: { type: String, required: true },
    version: { type: String, required: true },
    description: { type: String },
    category: {
        type: String,
        enum: ['Core', 'Performance', 'Visual', 'HUD', 'Social', 'QoL'],
        default: 'Core',
    },
    fileSize: { type: String },
    downloadUrl: { type: String },
    modrinthId: { type: String },
    required: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
})

export default mongoose.model('Mod', modSchema)
