/**
 * Seed script — populates MongoDB with realistic mock data
 * Run: node seed.js
 */
import 'dotenv/config'
import dns from 'node:dns'
import mongoose from 'mongoose'
import Player from './models/Player.js'
import Mod from './models/Mod.js'
import Activity from './models/Activity.js'
import ServerConfig from './models/ServerConfig.js'

dns.setDefaultResultOrder('ipv4first')
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1'])

const players = []

const mods = [
    {
        name: 'Fabric API', version: '0.100.8+1.21.4',
        description: 'Core API library required by all Fabric mods.',
        category: 'Core', fileSize: '1.8 MB',
        downloadUrl: 'https://modrinth.com/mod/fabric-api', modrinthId: 'fabric-api',
    },
    {
        name: 'Sodium', version: '0.6.0+mc1.21.4',
        description: 'Rendering optimizations for vastly improved frame rates.',
        category: 'Performance', fileSize: '760 KB',
        downloadUrl: 'https://modrinth.com/mod/sodium', modrinthId: 'sodium',
    },
    {
        name: 'Lithium', version: '0.13.0+mc1.21.4',
        description: 'Server-side performance optimizations.',
        category: 'Performance', fileSize: '490 KB',
        downloadUrl: 'https://modrinth.com/mod/lithium', modrinthId: 'lithium',
    },
    {
        name: 'Iris Shaders', version: '1.8.1+mc1.21.4',
        description: 'Shader support compatible with Sodium.',
        category: 'Visual', fileSize: '1.2 MB',
        downloadUrl: 'https://modrinth.com/mod/iris', modrinthId: 'iris',
    },
    {
        name: "Xaero's Minimap", version: '24.4.0',
        description: 'Lightweight minimap with cave mapping and death points.',
        category: 'HUD', fileSize: '890 KB',
        downloadUrl: 'https://modrinth.com/mod/xaeros-minimap', modrinthId: 'xaeros-minimap',
    },
    {
        name: "Xaero's World Map", version: '1.39.0',
        description: 'Full-screen world map complementing the minimap.',
        category: 'HUD', fileSize: '1.1 MB',
        downloadUrl: 'https://modrinth.com/mod/xaeros-world-map', modrinthId: 'xaeros-world-map',
    },
    {
        name: 'Voice Chat', version: '2.5.26',
        description: 'Proximity voice chat for immersive multiplayer.',
        category: 'Social', fileSize: '2.3 MB',
        downloadUrl: 'https://modrinth.com/mod/simple-voice-chat', modrinthId: 'simple-voice-chat',
    },
    {
        name: 'EMI', version: '1.1.14+1.21.4',
        description: 'Recipe viewer and inventory manager.',
        category: 'QoL', fileSize: '1.5 MB',
        downloadUrl: 'https://modrinth.com/mod/emi', modrinthId: 'emi',
    },
]

const activities = [
    { type: 'kill', player: 'ZombieSlayer', detail: 'eliminated NetherWalker', icon: 'skull', timestamp: new Date(Date.now() - 2 * 60000) },
    { type: 'mine', player: 'RedstoneGenius', detail: 'mined 500 blocks in one session', icon: 'construction', timestamp: new Date(Date.now() - 8 * 60000) },
    { type: 'death', player: 'CaveExplorer', detail: 'died to Cave Spider at (-1100, 12, 444)', icon: 'heart_broken', timestamp: new Date(Date.now() - 15 * 60000) },
    { type: 'join', player: 'DiamondQueen', detail: 'joined the server', icon: 'login', timestamp: new Date(Date.now() - 22 * 60000) },
    { type: 'join', player: 'SkyBuilder99', detail: 'joined the server', icon: 'login', timestamp: new Date(Date.now() - 45 * 60000) },
    { type: 'kill', player: 'DiamondQueen', detail: 'slayed the Ender Dragon', icon: 'skull', timestamp: new Date(Date.now() - 60 * 60000) },
    { type: 'achievement', player: 'IronGolemBoss', detail: 'earned "Full Netherite" achievement', icon: 'emoji_events', timestamp: new Date(Date.now() - 90 * 60000) },
    { type: 'mine', player: 'SkyBuilder99', detail: 'discovered a diamond vein at Y=11', icon: 'construction', timestamp: new Date(Date.now() - 120 * 60000) },
]

async function seed() {
    try {
        console.log('⛏  Connecting to MongoDB…')
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 15000,
            family: 4,
        })
        console.log('✅ Connected')

        // Clear existing data
        console.log('🗑️  Clearing old data…')
        await Promise.all([
            Player.deleteMany({}),
            Mod.deleteMany({}),
            Activity.deleteMany({}),
            ServerConfig.deleteMany({}),
        ])

        // Seed
        console.log('🌱 Seeding players…')
        await Player.insertMany(players)

        console.log('🌱 Seeding mods…')
        await Mod.insertMany(mods)

        console.log('🌱 Seeding activities…')
        await Activity.insertMany(activities)

        console.log('🌱 Creating server config…')
        await ServerConfig.create({ _id: 'main' })

        console.log('')
        console.log('✅ Database seeded successfully!')
        console.log(`   ${players.length} players`)
        console.log(`   ${mods.length} mods`)
        console.log(`   ${activities.length} activities`)
        console.log(`   1 server config`)

        await mongoose.disconnect()
        process.exit(0)
    } catch (err) {
        console.error('❌ Seed failed:', err.message)
        process.exit(1)
    }
}

seed()
