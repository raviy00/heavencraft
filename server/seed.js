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

const players = [
    {
        username: 'SkyBuilder99',
        uuid: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        kills: 142, deaths: 38, playtime: 312, blocksMined: 98450,
        lastDeath: { x: -304, y: 64, z: 1201, cause: 'Creeper' },
        joinDate: new Date('2024-01-15'), lastSeen: new Date('2026-03-01'),
    },
    {
        username: 'CreeperKing',
        uuid: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
        kills: 98, deaths: 74, playtime: 210, blocksMined: 62100,
        lastDeath: { x: 512, y: 11, z: -88, cause: 'Lava' },
        joinDate: new Date('2024-02-03'), lastSeen: new Date('2026-02-28'),
    },
    {
        username: 'DiamondQueen',
        uuid: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
        kills: 201, deaths: 22, playtime: 489, blocksMined: 185900,
        lastDeath: { x: 0, y: 120, z: 0, cause: 'Void' },
        joinDate: new Date('2023-12-01'), lastSeen: new Date('2026-03-01'),
    },
    {
        username: 'NetherWalker',
        uuid: 'd4e5f6a7-b8c9-0123-defa-234567890123',
        kills: 176, deaths: 55, playtime: 378, blocksMined: 134200,
        lastDeath: { x: 1089, y: 30, z: -445, cause: 'Blaze' },
        joinDate: new Date('2024-01-28'), lastSeen: new Date('2026-02-25'),
    },
    {
        username: 'SteveCraft',
        uuid: 'e5f6a7b8-c9d0-1234-efab-345678901234',
        kills: 54, deaths: 101, playtime: 145, blocksMined: 41800,
        lastDeath: { x: -789, y: 64, z: 321, cause: 'Player' },
        joinDate: new Date('2024-03-10'), lastSeen: new Date('2026-02-20'),
    },
    {
        username: 'ZombieSlayer',
        uuid: 'f6a7b8c9-d0e1-2345-fabc-456789012345',
        kills: 320, deaths: 18, playtime: 601, blocksMined: 220000,
        lastDeath: { x: 44, y: 64, z: -1204, cause: 'Wither' },
        joinDate: new Date('2023-11-20'), lastSeen: new Date('2026-03-01'),
    },
    {
        username: 'EnderHunter',
        uuid: 'a7b8c9d0-e1f2-3456-abcd-567890123456',
        kills: 88, deaths: 46, playtime: 198, blocksMined: 78400,
        lastDeath: { x: 200, y: 0, z: 200, cause: 'End Void' },
        joinDate: new Date('2024-04-05'), lastSeen: new Date('2026-02-15'),
    },
    {
        username: 'RedstoneGenius',
        uuid: 'b8c9d0e1-f2a3-4567-bcde-678901234567',
        kills: 12, deaths: 8, playtime: 520, blocksMined: 310000,
        lastDeath: { x: -55, y: 64, z: 77, cause: 'Own Trap' },
        joinDate: new Date('2023-10-14'), lastSeen: new Date('2026-03-01'),
    },
    {
        username: 'IronGolemBoss',
        uuid: 'c9d0e1f2-a3b4-5678-cdef-789012345678',
        kills: 249, deaths: 31, playtime: 430, blocksMined: 156000,
        lastDeath: { x: 900, y: 80, z: 1500, cause: 'Ender Dragon' },
        joinDate: new Date('2024-01-01'), lastSeen: new Date('2026-03-01'),
    },
    {
        username: 'CaveExplorer',
        uuid: 'd0e1f2a3-b4c5-6789-defa-890123456789',
        kills: 67, deaths: 89, playtime: 265, blocksMined: 99200,
        lastDeath: { x: -1100, y: 12, z: 444, cause: 'Cave Spider' },
        joinDate: new Date('2024-02-14'), lastSeen: new Date('2026-02-22'),
    },
]

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
