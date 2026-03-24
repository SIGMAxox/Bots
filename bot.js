const mineflayer = require('mineflayer');

// ==================== VPN CONFIGURATION ====================
// ضع ملف الـ .ovpn في نفس المجلد واسمه "vpn.ovpn"
// أو غيّر المسار هنا
const VPN_CONFIG_FILE = './vpn.ovpn';

// ==================== BOT CONFIGURATION ====================
const BOT_CONFIG = {
    host: 'Ultimis.net',
    port: 25565,
    username: 'kevin911',
    password: 'asdfghjkl1',
    version: '1.12.2',
    auth: 'offline',
    
    // Performance settings
    hideErrors: true,
    viewDistance: 'tiny',
    checkTimeoutInterval: 60000
};

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const randomDelay = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

let bot = null;
let isAuthenticated = false;

// ==================== BOT FUNCTIONS ====================
async function createBot() {
    if (bot) {
        try {
            bot.end();
        } catch(e) {}
    }

    console.log('🔗 Connecting to server...');
    
    bot = mineflayer.createBot(BOT_CONFIG);
    
    bot.once('login', async () => {
        console.log('✅ Connected!');
        await wait(randomDelay(2000, 4000));
    });
    
    bot.once('spawn', async () => {
        console.log('✅ Spawned in world');
        
        // Natural movement
        await wait(randomDelay(1500, 3000));
        
        if (bot.entity) {
            try {
                bot.look(bot.entity.yaw + 0.5, 0, false);
                await wait(500);
                bot.setControlState('forward', true);
                await wait(400);
                bot.setControlState('forward', false);
            } catch(e) {}
        }
    });
    
    bot.on('message', async (msg) => {
        const text = msg.toString();
        
        // Show only important messages
        if (!text.includes('VOTE') && !text.includes('Discord') && text.trim()) {
            console.log('💬', text.substring(0, 120));
        }
        
        // Login
        if (text.includes('Please login') && text.includes('password')) {
            await wait(randomDelay(1000, 2500));
            console.log('🔐 Logging in...');
            bot.chat(`/login ${BOT_CONFIG.password}`);
        }
        
        // Register
        if (text.includes('register') && text.includes('password') && !isAuthenticated) {
            await wait(randomDelay(1500, 3000));
            console.log('📝 Registering...');
            bot.chat(`/register ${BOT_CONFIG.password} ${BOT_CONFIG.password}`);
        }
        
        // Success
        if (text.includes('Successfully logged in')) {
            isAuthenticated = true;
            console.log('✅ Bot is ready!');
        }
    });
    
    bot.on('kicked', (reason) => {
        const text = typeof reason === 'string' ? reason : JSON.stringify(reason);
        console.log('❌ Kicked:', text.substring(0, 100));
        
        if (text.includes('SECURITY') || text.includes('VPN')) {
            console.log('🚨 VPN/Security block detected!');
            console.log('💡 Try a different VPN server or config');
            process.exit(1);
        }
        
        setTimeout(() => {
            console.log('🔄 Reconnecting in 10s...');
            createBot();
        }, 10000);
    });
    
    bot.on('error', (err) => {
        if (err.code !== 'ETIMEDOUT') {
            console.log('⚠️', err.message);
        }
    });
    
    bot.on('end', () => {
        console.log('🔌 Connection ended');
    });
}

// ==================== START ====================
console.log('═'.repeat(60));
console.log('🚀 MINECRAFT BOT - VPN VERSION');
console.log('═'.repeat(60));
console.log('📡 Server:', BOT_CONFIG.host);
console.log('🤖 Username:', BOT_CONFIG.username);
console.log('🔒 VPN: Will use system VPN connection');
console.log('═'.repeat(60));
console.log('');
console.log('⚠️  IMPORTANT: Make sure VPN is connected BEFORE running this!');
console.log('   On GitHub Actions, VPN must be set up in workflow first.');
console.log('');

createBot();
