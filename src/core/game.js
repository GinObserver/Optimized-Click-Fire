// ===== GAME SETUP AND CONSTANTS =====
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const fpsElement = document.getElementById('fps');

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
    color: CONFIG.COLORS.PLAYER
};

// Arrays for game objects - REMOVE the duplicated pool declarations
let projectiles = [];
let targets = [];

// Spatial grid for collision detection
const grid = {};

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.scoreElement = document.getElementById('score');
        this.fpsElement = document.getElementById('fps');
        
        this.renderer = new GameRenderer(this.canvas);
        this.running = true;
        this.score = 0;
        this.lastUpdateTime = 0;
        this.frameCount = 0;
        this.lastFpsUpdateTime = 0;
        this.currentFps = 0;
        
        this.player = {
            x: this.canvas.width / 2,
            y: this.canvas.height - 50,
            size: 30,
            color: CONFIG.COLORS.PLAYER
        };
        
        this.projectiles = [];
        this.targets = [];
        
        this.setupEventListeners();
        this.startTargetGeneration();
    }

    setupEventListeners() {
        this.canvas.addEventListener('click', (event) => {
            const rect = this.canvas.getBoundingClientRect();
            const clickX = event.clientX - rect.left;
            const clickY = event.clientY - rect.top;
            this.createProjectile(clickX, clickY);
        });
    }

    createProjectile(clickX, clickY) {
        const angleToTarget = Math.atan2(clickY - this.player.y, clickX - this.player.x);
        const projectile = projectilePool.get();
        
        projectile.x = this.player.x;
        projectile.y = this.player.y;
        projectile.velocity.x = Math.cos(angleToTarget) * CONFIG.PROJECTILE_SPEED;
        projectile.velocity.y = Math.sin(angleToTarget) * CONFIG.PROJECTILE_SPEED;
        
        this.projectiles.push(projectile);
    }

    createTarget() {
        const target = targetPool.get();
        target.radius = Math.random() * CONFIG.TARGET_SIZE_VARIATION + CONFIG.TARGET_MIN_SIZE;
        target.x = Math.random() * (this.canvas.width - target.radius * 2) + target.radius;
        target.y = Math.random() * (this.canvas.height / 2) + target.radius;
        target.creationTime = Date.now();
        target.currentOpacity = 1;
        
        this.targets.push(target);
    }

    startTargetGeneration() {
        setInterval(() => this.createTarget(), CONFIG.TARGET_SPAWN_INTERVAL);
    }

    update(timestamp) {
        // FPS calculation
        this.frameCount++;
        if (timestamp - this.lastFpsUpdateTime > 1000) {
            this.currentFps = this.frameCount;
            this.fpsElement.textContent = `FPS: ${this.currentFps}`;
            this.frameCount = 0;
            this.lastFpsUpdateTime = timestamp;
        }

        // RAF optimization
        if (timestamp - this.lastUpdateTime < CONFIG.FRAME_TIME) {
            requestAnimationFrame((t) => this.update(t));
            return;
        }
        this.lastUpdateTime = timestamp;

        if (!this.running) {
            requestAnimationFrame((t) => this.update(t));
            return;
        }

        this.updateGameState();
        this.checkCollisions();
        this.render();

        requestAnimationFrame((t) => this.update(t));
    }

    updateGameState() {
        this.updateTargets();
        this.updateProjectiles();
    }

    updateTargets() {
        const currentTime = Date.now();
        
        for (let i = this.targets.length - 1; i >= 0; i--) {
            const target = this.targets[i];
            const targetAge = currentTime - target.creationTime;
            
            if (targetAge >= CONFIG.TARGET_MAX_LIFESPAN) {
                targetPool.release(target);
                this.targets.splice(i, 1);
            } else if (targetAge > CONFIG.TARGET_MAX_LIFESPAN * CONFIG.TARGET_FADE_START_PERCENT) {
                const fadeTimeTotal = CONFIG.TARGET_MAX_LIFESPAN * (1 - CONFIG.TARGET_FADE_START_PERCENT);
                const fadeTimeElapsed = targetAge - (CONFIG.TARGET_MAX_LIFESPAN * CONFIG.TARGET_FADE_START_PERCENT);
                target.currentOpacity = 1 - (fadeTimeElapsed / fadeTimeTotal);
            }
        }
    }

    updateProjectiles() {
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            projectile.x += projectile.velocity.x;
            projectile.y += projectile.velocity.y;
            
            if (projectile.x < 0 || projectile.x > this.canvas.width || 
                projectile.y < 0 || projectile.y > this.canvas.height) {
                projectilePool.release(projectile);
                this.projectiles.splice(i, 1);
            }
        }
    }

    checkCollisions() {
        collisionGrid.clear();
        this.targets.forEach((target, index) => collisionGrid.addObject(target, index));

        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            const nearbyTargets = collisionGrid.getNearbyObjects(projectile.x, projectile.y);

            for (const targetData of nearbyTargets) {
                const target = targetData.obj;
                const distance = Math.hypot(
                    projectile.x - target.x,
                    projectile.y - target.y
                );

                if (distance < projectile.radius + target.radius) {
                    targetPool.release(target);
                    this.targets.splice(targetData.index, 1);
                    
                    projectilePool.release(projectile);
                    this.projectiles.splice(i, 1);
                    
                    this.score += 10;
                    this.scoreElement.textContent = `Score: ${this.score}`;
                    break;
                }
            }
        }
    }

    render() {
        this.renderer.clear();
        this.renderer.drawPlayer(this.player);
        this.renderer.drawTargets(this.targets);
        this.renderer.drawProjectiles(this.projectiles);
    }

    start() {
        requestAnimationFrame((t) => this.update(t));
    }
}

// ===== INITIALIZATION FUNCTIONS =====

/**
 * Initialize object pools with pre-created objects
 */
// REMOVE this entire function as pools are already initialized in pool.js
// function initializePools() {
//     // Initialize projectile pool
//     for (let i = 0; i < CONFIG.INITIAL_POOL_SIZE; i++) {
//         projectilePool.push({
//             x: 0,
//             y: 0,
//             radius: CONFIG.PROJECTILE_RADIUS,
//             color: CONFIG.COLORS.PROJECTILE,
//             velocity: { x: 0, y: 0 }
//         });
//     }
//
//     // Initialize target pool
//     for (let i = 0; i < CONFIG.INITIAL_POOL_SIZE; i++) {
//         targetPool.push({
//             x: 0,
//             y: 0,
//             radius: 0,
//             color: CONFIG.COLORS.TARGET,
//             creationTime: 0,
//             currentOpacity: 1
//         });
//     }
// }

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
    ctx.fillStyle = CONFIG.COLORS.TARGET;
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
    ctx.fillStyle = CONFIG.COLORS.PROJECTILE;
    ctx.beginPath();
    projectiles.forEach(projectile => {
        ctx.moveTo(projectile.x + projectile.radius, projectile.y);
        ctx.arc(projectile.x, projectile.y, projectile.radius, 0, Math.PI * 2);
    });
    ctx.fill();
}

// ===== GAME INITIALIZATION =====

// REMOVE this line as pools are already initialized in pool.js
// initializePools();

// Start creating targets - make sure createTarget function exists
// If you're using the Game class method, you need to reference it through the game instance
// setInterval(createTarget, CONFIG.TARGET_SPAWN_INTERVAL);
// REMOVE this line as targets are created by the Game class

// Start the game loop
const game = new Game();
game.start();