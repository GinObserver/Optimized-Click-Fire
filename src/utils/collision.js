class SpatialGrid { /* Grid-based spatial partitioning for efficient collision detection */


    constructor(cellSize) { /* Initialize grid with cell size */
        this.cellSize = cellSize; /* Size of each grid cell for partitioning */
        this.grid = {}; /* Object to store grid cells and their contents */
    }

    clear() { /* Reset grid for new frame */
        this.grid = {}; /* Clear all cells */
    }

    addObject(object, index) { /* Add object to appropriate grid cell */
        const cellX = Math.floor(object.x / this.cellSize); /* Calculate cell X coordinate */
        const cellY = Math.floor(object.y / this.cellSize); /* Calculate cell Y coordinate */
        const cellKey = `${cellX},${cellY}`; /* Create unique key for cell */
        
        if (!this.grid[cellKey]) { /* Check if cell exists */
            this.grid[cellKey] = []; /* Create new cell array if needed */
        }
        
        this.grid[cellKey].push({ obj: object, index }); /* Add object and its index to cell */
    }


    getNearbyObjects(x, y) { /* Get objects in and around specified position */
        const cellX = Math.floor(x / this.cellSize); /* Get center cell X coordinate */
        const cellY = Math.floor(y / this.cellSize); /* Get center cell Y coordinate */
        const nearby = []; /* Array to store nearby objects */

        for (let offsetX = -1; offsetX <= 1; offsetX++) { /* Check surrounding cells horizontally */
            for (let offsetY = -1; offsetY <= 1; offsetY++) { /* Check surrounding cells vertically */
                const checkKey = `${cellX + offsetX},${cellY + offsetY}`; /* Calculate cell key */
                if (this.grid[checkKey]) { /* If cell exists */
                    nearby.push(...this.grid[checkKey]); /* Add all objects in cell */
                }
            }
        }

        return nearby; /* Return array of nearby objects */
    }


}
