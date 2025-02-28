# 2D RPG Game

A 2D top-down RPG game built with TypeScript.

## Game Features

- Top-down character movement
- Dynamic map loading from JSON
- Combat system with sword attacks
- Multiple mob types (rabbit, fox, boar, wolf, deer)
- Health system for player and mobs
- Money system with coins dropped by defeated mobs

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

## Controls

- Movement: Arrow keys or WASD
- Attack: Space bar
- Debug panel: Shows player position, direction, health, and money
- Collect coins: Walk over them or click on them

## Game Structure

- `src/index.ts` - Entry point
- `src/components/` - Game components and systems
- `src/types/` - TypeScript interfaces and types
- `src/map.json` - Map configuration and objects