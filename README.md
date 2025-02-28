# 2D RPG Game

A 2D top-down RPG game built with TypeScript, featuring an integrated map builder.

## Game Features

- Top-down character movement
- Dynamic map loading from JSON
- Combat system with sword attacks
- Multiple mob types (rabbit, fox, boar, wolf, deer)
- Health system for player and mobs
- Money system with coins dropped by defeated mobs
- Integrated Map Builder for creating custom game maps

## Map Builder Features

- Create, edit, and save custom maps
- Add various objects: buildings, paths, trees, mobs, coins
- Set object properties (color, size, health, damage, etc.)
- Grid system with snap-to-grid functionality
- Copy, paste, and duplicate objects
- Import/export maps as JSON

## Technologies Used

- TypeScript
- Webpack
- HTML5 & CSS3

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```

### Development

Run the development server:
```
npm run dev
```

The game will be available at http://localhost:9000.

### Building for Production

Build the project:
```
npm run build
```

The build files will be located in the `dist` directory.

## Gameplay Instructions

### Controls

- Movement: Arrow keys or WASD
- Attack: Space bar
- Collect coins: Walk over them or click on them
- Switch between Game and Map Builder: Use the buttons in the top-left corner

### Map Builder Usage

1. Use the toolbar at the top to select object types and modes
2. Add objects by selecting "Add" mode and clicking on the map
3. Select objects to edit their properties in the right panel
4. Save your map using the "Save Map" button
5. Load your map in the game using the "Load Map in Game" function

## Game Structure

- `src/index.ts` - Entry point
- `src/components/` - Game components and systems
  - `game-engine.ts` - Core game loop and mechanics
  - `map-loader.ts` - Map loading and rendering
  - `combat-system.ts` - Combat and money mechanics
  - `map-builder.ts` - Map editing functionality
- `src/types/` - TypeScript interfaces and types
- `src/map.json` - Default map configuration