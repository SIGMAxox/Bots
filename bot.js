const mineflayer = require('mineflayer');

// Bot Configuration
const BOT_CONFIG = {
    username: 'kevin911',
    password: 'asdfghjkl1',
    host: 'Ultimis.net',
    port: 25565,
    version: '1.12.2',
    auth: 'offline', // cracked server
    
    // Anti-bot detection settings
    hideErrors: true,
    checkTimeoutInterval: 60000,
    
    // Simulate higher ping (looks more human)
    // This doesn't actually change ping, but affects bot behavior timing
};

const TRIGGER_PLAYER = 'SIGMAxox';
const TRIGGER_MESSAGE = 'partycomehereplzman';
const MAX_RETRIES = 10;
const RETRY_DELAY = 10000; // 10 seconds

// Human-like behavior settings
const HUMAN_DELAYS = {
    MIN_REACTION: 150,      // Minimum reaction time (ms)
    MAX_REACTION: 400,      // Maximum reaction time (ms)
    MIN_TYPING: 80,         // Min delay between keystrokes
    MAX_TYPING: 250,        // Max delay between keystrokes
    MIN_ACTION: 500,        // Min delay between actions
    MAX_ACTION: 2000,       // Max delay between actions
    MIN_MOVEMENT: 200,      // Min movement duration
    MAX_MOVEMENT: 800,      // Max movement duration
};

let bot;
let currentRetry = 0;
let isRegistered = false;
let hasJoinedLifesteal = false;

// Utility function to wait
function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Get random delay to simulate human reaction time
function randomDelay(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Wait with random human-like delay
async function humanWait(baseTime = 0) {
    const delay = baseTime + randomDelay(HUMAN_DELAYS.MIN_REACTION, HUMAN_DELAYS.MAX_REACTION);
    await wait(delay);
}

// Simulate typing a message character by character
async function typeMessage(message) {
    const chars = message.split('');
    let typed = '';
    
    for (const char of chars) {
        typed += char;
        await wait(randomDelay(HUMAN_DELAYS.MIN_TYPING, HUMAN_DELAYS.MAX_TYPING));
    }
    
    return typed;
}

// Utility function to send chat message with typing simulation
async function sendChat(message) {
    // Simulate thinking/reading time before typing
    await humanWait(randomDelay(200, 600));
    
    // Simulate typing
    await typeMessage(message);
    
    // Small delay before sending (like pressing Enter)
    await humanWait(100);
    
    bot.chat(message);
    console.log(`[BOT] Sent: ${message}`);
    
    // Small delay after sending
    await humanWait(randomDelay(300, 800));
}

// Function to create bot
function createBot() {
    console.log(`[CONNECTION] Attempt ${currentRetry + 1}/${MAX_RETRIES}`);
    
    bot = mineflayer.createBot(BOT_CONFIG);

    // Event: Bot spawned
    bot.once('spawn', async () => {
        console.log('[SUCCESS] Bot spawned in server!');
        currentRetry = 0; // Reset retry counter on success
        
        // Simulate initial orientation/loading time (like a real player)
        console.log('[SPAWN] Orienting and loading world...');
        await humanWait(randomDelay(2000, 4000));
        
        // Look around initially (like a player checking their surroundings)
        await lookAround();
        await humanWait(randomDelay(1000, 2000));
        
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
            
            // Human reaction time to read the message
            await humanWait(randomDelay(1000, 2000));
            
            await sendChat(`/register ${BOT_CONFIG.password} ${BOT_CONFIG.password}`);
            isRegistered = true;
            
            // Wait after registering
            await humanWait(randomDelay(1500, 2500));
        }

        // Check for login prompt
        if (msg.includes('login') && msg.toLowerCase().includes('password')) {
            console.log('[AUTH] Login required');
            
            // Human reaction time to read the message
            await humanWait(randomDelay(800, 1500));
            
            await sendChat(`/login ${BOT_CONFIG.password}`);
            
            // Wait after logging in
            await humanWait(randomDelay(1500, 2500));
        }

        // Check for trigger message from specific player
        if (msg.includes(TRIGGER_MESSAGE) && msg.includes(TRIGGER_PLAYER)) {
            console.log(`[TRIGGER] Detected trigger message from ${TRIGGER_PLAYER}!`);
            
            // Human reaction time (reading and understanding the message)
            await humanWait(randomDelay(1000, 2500));
            
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
        console.log('[FLOW] Starting main flow with human-like behavior...');
        
        // Step 1: Wait and look around (like a real player orienting themselves)
        console.log('[FLOW] Step 1: Looking around...');
        await humanWait(randomDelay(1000, 2000));
        await lookAround();
        await humanWait(randomDelay(500, 1000));
        
        // Step 2: Move a bit
        console.log('[FLOW] Step 2: Moving around...');
        await moveAround();
        await humanWait(randomDelay(1000, 2000));

        // Step 3: Open compass (Games Selector)
        console.log('[FLOW] Step 3: Looking for compass...');
        await humanWait(randomDelay(800, 1500));
        await openCompass();
        await humanWait(randomDelay(2000, 4000));

        // Step 4: Click on Lifesteal (Red Dye/Poppy)
        console.log('[FLOW] Step 4: Selecting Lifesteal game...');
        await humanWait(randomDelay(500, 1200));
        await selectLifesteal();
        await humanWait(randomDelay(4000, 6000)); // Wait for teleport

        // Step 5: Look around after teleport (like adjusting to new area)
        console.log('[FLOW] Step 5: Adjusting to new location...');
        await lookAround();
        await humanWait(randomDelay(800, 1500));

        // Step 6: Move a bit after joining
        console.log('[FLOW] Step 6: Moving in Lifesteal...');
        await moveAround();
        await humanWait(randomDelay(1000, 2000));

        // Step 7: Send /afk command
        console.log('[FLOW] Step 7: Sending /afk...');
        await humanWait(randomDelay(500, 1000));
        await sendChat('/afk');
        await humanWait(randomDelay(800, 1500));

        // Step 8: Move head and body
        console.log('[FLOW] Step 8: Moving head and body...');
        await moveHeadAndBody();
        await humanWait(randomDelay(500, 1000));

        console.log('[FLOW] All steps completed! Now waiting for trigger...');
        hasJoinedLifesteal = true;

    } catch (error) {
        console.log(`[FLOW ERROR] ${error.message}`);
    }
}

// Function to look around (human-like head movement)
async function lookAround() {
    const lookCount = randomDelay(2, 4); // Look in 2-4 random directions
    
    for (let i = 0; i < lookCount; i++) {
        // Random yaw (horizontal) and pitch (vertical)
        const randomYaw = (Math.random() * Math.PI * 2) - Math.PI; // -π to π
        const randomPitch = (Math.random() * 0.5) - 0.25; // -0.25 to 0.25
        
        // Simulate gradual head turn (not instant)
        const steps = randomDelay(3, 8);
        const startYaw = bot.entity.yaw;
        const startPitch = bot.entity.pitch;
        
        for (let step = 0; step <= steps; step++) {
            const progress = step / steps;
            const currentYaw = startYaw + (randomYaw - startYaw) * progress;
            const currentPitch = startPitch + (randomPitch - startPitch) * progress;
            
            bot.look(currentYaw, currentPitch, false);
            await wait(randomDelay(30, 80));
        }
        
        await humanWait(randomDelay(200, 600));
    }
}

// Function to move around with human-like imperfections
async function moveAround() {
    const movements = [
        { control: 'forward', min: 300, max: 800 },
        { control: 'back', min: 200, max: 500 },
        { control: 'left', min: 200, max: 600 },
        { control: 'right', min: 200, max: 600 }
    ];
    
    // Do 2-4 random movements
    const moveCount = randomDelay(2, 4);
    
    for (let i = 0; i < moveCount; i++) {
        const movement = movements[Math.floor(Math.random() * movements.length)];
        const duration = randomDelay(movement.min, movement.max);
        
        // Start movement
        bot.setControlState(movement.control, true);
        
        // Add some jitter during movement (not constant speed)
        const jitterSteps = Math.floor(duration / 100);
        for (let j = 0; j < jitterSteps; j++) {
            await wait(randomDelay(80, 120));
            // Randomly release and press again (simulates hand shakiness)
            if (Math.random() > 0.7) {
                bot.setControlState(movement.control, false);
                await wait(randomDelay(20, 60));
                bot.setControlState(movement.control, true);
            }
        }
        
        // Stop movement
        bot.setControlState(movement.control, false);
        
        // Random pause between movements
        await humanWait(randomDelay(HUMAN_DELAYS.MIN_ACTION, HUMAN_DELAYS.MAX_ACTION));
    }
}

// Function to move head and look around
async function moveHeadAndBody() {
    // Look around while moving
    await lookAround();
    await humanWait(randomDelay(300, 700));
    
    // Do a small movement
    const direction = ['forward', 'back', 'left', 'right'][Math.floor(Math.random() * 4)];
    bot.setControlState(direction, true);
    await wait(randomDelay(200, 500));
    bot.setControlState(direction, false);
    
    await humanWait(randomDelay(300, 600));
}

// Function to open compass (right-click) with human-like delay
async function openCompass() {
    try {
        // Find compass in inventory
        const compass = bot.inventory.items().find(item => 
            item.name === 'compass' || 
            item.name === 'minecraft:compass'
        );

        if (compass) {
            console.log('[COMPASS] Found compass! Equipping and using...');
            
            // Human-like delay before equipping
            await humanWait(randomDelay(300, 800));
            
            await bot.equip(compass, 'hand');
            
            // Delay before clicking (like moving mouse to item)
            await humanWait(randomDelay(400, 900));
            
            bot.activateItem(); // Right-click
            
            // Wait for GUI to open
            await humanWait(randomDelay(800, 1500));
        } else {
            console.log('[COMPASS] Compass not found in inventory');
        }
    } catch (error) {
        console.log(`[COMPASS ERROR] ${error.message}`);
    }
}

// Function to select Lifesteal from GUI with human-like cursor movement
async function selectLifesteal() {
    try {
        // Wait for window to open (human reaction time)
        await humanWait(randomDelay(800, 1500));
        
        const window = bot.currentWindow;
        if (window) {
            console.log('[GUI] Window opened, looking for Lifesteal item...');
            
            // Simulate reading the GUI options
            await humanWait(randomDelay(1000, 2000));
            
            // Look for red dye, poppy, or red rose
            const lifestealItem = window.slots.find(item => 
                item && (
                    item.name.includes('dye') ||
                    item.name.includes('poppy') ||
                    item.name.includes('rose') ||
                    item.name.includes('red') ||
                    item.displayName?.toLowerCase().includes('lifesteal')
                )
            );

            if (lifestealItem) {
                console.log(`[GUI] Found Lifesteal item: ${lifestealItem.name}`);
                
                // Simulate mouse movement delay to the item
                await humanWait(randomDelay(400, 1000));
                
                await bot.clickWindow(lifestealItem.slot, 0, 0);
                
                // Small delay before closing (like waiting for click to register)
                await humanWait(randomDelay(200, 500));
                
                bot.closeWindow(window);
                console.log('[GUI] Clicked Lifesteal item!');
            } else {
                console.log('[GUI] Could not find Lifesteal item, trying slot 13 (center)...');
                
                // Delay before clicking unknown item
                await humanWait(randomDelay(500, 1000));
                
                // Try clicking center slot (usually where main items are)
                await bot.clickWindow(13, 0, 0);
                
                await humanWait(randomDelay(200, 500));
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
