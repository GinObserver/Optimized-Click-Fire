/**
 * @fileoverview Core game class that manages the game loop, entities, and game state
 * @author Click & Fire Development Team
 * 
 * Class: Game
 * ============
 * Core game engine that handles:
 * - Canvas and DOM setup
 * - Game state management
 * - Entity lifecycle (projectiles, targets)
 * - Collision detection
 * - Rendering
 * - Game loop
 * 
 * Properties:
 * -----------
 * @property {HTMLCanvasElement} canvas - Game canvas element
 * @property {CanvasRenderingContext2D} ctx - Canvas rendering context
 * @property {HTMLElement} scoreElement - Score display element
 * @property {HTMLElement} fpsElement - FPS counter element
 * @property {boolean} running - Game running state
 * @property {number} score - Current game score
 * @property {number} lastUpdateTime - Last frame timestamp
 * @property {number} frameCount - Frames in current second
 * @property {number} lastFpsUpdateTime - Last FPS update time
 * @property {number} currentFps - Current FPS value
 * @property {Object} player - Player entity
 * @property {Array<Object>} projectiles - Active projectiles
 * @property {Array<Object>} targets - Active targets
 * @property {GameRenderer} renderer - Game rendering system
 * @property {ObjectPool} projectilePool - Pool for projectile objects
 * @property {ObjectPool} targetPool - Pool for target objects
 * @property {SpatialGrid} collisionGrid - Spatial partitioning grid for collisions
 * 
 * Methods:
 * --------
 * Configuration:
 * @method configureCanvasAndDom() - Sets up canvas and DOM elements
 * @method initializeState() - Sets up initial game state
 * @method setupEventListeners() - Configures input handling
 * @method setupGameSystems() - Initializes game subsystems
 * @method initializePools() - Creates object pools for entities
 * @method initializeCollisionSystem() - Sets up spatial partitioning
 * 
 * Game Loop:
 * @method update(timestamp) - Main game loop
 * @method updateGameState() - Updates game entities
 * @method render() - Renders current game state
 * 
 * Entity Management:
 * @method updateTargets() - Updates target states and lifespans
 * @method updateProjectiles() - Updates projectile positions
 * @method createProjectile(clickX, clickY) - Creates new projectile
 * @method createTarget() - Creates new target
 * 
 * Collision:
 * @method checkCollisions() - Handles entity collisions
 * 
 * Game Control:
 * @method start() - Starts game loop
 */

/**
 * Main Game class responsible for controlling the entire game system
 * @class Game
 * @classdesc Manages game state, rendering, physics, and interactions
 */
class Game {
    /**
     * Configures canvas and DOM element references
     * @private
     */
    configureCanvasAndDom() {
        /**
         * Canvas element where the game is rendered
         * @type {HTMLCanvasElement}
         */
        this.canvas = document.getElementById('gameCanvas');
        
        /**
         * Canvas 2D rendering context
         * @type {CanvasRenderingContext2D}
         */
        this.ctx = this.canvas.getContext('2d');
        
        /**
         * DOM element that displays the score
         * @type {HTMLElement}
         */
        this.scoreElement = document.getElementById('score');
        
        /**
         * DOM element that displays the FPS counter
         * @type {HTMLElement}
         */
        this.fpsElement = document.getElementById('fps');
    }

    /**
     * Initializes game state variables
     * @private
     */
    initializeState() {
        /**
         * Flag indicating if the game is currently running
         * @type {boolean}
         */
        this.running = true;
        
        /**
         * Current game score
         * @type {number}
         */
        this.score = 0;
        
        /**
         * Timestamp of the last update for frame rate control
         * @type {number}
         */
        this.lastUpdateTime = 0;
        
        /**
         * Counter for frames within the current second
         * @type {number}
         */
        this.frameCount = 0;
        
        /**
         * Timestamp of the last FPS counter update
         * @type {number}
         */
        this.lastFpsUpdateTime = 0;
        
        /**
         * Current frames per second
         * @type {number}
         */
        this.currentFps = 0;
    
        /**
         * Player object containing position and rendering information
         * @type {Object}
         * @property {number} x - X coordinate of the player
         * @property {number} y - Y coordinate of the player
         * @property {number} size - Radius of the player circle
         * @property {string} color - Color of the player
         */
        this.player = {
            x: this.canvas.width / 2,
            y: this.canvas.height - 50,
            size: 30,
            color: CONFIG.COLORS.PLAYER
        };

        /**
         * Array of active projectiles
         * @type {Array<Object>}
         */
        this.projectiles = [];
        
        /**
         * Array of active targets
         * @type {Array<Object>}
         */
        this.targets = [];
    }

    initializePools() {
        // Create projectile pool
        this.projectilePool = new ObjectPool(() => ({
            x: 0,
            y: 0,
            radius: CONFIG.PROJECTILE_RADIUS,
            color: CONFIG.COLORS.PROJECTILE,
            velocity: { x: 0, y: 0 }
        }));

        // Create target pool
        this.targetPool = new ObjectPool(() => ({
            x: 0,
            y: 0,
            radius: 0,
            color: CONFIG.COLORS.TARGET,
            creationTime: 0,
            currentOpacity: 1
        }));
    }

    initializeCollisionSystem() {
        // Create spatial partitioning grid
        this.collisionGrid = new SpatialGrid(CONFIG.GRID_CELL_SIZE);
    }

    /**
     * Sets up event listeners for user interaction
     * @private
     */
    setupEventListeners() {
        /**
         * Click event listener for shooting projectiles
         * @listens click
         */
        this.canvas.addEventListener('click', (event) => {
            const rect = this.canvas.getBoundingClientRect();
            const clickX = event.clientX - rect.left;
            const clickY = event.clientY - rect.top;
            this.createProjectile(clickX, clickY);
        });
    }

    /**
     * Starts periodic target generation
     * @private
     */
    startTargetGeneration() {
        setInterval(() => this.createTarget(), CONFIG.TARGET_SPAWN_INTERVAL);
    }

    /**
     * Sets up game systems like renderer
     * @private
     */
    setupGameSystems() {
        /**
         * Game renderer responsible for drawing game elements
         * @type {GameRenderer}
         */
        this.renderer = new GameRenderer(this.canvas);
        this.startTargetGeneration();
    }

    /**
     * Creates a new Game instance and initializes all systems
     * @constructor
     */
    constructor() {
        this.configureCanvasAndDom();
        this.initializeState();
        this.initializePools();
        this.initializeCollisionSystem();
        this.setupEventListeners();
        this.setupGameSystems();
    }  

    /**
     * Updates all targets, handling aging and transparency effects
     * @private
     */
    updateTargets() {
        const currentTime = Date.now();
        
        for (let i = this.targets.length - 1; i >= 0; i--) {
            const target = this.targets[i];
            const targetAge = currentTime - target.creationTime;
            
            // Remove expired targets
            if (targetAge >= CONFIG.TARGET_MAX_LIFESPAN) {
                this.targetPool.release(target);
                this.targets.splice(i, 1);
            } 
            // Fade out targets approaching expiration
            else if (targetAge > CONFIG.TARGET_MAX_LIFESPAN * CONFIG.TARGET_FADE_START_PERCENT) {
                const fadeTimeTotal = CONFIG.TARGET_MAX_LIFESPAN * (1 - CONFIG.TARGET_FADE_START_PERCENT);
                const fadeTimeElapsed = targetAge - (CONFIG.TARGET_MAX_LIFESPAN * CONFIG.TARGET_FADE_START_PERCENT);
                target.currentOpacity = 1 - (fadeTimeElapsed / fadeTimeTotal);
            }
        }
    }

    /**
     * Updates all projectiles, handling movement and out-of-bounds detection
     * @private
     */
    updateProjectiles() {
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            
            // Move projectile based on velocity
            projectile.x += projectile.velocity.x;
            projectile.y += projectile.velocity.y;
            
            // Check if projectile is out of bounds
            if (projectile.x < 0 || projectile.x > this.canvas.width || 
                projectile.y < 0 || projectile.y > this.canvas.height) {
                this.projectilePool.release(projectile);
                this.projectiles.splice(i, 1);
            }
        }
    }

    /**
     * Updates all game entities and state
     * @private
     */
    updateGameState() {
        this.updateTargets();
        this.updateProjectiles();
    }

    /**
     * Creates a new projectile at the player's position aimed toward the click coordinates
     * @param {number} clickX - X coordinate of the click
     * @param {number} clickY - Y coordinate of the click
     * @public
     */
    createProjectile(clickX, clickY) {
        // Calculate angle to target
        const angleToTarget = Math.atan2(clickY - this.player.y, clickX - this.player.x);
        
        // Get projectile from pool
        const projectile = this.projectilePool.get();
        
        // Set projectile properties
        projectile.x = this.player.x;
        projectile.y = this.player.y;
        projectile.velocity.x = Math.cos(angleToTarget) * CONFIG.PROJECTILE_SPEED;
        projectile.velocity.y = Math.sin(angleToTarget) * CONFIG.PROJECTILE_SPEED;
        
        // Add to active projectiles
        this.projectiles.push(projectile);
    }

    /**
     * Creates a new target at a random position
     * @public
     */
    createTarget() {
        // Get target from pool
        const target = this.targetPool.get();
        
        // Set random size
        target.radius = Math.random() * CONFIG.TARGET_SIZE_VARIATION + CONFIG.TARGET_MIN_SIZE;
        
        // Set random position in top half of screen
        target.x = Math.random() * (this.canvas.width - target.radius * 2) + target.radius;
        target.y = Math.random() * (this.canvas.height / 2) + target.radius;
        
        // Set creation time and opacity
        target.creationTime = Date.now();
        target.currentOpacity = 1;
        
        // Add to active targets
        this.targets.push(target);
    }

    /**
     * Checks for collisions between projectiles and targets using spatial partitioning
     * @private
     */
    checkCollisions() {
        // Clear the collision grid
        this.collisionGrid.clear();
        
        // Add all targets to the grid
        this.targets.forEach((target, index) => this.collisionGrid.addObject(target, index));

        // Check each projectile against nearby targets
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            
            // Get only targets that could possibly collide
            const nearbyTargets = this.collisionGrid.getNearbyObjects(projectile.x, projectile.y);

            // Check collision with each nearby target
            for (const targetData of nearbyTargets) {
                const target = targetData.obj;
                
                // Calculate distance between centers
                const distance = Math.hypot(
                    projectile.x - target.x,
                    projectile.y - target.y
                );

                // If collision detected (circles overlapping)
                if (distance < projectile.radius + target.radius) {
                    // Return target to pool
                    this.targetPool.release(target);
                    this.targets.splice(targetData.index, 1);
                    
                    // Return projectile to pool
                    this.projectilePool.release(projectile);
                    this.projectiles.splice(i, 1);
                    
                    // Update score
                    this.score += 10;
                    this.scoreElement.textContent = `Score: ${this.score}`;
                    break;
                }
            }
        }
    }

    /**
     * Renders the current game state using the renderer
     * @private
     */
    render() {
        this.renderer.clear();
        this.renderer.drawPlayer(this.player);
        this.renderer.drawTargets(this.targets);
        this.renderer.drawProjectiles(this.projectiles);
    }

    /**
     * Main game loop that updates and renders the game
     * @param {number} timestamp - Current timestamp from requestAnimationFrame
     * @private
     */
    update(timestamp) {
        // FPS calculation
        this.frameCount++;
        if (timestamp - this.lastFpsUpdateTime > 1000) {
            this.currentFps = this.frameCount;
            this.fpsElement.textContent = `FPS: ${this.currentFps}`;
            this.frameCount = 0;
            this.lastFpsUpdateTime = timestamp;
        }

        // RAF optimization - limit frame rate
        if (timestamp - this.lastUpdateTime < CONFIG.FRAME_TIME) {
            requestAnimationFrame((t) => this.update(t));
            return;
        }
        this.lastUpdateTime = timestamp;

        // Skip updates if game is paused
        if (!this.running) {
            requestAnimationFrame((t) => this.update(t));
            return;
        }

        // Update game state and render
        this.updateGameState();
        this.checkCollisions();
        this.render();

        requestAnimationFrame((t) => this.update(t));
    }

    start() {
        requestAnimationFrame((t) => this.update(t));
    }

}

// Create and start game instance
const game = new Game();
game.start();