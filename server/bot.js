import mineflayer from 'mineflayer';

const HOST = 'heavencraft_tm.aternos.me';
const PORT = 25565; // Use default so Aternos SRV lookup works

let bot = null;
let reconnectTimeout = null;
let afkInterval = null;

function startBot() {
    // Clear any leftover afk timers from previous session
    if (afkInterval) { clearInterval(afkInterval); afkInterval = null; }

    console.log(`[Bot] Attempting connection to Aternos server as HeavencraftBot...`);

    try {
        bot = mineflayer.createBot({
            host: HOST,
            port: PORT,
            username: 'HeavencraftBot',
            auth: 'offline',      // Required for Aternos cracked mode
            version: '1.21.4',    // Explicit version avoids handshake issues
            hideErrors: false,
        });

        bot.on('spawn', () => {
            console.log(`[Bot] ✅ Successfully joined ${HOST}! Anti-AFK active.`);

            // Jump every 60 seconds to prevent AFK kick
            afkInterval = setInterval(() => {
                if (bot) {
                    bot.setControlState('jump', true);
                    setTimeout(() => { if (bot) bot.setControlState('jump', false); }, 500);
                }
            }, 60000);
        });

        bot.on('kicked', (reason) => {
            let r = reason;
            try { r = JSON.parse(reason)?.text || reason; } catch { }
            console.log(`[Bot] Kicked: ${r}`);
        });

        bot.on('error', err => {
            const quiet = ['ENOTFOUND', 'ECONNREFUSED', 'ECONNRESET', 'ETIMEDOUT'];
            if (quiet.includes(err.code)) {
                console.log(`[Bot] Server offline or unreachable (${err.code}).`);
            } else {
                console.log(`[Bot] Error: ${err.message}`);
            }
        });

        bot.on('end', (reason) => {
            if (afkInterval) { clearInterval(afkInterval); afkInterval = null; }
            console.log(`[Bot] Disconnected (${reason || 'unknown'}). Retrying in 30s...`);
            clearTimeout(reconnectTimeout);
            reconnectTimeout = setTimeout(startBot, 30000);
        });

    } catch (err) {
        console.log(`[Bot] Init error: ${err.message}. Retrying in 30s...`);
        clearTimeout(reconnectTimeout);
        reconnectTimeout = setTimeout(startBot, 30000);
    }
}

// Keep the Node.js process alive forever so the bot can keep reconnecting
setInterval(() => { }, 1 << 30);

startBot();
