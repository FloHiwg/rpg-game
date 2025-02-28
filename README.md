# 2D Top-Down RPG Game

A simple 2D top-down RPG game built with HTML, CSS, and JavaScript.

## How to Play

1. Open `index.html` in your browser
2. Control the character using arrow keys or WASD
3. Explore the map with various buildings, trees, stones, and paths

## Features

- Character movement in all directions
- Scrollable map with dynamic map loading from JSON
- Various map objects: buildings, trees, stones, grass patches, paths
- Collision detection for solid objects
- CSS-based map with stylized objects

## Controls

- Up: Arrow Up or W
- Down: Arrow Down or S
- Left: Arrow Left or A
- Right: Arrow Right or D

## Map Objects

The map is defined in `map.json` and contains:
- Buildings (houses, shop, inn, blacksmith)
- Trees (solid, can't walk through)
- Stones (solid obstacles)
- Grass patches (decorative, can walk through)
- Paths (decorative walkways)

## Customizing the Map

You can edit the `map.json` file to:
- Add or remove map objects
- Change object positions, sizes, and colors
- Define which objects have collision
- Set the map size and starting position
- Create new map layouts

## Development

### Setup
```
npm install
```

### Running the Game
```
npm start
```
This will start a local server to run the game.

### Running Tests
```
npm test
```

For continuous testing during development:
```
npm run test:watch
```

For coverage report:
```
npm run test:coverage
```