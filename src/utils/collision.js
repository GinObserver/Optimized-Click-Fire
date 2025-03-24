/**
 * @fileoverview Spatial partitioning implementation for efficient collision detection
 * 
 * The SpatialGrid class implements a grid-based spatial partitioning system
 * to optimize collision detection by only checking objects in nearby cells.
 * 
 * @class SpatialGrid
 * @classdesc Grid-based spatial partitioning for optimized collision detection
 */
class SpatialGrid {
    /**
     * Creates a new spatial grid
     * @constructor
     * @param {number} cellSize - Size of each grid cell
     */
    constructor(cellSize) {
        /**
         * Size of each cell in the grid
         * @type {number}
         * @private
         */
        this.cellSize = cellSize;
        
        /**
         * Object mapping cell coordinates to arrays of objects in that cell
         * @type {Object}
         * @private
         */
        this.grid = {};
    }

    /**
     * Clears all objects from the grid
     * @public
     */
    clear() {
        this.grid = {};
    }

    /**
     * Adds an object to the appropriate grid cell
     * @param {Object} object - Object to add (must have x and y properties)
     * @param {number} index - Index of the object in its original collection
     * @public
     */
    addObject(object, index) {
        // Calculate cell coordinates
        const cellX = Math.floor(object.x / this.cellSize);
        const cellY = Math.floor(object.y / this.cellSize);
        const cellKey = `${cellX},${cellY}`;
        
        // Create cell array if it doesn't exist
        if (!this.grid[cellKey]) {
            this.grid[cellKey] = [];
        }
        
        // Add object to cell
        this.grid[cellKey].push({ obj: object, index });
    }

    /**
     * Gets all objects in cells near the specified coordinates
     * @param {number} x - X coordinate to check
     * @param {number} y - Y coordinate to check
     * @returns {Array<{obj: Object, index: number}>} Array of objects and their indices
     * @public
     */
    getNearbyObjects(x, y) {
        // Calculate center cell
        const cellX = Math.floor(x / this.cellSize);
        const cellY = Math.floor(y / this.cellSize);
        const nearby = [];

        // Check center cell and 8 surrounding cells
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

// Note: The global collisionGrid has been moved to the Game class
