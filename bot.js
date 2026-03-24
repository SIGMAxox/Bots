const mineflayer = require('mineflayer');
const { SocksProxyAgent } = require('socks-proxy-agent');

// ==================== PROXY ====================
const PROXY = {
    host: '31.58.9.4',
    port: 6077,
    user: 'jjaczqrq',
    pass: 'jajcwxcjzxa7'
};

const proxyUrl = `socks5://${PROXY.user}:${PROXY.pass}@${PROXY.host}:${PROXY.port}`;
const agent = new SocksProxyAgent(proxyUrl);

console.log('✅ Proxy ready:', PROXY.host + ':' + PROXY.port);

// ==================== إعدادات البوت ====================
const bot = mineflayer.createBot({
    host: 'Ultimis.net',
    port: 25565,
    username: 'kevin911',
    version: '1.12.2',
    auth: 'offline',
    agent: agent
});

let loginSent = false;

// ==================== الأحداث ====================

bot.on('login', () => {
    console.log('✅ Connected to server');
});

bot.on('spawn', () => {
    console.log('✅ Spawned in world');
});

bot.on('message', (msg) => {
    const text = msg.toString();
    console.log('💬', text);
    
    // لو لقى الرسالة دي بالحرف
    if (text.includes('Please login to this account to play')) {
        console.log('🔑 Detected login request! Sending password...');
        bot.chat('/login asdfghjkl1');
        loginSent = true;
    }
    
    // لو طلب تسجيل جديد
    if (text.includes('register') && text.includes('password')) {
        console.log('📝 Registering...');
        bot.chat('/register asdfghjkl1 asdfghjkl1');
        loginSent = true;
    }
    
    // لو دخلنا بنجاح
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
console.log('👀 Watching for: "Please login to this account to play"');
