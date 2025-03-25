const CONFIG = { /* Global configuration object for game settings */
    // Performance settings
    PERFORMANCE: { /* Settings related to game performance */
        TARGET_FPS: 60, /* Target frames per second for game loop */
        FRAME_TIME: 1000 / 60, /* Milliseconds per frame (16.67ms) */
        GRID_CELL_SIZE: 100, /* Size of cells for spatial partitioning collision system */
    },
    
    // Game entity settings
    PLAYER: { /* Player-specific settings */
        SIZE: 30, /* Player circle radius in pixels */
        MAX_SPEED: 6, /* Maximum player speed in pixels per frame */
        ACCELERATION: 0.5, /* How quickly player accelerates when keys pressed */
        FRICTION: 0.92, /* Friction coefficient (0-1) - higher means less friction */
        BOUNDARY_PADDING: 30, /* Distance from edge player must maintain */
        BOUNCE_ENERGY_LOSS: 0.5, /* Energy lost when bouncing off walls (50%) */
    },
    
    PROJECTILE: { /* Projectile-specific settings */
        SPEED: 10, /* Base projectile speed in pixels per frame */
        RADIUS: 5, /* Size of projectile circles in pixels */
        MOMENTUM_TRANSFER: 0.3, /* 30% of player momentum transfers to projectile */
    },
    
    TARGET: { /* Target-specific settings */
        SPAWN_INTERVAL: 200, /* Milliseconds between target spawns */
        MAX_LIFESPAN: 8000, /* Maximum target lifetime in milliseconds (8 seconds) */
        FADE_START_PERCENT: 0.75, /* When target begins fading (75% of lifespan) */
        MIN_SIZE: 10, /* Minimum target radius in pixels */
        SIZE_VARIATION: 20, /* Maximum additional size for targets (10-30px radius) */
        SCORE_VALUE: 10, /* Score gained when hitting a target */
    },
    
    // System settings
    POOLS: { /* Object pool settings */
        INITIAL_SIZE: 20, /* Starting size for object pools */
    },
    
    // Input configuration
    KEYBOARD_CONTROLS: { /* Key mappings for player movement */
        LEFT: ['ArrowLeft', 'a', 'A'], /* Keys that trigger left movement */
        RIGHT: ['ArrowRight', 'd', 'D'], /* Keys that trigger right movement */
        UP: ['ArrowUp', 'w', 'W'], /* Keys that trigger upward movement */
        DOWN: ['ArrowDown', 's', 'S'], /* Keys that trigger downward movement */
    },
    
    // Visual settings
    COLORS: { /* Color scheme for game entities */
        PLAYER: 'blue', /* Color of player circle */
        TARGET: 'green', /* Color of target circles */
        PROJECTILE: 'red', /* Color of projectile circles */
        BACKGROUND: 'black', /* Canvas background color */
    },
};
