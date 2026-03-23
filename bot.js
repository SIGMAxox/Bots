// bot-with-proxy.js
const mineflayer = require('mineflayer');
const axios = require('axios');

// ============================================
// CONFIGURATION
// ============================================
const BOT_CONFIG = {
    username: 'kevin911',
    password: process.env.BOT_PASSWORD || 'asdfghjkl1',
    host: 'Ultimis.net',
    port: 25565,
    version: '1.12.2',
    auth: 'offline'
};

let bot;
let currentProxy = null;

// ============================================
// جلب بروكسي مجاني
// ============================================
async function getFreeProxy() {
    try {
        // مصدر بروكسيات مجانية SOCKS5
        const response = await axios.get('https://api.proxyscrape.com/v2/?request=displayproxies&protocol=socks5&timeout=5000&country=all&ssl=all&anonymity=all');
        
        const proxies = response.data.split('\r\n').filter(p => p.trim());
        
        if (proxies.length > 0) {
            const [host, port] = proxies[0].split(':');
            console.log(`[PROXY] Found proxy: ${host}:${port}`);
            return { host, port: parseInt(port) };
        }
    } catch (error) {
        console.log(`[PROXY] Error fetching proxy: ${error.message}`);
    }
    
    // بروكسيات احتياطية
    const fallbackProxies = [
        { host: '45.76.124.8', port: 1080 },
        { host: '198.12.125.66', port: 1080 },
        { host: '45.77.33.134', port: 1080 },
    ];
    
    return fallbackProxies[Math.floor(Math.random() * fallbackProxies.length)];
}

// ============================================
// تشغيل البوت مع بروكسي
// ============================================
async function createBotWithProxy() {
    const proxy = await getFreeProxy();
    if (!proxy) {
        console.log('[PROXY] No proxy available, running without proxy');
        createBot();
        return;
    }
    
    console.log(`[PROXY] Using ${proxy.host}:${proxy.port}`);
    
    // Note: mineflayer doesn't support SOCKS5 natively
    // You need to use a tool like 'proxychains' or run the bot through a proxy
    console.log('[BOT] Starting with proxy...');
    
    // Alternative: Use proxychains
    // exec(`proxychains4 node bot.js`);
    
    createBot();
}

function createBot() {
    console.log(`[BOT] Connecting to ${BOT_CONFIG.host}`);
    
    bot = mineflayer.createBot(BOT_CONFIG);
    
    bot.once('spawn', () => {
        console.log('[SUCCESS] Bot connected!');
        console.log('[STATUS] Monitoring chat...');
        
        // Keep alive
        setInterval(() => {
            if (bot && bot.entity) {
                bot.setControlState('forward', true);
                setTimeout(() => bot.setControlState('forward', false), 500);
            }
        }, 120000); // كل دقيقتين
    });
    
    bot.on('message', (message) => {
        const cleanMsg = message.toString().replace(/§[0-9a-z]/gi, '');
        console.log(`[CHAT] ${cleanMsg}`);
        
        if (cleanMsg.toLowerCase().includes('login')) {
            setTimeout(() => bot.chat(`/login ${BOT_CONFIG.password}`), 2000);
        }
    });
    
    bot.on('kicked', (reason) => {
        console.log(`[KICKED] ${reason}`);
        setTimeout(() => process.exit(1), 1000);
    });
    
    bot.on('error', (err) => console.log(`[ERROR] ${err.message}`));
    bot.on('end', () => console.log('[DISCONNECTED]'));
}

// Start
createBotWithProxy();
