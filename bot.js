const mineflayer = require('mineflayer');
const { SocksProxyAgent } = require('socks-proxy-agent');

// ==================== PROXY (من Webshare) ====================
const PROXY = {
    host: '31.58.9.4',
    port: 6077,
    user: 'jjaczqrq',
    pass: 'jajcwxcjzxa7'
};

// عمل proxy agent
const proxyUrl = `socks5://${PROXY.user}:${PROXY.pass}@${PROXY.host}:${PROXY.port}`;
const agent = new SocksProxyAgent(proxyUrl);

console.log('✅ Proxy ready:', PROXY.host + ':' + PROXY.port);

// ==================== اعدادات البوت ====================
const bot = mineflayer.createBot({
    host: 'Ultimis.net',
    port: 25565,
    username: 'kevin911',
    version: '1.12.2',
    auth: 'offline',
    agent: agent  // الاتصال عن طريق proxy
});

let loginSent = false;

// ==================== الاحداث ====================

bot.on('login', () => {
    console.log('✅ Connected to server');
});

bot.on('spawn', () => {
    console.log('✅ Spawned in world');
    
    if (!loginSent) {
        loginSent = true;
        setTimeout(() => {
            console.log('🔑 Logging in...');
            bot.chat('/login asdfghjkl1');
        }, 2000);
    }
});

bot.on('message', (msg) => {
    const text = msg.toString();
    console.log('💬', text);
    
    if (text.includes('register')) {
        bot.chat('/register asdfghjkl1 asdfghjkl1');
    }
    
    if (text.includes('Successfully logged in')) {
        console.log('✅ Bot is running!');
    }
});

bot.on('kicked', (reason) => {
    console.log('❌ Kicked:', reason);
});

bot.on('error', (err) => {
    console.log('⚠️ Error:', err.message);
});

console.log('🚀 Starting bot...');
console.log('📡 Server: Ultimis.net');
console.log('🤖 Username: kevin911');
