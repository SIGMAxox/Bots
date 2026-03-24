const mineflayer = require('mineflayer');

// ==================== CONFIG ====================
const BOT_CONFIG = {
    username: 'kevin911',
    password: 'asdfghjkl1',
    host: 'Ultimis.net',
    port: 25565,
    version: '1.12.2',
    auth: 'offline'
};

// ==================== CREATE BOT ====================
const bot = mineflayer.createBot(BOT_CONFIG);

let authenticated = false;

// ==================== EVENTS ====================

bot.on('login', () => {
    console.log(`✅ [${bot.username}] Connected to server`);
});

bot.on('spawn', () => {
    console.log(`✅ [${bot.username}] Spawned in world`);
    
    // بعد ما يظهر، نرسل كلمة السر
    setTimeout(() => {
        if (!authenticated) {
            console.log(`🔐 Sending login...`);
            bot.chat('/login asdfghjkl1');
        }
    }, 2000);
});

bot.on('message', (message) => {
    const msg = message.toString();
    console.log(`💬 ${msg}`);
    
    const lowerMsg = msg.toLowerCase();
    
    // لو طلب تسجيل
    if (lowerMsg.includes('register') && lowerMsg.includes('password')) {
        console.log(`📝 Registering...`);
        bot.chat(`/register ${BOT_CONFIG.password} ${BOT_CONFIG.password}`);
        authenticated = true;
    }
    
    // لو طلب دخول
    if (lowerMsg.includes('login') && lowerMsg.includes('password')) {
        console.log(`🔑 Logging in...`);
        bot.chat(`/login ${BOT_CONFIG.password}`);
        authenticated = true;
    }
    
    // تأكيد الدخول
    if (lowerMsg.includes('successfully logged in') || lowerMsg.includes('logged in')) {
        console.log(`✅ Logged in successfully!`);
        authenticated = true;
    }
});

bot.on('kicked', (reason) => {
    console.log(`❌ Kicked: ${reason}`);
});

bot.on('error', (err) => {
    console.log(`⚠️ Error: ${err.message}`);
});

bot.on('end', () => {
    console.log(`🔌 Connection ended`);
});

console.log(`🚀 Starting bot: ${BOT_CONFIG.username}`);
console.log(`📡 Server: ${BOT_CONFIG.host}:${BOT_CONFIG.port}`);
