# CLAUDE.md - Agent Guidelines

## Build & Test Commands
- Build: `npm run build`
- Lint: `npm run lint`
- Test all: `npm run test`
- Test single file: `npm test -- path/to/test.js`
- Dev server: `npm run dev`

## Code Style Guidelines
- Formatting: Use Prettier with default settings
- Naming: camelCase for variables/functions, PascalCase for classes/components
- Imports: Group by (1) external libs (2) internal modules (3) styles
- Types: Use TypeScript with strict mode; prefer explicit typing
- Error handling: Use try/catch with detailed error messages
- Components: Functional components with hooks preferred
- Documentation: JSDoc for functions, interfaces and complex logic
- State management: Context API for small apps, Redux for complex state