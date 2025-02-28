import { Direction, Dimensions, Position, PlayerState, CollisionObject, MapData } from '../types/game-types';
import { MapLoader } from './map-loader';
import { CombatSystem } from './combat-system';

export class GameEngine {
  private player: HTMLElement | null = null;
  private map: HTMLElement | null = null;
  private viewport: HTMLElement | null = null;
  private gameContainer: HTMLElement | null = null;
  
  private mapLoader: MapLoader;
  private combatSystem: CombatSystem;
  
  private playerState: PlayerState = {
    x: 750,
    y: 750,
    direction: 'down',
    health: 100,
    maxHealth: 100,
    money: 0
  };
  
  private mapDimensions: Dimensions = { width: 0, height: 0 };
  private speed: number = 2;
  private keys: Record<string, boolean> = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    w: false,
    a: false,
    s: false,
    d: false
  };
  
  private animationFrameId: number | null = null;

  constructor(mapLoader: MapLoader, combatSystem: CombatSystem) {
    this.mapLoader = mapLoader;
    this.combatSystem = combatSystem;
  }
  
  public loadMapData(mapData: MapData): void {
    // Stop any existing game loop
    this.stopGameLoop();
    
    // Reset the loader with the new map data
    this.mapLoader.setMapData(mapData);
    
    // Re-render the map
    this.mapLoader.renderMap();
    
    // Update map dimensions
    this.mapDimensions = this.mapLoader.getMapDimensions();
    
    // Update player position to start position
    const startPosition = this.mapLoader.getStartPosition();
    this.playerState.x = startPosition.x;
    this.playerState.y = startPosition.y;
    
    if (this.player) {
      this.player.style.left = `${this.playerState.x}px`;
      this.player.style.top = `${this.playerState.y}px`;
      
      // Update debug panel
      const debugPosElement = document.getElementById('debug-player-pos');
      if (debugPosElement) {
        debugPosElement.textContent = `${Math.round(this.playerState.x)},${Math.round(this.playerState.y)}`;
      }
    }
    
    // Update map position
    this.updateMapPosition();
    
    // Restart game loop
    this.startGameLoop();
  }

  public async init(): Promise<void> {
    // Get DOM Elements
    this.player = document.getElementById('player');
    this.map = document.getElementById('game-map');
    this.viewport = document.querySelector('.viewport');
    this.gameContainer = document.querySelector('.game-container');

    if (!this.player || !this.map || !this.viewport || !this.gameContainer) {
      console.error('Failed to initialize game: Missing DOM elements');
      return;
    }

    // Load map data
    await this.mapLoader.loadMap();
    
    // Add a small delay to ensure map data is fully processed
    await new Promise(resolve => setTimeout(resolve, 500));
    
    this.mapDimensions = this.mapLoader.getMapDimensions();
    const startPosition = this.mapLoader.getStartPosition();
    
    // Ensure we have valid coordinates by forcing a default if not available
    this.playerState.x = (startPosition && typeof startPosition.x === 'number') ? startPosition.x : 750;
    this.playerState.y = (startPosition && typeof startPosition.y === 'number') ? startPosition.y : 750;
    
    console.log("Raw start position:", JSON.stringify(startPosition));
    console.log("Starting player position:", this.playerState.x, this.playerState.y);
    console.log("Map dimensions:", JSON.stringify(this.mapDimensions));
    
    // Initialize combat system
    this.combatSystem.init(this.player, this.map);
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Initial positioning - explicitly set the player position
    console.log("Setting initial player position to:", this.playerState.x, this.playerState.y);
    this.player.style.left = `${this.playerState.x}px`;
    this.player.style.top = `${this.playerState.y}px`;
    
    // Update debug panel with initial position
    const debugPosElement = document.getElementById('debug-player-pos');
    if (debugPosElement) {
      debugPosElement.textContent = `${Math.round(this.playerState.x)},${Math.round(this.playerState.y)}`;
    }
    
    // Force player to be visible by explicitly setting display style
    this.player.style.display = 'block';
    
    // Set initial player direction
    this.combatSystem.updatePlayerSwordPosition(this.playerState.direction);
    
    this.updateMapPosition();
    
    // Start the game loop
    this.startGameLoop();
  }

  private setupEventListeners(): void {
    // Key event listeners
    window.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key in this.keys) {
        this.keys[e.key] = true;
        e.preventDefault(); // Prevent scrolling with arrow keys
      }
    });
    
    window.addEventListener('keyup', (e: KeyboardEvent) => {
      if (e.key in this.keys) {
        this.keys[e.key] = false;
      }
    });
  }

  private updateMapPosition(): void {
    if (!this.map || !this.viewport) return;

    const viewportWidth = this.viewport.offsetWidth;
    const viewportHeight = this.viewport.offsetHeight;
    
    // Calculate map offset to center the player in the viewport
    let mapX = viewportWidth / 2 - this.playerState.x;
    let mapY = viewportHeight / 2 - this.playerState.y;
    
    // Apply map position
    this.map.style.transform = `translate(${mapX}px, ${mapY}px)`;
  }

  private checkCollision(newX: number, newY: number): boolean {
    // Get collision objects from map loader
    const collisionObjects = this.mapLoader.getCollisionObjects();
    
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
      const element = obj.id ? document.getElementById(obj.id) : null;
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

  private updatePlayerDirection(dirX: number, dirY: number): void {
    // Determine the dominant direction
    if (Math.abs(dirX) > Math.abs(dirY)) {
      // Moving primarily horizontally
      this.playerState.direction = dirX > 0 ? 'right' : 'left';
    } else if (Math.abs(dirY) > 0) {
      // Moving primarily vertically
      this.playerState.direction = dirY > 0 ? 'down' : 'up';
    }
    
    // Update combat system with new direction
    this.combatSystem.updatePlayerSwordPosition(this.playerState.direction);
  }

  private gameLoop(): void {
    if (!this.player) return;

    let newX = this.playerState.x;
    let newY = this.playerState.y;
    let dirX = 0;
    let dirY = 0;
    
    // Calculate new position based on keys pressed
    if (this.keys.ArrowUp || this.keys.w) {
      newY -= this.speed;
      dirY = -1;
    }
    
    if (this.keys.ArrowDown || this.keys.s) {
      newY += this.speed;
      dirY = 1;
    }
    
    if (this.keys.ArrowLeft || this.keys.a) {
      newX -= this.speed;
      dirX = -1;
    }
    
    if (this.keys.ArrowRight || this.keys.d) {
      newX += this.speed;
      dirX = 1;
    }
    
    // If player is moving, update direction
    if (dirX !== 0 || dirY !== 0) {
      this.updatePlayerDirection(dirX, dirY);
    }
    
    // Check map boundaries
    if (newX < 20) newX = 20;
    if (newX > this.mapDimensions.width - 20) newX = this.mapDimensions.width - 20;
    if (newY < 20) newY = 20;
    if (newY > this.mapDimensions.height - 20) newY = this.mapDimensions.height - 20;
    
    // Only update position if there's no collision
    if (!this.checkCollision(newX, newY)) {
      this.playerState.x = newX;
      this.playerState.y = newY;
      
      // Update player's absolute position on the map
      this.player.style.left = `${this.playerState.x}px`;
      this.player.style.top = `${this.playerState.y}px`;
      
      // Update debug panel
      const debugPosElement = document.getElementById('debug-player-pos');
      if (debugPosElement) {
        debugPosElement.textContent = `${Math.round(this.playerState.x)},${Math.round(this.playerState.y)}`;
      }
      
      // Update map position to center the viewport on the player
      this.updateMapPosition();
      
      // Check for coin collection
      this.combatSystem.checkCoinCollision();
    }
    
    // Continue the game loop
    this.animationFrameId = requestAnimationFrame(() => this.gameLoop());
  }

  public startGameLoop(): void {
    if (!this.animationFrameId) {
      this.gameLoop();
    }
  }

  public stopGameLoop(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }
}