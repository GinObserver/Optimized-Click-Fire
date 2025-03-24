const CONFIG = { /* Global configuration object for game settings */
    TARGET_FPS: 60, /* Target frames per second for game loop */
    FRAME_TIME: 1000 / 60, /* Milliseconds per frame (16.67ms) */
    GRID_CELL_SIZE: 100, /* Size of cells for spatial partitioning collision system */
    TARGET_SPAWN_INTERVAL: 200, /* Milliseconds between target spawns */
    TARGET_MAX_LIFESPAN: 8000, /* Maximum target lifetime in milliseconds (8 seconds) */
    TARGET_FADE_START_PERCENT: 0.75, /* When target begins fading (75% of lifespan) */
    PROJECTILE_SPEED: 5, /* Projectile movement speed in pixels per frame */
    PROJECTILE_RADIUS: 5, /* Size of projectile circles in pixels */
    INITIAL_POOL_SIZE: 20, /* Starting size for object pools */
    TARGET_MIN_SIZE: 10, /* Minimum target radius in pixels */
    TARGET_SIZE_VARIATION: 20, /* Maximum additional size for targets (10-30px radius) */
    COLORS: { /* Color scheme for game entities */
        PLAYER: 'blue', /* Color of player circle */
        TARGET: 'green', /* Color of target circles */
        PROJECTILE: 'red' /* Color of projectile circles */
    }
};
