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
            size: CONFIG.PLAYER.SIZE, /* Player circle radius */
            color: CONFIG.COLORS.PLAYER, /* Player color from config */
            velocity: { /* Player movement velocity vector */
                x: 0, /* Horizontal velocity - starts at 0 */
                y: 0  /* Vertical velocity - starts at 0 */
            }
        };

        this.projectiles = []; /* Array to store active projectiles */
        this.targets = []; /* Array to store active targets */

        /**
         * Tracks currently pressed keys for movement */
        this.inputState = { /* Track keyboard state for player movement */
            left: false, /* Is left movement key pressed */
            right: false, /* Is right movement key pressed */
            up: false, /* Is up movement key pressed */
            down: false /* Is down movement key pressed */
        };
    }

    initializePools() { /* Set up object pools for entity recycling */
        this.projectilePool = new ObjectPool(() => ({ /* Create projectile pool with factory function */
            x: 0, /* Starting x position */
            y: 0, /* Starting y position */
            radius: CONFIG.PROJECTILE.RADIUS, /* Projectile size */
            color: CONFIG.COLORS.PROJECTILE, /* Projectile color */
            velocity: { x: 0, y: 0 } /* Initial velocity vector */
        }), CONFIG.POOLS.INITIAL_SIZE);

        this.targetPool = new ObjectPool(() => ({ /* Create target pool with factory function */
            x: 0, /* Starting x position */
            y: 0, /* Starting y position */
            radius: 0, /* Will be set when spawned */
            color: CONFIG.COLORS.TARGET, /* Target color */
            creationTime: 0, /* Will track when target was created */
            currentOpacity: 1 /* Full opacity when spawned */
        }), CONFIG.POOLS.INITIAL_SIZE);
    }

    initializeCollisionSystem() { /* Set up spatial partitioning for collision detection */
        this.collisionGrid = new SpatialGrid(CONFIG.PERFORMANCE.GRID_CELL_SIZE); /* Create grid with configured cell size */
    }

    setupEventListeners() { /* Configure input handling */
        this.canvas.addEventListener('click', (event) => { /* Listen for mouse clicks */
            const rect = this.canvas.getBoundingClientRect(); /* Get canvas position */
            const clickX = event.clientX - rect.left; /* Calculate click X relative to canvas */
            const clickY = event.clientY - rect.top; /* Calculate click Y relative to canvas */
            this.createProjectile(clickX, clickY); /* Create projectile at click position */
        });
        
        window.addEventListener('keydown', (event) => { /* Listen for key presses */
            this.handleKeyInput(event.key, true); /* Update input state for key press */
        });
        
        window.addEventListener('keyup', (event) => { /* Listen for key releases */
            this.handleKeyInput(event.key, false); /* Update input state for key release */
        });
    }

    handleKeyInput(key, isPressed) { /* Process keyboard input */
        if (CONFIG.KEYBOARD_CONTROLS.LEFT.includes(key)) { /* Check if left movement key */
            this.inputState.left = isPressed; /* Update left movement state */
        }
        if (CONFIG.KEYBOARD_CONTROLS.RIGHT.includes(key)) { /* Check if right movement key */
            this.inputState.right = isPressed; /* Update right movement state */
        }
        if (CONFIG.KEYBOARD_CONTROLS.UP.includes(key)) { /* Check if up movement key */
            this.inputState.up = isPressed; /* Update up movement state */
        }
        if (CONFIG.KEYBOARD_CONTROLS.DOWN.includes(key)) { /* Check if down movement key */
            this.inputState.down = isPressed; /* Update down movement state */
        }
    }

    startTargetGeneration() { /* Begin periodic target creation */
        setInterval(() => this.createTarget(), CONFIG.TARGET.SPAWN_INTERVAL); /* Create new target at fixed intervals */
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
            
            if (targetAge >= CONFIG.TARGET.MAX_LIFESPAN) { /* Check if target expired */
                this.targetPool.release(target); /* Return to pool */
                this.targets.splice(i, 1); /* Remove from active targets */
            } 
            else if (targetAge > CONFIG.TARGET.MAX_LIFESPAN * CONFIG.TARGET.FADE_START_PERCENT) { /* Check if target should start fading */
                const fadeTimeTotal = CONFIG.TARGET.MAX_LIFESPAN * (1 - CONFIG.TARGET.FADE_START_PERCENT); /* Calculate total fade duration */
                const fadeTimeElapsed = targetAge - (CONFIG.TARGET.MAX_LIFESPAN * CONFIG.TARGET.FADE_START_PERCENT); /* Calculate elapsed fade time */
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

    updatePlayer() { /* Update player position using physics-based movement */
        // Apply acceleration based on input
        if (this.inputState.left) { /* If moving left */
            this.player.velocity.x -= CONFIG.PLAYER.ACCELERATION; /* Accelerate left */
        }
        if (this.inputState.right) { /* If moving right */
            this.player.velocity.x += CONFIG.PLAYER.ACCELERATION; /* Accelerate right */
        }
        if (this.inputState.up) { /* If moving up */
            this.player.velocity.y -= CONFIG.PLAYER.ACCELERATION; /* Accelerate up */
        }
        if (this.inputState.down) { /* If moving down */
            this.player.velocity.y += CONFIG.PLAYER.ACCELERATION; /* Accelerate down */
        }
        
        // Apply speed limit
        const currentSpeed = Math.sqrt( /* Calculate current speed magnitude */
            this.player.velocity.x * this.player.velocity.x + 
            this.player.velocity.y * this.player.velocity.y
        );
        
        if (currentSpeed > CONFIG.PLAYER.MAX_SPEED) { /* If exceeding max speed */
            const ratio = CONFIG.PLAYER.MAX_SPEED / currentSpeed; /* Calculate scaling ratio */
            this.player.velocity.x *= ratio; /* Scale down x velocity */
            this.player.velocity.y *= ratio; /* Scale down y velocity */
        }
        
        // Apply friction
        this.player.velocity.x *= CONFIG.PLAYER.FRICTION; /* Apply horizontal friction */
        this.player.velocity.y *= CONFIG.PLAYER.FRICTION; /* Apply vertical friction */
        
        // Very small velocities should be zeroed out to prevent endless tiny movement
        if (Math.abs(this.player.velocity.x) < 0.01) this.player.velocity.x = 0; /* Stop tiny x movement */
        if (Math.abs(this.player.velocity.y) < 0.01) this.player.velocity.y = 0; /* Stop tiny y movement */
        
        // Update position
        this.player.x += this.player.velocity.x; /* Apply x velocity to position */
        this.player.y += this.player.velocity.y; /* Apply y velocity to position */
        
        // Apply boundary constraints
        const padding = CONFIG.PLAYER.BOUNDARY_PADDING; /* Get boundary padding */
        
        // Handle x boundaries with momentum conservation
        if (this.player.x < padding) { /* If beyond left boundary */
            this.player.x = padding; /* Move to boundary */
            this.player.velocity.x *= -CONFIG.PLAYER.BOUNCE_ENERGY_LOSS; /* Bounce with energy loss */
        } else if (this.player.x > this.canvas.width - padding) { /* If beyond right boundary */
            this.player.x = this.canvas.width - padding; /* Move to boundary */
            this.player.velocity.x *= -CONFIG.PLAYER.BOUNCE_ENERGY_LOSS; /* Bounce with energy loss */
        }
        
        // Handle y boundaries with momentum conservation
        if (this.player.y < padding) { /* If beyond top boundary */
            this.player.y = padding; /* Move to boundary */
            this.player.velocity.y *= -CONFIG.PLAYER.BOUNCE_ENERGY_LOSS; /* Bounce with energy loss */
        } else if (this.player.y > this.canvas.height - padding) { /* If beyond bottom boundary */
            this.player.y = this.canvas.height - padding; /* Move to boundary */
            this.player.velocity.y *= -CONFIG.PLAYER.BOUNCE_ENERGY_LOSS; /* Bounce with energy loss */
        }
    }

    updateGameState() { /* Update game state for current frame */
        this.updatePlayer(); /* Update player position with physics */
        this.updateTargets(); /* Update all targets */
        this.updateProjectiles(); /* Update all projectiles */
    }

    createProjectile(clickX, clickY) { /* Create new projectile with momentum transfer */
        // Get projectile from pool and calculate angle
        const projectile = this.projectilePool.get(); /* Get recycled or new projectile */
        const angleToTarget = Math.atan2(clickY - this.player.y, clickX - this.player.x); /* Calculate firing angle */
        
        // Set initial position to player position
        projectile.x = this.player.x; /* Start at player's X position */
        projectile.y = this.player.y; /* Start at player's Y position */
        
        // Calculate base velocity components
        const baseVelocityX = Math.cos(angleToTarget) * CONFIG.PROJECTILE.SPEED; /* Base X velocity from aim */
        const baseVelocityY = Math.sin(angleToTarget) * CONFIG.PROJECTILE.SPEED; /* Base Y velocity from aim */
        
        // Add player momentum with transfer factor
        const momentumTransferFactor = CONFIG.PROJECTILE.MOMENTUM_TRANSFER; /* How much player momentum affects projectile */
        projectile.velocity.x = baseVelocityX + (this.player.velocity.x * momentumTransferFactor); /* Combined X velocity */
        projectile.velocity.y = baseVelocityY + (this.player.velocity.y * momentumTransferFactor); /* Combined Y velocity */
        
        this.projectiles.push(projectile); /* Add to active projectiles list */
    }

    createTarget() { /* Create new target */
        const target = this.targetPool.get(); /* Get target from pool */
        
        target.radius = Math.random() * CONFIG.TARGET.SIZE_VARIATION + CONFIG.TARGET.MIN_SIZE; /* Set random size */
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
                    this.score += CONFIG.TARGET.SCORE_VALUE; /* Increase score */
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

        if (timestamp - this.lastUpdateTime < CONFIG.PERFORMANCE.FRAME_TIME) { /* Check frame timing */
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