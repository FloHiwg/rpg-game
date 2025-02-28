// Mock classes that need to be globally available for tests
class MapLoader {
  constructor() {
    this.mapData = null;
    this.collisionObjects = [];
  }

  async loadMap(mapFile) {
    // Implementation is mocked in test files
  }

  renderMap() {
    // Implementation is mocked in test files
  }

  createMapObject(obj, mapElement) {
    // Implementation is mocked in test files
  }

  getCollisionObjects() {
    return this.collisionObjects;
  }

  getStartPosition() {
    return this.mapData ? this.mapData.startPosition : { x: 0, y: 0 };
  }

  getMapDimensions() {
    return this.mapData ? 
      { width: this.mapData.mapWidth, height: this.mapData.mapHeight } : 
      { width: 0, height: 0 };
  }
}

// Mock console.error to avoid cluttering test output
const originalConsoleError = console.error;
console.error = jest.fn();

// Restore console.error after tests
afterAll(() => {
  console.error = originalConsoleError;
});

// Mock the fetch API if not already available in jsdom
if (!global.fetch) {
  global.fetch = jest.fn();
}

// Create a global object to hold the mapLoader instance
global.window = global.window || {};
global.window.mapLoader = global.window.mapLoader || new MapLoader();