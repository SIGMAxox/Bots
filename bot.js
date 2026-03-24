const mineflayer = require('mineflayer');
const { SocksProxyAgent } = require('socks-proxy-agent');

// ==================== PROXY ====================
const PROXY = {
    host: '31.58.9.4',
    port: 6077,
    user: 'jjaczqrq',
    pass: 'jajcwxcjzxa7'
};

let agent = null;
try {
    const proxyUrl = `socks5://${PROXY.user}:${PROXY.pass}@${PROXY.host}:${PROXY.port}`;
    agent = new SocksProxyAgent(proxyUrl);
    console.log('✅ Proxy ready:', PROXY.host + ':' + PROXY.port);
} catch (err) {
    console.log('❌ Proxy error:', err.message);
}

// ==================== CONFIG ====================
const TRIGGER_PLAYERS = ['SIGMAxox', 'soonk'];
const TRIGGER_MESSAGE = '7anafe';
const PASSWORD = 'asdfghjkl1';

// ==================== BOT CONFIG ====================
const botConfig = {
    host: 'Ultimis.net',
    port: 25565,
    username: 'kevin911',
    version: '1.12.2',
    auth: 'offline',
    viewDistance: 'tiny',
    checkTimeoutInterval: 60000,
    hideErrors: true
};

if (agent) {
    botConfig.agent = agent;
}

const bot = mineflayer.createBot(botConfig);

let stepsDone = false;
let triggerCooldown = false;
let authenticated = false;

// تجاهل رسائل الـ chunk errors
const originalConsoleLog = console.log;
console.log = function(...args) {
    const msg = args.join(' ');
    if (msg.includes('Ignoring block entities')) return;
    if (msg.includes('chunk failed to load')) return;
    originalConsoleLog.apply(console, args);
};

// ==================== FUNCTIONS ====================
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// كتابة كلمة السر فوراً
function sendLogin() {
    if (!authenticated) {
        console.log('🔑 Sending login immediately...');
        bot.chat(`/login ${PASSWORD}`);
    }
}

function sendRegister() {
    console.log('📝 Registering...');
    bot.chat(`/register ${PASSWORD} ${PASSWORD}`);
    setTimeout(() => {
        bot.chat(`/login ${PASSWORD}`);
    }, 1000);
}

// الحركة
async function move() {
    try {
        console.log('🏃 Moving...');
        bot.setControlState('forward', true);
        await wait(800);
        bot.setControlState('forward', false);
        
        bot.setControlState('right', true);
        await wait(400);
        bot.setControlState('right', false);
        
        bot.setControlState('back', true);
        await wait(600);
        bot.setControlState('back', false);
        
        console.log('✅ Movement done');
    } catch (err) {}
}

// استخدام compass
async function useCompass() {
    try {
        console.log('🧭 Using compass...');
        const compass = bot.inventory.items().find(item => 
            item.name === 'compass' || item.name === 'minecraft:compass'
        );
        
        if (compass) {
            await bot.equip(compass, 'hand');
            await wait(500);
            bot.activateItem();
            console.log('✅ Compass used');
        } else {
            console.log('❌ No compass found');
        }
    } catch (err) {}
}

// Click Lifesteal
async function clickLifesteal() {
    try {
        console.log('🔮 Clicking lifesteal...');
        await wait(1500);
        
        const window = bot.currentWindow;
        if (window) {
            const item = window.slots.find(i => 
                i && (i.name.includes('dye') || 
                      i.name.includes('poppy') || 
                      i.name.includes('rose') || 
                      i.name.includes('red'))
            );
            
            if (item) {
                await bot.clickWindow(item.slot, 0, 0);
                await wait(500);
                bot.closeWindow(window);
                console.log('✅ Lifesteal clicked');
            }
        }
    } catch (err) {}
}

// الدوران
async function look() {
    try {
        console.log('👀 Looking around...');
        if (bot.entity) {
            const yaw = bot.entity.yaw;
            bot.look(yaw + Math.PI / 2, 0, true);
            await wait(300);
            bot.look(yaw - Math.PI / 2, 0, true);
            await wait(300);
            bot.look(yaw, 0, true);
        }
        console.log('✅ Look done');
    } catch (err) {}
}

// ==================== TPA FUNCTION ====================
async function sendTPA(playerName) {
    if (triggerCooldown) {
        console.log(`⏰ TPA to ${playerName} on cooldown, skipping...`);
        return;
    }
    
    triggerCooldown = true;
    console.log(`\n🎯 TRIGGER! Sending TPA to ${playerName}...`);
    
    try {
        bot.chat(`/tpa ${playerName}`);
        console.log(`✅ /tpa ${playerName} sent!`);
    } catch (err) {
        console.log(`❌ Failed to send TPA: ${err.message}`);
    }
    
    setTimeout(() => {
        triggerCooldown = false;
    }, 15000);
}

// ==================== كل الخطوات ====================
async function doAllSteps() {
    if (stepsDone) return;
    
    console.log('\n🎬 Starting steps...\n');
    
    await move();
    await wait(1000);
    
    await useCompass();
    await wait(2000);
    
    await clickLifesteal();
    await wait(2000);
    
    await move();
    await wait(1000);
    
    console.log('💤 /afk');
    bot.chat('/afk');
    await wait(1000);
    
    await look();
    
    stepsDone = true;
    console.log('\n✅ All steps done!\n');
    console.log('🎯 Waiting for trigger: "7anafe" from SIGMAxox or soonk');
}

// ==================== CHECK TRIGGER ====================
function checkTrigger(message, sender) {
    if (message && message.includes(TRIGGER_MESSAGE)) {
        for (const player of TRIGGER_PLAYERS) {
            if (sender && sender.includes(player)) {
                console.log(`\n🔔 Detected "${TRIGGER_MESSAGE}" from ${player}!`);
                sendTPA(player);
                return true;
            }
        }
    }
    return false;
}

// ==================== EVENTS ====================

bot.on('login', () => {
    console.log('✅ Connected');
});

bot.once('spawn', () => {
    console.log('✅ Spawned');
    // بعد السباون مباشرة نرسل كلمة السر
    sendLogin();
});

bot.on('message', (msg) => {
    const text = msg.toString();
    
    // استخراج اسم المرسل
    let sender = '';
    const match = text.match(/<([^>]+)>/);
    if (match) {
        sender = match[1];
    }
    
    // فلترة الرسائل
    if (!text.includes('VOTE') && 
        !text.includes('Discord') && 
        !text.includes('Support') &&
        !text.includes('vote') &&
        text.length < 100) {
        console.log('💬', text);
    }
    
    // التحقق من الـ Trigger
    checkTrigger(text, sender);
    
    // لو طلب تسجيل
    if (text.includes('register') && text.includes('password')) {
        sendRegister();
    }
    
    // لو طلب دخول (ونحن ما دخلناش)
    if (text.includes('login') && text.includes('password') && !authenticated) {
        sendLogin();
    }
    
    // لو دخلنا بنجاح
    if (text.includes('Successfully logged in') || text.includes('Logged in')) {
        authenticated = true;
        console.log('✅ Logged in!');
        doAllSteps();
    }
});

bot.on('kicked', (reason) => {
    const reasonText = typeof reason === 'string' ? reason : JSON.stringify(reason);
    console.log('❌ Kicked:', reasonText);
});

bot.on('error', (err) => {
    if (!err.message.includes('chunk')) {
        console.log('⚠️ Error:', err.message);
    }
});

console.log('🚀 Starting bot...');
console.log('📡 Server: Ultimis.net');
console.log('🤖 Bot: kevin911');
console.log('🎯 Trigger: "7anafe" from SIGMAxox or soonk');
