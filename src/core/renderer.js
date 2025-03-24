class GameRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawPlayer(player) {
        this.ctx.globalAlpha = 1;
        this.ctx.fillStyle = player.color;
        this.ctx.beginPath();
        this.ctx.arc(player.x, player.y, player.size, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawTargets(targets) {
        const uniqueOpacities = new Set(targets.map(t => 
            Math.round(t.currentOpacity * 100) / 100
        )).size;

        this.ctx.fillStyle = CONFIG.COLORS.TARGET;
        
        if (uniqueOpacities > targets.length / 3) {
            // Individual drawing for many different opacities
            targets.forEach(target => {
                this.ctx.globalAlpha = target.currentOpacity;
                this.ctx.beginPath();
                this.ctx.arc(target.x, target.y, target.radius, 0, Math.PI * 2);
                this.ctx.fill();
            });
        } else {
            // Batch by opacity
            const targetsByOpacity = {};
            targets.forEach(target => {
                const opacityKey = Math.round(target.currentOpacity * 100) / 100;
                if (!targetsByOpacity[opacityKey]) {
                    targetsByOpacity[opacityKey] = [];
                }
                targetsByOpacity[opacityKey].push(target);
            });

            Object.entries(targetsByOpacity).forEach(([opacity, targetsGroup]) => {
                this.ctx.globalAlpha = parseFloat(opacity);
                this.ctx.beginPath();
                targetsGroup.forEach(target => {
                    this.ctx.moveTo(target.x + target.radius, target.y);
                    this.ctx.arc(target.x, target.y, target.radius, 0, Math.PI * 2);
                });
                this.ctx.fill();
            });
        }
    }

    drawProjectiles(projectiles) {
        this.ctx.globalAlpha = 1;
        this.ctx.fillStyle = CONFIG.COLORS.PROJECTILE;
        this.ctx.beginPath();
        projectiles.forEach(projectile => {
            this.ctx.moveTo(projectile.x + projectile.radius, projectile.y);
            this.ctx.arc(projectile.x, projectile.y, projectile.radius, 0, Math.PI * 2);
        });
        this.ctx.fill();
    }
}
