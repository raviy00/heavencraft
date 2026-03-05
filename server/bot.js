import mineflayer from 'mineflayer';

const HOST = 'heavencraft_tm.aternos.me';
const PORT = 39013;

let bot = null;
let reconnectTimeout = null;

export function startBot() {
    console.log(`[Bot] Attempting connection to Aternos server as HeavencraftBot...`);

    try {
        bot = mineflayer.createBot({
            host: HOST,
            port: PORT,
            username: 'HeavencraftBot',
            // auth: 'offline' limits account types to cracked, Aternos accepts this if cracked mode is true
            // version: false automatically detects the server version
        });

        bot.on('spawn', () => {
            console.log(`[Bot] Successfully joined ${HOST}!`);
            console.log(`[Bot] Starting anti-AFK to keep the server online.`);

            // Jump every 60 seconds to avoid being kicked for AFK
            setInterval(() => {
                bot.setControlState('jump', true);
                setTimeout(() => bot.setControlState('jump', false), 1000);
            }, 60000);
        });

        bot.on('kicked', (reason) => {
            console.log(`[Bot] Kicked. Reason: ${reason}`);
        });

        bot.on('error', err => {
            // Aternos offline errors will be common, keep log simple
            if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') {
                console.log(`[Bot] Server seems to be offline. Waiting to retry...`);
            } else {
                console.log(`[Bot] Error: ${err.message}`);
            }
        });

        bot.on('end', () => {
            console.log(`[Bot] Disconnected. Reconnecting in 60 seconds...`);
            clearTimeout(reconnectTimeout);
            // Retry every 60 seconds forever
            reconnectTimeout = setTimeout(startBot, 60000);
        });

    } catch (err) {
        console.log(`[Bot] Initialization error: ${err.message}`);
        clearTimeout(reconnectTimeout);
        reconnectTimeout = setTimeout(startBot, 60000);
    }
}

