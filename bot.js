const mineflayer = require('mineflayer');

// Bot Configuration
const BOT_CONFIG = {
    username: 'kevin911',
    password: 'asdfghjkl1',
    host: 'Ultimis.net',
    port: 25565,
    version: '1.12.2',
    auth: 'offline' // cracked server
};

const TRIGGER_PLAYER = 'SIGMAxox';
const TRIGGER_MESSAGE = 'partycomehereplzman';
const MAX_RETRIES = 10;
const RETRY_DELAY = 10000; // 10 seconds

let bot;
let currentRetry = 0;
let isRegistered = false;
let hasJoinedLifesteal = false;

// Utility function to wait
function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Utility function to send chat message
async function sendChat(message) {
    bot.chat(message);
    console.log(`[BOT] Sent: ${message}`);
    await wait(1000);
}

// Function to create bot
function createBot() {
    console.log(`[CONNECTION] Attempt ${currentRetry + 1}/${MAX_RETRIES}`);
    
    bot = mineflayer.createBot(BOT_CONFIG);

    // Event: Bot spawned
    bot.once('spawn', async () => {
        console.log('[SUCCESS] Bot spawned in server!');
        currentRetry = 0; // Reset retry counter on success
        
        // Wait a bit for server to load
        await wait(3000);
        
        // Start the main flow
        await mainFlow();
    });

    // Event: Chat message
    bot.on('message', async (message) => {
        const msg = message.toString();
        console.log(`[CHAT] ${msg}`);

        // Check for register prompt
        if (msg.includes('register') && msg.toLowerCase().includes('password')) {
            console.log('[AUTH] Registration required');
            await wait(1000);
            await sendChat(`/register ${BOT_CONFIG.password} ${BOT_CONFIG.password}`);
            isRegistered = true;
            await wait(2000);
        }

        // Check for login prompt
        if (msg.includes('login') && msg.toLowerCase().includes('password')) {
            console.log('[AUTH] Login required');
            await wait(1000);
            await sendChat(`/login ${BOT_CONFIG.password}`);
            await wait(2000);
        }

        // Check for trigger message from specific player
        if (msg.includes(TRIGGER_MESSAGE) && msg.includes(TRIGGER_PLAYER)) {
            console.log(`[TRIGGER] Detected trigger message from ${TRIGGER_PLAYER}!`);
            await wait(500);
            await sendChat(`/tpa ${TRIGGER_PLAYER}`);
            console.log(`[TPA] Sent teleport request to ${TRIGGER_PLAYER}`);
        }
    });

    // Event: Kicked from server
    bot.on('kicked', (reason) => {
        console.log(`[KICKED] ${reason}`);
        handleDisconnect();
    });

    // Event: Error
    bot.on('error', (err) => {
        console.log(`[ERROR] ${err.message}`);
    });

    // Event: End (disconnected)
    bot.on('end', () => {
        console.log('[DISCONNECTED] Bot disconnected from server');
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
        await wait(2000);

        // Step 2: Open compass (Games Selector)
        console.log('[FLOW] Step 2: Looking for compass...');
        await openCompass();
        await wait(3000);

        // Step 3: Click on Lifesteal (Red Dye/Poppy)
        console.log('[FLOW] Step 3: Selecting Lifesteal game...');
        await selectLifesteal();
        await wait(5000); // Wait for teleport

        // Step 4: Move a bit after joining
        console.log('[FLOW] Step 4: Moving in Lifesteal...');
        await moveAround();
        await wait(2000);

        // Step 5: Send /afk command
        console.log('[FLOW] Step 5: Sending /afk...');
        await sendChat('/afk');
        await wait(1000);

        // Step 6: Move head and body
        console.log('[FLOW] Step 6: Moving head and body...');
        await moveHeadAndBody();
        await wait(1000);

        console.log('[FLOW] All steps completed! Now waiting for trigger...');
        hasJoinedLifesteal = true;

    } catch (error) {
        console.log(`[FLOW ERROR] ${error.message}`);
    }
}

// Function to move around
async function moveAround() {
    bot.setControlState('forward', true);
    await wait(500);
    bot.setControlState('forward', false);
    
    bot.setControlState('right', true);
    await wait(300);
    bot.setControlState('right', false);
    
    bot.setControlState('back', true);
    await wait(400);
    bot.setControlState('back', false);
}

// Function to move head and look around
async function moveHeadAndBody() {
    // Look left
    bot.look(bot.entity.yaw + Math.PI / 2, 0, true);
    await wait(500);
    
    // Look right
    bot.look(bot.entity.yaw - Math.PI / 2, 0, true);
    await wait(500);
    
    // Move a bit
    bot.setControlState('forward', true);
    await wait(300);
    bot.setControlState('forward', false);
}

// Function to open compass (right-click)
async function openCompass() {
    try {
        // Find compass in inventory
        const compass = bot.inventory.items().find(item => 
            item.name === 'compass' || 
            item.name === 'minecraft:compass'
        );

        if (compass) {
            console.log('[COMPASS] Found compass! Equipping and using...');
            await bot.equip(compass, 'hand');
            await wait(500);
            bot.activateItem(); // Right-click
            await wait(1000);
        } else {
            console.log('[COMPASS] Compass not found in inventory');
        }
    } catch (error) {
        console.log(`[COMPASS ERROR] ${error.message}`);
    }
}

// Function to select Lifesteal from GUI
async function selectLifesteal() {
    try {
        // Wait for window to open
        await wait(1500);
        
        const window = bot.currentWindow;
        if (window) {
            console.log('[GUI] Window opened, looking for Lifesteal item...');
            
            // Look for red dye, poppy, or red rose
            const lifestealItem = window.slots.find(item => 
                item && (
                    item.name.includes('dye') ||
                    item.name.includes('poppy') ||
                    item.name.includes('rose') ||
                    item.name.includes('red')
                )
            );

            if (lifestealItem) {
                console.log(`[GUI] Found Lifesteal item: ${lifestealItem.name}`);
                await bot.clickWindow(lifestealItem.slot, 0, 0);
                await wait(500);
                bot.closeWindow(window);
                console.log('[GUI] Clicked Lifesteal item!');
            } else {
                console.log('[GUI] Could not find Lifesteal item, trying slot 13 (center)...');
                // Try clicking center slot (usually where main items are)
                await bot.clickWindow(13, 0, 0);
                await wait(500);
                bot.closeWindow(window);
            }
        } else {
            console.log('[GUI] No window opened');
        }
    } catch (error) {
        console.log(`[GUI ERROR] ${error.message}`);
    }
}

// Handle disconnect and retry
function handleDisconnect() {
    hasJoinedLifesteal = false;
    
    if (currentRetry < MAX_RETRIES) {
        currentRetry++;
        console.log(`[RETRY] Waiting ${RETRY_DELAY/1000} seconds before retry...`);
        setTimeout(() => {
            createBot();
        }, RETRY_DELAY);
    } else {
        console.log(`[FAILED] Max retries (${MAX_RETRIES}) reached. Exiting...`);
        process.exit(1);
    }
}

// Start the bot
console.log('='.repeat(50));
console.log('Starting Minecraft Bot: kevin911');
console.log('Server: Ultimis.net');
console.log('Version: 1.12.2');
console.log('='.repeat(50));
createBot();
