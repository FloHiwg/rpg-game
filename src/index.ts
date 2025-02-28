import './styles.css';
import { MapLoader } from './components/map-loader';
import { CombatSystem } from './components/combat-system';
import { GameEngine } from './components/game-engine';

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', async () => {
  // Initialize game components
  const mapLoader = new MapLoader();
  const combatSystem = new CombatSystem();
  const gameEngine = new GameEngine(mapLoader, combatSystem);
  
  // Initialize game
  await gameEngine.init();
  
  // Add to window for debugging (optional)
  (window as any).game = {
    mapLoader,
    combatSystem,
    gameEngine
  };
});