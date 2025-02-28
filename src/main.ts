import './styles.css';
import { MapLoader } from './components/map-loader';
import { CombatSystem } from './components/combat-system';
import { InventorySystem } from './components/inventory-system';
import { MobSpawner } from './components/mob-spawner';
import { GameEngine } from './components/game-engine';
import { MapBuilder } from './components/map-builder';

// Initialize components
const mapLoader = new MapLoader();
const combatSystem = new CombatSystem();
const inventorySystem = new InventorySystem();
const mobSpawner = new MobSpawner();
const gameEngine = new GameEngine(mapLoader, combatSystem, inventorySystem, mobSpawner);
const mapBuilder = new MapBuilder();

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', async () => {
  setupModeSwitch();
  
  // Initialize game
  await gameEngine.init();
  
  // Initialize map builder
  mapBuilder.init('map-builder-container');
  
  // Set game mode as default
  setMode('game');
  
  // Add to window for debugging (optional)
  (window as any).game = {
    mapLoader,
    combatSystem,
    inventorySystem,
    mobSpawner,
    gameEngine,
    mapBuilder
  };
});

function setupModeSwitch(): void {
  const gameBtn = document.getElementById('switch-to-game');
  const builderBtn = document.getElementById('switch-to-builder');
  
  if (gameBtn && builderBtn) {
    gameBtn.addEventListener('click', () => setMode('game'));
    builderBtn.addEventListener('click', () => setMode('builder'));
    
    // Set initial active state
    gameBtn.classList.add('active');
  }
}

function setMode(mode: 'game' | 'builder'): void {
  const gameContainer = document.getElementById('game-mode');
  const builderContainer = document.getElementById('map-builder-container');
  const gameBtn = document.getElementById('switch-to-game');
  const builderBtn = document.getElementById('switch-to-builder');
  
  if (gameContainer && builderContainer && gameBtn && builderBtn) {
    if (mode === 'game') {
      // Show game, hide builder
      gameContainer.style.display = 'flex';
      builderContainer.style.display = 'none';
      
      // Update buttons
      gameBtn.classList.add('active');
      builderBtn.classList.remove('active');
      
      // Resume game loop
      gameEngine.startGameLoop();
    } else {
      // Show builder, hide game
      gameContainer.style.display = 'none';
      builderContainer.style.display = 'flex';
      
      // Update buttons
      gameBtn.classList.remove('active');
      builderBtn.classList.add('active');
      
      // Pause game loop
      gameEngine.stopGameLoop();
    }
  }
}

// Export functions and components to make them accessible in browser console
(window as any).exportMap = function(): void {
  const mapData = mapBuilder.getMapData();
  console.log(JSON.stringify(mapData, null, 2));
};

(window as any).loadMapInGame = function(): void {
  const mapData = mapBuilder.getMapData();
  gameEngine.loadMapData(mapData);
  setMode('game');
};