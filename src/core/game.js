class Game { /* Main game class that manages all game systems and state */

    configureCanvasAndDom() { /* Initialize canvas and DOM elements */
        this.canvas = document.getElementById('gameCanvas'); /* Get the main game canvas element */
        this.ctx = this.canvas.getContext('2d'); /* Get 2D rendering context for drawing */
        this.scoreElement = document.getElementById('score'); /* Get score display element */
        this.fpsElement = document.getElementById('fps'); /* Get FPS counter display element */
    }

    initializeState() { /* Set up initial game state variables */
        this.running = true; /* Flag indicating if game is active */
        this.score = 0; /* Player's current score */
        this.lastUpdateTime = 0; /* Time of last game update for frame timing */
        this.frameCount = 0; /* Number of frames rendered in current second */
        this.lastFpsUpdateTime = 0; /* Time of last FPS counter update */
        this.currentFps = 0; /* Current frames per second value */
    
        this.player = { /* Initialize player object with starting position and properties */
            x: this.canvas.width / 2, /* Center player horizontally */
            y: this.canvas.height - 50, /* Position player near bottom of screen */
            size: 30, /* Player circle radius */
            color: CONFIG.COLORS.PLAYER /* Player color from config */
        };

        this.projectiles = []; /* Array to store active projectiles */
        this.targets = []; /* Array to store active targets */
    }

    initializePools() { /* Set up object pools for entity recycling */
        this.projectilePool = new ObjectPool(() => ({ /* Create projectile pool with factory function */
            x: 0, /* Starting x position */
            y: 0, /* Starting y position */
            radius: CONFIG.PROJECTILE_RADIUS, /* Projectile size */
            color: CONFIG.COLORS.PROJECTILE, /* Projectile color */
            velocity: { x: 0, y: 0 } /* Initial velocity vector */
        }));

        this.targetPool = new ObjectPool(() => ({ /* Create target pool with factory function */
            x: 0, /* Starting x position */
            y: 0, /* Starting y position */
            radius: 0, /* Will be set when spawned */
            color: CONFIG.COLORS.TARGET, /* Target color */
            creationTime: 0, /* Will track when target was created */
            currentOpacity: 1 /* Full opacity when spawned */
        }));
    }

    initializeCollisionSystem() { /* Set up spatial partitioning for collision detection */
        this.collisionGrid = new SpatialGrid(CONFIG.GRID_CELL_SIZE); /* Create grid with configured cell size */
    }

    setupEventListeners() { /* Configure input handling */
        this.canvas.addEventListener('click', (event) => { /* Listen for mouse clicks */
            const rect = this.canvas.getBoundingClientRect(); /* Get canvas position */
            const clickX = event.clientX - rect.left; /* Calculate click X relative to canvas */
            const clickY = event.clientY - rect.top; /* Calculate click Y relative to canvas */
            this.createProjectile(clickX, clickY); /* Create projectile at click position */
        });
    }

    startTargetGeneration() { /* Begin periodic target creation */
        setInterval(() => this.createTarget(), CONFIG.TARGET_SPAWN_INTERVAL); /* Create new target at fixed intervals */
    }

    setupGameSystems() { /* Initialize game subsystems */
        this.renderer = new GameRenderer(this.canvas); /* Create rendering system */
        this.startTargetGeneration(); /* Start spawning targets */
    }

    constructor() { /* Initialize game instance */
        this.configureCanvasAndDom(); /* Set up canvas and DOM elements */
        this.initializeState(); /* Initialize game state */
        this.initializePools(); /* Set up object pools */
        this.initializeCollisionSystem(); /* Set up collision detection */
        this.setupEventListeners(); /* Configure input handling */
        this.setupGameSystems(); /* Initialize subsystems */
    }  

    updateTargets() { /* Update all active targets */
        const currentTime = Date.now(); /* Get current timestamp */
        
        for (let i = this.targets.length - 1; i >= 0; i--) { /* Iterate targets backwards */
            const target = this.targets[i]; /* Get current target */
            const targetAge = currentTime - target.creationTime; /* Calculate target lifetime */
            
            if (targetAge >= CONFIG.TARGET_MAX_LIFESPAN) { /* Check if target expired */
                this.targetPool.release(target); /* Return to pool */
                this.targets.splice(i, 1); /* Remove from active targets */
            } 
            else if (targetAge > CONFIG.TARGET_MAX_LIFESPAN * CONFIG.TARGET_FADE_START_PERCENT) { /* Check if target should start fading */
                const fadeTimeTotal = CONFIG.TARGET_MAX_LIFESPAN * (1 - CONFIG.TARGET_FADE_START_PERCENT); /* Calculate total fade duration */
                const fadeTimeElapsed = targetAge - (CONFIG.TARGET_MAX_LIFESPAN * CONFIG.TARGET_FADE_START_PERCENT); /* Calculate elapsed fade time */
                target.currentOpacity = 1 - (fadeTimeElapsed / fadeTimeTotal); /* Update target opacity */
            }
        }
    }

    updateProjectiles() { /* Update all active projectiles */
        for (let i = this.projectiles.length - 1; i >= 0; i--) { /* Iterate projectiles backwards */
            const projectile = this.projectiles[i]; /* Get current projectile */
            
            projectile.x += projectile.velocity.x; /* Update X position */
            projectile.y += projectile.velocity.y; /* Update Y position */
            
            if (projectile.x < 0 || projectile.x > this.canvas.width || 
                projectile.y < 0 || projectile.y > this.canvas.height) { /* Check if out of bounds */
                this.projectilePool.release(projectile); /* Return to pool */
                this.projectiles.splice(i, 1); /* Remove from active projectiles */
            }
        }
    }

    updateGameState() { /* Update game state for current frame */
        this.updateTargets(); /* Update all targets */
        this.updateProjectiles(); /* Update all projectiles */
    }

    createProjectile(clickX, clickY) { /* Create new projectile from click */
        const angleToTarget = Math.atan2(clickY - this.player.y, clickX - this.player.x); /* Calculate angle to click */
        const projectile = this.projectilePool.get(); /* Get projectile from pool */
        
        projectile.x = this.player.x; /* Set start X position */
        projectile.y = this.player.y; /* Set start Y position */
        projectile.velocity.x = Math.cos(angleToTarget) * CONFIG.PROJECTILE_SPEED; /* Calculate X velocity */
        projectile.velocity.y = Math.sin(angleToTarget) * CONFIG.PROJECTILE_SPEED; /* Calculate Y velocity */
        
        this.projectiles.push(projectile); /* Add to active projectiles */
    }

    createTarget() { /* Create new target */
        const target = this.targetPool.get(); /* Get target from pool */
        
        target.radius = Math.random() * CONFIG.TARGET_SIZE_VARIATION + CONFIG.TARGET_MIN_SIZE; /* Set random size */
        target.x = Math.random() * (this.canvas.width - target.radius * 2) + target.radius; /* Set random X position */
        target.y = Math.random() * (this.canvas.height / 2) + target.radius; /* Set random Y position */
        target.creationTime = Date.now(); /* Set creation timestamp */
        target.currentOpacity = 1; /* Set initial opacity */
        
        this.targets.push(target); /* Add to active targets */
    }

    checkCollisions() { /* Check for collisions between projectiles and targets */
        this.collisionGrid.clear(); /* Reset collision grid */
        this.targets.forEach((target, index) => this.collisionGrid.addObject(target, index)); /* Add targets to grid */

        for (let i = this.projectiles.length - 1; i >= 0; i--) { /* Check each projectile */
            const projectile = this.projectiles[i]; /* Get current projectile */
            const nearbyTargets = this.collisionGrid.getNearbyObjects(projectile.x, projectile.y); /* Get potential collisions */

            for (const targetData of nearbyTargets) { /* Check each nearby target */
                const target = targetData.obj; /* Get target object */
                const distance = Math.hypot(projectile.x - target.x, projectile.y - target.y); /* Calculate distance */

                if (distance < projectile.radius + target.radius) { /* Check for collision */
                    this.targetPool.release(target); /* Return target to pool */
                    this.targets.splice(targetData.index, 1); /* Remove target */
                    this.projectilePool.release(projectile); /* Return projectile to pool */
                    this.projectiles.splice(i, 1); /* Remove projectile */
                    this.score += 10; /* Increase score */
                    this.scoreElement.textContent = `Score: ${this.score}`; /* Update score display */
                    break; /* Exit loop after collision */
                }
            }
        }
    }

    render() { /* Render current game state */
        this.renderer.clear(); /* Clear previous frame */
        this.renderer.drawPlayer(this.player); /* Draw player */
        this.renderer.drawTargets(this.targets); /* Draw all targets */
        this.renderer.drawProjectiles(this.projectiles); /* Draw all projectiles */
    }

    update(timestamp) { /* Main game loop */
        this.frameCount++; /* Increment frame counter */
        if (timestamp - this.lastFpsUpdateTime > 1000) { /* Check if second has passed */
            this.currentFps = this.frameCount; /* Calculate FPS */
            this.fpsElement.textContent = `FPS: ${this.currentFps}`; /* Update FPS display */
            this.frameCount = 0; /* Reset frame counter */
            this.lastFpsUpdateTime = timestamp; /* Update FPS timer */
        }

        if (timestamp - this.lastUpdateTime < CONFIG.FRAME_TIME) { /* Check frame timing */
            requestAnimationFrame((t) => this.update(t)); /* Schedule next frame */
            return; /* Skip update if too soon */
        }
        this.lastUpdateTime = timestamp; /* Update frame timer */

        if (!this.running) { /* Check if game is paused */
            requestAnimationFrame((t) => this.update(t)); /* Keep animation loop running */
            return; /* Skip update if paused */
        }

        this.updateGameState(); /* Update game entities */
        this.checkCollisions(); /* Check for collisions */
        this.render(); /* Render frame */

        requestAnimationFrame((t) => this.update(t)); /* Schedule next frame */
    }

    start() { /* Start the game */
        requestAnimationFrame((t) => this.update(t)); /* Begin game loop */
    }
}

const game = new Game(); /* Create game instance */
game.start(); /* Start the game */