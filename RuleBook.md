# Rule List for Optimized Game Development

Here's a structured guide for setting up optimized web games and similar interactive applications:

## 1. Initial Project Structure
```markdown
1. Organize Code Structure:
   - Separate HTML, CSS, and JavaScript
   - Group related functions together
   - Declare all constants and configurations at the top
   - Follow a consistent naming convention
   - Use descriptive variable names

2. Basic Setup Order:
   - HTML structure first
   - CSS styling second
   - JavaScript initialization last
```

## 2. Performance Optimization Rules
```markdown
1. Object Pooling:
   - Implement for frequently created/destroyed objects
   - Pre-initialize common objects
   - Reuse objects instead of creating new ones
   - Pool both visual and logical objects

2. Batch Rendering:
   - Group similar draw operations
   - Minimize state changes (color, opacity, etc.)
   - Handle special cases (like varying opacity) appropriately
   - Use hybrid approaches when needed

3. Spatial Partitioning:
   - Implement for collision detection
   - Divide space into grid cells
   - Only check collisions in relevant cells
   - Update grid positions regularly

4. RAF (RequestAnimationFrame) Optimization:
   - Control frame rate
   - Skip unnecessary frames
   - Handle inactive tabs
   - Maintain consistent game speed
```

## 3. Code Organization Template
```markdown
1. File Structure:
   /project
   ├── index.html
   ├── styles/
   │   └── main.css
   └── js/
       ├── config.js
       ├── game.js
       └── utils.js

2. Code Sections Order:
   - Constants and Configurations
   - State Variables
   - Initialization Functions
   - Core Game Functions
   - Update Functions
   - Render Functions
   - Event Handlers
   - Game Loop
   - Startup Code
```

## 4. Function Organization Rules
```markdown
1. Function Declaration Order:
   - Initialize functions first
   - Core game mechanics second
   - Update functions third
   - Render functions fourth
   - Event handlers last

2. Function Grouping:
   - Group related functions together
   - Keep pure functions separate
   - Maintain clear dependencies
   - Document function purposes
```

## 5. Performance Monitoring Rules
```markdown
1. Add Performance Metrics:
   - FPS counter
   - Object count displays
   - Memory usage tracking
   - Frame time monitoring

2. Optimization Triggers:
   - Monitor FPS drops
   - Track object counts
   - Watch memory usage
   - Check CPU utilization
```

## 6. Implementation Checklist
```markdown
1. Basic Setup:
   □ Create HTML structure
   □ Add CSS styling
   □ Initialize canvas
   □ Set up game loop

2. Object Management:
   □ Implement object pools
   □ Create object factories
   □ Set up object recycling
   □ Handle cleanup

3. Rendering System:
   □ Implement batch rendering
   □ Handle special cases (opacity, etc.)
   □ Optimize draw calls
   □ Manage canvas state

4. Collision System:
   □ Set up spatial partitioning
   □ Implement collision detection
   □ Optimize collision checks
   □ Handle edge cases

5. Performance Optimization:
   □ Add RAF optimization
   □ Implement frame skipping
   □ Monitor performance
   □ Add debug tools
```

## 7. Code Style Rules
```markdown
1. Naming Conventions:
   - Use UPPER_CASE for constants
   - Use camelCase for variables and functions
   - Use PascalCase for classes
   - Use descriptive names

2. Documentation:
   - Add JSDoc comments for functions
   - Document complex algorithms
   - Explain optimization techniques
   - Include usage examples
```

## 8. Testing and Debug Rules
```markdown
1. Performance Testing:
   - Test with varying object counts
   - Monitor memory usage
   - Check CPU utilization
   - Verify frame rates

2. Debug Features:
   - Add FPS display
   - Show object counts
   - Include grid visualization
   - Enable performance logging
```

## 9. Optimization Decision Tree
```markdown
1. When to Use Object Pooling:
   □ Objects created/destroyed frequently
   □ Memory usage is high
   □ GC causing stutters
   □ Many similar objects

2. When to Use Batch Rendering:
   □ Many similar objects
   □ Few state changes needed
   □ Drawing performance is low
   □ CPU usage is high

3. When to Use Spatial Partitioning:
   □ Many collision checks needed
   □ Objects spread across space
   □ Performance drops with object count
   □ Complex collision patterns

4. When to Use Hybrid Approaches:
   □ Mixed object types
   □ Varying state requirements
   □ Different update patterns
   □ Complex rendering needs
```

## 10. Custom Instructions Template
```markdown
For AI assistance, include these details:
1. Project Type:
   - Game/Application type
   - Performance requirements
   - Target platforms
   - Special considerations

2. Optimization Priorities:
   - Memory usage
   - CPU performance
   - Visual quality
   - Code maintainability

3. Implementation Preferences:
   - Code structure
   - Naming conventions
   - Documentation style
   - Debug requirements
```

To use this with an AI assistant, you could say:
```markdown
Please help me optimize my [project type] following these rules:
- Use object pooling for [specific objects]
- Implement batch rendering for [specific elements]
- Add spatial partitioning for [specific collisions]
- Include performance monitoring for [specific metrics]
```
