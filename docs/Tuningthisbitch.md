# Adding Target Lifespan and Object Pooling with Function Structure

Based on your current code and preference for a clear function structure, I'll rewrite the solution with all functions declared first, then used together at the end. This approach makes your code more organized and easier to maintain.

Here's how to implement both target lifespan limits and object pooling in your game:

```javascript:game.js
// Get the canvas element and its context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

// Game variables
let score = 0;
let projectiles = [];
let targets = [];
let targetPool = []; // Pool of reusable target objects
let gameRunning = true;

// Configuration constants with descriptive names
const PROJECTILE_SPEED = 5;
const PROJECTILE_RADIUS = 5;
const TARGET_CREATION_INTERVAL = 2000; // milliseconds
const TARGET_MAX_LIFESPAN = 8000; // milliseconds (8 seconds)
const TARGET_MIN_SIZE = 10;
const TARGET_SIZE_VARIATION = 20;
const TARGET_FADE_START_PERCENT = 0.75; // Start fading when 75% of life is used

// Player position (bottom center of screen)
const player = {
    x: canvas.width / 2,
    y: canvas.height - 50,
    size: 30,
    color: 'blue'
};

// ===== FUNCTION DECLARATIONS =====

/**
 * Draws the player character on the canvas
 */
function drawPlayer() {
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.size, 0, Math.PI * 2);
    ctx.fill();
}

/**
 * Creates or reuses a target object and adds it to the game
 */
function createTarget() {
    // Get a target object - either from the pool or create a new one
    let targetObject;
    
    if (targetPool.length > 0) {
        // Reuse a target from the pool
        targetObject = targetPool.pop();
    } else {
        // Create a new target object if pool is empty
        targetObject = {
            color: 'green'
        };
    }
    
    // Set or reset the target properties
    const targetRadius = Math.random() * TARGET_SIZE_VARIATION + TARGET_MIN_SIZE;
    
    targetObject.x = Math.random() * (canvas.width - targetRadius * 2) + targetRadius;
    targetObject.y = Math.random() * (canvas.height / 2) + targetRadius;
    targetObject.radius = targetRadius;
    targetObject.creationTime = Date.now();
    targetObject.maxOpacity = 1.0;
    targetObject.currentOpacity = 1.0;
    
    // Add to active targets array
    targets.push(targetObject);
}

/**
 * Creates a projectile in the direction of the click
 * @param {number} clickX - X coordinate of the click
 * @param {number} clickY - Y coordinate of the click
 */
function createProjectile(clickX, clickY) {
    // Calculate direction
    const angleToTarget = Math.atan2(clickY - player.y, clickX - player.x);
    
    // Create projectile
    projectiles.push({
        x: player.x,
        y: player.y,
        radius: PROJECTILE_RADIUS,
        color: 'red',
        velocity: {
            x: Math.cos(angleToTarget) * PROJECTILE_SPEED,
            y: Math.sin(angleToTarget) * PROJECTILE_SPEED
        }
    });
}

/**
 * Updates all target lifespans and handles expired targets
 */
function updateTargetLifespans() {
    const currentTime = Date.now();
    
    // Process each target from end to start (for safe removal)
    for (let i = targets.length - 1; i >= 0; i--) {
        const target = targets[i];
        
        // Calculate how long this target has existed
        const targetAge = currentTime - target.creationTime;
        
        // Check if the target has reached its lifespan
        if (targetAge >= TARGET_MAX_LIFESPAN) {
            // Return it to the pool
            targetPool.push(target);
            // Remove from active targets array
            targets.splice(i, 1);
        } else {
            // Update opacity to create a fade-out effect as lifespan ends
            // Start fading when specified percentage of life is over
            if (targetAge > TARGET_MAX_LIFESPAN * TARGET_FADE_START_PERCENT) {
                const fadeTimeTotal = TARGET_MAX_LIFESPAN * (1 - TARGET_FADE_START_PERCENT);
                const fadeTimeElapsed = targetAge - (TARGET_MAX_LIFESPAN * TARGET_FADE_START_PERCENT);
                const remainingLifePercent = 1 - (fadeTimeElapsed / fadeTimeTotal);
                target.currentOpacity = target.maxOpacity * remainingLifePercent;
            }
        }
    }
}

/**
 * Updates and draws all projectiles, handling collisions
 */
function updateAndDrawProjectiles() {
    // Update and draw projectiles
    for (let i = projectiles.length - 1; i >= 0; i--) {
        const projectile = projectiles[i];
        
        // Move projectile
        projectile.x += projectile.velocity.x;
        projectile.y += projectile.velocity.y;
        
        // Draw projectile
        ctx.fillStyle = projectile.color;
        ctx.beginPath();
        ctx.arc(projectile.x, projectile.y, projectile.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Remove if out of bounds
        if (projectile.x < 0 || projectile.x > canvas.width || 
            projectile.y < 0 || projectile.y > canvas.height) {
            projectiles.splice(i, 1);
            continue;
        }
        
        // Check collision with targets
        checkProjectileCollisions(projectile, i);
    }
}

/**
 * Checks if a projectile has collided with any targets
 * @param {Object} projectile - The projectile to check
 * @param {number} projectileIndex - Index of the projectile in the array
 */
function checkProjectileCollisions(projectile, projectileIndex) {
    for (let j = targets.length - 1; j >= 0; j--) {
        const target = targets[j];
        const distance = Math.hypot(
            projectile.x - target.x,
            projectile.y - target.y
        );
        
        // If collision detected
        if (distance - projectile.radius - target.radius < 1) {
            // Return target to pool instead of just removing it
            targetPool.push(target);
            
            // Remove target and projectile from active arrays
            targets.splice(j, 1);
            projectiles.splice(projectileIndex, 1);
            
            // Increase score
            score += 10;
            scoreElement.textContent = `Score: ${score}`;
            break;
        }
    }
}

/**
 * Draws all targets on the canvas
 */
function drawTargets() {
    // Save current global alpha
    const originalAlpha = ctx.globalAlpha;
    
    // Draw each target with its own opacity
    for (let i = 0; i < targets.length; i++) {
        const target = targets[i];
        
        // Set the target's current opacity
        ctx.globalAlpha = target.currentOpacity;
        ctx.fillStyle = target.color;
        ctx.beginPath();
        ctx.arc(target.x, target.y, target.radius, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Reset global alpha to original value
    ctx.globalAlpha = originalAlpha;
}

/**
 * Main game update function - runs every frame
 */
function update() {
    if (!gameRunning) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Update game elements
    updateTargetLifespans();
    
    // Draw game elements
    drawPlayer();
    updateAndDrawProjectiles();
    drawTargets();
    
    // Continue game loop
    requestAnimationFrame(update);
}

// ===== EVENT HANDLERS =====

/**
 * Handle click events to fire projectiles
 */
canvas.addEventListener('click', (event) => {
    // Get click coordinates relative to canvas
    const canvasRect = canvas.getBoundingClientRect();
    const clickXPosition = event.clientX - canvasRect.left;
    const clickYPosition = event.clientY - canvasRect.top;
    
    // Create projectile in the direction of the click
    createProjectile(clickXPosition, clickYPosition);
});

// ===== GAME INITIALIZATION =====

// Create targets on a timer
const targetCreationTimer = setInterval(createTarget, TARGET_CREATION_INTERVAL);

// Start the game
update();
```

## Explanation of Changes

This rewritten version maintains all the functionality of the solution I proposed earlier, but with a clearer function structure and better naming conventions:

1. **All Functions Declared First**: All functions are defined at the top of the file, making your code structure clearer.

2. **Descriptive Variable Names**: I've used more specific names like `TARGET_MAX_LIFESPAN` instead of just `MAX_TARGET_LIFESPAN` to improve readability.

3. **JSDoc Comments**: Each function has a comment that describes what it does and documents any parameters.

4. **Logical Function Grouping**: 
   - Functions are grouped by purpose
   - Core functions are separated from event handlers and initialization code

5. **Single Responsibility Principle**: Each function does one thing:
   - `createTarget` - Only handles target creation/reuse
   - `updateTargetLifespans` - Only manages target lifetimes
   - `checkProjectileCollisions` - Only handles collision detection

6. **Object Pooling Implementation**:
   - When targets expire or are hit, they're added to the target pool
   - When creating new targets, we first check if there are any in the pool

7. **Visual Fading Effect**:
   - Targets gradually fade out as they approach the end of their lifespan
   - This provides visual feedback to the player

8. **State Preservation**:
   - We save and restore the canvas globalAlpha state

This structure makes your code much easier to maintain and extend. If you want to add new features later (like different target types or power-ups), you can simply add new functions without disturbing the existing code structure.

Would you like me to explain any specific part of this implementation in more detail?
