import { Router } from 'express'

const router = Router()

// ────────────────────────────────────────────────
// GET /api/map/chunks
// Simulated world map chunk data with biome colors
// Returns a grid of chunks for the map renderer
// ────────────────────────────────────────────────

// Biome definitions
const BIOMES = [
    { id: 'plains', color: '#7CBA4C', name: 'Plains' },
    { id: 'forest', color: '#3B6E23', name: 'Forest' },
    { id: 'dark_forest', color: '#2D4A1B', name: 'Dark Forest' },
    { id: 'birch_forest', color: '#6BA549', name: 'Birch Forest' },
    { id: 'taiga', color: '#4E6E3D', name: 'Taiga' },
    { id: 'desert', color: '#D6CE8B', name: 'Desert' },
    { id: 'savanna', color: '#BDB25F', name: 'Savanna' },
    { id: 'swamp', color: '#5E7534', name: 'Swamp' },
    { id: 'ocean', color: '#2C5FBA', name: 'Ocean' },
    { id: 'deep_ocean', color: '#1A3D7A', name: 'Deep Ocean' },
    { id: 'river', color: '#4A7DC9', name: 'River' },
    { id: 'beach', color: '#E8D9A0', name: 'Beach' },
    { id: 'mountains', color: '#606060', name: 'Mountains' },
    { id: 'snowy_mountains', color: '#BFBFBF', name: 'Snowy Mountains' },
    { id: 'jungle', color: '#2C8B1A', name: 'Jungle' },
    { id: 'badlands', color: '#B5764E', name: 'Badlands' },
    { id: 'mushroom', color: '#7D4E82', name: 'Mushroom Fields' },
    { id: 'frozen_ocean', color: '#6E8EAF', name: 'Frozen Ocean' },
]

// Seeded random for deterministic map generation
function seededRandom(seed) {
    let s = seed
    return function () {
        s = (s * 16807 + 0) % 2147483647
        return (s - 1) / 2147483646
    }
}

// Generate chunk data with a coherent-ish biome pattern
function generateChunks(centerX, centerZ, radius) {
    const chunks = []
    const rand = seededRandom(42)

    // Pre-generate base biome grid (lower resolution for coherence)
    const regionSize = 4
    const regions = {}

    for (let rx = Math.floor((centerX - radius) / regionSize); rx <= Math.ceil((centerX + radius) / regionSize); rx++) {
        for (let rz = Math.floor((centerZ - radius) / regionSize); rz <= Math.ceil((centerZ + radius) / regionSize); rz++) {
            const rrand = seededRandom(rx * 7919 + rz * 104729)
            regions[`${rx},${rz}`] = BIOMES[Math.floor(rrand() * BIOMES.length)]
        }
    }

    for (let cx = centerX - radius; cx <= centerX + radius; cx++) {
        for (let cz = centerZ - radius; cz <= centerZ + radius; cz++) {
            const rx = Math.floor(cx / regionSize)
            const rz = Math.floor(cz / regionSize)
            const biome = regions[`${rx},${rz}`] || BIOMES[0]

            // Add slight elevation variation
            const chunkRand = seededRandom(cx * 31337 + cz * 65537)
            const elevation = Math.floor(chunkRand() * 128) + 32

            chunks.push({
                x: cx,
                z: cz,
                biome: biome.id,
                color: biome.color,
                biomeName: biome.name,
                elevation,
            })
        }
    }

    return chunks
}

// Points of interest (structures, bases, etc.)
const POIS = [
    { x: 0, z: 0, label: 'Spawn', type: 'spawn', icon: 'home' },
    { x: -304, z: 1201, label: "SkyBuilder99's Base", type: 'base', icon: 'house' },
    { x: 512, z: -88, label: 'Nether Portal Hub', type: 'portal', icon: 'portal' },
    { x: 1089, z: -445, label: 'Blaze Farm', type: 'farm', icon: 'local_fire_department' },
    { x: -789, z: 321, label: 'PVP Arena', type: 'arena', icon: 'swords' },
    { x: 200, z: 200, label: 'End Portal', type: 'portal', icon: 'portal' },
    { x: -55, z: 77, label: 'Redstone Lab', type: 'build', icon: 'memory' },
    { x: 900, z: 1500, label: 'Dragon Fight Arena', type: 'boss', icon: 'whatshot' },
    { x: -1100, z: 444, label: 'Spider Spawner XP', type: 'farm', icon: 'bug_report' },
    { x: 44, z: -1204, label: 'Wither Arena', type: 'boss', icon: 'dangerous' },
]

router.get('/chunks', (req, res) => {
    const { cx = 0, cz = 0, radius = 16 } = req.query
    const chunks = generateChunks(
        parseInt(cx),
        parseInt(cz),
        Math.min(parseInt(radius), 32) // Cap at 32 for performance
    )
    res.json({ chunks, biomes: BIOMES })
})

router.get('/pois', (req, res) => {
    res.json(POIS)
})

export default router
