class ObjectPool { /* Manages reusable object pools to reduce garbage collection */

    localprepool(createFn){ /* Class local predeclaring, just for readability */
        this.pool = []; /* Array to store inactive objects */
        this.createFn = createFn; /* Function to create new objects when needed */
    }

    initialize(size) { /* Create initial set of objects */
        for (let i = 0; i < size; i++) { /* Loop for initial pool size */
            this.pool.push(this.createFn()); /* Create and store new object */
        }
    }

    get() { /* Retrieve an object from the pool */
        return this.pool.length > 0 ? this.pool.pop() : this.createFn(); /* Return existing or create new */
    }

    release(object) { /* Return an object to the pool */
        this.pool.push(object); /* Store object for reuse */
    }
    
    constructor(createFn, initialSize = 20) { /* Initialize pool with factory function and size */

        this.localprepool(createFn); /* Class local predeclaring, just for readability */
        this.initialize(initialSize); /* Fill pool with initial objects */
    }

}

