class ObjectPool {
    constructor(createFn, initialSize = 20) {
        this.pool = [];
        this.createFn = createFn;
        this.initialize(initialSize);
    }

    initialize(size) {
        for (let i = 0; i < size; i++) {
            this.pool.push(this.createFn());
        }
    }

    get() {
        return this.pool.length > 0 ? this.pool.pop() : this.createFn();
    }

    release(object) {
        this.pool.push(object);
    }
}

// Create pools
const projectilePool = new ObjectPool(() => ({
    x: 0,
    y: 0,
    radius: CONFIG.PROJECTILE_RADIUS,
    color: CONFIG.COLORS.PROJECTILE,
    velocity: { x: 0, y: 0 }
}));

const targetPool = new ObjectPool(() => ({
    x: 0,
    y: 0,
    radius: 0,
    color: CONFIG.COLORS.TARGET,
    creationTime: 0,
    currentOpacity: 1
}));
