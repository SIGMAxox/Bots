const mineflayer = require('mineflayer');
const { SocksProxyAgent } = require('socks-proxy-agent');

// ==================== YOUR PROXY FROM WEBSHARE ====================
const PROXY_CONFIG = {
    enabled: true,
    type: 'socks5',
    host: '31.58.9.4',
    port: 6077,
    username: 'jjaczqrq',
    password: 'jajcwxcjzxa7'
};

// Create proxy agent
let agent = null;
if (PROXY_CONFIG.enabled) {
    const proxyUrl = `${PROXY_CONFIG.type}://${PROXY_CONFIG.username}:${PROXY_CONFIG.password}@${PROXY_CONFIG.host}:${PROXY_CONFIG.port}`;
    agent = new SocksProxyAgent(proxyUrl);
    console.log('✅ Proxy configured:', `${PROXY_CONFIG.host}:${PROXY_CONFIG.port}`);
}

// ==================== BOT CONFIG ====================
const BOT_CONFIG = {
    host: 'Ultimis.net',
    port: 25565,
    username: 'kevin911',
    password: 'asdfghjkl1',
    version: '1.12.2',
    auth: 'offline'
};

// ==================== CREATE BOT WITH PROXY ====================
console.log('🚀 Starting bot...');

const bot = mineflayer.createBot({
    ...BOT_CONFIG,
    agent: agent  // This makes the bot connect through proxy
});

let loginSent = false;
let authenticated = false;

// ==================== EVENTS ====================

bot.on('login', () => {
    console.log('✅ Connected to server through proxy!');
    console.log('📡 Proxy:', `${PROXY_CONFIG.host}:${PROXY_CONFIG.port}`);
});

bot.on('spawn', () => {
    console.log('✅ Spawned in world');
    
    if (!loginSent) {
        loginSent = true;
        setTimeout(() => {
            console.log('🔑 Sending login...');
            bot.chat('/login asdfghjkl1');
        }, 2000);
    }
});

bot.on('message', (msg) => {
    const text = msg.toString();
    console.log('💬', text);
    
    const lowerText = text.toLowerCase();
    
    // Handle registration
    if (lowerText.includes('register') && lowerText.includes('password')) {
        console.log('📝 Registering...');
        bot.chat(`/register ${BOT_CONFIG.password} ${BOT_CONFIG.password}`);
        authenticated = true;
    }
    
    // Handle login
    if (lowerText.includes('login') && lowerText.includes('password')) {
        console.log('🔑 Logging in...');
        bot.chat(`/login ${BOT_CONFIG.password}`);
        authenticated = true;
    }
    
    // Success message
    if (lowerText.includes('successfully logged in') || lowerText.includes('logged in')) {
        console.log('✅ Login successful!');
        authenticated = true;
        console.log('🎉 Bot is now fully operational!');
    }
    
    // Check if proxy is detected
    if (lowerText.includes('vpn') || lowerText.includes('proxy') || lowerText.includes('suspicious')) {
        console.log('⚠️ WARNING: Server detected proxy!');
        console.log('   Try a different proxy from your Webshare list');
    }
});

bot.on('kicked', (reason) => {
    const reasonText = typeof reason === 'string' ? reason : JSON.stringify(reason);
    console.log('❌ Kicked:', reasonText);
    
    if (reasonText.includes('VPN') || reasonText.includes('proxy')) {
        console.log('💡 This proxy was detected. Try another one from your Webshare list:');
        console.log('   - Go to webshare.io dashboard');
        console.log('   - Copy a different proxy');
        console.log('   - Update the config and try again');
    }
});

bot.on('error', (err) => {
    console.log('⚠️ Error:', err.message);
});

bot.on('end', () => {
    console.log('🔌 Connection ended');
});

console.log('📡 Server:', BOT_CONFIG.host);
console.log('🤖 Bot:', BOT_CONFIG.username);
