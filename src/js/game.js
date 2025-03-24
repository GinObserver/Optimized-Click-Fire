// ===== GAME SETUP AND CONSTANTS =====
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const fpsElement = document.getElementById('fps');

// Game configuration
const CONFIG = {
    TARGET_FPS: 60,
    FRAME_TIME: 1000 / 60,
    GRID_CELL_SIZE: 100,
    TARGET_SPAWN_INTERVAL: 200,
    TARGET_MAX_LIFESPAN: 8000,
    TARGET_FADE_START_PERCENT: 0.75,
    PROJECTILE_SPEED: 5,
    PROJECTILE_RADIUS: 5,
    INITIAL_POOL_SIZE: 20,
    TARGET_MIN_SIZE: 10,
    TARGET_SIZE_VARIATION: 20
};

// Game state variables
let gameRunning = true;
let score = 0;
let lastUpdateTime = 0;
let frameCount = 0;
let lastFpsUpdateTime = 0;
let currentFps = 0;

// Game objects
const player = {
    x: canvas.width / 2,
    y: canvas.height - 50,
    size: 30,
    color: 'blue'
};

// Arrays and pools
let projectiles = [];
let targets = [];
let projectilePool = [];
let targetPool = [];

// Spatial grid for collision detection
const grid = {};

// ===== INITIALIZATION FUNCTIONS =====

/**
 * Initialize object pools with pre-created objects
 */
function initializePools() {
    // Initialize projectile pool
    for (let i = 0; i < CONFIG.INITIAL_POOL_SIZE; i++) {
        projectilePool.push({
            x: 0,
            y: 0,
            radius: CONFIG.PROJECTILE_RADIUS,
            color: 'red',
            velocity: { x: 0, y: 0 }
        });
    }

    // Initialize target pool
    for (let i = 0; i < CONFIG.INITIAL_POOL_SIZE; i++) {
        targetPool.push({
            x: 0,
            y: 0,
            radius: 0,
            color: 'green',
            creationTime: 0,
            currentOpacity: 1
        });
    }
}

// ===== OBJECT CREATION FUNCTIONS =====

/**
 * Creates or reuses a projectile
 */
function createProjectile(clickX, clickY) {
    const angleToTarget = Math.atan2(clickY - player.y, clickX - player.x);
    const velocityX = Math.cos(angleToTarget) * CONFIG.PROJECTILE_SPEED;
    const velocityY = Math.sin(angleToTarget) * CONFIG.PROJECTILE_SPEED;
    
    let projectile;
    
    if (projectilePool.length > 0) {
        projectile = projectilePool.pop();
        projectile.x = player.x;
        projectile.y = player.y;
        projectile.velocity.x = velocityX;
        projectile.velocity.y = velocityY;
    } else {
        projectile = {
            x: player.x,
            y: player.y,
            radius: CONFIG.PROJECTILE_RADIUS,
            color: 'red',
            velocity: { x: velocityX, y: velocityY }
        };
    }
    
    projectiles.push(projectile);
}

/**
 * Creates or reuses a target
 */
function createTarget() {
    let target;
    
    if (targetPool.length > 0) {
        target = targetPool.pop();
    } else {
        target = {
            color: 'green',
            currentOpacity: 1
        };
    }
    
    const radius = Math.random() * CONFIG.TARGET_SIZE_VARIATION + CONFIG.TARGET_MIN_SIZE;
    target.x = Math.random() * (canvas.width - radius * 2) + radius;
    target.y = Math.random() * (canvas.height / 2) + radius;
    target.radius = radius;
    target.creationTime = Date.now();
    target.currentOpacity = 1;
    
    targets.push(target);
}

// ===== SPATIAL PARTITIONING FUNCTIONS =====

/**
 * Clears and rebuilds the spatial grid
 */
function buildSpatialGrid() {
    // Clear existing grid
    for (let key in grid) delete grid[key];
    
    // Add targets to grid
    targets.forEach((target, index) => {
        const cellX = Math.floor(target.x / CONFIG.GRID_CELL_SIZE);
        const cellY = Math.floor(target.y / CONFIG.GRID_CELL_SIZE);
        const cellKey = `${cellX},${cellY}`;
        
        if (!grid[cellKey]) grid[cellKey] = [];
        grid[cellKey].push({ obj: target, index });
    });
}

/**
 * Checks collisions using spatial partitioning
 */
function checkCollisionsWithGrid() {
    for (let i = projectiles.length - 1; i >= 0; i--) {
        const projectile = projectiles[i];
        const cellX = Math.floor(projectile.x / CONFIG.GRID_CELL_SIZE);
        const cellY = Math.floor(projectile.y / CONFIG.GRID_CELL_SIZE);
        
        let hitSomething = false;
        
        // Check surrounding cells
        for (let offsetX = -1; offsetX <= 1 && !hitSomething; offsetX++) {
            for (let offsetY = -1; offsetY <= 1 && !hitSomething; offsetY++) {
                const checkKey = `${cellX + offsetX},${cellY + offsetY}`;
                
                if (grid[checkKey]) {
                    for (let j = grid[checkKey].length - 1; j >= 0; j--) {
                        const targetData = grid[checkKey][j];
                        const target = targetData.obj;
                        
                        const distance = Math.hypot(
                            projectile.x - target.x,
                            projectile.y - target.y
                        );
                        
                        if (distance < projectile.radius + target.radius) {
                            // Handle collision
                            targetPool.push(target);
                            targets.splice(targetData.index, 1);
                            
                            projectilePool.push(projectile);
                            projectiles.splice(i, 1);
                            
                            score += 10;
                            scoreElement.textContent = `Score: ${score}`;
                            
                            hitSomething = true;
                            break;
                        }
                    }
                }
            }
        }
    }
}

// ===== UPDATE FUNCTIONS =====

/**
 * Updates target lifespans and opacity
 */
function updateTargets() {
    const currentTime = Date.now();
    
    for (let i = targets.length - 1; i >= 0; i--) {
        const target = targets[i];
        const targetAge = currentTime - target.creationTime;
        
        if (targetAge >= CONFIG.TARGET_MAX_LIFESPAN) {
            targetPool.push(target);
            targets.splice(i, 1);
        } else if (targetAge > CONFIG.TARGET_MAX_LIFESPAN * CONFIG.TARGET_FADE_START_PERCENT) {
            const fadeTimeTotal = CONFIG.TARGET_MAX_LIFESPAN * (1 - CONFIG.TARGET_FADE_START_PERCENT);
            const fadeTimeElapsed = targetAge - (CONFIG.TARGET_MAX_LIFESPAN * CONFIG.TARGET_FADE_START_PERCENT);
            target.currentOpacity = 1 - (fadeTimeElapsed / fadeTimeTotal);
        }
    }
}

/**
 * Updates projectile positions and handles out-of-bounds
 */
function updateProjectiles() {
    for (let i = projectiles.length - 1; i >= 0; i--) {
        const projectile = projectiles[i];
        projectile.x += projectile.velocity.x;
        projectile.y += projectile.velocity.y;
        
        if (projectile.x < 0 || projectile.x > canvas.width || 
            projectile.y < 0 || projectile.y > canvas.height) {
            projectilePool.push(projectile);
            projectiles.splice(i, 1);
        }
    }
}

// ===== RENDERING FUNCTIONS =====

/**
 * Renders all game objects using hybrid batch rendering approach
 */
function batchRender() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw player
    ctx.globalAlpha = 1;
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.size, 0, Math.PI * 2);
    ctx.fill();
    
    // Count unique opacity values
    const uniqueOpacities = new Set(targets.map(t => 
        Math.round(t.currentOpacity * 100) / 100
    )).size;
    
    // Choose rendering method based on number of unique opacities
    ctx.fillStyle = 'green';
    if (uniqueOpacities > targets.length / 3) {
        // If many different opacities, draw individually
        targets.forEach(target => {
            ctx.globalAlpha = target.currentOpacity;
            ctx.beginPath();
            ctx.arc(target.x, target.y, target.radius, 0, Math.PI * 2);
            ctx.fill();
        });
    } else {
        // If few different opacities, batch by opacity
        const targetsByOpacity = {};
        targets.forEach(target => {
            const opacityKey = Math.round(target.currentOpacity * 100) / 100;
            if (!targetsByOpacity[opacityKey]) {
                targetsByOpacity[opacityKey] = [];
            }
            targetsByOpacity[opacityKey].push(target);
        });
        
        Object.entries(targetsByOpacity).forEach(([opacity, targetsGroup]) => {
            ctx.globalAlpha = parseFloat(opacity);
            ctx.beginPath();
            targetsGroup.forEach(target => {
                ctx.moveTo(target.x + target.radius, target.y);
                ctx.arc(target.x, target.y, target.radius, 0, Math.PI * 2);
            });
            ctx.fill();
        });
    }
    
    // Batch draw all projectiles
    ctx.globalAlpha = 1;
    ctx.fillStyle = 'red';
    ctx.beginPath();
    projectiles.forEach(projectile => {
        ctx.moveTo(projectile.x + projectile.radius, projectile.y);
        ctx.arc(projectile.x, projectile.y, projectile.radius, 0, Math.PI * 2);
    });
    ctx.fill();
}

// ===== MAIN GAME LOOP =====

/**
 * Main update function with RAF optimization
 */
function update(timestamp) {
    // FPS calculation
    frameCount++;
    if (timestamp - lastFpsUpdateTime > 1000) {
        currentFps = frameCount;
        fpsElement.textContent = `FPS: ${currentFps}`;
        frameCount = 0;
        lastFpsUpdateTime = timestamp;
    }
    
    // RAF optimization
    if (timestamp - lastUpdateTime < CONFIG.FRAME_TIME) {
        requestAnimationFrame(update);
        return;
    }
    
    lastUpdateTime = timestamp;
    
    if (!gameRunning) {
        requestAnimationFrame(update);
        return;
    }
    
    // Update game state
    updateTargets();
    updateProjectiles();
    
    // Build spatial grid and check collisions
    buildSpatialGrid();
    checkCollisionsWithGrid();
    
    // Render everything
    batchRender();
    
    // Continue game loop
    requestAnimationFrame(update);
}

// ===== EVENT HANDLERS =====

canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;
    
    createProjectile(clickX, clickY);
});

// ===== GAME INITIALIZATION =====

// Initialize object pools
initializePools();

// Start creating targets
setInterval(createTarget, CONFIG.TARGET_SPAWN_INTERVAL);

// Start the game loop
requestAnimationFrame(update);