# CLAUDE.md - Agent Guidelines

## Build & Test Commands
- Start dev server: `npm run dev`
- Build: `npm run build`
- Preview build: `npm run preview`
- Lint: `npm run lint`
- Typecheck: `npm run typecheck`

## Code Style Guidelines
- Formatting: Use Prettier with default settings
- Naming: camelCase for variables/functions, PascalCase for classes/components
- Imports: Group by (1) external libs (2) internal modules (3) styles
- Types: Use TypeScript with strict mode; prefer explicit typing
- Error handling: Use try/catch with detailed error messages
- Components: Functional components with hooks preferred
- Documentation: JSDoc for functions, interfaces and complex logic

## Project Structure
- `/src` - Source code
  - `/components` - Game components
  - `/types` - TypeScript types
- `/public` - Static assets (map.json)
- `index.html` - Main HTML file
- `vite.config.ts` - Vite configuration

## Game Features
- Character movement with WASD/arrow keys
- Combat system with sword attacks (space bar)
- Map builder for creating custom maps
- Mob system with different enemy types
- Money/reward system