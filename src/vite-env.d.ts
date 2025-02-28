/// <reference types="vite/client" />

interface Window {
  game: {
    mapLoader: any;
    combatSystem: any;
    gameEngine: any;
    mapBuilder: any;
  };
  exportMap: () => void;
  loadMapInGame: () => void;
}