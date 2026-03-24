const mineflayer = require('mineflayer');
const { SocksProxyAgent } = require('socks-proxy-agent');

// ==================== PROXY - جرب بروكسي مختلف ====================
// جرب الأرقام دي واحد واحد من القائمة اللي عندك
const PROXY = {
    host: '31.58.9.4',   // جرب 31.58.9.5 او 31.58.9.6
    port: 6077,           // ممكن البورت يختلف
    user: 'jjaczqrq',
    pass: 'jajcwxcjzxa7'
};

const proxyUrl = `socks5://${PROXY.user}:${PROXY.pass}@${PROXY.host}:${PROXY.port}`;
const agent = new SocksProxyAgent(proxyUrl);

console.log('✅ Proxy ready:', PROXY.host + ':' + PROXY.port);

const bot = mineflayer.createBot({
    host: 'Ultimis.net',
    port: 25565,
    username: 'kevin911',
    version: '1.21.1',
    auth: 'offline',
    agent: agent
});

let loginSent = false;

bot.on('login', () => {
    console.log('✅ Connected to server');
});

bot.on('spawn', () => {
    console.log('✅ Spawned in world');
    
    if (!loginSent) {
        loginSent = true;
        // نرسل كلمة السر فوراً بدون تأخير
        console.log('🔑 Logging in...');
        bot.chat('/login asdfghjkl1');
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
