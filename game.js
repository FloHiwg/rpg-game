document.addEventListener('DOMContentLoaded', async () => {
    // Initialize game after map is loaded
    await initGame();
});

async function initGame() {
    // DOM Elements
    const player = document.getElementById('player');
    const map = document.getElementById('game-map');
    const viewport = document.querySelector('.viewport');
    const gameContainer = document.querySelector('.game-container');
    
    // Load map data
    await window.mapLoader.loadMap();
    
    // Add a small delay to ensure map data is fully processed
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mapDimensions = window.mapLoader.getMapDimensions();
    const startPosition = window.mapLoader.getStartPosition();
    
    // Ensure we have valid coordinates by forcing a default if not available
    let playerX = (startPosition && typeof startPosition.x === 'number') ? startPosition.x : 750;
    let playerY = (startPosition && typeof startPosition.y === 'number') ? startPosition.y : 750;
    let playerDirection = 'down'; // Initial direction
    
    console.log("Raw start position:", JSON.stringify(startPosition));
    console.log("Starting player position:", playerX, playerY);
    console.log("Map dimensions:", JSON.stringify(mapDimensions));
    
    // Initialize combat system
    window.combatSystem.init(player, map);
    
    // Movement speed
    const speed = 2;
    
    // Keys pressed state
    const keys = {
        ArrowUp: false,
        ArrowDown: false,
        ArrowLeft: false,
        ArrowRight: false,
        w: false,
        a: false,
        s: false,
        d: false
    };
    
    // Update map position to center on player
    function updateMapPosition() {
        const viewportWidth = viewport.offsetWidth;
        const viewportHeight = viewport.offsetHeight;
        
        // Calculate map offset to center the player in the viewport
        let mapX = viewportWidth / 2 - playerX;
        let mapY = viewportHeight / 2 - playerY;
        
        // Apply map position
        map.style.transform = `translate(${mapX}px, ${mapY}px)`;
    }
    
    // Check for collision with objects
    function checkCollision(newX, newY) {
        // Get collision objects from map loader
        const collisionObjects = window.mapLoader.getCollisionObjects();
        
        // Player hitbox (slightly smaller than player visual size)
        const playerHitbox = {
            x: newX - 15,
            y: newY - 15,
            width: 30,
            height: 30
        };
        
        // Check collision with each object that has collision
        for (const obj of collisionObjects) {
            // Skip dead mobs (they shouldn't block movement)
            const element = document.getElementById(obj.id);
            if (element && element.classList.contains('dead')) {
                continue;
            }
            
            // Simple AABB collision detection
            if (
                playerHitbox.x < obj.x + obj.width &&
                playerHitbox.x + playerHitbox.width > obj.x &&
                playerHitbox.y < obj.y + obj.height &&
                playerHitbox.y + playerHitbox.height > obj.y
            ) {
                return true; // Collision detected
            }
        }
        
        return false; // No collision
    }
    
    // Update player direction based on movement
    function updatePlayerDirection(dirX, dirY) {
        // Determine the dominant direction
        if (Math.abs(dirX) > Math.abs(dirY)) {
            // Moving primarily horizontally
            playerDirection = dirX > 0 ? 'right' : 'left';
        } else if (Math.abs(dirY) > 0) {
            // Moving primarily vertically
            playerDirection = dirY > 0 ? 'down' : 'up';
        }
        
        // Update combat system with new direction
        window.combatSystem.updatePlayerSwordPosition(playerDirection);
    }
    
    // Key event listeners
    window.addEventListener('keydown', (e) => {
        if (keys.hasOwnProperty(e.key)) {
            keys[e.key] = true;
            e.preventDefault(); // Prevent scrolling with arrow keys
        }
    });
    
    window.addEventListener('keyup', (e) => {
        if (keys.hasOwnProperty(e.key)) {
            keys[e.key] = false;
        }
    });
    
    // Game loop
    function gameLoop() {
        let newX = playerX;
        let newY = playerY;
        let dirX = 0;
        let dirY = 0;
        
        // Calculate new position based on keys pressed
        if (keys.ArrowUp || keys.w) {
            newY -= speed;
            dirY = -1;
        }
        
        if (keys.ArrowDown || keys.s) {
            newY += speed;
            dirY = 1;
        }
        
        if (keys.ArrowLeft || keys.a) {
            newX -= speed;
            dirX = -1;
        }
        
        if (keys.ArrowRight || keys.d) {
            newX += speed;
            dirX = 1;
        }
        
        // If player is moving, update direction
        if (dirX !== 0 || dirY !== 0) {
            updatePlayerDirection(dirX, dirY);
        }
        
        // Check map boundaries
        if (newX < 20) newX = 20;
        if (newX > mapDimensions.width - 20) newX = mapDimensions.width - 20;
        if (newY < 20) newY = 20;
        if (newY > mapDimensions.height - 20) newY = mapDimensions.height - 20;
        
        // Only update position if there's no collision
        if (!checkCollision(newX, newY)) {
            playerX = newX;
            playerY = newY;
            
            // Update player's absolute position on the map
            player.style.left = `${playerX}px`;
            player.style.top = `${playerY}px`;
            
            // Update debug panel
            document.getElementById('debug-player-pos').textContent = `${Math.round(playerX)},${Math.round(playerY)}`;
            
            // Update map position to center the viewport on the player
            updateMapPosition();
        }
        
        // Continue the game loop
        requestAnimationFrame(gameLoop);
    }
    
    // Initial positioning - explicitly set the player position
    console.log("Setting initial player position to:", playerX, playerY);
    player.style.left = `${playerX}px`;
    player.style.top = `${playerY}px`;
    
    // Update debug panel with initial position
    document.getElementById('debug-player-pos').textContent = `${Math.round(playerX)},${Math.round(playerY)}`;
    
    // Force player to be visible by explicitly setting display style
    player.style.display = 'block';
    
    // Set initial player direction
    window.combatSystem.updatePlayerSwordPosition(playerDirection);
    
    updateMapPosition();
    
    // Start the game loop
    gameLoop();
}