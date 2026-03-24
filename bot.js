const mineflayer = require('mineflayer');
const pkg = require('./package.json');

// ==================== CONFIGURATION ====================
const BOT_CONFIGS = [
    { username: 'kevin911', password: 'asdfghjkl1', showConsole: true },
    { username: 'n00p67', password: 'asdfghjkl1', showConsole: false },
    { username: 'crassbare47', password: 'asdfghjkl1', showConsole: false },
    { username: 'omgstar01', password: 'asdfghjkl1', showConsole: false },
    { username: 'notsigmaboylol', password: 'asdfghjkl1', showConsole: false }
];

// Fake client data to mimic real Minecraft client
const FAKE_CLIENT_DATA = {
    // Randomize brand info
    brand: ['vanilla', 'fabric', 'forge', 'lunarclient', 'badlion'].random(),
    // Random view distance (3-12 like real players)
    viewDistance: Math.floor(Math.random() * 9) + 3,
    // Random language
    language: ['en_US', 'en_GB', 'fr_FR', 'de_DE', 'es_ES'].random(),
    // Random render distance
    renderDistance: Math.floor(Math.random() * 10) + 5,
    // Random skin variant
    skinVariant: Math.floor(Math.random() * 4),
};

// Array random helper
Array.prototype.random = function() {
    return this[Math.floor(Math.random() * this.length)];
};

const SERVER_CONFIG = {
    host: 'Ultimis.net',
    port: 25565,
    version: '1.12.2',
    auth: 'offline',
    hideErrors: true,
    checkTimeoutInterval: 60000,
    viewDistance: 'tiny',
    compressionThreshold: 0,
    // Spoof client settings
    clientToken: generateRandomToken(),
    session: generateRandomSession(),
    // Randomize ping intervals
    pingInterval: Math.floor(Math.random() * 5000) + 3000,
    // Add realistic delays
    connectTimeout: Math.floor(Math.random() * 5000) + 3000,
};

// Generate random token
function generateRandomToken() {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
}

// Generate random session ID
function generateRandomSession() {
    return 'session-' + Math.random().toString(36).substring(2, 10);
}

const TRIGGER_PLAYERS = ['SIGMAxox', 'soonk'];
const TRIGGER_MESSAGE = '7anafe';
const MAX_RETRIES = 5;
const RETRY_DELAY = 45000; // Random delay between retries
const CONNECTION_DELAY = 15000; // Random delay between bots

// Human-like behavior settings
const HUMAN_BEHAVIOR = {
    minTypingSpeed: 50,
    maxTypingSpeed: 300,
    minLookDelay: 1000,
    maxLookDelay: 5000,
    minMoveDelay: 800,
    maxMoveDelay: 3000,
    afkChance: 0.05, // 5% chance to go AFK
    randomLookChance: 0.3, // 30% chance for random look around
};

// ==================== GLOBALS ====================
let bots = [];
let botRetryCounts = {};
let triggerActivated = false;
let connectedCount = 0;
let lastMessageTime = {};
let botSpawnCount = 0;
let botReadyCount = 0;

// ==================== UTILITIES ====================
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function randomDelay(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function shouldShowMessage(botUsername, msgType) {
    const now = Date.now();
    const key = `${botUsername}_${msgType}`;
    if (!lastMessageTime[key] || now - lastMessageTime[key] > 2000) {
        lastMessageTime[key] = now;
        return true;
    }
    return false;
}

// Human-like typing simulation
async function humanLikeChat(bot, message) {
    if (bot && bot.entity) {
        try {
            // Simulate typing delay
            const typingDelay = randomDelay(HUMAN_BEHAVIOR.minTypingSpeed, HUMAN_BEHAVIOR.maxTypingSpeed);
            await wait(typingDelay);
            bot.chat(message);
            await wait(randomDelay(200, 600));
        } catch (err) {}
    }
}

// Random mouse movements (looking around)
async function randomLook(bot) {
    try {
        if (bot.entity && Math.random() < HUMAN_BEHAVIOR.randomLookChance) {
            const randomYaw = bot.entity.yaw + (Math.random() - 0.5) * Math.PI;
            const randomPitch = (Math.random() - 0.5) * Math.PI / 2;
            bot.look(randomYaw, randomPitch, true);
            await wait(randomDelay(200, 800));
        }
    } catch (err) {}
}

// Simulate AFK behavior
async function simulateAFK(bot) {
    if (Math.random() < HUMAN_BEHAVIOR.afkChance && bot.ready) {
        try {
            await humanLikeChat(bot, '/afk');
            if (bot.showConsole) {
                console.log(`😴 [${bot.username}] Simulating AFK`);
            }
            await wait(randomDelay(30000, 120000)); // AFK for 30-120 seconds
            await humanLikeChat(bot, '/back');
        } catch (err) {}
    }
}

// ==================== STEALTH FEATURES ====================

// Randomize movement patterns
async function humanLikeMove(bot) {
    try {
        const movePatterns = [
            async () => {
                // Walk forward randomly
                bot.setControlState('forward', true);
                await wait(randomDelay(500, 2000));
                bot.setControlState('forward', false);
            },
            async () => {
                // Turn and walk
                const yaw = bot.entity.yaw;
                bot.look(yaw + (Math.random() - 0.5) * Math.PI / 2, 0, true);
                await wait(randomDelay(200, 500));
                bot.setControlState('forward', true);
                await wait(randomDelay(800, 2500));
                bot.setControlState('forward', false);
            },
            async () => {
                // Strafe left/right
                const direction = Math.random() > 0.5 ? 'left' : 'right';
                bot.setControlState(direction, true);
                await wait(randomDelay(300, 1200));
                bot.setControlState(direction, false);
            },
            async () => {
                // Jump
                bot.setControlState('jump', true);
                await wait(randomDelay(100, 300));
                bot.setControlState('jump', false);
            }
        ];
        
        const pattern = movePatterns[Math.floor(Math.random() * movePatterns.length)];
        await pattern();
    } catch (err) {}
}

// Spoof client brand
function spoofClientBrand(bot) {
    try {
        // Send custom brand to look like different clients
        const brands = ['vanilla', 'fabric', 'forge', 'lunarclient', 'badlion'];
        const randomBrand = brands[Math.floor(Math.random() * brands.length)];
        
        if (bot._client && bot._client.write) {
            // Spoof brand payload
            bot._client.write('brand', { brand: randomBrand });
        }
    } catch (err) {}
}

// Randomize connection timing
async function randomizedConnect(bot, config, index) {
    const connectionVariation = randomDelay(-2000, 2000);
    const actualDelay = Math.max(1000, CONNECTION_DELAY + connectionVariation);
    
    if (config.showConsole) {
        console.log(`🔗 [${config.username}] Connecting in ${Math.round(actualDelay/1000)}s...`);
    }
    
    await wait(actualDelay);
    return createBot(config, index);
}

// ==================== SYNCHRONIZED ACTION SYSTEM ====================

async function executeSyncAction(action, actionName = 'action') {
    if (!bots.length) return [];
    
    const promises = bots.map(async (bot) => {
        if (bot && bot.entity && bot.ready) {
            try {
                // Add random delay between bots to look less synchronized
                await wait(randomDelay(50, 200));
                return await action(bot);
            } catch (err) {
                if (bot.showConsole) {
                    console.log(`⚠️ [${bot.username}] ${actionName} failed: ${err.message}`);
                }
                return null;
            }
        }
        return null;
    });
    
    const results = await Promise.all(promises);
    await wait(randomDelay(100, 300));
    
    return results;
}

// ==================== SYNCHRONIZED BOT ACTIONS ====================

async function syncQuickMove(bot) {
    try {
        // Human-like movement with random variations
        const moves = [
            async () => {
                bot.setControlState('forward', true);
                await wait(randomDelay(400, 800));
                bot.setControlState('forward', false);
            },
            async () => {
                bot.setControlState('forward', true);
                await wait(randomDelay(200, 400));
                bot.setControlState('right', true);
                await wait(randomDelay(300, 600));
                bot.setControlState('right', false);
                bot.setControlState('forward', false);
            },
            async () => {
                bot.setControlState('back', true);
                await wait(randomDelay(200, 500));
                bot.setControlState('back', false);
            }
        ];
        
        const moveCount = randomDelay(1, 3);
        for (let i = 0; i < moveCount; i++) {
            const move = moves[Math.floor(Math.random() * moves.length)];
            await move();
            await wait(randomDelay(100, 300));
        }
        
        // Random look after moving
        await randomLook(bot);
    } catch (err) {}
}

async function syncQuickLook(bot) {
    try {
        if (bot.entity) {
            // Human-like head movement
            const lookCount = randomDelay(1, 3);
            for (let i = 0; i < lookCount; i++) {
                const yaw = bot.entity.yaw + (Math.random() - 0.5) * Math.PI;
                const pitch = (Math.random() - 0.5) * Math.PI / 3;
                bot.look(yaw, pitch, true);
                await wait(randomDelay(200, 600));
            }
            // Reset to original direction
            bot.look(bot.entity.yaw, 0, true);
        }
    } catch (err) {}
}

async function syncUseCompass(bot) {
    try {
        await wait(randomDelay(300, 800));
        const compass = bot.inventory.items().find(item => 
            item.name === 'compass' || item.name === 'minecraft:compass'
        );
        if (compass) {
            await bot.equip(compass, 'hand');
            await wait(randomDelay(400, 800));
            bot.activateItem();
            await wait(randomDelay(800, 1500));
        }
    } catch (err) {}
}

async function syncClickLifesteal(bot) {
    try {
        await wait(randomDelay(1000, 2000));
        const window = bot.currentWindow;
        if (window) {
            const item = window.slots.find(i => 
                i && (i.name.includes('dye') || i.name.includes('poppy') || 
                i.name.includes('rose') || i.name.includes('red'))
            );
            if (item) {
                // Random click position within slot
                await wait(randomDelay(200, 500));
                await bot.clickWindow(item.slot, 0, 0);
                await wait(randomDelay(300, 800));
                bot.closeWindow(window);
            }
        }
    } catch (err) {}
}

// ==================== MAIN FLOW ====================

async function runFlow(bot) {
    try {
        // Random initial delay (look like human reaction)
        await wait(randomDelay(1000, 3000));
        
        // Move randomly
        await syncQuickMove(bot);
        await wait(randomDelay(500, 1500));
        
        // Use compass
        await syncUseCompass(bot);
        await wait(randomDelay(1500, 3000));
        
        // Click lifesteal
        await syncClickLifesteal(bot);
        await wait(randomDelay(2000, 4000));
        
        // Move again
        await syncQuickMove(bot);
        await wait(randomDelay(500, 1500));
        
        // Random AFK chance
        await simulateAFK(bot);
        
        // Look around
        await syncQuickLook(bot);
        
        // Spoof client brand periodically
        spoofClientBrand(bot);
        
        // Mark as ready
        bot.ready = true;
        botReadyCount++;
        
        if (bot.showConsole) {
            console.log(`✅ [${bot.username}] Ready (${botReadyCount}/${BOT_CONFIGS.length})`);
        }
        
        // Start periodic random behavior
        startRandomBehavior(bot);
        
        if (botReadyCount === BOT_CONFIGS.length) {
            console.log(`\n🎉 ALL ${botReadyCount} BOTS ACTIVE AND OPERATIONAL\n`);
        }
        
    } catch (error) {
        console.log(`❌ [${bot.username}] Flow error: ${error.message}`);
        bot.ready = true;
        botReadyCount++;
    }
}

// Periodic random behavior to look human
function startRandomBehavior(bot) {
    setInterval(async () => {
        if (bot && bot.entity && bot.ready) {
            const behaviors = [
                () => randomLook(bot),
                () => humanLikeMove(bot),
                () => simulateAFK(bot),
                () => spoofClientBrand(bot)
            ];
            
            // Randomly perform a behavior every 30-90 seconds
            if (Math.random() < 0.3) {
                const behavior = behaviors[Math.floor(Math.random() * behaviors.length)];
                await behavior();
            }
        }
    }, randomDelay(30000, 90000));
}

// ==================== TPA SYSTEM ====================

async function sendSyncTPA(sender) {
    if (triggerActivated) return;
    triggerActivated = true;
    
    console.log(`\n🎯 Trigger detected: ${sender}\n`);
    
    // Randomize TPA timing to look like humans typing
    const tpaPromises = [];
    
    for (const bot of bots) {
        if (bot && bot.entity && bot.ready) {
            // Random delay between bots to look natural
            await wait(randomDelay(300, 1500));
            tpaPromises.push(humanLikeChat(bot, `/tpa ${sender}`));
            if (bot.showConsole) {
                console.log(`  → [${bot.username}] /tpa ${sender}`);
            }
        }
    }
    
    await Promise.all(tpaPromises);
    
    console.log(`✅ Sent TPA from ${tpaPromises.length} bots\n`);
    
    setTimeout(() => { triggerActivated = false; }, randomDelay(20000, 35000));
}

// ==================== AUTHENTICATION ====================

async function handleAuth(bot, password) {
    await wait(randomDelay(1500, 3000));
    
    if (bot._client && !bot.authenticated) {
        // Random typing speed for commands
        await humanLikeChat(bot, `/login ${password}`);
        await wait(randomDelay(1500, 3000));
        
        if (!bot.authenticated) {
            await humanLikeChat(bot, `/register ${password} ${password}`);
            await wait(randomDelay(1500, 3000));
        }
    }
}

// ==================== BOT CREATION ====================

function createBot(config, index) {
    const botConfig = {
        username: config.username,
        password: config.password,
        ...SERVER_CONFIG
    };
    
    if (config.showConsole) {
        console.log(`🔗 [${config.username}] Connecting...`);
    }
    
    const bot = mineflayer.createBot(botConfig);
    bot.ready = false;
    bot.username = config.username;
    bot.showConsole = config.showConsole;
    bot.password = config.password;
    bot.authenticated = false;
    bot.lastActivity = Date.now();
    
    bots.push(bot);
    
    // Spoof client on connect
    bot.once('login', () => {
        spoofClientBrand(bot);
    });
    
    // ==================== EVENT: SPAWN ====================
    bot.once('spawn', async () => {
        botSpawnCount++;
        
        if (bot.showConsole) {
            console.log(`✓ [${bot.username}] Spawned`);
        }
        
        botRetryCounts[bot.username] = 0;
        
        // Random delay before actions
        await wait(randomDelay(2000, 5000));
        
        // Handle authentication
        await handleAuth(bot, config.password);
        bot.authenticated = true;
        
        // Run main flow
        await runFlow(bot);
    });
    
    // ==================== EVENT: CHAT ====================
    bot.on('message', async (message) => {
        const msg = message.toString();
        
        // Filter spam
        if (bot.showConsole && shouldShowMessage(bot.username, 'chat')) {
            if (msg.length < 120 && 
                !msg.includes('VOTE REWARDS') && 
                !msg.includes('Discord') &&
                !msg.includes('Support the server')) {
                console.log(`💬 ${msg}`);
            }
        }
        
        const lowerMsg = msg.toLowerCase();
        
        // Auth responses
        if (lowerMsg.includes('register') || (lowerMsg.includes('login') && lowerMsg.includes('password'))) {
            await wait(randomDelay(1000, 2500));
            await humanLikeChat(bot, `/login ${config.password}`);
            await wait(randomDelay(1000, 2000));
            bot.authenticated = true;
        }
        
        if (lowerMsg.includes('successfully logged in')) {
            bot.authenticated = true;
        }
        
        // Trigger detection with random delay (human reaction)
        if (index === 0 && msg.includes(TRIGGER_MESSAGE)) {
            for (const player of TRIGGER_PLAYERS) {
                if (msg.includes(player)) {
                    await wait(randomDelay(500, 2000)); // Human reaction time
                    await sendSyncTPA(player);
                    break;
                }
            }
        }
    });
    
    // ==================== EVENT: KICKED ====================
    bot.on('kicked', (reason) => {
        let reasonText = typeof reason === 'string' ? reason : JSON.stringify(reason);
        
        if (bot.showConsole && shouldShowMessage(bot.username, 'kick')) {
            console.log(`❌ [${bot.username}] Kicked: ${reasonText.substring(0, 80)}`);
        }
        
        if (bot.ready) botReadyCount--;
        bot.ready = false;
        
        const idx = bots.findIndex(b => b?.username === bot.username);
        if (idx !== -1) bots.splice(idx, 1);
        
        removeBotAndRetry(bot, config, index);
    });
    
    // ==================== EVENT: ERROR ====================
    bot.on('error', (err) => {
        // Silent ignore common errors
        const ignoreErrors = ['ETIMEDOUT', 'ECONNRESET', 'ECONNREFUSED', 'EPIPE'];
        if (!ignoreErrors.includes(err.code) && bot.showConsole && shouldShowMessage(bot.username, 'error')) {
            console.log(`⚠️ [${bot.username}] ${err.message.substring(0, 60)}`);
        }
    });
    
    // ==================== EVENT: END ====================
    bot.on('end', () => {
        const idx = bots.findIndex(b => b?.username === bot.username);
        if (idx !== -1) bots.splice(idx, 1);
        if (bot.ready) botReadyCount--;
        removeBotAndRetry(bot, config, index);
    });
    
    return bot;
}

// ==================== RETRY HANDLER ====================

function removeBotAndRetry(bot, config, index) {
    if (!botRetryCounts[config.username]) botRetryCounts[config.username] = 0;
    
    if (botRetryCounts[config.username] < MAX_RETRIES) {
        botRetryCounts[config.username]++;
        
        const retryDelay = randomDelay(RETRY_DELAY - 10000, RETRY_DELAY + 10000);
        
        if (bot.showConsole && shouldShowMessage(bot.username, 'retry')) {
            console.log(`🔄 [${config.username}] Retry ${botRetryCounts[config.username]}/${MAX_RETRIES} in ${Math.round(retryDelay/1000)}s`);
        }
        
        setTimeout(() => {
            createBot(config, index);
        }, retryDelay);
    } else if (bot.showConsole) {
        console.log(`💀 [${config.username}] Max retries reached`);
    }
}

// ==================== STARTUP ====================

function startAllBots() {
    console.clear();
    console.log('═'.repeat(60));
    console.log('🕵️ STEALTH MINECRAFT BOT SYSTEM');
    console.log('═'.repeat(60));
    console.log('📡 Server: Ultimis.net:25565');
    console.log('🎮 Version: 1.12.2');
    console.log('🕶️ Mode: HUMAN EMULATION - Anti-Detection');
    console.log('🤖 Bots: 5');
    console.log('─'.repeat(60));
    console.log('📋 Stealth Features:');
    console.log('   • Random connection delays (looks like humans)');
    console.log('   • Human-like typing speed');
    console.log('   • Random head movements and looking around');
    console.log('   • Spoofed client brands (Vanilla/Forge/Lunar)');
    console.log('   • Randomized movement patterns');
    console.log('   • Natural reaction times');
    console.log('   • AFK simulation');
    console.log('   • Random delays between actions');
    console.log('═'.repeat(60));
    console.log('');
    
    BOT_CONFIGS.forEach(config => {
        botRetryCounts[config.username] = 0;
    });
    
    botSpawnCount = 0;
    botReadyCount = 0;
    
    // Start bots with random delays
    let cumulativeDelay = 0;
    BOT_CONFIGS.forEach((config, index) => {
        const randomStartDelay = randomDelay(5000, 15000);
        cumulativeDelay += randomStartDelay;
        
        setTimeout(() => {
            console.log(`\n🤖 Starting bot: ${config.username}`);
            createBot(config, index);
        }, cumulativeDelay);
    });
}

// ==================== START ====================
startAllBots();