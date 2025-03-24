class GameRenderer { /* Handles all rendering operations for the game */
    
    constructor(canvas) { /* Initialize the renderer with a canvas */
        this.canvas = canvas; /* Store reference to the game canvas */
        this.ctx = canvas.getContext('2d'); /* Get the 2D rendering context */
    }

    clear() { /* Clear the entire canvas for a new frame */
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); /* Remove all previously drawn content */
    }

    drawPlayer(player) { /* Render the player entity */
        this.ctx.globalAlpha = 1; /* Ensure player is fully opaque */
        this.ctx.fillStyle = player.color; /* Set fill color from player properties */
        this.ctx.beginPath(); /* Start a new path for drawing */
        this.ctx.arc(player.x, player.y, player.size, 0, Math.PI * 2); /* Draw circle at player position */
        this.ctx.fill(); /* Fill the player circle */
    }

    drawTargets(targets) { /* Render all target entities with batch optimization */
        const uniqueOpacities = new Set(targets.map(t => 
            Math.round(t.currentOpacity * 100) / 100 /* Round opacity to 2 decimal places */
        )).size; /* Count number of unique opacity values */

        this.ctx.fillStyle = CONFIG.COLORS.TARGET; /* Set target color from config */
        
        if (uniqueOpacities > targets.length / 3) { /* Check if batching would be beneficial */
            // Individual drawing for many different opacities
            targets.forEach(target => { /* Draw each target separately */
                this.ctx.globalAlpha = target.currentOpacity; /* Set opacity for fading effect */
                this.ctx.beginPath(); /* Start new path for each target */
                this.ctx.arc(target.x, target.y, target.radius, 0, Math.PI * 2); /* Draw target circle */
                this.ctx.fill(); /* Fill the individual target */
            });
        } else {
            // Batch by opacity
            const targetsByOpacity = {}; /* Object to group targets by opacity */
            targets.forEach(target => { /* Organize targets into opacity groups */
                const opacityKey = Math.round(target.currentOpacity * 100) / 100; /* Round to 2 decimal places */
                if (!targetsByOpacity[opacityKey]) { /* Check if group exists */
                    targetsByOpacity[opacityKey] = []; /* Create new group if needed */
                }
                targetsByOpacity[opacityKey].push(target); /* Add target to appropriate group */
            });

            Object.entries(targetsByOpacity).forEach(([opacity, targetsGroup]) => { /* Process each opacity group */
                this.ctx.globalAlpha = parseFloat(opacity); /* Set opacity once for the entire group */
                this.ctx.beginPath(); /* Start a single path for all targets in this group */
                targetsGroup.forEach(target => { /* Add each target to the current path */
                    this.ctx.moveTo(target.x + target.radius, target.y); /* Move to right edge of target */
                    this.ctx.arc(target.x, target.y, target.radius, 0, Math.PI * 2); /* Draw target circle */
                });
                this.ctx.fill(); /* Fill all targets in this opacity group at once */
            });
        }
    }

    drawProjectiles(projectiles) { /* Render all projectiles with batching */
        this.ctx.globalAlpha = 1; /* Ensure projectiles are fully opaque */
        this.ctx.fillStyle = CONFIG.COLORS.PROJECTILE; /* Set projectile color from config */
        this.ctx.beginPath(); /* Start a single path for all projectiles */
        projectiles.forEach(projectile => { /* Add each projectile to the path */
            this.ctx.moveTo(projectile.x + projectile.radius, projectile.y); /* Move to right edge of projectile */
            this.ctx.arc(projectile.x, projectile.y, projectile.radius, 0, Math.PI * 2); /* Draw projectile circle */
        });
        this.ctx.fill(); /* Fill all projectiles at once for performance */
    }
}
