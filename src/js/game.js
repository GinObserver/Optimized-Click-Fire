// Get the canvas element and its context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

// Game variables
let score = 0;
let projectiles = [];
let targets = [];
let gameRunning = true;

// Player position (bottom center of screen)
const player = {
    x: canvas.width / 2,
    y: canvas.height - 50,
    size: 30,
    color: 'blue'
};

// Draw the player
function drawPlayer() {
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.size, 0, Math.PI * 2);
    ctx.fill();
}

// Create a projectile when clicking
canvas.addEventListener('click', (event) => {
    // Get click coordinates relative to canvas
    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;
    
    // Calculate direction
    const angle = Math.atan2(clickY - player.y, clickX - player.x);
    const speed = 5;
    
    // Create projectile
    projectiles.push({
        x: player.x,
        y: player.y,
        radius: 5,
        color: 'red',
        velocity: {
            x: Math.cos(angle) * speed,
            y: Math.sin(angle) * speed
        }
    });
});

// Create a target at random position
function createTarget() {
    const radius = Math.random() * 20 + 10; // Random size between 10-30
    targets.push({
        x: Math.random() * (canvas.width - radius * 2) + radius,
        y: Math.random() * (canvas.height / 2) + radius,
        radius: radius,
        color: 'green'
    });
}

// Create targets every 2 seconds
setInterval(createTarget, 2000);

// Update game state
function update() {
    if (!gameRunning) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw player
    drawPlayer();

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
        for (let j = targets.length - 1; j >= 0; j--) {
            const target = targets[j];
            const distance = Math.hypot(
                projectile.x - target.x,
                projectile.y - target.y
            );
            
            // If collision detected
            if (distance - projectile.radius - target.radius < 1) {
                // Remove target and projectile
                targets.splice(j, 1);
                projectiles.splice(i, 1);
                
                // Increase score
                score += 10;
                scoreElement.textContent = `Score: ${score}`;
                break;
            }
        }
    }
    // Draw targets
    targets.forEach(target => {
        ctx.fillStyle = target.color;
        ctx.beginPath();
        ctx.arc(target.x, target.y, target.radius, 0, Math.PI * 2);
        ctx.fill();
    });
    
    // Continue game loop
    requestAnimationFrame(update);
}

// Start the game
update();