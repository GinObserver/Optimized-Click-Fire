/**
 * @fileoverview Object pool implementation for efficient entity recycling
 * 
 * The ObjectPool class provides a reusable object pool pattern implementation
 * that allows for efficient creation and recycling of game objects.
 * 
 * @class ObjectPool
 * @classdesc Manages a pool of reusable objects to reduce garbage collection
 */
class ObjectPool {
    /**
     * Creates a new object pool
     * @constructor
     * @param {Function} createFn - Factory function to create new pool objects
     * @param {number} [initialSize=20] - Initial size of the pool
     */
    constructor(createFn, initialSize = 20) {
        /**
         * Array of available objects in the pool
         * @type {Array<Object>}
         * @private
         */
        this.pool = [];
        
        /**
         * Factory function to create new objects
         * @type {Function}
         * @private
         */
        this.createFn = createFn;
        
        // Fill the pool with initial objects
        this.initialize(initialSize);
    }

    /**
     * Initializes the pool with the specified number of objects
     * @param {number} size - Number of objects to create
     * @public
     */
    initialize(size) {
        for (let i = 0; i < size; i++) {
            this.pool.push(this.createFn());
        }
    }

    /**
     * Gets an object from the pool or creates a new one if empty
     * @returns {Object} An object from the pool
     * @public
     */
    get() {
        return this.pool.length > 0 ? this.pool.pop() : this.createFn();
    }

    /**
     * Returns an object to the pool for reuse
     * @param {Object} object - Object to return to the pool
     * @public
     */
    release(object) {
        this.pool.push(object);
    }
}

// Note: The global pool objects have been moved to the Game class
