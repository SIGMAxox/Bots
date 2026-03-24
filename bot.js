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

// ==================== CONFIG ====================
const TRIGGER_PLAYERS = ['SIGMAxox', 'soonk'];
const TRIGGER_MESSAGE = '7anafe';

// ==================== BOT CONFIG ====================
const bot = mineflayer.createBot({
    host: 'Ultimis.net',
    port: 25565,
    username: 'kevin911',
    version: '1.12.2',
    auth: 'offline',
    agent: agent,
    viewDistance: 'tiny',
    checkTimeoutInterval: 60000,
    hideErrors: true,
    loadChunks: false,
    chunkLoadRadius: 0
});

let loginSent = false;
let stepsDone = false;
let triggerCooldown = false; // منع التكرار السريع

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
    
    // كول داون 15 ثانية عشان ما يكررش
    setTimeout(() => {
        triggerCooldown = false;
    }, 15000);
}

// ==================== كل الخطوات ====================
async function doAllSteps() {
    if (stepsDone) return;
    
    console.log('\n🎬 Starting steps...\n');
    
    await wait(2000);
    
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
    // لو الرسالة فيها الكلمة المطلوبة
    if (message.includes(TRIGGER_MESSAGE)) {
        // وشوف مين اللي بعت
        for (const player of TRIGGER_PLAYERS) {
            if (sender.includes(player)) {
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

bot.on('spawn', () => {
    console.log('✅ Spawned');
    
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
    const json = msg.json || {};
    
    // استخراج اسم المرسل لو موجود
    let sender = '';
    if (json.extra && json.extra[0] && json.extra[0].clickEvent) {
        // بعض التنسيقات
        sender = json.extra[0].text || '';
    } else if (text.includes('<')) {
        // تنسيق عادي: <username> message
        const match = text.match(/<([^>]+)>/);
        if (match) sender = match[1];
    }
    
    // فلترة الرسائل
    if (!text.includes('VOTE') && 
        !text.includes('Discord') && 
        !text.includes('Support') &&
        text.length < 100) {
        console.log('💬', text);
    }
    
    // التحقق من الـ Trigger
    checkTrigger(text, sender);
    
    // تسجيل الدخول
    if (text.includes('register')) {
        bot.chat('/register asdfghjkl1 asdfghjkl1');
    }
    
    if (text.includes('Successfully logged in')) {
        console.log('✅ Logged in! Starting...');
        doAllSteps();
    }
});

bot.on('kicked', (reason) => {
    console.log('❌ Kicked:', reason);
});

bot.on('error', (err) => {
    if (!err.message.includes('chunk')) {
        console.log('⚠️ Error:', err.message);
    }
});

console.log('🚀 Starting bot...');
console.log('📡 Server: Ultimis.net');
console.log('🤖 Bot: kevin911');
console.log('⚡ Mode: Lightweight');
console.log('🎯 Trigger: "7anafe" from SIGMAxox or soonk');
console.log('💬 Bot will send /tpa <player> when triggered');
