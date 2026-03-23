const mineflayer = require('mineflayer');

// Bot Configuration
const BOT_CONFIG = {
    username: 'kevin911',
    password: 'asdfghjkl1',
    host: 'Ultimis.net',
    port: 25565,
    version: '1.12.2',
    auth: 'microsoft' // Changed from 'offline' - try microsoft auth first
};

const TRIGGER_PLAYER = 'SIGMAxox';
const TRIGGER_MESSAGE = 'partycomehereplzman';
const MAX_RETRIES = 5; // Reduced retries
const RETRY_DELAY = 30000; // Increased to 30 seconds
const SPAWN_WAIT = 5000; // Wait 5 seconds after spawn

let bot;
let currentRetry = 0;
let isRegistered = false;
let hasJoinedLifesteal = false;
let isReconnecting = false;

// Utility function to wait
function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Utility function to send chat message (FIXED)
async function sendChat(message) {
    try {
        if (bot && bot._client && bot._client.write) {
            // Use the proper packet method for 1.12.2
            bot._client.write('chat', { message: message });
            console.log(`[BOT] Sent: ${message}`);
        } else if (bot && bot.chat) {
            bot.chat(message);
            console.log(`[BOT] Sent: ${message}`);
        } else {
            console.log(`[BOT ERROR] Cannot send message: bot not ready`);
        }
        await wait(1500); // Increased delay between messages
    } catch (error) {
        console.log(`[CHAT ERROR] ${error.message}`);
    }
}

// Function to create bot
function createBot() {
    if (isReconnecting) {
        console.log('[WARNING] Already reconnecting, skipping...');
        return;
    }
    
    isReconnecting = true;
    console.log(`[CONNECTION] Attempt ${currentRetry + 1}/${MAX_RETRIES}`);
    
    try {
        bot = mineflayer.createBot(BOT_CONFIG);
    } catch (error) {
        console.log(`[CREATE ERROR] ${error.message}`);
        isReconnecting = false;
        handleDisconnect();
        return;
    }

    // Event: Bot spawned
    bot.once('spawn', async () => {
        console.log('[SUCCESS] Bot spawned in server!');
        console.log(`[INFO] Bot position: ${bot.entity.position}`);
        currentRetry = 0; // Reset retry counter on success
        isReconnecting = false;
        
        // Wait longer for server to fully load
        console.log(`[WAIT] Waiting ${SPAWN_WAIT/1000} seconds for server to load...`);
        await wait(SPAWN_WAIT);
        
        // Start the main flow
        await mainFlow();
    });

    // Event: Chat message
    bot.on('message', async (message) => {
        const msg = message.toString();
        console.log(`[CHAT] ${msg}`);

        // Check for register prompt
        if (msg.toLowerCase().includes('register') && msg.toLowerCase().includes('password')) {
            if (!isRegistered) {
                console.log('[AUTH] Registration required');
                await wait(2000);
                await sendChat(`/register ${BOT_CONFIG.password} ${BOT_CONFIG.password}`);
                isRegistered = true;
                await wait(3000);
            }
        }

        // Check for login prompt
        if (msg.toLowerCase().includes('login') && msg.toLowerCase().includes('password')) {
            console.log('[AUTH] Login required');
            await wait(2000);
            await sendChat(`/login ${BOT_CONFIG.password}`);
            await wait(3000);
        }

        // Check if successfully logged in
        if (msg.toLowerCase().includes('successfully') && 
            (msg.toLowerCase().includes('registered') || msg.toLowerCase().includes('logged'))) {
            console.log('[AUTH] Authentication successful!');
            await wait(2000);
        }

        // Check for trigger message from specific player
        if (msg.includes(TRIGGER_MESSAGE) && msg.includes(TRIGGER_PLAYER)) {
            console.log(`[TRIGGER] Detected trigger message from ${TRIGGER_PLAYER}!`);
            await wait(1000);
            await sendChat(`/tpa ${TRIGGER_PLAYER}`);
            console.log(`[TPA] Sent teleport request to ${TRIGGER_PLAYER}`);
        }
    });

    // Event: Kicked from server
    bot.on('kicked', (reason) => {
        console.log(`[KICKED] ${reason}`);
        isReconnecting = false;
        
        // Check if it's a rate limit kick
        const reasonStr = JSON.stringify(reason);
        if (reasonStr.includes('too fast')) {
            console.log('[WARNING] Rate limited! Increasing retry delay...');
            handleDisconnect(60000); // Wait 1 minute
        } else if (reasonStr.includes('VPN') || reasonStr.includes('proxy')) {
            console.log('[ERROR] VPN/Proxy detected! Cannot connect from this IP.');
            console.log('[SOLUTION] Try running from a different network or disable VPN');
            process.exit(1);
        } else if (reasonStr.includes('not logged into your Minecraft account')) {
            console.log('[ERROR] Authentication failed - trying offline mode');
            BOT_CONFIG.auth = 'offline';
            handleDisconnect(15000);
        } else {
            handleDisconnect();
        }
    });

    // Event: Error
    bot.on('error', (err) => {
        console.log(`[ERROR] ${err.message}`);
        isReconnecting = false;
    });

    // Event: End (disconnected)
    bot.on('end', () => {
        console.log('[DISCONNECTED] Bot disconnected from server');
        isReconnecting = false;
        handleDisconnect();
    });
}

// Main flow after spawning
async function mainFlow() {
    try {
        console.log('[FLOW] Starting main flow...');
        
        // Step 1: Move a bit
        console.log('[FLOW] Step 1: Moving around...');
        await moveAround();
        await wait(3000);

        // Step 2: Open compass (Games Selector)
        console.log('[FLOW] Step 2: Looking for compass...');
        await openCompass();
        await wait(4000);

        // Step 3: Click on Lifesteal (Red Dye/Poppy)
        console.log('[FLOW] Step 3: Selecting Lifesteal game...');
        await selectLifesteal();
        await wait(7000); // Wait longer for teleport

        // Step 4: Move a bit after joining
        console.log('[FLOW] Step 4: Moving in Lifesteal...');
        await moveAround();
        await wait(3000);

        // Step 5: Send /afk command
        console.log('[FLOW] Step 5: Sending /afk...');
        await sendChat('/afk');
        await wait(2000);

        // Step 6: Move head and body
        console.log('[FLOW] Step 6: Moving head and body...');
        await moveHeadAndBody();
        await wait(2000);

        console.log('[FLOW] ✅ All steps completed! Now waiting for trigger...');
        console.log(`[TRIGGER] Listening for "${TRIGGER_MESSAGE}" from ${TRIGGER_PLAYER}`);
        hasJoinedLifesteal = true;

        // Keep bot active with periodic movements
        startAntiAFK();

    } catch (error) {
        console.log(`[FLOW ERROR] ${error.message}`);
        console.log('[FLOW] Continuing anyway...');
    }
}

// Anti-AFK system
function startAntiAFK() {
    console.log('[ANTI-AFK] Starting anti-AFK system...');
    setInterval(async () => {
        if (bot && bot.entity) {
            try {
                // Random small movements
                const movements = ['forward', 'back', 'left', 'right'];
                const randomMove = movements[Math.floor(Math.random() * movements.length)];
                
                bot.setControlState(randomMove, true);
                await wait(200);
                bot.setControlState(randomMove, false);
                
                // Random look direction
                bot.look(bot.entity.yaw + (Math.random() - 0.5), 0, true);
                
                console.log('[ANTI-AFK] Movement executed');
            } catch (error) {
                console.log(`[ANTI-AFK ERROR] ${error.message}`);
            }
        }
    }, 60000); // Every minute
}

// Function to move around
async function moveAround() {
    try {
        bot.setControlState('forward', true);
        await wait(700);
        bot.setControlState('forward', false);
        await wait(300);
        
        bot.setControlState('right', true);
        await wait(500);
        bot.setControlState('right', false);
        await wait(300);
        
        bot.setControlState('back', true);
        await wait(600);
        bot.setControlState('back', false);
    } catch (error) {
        console.log(`[MOVE ERROR] ${error.message}`);
    }
}

// Function to move head and look around
async function moveHeadAndBody() {
    try {
        // Look left
        bot.look(bot.entity.yaw + Math.PI / 2, 0, true);
        await wait(800);
        
        // Look right
        bot.look(bot.entity.yaw - Math.PI / 2, 0, true);
        await wait(800);
        
        // Look up
        bot.look(bot.entity.yaw, -Math.PI / 4, true);
        await wait(500);
        
        // Look down
        bot.look(bot.entity.yaw, Math.PI / 4, true);
        await wait(500);
        
        // Move a bit
        bot.setControlState('forward', true);
        await wait(500);
        bot.setControlState('forward', false);
    } catch (error) {
        console.log(`[HEAD MOVE ERROR] ${error.message}`);
    }
}

// Function to open compass (right-click)
async function openCompass() {
    try {
        console.log('[COMPASS] Searching inventory...');
        
        // List all items in inventory
        const items = bot.inventory.items();
        console.log(`[COMPASS] Inventory items: ${items.map(i => i.name).join(', ')}`);
        
        // Find compass in inventory
        const compass = items.find(item => 
            item.name === 'compass' || 
            item.name === 'minecraft:compass' ||
            item.displayName?.toLowerCase().includes('compass')
        );

        if (compass) {
            console.log(`[COMPASS] Found compass: ${compass.name} in slot ${compass.slot}`);
            await bot.equip(compass, 'hand');
            await wait(1000);
            
            // Try to activate/use the compass
            bot.activateItem();
            console.log('[COMPASS] Activated compass (right-click)');
            await wait(2000);
        } else {
            console.log('[COMPASS] ⚠️ Compass not found in inventory');
            console.log('[COMPASS] Trying to use hotbar slot 0...');
            // Try slot 0 (first hotbar slot)
            bot.setQuickBarSlot(0);
            await wait(500);
            bot.activateItem();
        }
    } catch (error) {
        console.log(`[COMPASS ERROR] ${error.message}`);
    }
}

// Function to select Lifesteal from GUI
async function selectLifesteal() {
    try {
        // Wait for window to open
        await wait(2000);
        
        const window = bot.currentWindow;
        if (window) {
            console.log(`[GUI] Window opened: ${window.title || 'Unknown'}`);
            console.log(`[GUI] Window type: ${window.type}`);
            console.log(`[GUI] Total slots: ${window.slots.length}`);
            
            // Log all items in window
            window.slots.forEach((item, index) => {
                if (item) {
                    console.log(`[GUI] Slot ${index}: ${item.name} (${item.displayName || 'no display name'})`);
                }
            });
            
            // Look for Lifesteal item - try multiple patterns
            const lifestealItem = window.slots.find(item => 
                item && (
                    item.name.includes('dye') ||
                    item.name.includes('poppy') ||
                    item.name.includes('rose') ||
                    item.name.includes('red') ||
                    item.displayName?.toLowerCase().includes('lifesteal') ||
                    item.displayName?.toLowerCase().includes('life')
                )
            );

            if (lifestealItem) {
                console.log(`[GUI] ✅ Found Lifesteal item: ${lifestealItem.name} in slot ${lifestealItem.slot}`);
                await bot.clickWindow(lifestealItem.slot, 0, 0);
                await wait(1000);
                bot.closeWindow(window);
                console.log('[GUI] Clicked Lifesteal item!');
            } else {
                console.log('[GUI] ⚠️ Could not find Lifesteal item by name');
                console.log('[GUI] Trying slot 13 (center slot)...');
                // Try clicking center slot
                await bot.clickWindow(13, 0, 0);
                await wait(1000);
                bot.closeWindow(window);
                console.log('[GUI] Clicked center slot (13)');
            }
        } else {
            console.log('[GUI] ⚠️ No window opened - compass might not have worked');
        }
    } catch (error) {
        console.log(`[GUI ERROR] ${error.message}`);
    }
}

// Handle disconnect and retry
function handleDisconnect(customDelay = null) {
    hasJoinedLifesteal = false;
    
    const delay = customDelay || RETRY_DELAY;
    
    if (currentRetry < MAX_RETRIES) {
        currentRetry++;
        console.log(`[RETRY] Waiting ${delay/1000} seconds before retry ${currentRetry}/${MAX_RETRIES}...`);
        setTimeout(() => {
            createBot();
        }, delay);
    } else {
        console.log(`[FAILED] ❌ Max retries (${MAX_RETRIES}) reached.`);
        console.log('[INFO] Possible issues:');
        console.log('  1. VPN/Proxy detected by server');
        console.log('  2. Rate limiting (too many connections)');
        console.log('  3. Authentication issues');
        console.log('  4. Server is down or not accepting connections');
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n[SHUTDOWN] Received SIGINT, closing bot...');
    if (bot) {
        bot.quit();
    }
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n[SHUTDOWN] Received SIGTERM, closing bot...');
    if (bot) {
        bot.quit();
    }
    process.exit(0);
});

// Start the bot
console.log('='.repeat(60));
console.log('🤖 Starting Minecraft Bot: kevin911');
console.log('📡 Server: Ultimis.net:25565');
console.log('🎮 Version: 1.12.2');
console.log('👤 Trigger Player: ' + TRIGGER_PLAYER);
console.log('💬 Trigger Message: ' + TRIGGER_MESSAGE);
console.log('='.repeat(60));
console.log('');

createBot();
