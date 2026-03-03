import util from 'minecraft-server-util';
import { WebSocketConnection, MinecraftServer } from 'mc-server-management';

// This utility abstracts the complex logic needed to fetch real server stats
// and manage it, whether it's through generic ping (minecraft-server-util),
// third-party REST API (mcstatus.io), or direct Aternos emulation 
// (e.g. mc-server-management) when proper auth is provided.
export async function getServerStatus(ip, port = 25565) {
    // Method 1: Use mc-server-management if environment variables are set
    if (process.env.MC_MANAGEMENT_WS && process.env.MC_MANAGEMENT_TOKEN) {
        try {
            const connection = await WebSocketConnection.connect(process.env.MC_MANAGEMENT_WS, process.env.MC_MANAGEMENT_TOKEN);
            const server = new MinecraftServer(connection);

            const [status, players] = await Promise.all([
                server.getStatus(),
                server.getConnectedPlayers()
            ]);

            connection.close(); // Clean up connection after single use

            return {
                status: status.started ? 'online' : 'starting',
                onlinePlayers: players.length,
                maxPlayers: status.maxPlayers || 20,
                playersList: players.map(p => ({
                    uuid: p.id || p.uuid,
                    username: p.name
                })),
                motd: typeof status.motd === 'string' ? status.motd : (status.motd?.text || ''),
                version: status.version?.name || 'Java 1.21.4'
            };
        } catch (err) {
            console.warn(`[MCServerStatus] mc-server-management connection failed, falling back: ${err.message}`);
        }
    }

    // Removed mcstatus.io as requested

    // Method 2: Fallback to minecraft-server-util (Node.js third party library)
    try {
        const result = await util.status(ip, port, { timeout: 3000, enableSRV: true });
        return {
            status: 'online',
            onlinePlayers: result.players.online,
            maxPlayers: result.players.max,
            playersList: result.players.sample?.map(p => ({
                uuid: p.id,
                username: p.name
            })) || [],
            motd: typeof result.motd?.clean === 'string' ? result.motd.clean : '',
            version: result.version?.name || ''
        };
    } catch (fallbackErr) {
        console.warn(`[MCServerStatus] Direct ping failed: ${fallbackErr.message}`);
        return {
            status: 'offline',
            onlinePlayers: 0,
            maxPlayers: 20,
            playersList: [],
            motd: '',
            version: ''
        };
    }
}
