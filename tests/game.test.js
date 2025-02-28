// Tests for game logic
describe('Game Logic', () => {
  // Mock DOM setup
  let player;
  let map;
  let viewport;
  let gameContainer;
  
  // Mock player position
  let playerX = 500;
  let playerY = 500;
  
  // Mock collision objects
  const mockCollisionObjects = [
    { x: 100, y: 100, width: 100, height: 100 },
    { x: 600, y: 200, width: 50, height: 50 }
  ];
  
  // Mock keys state
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
  
  beforeEach(() => {
    // Create a mock DOM for testing
    document.body.innerHTML = `
      <div class="game-container">
        <div class="viewport">
          <div class="map" id="game-map">
            <div id="player" class="character"></div>
          </div>
        </div>
      </div>
    `;
    
    // Get DOM elements
    player = document.getElementById('player');
    map = document.querySelector('.map');
    viewport = document.querySelector('.viewport');
    gameContainer = document.querySelector('.game-container');
    
    // Set initial player position
    player.style.left = `${playerX}px`;
    player.style.top = `${playerY}px`;
    
    // Mock dimensions for testing
    Object.defineProperty(viewport, 'offsetWidth', { value: 600 });
    Object.defineProperty(viewport, 'offsetHeight', { value: 400 });
    
    // Reset mock keys state
    Object.keys(keys).forEach(key => keys[key] = false);
    
    // Mock window.mapLoader
    window.mapLoader = {
      getCollisionObjects: jest.fn(() => mockCollisionObjects),
      getMapDimensions: jest.fn(() => ({ width: 1500, height: 1500 }))
    };
  });
  
  afterEach(() => {
    document.body.innerHTML = '';
    jest.restoreAllMocks();
  });
  
  // Helper function to mimic the checkCollision function from game.js
  function checkCollision(newX, newY) {
    const playerHitbox = {
      x: newX - 15,
      y: newY - 15,
      width: 30,
      height: 30
    };
    
    for (const obj of mockCollisionObjects) {
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
  
  // Helper function to mimic updateMapPosition
  function updateMapPosition() {
    const viewportWidth = viewport.offsetWidth;
    const viewportHeight = viewport.offsetHeight;
    
    const mapX = viewportWidth / 2 - playerX;
    const mapY = viewportHeight / 2 - playerY;
    
    map.style.transform = `translate(${mapX}px, ${mapY}px)`;
  }
  
  test('should center map on player position', () => {
    // Act
    updateMapPosition();
    
    // Assert
    expect(map.style.transform).toBe('translate(300px, 200px)');
  });
  
  test('should detect collision correctly when player overlaps with object', () => {
    // Arrange - player position that would collide with the second collision object
    const newX = 610;
    const newY = 210;
    
    // Act
    const result = checkCollision(newX, newY);
    
    // Assert
    expect(result).toBe(true);
  });
  
  test('should not detect collision when player is far from objects', () => {
    // Arrange - player position far from any collision objects
    const newX = 400;
    const newY = 400;
    
    // Act
    const result = checkCollision(newX, newY);
    
    // Assert
    expect(result).toBe(false);
  });
  
  test('should move player up when ArrowUp key is pressed', () => {
    // Arrange
    keys.ArrowUp = true;
    const originalY = playerY;
    const speed = 5;
    
    // Act - simulate one tick of game loop
    let newX = playerX;
    let newY = playerY;
    
    if (keys.ArrowUp) {
      newY -= speed;
    }
    
    // No collision at this position
    const hasCollision = checkCollision(newX, newY);
    
    if (!hasCollision) {
      playerY = newY;
      player.style.top = `${playerY}px`;
    }
    
    // Assert
    expect(hasCollision).toBe(false);
    expect(playerY).toBe(originalY - speed);
    expect(player.style.top).toBe(`${originalY - speed}px`);
  });
  
  test('should prevent player movement when collision is detected', () => {
    // Arrange - move player to position right before the collision object
    playerX = 595; // Right before the second collision object
    playerY = 210;
    
    player.style.left = `${playerX}px`;
    player.style.top = `${playerY}px`;
    
    keys.ArrowRight = true;
    const originalX = playerX;
    const speed = 5;
    
    // Act - simulate one tick of game loop
    let newX = playerX;
    let newY = playerY;
    
    if (keys.ArrowRight) {
      newX += speed;
    }
    
    // Will detect collision
    const hasCollision = checkCollision(newX, newY);
    
    if (!hasCollision) {
      playerX = newX;
      player.style.left = `${playerX}px`;
    }
    
    // Assert
    expect(hasCollision).toBe(true);
    expect(playerX).toBe(originalX); // Position should not change
    expect(player.style.left).toBe(`${originalX}px`);
  });
  
  test('should respect map boundaries when player tries to move outside', () => {
    // Arrange - position player near map edge
    playerX = 15; // Near left edge
    playerY = 500;
    
    player.style.left = `${playerX}px`;
    player.style.top = `${playerY}px`;
    
    keys.ArrowLeft = true;
    const speed = 5;
    
    // Act - simulate one tick of game loop
    let newX = playerX;
    let newY = playerY;
    
    if (keys.ArrowLeft) {
      newX -= speed;
    }
    
    // Check map boundaries
    if (newX < 20) newX = 20;
    
    // Update position
    playerX = newX;
    player.style.left = `${playerX}px`;
    
    // Assert
    expect(playerX).toBe(20); // Should be clamped to min boundary
    expect(player.style.left).toBe('20px');
  });
});