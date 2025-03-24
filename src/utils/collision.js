class SpatialGrid {
    constructor(cellSize) {
        this.cellSize = cellSize;
        this.grid = {};
    }

    clear() {
        this.grid = {};
    }

    addObject(object, index) {
        const cellX = Math.floor(object.x / this.cellSize);
        const cellY = Math.floor(object.y / this.cellSize);
        const cellKey = `${cellX},${cellY}`;
        
        if (!this.grid[cellKey]) {
            this.grid[cellKey] = [];
        }
        this.grid[cellKey].push({ obj: object, index });
    }

    getNearbyObjects(x, y) {
        const cellX = Math.floor(x / this.cellSize);
        const cellY = Math.floor(y / this.cellSize);
        const nearby = [];

        for (let offsetX = -1; offsetX <= 1; offsetX++) {
            for (let offsetY = -1; offsetY <= 1; offsetY++) {
                const checkKey = `${cellX + offsetX},${cellY + offsetY}`;
                if (this.grid[checkKey]) {
                    nearby.push(...this.grid[checkKey]);
                }
            }
        }

        return nearby;
    }
}

const collisionGrid = new SpatialGrid(CONFIG.GRID_CELL_SIZE);
