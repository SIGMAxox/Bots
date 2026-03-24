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
let bot = null;
let loginAttempts = 0;
let reconnectInterval = null;
let loginInterval = null;

function createBot() {
    if (bot) {
        try {
            bot.end();
        } catch(e) {}
    }

    bot = mineflayer.createBot({
        host: 'Ultimis.net',
        port: 25565,
        username: 'kevin911',
        version: '1.12.2',
        auth: 'offline',
        agent: agent
    });

    let loginSent = false;
    let authenticated = false;

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
        if (text.includes('Please login to this account to play') && !loginSent) {
            console.log('🔑 Detected login request! Sending password...');
            bot.chat('/login asdfghjkl1');
            loginSent = true;
        }
        
        // لو طلب تسجيل جديد
        if (text.includes('register') && text.includes('password') && !loginSent) {
            console.log('📝 Registering...');
            bot.chat('/register asdfghjkl1 asdfghjkl1');
            loginSent = true;
        }
        
        // لو دخلنا بنجاح
        if (text.includes('Successfully logged in')) {
            authenticated = true;
            loginSent = true;
            loginAttempts = 0;
            console.log('✅ Bot is running!');
            
            // لو دخلنا بنجاح، نوقف المحاولات
            if (loginInterval) {
                clearInterval(loginInterval);
                loginInterval = null;
            }
        }
        
        // لو فشل الدخول
        if (text.includes('Wrong password') || text.includes('Incorrect password')) {
            console.log('❌ Wrong password, trying again in 5 seconds...');
            loginSent = false;
        }
    });

    bot.on('kicked', (reason) => {
        const reasonText = typeof reason === 'string' ? reason : JSON.stringify(reason);
        console.log('❌ Kicked:', reasonText);
        
        // لو اتطرد بسبب الوقت، نعيد المحاولة
        if (reasonText.includes('Authorization time is up')) {
            console.log('⏰ Auth timeout, retrying in 5 seconds...');
            loginSent = false;
        }
        
        // لو اتطرد لأي سبب، نعيد الاتصال
        setTimeout(() => {
            console.log('🔄 Reconnecting...');
            createBot();
        }, 5000);
    });

    bot.on('error', (err) => {
        console.log('⚠️ Error:', err.message);
    });

    bot.on('end', () => {
        console.log('🔌 Connection ended');
    });
}

// ==================== محاولة كل 5 ثواني ====================
function startLoginLoop() {
    loginInterval = setInterval(() => {
        if (bot && bot.entity && !bot.authenticated) {
            console.log(`🔐 Attempt ${loginAttempts + 1} - Sending login...`);
            bot.chat('/login asdfghjkl1');
            loginAttempts++;
        }
    }, 5000);
}

// ==================== بدء البوت ====================
console.log('🚀 Starting bot...');
console.log('📡 Server: Ultimis.net');
console.log('🤖 Username: kevin911');
console.log('🔄 Will keep trying every 5 seconds until successful');

createBot();
startLoginLoop();
